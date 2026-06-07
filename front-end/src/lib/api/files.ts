import type {
  FilePreSignUploadRequest,
  FileUploadResponse,
} from "@/lib/type/files";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { apiGet, apiPost } from "./client";

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

export function useDownloadUrlQuery(
  fullObjectKey: string,
  options?: Omit<
    UseQueryOptions<FileUploadResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["files", "download", fullObjectKey],
    queryFn: () => getDownloadUrl(fullObjectKey),
    enabled: !!fullObjectKey,
    ...options,
  });
}

export function useFileMetadataQuery(
  fullObjectKey: string,
  options?: Omit<
    UseQueryOptions<FileUploadResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["files", "metadata", fullObjectKey],
    queryFn: () => getFileMetadata(fullObjectKey),
    enabled: !!fullObjectKey,
    ...options,
  });
}

export function usePreSignedUploadUrlMutation(
  options?: UseMutationOptions<
    FileUploadResponse,
    Error,
    FilePreSignUploadRequest
  >,
) {
  return useMutation({
    mutationFn: getPreSignedUploadUrl,
    ...options,
  });
}

export function useConfirmImageUploadMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  return useMutation({
    mutationFn: confirmImageUpload,
    ...options,
  });
}

// Aliases for backward compatibility during refactoring
export {
  useDownloadUrlQuery as useGetDownloadUrl,
  useFileMetadataQuery as useGetFileMetadata,
};
