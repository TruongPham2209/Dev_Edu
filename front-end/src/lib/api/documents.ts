import type {
  DocumentAuditResponse,
  GlobalDocumentResponse,
  UploadGlobalDocumentRequest,
} from "@/lib/type/documents";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { CustomPaging } from "../type/api";
import { apiDelete, apiGet, apiPostFormData } from "./client";

// ============================================================================
// --- Pure Async API Functions ---
// ============================================================================

export async function getGlobalDocuments(
  fileName?: string,
  nextCursor?: string,
): Promise<CustomPaging<GlobalDocumentResponse>> {
  const params = new URLSearchParams();
  if (fileName && fileName.trim()) {
    params.append("fileName", fileName.trim());
  }
  if (nextCursor) {
    params.append("nextCursor", nextCursor);
  }

  const queryString = params.toString();
  return apiGet<CustomPaging<GlobalDocumentResponse>>(
    `/api/v1/documents/library${queryString ? `?${queryString}` : ""}`,
  );
}

export async function uploadGlobalDocument(
  data: UploadGlobalDocumentRequest,
): Promise<GlobalDocumentResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.title && data.title.trim()) {
    formData.append("title", data.title.trim());
  }

  return apiPostFormData<GlobalDocumentResponse>(
    "/api/v1/documents/library/upload",
    formData,
  );
}

export async function deleteGlobalDocument(id: string): Promise<string> {
  return apiDelete<string>(`/api/v1/documents/library/${id}`);
}

export async function getCourseDocumentAudits(
  courseId: string,
): Promise<DocumentAuditResponse[]> {
  return apiGet<DocumentAuditResponse[]>(
    `/api/v1/documents/audits/course/${courseId}`,
  );
}

// ============================================================================
// --- React Query Hooks ---
// ============================================================================

export function useGlobalDocumentsInfiniteQuery(
  fileName?: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<GlobalDocumentResponse>,
      Error,
      InfiniteData<CustomPaging<GlobalDocumentResponse>, string | undefined>,
      readonly unknown[],
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["documents", "library-infinite", fileName],
    queryFn: ({ pageParam }) => getGlobalDocuments(fileName, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    ...options,
  });
}

export function useGlobalDocumentsQuery(
  fileName?: string,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<GlobalDocumentResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["documents", "library", fileName, nextCursor],
    queryFn: () => getGlobalDocuments(fileName, nextCursor),
    ...options,
  });
}

export function useUploadGlobalDocumentMutation(
  options?: UseMutationOptions<
    GlobalDocumentResponse,
    Error,
    UploadGlobalDocumentRequest
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadGlobalDocument,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "library"] });
      queryClient.invalidateQueries({
        queryKey: ["documents", "library-infinite"],
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteGlobalDocumentMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGlobalDocument(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "library"] });
      queryClient.invalidateQueries({
        queryKey: ["documents", "library-infinite"],
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCourseDocumentAuditsQuery(
  courseId: string,
  options?: Omit<
    UseQueryOptions<DocumentAuditResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["documents", "audits", "course", courseId],
    queryFn: () => getCourseDocumentAudits(courseId),
    enabled: !!courseId,
    ...options,
  });
}