import type {
  ChunkCompleteRequest,
  ChunkPresignRequest,
  ChunkPresignResponse,
  ChunkStatusResponse,
  ChunkUploadInitRequest,
  ChunkUploadInitResponse,
  FilePreSignUploadRequest,
  FileUploadResponse,
} from "@/lib/type/files";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "./client";

export async function getPreSignedUploadUrl(
  request: FilePreSignUploadRequest,
): Promise<FileUploadResponse> {
  return apiPost<FileUploadResponse>("/api/v1/files/pre-signed-url", request);
}

async function confirmImageUpload(fullObjectKey: string): Promise<string> {
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

async function getFileMetadata(
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getPreSignedUploadUrl,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useConfirmImageUploadMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmImageUpload,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      options?.onSuccess?.(...args);
    },
  });
}

// --- Chunked / Multipart Upload Endpoints ---

export async function initChunkUpload(
  request: ChunkUploadInitRequest,
): Promise<ChunkUploadInitResponse> {
  return apiPost<ChunkUploadInitResponse>(
    "/api/v1/files/chunk-upload/init",
    request,
  );
}

export async function presignChunkUpload(
  sessionId: string,
  request: ChunkPresignRequest,
): Promise<ChunkPresignResponse> {
  return apiPost<ChunkPresignResponse>(
    `/api/v1/files/chunk-upload/${encodeURIComponent(sessionId)}/presign`,
    request,
  );
}

export async function completeChunkUpload(
  sessionId: string,
  request: ChunkCompleteRequest,
): Promise<FileUploadResponse> {
  return apiPost<FileUploadResponse>(
    `/api/v1/files/chunk-upload/${encodeURIComponent(sessionId)}/complete`,
    request,
  );
}

export async function abortChunkUpload(sessionId: string): Promise<string> {
  return apiDelete<string>(
    `/api/v1/files/chunk-upload/${encodeURIComponent(sessionId)}`,
  );
}

export async function getChunkUploadStatus(
  sessionId: string,
): Promise<ChunkStatusResponse> {
  return apiGet<ChunkStatusResponse>(
    `/api/v1/files/chunk-upload/${encodeURIComponent(sessionId)}/status`,
  );
}

export function useInitChunkUploadMutation(
  options?: UseMutationOptions<
    ChunkUploadInitResponse,
    Error,
    ChunkUploadInitRequest
  >,
) {
  return useMutation({
    mutationFn: initChunkUpload,
    ...options,
  });
}

export function usePresignChunkUploadMutation(
  options?: UseMutationOptions<
    ChunkPresignResponse,
    Error,
    { sessionId: string; request: ChunkPresignRequest }
  >,
) {
  return useMutation({
    mutationFn: ({ sessionId, request }) =>
      presignChunkUpload(sessionId, request),
    ...options,
  });
}

export function useCompleteChunkUploadMutation(
  options?: UseMutationOptions<
    FileUploadResponse,
    Error,
    { sessionId: string; request: ChunkCompleteRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, request }) =>
      completeChunkUpload(sessionId, request),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useAbortChunkUploadMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: abortChunkUpload,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useChunkUploadStatusQuery(
  sessionId: string,
  options?: Omit<
    UseQueryOptions<ChunkStatusResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["files", "chunk-status", sessionId],
    queryFn: () => getChunkUploadStatus(sessionId),
    enabled: !!sessionId,
    ...options,
  });
}

