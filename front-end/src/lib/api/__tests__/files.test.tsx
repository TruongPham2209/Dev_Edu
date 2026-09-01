/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/files.ts
 *
 * Purpose
 * -------
 * Verify that files API helper functions and React Query hooks handle pre-signed upload URLs and download URL queries.
 *
 * Tested Features
 * ---------------
 * ✓ getPreSignedUploadUrl API call (/api/v1/files/pre-signed-url)
 * ✓ getDownloadUrl API call (/api/v1/files/download)
 * ✓ useDownloadUrlQuery hook
 *
 * Covered Scenarios
 * -----------------
 * ✓ Presigning upload URLs
 * ✓ Fetching download URLs
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost)
 *
 * Not Covered
 * -----------
 * - Real S3 file storage transfers
 *
 * Notes
 * -----
 * Unit test for files API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as filesApi from "../files";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("Files API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldCallApiPostForPreSignedUploadUrl", async () => {
    const mockRequest = {
      fileName: "avatar.jpg",
      contentType: "image/jpeg",
      fileSize: 1024,
      isPublic: true,
    };
    const mockResponse = {
      uploadUrl: "https://s3.aws.com/upload",
      objectKey: "avatars/avatar.jpg",
    };

    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);

    const result = await filesApi.getPreSignedUploadUrl(mockRequest);

    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/files/pre-signed-url",
      mockRequest,
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldCallApiGetForDownloadUrl", async () => {
    const mockResponse = { downloadUrl: "https://s3.aws.com/download.jpg" };
    vi.mocked(client.apiGet).mockResolvedValue(mockResponse);

    const result = await filesApi.getDownloadUrl("avatars/avatar.jpg");

    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/files/download?fullObjectKey=avatars%2Favatar.jpg",
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldExecuteUseDownloadUrlQueryHook", async () => {
    const mockResponse = { downloadUrl: "https://s3.aws.com/download.jpg" };
    vi.mocked(client.apiGet).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => filesApi.useDownloadUrlQuery("avatars/avatar.jpg"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);
  });

  it("shouldCallApiPostForInitChunkUpload", async () => {
    const mockRequest = {
      fileName: "lecture.mp4",
      contentType: "video/mp4",
      fileSize: 104857600,
      isPublic: false,
    };
    const mockResponse = {
      sessionId: "session-001",
      chunkSize: 20971520,
      totalParts: 5,
      windowSize: 20,
      concurrency: 5,
      objectKey: "private/lecture.mp4",
      publicUrl: null,
    };

    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);

    const result = await filesApi.initChunkUpload(mockRequest);

    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/files/chunk-upload/init",
      mockRequest,
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldCallApiPostForPresignChunkUpload", async () => {
    const mockRequest = { fromPart: 1, partCount: 20 };
    const mockResponse = {
      sessionId: "session-001",
      parts: [
        {
          partNumber: 1,
          presignedUrl: "https://r2.storage/part1",
          expiresAt: "2026-08-31T22:00:00",
        },
      ],
    };

    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);

    const result = await filesApi.presignChunkUpload("session-001", mockRequest);

    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/files/chunk-upload/session-001/presign",
      mockRequest,
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldCallApiPostForCompleteChunkUpload", async () => {
    const mockRequest = {
      parts: [
        { partNumber: 1, eTag: "etag1" },
        { partNumber: 2, eTag: "etag2" },
      ],
    };
    const mockResponse = {
      originalFileName: "lecture.mp4",
      contentType: "video/mp4",
      objectKey: "private/lecture.mp4",
    };

    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);

    const result = await filesApi.completeChunkUpload("session-001", mockRequest);

    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/files/chunk-upload/session-001/complete",
      mockRequest,
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldCallApiDeleteForAbortChunkUpload", async () => {
    vi.mocked(client.apiDelete).mockResolvedValue("Aborted");

    const result = await filesApi.abortChunkUpload("session-001");

    expect(client.apiDelete).toHaveBeenCalledWith(
      "/api/v1/files/chunk-upload/session-001",
    );
    expect(result).toBe("Aborted");
  });

  it("shouldCallApiGetForChunkUploadStatus", async () => {
    const mockResponse = {
      sessionId: "session-001",
      objectKey: "private/lecture.mp4",
      status: "PENDING",
      totalParts: 5,
      fileSize: 104857600,
      chunkSize: 20971520,
      uploadedParts: [1, 2],
    };

    vi.mocked(client.apiGet).mockResolvedValue(mockResponse);

    const result = await filesApi.getChunkUploadStatus("session-001");

    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/files/chunk-upload/session-001/status",
    );
    expect(result).toEqual(mockResponse);
  });
});

