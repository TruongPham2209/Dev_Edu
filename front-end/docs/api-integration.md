# API Integration Guide — DevEdu Frontend

This document details all API services invoked by the Frontend (Next.js) application to interact with the Backend (Spring Boot REST API).

---

## 1. API Client Mechanisms & Configurations

### 1.1. Instance & Base URL Configuration
* **Source file**: `src/lib/api/client.ts`
* **Base URL**: Environment variable `process.env.NEXT_PUBLIC_API_URL` (Default: `http://localhost:9020`).
* **HTTP Library**: Native `fetch` API wrapped inside the `apiCall<T>()` helper function.

### 1.2. Authentication & Header Attachment
* **Header format**: `Authorization: Bearer <token>`
* **Token Retrieval Strategy**:
  * **Client-side (Browser)**: Retrieved from `localStorage.getItem("auth_token")`.
  * **Server-side (Next.js Server Component / SSR)**: Retrieved from HTTP Cookie `access_token` via `next/headers`.

### 1.3. Response Envelope & Error Handling Structure
All successful backend responses are wrapped within a unified envelope:
```typescript
export type ApiResponse<T> = {
  success: boolean;
  status: string;         // e.g. "SUCCESS", "BAD_REQUEST", "UNAUTHORIZED", ...
  message: string;
  data: T;
  timestamp: number;
};
```
* **Important Note**: Backend returns HTTP status `200` even when business exceptions occur. Client inspects `envelope.success`:
  * If `success === false`, client throws `ApiError(status, message, data)`.
  * For endpoints without an envelope (such as OAuth endpoints), client validates `response.ok`.

---

## 2. API Services Catalog by Domain

---

### 2.1. Feature: Authentication & User Management
**Service File**: [users.ts](../src/lib/api/users.ts) | **Types**: [users.ts](../src/lib/type/users.ts)

| Action | Hook / Function | Method | Endpoint Path | Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get Current User Profile | `useMeQuery` | `GET` | `/api/v1/me` | None | `Authorization: Bearer <token>` |
| User Registration | `useRegisterMutation` | `POST` | `/api/v1/users/register` | None | Public |
| Change Password | `useChangePasswordMutation` | `POST` | `/api/v1/users/change-password` | None | `Authorization: Bearer <token>` |
| Batch Create Users | `useBatchCreateUsersMutation` | `POST` | `/api/v1/users/batch-users` | None | `Authorization: Bearer <token>` |
| Update Avatar | `useUpdateAvatarMutation` | `PUT` | `/api/v1/users/avatar` | None | `Authorization: Bearer <token>` |
| Set Google Login Username | `useSetUsernameFromGoogleMutation` | `PUT` | `/api/v1/users/username` | None | `Authorization: Bearer <token>` |
| Search Users | `useSearchUsersQuery` | `GET` | `/api/v1/users` | `page`, `role`, `keyword` | `Authorization: Bearer <token>` |

#### OAuth2 / Password Grant Authentication (Server Action)
* **Source file**: [login.ts](../src/lib/auth/login.ts) / [actions.ts](../src/app/login/actions.ts)
* **Endpoint**: `POST /realms/{realm}/protocol/openid-connect/token` (Keycloak/OAuth2 Endpoint)
* **Header**: `Content-Type: application/x-www-form-urlencoded`
* **Request Body**: `grant_type: "password"`, `client_id`, `client_secret`, `username`, `password`
* **Response Body**: `OAuthTokenResponse` (`access_token`, `refresh_token`, `expires_in`, `token_type`)

---

### 2.2. Feature: Courses & Categories
**Service File**: [courses.ts](../src/lib/api/courses.ts) | **Types**: [courses.ts](../src/lib/type/courses.ts)

