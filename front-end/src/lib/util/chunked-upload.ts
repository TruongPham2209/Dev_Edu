import {
  abortChunkUpload,
  completeChunkUpload,
  getPreSignedUploadUrl,
  initChunkUpload,
  presignChunkUpload,
} from "@/lib/api/files";
import type {
  ChunkCompletedPart,
  FileUploadResponse,
} from "@/lib/type/files";

export type UploadProgressCallback = (
  percentage: number,
  uploadedParts: number,
  totalParts: number,
) => void;

export interface ChunkedUploadOptions {
  isPublic?: boolean;
  onProgress?: UploadProgressCallback;
  signal?: AbortSignal;
  maxRetries?: number;
}

export interface UploadStrategyOptions extends ChunkedUploadOptions {
  /**
   * Byte threshold above which chunked multipart upload is used.
   * Default is 10MB (10,485,760 bytes).
   */
  thresholdBytes?: number;
}

export const DEFAULT_CHUNK_THRESHOLD = 10 * 1024 * 1024; // 10MB

/**
 * Extract chunk slice for a given 1-based partNumber.
 */
export function getChunkSlice(
  file: File,
  partNumber: number,
  chunkSize: number,
): Blob {
  const start = (partNumber - 1) * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  return file.slice(start, end);
}

/**
 * Normalizes raw ETag header values from R2/S3 (strips enclosing quotes).
 */
export function normalizeETag(rawETag: string): string {
  return rawETag.trim().replace(/^"|"$/g, "");
}

/**
 * Production-ready Chunked Upload Manager for Cloudflare R2 / AWS S3 Multipart Uploads.
 */
export class ChunkedUploadManager {
  private activeSessionId: string | null = null;
  private abortController: AbortController | null = null;

  public get currentSessionId(): string | null {
    return this.activeSessionId;
  }

  /**
   * Uploads large files using multipart chunking, concurrency pool, sliding window presigning, and retry logic.
   */
  public async uploadLargeFile(
    file: File,
    options: ChunkedUploadOptions = {},
  ): Promise<FileUploadResponse> {
    const {
      isPublic = false,
      onProgress,
      signal,
      maxRetries = 3,
    } = options;

    this.abortController = new AbortController();

    // Link external abort signal if provided
    if (signal) {
      if (signal.aborted) {
        throw new DOMException("Upload aborted by user", "AbortError");
      }
      signal.addEventListener("abort", () => {
        this.abortController?.abort();
      });
    }

    const effectiveSignal = this.abortController.signal;

    // 1. Initialize Multipart Upload Session
    const initRes = await initChunkUpload({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
      isPublic,
    });

    const {
      sessionId,
      chunkSize,
      totalParts,
      windowSize,
      concurrency,
    } = initRes;

    this.activeSessionId = sessionId;

    const completedParts: ChunkCompletedPart[] = [];
    const urlMap = new Map<number, string>();

    // Sliding window fetch helper
    const fetchPresignedUrls = async (fromPart: number) => {
      if (effectiveSignal.aborted) {
        throw new DOMException("Upload aborted by user", "AbortError");
      }

      const presignRes = await presignChunkUpload(sessionId, {
        fromPart,
        partCount: windowSize,
      });

      for (const part of presignRes.parts) {
        urlMap.set(part.partNumber, part.presignedUrl);
      }
    };

    let currentPartIndex = 1;
    let finishedCount = 0;

    // Worker queue processing
    const worker = async (): Promise<void> => {
      while (currentPartIndex <= totalParts) {
        if (effectiveSignal.aborted) {
          throw new DOMException("Upload aborted by user", "AbortError");
        }

        const partNumber = currentPartIndex++;
        if (partNumber > totalParts) break;

        // Fetch sliding window presigned batch if missing
        if (!urlMap.has(partNumber)) {
          await fetchPresignedUrls(partNumber);
        }

        let presignedUrl = urlMap.get(partNumber);
        if (!presignedUrl) {
          await fetchPresignedUrls(partNumber);
          presignedUrl = urlMap.get(partNumber);
        }

        if (!presignedUrl) {
          throw new Error(`Failed to obtain presigned URL for part ${partNumber}`);
        }

        const chunkBlob = getChunkSlice(file, partNumber, chunkSize);

        let uploaded = false;
        let retryCount = 0;
        let lastError: Error | null = null;

        while (!uploaded && retryCount < maxRetries) {
          if (effectiveSignal.aborted) {
            throw new DOMException("Upload aborted by user", "AbortError");
          }

          try {
            const response = await fetch(presignedUrl, {
              method: "PUT",
              body: chunkBlob,
              headers: {
                "Content-Type": file.type || "application/octet-stream",
              },
              signal: effectiveSignal,
            });

            if (!response.ok) {
              throw new Error(
                `R2 upload failed with HTTP ${response.status}: ${response.statusText}`,
              );
            }

            const rawETag =
              response.headers.get("etag") ||
              response.headers.get("ETag") ||
              response.headers.get("Etag");

            if (!rawETag) {
              throw new Error(
                `Missing ETag header in storage response for part ${partNumber}`,
              );
            }

            const cleanETag = normalizeETag(rawETag);
            completedParts.push({ partNumber, eTag: cleanETag });
            uploaded = true;
            finishedCount++;

            if (onProgress) {
              const percent = Math.round((finishedCount / totalParts) * 100);
              onProgress(percent, finishedCount, totalParts);
            }
          } catch (err: unknown) {
            if (
              err instanceof DOMException &&
              err.name === "AbortError"
            ) {
              throw err;
            }

            retryCount++;
            lastError =
              err instanceof Error ? err : new Error(String(err));

            if (retryCount >= maxRetries) {
              throw new Error(
                `Failed to upload part ${partNumber} after ${maxRetries} attempts: ${lastError.message}`,
              );
            }

            // Refresh URL on retry in case of expiration or network glitch
            try {
              const refreshRes = await presignChunkUpload(sessionId, {
                fromPart: partNumber,
                partCount: 1,
              });
              if (refreshRes.parts.length > 0) {
                presignedUrl = refreshRes.parts[0].presignedUrl;
                urlMap.set(partNumber, presignedUrl);
              }
            } catch {
              // Ignore presign error and retry next attempt
            }
          }
        }
      }
    };

    try {
      // Launch concurrent worker pool
      const workerCount = Math.max(
        1,
        Math.min(concurrency || 5, totalParts),
      );
      const workers: Promise<void>[] = [];
      for (let i = 0; i < workerCount; i++) {
        workers.push(worker());
      }

      await Promise.all(workers);

      if (effectiveSignal.aborted) {
        throw new DOMException("Upload aborted by user", "AbortError");
      }

      // Sort parts numerically before complete
      completedParts.sort((a, b) => a.partNumber - b.partNumber);

      // Complete Multipart Upload on backend
      const result = await completeChunkUpload(sessionId, {
        parts: completedParts,
      });

      this.activeSessionId = null;
      return result;
    } catch (err: unknown) {
      // If aborted or failed, attempt cleanup if session was created
      if (this.activeSessionId) {
        try {
          await abortChunkUpload(this.activeSessionId);
        } catch {
          // Suppress abort errors on cleanup
        }
        this.activeSessionId = null;
      }
      throw err;
    }
  }

