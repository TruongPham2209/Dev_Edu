import { CustomPaging } from "@/lib/type/api";
import type {
  CheckoutDetailResponse,
  CheckoutRequest,
  CourseItemDetailResponse,
  OrderDetailResponse,
  PaymentRequest,
  PaymentResponse,
} from "@/lib/type/enrollments";
import { PaymentStatus } from "@/lib/type/enum";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { CourseDiscountRequest, CourseDiscountResponse } from "../type/courses";
import { EnrollmentUserResponse } from "../type/users";
import { apiDelete, apiGet, apiPost } from "./client";

// --- Cart ---

export async function getCartItems(
  nextCursor?: string,
): Promise<CustomPaging<CourseItemDetailResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<CourseItemDetailResponse>>(
    `/api/v1/cart/items/courses${qs ? "?" + qs : ""}`,
  );
}

export async function addToCart(courseId: string): Promise<void> {
  return apiPost<void>("/api/v1/cart/items/courses", { courseId });
}

export async function removeFromCart(courseId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/cart/items/courses?courseId=${courseId}`);
}

// --- Checkout / Order ---

export async function checkout(
  purchase: CheckoutRequest,
): Promise<CheckoutDetailResponse> {
  return apiPost<CheckoutDetailResponse>("/api/v1/orders/checkout", purchase);
}

export async function getOrderDetail(
  orderId: string,
): Promise<CheckoutDetailResponse> {
  return apiGet<CheckoutDetailResponse>(`/api/v1/orders?orderId=${orderId}`);
}

export async function cancelOrder(orderId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/orders/cancel?orderId=${orderId}`);
}

// --- Enrollment / Payment ---

export async function createPayment(
  payment: PaymentRequest,
): Promise<PaymentResponse> {
  return apiPost<PaymentResponse>("/api/v1/enrollments", payment);
}

export async function cancelPayment(paymentId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/enrollments/cancel?paymentId=${paymentId}`);
}

/** Student enrolled courses (cursor-paginated) */
export async function getEnrollments(
  nextCursor?: string,
): Promise<CustomPaging<CourseItemDetailResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<CourseItemDetailResponse>>(
    `/api/v1/enrollments${qs ? "?" + qs : ""}`,
  );
}

/** Enrolled users for a course (cursor-paginated) */
export async function getEnrolledUsers(
  courseId: string,
  nextCursor?: string,
): Promise<CustomPaging<EnrollmentUserResponse>> {
  const query = new URLSearchParams();
  query.append("courseId", courseId);
  if (nextCursor) query.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<EnrollmentUserResponse>>(
    `/api/v1/enrollments/enrolled-users?${query.toString()}`,
  );
}

/** Order history by status (cursor-paginated) */
export async function getOrderHistory(
  status: PaymentStatus,
  nextCursor?: string,
): Promise<CustomPaging<OrderDetailResponse>> {
  const query = new URLSearchParams();
  query.append("orderStatus", status);
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<OrderDetailResponse>>(
    `/api/v1/orders/history${qs ? "?" + qs : ""}`,
  );
}

// --- Course Discounts ---

export async function getCourseDiscountsByCourse(
  courseId: string,
): Promise<CourseDiscountResponse[]> {
  return apiGet<CourseDiscountResponse[]>(
    `/api/v1/course-discounts?courseId=${courseId}`,
  );
}

export async function getGlobalCourseDiscounts(
  nextCursor?: string,
): Promise<CustomPaging<CourseDiscountResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<CourseDiscountResponse>>(
    `/api/v1/course-discounts${qs ? "?" + qs : ""}`,
  );
}

export async function createCourseDiscount(
  discount: CourseDiscountRequest,
): Promise<CourseDiscountResponse> {
  return apiPost<CourseDiscountResponse>("/api/v1/course-discounts", discount);
}

export async function deleteCourseDiscount(discountId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/course-discounts?discountId=${discountId}`);
}

// --- React Query Hooks ---

export function useCartItemsQuery(
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<CourseItemDetailResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["cart", "items", nextCursor],
    queryFn: () => getCartItems(nextCursor),
    ...options,
  });
}

export function useCartItemsInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<CourseItemDetailResponse>,
      Error,
      InfiniteData<CustomPaging<CourseItemDetailResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["cart", "items-infinite"],
    queryFn: ({ pageParam }) => getCartItems(pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useOrderHistoryInfinateQuery(
  status: PaymentStatus,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<OrderDetailResponse>,
      Error,
      InfiniteData<CustomPaging<OrderDetailResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["order", "history", status, "infinite"],
    queryFn: ({ pageParam }) => getOrderHistory(status, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useAddToCartMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCart,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useRemoveFromCartMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromCart,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useOrderDetailQuery(
  orderId: string,
  options?: Omit<
    UseQueryOptions<CheckoutDetailResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderDetail(orderId),
    enabled: !!orderId,
    ...options,
  });
}

export function useCancelOrderMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCreatePaymentMutation(
  options?: UseMutationOptions<PaymentResponse, Error, PaymentRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCheckoutMutation(
  options?: UseMutationOptions<CheckoutDetailResponse, Error, CheckoutRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkout,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCancelPaymentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPayment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useEnrollmentsQuery(
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<CourseItemDetailResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["enrollments", "student", nextCursor],
    queryFn: () => getEnrollments(nextCursor),
    ...options,
  });
}

export function useEnrollmentsInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<CourseItemDetailResponse>,
      Error,
      InfiniteData<CustomPaging<CourseItemDetailResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["enrollments", "student-infinite"],
    queryFn: ({ pageParam }) => getEnrollments(pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useEnrolledUsersQuery(
  courseId: string,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<EnrollmentUserResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["enrollments", "course", courseId, nextCursor],
    queryFn: () => getEnrolledUsers(courseId, nextCursor),
    enabled: !!courseId,
    ...options,
  });
}

export function useEnrolledUsersInfiniteQuery(
  courseId: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<EnrollmentUserResponse>,
      Error,
      InfiniteData<CustomPaging<EnrollmentUserResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["enrollments", "course-infinite", courseId],
    queryFn: ({ pageParam }) =>
      getEnrolledUsers(courseId, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: !!courseId,
    ...options,
  });
}

export function useCourseDiscountsByCourseQuery(
  courseId: string,
  options?: Omit<
    UseQueryOptions<CourseDiscountResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["discounts", "course", courseId],
    queryFn: () => getCourseDiscountsByCourse(courseId),
    enabled: !!courseId,
    ...options,
  });
}

export function useGlobalCourseDiscountsQuery(
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<CourseDiscountResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["discounts", "global", nextCursor],
    queryFn: () => getGlobalCourseDiscounts(nextCursor),
    ...options,
  });
}

export function useGlobalCourseDiscountsInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<CourseDiscountResponse>,
      Error,
      InfiniteData<CustomPaging<CourseDiscountResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["discounts", "global-infinite"],
    queryFn: ({ pageParam }) =>
      getGlobalCourseDiscounts(pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useCreateCourseDiscountMutation(
  options?: UseMutationOptions<
    CourseDiscountResponse,
    Error,
    CourseDiscountRequest
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourseDiscount,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteCourseDiscountMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourseDiscount,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      options?.onSuccess?.(...args);
    },
  });
}
