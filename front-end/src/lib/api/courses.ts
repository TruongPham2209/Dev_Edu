import {
  CategoryRequest,
  CategoryResponse,
  CourseRequest,
  CourseResponse,
  ReviewRequest,
  ReviewResponse,
} from "@/lib/type/courses";
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
import { ItemStatus } from "../type/enum";
import { apiDelete, apiGet, apiPost, apiPut } from "./client";

// --- Courses ---

// Server Component home page
export async function getFeaturedCourses(): Promise<CourseResponse[]> {
  return apiGet<CourseResponse[]>("/api/v1/courses/highlighted");
}

async function getCourses(params?: {
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

async function getAssignedCourses(
  nextCursor?: string,
  keyword?: string,
  categoryId?: string,
): Promise<CustomPaging<CourseResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);
  if (categoryId) query.append("categoryId", categoryId);
  if (keyword) query.append("keyword", keyword);

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

// Server Component course detail page
export async function getCourseById(courseId: string): Promise<CourseResponse> {
  return apiGet<CourseResponse>(`/api/v1/courses/${courseId}/`);
}

async function createCourse(course: CourseRequest): Promise<CourseResponse> {
  return apiPost<CourseResponse>("/api/v1/courses", course);
}

async function updateCourse(course: CourseRequest): Promise<CourseResponse> {
  return apiPut<CourseResponse>("/api/v1/courses", course);
}

async function deleteCourse(courseId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/courses?courseId=${courseId}`);
}

// --- Reviews ---

async function getCourseReviews(
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

async function getMyReview(courseId: string): Promise<ReviewResponse | null> {
  const query = new URLSearchParams();
  query.append("courseId", courseId);

  return apiGet<ReviewResponse | null>(
    `/api/v1/courses/reviews/me?${query.toString()}`,
  );
}

async function createReview(review: ReviewRequest): Promise<ReviewResponse> {
  return apiPost<ReviewResponse>("/api/v1/courses/reviews", review);
}

async function deleteReview(reviewId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/courses/reviews?reviewId=${reviewId}`);
}

// --- Categories ---

async function getCategories(status?: ItemStatus): Promise<CategoryResponse[]> {
  const query = new URLSearchParams();
  if (status) query.append("status", status);

  const qs = query.toString();
  return apiGet<CategoryResponse[]>(`/api/v1/categories${qs ? "?" + qs : ""}`);
}

async function createCategory(
  category: CategoryRequest,
): Promise<CategoryResponse> {
  return apiPost<CategoryResponse>("/api/v1/categories", category);
}

async function updateCategory(
  category: CategoryRequest,
): Promise<CategoryResponse> {
  return apiPut<CategoryResponse>("/api/v1/categories", category);
}

async function deleteCategory(categoryId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/categories/${categoryId}`);
}

export function useCategoriesQuery(
  status?: ItemStatus,
  options?: Omit<
    UseQueryOptions<CategoryResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["categories", status],
    queryFn: () => getCategories(status),
    ...options,
  });
}

export function useCreateCategoryMutation(
  options?: UseMutationOptions<CategoryResponse, Error, CategoryRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateCategoryMutation(
  options?: UseMutationOptions<CategoryResponse, Error, CategoryRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteCategoryMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCoursesQuery(
  params?: {
    sortBy?: string;
    nextCursor?: string;
    categoryId?: string;
    keyword?: string;
    page?: number;
    status?: ItemStatus;
  },
  options?: Omit<
    UseQueryOptions<CustomPaging<CourseResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["courses", "list", params],
    queryFn: () => getCourses(params),
    ...options,
  });
}

export function useMyReviewQuery(
  courseId: string,
  options?: Omit<
    UseQueryOptions<ReviewResponse | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["reviews", "my", courseId],
    queryFn: () => getMyReview(courseId),
    enabled: !!courseId,
    ...options,
  });
}

export function useCourseByIdQuery(
  courseId: string,
  options?: Omit<
    UseQueryOptions<CourseResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
    ...options,
  });
}

export function useCoursesInfiniteQuery(
  params?: {
    sortBy?: string;
    categoryId?: string;
    keyword?: string;
    status?: ItemStatus;
  },
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<CourseResponse>,
      Error,
      InfiniteData<CustomPaging<CourseResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["courses", "infinite", params],
    queryFn: ({ pageParam }) =>
      getCourses({ ...params, nextCursor: pageParam || undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useAssignedCoursesInfiniteQuery(
  keyword?: string,
  categoryId?: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<CourseResponse>,
      Error,
      InfiniteData<CustomPaging<CourseResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["courses", "assigned-infinite", keyword, categoryId],
    queryFn: ({ pageParam }) =>
      getAssignedCourses(pageParam || undefined, keyword, categoryId),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useCreateCourseMutation(
  options?: UseMutationOptions<CourseResponse, Error, CourseRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateCourseMutation(
  options?: UseMutationOptions<CourseResponse, Error, CourseRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCourse,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteCourseMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCourseReviewsInfiniteQuery(
  courseId: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<ReviewResponse>,
      Error,
      InfiniteData<CustomPaging<ReviewResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["reviews", "course-infinite", courseId],
    queryFn: ({ pageParam }) =>
      getCourseReviews(courseId, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: !!courseId,
    ...options,
  });
}

export function useCreateReviewMutation(
  options?: UseMutationOptions<ReviewResponse, Error, ReviewRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteReviewMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      options?.onSuccess?.(...args);
    },
  });
}
