import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import type {
  LectureResponse,
  LectureRequest,
  MaterialResponse,
  MaterialRequest,
  ProgressSegmentRequest,
  ProgressResponse,
  CommentPageRequest,
  LectureCommentResponse,
  CustomPaging,
} from "./types";

// --- Lectures ---

export async function getLecturesByCourse(
  courseId: string,
): Promise<LectureResponse[]> {
  return apiGet<LectureResponse[]>(`/api/v1/lectures?courseId=${courseId}`);
}

export async function getLectureById(
  lectureId: string,
): Promise<LectureResponse> {
  return apiGet<LectureResponse>(`/api/v1/lectures/${lectureId}`);
}

export async function createLecture(
  lecture: LectureRequest,
): Promise<LectureResponse> {
  return apiPost<LectureResponse>("/api/v1/lectures", lecture);
}

export async function updateLecture(
  lecture: LectureRequest,
): Promise<LectureResponse> {
  return apiPut<LectureResponse>("/api/v1/lectures", lecture);
}

export async function deleteLecture(lectureId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/lectures?lectureId=${lectureId}`);
}

// --- Progress ---

export async function updateLectureProgress(
  request: ProgressSegmentRequest,
): Promise<ProgressResponse> {
  return apiPut<ProgressResponse>("/api/v1/lectures/progress", request);
}

// --- Materials ---

export async function getMaterials(
  lectureId: string,
): Promise<MaterialResponse[]> {
  return apiGet<MaterialResponse[]>(
    `/api/v1/lectures/${lectureId}/materials`,
  );
}

export async function createMaterial(
  material: MaterialRequest,
): Promise<MaterialResponse> {
  return apiPost<MaterialResponse>("/api/v1/lectures/materials", material);
}

export async function deleteMaterial(materialId: string): Promise<void> {
  return apiDelete<void>(
    `/api/v1/lectures/materials?materialId=${materialId}`,
  );
}

// --- Comments ---

export async function getLectureComments(
  request: CommentPageRequest,
): Promise<CustomPaging<LectureCommentResponse>> {
  return apiPost<CustomPaging<LectureCommentResponse>>(
    "/api/v1/lectures/comments/filter",
    request,
  );
}

export async function createLectureComment(body: {
  lectureId: string;
  content: string;
  parentCommentId?: string;
}): Promise<LectureCommentResponse> {
  return apiPost<LectureCommentResponse>(
    "/api/v1/lectures/comments",
    body,
  );
}

export async function deleteLectureComment(
  commentId: string,
): Promise<void> {
  return apiDelete<void>(
    `/api/v1/lectures/comments?commentId=${commentId}`,
  );
}

export function useLecturesByCourseQuery(
  courseId: string,
  options?: Omit<
    UseQueryOptions<LectureResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["lectures", "course", courseId],
    queryFn: () => getLecturesByCourse(courseId),
    enabled: !!courseId,
    ...options,
  });
}

export function useLectureByIdQuery(
  lectureId: string,
  options?: Omit<
    UseQueryOptions<LectureResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["lectures", lectureId],
    queryFn: () => getLectureById(lectureId),
    enabled: !!lectureId,
    ...options,
  });
}

export function useCreateLectureMutation(
  options?: UseMutationOptions<LectureResponse, Error, LectureRequest>,
) {
  return useMutation({
    mutationFn: createLecture,
    ...options,
  });
}

export function useUpdateLectureMutation(
  options?: UseMutationOptions<LectureResponse, Error, LectureRequest>,
) {
  return useMutation({
    mutationFn: updateLecture,
    ...options,
  });
}

export function useDeleteLectureMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useMutation({
    mutationFn: deleteLecture,
    ...options,
  });
}

export function useUpdateLectureProgressMutation(
  options?: UseMutationOptions<
    ProgressResponse,
    Error,
    ProgressSegmentRequest
  >,
) {
  return useMutation({
    mutationFn: updateLectureProgress,
    ...options,
  });
}

export function useMaterialsQuery(
  lectureId: string,
  options?: Omit<
    UseQueryOptions<MaterialResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["materials", "lecture", lectureId],
    queryFn: () => getMaterials(lectureId),
    enabled: !!lectureId,
    ...options,
  });
}

export function useCreateMaterialMutation(
  options?: UseMutationOptions<MaterialResponse, Error, MaterialRequest>,
) {
  return useMutation({
    mutationFn: createMaterial,
    ...options,
  });
}

export function useDeleteMaterialMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useMutation({
    mutationFn: deleteMaterial,
    ...options,
  });
}

export function useLectureCommentsQuery(
  request: CommentPageRequest,
  options?: Omit<
    UseQueryOptions<CustomPaging<LectureCommentResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["lectures", "comments", request],
    queryFn: () => getLectureComments(request),
    enabled: !!request.lectureId,
    ...options,
  });
}

export function useInfiniteLectureCommentsQuery(
  request: Omit<CommentPageRequest, "nextCursor">,
) {
  return useInfiniteQuery({
    queryKey: ["lectures", "comments", "infinite", request],
    queryFn: ({ pageParam }) =>
      getLectureComments({
        ...request,
        nextCursor: pageParam || undefined,
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!request.lectureId,
  });
}

export function useCreateLectureCommentMutation(
  options?: UseMutationOptions<
    LectureCommentResponse,
    Error,
    { lectureId: string; content: string; parentCommentId?: string }
  >,
) {
  return useMutation({
    mutationFn: createLectureComment,
    ...options,
  });
}

export function useDeleteLectureCommentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useMutation({
    mutationFn: deleteLectureComment,
    ...options,
  });
}

// Aliases for backward compatibility during refactoring
export {
  useLecturesByCourseQuery as useGetLecturesByCourse,
  useLectureByIdQuery as useGetLectureById,
  useMaterialsQuery as useGetMaterials,
  useLectureCommentsQuery as useGetLectureComments,
};