| Action | Hook / Function | Method | Endpoint Path | Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Featured Courses | `getFeaturedCourses` | `GET` | `/api/v1/courses/highlighted` | None | Public |
| Course Catalog List | `useCoursesQuery`, `useCoursesInfiniteQuery` | `GET` | `/api/v1/courses` | `sortBy`, `nextCursor`, `categoryId`, `keyword`, `page`, `status` | Public / Auth |
| Assigned Courses (Lecturer) | `useAssignedCoursesInfiniteQuery` | `GET` | `/api/v1/enrollments/assigned-courses` | `nextCursor`, `keyword`, `categoryId` | `Authorization: Bearer <token>` |
| Course Details | `getCourseById`, `useCourseByIdQuery` | `GET` | `/api/v1/courses/{courseId}/` | Path: `courseId` | Public / Auth |
| Create Course | `useCreateCourseMutation` | `POST` | `/api/v1/courses` | None | `Authorization: Bearer <token>` |
| Update Course | `useUpdateCourseMutation` | `PUT` | `/api/v1/courses` | None | `Authorization: Bearer <token>` |
| Delete Course | `useDeleteCourseMutation` | `DELETE` | `/api/v1/courses` | Query: `courseId` | `Authorization: Bearer <token>` |
| Category List | `useCategoriesQuery` | `GET` | `/api/v1/categories` | Query: `status` | Public |
| Category CRUD | `useCreateCategoryMutation`, `useUpdateCategoryMutation`, `useDeleteCategoryMutation` | `POST`/`PUT`/`DELETE` | `/api/v1/categories` | Path: `{categoryId}` (DELETE) | `Authorization: Bearer <token>` |
| Course Reviews | `useCourseReviewsInfiniteQuery`, `useMyReviewQuery`, `useCreateReviewMutation`, `useDeleteReviewMutation` | `GET`/`POST`/`DELETE` | `/api/v1/courses/reviews` | Path/Query: `courseId`, `reviewId` | `Authorization: Bearer <token>` |
| Course Discounts | `useCourseDiscountsByCourseQuery`, `useGlobalCourseDiscountsInfiniteQuery`, `useCreateCourseDiscountMutation`, `useDeleteCourseDiscountMutation` | `GET`/`POST`/`DELETE` | `/api/v1/course-discounts` | Query: `courseId`, `discountId` | `Authorization: Bearer <token>` |

---

### 2.3. Feature: Lectures & Learning Materials
**Service File**: [lectures.ts](../src/lib/api/lectures.ts) | **Types**: [lectures.ts](../src/lib/type/lectures.ts)

| Action | Hook / Function | Method | Endpoint Path | Params | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lecture List | `useLecturesByCourseQuery` | `GET` | `/api/v1/lectures` | Query: `courseId` | `Authorization: Bearer <token>` |
| Lecture Details | `useLectureByIdQuery` | `GET` | `/api/v1/lectures/{lectureId}` | Path: `lectureId` | `Authorization: Bearer <token>` |
| Lecture CRUD | `useCreateLectureMutation`, `useUpdateLectureMutation`, `useDeleteLectureMutation` | `POST`/`PUT`/`DELETE` | `/api/v1/lectures` | Query: `lectureId` (DELETE) | `Authorization: Bearer <token>` |
| Update Learning Progress | `useUpdateLectureProgressMutation` | `PUT` | `/api/v1/lectures/progress` | None | `Authorization: Bearer <token>` |
| Materials Management | `useMaterialsQuery`, `useCreateMaterialMutation`, `useDeleteMaterialMutation` | `GET`/`POST`/`DELETE` | `/api/v1/lectures/materials` | Path/Query: `lectureId`, `materialId` | `Authorization: Bearer <token>` |
| Lecture Comments | `useInfiniteLectureCommentsQuery`, `useCreateLectureCommentMutation`, `useDeleteLectureCommentMutation` | `POST`/`DELETE` | `/api/v1/lectures/comments/filter`, `/api/v1/lectures/comments` | Query: `commentId` | `Authorization: Bearer <token>` |

---