  /**
   * Aborts active upload session and cancels pending requests.
   */
  public async abortUpload(sessionId?: string): Promise<void> {
    const targetSessionId = sessionId || this.activeSessionId;
    this.abortController?.abort();

    if (targetSessionId) {
      try {
        await abortChunkUpload(targetSessionId);
      } finally {
        if (targetSessionId === this.activeSessionId) {
          this.activeSessionId = null;
        }
      }
    }
  }
}

/**
 * Unified Upload Strategy Router:
 * Automatically uses Single Direct Upload (< 10MB) or Chunked Multipart Upload (>= 10MB).
 */
export async function uploadFileWithStrategy(
  file: File,
  options: UploadStrategyOptions = {},
): Promise<FileUploadResponse> {
  const {
    isPublic = false,
    thresholdBytes = DEFAULT_CHUNK_THRESHOLD,
    onProgress,
    signal,
    maxRetries = 3,
  } = options;

  // Decision 1: Single Upload (< 10MB)
  if (file.size < thresholdBytes) {
    if (signal?.aborted) {
      throw new DOMException("Upload aborted by user", "AbortError");
    }

    if (onProgress) {
      onProgress(10, 0, 1);
    }

    const preSignRes = await getPreSignedUploadUrl({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
      isPublic,
    });

    if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
      throw new Error("Failed to obtain single presigned upload URL");
    }

    if (onProgress) {
      onProgress(30, 0, 1);
    }

    let uploaded = false;
    let attempts = 0;
    let lastError: Error | null = null;

    while (!uploaded && attempts < maxRetries) {
      if (signal?.aborted) {
        throw new DOMException("Upload aborted by user", "AbortError");
      }

      try {
        const response = await fetch(preSignRes.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          signal,
        });

        if (!response.ok) {
          throw new Error(
            `Single upload failed with HTTP ${response.status}: ${response.statusText}`,
          );
        }

        uploaded = true;
      } catch (err: unknown) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          throw err;
        }

        attempts++;
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempts >= maxRetries) {
          throw new Error(
            `Failed to upload file after ${maxRetries} attempts: ${lastError.message}`,
          );
        }
      }
    }

    if (onProgress) {
      onProgress(100, 1, 1);
    }

    return preSignRes;
  }

  // Decision 2: Chunked / Multipart Upload (>= 10MB)
  const manager = new ChunkedUploadManager();
  return manager.uploadLargeFile(file, {
    isPublic,
    onProgress,
    signal,
    maxRetries,
  });
}
