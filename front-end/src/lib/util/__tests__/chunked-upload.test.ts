/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/util/chunked-upload.ts
 *
 * Purpose
 * -------
 * Verify that ChunkedUploadManager and uploadFileWithStrategy handle:
 * - Chunk slicing
 * - ETag normalization
 * - Multipart upload flow (init, presign sliding window, concurrent PUT, complete)
 * - Single upload flow (< 10MB threshold)
 * - Abort / cancellation and backend cleanup
 * - Error retry mechanism
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/files"
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as filesApi from "@/lib/api/files";
import {
  ChunkedUploadManager,
  DEFAULT_CHUNK_THRESHOLD,
  getChunkSlice,
  normalizeETag,
  uploadFileWithStrategy,
} from "../chunked-upload";

vi.mock("@/lib/api/files", () => ({
  initChunkUpload: vi.fn(),
  presignChunkUpload: vi.fn(),
  completeChunkUpload: vi.fn(),
  abortChunkUpload: vi.fn(),
  getPreSignedUploadUrl: vi.fn(),
}));

describe("chunked-upload utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getChunkSlice", () => {
    it("shouldSliceFileAccuratelyForFirstAndLastChunks", () => {
      const mockBlob = new Blob(["a".repeat(25)]);
      const mockFile = new File([mockBlob], "test.mp4", { type: "video/mp4" });
      const chunkSize = 10;

      const part1 = getChunkSlice(mockFile, 1, chunkSize);
      expect(part1.size).toBe(10);

      const part2 = getChunkSlice(mockFile, 2, chunkSize);
      expect(part2.size).toBe(10);

      const part3 = getChunkSlice(mockFile, 3, chunkSize);
      expect(part3.size).toBe(5);
    });
  });

  describe("normalizeETag", () => {
    it("shouldRemoveEnclosingQuotesAndWhitespace", () => {
      expect(normalizeETag('"abc-etag-123"')).toBe("abc-etag-123");
      expect(normalizeETag('  "hash-456"  ')).toBe("hash-456");
      expect(normalizeETag("plain-hash")).toBe("plain-hash");
    });
  });

  describe("ChunkedUploadManager", () => {
    it("shouldPerformCompleteMultipartUploadSuccessfully", async () => {
      const mockFile = new File(["0123456789".repeat(10)], "lecture.mp4", {
        type: "video/mp4",
      });

      vi.mocked(filesApi.initChunkUpload).mockResolvedValue({
        sessionId: "session-123",
        chunkSize: 50,
        totalParts: 2,
        windowSize: 20,
        concurrency: 2,
        objectKey: "private/lecture.mp4",
        publicUrl: null,
      });

      vi.mocked(filesApi.presignChunkUpload).mockResolvedValue({
        sessionId: "session-123",
        parts: [
          {
            partNumber: 1,
            presignedUrl: "https://r2.storage/part-1",
            expiresAt: "2026-08-31T22:00:00Z",
          },
          {
            partNumber: 2,
            presignedUrl: "https://r2.storage/part-2",
            expiresAt: "2026-08-31T22:00:00Z",
          },
        ],
      });

      // Mock global fetch for R2 PUT
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url === "https://r2.storage/part-1") {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ etag: '"etag-part-1"' }),
          });
        }
        if (url === "https://r2.storage/part-2") {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ etag: '"etag-part-2"' }),
          });
        }
        return Promise.reject(new Error("Unknown URL"));
      });
      global.fetch = mockFetch;

      vi.mocked(filesApi.completeChunkUpload).mockResolvedValue({
        originalFileName: "lecture.mp4",
        contentType: "video/mp4",
        objectKey: "private/lecture.mp4",
        downloadUrl: "https://r2.storage/download/lecture.mp4",
      });

      const progressSpy = vi.fn();
      const manager = new ChunkedUploadManager();
      const result = await manager.uploadLargeFile(mockFile, {
        isPublic: false,
        onProgress: progressSpy,
      });

      expect(filesApi.initChunkUpload).toHaveBeenCalledWith({
        fileName: "lecture.mp4",
        contentType: "video/mp4",
        fileSize: 100,
        isPublic: false,
      });

      expect(filesApi.presignChunkUpload).toHaveBeenCalledWith("session-123", {
        fromPart: 1,
        partCount: 20,
      });

      expect(filesApi.completeChunkUpload).toHaveBeenCalledWith("session-123", {
        parts: [
          { partNumber: 1, eTag: "etag-part-1" },
          { partNumber: 2, eTag: "etag-part-2" },
        ],
      });

      expect(progressSpy).toHaveBeenCalledWith(50, 1, 2);
      expect(progressSpy).toHaveBeenCalledWith(100, 2, 2);
      expect(result.objectKey).toBe("private/lecture.mp4");
    });

    it("shouldRetryFailedChunkAndSucceed", async () => {
      const mockFile = new File(["a".repeat(50)], "large.mp4", {
        type: "video/mp4",
      });

      vi.mocked(filesApi.initChunkUpload).mockResolvedValue({
        sessionId: "session-retry",
        chunkSize: 50,
        totalParts: 1,
        windowSize: 10,
        concurrency: 1,
        objectKey: "private/large.mp4",
        publicUrl: null,
      });

      vi.mocked(filesApi.presignChunkUpload).mockResolvedValue({
        sessionId: "session-retry",
        parts: [
          {
            partNumber: 1,
            presignedUrl: "https://r2.storage/part-1",
            expiresAt: "2026-08-31T22:00:00Z",
          },
        ],
      });

      let attempt = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Error",
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ etag: '"etag-retry-ok"' }),
        });
      });
      global.fetch = mockFetch;

      vi.mocked(filesApi.completeChunkUpload).mockResolvedValue({
        originalFileName: "large.mp4",
        contentType: "video/mp4",
        objectKey: "private/large.mp4",
      });

      const manager = new ChunkedUploadManager();
      const result = await manager.uploadLargeFile(mockFile, { maxRetries: 3 });

      expect(attempt).toBe(2);
      expect(result.objectKey).toBe("private/large.mp4");
      expect(filesApi.completeChunkUpload).toHaveBeenCalledWith("session-retry", {
        parts: [{ partNumber: 1, eTag: "etag-retry-ok" }],
      });
    });

    it("shouldCallAbortChunkUploadWhenAborted", async () => {
      const mockFile = new File(["a".repeat(100)], "abort.mp4", {
        type: "video/mp4",
      });

      vi.mocked(filesApi.initChunkUpload).mockResolvedValue({
        sessionId: "session-abort",
        chunkSize: 50,
        totalParts: 2,
        windowSize: 10,
        concurrency: 1,
        objectKey: "private/abort.mp4",
        publicUrl: null,
      });

      vi.mocked(filesApi.presignChunkUpload).mockResolvedValue({
        sessionId: "session-abort",
        parts: [
          {
            partNumber: 1,
            presignedUrl: "https://r2.storage/part-1",
            expiresAt: "2026-08-31T22:00:00Z",
          },
        ],
      });

      const abortController = new AbortController();

      global.fetch = vi.fn().mockImplementation(() => {
        abortController.abort();
        return Promise.reject(new DOMException("The user aborted a request.", "AbortError"));
      });

      vi.mocked(filesApi.abortChunkUpload).mockResolvedValue("Aborted");

      const manager = new ChunkedUploadManager();
      await expect(
        manager.uploadLargeFile(mockFile, { signal: abortController.signal }),
      ).rejects.toThrow();

      expect(filesApi.abortChunkUpload).toHaveBeenCalledWith("session-abort");
    });
  });

  describe("uploadFileWithStrategy", () => {
    it("shouldUseSingleUploadForFilesUnderThreshold", async () => {
      const smallFile = new File(["small payload"], "small.jpg", {
        type: "image/jpeg",
      });

      vi.mocked(filesApi.getPreSignedUploadUrl).mockResolvedValue({
        originalFileName: "small.jpg",
        contentType: "image/jpeg",
        uploadUrl: "https://r2.storage/single-put",
        objectKey: "public/small.jpg",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const progressSpy = vi.fn();
      const result = await uploadFileWithStrategy(smallFile, {
        isPublic: true,
        thresholdBytes: DEFAULT_CHUNK_THRESHOLD,
        onProgress: progressSpy,
      });

      expect(filesApi.getPreSignedUploadUrl).toHaveBeenCalledWith({
        fileName: "small.jpg",
        contentType: "image/jpeg",
        fileSize: smallFile.size,
        isPublic: true,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://r2.storage/single-put",
        expect.objectContaining({ method: "PUT" }),
      );
      expect(progressSpy).toHaveBeenCalledWith(100, 1, 1);
      expect(result.objectKey).toBe("public/small.jpg");
    });
  });
});

