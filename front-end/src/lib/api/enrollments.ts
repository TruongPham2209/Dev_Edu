import { apiDelete, apiGet, apiPost } from "./client";
import type {
  CourseDiscountRequest,
  CourseDiscountResponse,
  CourseItemDetailResponse,
  CustomPaging,
  EnrollmentUserResponse,
  PurchaseDetailResponse,
  PurchaseRequest,
} from "./types";

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

// --- Enrollment / Purchase ---

export async function createPurchase(
  purchase: PurchaseRequest,
): Promise<PurchaseDetailResponse> {
  return apiPost<PurchaseDetailResponse>("/api/v1/enrollments", purchase);
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