### 2.4. Feature: Cart, Checkout & Orders
**Service File**: [enrollments.ts](../src/lib/api/enrollments.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Add / Remove Cart Item | `POST`/`DELETE` | `/api/v1/cart-items` |
| View Cart List | `GET` | `/api/v1/cart-items` |
| Enrolled Courses | `GET` | `/api/v1/enrollments/my-courses` |
| Checkout & Orders | `POST`/`GET`/`DELETE` | `/api/v1/orders`, `/api/v1/orders/{orderId}` |
| Online Purchase | `POST` | `/api/v1/payment/purchase` |

---

### 2.5. Feature: Assignments & Submissions
**Service File**: [assignments.ts](../src/lib/api/assignments.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Assignments CRUD | `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/assignments` |
| Submit Assignment | `POST` | `/api/v1/assignments/submissions` |
| Feedback & Submissions | `GET`/`POST` | `/api/v1/assignments/feedback` |

---

### 2.6. Feature: Forum & Posts
**Service File**: [forum.ts](../src/lib/api/forum.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Search & Filter Posts | `GET` | `/api/v1/forum/posts` |
| Post Details & Versioning | `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/forum/posts/{postId}` |
| Post Moderation (Admin) | `PUT` | `/api/v1/forum/posts/moderate` |
| Saved Posts | `GET`/`POST`/`DELETE` | `/api/v1/forum/saved-posts` |
| Post Comments | `GET`/`POST`/`DELETE` | `/api/v1/forum/comments` |

---

### 2.7. Feature: Quiz & Examinations
**Service File**: [quizzes.ts](../src/lib/api/quizzes.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Quizzes Management | `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/quizzes` |
| Question Bank & Options | `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/quizzes/questions` |
| Assign Quiz | `POST`/`GET` | `/api/v1/quizzes/assignments` |
| Attempt Quiz Lifecycle | `POST`/`PUT` | `/api/v1/quizzes/attempts/start`, `/autosave`, `/heartbeat`, `/submit` |
| Essay Grading | `GET`/`POST` | `/api/v1/quizzes/grading/pending`, `/api/v1/quizzes/grading/grade` |

---

### 2.8. Feature: AI Assistant & Direct Messaging
**Service File**: [chat.ts](../src/lib/api/chat.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Consult AI Assistant | `POST` | `/api/v1/chat/consult` |
| Conversation History | `GET` | `/api/v1/chat/conversations` |
| Conversation Messages | `GET` | `/api/v1/chat/conversations/{conversationId}/messages` |

---

### 2.9. Feature: Notifications & FCM Token Registration
**Service File**: [notification.ts](../src/lib/api/notification.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Personal Notifications | `GET`/`PUT` | `/api/v1/notifications/personal` |
| Group Notifications | `GET`/`POST` | `/api/v1/notifications/group` |
| Register FCM Token | `POST` | `/api/v1/notifications/device-tokens` |

---

### 2.10. Feature: Analytics & Metrics
**Service File**: [metrics.ts](../src/lib/api/metrics.ts)

| Action | Method | Endpoint Path |
| :--- | :--- | :--- |
| Dashboard Metrics | `GET` | `/api/v1/metrics/dashboard` |
| Growth Analytics | `GET` | `/api/v1/metrics/growth` |

---

### 2.11. Feature: Storage & File Management (Single & Chunked Multipart Uploads)
**Service File**: [files.ts](../src/lib/api/files.ts) | **Types**: [files.ts](../src/lib/type/files.ts) | **Upload Utility**: [chunked-upload.ts](../src/lib/util/chunked-upload.ts)

#### Upload Strategies:
- **Flow 1: Single Upload (< 10MB)**: Uses `getPreSignedUploadUrl` to obtain direct presigned URL and uploads binary payload via standard `PUT` to Cloudflare R2 / S3.
- **Flow 2: Chunked / Multipart Upload (>= 10MB)**: Uses `ChunkedUploadManager` (via `uploadFileWithStrategy`) to slice large files (default 10MB chunks), presign in sliding windows (default 20 parts per batch), upload concurrently (concurrency = 5), collect ETags, and complete multipart upload on backend.

| Action | Hook / Function | Method | Endpoint Path | Params / Payload | Header / Auth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get Single Presigned Upload URL | `usePreSignedUploadUrlMutation`, `getPreSignedUploadUrl` | `POST` | `/api/v1/files/pre-signed-url` | `{ fileName, contentType, fileSize, isPublic }` | `Authorization: Bearer <token>` |
| Confirm Image Upload | `useConfirmImageUploadMutation`, `confirmImageUpload` | `POST` | `/api/v1/files/confirm-image-upload` | Query: `fullObjectKey` | `Authorization: Bearer <token>` |
| Get Download URL | `useDownloadUrlQuery`, `getDownloadUrl` | `GET` | `/api/v1/files/download` | Query: `fullObjectKey` | `Authorization: Bearer <token>` |
| Get File Metadata | `useFileMetadataQuery`, `getFileMetadata` | `GET` | `/api/v1/files/metadata` | Query: `fullObjectKey` | `Authorization: Bearer <token>` |
| **Init Chunk Upload** | `useInitChunkUploadMutation`, `initChunkUpload` | `POST` | `/api/v1/files/chunk-upload/init` | `{ fileName, contentType, fileSize, isPublic }` | `Authorization: Bearer <token>` |
| **Presign Batch Chunks** | `usePresignChunkUploadMutation`, `presignChunkUpload` | `POST` | `/api/v1/files/chunk-upload/{sessionId}/presign` | Body: `{ fromPart, partCount }` | `Authorization: Bearer <token>` |
| **Complete Chunk Upload** | `useCompleteChunkUploadMutation`, `completeChunkUpload` | `POST` | `/api/v1/files/chunk-upload/{sessionId}/complete` | Body: `{ parts: [{ partNumber, eTag }] }` | `Authorization: Bearer <token>` |
| **Abort Chunk Upload** | `useAbortChunkUploadMutation`, `abortChunkUpload` | `DELETE` | `/api/v1/files/chunk-upload/{sessionId}` | None | `Authorization: Bearer <token>` |
| **Chunk Upload Status** | `useChunkUploadStatusQuery`, `getChunkUploadStatus` | `GET` | `/api/v1/files/chunk-upload/{sessionId}/status` | None | `Authorization: Bearer <token>` |

