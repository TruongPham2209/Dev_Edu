import { apiGet, apiPost, apiPut, apiDelete } from "./client";
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
