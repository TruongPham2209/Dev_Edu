import { apiGet, apiPost } from "./client";
import type { FilePreSignUploadRequest, FileUploadResponse } from "./types";

export async function getPreSignedUploadUrl(
  request: FilePreSignUploadRequest,
): Promise<FileUploadResponse> {
  return apiPost<FileUploadResponse>("/api/v1/files/pre-signed-url", request);
}

export async function confirmImageUpload(
  fullObjectKey: string,
): Promise<string> {
  return apiPost<string>(
    `/api/v1/files/confirm-image-upload?fullObjectKey=${encodeURIComponent(fullObjectKey)}`,
    {},
  );
}

export async function getDownloadUrl(
  fullObjectKey: string,
): Promise<FileUploadResponse> {
  return apiGet<FileUploadResponse>(
    `/api/v1/files/download?fullObjectKey=${encodeURIComponent(fullObjectKey)}`,
  );
}

export async function getFileMetadata(
  fullObjectKey: string,
): Promise<FileUploadResponse> {
  return apiGet<FileUploadResponse>(
    `/api/v1/files/metadata?fullObjectKey=${encodeURIComponent(fullObjectKey)}`,
  );
}
