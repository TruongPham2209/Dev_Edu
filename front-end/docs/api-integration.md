# Hướng Dẫn Tích Hợp API (API Integration)

Tài liệu này mô tả toàn bộ các API mà ứng dụng Frontend (Next.js) gọi tới hệ thống Backend (Spring Boot REST API). Dữ liệu được tổng hợp chính xác từ codebase thực tế trong thư mục `src/lib/api/` và các type tại `src/lib/type/`.

---

## 1. Cấu Hình & Cơ Chế API Client

### 1.1. Cấu hình Instance & Base URL
* **File nguồn**: `src/lib/api/client.ts`
* **Base URL**: Được lấy từ biến môi trường `process.env.NEXT_PUBLIC_API_URL` (Mặc định: `http://localhost:9020`).
* **Thư viện**: Sử dụng hàm `fetch` nguyên bản (native `fetch` API) được bọc trong hàm helper `apiCall<T>()`.

### 1.2. Xác thực & Đính kèm Token (Authentication)
* **Phương thức đính kèm**: Header `Authorization: Bearer <token>`
* **Cơ chế lấy Token**:
  * **Client-side (Trình duyệt)**: Lấy từ `localStorage.getItem("auth_token")`.
  * **Server-side (Next.js Server Component / SSR)**: Lấy từ Cookie `access_token` thông qua `next/headers`.

### 1.3. Cấu trúc Response Envelope & Xử lý Lỗi
Tất cả response thành công từ backend đều được đóng gói theo dạng Envelope:
```typescript
export type ApiResponse<T> = {
  success: boolean;
  status: string;         // e.g. "SUCCESS", "BAD_REQUEST", "UNAUTHORIZED", ...
  message: string;
  data: T;
  timestamp: number;
};
```
* **Lưu ý đặc biệt**: Backend luôn trả về HTTP status code `200` ngay cả khi xảy ra lỗi nghiệp vụ. Client kiểm tra trường `envelope.success`:
  * Nơi `success === false`, client sẽ quăng ra lỗi `ApiError(status, message, data)`.
  * Nếu không có dạng envelope (ví dụ các endpoint OAuth), client sẽ kiểm tra `response.ok`.

---

## 2. Danh Sách API Theo Domain / Feature

---

