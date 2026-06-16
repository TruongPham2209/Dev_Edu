import type {
  CommentPageRequest,
  LectureCommentResponse,
  LectureRequest,
  LectureResponse,
  MaterialRequest,
  MaterialResponse,
  ProgressResponse,
  ProgressSegmentRequest,
} from "@/lib/type/lectures";
import {
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { CustomPaging } from "../type/api";
import { apiDelete, apiGet, apiPost, apiPut } from "./client";

// --- Lectures ---

async function getLecturesByCourse(
  courseId: string,
): Promise<LectureResponse[]> {
  return apiGet<LectureResponse[]>(`/api/v1/lectures?courseId=${courseId}`);
}

async function getLectureById(lectureId: string): Promise<LectureResponse> {
  return apiGet<LectureResponse>(`/api/v1/lectures/${lectureId}`);
}

async function createLecture(
  lecture: LectureRequest,
): Promise<LectureResponse> {
  return apiPost<LectureResponse>("/api/v1/lectures", lecture);
}

async function updateLecture(
  lecture: LectureRequest,
): Promise<LectureResponse> {
  return apiPut<LectureResponse>("/api/v1/lectures", lecture);
}

async function deleteLecture(lectureId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/lectures?lectureId=${lectureId}`);
}

// --- Progress ---

async function updateLectureProgress(
  request: ProgressSegmentRequest,
): Promise<ProgressResponse> {
  return apiPut<ProgressResponse>("/api/v1/lectures/progress", request);
}

// --- Materials ---

async function getMaterials(lectureId: string): Promise<MaterialResponse[]> {
  return apiGet<MaterialResponse[]>(`/api/v1/lectures/${lectureId}/materials`);
}

async function createMaterial(
  material: MaterialRequest,
): Promise<MaterialResponse> {
  return apiPost<MaterialResponse>("/api/v1/lectures/materials", material);
}

async function deleteMaterial(materialId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/lectures/materials?materialId=${materialId}`);
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

async function createLectureComment(body: {
  lectureId: string;
  content: string;
  parentCommentId?: string;
}): Promise<LectureCommentResponse> {
  return apiPost<LectureCommentResponse>("/api/v1/lectures/comments", body);
}

export async function deleteLectureComment(commentId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/lectures/comments?commentId=${commentId}`);
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLecture,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateLectureMutation(
  options?: UseMutationOptions<LectureResponse, Error, LectureRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLecture,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteLectureMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLecture,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateLectureProgressMutation(
  options?: UseMutationOptions<ProgressResponse, Error, ProgressSegmentRequest>,
) {
  return useMutation({
    mutationFn: updateLectureProgress,
    ...options,
    onSuccess: (...args) => {
      options?.onSuccess?.(...args);
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaterial,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteMaterialMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMaterial,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLectureComment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteLectureCommentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLectureComment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      options?.onSuccess?.(...args);
    },
  });
}
