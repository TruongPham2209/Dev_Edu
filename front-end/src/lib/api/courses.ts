import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  CategoryRequest,
  CategoryResponse,
  CourseRequest,
  CourseResponse,
  CustomPaging,
  ItemStatus,
  ReviewRequest,
  ReviewResponse,
} from "./types";

// --- Courses ---

export async function getFeaturedCourses(): Promise<CourseResponse[]> {
  return apiGet<CourseResponse[]>("/api/v1/courses/highlighted");
}

export async function getCourses(params?: {
  sortBy?: string;
  nextCursor?: string;
  categoryId?: string;
  keyword?: string;
  page?: number;
  status?: ItemStatus;
}): Promise<CustomPaging<CourseResponse>> {
  const query = new URLSearchParams();
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.nextCursor) query.append("nextCursor", params.nextCursor);
  if (params?.categoryId) query.append("categoryId", params.categoryId);
  if (params?.keyword) query.append("keyword", params.keyword);
  if (params?.page !== undefined) query.append("page", String(params.page));
  if (params?.status) query.append("status", params.status);

  const qs = query.toString();
  const response = await apiGet<CustomPaging<CourseResponse> | null>(
    `/api/v1/courses${qs ? "?" + qs : ""}`,
  );

  if (!response || !Array.isArray(response.contents)) {
    return {
      contents: [],
      totalPages: 0,
      pageSize: 10,
      totalElements: 0,
      currentPage: 0,
      nextCursor: null,
    };
  }

  return response;
}

/** Lecturer assigned courses (cursor-paginated) */
export async function getAssignedCourses(
  nextCursor?: string,
): Promise<CustomPaging<CourseResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  const response = await apiGet<CustomPaging<CourseResponse> | null>(
    `/api/v1/enrollments/assigned-courses${qs ? "?" + qs : ""}`,
  );

  if (!response || !Array.isArray(response.contents)) {
    return {
      contents: [],
      totalPages: 0,
      pageSize: 10,
      totalElements: 0,
      currentPage: 0,
      nextCursor: null,
    };
  }

  return response;
}

export async function getCourseById(courseId: string): Promise<CourseResponse> {
  return apiGet<CourseResponse>(`/api/v1/courses/${courseId}/`);
}

export async function getAllAdminCourses(params?: {
  status?: ItemStatus;
  sortBy?: string;
}): Promise<CourseResponse[]> {
  const items: CourseResponse[] = [];
  let nextCursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await getCourses({
      status: params?.status,
      sortBy: params?.sortBy,
      nextCursor,
    });
    items.push(...response.contents);
    nextCursor = response.nextCursor ?? undefined;
    hasMore = Boolean(nextCursor);
  }

  return items;
}

export async function createCourse(
  course: CourseRequest,
): Promise<CourseResponse> {
  return apiPost<CourseResponse>("/api/v1/courses", course);
}

export async function updateCourse(
  course: CourseRequest,
): Promise<CourseResponse> {
  return apiPut<CourseResponse>("/api/v1/courses", course);
}

export async function deleteCourse(courseId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/courses?courseId=${courseId}`);
}

// --- Reviews ---

export async function getCourseReviews(
  courseId: string,
  nextCursor?: string,
): Promise<CustomPaging<ReviewResponse>> {
  const query = new URLSearchParams();
  query.append("courseId", courseId);
  if (nextCursor) query.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<ReviewResponse>>(
    `/api/v1/courses/reviews?${query.toString()}`,
  );
}

export async function createReview(
  review: ReviewRequest,
): Promise<ReviewResponse> {
  return apiPost<ReviewResponse>("/api/v1/courses/reviews", review);
}

export async function deleteReview(reviewId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/courses/reviews?reviewId=${reviewId}`);
}

// --- Categories ---

export async function getCategories(
  status?: ItemStatus,
): Promise<CategoryResponse[]> {
  const query = new URLSearchParams();
  if (status) query.append("status", status);

  const qs = query.toString();
  return apiGet<CategoryResponse[]>(`/api/v1/categories${qs ? "?" + qs : ""}`);
}

export async function createCategory(
  category: CategoryRequest,
): Promise<CategoryResponse> {
  return apiPost<CategoryResponse>("/api/v1/categories", category);
}

export async function updateCategory(
  category: CategoryRequest,
): Promise<CategoryResponse> {
  return apiPut<CategoryResponse>("/api/v1/categories", category);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/categories/${categoryId}`);
}