### 2.1. Feature: Xác thực & Người dùng (Auth & Users)
**File dịch vụ**: [users.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/users.ts) | **File types**: [users.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/users.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Path Params | Query Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy thông tin user hiện tại | `useMeQuery` | `GET` | `/api/v1/me` | Không | Không | `Authorization: Bearer <token>` |
| Đăng ký tài khoản mới | `useRegisterMutation` | `POST` | `/api/v1/users/register` | Không | Không | Public |
| Đổi mật khẩu | `useChangePasswordMutation` | `POST` | `/api/v1/users/change-password` | Không | Không | `Authorization: Bearer <token>` |
| Đăng ký hàng loạt users | `useBatchCreateUsersMutation` | `POST` | `/api/v1/users/batch-users` | Không | Không | `Authorization: Bearer <token>` |
| Cập nhật ảnh đại diện | `useUpdateAvatarMutation` | `PUT` | `/api/v1/users/avatar` | Không | Không | `Authorization: Bearer <token>` |
| Cập nhật username từ Google | `useSetUsernameFromGoogleMutation` | `PUT` | `/api/v1/users/username` | Không | Không | `Authorization: Bearer <token>` |
| Tìm kiếm danh sách user | `useSearchUsersQuery` | `GET` | `/api/v1/users` | Không | `page`, `role`, `keyword` | `Authorization: Bearer <token>` |

#### Đăng nhập qua OAuth2 / Password Grant (Server Action)
* **File nguồn**: [login.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/auth/login.ts) / [actions.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/app/login/actions.ts)
* **Method & Endpoint**: `POST /realms/{realm}/protocol/openid-connect/token` (Keycloak/OAuth2 Endpoint)
* **Header**: `Content-Type: application/x-www-form-urlencoded`
* **Request Body**:
  * `grant_type`: `"password"` (string, bắt buộc)
  * `client_id`: Biến môi trường `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` (string, bắt buộc)
  * `client_secret`: Biến môi trường `KEYCLOAK_CLIENT_SECRET` (string)
  * `username`: Email/Tên đăng nhập (string, bắt buộc)
  * `password`: Mật khẩu (string, bắt buộc)
* **Response Body**: `OAuthTokenResponse` (`access_token`, `refresh_token`, `expires_in`, `token_type`)
* **Xử lý trên UI**: Server Action lưu cookie HTTP-only `access_token` & `refresh_token`, đồng thời đồng bộ vào `localStorage` qua component `AuthSync`.

#### Chi tiết Request Body cho Khóa Người dùng:
* **RegisterUser (`/api/v1/users/register`)**:
  * `username` (`string`, bắt buộc): Định dạng regex `^[a-zA-Z][a-zA-Z0-9]{2,31}$`
  * `email` (`string`, bắt buộc): Định dạng Email chuẩn
  * `password` (`string`, bắt buộc): Regex `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`
  * `fullName` (`string`, bắt buộc)
  * `role` (`RoleEnum`, không bắt buộc): `"STUDENT"` \| `"LECTURER"` \| `"ADMIN"`

---

### 2.2. Feature: Khóa học & Danh mục (Courses & Categories)
**File dịch vụ**: [courses.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/courses.ts) | **File types**: [courses.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/courses.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query / Path Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy danh sách khóa học nổi bật | `getFeaturedCourses` | `GET` | `/api/v1/courses/highlighted` | Không | Public |
| Lấy danh sách khóa học (Phân trang/Filter) | `useCoursesQuery`, `useCoursesInfiniteQuery` | `GET` | `/api/v1/courses` | `sortBy`, `nextCursor`, `categoryId`, `keyword`, `page`, `status` | Public / Auth |
| Lấy danh sách khóa học được phân công (Lecturer) | `useAssignedCoursesInfiniteQuery` | `GET` | `/api/v1/enrollments/assigned-courses` | `nextCursor`, `keyword`, `categoryId` | `Authorization: Bearer <token>` |
| Lấy chi tiết khóa học | `getCourseById`, `useCourseByIdQuery` | `GET` | `/api/v1/courses/{courseId}/` | Path: `courseId` | Public / Auth |
| Tạo khóa học mới | `useCreateCourseMutation` | `POST` | `/api/v1/courses` | Không | `Authorization: Bearer <token>` |
| Cập nhật khóa học | `useUpdateCourseMutation` | `PUT` | `/api/v1/courses` | Không | `Authorization: Bearer <token>` |
| Xóa khóa học | `useDeleteCourseMutation` | `DELETE` | `/api/v1/courses` | Query: `courseId` | `Authorization: Bearer <token>` |
| Lấy danh sách danh mục | `useCategoriesQuery` | `GET` | `/api/v1/categories` | Query: `status` | Public |
| Tạo/Sửa/Xóa danh mục | `useCreateCategoryMutation`, `useUpdateCategoryMutation`, `useDeleteCategoryMutation` | `POST`/`PUT`/`DELETE` | `/api/v1/categories` | Path: `{categoryId}` (DELETE) | `Authorization: Bearer <token>` |
| Lấy/Đánh giá khóa học (Reviews) | `useCourseReviewsInfiniteQuery`, `useMyReviewQuery`, `useCreateReviewMutation`, `useDeleteReviewMutation` | `GET`/`POST`/`DELETE` | `/api/v1/courses/reviews` | Path/Query: `courseId`, `reviewId` | `Authorization: Bearer <token>` |
| Khuyến mãi khóa học (Discounts) | `useCourseDiscountsByCourseQuery`, `useGlobalCourseDiscountsInfiniteQuery`, `useCreateCourseDiscountMutation`, `useDeleteCourseDiscountMutation` | `GET`/`POST`/`DELETE` | `/api/v1/course-discounts` | Query: `courseId`, `discountId` | `Authorization: Bearer <token>` |

#### Chi tiết Request Body Khóa học (`CourseRequest`):
* `id` (`string`, không bắt buộc): ID khóa học (nếu cập nhật)
* `categoryId` (`string`, bắt buộc): ID danh mục chứa khóa học
* `title` (`string`, bắt buộc): Tiêu đề khóa học (tối thiểu 3 ký tự)
* `description` (`string`, bắt buộc): Mô tả chi tiết HTML (tối thiểu 10 ký tự thuần văn bản)
* `price` (`number`, bắt buộc): Giá bán (>= 0)
* `thumbnailObjectKey` (`string`, bắt buộc khi tạo): Key đối tượng lưu trữ ảnh thumbnail
* `lecturerUsernames` (`string[]`, bắt buộc): Danh sách username của giảng viên phụ trách

---

### 2.3. Feature: Bài giảng & Tài liệu (Lectures & Materials)
**File dịch vụ**: [lectures.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/lectures.ts) | **File types**: [lectures.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/lectures.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query / Path Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy danh sách bài giảng theo khóa | `useLecturesByCourseQuery` | `GET` | `/api/v1/lectures` | Query: `courseId` | `Authorization: Bearer <token>` |
| Lấy chi tiết bài giảng | `useLectureByIdQuery` | `GET` | `/api/v1/lectures/{lectureId}` | Path: `lectureId` | `Authorization: Bearer <token>` |
| Tạo / Cập nhật / Xóa bài giảng | `useCreateLectureMutation`, `useUpdateLectureMutation`, `useDeleteLectureMutation` | `POST`/`PUT`/`DELETE` | `/api/v1/lectures` | Query: `lectureId` (DELETE) | `Authorization: Bearer <token>` |
| Cập nhật tiến độ học | `useUpdateLectureProgressMutation` | `PUT` | `/api/v1/lectures/progress` | Không | `Authorization: Bearer <token>` |
| Lấy / Tạo / Xóa tài liệu bài học | `useMaterialsQuery`, `useCreateMaterialMutation`, `useDeleteMaterialMutation` | `GET`/`POST`/`DELETE` | `/api/v1/lectures/materials` | Path/Query: `lectureId`, `materialId` | `Authorization: Bearer <token>` |
| Bình luận bài học (Comments) | `useInfiniteLectureCommentsQuery`, `useCreateLectureCommentMutation`, `useDeleteLectureCommentMutation` | `POST`/`DELETE` | `/api/v1/lectures/comments/filter`, `/api/v1/lectures/comments` | Query: `commentId` | `Authorization: Bearer <token>` |

#### Chi tiết Request Body Tiến độ (`ProgressSegmentRequest`):
* `lectureId` (`string`, bắt buộc)
* `segmentStart` (`number`, bắt buộc): Giây bắt đầu xem
* `segmentEnd` (`number`, bắt buộc): Giây kết thúc xem

---

### 2.4. Feature: Bài tập & Nộp bài (Assignments & Submissions)
**File dịch vụ**: [assignments.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/assignments.ts) | **File types**: [assignments.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/assignments.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy bài tập theo bài học | `useAssignmentsQuery` | `GET` | `/api/v1/assignments` | `lectureId` | `Authorization: Bearer <token>` |
| Lấy chi tiết bài tập | `useAssignmentByIdQuery` | `GET` | `/api/v1/assignments` | `assignmentId` | `Authorization: Bearer <token>` |
| Tạo / Xóa bài tập | `useCreateAssignmentMutation`, `useDeleteAssignmentMutation` | `POST`/`DELETE` | `/api/v1/assignments` | `assignmentId` (DELETE) | `Authorization: Bearer <token>` |
| Lấy danh sách sinh viên nộp bài | `useSubmissionsInfiniteQuery` | `GET` | `/api/v1/assignments/submissions` | `assignmentId`, `page`, `size` | `Authorization: Bearer <token>` |
| Nộp bài tập / Xóa bài nộp | `useCreateSubmissionMutation`, `useDeleteSubmissionMutation` | `POST`/`DELETE` | `/api/v1/assignments/submissions` | `assignmentId` (DELETE) | `Authorization: Bearer <token>` |
| Lịch sử nộp bài (Tracking) | `useSubmissionTrackingQuery` | `GET` | `/api/v1/assignments/submissions/tracking` | `assignmentId`, `studentUsername`, `page` | `Authorization: Bearer <token>` |
| Lấy / Tạo / Xóa Nhận xét (Feedback) | `useFeedbacksQuery`, `useCreateFeedbackMutation`, `useDeleteFeedbackMutation` | `GET`/`POST`/`DELETE` | `/api/v1/assignments/feedbacks` | `assignmentId`, `studentUsername`, `feedbackId` | `Authorization: Bearer <token>` |

---

### 2.5. Feature: Diễn đàn & Bài viết (Forum & Posts)
**File dịch vụ**: [forum.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/forum.ts) | **File types**: [forums.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/forums.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query / Path Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy nguồn nguồn bài viết (Feed) | `useForumFeedInfiniteQuery` | `GET` | `/api/v1/forum/posts/feed` | `nextCursor` | Public / Auth |
| Lấy chi tiết bài viết | `useForumPostByIdQuery` | `GET` | `/api/v1/forum/posts` | Query: `id` | Public / Auth |
| Tìm kiếm bài viết | `useSearchForumPostsInfiniteQuery` | `GET` | `/api/v1/forum/posts/search` | `keyword`, `nextCursor` | Public |
| Bài viết liên quan | `useRelatedPostsQuery` | `GET` | `/api/v1/forum/posts/{postId}/related` | Path: `postId` | Public |
| Tạo / Sửa / Xóa bài viết | `useCreateForumPostMutation`, `useUpdateForumPostMutation`, `useDeleteForumPostMutation` | `POST`/`PUT`/`DELETE` | `/api/v1/forum/posts` | Query: `postId` (DELETE) | `Authorization: Bearer <token>` |
| Lưu / Bỏ lưu bài viết | `useSavePostMutation`, `useUnsavePostMutation` | `POST`/`DELETE` | `/api/v1/forum/posts/{postId}/save` | Path: `postId` | `Authorization: Bearer <token>` |
| Kiểm duyệt phiên bản (Admin) | `usePostVersionsInfiniteQuery`, `useUpdatePostVersionMutation` | `GET`/`PUT` | `/api/v1/forum/posts/versions` | Query: `status`, `lastCursor` | `Authorization: Bearer <token>` |
| Bình luận diễn đàn (Comments & Replies) | `useForumCommentsInfiniteQuery`, `useForumCommentRepliesInfiniteQuery`, `useCreateForumCommentMutation`, `useDeleteForumCommentMutation` | `GET`/`POST`/`DELETE` | `/api/v1/forum/comments`, `/api/v1/forum/comments/replies` | Query: `postId`, `parentCommentId`, `commentId` | `Authorization: Bearer <token>` |

---

### 2.6. Feature: Đăng ký, Giỏ hàng & Thanh toán (Enrollments, Cart & Payment)
**File dịch vụ**: [enrollments.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/enrollments.ts) | **File types**: [enrollments.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/enrollments.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xem giỏ hàng | `useCartItemsInfiniteQuery` | `GET` | `/api/v1/cart/items/courses` | `nextCursor` | `Authorization: Bearer <token>` |
| Thêm vào giỏ hàng | `useAddToCartMutation` | `POST` | `/api/v1/cart/items/courses` | Không | `Authorization: Bearer <token>` |
| Xóa khỏi giỏ hàng | `useRemoveFromCartMutation` | `DELETE` | `/api/v1/cart/items/courses` | `courseId` | `Authorization: Bearer <token>` |
| Đặt hàng (Checkout) | `useCheckoutMutation` | `POST` | `/api/v1/orders/checkout` | Không | `Authorization: Bearer <token>` |
| Chi tiết đơn hàng | `useOrderDetailQuery` | `GET` | `/api/v1/orders` | `orderId` | `Authorization: Bearer <token>` |
| Hủy đơn hàng | `useCancelOrderMutation` | `DELETE` | `/api/v1/orders/cancel` | `orderId` | `Authorization: Bearer <token>` |
| Tạo cổng thanh toán (Payment) | `useCreatePaymentMutation` | `POST` | `/api/v1/enrollments` | Không | `Authorization: Bearer <token>` |
| Danh sách khóa học đã đăng ký (Học viên) | `useEnrollmentsInfiniteQuery` | `GET` | `/api/v1/enrollments` | `nextCursor` | `Authorization: Bearer <token>` |
| Danh sách học viên tham gia (Giảng viên/Admin) | `useEnrolledUsersInfiniteQuery` | `GET` | `/api/v1/enrollments/enrolled-users` | `courseId`, `nextCursor` | `Authorization: Bearer <token>` |
| Lịch sử đơn hàng | `useOrderHistoryInfinateQuery` | `GET` | `/api/v1/orders/history` | `orderStatus`, `nextCursor` | `Authorization: Bearer <token>` |

#### Chi tiết Request Body Đặt hàng (`CheckoutRequest`):
* `entityIds` (`string[]`, bắt buộc): Danh sách ID khóa học trong giỏ hàng
* `entityType` (`EntityType`, bắt buộc): `"COURSE"` \| `"SUBSCRIPTION"`

#### Chi tiết Request Body Thanh toán (`PaymentRequest`):
* `orderId` (`string`, bắt buộc): ID đơn hàng đã tạo từ checkout
* `paymentMethod` (`PaymentMethod`, bắt buộc): `"VNPAY"` \| `"MOMO"` \| `"ZALOPAY"` \| `"PAYPAL"` \| `"STRIPE"`

---

### 2.7. Feature: Tải lên & Quản lý File (Files / Uploads)
**File dịch vụ**: [files.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/files.ts) | **File types**: [files.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/files.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy Pre-Signed Upload URL | `usePreSignedUploadUrlMutation` | `POST` | `/api/v1/files/pre-signed-url` | Không | `Authorization: Bearer <token>` |
| Xác nhận đã Upload ảnh thành công | `useConfirmImageUploadMutation` | `POST` | `/api/v1/files/confirm-image-upload` | `fullObjectKey` | `Authorization: Bearer <token>` |
| Lấy URL tải file xuống | `useDownloadUrlQuery` | `GET` | `/api/v1/files/download` | `fullObjectKey` | `Authorization: Bearer <token>` |
| Lấy Metadata file | `useFileMetadataQuery` | `GET` | `/api/v1/files/metadata` | `fullObjectKey` | `Authorization: Bearer <token>` |

---

### 2.8. Feature: Thống kê Dashboard (Metrics / Analytics)
**File dịch vụ**: [metrics.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/metrics.ts) | **File types**: [metrics.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/type/metrics.ts)

| Mục đích | Nơi gọi trong code | Method | Endpoint Path | Query Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Tổng quan Dashboard Admin | `useDashboardMetrics` | `GET` | `/api/metrics/dashboard` | Không | `Authorization: Bearer <token>` |
| Biểu đồ tăng trưởng User | `useUserGrowth` | `GET` | `/api/metrics/users-growth` | `period` (`DAILY`/`WEEKLY`/`MONTHLY`/`YEARLY`) | `Authorization: Bearer <token>` |
| Biểu đồ tăng trưởng Khóa học | `useCourseGrowth` | `GET` | `/api/metrics/courses-growth` | `period` | `Authorization: Bearer <token>` |
| Biểu đồ doanh thu | `useRevenueGrowth` | `GET` | `/api/metrics/revenue-growth` | `period` | `Authorization: Bearer <token>` |
| Nhật ký hoạt động gần đây | `useActivity` | `GET` | `/api/metrics/activity` | `days` | `Authorization: Bearer <token>` |
| Top Khóa học doanh thu/học viên cao | `useTopCourses` | `GET` | `/api/metrics/top-courses` | `limit` | `Authorization: Bearer <token>` |
| Top Học viên & Top Cống hiến | `useTopUsers` | `GET` | `/api/metrics/top-users` | `limit` | `Authorization: Bearer <token>` |

---

## 3. Cách Xử Lý Lỗi & Phản Hồi Trực Quan Trên UI (Error & Feedback Rules)

1. **Custom Hook `useApiWithToast`**:
   * Định nghĩa tại [use-api-with-toast.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/use-api-with-toast.ts).
   * Khi lỗi API trả về `ApiError`, hệ thống tự động tra cứu mã lỗi (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, v.v.) và hiển thị thông báo `Toast` (Snackbar) tương ứng qua `ToastContext`.
2. **Quản lý Loading State**:
   * Tất cả các thao tác dữ liệu đều tích hợp với `@tanstack/react-query` (`useQuery`, `useInfiniteQuery`, `useMutation`).
   * Các trang đều có giao diện Skeletons tương ứng (`SkeletonCard`, `CourseManageGridSkeleton`, `Skeleton` từ MUI) trong lúc dữ liệu đang tải (`isLoading === true`).
3. **Quản lý Error State & Empty State**:
   * Component [error-state.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/components/common/error-state.tsx) hiển thị thông báo lỗi thân thiện kèm nút Retry khi `isError === true`.
   * Component [empty-state.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/components/common/empty-state.tsx) hiển thị giao diện trống khi danh sách mảng rỗng (`data.length === 0`).
