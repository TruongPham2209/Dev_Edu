# API Reference — Dev-Edu Backend

> Comprehensive, production-grade REST API reference documentation for the Dev-Edu Backend system.
> Generated based on the audited source code, DTO definitions, Bean Validation constraints, and security configurations.

---

## Table of Contents

- [General Information](#general-information)
  - [Base URL](#base-url)
  - [Response Format Envelope (`ApiResponse`)](#response-format-envelope-apiresponse)
  - [Pagination Envelope (`CustomPaging<T>`)](#pagination-envelope-custompagingt)
  - [Authentication & Authorization](#authentication--authorization)
  - [System Roles](#system-roles)
  - [Common HTTP & Business Error Statuses](#common-http--business-error-statuses)
- [1. User Module](#1-user-module)
  - [1.1 User Registration (`POST /api/v1/users/register`)](#11-user-registration)
  - [1.2 Batch Create Users (`POST /api/v1/users/batch-users`)](#12-batch-create-users)
  - [1.3 Get User List (`GET /api/v1/users`)](#13-get-user-list)
  - [1.4 Change Password (`POST /api/v1/users/change-password`)](#14-change-password)
  - [1.5 Update Avatar (`PUT /api/v1/users/avatar`)](#15-update-avatar)
  - [1.6 Set Username for Google Login (`PUT /api/v1/users/username`)](#16-set-username-for-google-login)
  - [1.7 Get Current User Profile (`GET /api/v1/me`)](#17-get-current-user-profile)
- [2. Course Module](#2-course-module)
  - [2.1 Get All Categories (`GET /api/v1/categories`)](#21-get-all-categories)
  - [2.2 Create Category (`POST /api/v1/categories`)](#22-create-category)
  - [2.3 Update Category (`PUT /api/v1/categories`)](#23-update-category)
  - [2.4 Delete Category (`DELETE /api/v1/categories/{categoryId}`)](#24-delete-category)
  - [2.5 Get Course List (`GET /api/v1/courses`)](#25-get-course-list)
  - [2.6 Get Featured Courses (`GET /api/v1/courses/highlighted`)](#26-get-featured-courses)
  - [2.7 Get Course Details (`GET /api/v1/courses/{courseId}/`)](#27-get-course-details)
  - [2.8 Create Course (`POST /api/v1/courses`)](#28-create-course)
  - [2.9 Update Course (`PUT /api/v1/courses`)](#29-update-course)
  - [2.10 Delete Course (`DELETE /api/v1/courses`)](#210-delete-course)
  - [2.11 Get Discount List (`GET /api/v1/course-discounts`)](#211-get-discount-list)
  - [2.12 Create Discount (`POST /api/v1/course-discounts`)](#212-create-discount)
  - [2.13 Delete Discount (`DELETE /api/v1/course-discounts`)](#213-delete-discount)
  - [2.14 Get Course Reviews (`GET /api/v1/courses/reviews`)](#214-get-course-reviews)
  - [2.15 Get My Review (`GET /api/v1/courses/reviews/me`)](#215-get-my-review)
  - [2.16 Create Review (`POST /api/v1/courses/reviews`)](#216-create-review)
  - [2.17 Delete Review (`DELETE /api/v1/courses/reviews`)](#217-delete-review)
- [3. Enrollment & Payment Module](#3-enrollment--payment-module)
  - [3.1 Add Course to Cart (`POST /api/v1/cart/items/courses`)](#31-add-course-to-cart)
  - [3.2 Remove Course from Cart (`DELETE /api/v1/cart/items/courses`)](#32-remove-course-from-cart)
  - [3.3 Get Cart List (`GET /api/v1/cart/items/courses`)](#33-get-cart-list)
  - [3.4 Get Cart List - Order Alias (`GET /api/v1/orders/items/courses`)](#34-get-cart-list---order-alias)
  - [3.5 Get Enrolled Courses (`GET /api/v1/enrollments`)](#35-get-enrolled-courses)
  - [3.6 Get Assigned Courses - Lecturer (`GET /api/v1/enrollments/assigned-courses`)](#36-get-assigned-courses---lecturer)
  - [3.7 Get Enrolled Students List (`GET /api/v1/enrollments/enrolled-users`)](#37-get-enrolled-students-list)
  - [3.8 Checkout Order (`POST /api/v1/orders/checkout`)](#38-checkout-order)
  - [3.9 Get Order Details (`GET /api/v1/orders`)](#39-get-order-details)
  - [3.10 Get Order History (`GET /api/v1/orders/history`)](#310-get-order-history)
  - [3.11 Cancel Order (`DELETE /api/v1/orders/cancel`)](#311-cancel-order)
  - [3.12 Purchase / Create Payment Session (`POST /api/v1/enrollments`)](#312-purchase--create-payment-session)
  - [3.13 VNPay Return Callback (`GET /api/v1/enrollments/vnpay-return`)](#313-vnpay-return-callback)
  - [3.14 Cancel Payment (`DELETE /api/v1/enrollments/cancel`)](#314-cancel-payment)
- [4. Lecture Module](#4-lecture-module)
  - [4.1 Get Lectures by Course (`GET /api/v1/lectures`)](#41-get-lectures-by-course)
  - [4.2 Get Lecture Details (`GET /api/v1/lectures/{lectureId}`)](#42-get-lecture-details)
  - [4.3 Get Lecture Materials (`GET /api/v1/lectures/{lectureId}/materials`)](#43-get-lecture-materials)
  - [4.4 Create Lecture (`POST /api/v1/lectures`)](#44-create-lecture)
  - [4.5 Create Lecture Material (`POST /api/v1/lectures/materials`)](#45-create-lecture-material)
  - [4.6 Update Lecture (`PUT /api/v1/lectures`)](#46-update-lecture)
  - [4.7 Delete Lecture (`DELETE /api/v1/lectures`)](#47-delete-lecture)
  - [4.8 Delete Lecture Material (`DELETE /api/v1/lectures/materials`)](#48-delete-lecture-material)
  - [4.9 Update Video Progress (`PUT /api/v1/lectures/progress`)](#49-update-video-progress)
  - [4.10 Filter Lecture Comments (`POST /api/v1/lectures/comments/filter`)](#410-filter-lecture-comments)
  - [4.11 Create Lecture Comment (`POST /api/v1/lectures/comments`)](#411-create-lecture-comment)
  - [4.12 Delete Lecture Comment (`DELETE /api/v1/lectures/comments`)](#412-delete-lecture-comment)
- [5. Assignment Module](#5-assignment-module)
  - [5.1 Get Assignments (`GET /api/v1/assignments`)](#51-get-assignments)
  - [5.2 Create Assignment (`POST /api/v1/assignments`)](#52-create-assignment)
  - [5.3 Delete Assignment (`DELETE /api/v1/assignments`)](#53-delete-assignment)
  - [5.4 Get Feedback (`GET /api/v1/assignments/feedbacks`)](#54-get-feedback)
  - [5.5 Create Feedback (`POST /api/v1/assignments/feedbacks`)](#55-create-feedback)
  - [5.6 Delete Feedback (`DELETE /api/v1/assignments/feedbacks`)](#56-delete-feedback)
  - [5.7 Get Submissions (`GET /api/v1/assignments/submissions`)](#57-get-submissions)
  - [5.8 Submit Assignment (`POST /api/v1/assignments/submissions`)](#58-submit-assignment)
  - [5.9 Cancel Submission (`DELETE /api/v1/assignments/submissions`)](#59-cancel-submission)
- [6. File Storage Module](#6-file-storage-module)
  - [6.1 Create Pre-signed Upload URL (`POST /api/v1/files/pre-signed-url`)](#61-create-pre-signed-upload-url)
  - [6.2 Get File Metadata (`GET /api/v1/files/metadata`)](#62-get-file-metadata)
  - [6.3 Get Download Details (`GET /api/v1/files/download`)](#63-get-download-details)
  - [6.4 Confirm Image Upload (`POST /api/v1/files/confirm-image-upload`)](#64-confirm-image-upload)
- [7. Forum Module](#7-forum-module)
  - [7.1 Get All Post Versions - Admin Review Queue (`GET /api/v1/forum/posts/versions`)](#71-get-all-post-versions---admin-review-queue)
  - [7.2 Get Author's Posted Posts (`GET /api/v1/forum/posts/posted`)](#72-get-authors-posted-posts)
  - [7.3 Get Versions by Post ID (`GET /api/v1/forum/posts/versions/{postId}`)](#73-get-versions-by-post-id)
  - [7.4 Update Post Version Status - Admin (`PUT /api/v1/forum/posts/versions`)](#74-update-post-version-status---admin)
  - [7.5 Delete Post Version (`DELETE /api/v1/forum/posts/versions`)](#75-delete-post-version)
  - [7.6 Get Published Post Details (`GET /api/v1/forum/posts`)](#76-get-published-post-details)
  - [7.7 Create Post (`POST /api/v1/forum/posts`)](#77-create-post)
  - [7.8 Update Post (`PUT /api/v1/forum/posts`)](#78-update-post)
  - [7.9 Delete Post (`DELETE /api/v1/forum/posts`)](#79-delete-post)
  - [7.10 Get Saved Posts (`GET /api/v1/forum/posts/saved`)](#710-get-saved-posts)
  - [7.11 Save / Bookmark Post (`POST /api/v1/forum/posts/{postId}/save`)](#711-save--bookmark-post)
  - [7.12 Unsave Post (`DELETE /api/v1/forum/posts/{postId}/save`)](#712-unsave-post)
  - [7.13 Get Post Feed (`GET /api/v1/forum/posts/feed`)](#713-get-post-feed)
  - [7.14 Search Posts - Elasticsearch (`GET /api/v1/forum/posts/search`)](#714-search-posts---elasticsearch)
  - [7.15 Get Related Posts (`GET /api/v1/forum/posts/{postId}/related`)](#715-get-related-posts)
  - [7.16 Get Post Root Comments (`GET /api/v1/forum/comments`)](#716-get-post-root-comments)
  - [7.17 Get Post Comment Replies (`GET /api/v1/forum/comments/replies`)](#717-get-post-comment-replies)
  - [7.18 Create Comment or Reply (`POST /api/v1/forum/comments`)](#718-create-comment-or-reply)
  - [7.19 Delete Comment (`DELETE /api/v1/forum/comments`)](#719-delete-comment)
- [8. Metric Module](#8-metric-module)
  - [8.1 Dashboard Overview (`GET /api/metrics/dashboard`)](#81-dashboard-overview)
  - [8.2 Users Growth (`GET /api/metrics/users-growth`)](#82-users-growth)
  - [8.3 Courses Growth (`GET /api/metrics/courses-growth`)](#83-courses-growth)
  - [8.4 Revenue Growth (`GET /api/metrics/revenue-growth`)](#84-revenue-growth)
  - [8.5 Activity Metrics (`GET /api/metrics/activity`)](#85-activity-metrics)
  - [8.6 Top Courses (`GET /api/metrics/top-courses`)](#86-top-courses)
  - [8.7 Top Users & Contributors (`GET /api/metrics/top-users`)](#87-top-users--contributors)
- [9. Tracking Module](#9-tracking-module)
  - [9.1 Get Submission Tracking Logs (`GET /api/v1/assignments/submissions/tracking`)](#91-get-submission-tracking-logs)
- [10. Chat & AI Consultation Module](#10-chat--ai-consultation-module)
  - [10.1 Send Consultation Message (`POST /api/chat/messages`)](#101-send-consultation-message)
  - [10.2 Get User Conversations List (`GET /api/chat/conversations`)](#102-get-user-conversations-list)
  - [10.3 Get Message Details in Conversation (`GET /api/chat/conversations/{id}/messages`)](#103-get-message-details-in-conversation)
  - [10.4 Delete Conversation (`DELETE /api/chat/conversations/{id}`)](#104-delete-conversation)
- [11. Quiz & Examination Module](#11-quiz--examination-module)
  - **11.1 Quiz Lifecycle & Configurations**
    - [11.1.1 Create Quiz (`POST /api/v1/quizzes`)](#1111-create-quiz)
    - [11.1.2 Duplicate Quiz (`POST /api/v1/quizzes/{id}/duplicate`)](#1112-duplicate-quiz)
    - [11.1.3 Update Quiz (`PUT /api/v1/quizzes/{id}`)](#1113-update-quiz)
    - [11.1.4 Get Quiz Details (`GET /api/v1/quizzes/{id}`)](#1114-get-quiz-details)
    - [11.1.5 Get Quizzes by Course (`GET /api/v1/quizzes/course/{courseId}`)](#1115-get-quizzes-by-course)
    - [11.1.6 Add / Update Quiz Type Config (`POST /api/v1/quizzes/{id}/type-configs`)](#1116-add--update-quiz-type-config)
    - [11.1.7 Get Quiz Type Configs (`GET /api/v1/quizzes/{id}/type-configs`)](#1117-get-quiz-type-configs)
    - [11.1.8 Delete Quiz Type Config (`DELETE /api/v1/quizzes/{id}/type-configs/{typeConfigId}`)](#1118-delete-quiz-type-config)
    - [11.1.9 Submit Quiz for Review (`POST /api/v1/quizzes/{id}/submit`)](#1119-submit-quiz-for-review)
    - [11.1.10 List Quizzes for Admin Review (`GET /api/v1/quizzes`)](#11110-list-quizzes-for-admin-review)
    - [11.1.11 Review Quiz - Admin (`POST /api/v1/quizzes/{id}/review`)](#11111-review-quiz---admin)
  - **11.2 Question & Option Management**
    - [11.2.1 Add Question to Quiz (`POST /api/v1/quizzes/{id}/questions`)](#1121-add-question-to-quiz)
    - [11.2.2 Update Question in Quiz (`PUT /api/v1/quizzes/{id}/questions/{questionId}`)](#1122-update-question-in-quiz)
    - [11.2.3 Delete Question from Quiz (`DELETE /api/v1/quizzes/{id}/questions/{questionId}`)](#1123-delete-question-from-quiz)
  - **11.3 Quiz Assignment Management**
    - [11.3.1 Create Quiz Assignment (`POST /api/v1/quiz-assignments`)](#1131-create-quiz-assignment)
    - [11.3.2 Delete Quiz Assignment (`DELETE /api/v1/quiz-assignments/{id}`)](#1132-delete-quiz-assignment)
    - [11.3.3 Get Assignments by Quiz (`GET /api/v1/quiz-assignments/quiz/{quizId}`)](#1133-get-assignments-by-quiz)
    - [11.3.4 Get Quiz Assignment Details (`GET /api/v1/quiz-assignments/{id}`)](#1134-get-quiz-assignment-details)
    - [11.3.5 Get Quiz Assignments by Course - Student (`GET /api/v1/quiz-assignments`)](#1135-get-quiz-assignments-by-course---student)
  - **11.4 Taking Quiz & Attempts**
    - [11.4.1 Start / Resume Quiz Attempt (`POST /api/v1/quiz-assignments/{assignmentId}/start`)](#1141-start--resume-quiz-attempt)
    - [11.4.2 Get My Attempts History (`GET /api/v1/quiz-assignments/{assignmentId}/my-attempts`)](#1142-get-my-attempts-history)
    - [11.4.3 Autosave Quiz Answer (`POST /api/v1/quiz-attempts/{attemptId}/autosave`)](#1143-autosave-quiz-answer)
    - [11.4.4 Submit Quiz Attempt (`POST /api/v1/quiz-attempts/{attemptId}/submit`)](#1144-submit-quiz-attempt)
    - [11.4.5 Send Heartbeat (`POST /api/v1/quiz-attempts/{attemptId}/heartbeat`)](#1145-send-heartbeat)
    - [11.4.6 Get Attempt Session State (`GET /api/v1/quiz-attempts/{attemptId}`)](#1146-get-attempt-session-state)
    - [11.4.7 Get Attempt Full Review (`GET /api/v1/quiz-attempts/{attemptId}/review`)](#1147-get-attempt-full-review)
    - [11.4.8 Get Attempt Result Summary (`GET /api/v1/quiz-attempts/{attemptId}/result`)](#1148-get-attempt-result-summary)
  - **11.5 Essay Grading**
    - [11.5.1 Get Essay Submissions for Quiz (`GET /api/v1/quiz-gradings/{quizId}/essays`)](#1151-get-essay-submissions-for-quiz)
    - [11.5.2 Grade Essay Question (`POST /api/v1/quiz-gradings/attempts/{attemptId}/questions/{questionId}`)](#1152-grade-essay-question)
  - **11.6 AI Quiz Generation & Documents**
    - [11.6.1 Generate Quiz from Document (`POST /api/v1/quizzes/generate-from-document`)](#1161-generate-quiz-from-document)
    - [11.6.2 Generate Quiz from File Upload (`POST /api/v1/quizzes/generate-from-file`)](#1162-generate-quiz-from-file-upload)
    - [11.6.3 Get Quiz Generation Job Status (`GET /api/v1/quizzes/generation-jobs/{jobId}`)](#1163-get-quiz-generation-job-status)
    - [11.6.4 Get Question Source Traceability (`GET /api/v1/quizzes/generation-jobs/{jobId}/traceability/{questionId}`)](#1164-get-question-source-traceability)
    - [11.6.5 Search Document Library (`GET /api/v1/documents/library`)](#1165-search-document-library)
    - [11.6.6 Upload Document to Global Library - Admin (`POST /api/v1/documents/library/upload`)](#1166-upload-document-to-global-library---admin)
    - [11.6.7 Delete Document from Library - Admin (`DELETE /api/v1/documents/library/{id}`)](#1167-delete-document-from-library---admin)
    - [11.6.8 Get Document Upload Audit Logs (`GET /api/v1/documents/audits/course/{courseId}`)](#1168-get-document-upload-audit-logs)
- [12. Notification & FCM Module](#12-notification--fcm-module)
  - **12.1 Personal & Feed Notifications**
    - [12.1.1 Get Unified Notification Feed (`GET /api/v1/notifications`)](#1211-get-unified-notification-feed)
    - [12.1.2 Get Unread Notification Counts (`GET /api/v1/notifications/unread-count`)](#1212-get-unread-notification-counts)
    - [12.1.3 Mark Notification(s) as Read (`PUT /api/v1/notifications/read`)](#1213-mark-notifications-as-read)
    - [12.1.4 Delete Personal Notification (`DELETE /api/v1/notifications/{id}`)](#1214-delete-personal-notification)
  - **12.2 Group Notifications (Admin)**
    - [12.2.1 Create Group Notification (`POST /api/v1/notifications/group`)](#1221-create-group-notification)
    - [12.2.2 Delete Group Notification (`DELETE /api/v1/notifications/group/{id}`)](#1222-delete-group-notification)
    - [12.2.3 Get All Group Notifications (`GET /api/v1/notifications/group/all`)](#1223-get-all-group-notifications)
  - **12.3 FCM Device Tokens**
    - [12.3.1 Register FCM Device Token (`POST /api/v1/notifications/device-tokens`)](#1231-register-fcm-device-token)
    - [12.3.2 Unregister FCM Device Token (`DELETE /api/v1/notifications/device-tokens`)](#1232-unregister-fcm-device-token)

---

## General Information

### Base URL

```http
http://localhost:9000
```

### Response Format Envelope (`ApiResponse`)

All REST endpoints wrap response data inside the standard `ApiResponse` envelope:

#### Success Response (`HTTP 200 OK`)

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": { ... },
  "timestamp": 1721234567890
}
```

#### Error Response (`HTTP 200 OK` / Global Exception Handling)

```json
{
  "success": false,
  "status": "BAD_REQUEST",
  "message": "Invalid input data.",
  "data": null,
  "timestamp": 1721234567890
}
```

#### Envelope Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | `boolean` | `true` if business request succeeded, `false` otherwise |
| `status` | `HttpStatus` | Spring `HttpStatus` representation (e.g. `OK`, `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`) |
| `message` | `String` | Human-readable explanation or error message |
| `data` | `Object` / `null` | Response payload DTO or primitive value; `null` on errors |
| `timestamp` | `Long` | Millisecond epoch timestamp of response generation |

---

### Pagination Envelope (`CustomPaging<T>`)

Endpoints supporting paginated queries (both offset-based and cursor-based) return the `CustomPaging<T>` envelope inside `ApiResponse.data`:

```json
{
  "contents": [ ... ],
  "totalPages": 5,
  "pageSize": 10,
  "totalElements": 48,
  "currentPage": 0,
  "nextCursor": "ZXlKMGVTSTZJakkw..."
}
```

#### Pagination Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `contents` | `List<T>` / `Collection<T>` | List of items for current slice/page |
| `totalPages` | `long` | Total number of pages available (0 if cursor-only) |
| `pageSize` | `long` | Page size limit configured for this request |
| `totalElements` | `long` | Total item count across entire dataset (0 if cursor-only) |
| `currentPage` | `long` | Current 0-based page number (0 if cursor-only) |
| `nextCursor` | `String` / `null` | URL-safe Base64-encoded cursor token for fetching next page (`null` if no more items) |

---

### Authentication & Authorization

- **Scheme:** OAuth2 Bearer Token (JWT)
- **Header Format:** `Authorization: Bearer <access_token>`
- **Token Endpoint:** `POST /oauth2/token` using custom Password Grant (`grant_type=password`, `username`, `password`)

---

### System Roles

| Role Name | Authority String | Description |
| :--- | :--- | :--- |
| `ADMIN` | `ADMIN` | Full administrative control: user management, course approvals, categories, discounts, global library, analytics |
| `LECTURER` | `LECTURER` | Instructor permissions: managing assigned courses, lectures, materials, assignments, student grading, quiz creation |
| `STUDENT` | `STUDENT` | Learner permissions: course enrollment, shopping cart, order checkout, payments, quiz attempts, assignment submissions, forum posting |

---

### Common HTTP & Business Error Statuses

| HTTP Status | `ApiResponse.status` | Trigger Scenarios |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Request successfully processed |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Bean Validation failure, missing required parameter/body, type mismatch, illegal business arguments |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Expired/missing Bearer token, invalid password grant credentials |
| `403 FORBIDDEN` | `FORBIDDEN` | Caller lacks required role or lacks resource ownership |
| `404 NOT_FOUND` | `NOT_FOUND` | Referenced entity ID (course, lecture, user, quiz, etc.) does not exist |
| `405 METHOD_NOT_ALLOWED` | `METHOD_NOT_ALLOWED` | Unsupported HTTP verb for targeted URL |
| `408 REQUEST_TIMEOUT` | `REQUEST_TIMEOUT` | Operation or session has timed out |
| `409 CONFLICT` | `CONFLICT` | Database unique constraint or duplicate key violation |
| `500 INTERNAL_SERVER_ERROR` | `INTERNAL_SERVER_ERROR` | Unhandled runtime exception, database connection failure, or external provider error |

---
## 1. User Module

Handles user registration, authentication, user profiles, credential updates, and avatar uploads.

---

### 1.1 User Registration

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/users/register` |
| **Purpose** | Register a new student account |
| **Authentication** | Public (`permitAll()`) |
| **Permission** | None required |

#### Request Body

**DTO:** `RegisterUser` (`application/json`)

| Field | Type | Required | Default | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `username` | `String` | ✅ Required | — | `@NotBlank(message = "Username is required")`<br>`@Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")` | Unique account username |
| `email` | `String` | ✅ Required | — | `@NotBlank(message = "Email is required")`<br>`@Email(message = "Email should be valid")` | Unique email address |
| `password` | `String` | ✅ Required | — | `@NotBlank(message = "Password is required")`<br>`@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character")` | Account password |
| `fullName` | `String` | ✅ Required | — | `@NotBlank(message = "Full name is required")` | Display full name |
| `role` | `RoleEnum` | ❌ Optional | `STUDENT` | Value is automatically overridden to `RoleEnum.STUDENT` during self-registration | Account role |

#### Example Request

```http
POST /api/v1/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "Password123@",
  "fullName": "John Doe"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Register successful. Please login to continue."`)

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "Register successful. Please login to continue.",
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Registration completed successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation failed (invalid format or missing required fields) |
| `409 CONFLICT` | `CONFLICT` | Username or email already registered |

---

### 1.2 Batch Create Users

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/users/batch-users` |
| **Purpose** | Batch create multiple user accounts with custom roles |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**DTO:** `List<RegisterUser>` (`application/json`)

| Field | Type | Required | Default | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `[].username` | `String` | ✅ Required | — | `@NotBlank`, `@Pattern(regexp = "^[a-zA-Z0-9_]+$")` | Unique account username |
| `[].email` | `String` | ✅ Required | — | `@NotBlank`, `@Email` | Unique email address |
| `[].password` | `String` | ✅ Required | — | `@NotBlank`, `@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")` | Account password |
| `[].fullName` | `String` | ✅ Required | — | `@NotBlank` | Display full name |
| `[].role` | `RoleEnum` | ❌ Optional | `STUDENT` | Enum: `ADMIN`, `LECTURER`, `STUDENT` | Target account role |

#### Example Request

```http
POST /api/v1/users/batch-users
Authorization: Bearer <admin_token>
Content-Type: application/json

[
  {
    "username": "lecturer_alice",
    "email": "alice@devedu.com",
    "password": "SecurePass123!",
    "fullName": "Alice Johnson",
    "role": "LECTURER"
  },
  {
    "username": "student_bob",
    "email": "bob@example.com",
    "password": "SecurePass123!",
    "fullName": "Bob Smith",
    "role": "STUDENT"
  }
]
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Create users successful."`)

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "Create users successful.",
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Batch creation succeeded |
| `400 BAD_REQUEST` | `BAD_REQUEST` | One or more items in the list failed validation |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated / Invalid token |
| `403 FORBIDDEN` | `FORBIDDEN` | Caller is not an `ADMIN` |
| `409 CONFLICT` | `CONFLICT` | One or more usernames/emails already exist |

---

### 1.3 Get User List

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/users` |
| **Purpose** | Paginated search and filtering of users by role and keyword |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page` | `int` | ✅ Required | — | `≥ 0` | 0-based page index |
| `role` | `RoleEnum` | ✅ Required | — | `ADMIN`, `LECTURER`, `STUDENT` | Filter by user role |
| `keyword` | `String` | ✅ Required | — | Non-null | Search term matching username, email, or full name |

#### Example Request

```http
GET /api/v1/users?page=0&role=STUDENT&keyword=john
Authorization: Bearer <admin_token>
```

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<UserInfoResponse>`

**DTO:** `UserInfoResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | User's unique identifier |
| `username` | `String` | No | Account username |
| `email` | `String` | No | Registered email address |
| `fullName` | `String` | No | Display full name |
| `avatarUrl` | `String` | Yes | Public URL of user avatar image |
| `courseCount` | `Integer` | Yes | Total courses enrolled (for student) or assigned (for lecturer) |
| `postedPosts` | `Integer` | Yes | Total forum posts published |
| `role` | `RoleEnum` | No | Assigned role (`ADMIN`, `LECTURER`, `STUDENT`) |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb1533573d1",
        "username": "john_doe",
        "email": "john.doe@example.com",
        "fullName": "John Doe",
        "avatarUrl": "https://pub-r2.dev-edu.com/avatars/019ebac1.png",
        "courseCount": 3,
        "postedPosts": 5,
        "role": "STUDENT"
      }
    ],
    "totalPages": 1,
    "pageSize": 15,
    "totalElements": 1,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Users retrieved successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Invalid parameter types or missing required query params |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |

---

### 1.4 Change Password

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/users/change-password` |
| **Purpose** | Change password for the current logged-in user |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

#### Request Body

**DTO:** `Map<String, String>` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `oldPassword` | `String` | ✅ Required | Must not be empty; must match current password | Current password |
| `newPassword` | `String` | ✅ Required | Must not be empty; must not match `oldPassword` | New password |

#### Example Request

```http
POST /api/v1/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "OldPassword123@",
  "newPassword": "NewPassword456!"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Change password successful."`)

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "Change password successful.",
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Password changed successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | `oldPassword` / `newPassword` missing, or new password identical to old password |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Invalid or incorrect old password |

---

### 1.5 Update Avatar

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/users/avatar` |
| **Purpose** | Update profile picture using an uploaded S3 object key |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

#### Request Body

**DTO:** `Map<String, String>` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `avatarObjectKey` | `String` | ✅ Required | Must not be blank | Storage object key from S3 upload confirmation |

#### Example Request

```http
PUT /api/v1/users/avatar
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatarObjectKey": "avatars/user-123-avatar.png"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (New public CDN/S3 URL of avatar)

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "https://pub-r2.dev-edu.com/avatars/user-123-avatar.png",
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Avatar updated successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | `avatarObjectKey` missing or blank |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |

---

### 1.6 Set Username for Google Login

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/users/username` |
| **Purpose** | Set unique username for user registered via Google OAuth2 |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `Map<String, String>` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `email` | `String` | ✅ Required | Must match Google account email | User email address |
| `username` | `String` | ✅ Required | Must be unique alphanumeric string | New desired username |

#### Example Request

```http
PUT /api/v1/users/username
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@gmail.com",
  "username": "alex_coder"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Username đã được cập nhật thành công."`)

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "Username đã được cập nhật thành công.",
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Username set successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | `email` or `username` missing |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `409 CONFLICT` | `CONFLICT` | Username already taken |

---

### 1.7 Get Current User Profile

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/me` |
| **Purpose** | Retrieve profile details of the currently authenticated user |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

#### Request Parameters

None.

#### Example Request

```http
GET /api/v1/me
Authorization: Bearer <token>
```

#### Response

**Response Data (`ApiResponse.data`):** `UserInfoResponse`

**DTO:** `UserInfoResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | User's unique identifier |
| `username` | `String` | No | Account username |
| `email` | `String` | No | Registered email address |
| `fullName` | `String` | No | Display full name |
| `avatarUrl` | `String` | Yes | Avatar image URL |
| `courseCount` | `Integer` | Yes | `null` on `/api/v1/me` |
| `postedPosts` | `Integer` | Yes | `null` on `/api/v1/me` |
| `role` | `RoleEnum` | No | Active role (`ADMIN`, `LECTURER`, `STUDENT`) |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573d1",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://pub-r2.dev-edu.com/avatars/user-123.png",
    "courseCount": null,
    "postedPosts": null,
    "role": "STUDENT"
  },
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Profile retrieved successfully |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Invalid or expired token |
| `404 NOT_FOUND` | `NOT_FOUND` | User entity not found |

---
## 2. Course Module

Handles course categories, course catalog browsing, administrative course creation/management, discount campaigns, and student reviews.

---

### 2.1 Get All Categories

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/categories` |
| **Purpose** | Get list of all course categories |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any (Non-ADMIN users are restricted to `ACTIVE` status) |

#### Query Parameters

| Parameter | Type | Required | Default | Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `status` | `ItemStatus` | ❌ Optional | `ACTIVE` | Enum: `ACTIVE`, `DELETED`, `ALL` | Category status filter. Non-ADMIN requests are automatically forced to `ACTIVE`. |

#### Example Request

```http
GET /api/v1/categories?status=ACTIVE
```

#### Response

**Response Data (`ApiResponse.data`):** `List<CategoryResponse>`

**DTO:** `CategoryResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Category unique identifier |
| `name` | `String` | No | Category name |
| `description` | `String` | No | Category summary |
| `thumbnailObjectKey` | `String` | Yes | S3 storage key of thumbnail |
| `thumbnailUrl` | `String` | Yes | Public CDN URL of thumbnail |
| `totalCourses` | `Integer` | No | Total active courses under this category |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    {
      "id": "019ebac1-40fb-7a3f-a81e-5bb1533573a1",
      "name": "Backend Development",
      "description": "Courses covering Java, Spring Boot, microservices, and databases",
      "thumbnailObjectKey": "categories/backend.png",
      "thumbnailUrl": "https://pub-r2.dev-edu.com/categories/backend.png",
      "totalCourses": 12
    }
  ],
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Categories retrieved successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Invalid status enum value |

---

### 2.2 Create Category

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/categories` |
| **Purpose** | Create a new course category |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**DTO:** `CategoryRequest` (`application/json`) — Validation Group: `CreateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ❌ Must be null | `@Null(message = "Category id must be null when creating a new category", groups = {CreateValidation.class})` | ID is generated automatically |
| `name` | `String` | ✅ Required | `@NotBlank(message = "Category name must not be blank", groups = {UpdateValidation.class, CreateValidation.class})` | Unique category name |
| `description` | `String` | ✅ Required | `@NotBlank(message = "Category description must not be blank", groups = {UpdateValidation.class, CreateValidation.class})` | Description text |
| `thumbnailObjectKey` | `String` | ✅ Required | `@NotBlank(message = "Thumbnail must not be blank", groups = {UpdateValidation.class, CreateValidation.class})` | S3 object key |

#### Example Request

```http
POST /api/v1/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Cloud & DevOps",
  "description": "Docker, Kubernetes, AWS, CI/CD pipeline automation",
  "thumbnailObjectKey": "categories/devops.png"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `CategoryResponse`

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573a2",
    "name": "Cloud & DevOps",
    "description": "Docker, Kubernetes, AWS, CI/CD pipeline automation",
    "thumbnailObjectKey": "categories/devops.png",
    "thumbnailUrl": "https://pub-r2.dev-edu.com/categories/devops.png",
    "totalCourses": 0
  },
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Category created successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation error or `id` was provided |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |
| `409 CONFLICT` | `CONFLICT` | Category name already exists |

---

### 2.3 Update Category

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/categories` |
| **Purpose** | Update an existing category |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**DTO:** `CategoryRequest` (`application/json`) — Validation Group: `UpdateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | `@NotNull(message = "Category id must not be null", groups = {UpdateValidation.class})` | Target category ID |
| `name` | `String` | ✅ Required | `@NotBlank(message = "Category name must not be blank", groups = {UpdateValidation.class, CreateValidation.class})` | Category name |
| `description` | `String` | ✅ Required | `@NotBlank(message = "Category description must not be blank", groups = {UpdateValidation.class, CreateValidation.class})` | Description text |
| `thumbnailObjectKey` | `String` | ✅ Required | `@NotBlank(message = "Thumbnail must not be blank", groups = {UpdateValidation.class, CreateValidation.class})` | S3 object key |

#### Example Request

```http
PUT /api/v1/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "019ebac1-40fb-7a3f-a81e-5bb1533573a2",
  "name": "Cloud Computing & DevOps",
  "description": "Docker, Kubernetes, AWS, GCP, CI/CD automation",
  "thumbnailObjectKey": "categories/devops_v2.png"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `CategoryResponse`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Category updated successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation error or missing `id` |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |
| `404 NOT_FOUND` | `NOT_FOUND` | Category ID does not exist |

---

### 2.4 Delete Category

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/categories/{categoryId}` |
| **Purpose** | Soft delete a course category |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `categoryId` | `UUID` | ✅ Required | Target category unique identifier |

#### Example Request

```http
DELETE /api/v1/categories/019ebac1-40fb-7a3f-a81e-5bb1533573a2
Authorization: Bearer <admin_token>
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Category deleted successfully"`)

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Category deleted successfully |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |
| `404 NOT_FOUND` | `NOT_FOUND` | Category ID does not exist |

---

### 2.5 Get Course List

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/courses` |
| **Purpose** | Retrieve cursor-paginated list of courses with optional filtering |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any (ADMIN sees 10 items/page and can filter by status; Non-ADMIN sees 15 items/page and ACTIVE status only) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sortBy` | `String` | ❌ Optional | `null` | Field to sort by |
| `nextCursor` | `String` | ❌ Optional | `null` | Cursor token for next page (URL-safe Base64 encoded) |
| `categoryId` | `UUID` | ❌ Optional | `null` | Filter courses by category ID |
| `keyword` | `String` | ❌ Optional | `null` | Search query matching title or description |
| `status` | `ItemStatus` | ❌ Optional | `ACTIVE` | Filter status (`ACTIVE`, `DELETED`, `ALL`). Non-ADMIN requests are overridden to `ACTIVE`. |

#### Example Request

```http
GET /api/v1/courses?categoryId=019ebac1-40fb-7a3f-a81e-5bb1533573a1&keyword=spring
```

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CourseResponse>`

**DTO:** `CourseResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Course unique identifier |
| `categoryId` | `UUID` | No | Associated category ID |
| `title` | `String` | No | Course title |
| `thumbnailObjectKey` | `String` | Yes | S3 storage key of thumbnail |
| `thumbnailUrl` | `String` | Yes | Public thumbnail URL |
| `description` | `String` | No | Detailed course description |
| `createdAt` | `LocalDateTime` | No | Publication timestamp |
| `originalPrice` | `BigDecimal` | Yes | Base list price |
| `discountedPercentage`| `BigDecimal` | Yes | Active promotional discount percentage |
| `discountedPrice` | `BigDecimal` | Yes | Effective calculated discounted price |
| `validTo` | `LocalDateTime` | Yes | End timestamp of active discount campaign |
| `registered` | `Boolean` | Yes | `true` if current authenticated student is enrolled |
| `avgReview` | `BigDecimal` | Yes | Average rating score (1.0 to 5.0) |
| `totalReview` | `Long` | Yes | Total number of reviews |
| `totalEnrollment` | `Long` | Yes | Total students enrolled |
| `lecturers` | `List<String>` | Yes | Usernames of assigned instructors |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
        "categoryId": "019ebac1-40fb-7a3f-a81e-5bb1533573a1",
        "title": "Spring Boot 3.5 Masterclass",
        "thumbnailObjectKey": "courses/spring_boot.jpg",
        "thumbnailUrl": "https://pub-r2.dev-edu.com/courses/spring_boot.jpg",
        "description": "Master modern Spring Boot, JPA, Kafka, and Microservices.",
        "createdAt": "2026-08-01T10:00:00",
        "originalPrice": 499000.00,
        "discountedPercentage": 20.00,
        "discountedPrice": 399200.00,
        "validTo": "2026-09-01T00:00:00",
        "registered": false,
        "avgReview": 4.85,
        "totalReview": 42,
        "totalEnrollment": 150,
        "lecturers": ["lecturer_alice"]
      }
    ],
    "totalPages": 0,
    "pageSize": 15,
    "totalElements": 0,
    "currentPage": 0,
    "nextCursor": "ZXlKMGVTSTZJakkw..."
  },
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Course list retrieved successfully |

---

### 2.6 Get Featured Courses

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/courses/highlighted` |
| **Purpose** | Get cached list of highlighted / featured courses |
| **Authentication** | Public (`permitAll()`) |
| **Permission** | None required |

#### Request Parameters

None.

#### Example Request

```http
GET /api/v1/courses/highlighted
```

#### Response

**Response Data (`ApiResponse.data`):** `List<CourseResponse>`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Highlighted courses retrieved from Redis cache |

---

### 2.7 Get Course Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/courses/{courseId}/` |
| **Purpose** | Retrieve full details of a specific course |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any (If authenticated, calculates `registered` status) |

> **Note:** The endpoint definition includes a trailing slash: `/api/v1/courses/{courseId}/`.

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Target course unique identifier |

#### Example Request

```http
GET /api/v1/courses/019ebac1-40fb-7a3f-a81e-5bb1533573c1/
Authorization: Bearer <token>
```

#### Response

**Response Data (`ApiResponse.data`):** `CourseResponse`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Course details returned |
| `404 NOT_FOUND` | `NOT_FOUND` | Course ID not found |

---

### 2.8 Create Course

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/courses` |
| **Purpose** | Create a new course and assign instructors |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**DTO:** `CourseRequest` (`application/json`) — Validation Group: `CreateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ❌ Must be null | `@Null(message = "ID must be null", groups = {CreateValidation.class})` | Auto-generated UUIDv7 |
| `categoryId` | `UUID` | ✅ Required | `@NotNull(message = "Category ID cannot be null", groups = {UpdateValidation.class, CreateValidation.class})` | Associated category ID |
| `title` | `String` | ✅ Required | `@Size(max = 255, message = "Title must not exceed 255 characters", groups = {UpdateValidation.class, CreateValidation.class})`<br>`@NotBlank(message = "Title cannot be blank", groups = {UpdateValidation.class, CreateValidation.class})` | Course title |
| `description` | `String` | ✅ Required | `@NotBlank(message = "Description cannot be blank", groups = {UpdateValidation.class, CreateValidation.class})` | Full description |
| `price` | `BigDecimal` | ❌ Optional | `@DecimalMin(value = "0.0", message = "Price must be greater than 0", groups = {UpdateValidation.class, CreateValidation.class})` | Base course price (≥ 0.0) |
| `thumbnailObjectKey` | `String` | ✅ Required | `@NotBlank(message = "Thumbnail object key cannot be blank", groups = {UpdateValidation.class, CreateValidation.class})` | S3 thumbnail object key |
| `lecturerUsernames` | `List<String>` | ✅ Required | `@NotEmpty(message = "At least one lecturer must be assigned to the course", groups = {CreateValidation.class, UpdateValidation.class})`<br>Each item: `@NotBlank` | List of assigned instructor usernames |

#### Example Request

```http
POST /api/v1/courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "categoryId": "019ebac1-40fb-7a3f-a81e-5bb1533573a1",
  "title": "Spring Boot 3.5 Masterclass",
  "description": "Master modern Spring Boot, JPA, Kafka, and Microservices architecture.",
  "price": 499000.00,
  "thumbnailObjectKey": "courses/spring_boot.jpg",
  "lecturerUsernames": ["lecturer_alice"]
}
```

#### Response

**Response Data (`ApiResponse.data`):** `CourseResponse`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Course created successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation error, missing required fields, or non-empty ID |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |
| `404 NOT_FOUND` | `NOT_FOUND` | Category or one of the lecturers does not exist |

---

### 2.9 Update Course

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/courses` |
| **Purpose** | Update course details |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**DTO:** `CourseRequest` (`application/json`) — Validation Group: `UpdateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | `@NotNull(message = "ID cannot be null", groups = {UpdateValidation.class})` | Target course ID |
| `categoryId` | `UUID` | ✅ Required | `@NotNull(...)` | Category ID |
| `title` | `String` | ✅ Required | `@Size(max = 255)`, `@NotBlank` | Course title |
| `description` | `String` | ✅ Required | `@NotBlank` | Course description |
| `price` | `BigDecimal` | ❌ Optional | `@DecimalMin(value = "0.0")` | Base price |
| `thumbnailObjectKey` | `String` | ✅ Required | `@NotBlank` | S3 thumbnail key |
| `lecturerUsernames` | `List<String>` | ✅ Required | `@NotEmpty`, each element `@NotBlank` | Assigned lecturers |

#### Example Request

```http
PUT /api/v1/courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
  "categoryId": "019ebac1-40fb-7a3f-a81e-5bb1533573a1",
  "title": "Spring Boot 3.5 Masterclass (Updated Edition)",
  "description": "Comprehensive guide to Spring Boot 3.5, Virtual Threads, and AI.",
  "price": 599000.00,
  "thumbnailObjectKey": "courses/spring_boot_v2.jpg",
  "lecturerUsernames": ["lecturer_alice", "lecturer_bob"]
}
```

#### Response

**Response Data (`ApiResponse.data`):** `CourseResponse`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Course updated successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation error or missing `id` |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |
| `404 NOT_FOUND` | `NOT_FOUND` | Course, category, or lecturer not found |

---

### 2.10 Delete Course

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/courses` |
| **Purpose** | Soft delete a course |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Target course unique identifier |

#### Example Request

```http
DELETE /api/v1/courses?courseId=019ebac1-40fb-7a3f-a81e-5bb1533573c1
Authorization: Bearer <admin_token>
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Course deleted successfully"`)

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Course soft deleted successfully |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |
| `404 NOT_FOUND` | `NOT_FOUND` | Course not found |

---

### 2.11 Get Discount List

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/course-discounts` |
| **Purpose** | Get course discounts (list for specific course or paginated for all) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ❌ Optional | If provided, returns unpaginated `List<CourseDiscountResponse>` for this course |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor (used when `courseId` is omitted) |

#### Response

- When `courseId != null`: **`ApiResponse.data`:** `List<CourseDiscountResponse>`
- When `courseId == null`: **`ApiResponse.data`:** `CustomPaging<CourseDiscountResponse>`

**DTO:** `CourseDiscountResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Discount record ID |
| `courseId` | `UUID` | Yes | Course ID (`null` if applies globally) |
| `originalPrice` | `BigDecimal` | Yes | Original course price |
| `courseTitle` | `String` | Yes | Course title |
| `courseDescription` | `String` | Yes | Course description |
| `courseThumbnailUrl`| `String` | Yes | Course thumbnail URL |
| `discountDescription`| `String` | No | Promotion campaign name / description |
| `discountPercentage` | `BigDecimal` | No | Discount rate (e.g. `20.00`) |
| `validFrom` | `LocalDateTime` | No | Campaign start date |
| `validTo` | `LocalDateTime` | No | Campaign end date |
| `createdBy` | `String` | No | Creator username |
| `createdAt` | `LocalDateTime` | No | Creation timestamp |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb1533573d8",
        "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
        "originalPrice": 499000.00,
        "courseTitle": "Spring Boot 3.5 Masterclass",
        "courseDescription": "Master modern Spring Boot...",
        "courseThumbnailUrl": "https://pub-r2.dev-edu.com/courses/spring_boot.jpg",
        "discountDescription": "Early Bird Promo",
        "discountPercentage": 20.00,
        "validFrom": "2026-08-01T00:00:00",
        "validTo": "2026-09-01T00:00:00",
        "createdBy": "admin",
        "createdAt": "2026-08-01T08:00:00"
      }
    ],
    "totalPages": 0,
    "pageSize": 10,
    "totalElements": 0,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

---

### 2.12 Create Discount

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/course-discounts` |
| **Purpose** | Schedule a promotional discount for a specific course or globally |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**DTO:** `CourseDiscountRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ❌ Optional | Nullable. If null, applies discount globally to all courses | Target course ID |
| `description` | `String` | ✅ Required | `@NotBlank(message = "Description is required")` | Promotion description |
| `discountPercentage` | `BigDecimal` | ✅ Required | `@NotNull(message = "Discount value is required")`<br>`@DecimalMin(value = "0.01", message = "Discount value must be greater than 0")`<br>`@DecimalMax(value = "100.00", message = "Discount value cannot exceed 100")` | Discount rate (0.01 – 100.00%) |
| `validFrom` | `LocalDate` | ✅ Required | `@NotNull(message = "Valid from date is required")`<br>`@FutureOrPresent(message = "Valid from date cannot be in the past")` | Campaign start date |
| `validTo` | `LocalDate` | ✅ Required | `@NotNull(message = "Valid to date is required")`<br>`@FutureOrPresent(message = "Valid to date cannot be in the past")` | Campaign end date |

#### Example Request

```http
POST /api/v1/course-discounts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
  "description": "Flash Sale Weekend",
  "discountPercentage": 25.00,
  "validFrom": "2026-09-01",
  "validTo": "2026-09-05"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `CourseDiscountResponse`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Discount created successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Dates in the past, discount outside 0.01–100, or invalid payload |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `ADMIN` authority |

---

### 2.13 Delete Discount

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/course-discounts` |
| **Purpose** | Cancel and remove a discount schedule |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `discountId` | `UUID` | ✅ Required | Target discount unique identifier |

#### Example Request

```http
DELETE /api/v1/course-discounts?discountId=019ebac1-40fb-7a3f-a81e-5bb1533573d8
Authorization: Bearer <admin_token>
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Discount deleted successfully"`)

---

### 2.14 Get Course Reviews

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/courses/reviews` |
| **Purpose** | Get cursor-paginated reviews for a specific course |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Target course ID |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<ReviewResponse>`

**DTO:** `ReviewResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Review unique identifier |
| `comment` | `String` | No | Review text content |
| `rating` | `Integer` | No | Star rating score (1 to 5) |
| `username` | `String` | No | Reviewer's username |
| `fullName` | `String` | No | Reviewer's display name |
| `avatarUrl` | `String` | Yes | Reviewer's avatar URL |
| `createdAt` | `LocalDateTime` | No | Review creation timestamp |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb1533573f1",
        "comment": "Excellent course! Highly practical exercises.",
        "rating": 5,
        "username": "student_bob",
        "fullName": "Bob Smith",
        "avatarUrl": "https://pub-r2.dev-edu.com/avatars/bob.png",
        "createdAt": "2026-08-15T14:30:00"
      }
    ],
    "totalPages": 0,
    "pageSize": 10,
    "totalElements": 0,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

---

### 2.15 Get My Review

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/courses/reviews/me` |
| **Purpose** | Get the current student's review for a course |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Target course ID |

#### Response

**Response Data (`ApiResponse.data`):** `ReviewResponse` (or `null` if user has not submitted a review yet)

---

### 2.16 Create Review

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/courses/reviews` |
| **Purpose** | Submit a rating and review for an enrolled course |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Request Body

**DTO:** `ReviewRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | `@NotNull(message = "Course ID cannot be null")` | Target course ID |
| `content` | `String` | ✅ Required | `@NotBlank(message = "Review content cannot be blank")` | Review text |
| `rating` | `int` | ✅ Required | `@Min(value = 1, message = "Rating must be at least 1")`<br>`@Min(value = 5, message = "Rating must be at most 5")` *(⚠️ Implementation constraint note: `@Min(5)` is configured in source code)* | Star rating value |

#### Example Request

```http
POST /api/v1/courses/reviews
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
  "content": "Very well organized and clear explanations.",
  "rating": 5
}
```

#### Response

**Response Data (`ApiResponse.data`):** `ReviewResponse`

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Review posted successfully |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation error |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `STUDENT` authority or user is not enrolled in course |

---

### 2.17 Delete Review

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/courses/reviews` |
| **Purpose** | Delete a review (Student deletes own review; ADMIN can delete any review) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Author ownership or `ADMIN` role checked in service layer) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `reviewId` | `UUID` | ✅ Required | Target review ID |

#### Example Request

```http
DELETE /api/v1/courses/reviews?reviewId=019ebac1-40fb-7a3f-a81e-5bb1533573f1
Authorization: Bearer <token>
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Review deleted successfully."`)

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Review deleted successfully |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | User is neither the review author nor an ADMIN |
| `404 NOT_FOUND` | `NOT_FOUND` | Review ID not found |

---
## 3. Enrollment & Payment Module

Handles shopping cart operations, order checkout, VNPay payment gateway transactions, enrollment status, and student rosters.

---

### 3.1 Add Course to Cart

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/cart/items/courses` |
| **Purpose** | Add a course to the student's shopping cart |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Request Body

**Payload:** `Map<String, String>` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `courseId` | `String` (UUID format) | ✅ Required | Must be a valid UUID string; must not be blank | Target course unique identifier |

#### Example Request

```http
POST /api/v1/cart/items/courses
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Course added to cart successfully."`)

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Course added to cart |
| `400 BAD_REQUEST` | `BAD_REQUEST` | `courseId` is missing, invalid UUID format, or course already enrolled |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |
| `403 FORBIDDEN` | `FORBIDDEN` | Requires `STUDENT` authority |
| `404 NOT_FOUND` | `NOT_FOUND` | Course ID not found |

---

### 3.2 Remove Course from Cart

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/cart/items/courses` |
| **Purpose** | Remove a course from the student's cart |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Course unique identifier to remove |

#### Example Request

```http
DELETE /api/v1/cart/items/courses?courseId=019ebac1-40fb-7a3f-a81e-5bb1533573c1
Authorization: Bearer <student_token>
```

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Course removed from cart successfully."`)

---

### 3.3 Get Cart List

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/cart/items/courses` |
| **Purpose** | Get cursor-paginated list of courses currently in the student's cart |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CourseItemDetailResponse>`

**DTO:** `CourseItemDetailResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Cart item / Order item record identifier |
| `courseId` | `UUID` | No | Course unique identifier |
| `title` | `String` | No | Course title |
| `thumbnailUrl` | `String` | Yes | Course thumbnail URL |
| `description` | `String` | No | Course summary description |
| `timestamp` | `LocalDateTime` | No | Added to cart timestamp |
| `status` | `PaymentStatus` | Yes | Payment status (`null` in cart or `PENDING`) |
| `originalPrice` | `BigDecimal` | Yes | Course original price |
| `discountedPrice` | `BigDecimal` | Yes | Price after applicable active discount |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb153357301",
        "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
        "title": "Spring Boot 3.5 Masterclass",
        "thumbnailUrl": "https://pub-r2.dev-edu.com/courses/spring_boot.jpg",
        "description": "Master modern Spring Boot...",
        "timestamp": "2026-08-20T09:00:00",
        "status": null,
        "originalPrice": 499000.00,
        "discountedPrice": 399200.00
      }
    ],
    "totalPages": 0,
    "pageSize": 10,
    "totalElements": 0,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

---

### 3.4 Get Cart List - Order Alias

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/orders/items/courses` |
| **Purpose** | Alternative route to retrieve current student's shopping cart items |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

> Behaves identically to `GET /api/v1/cart/items/courses` (documented in [Section 3.3](#33-get-cart-list)).

---

### 3.5 Get Enrolled Courses

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/enrollments` |
| **Purpose** | Get cursor-paginated list of courses purchased/enrolled by the current student |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CourseItemDetailResponse>`

---

### 3.6 Get Assigned Courses - Lecturer

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/enrollments/assigned-courses` |
| **Purpose** | Get courses assigned to the current instructor |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER` (`@PreAuthorize("hasAuthority('LECTURER')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |
| `keyword` | `String` | ❌ Optional | Search term matching course title |
| `categoryId` | `UUID` | ❌ Optional | Filter by category ID |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CourseItemDetailResponse>`

---

### 3.7 Get Enrolled Students List

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/enrollments/enrolled-users` |
| **Purpose** | Get student roster enrolled in a specified course |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Target course ID |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<EnrollmentUserResponse>`

**DTO:** `EnrollmentUserResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Enrollment record ID |
| `username` | `String` | No | Student username |
| `fullName` | `String` | No | Student full name |
| `avatarUrl` | `String` | Yes | Student avatar URL |
| `enrolledAt` | `LocalDateTime` | No | Enrollment completion timestamp |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb153357311",
        "username": "student_bob",
        "fullName": "Bob Smith",
        "avatarUrl": "https://pub-r2.dev-edu.com/avatars/bob.png",
        "enrolledAt": "2026-08-10T11:20:00"
      }
    ],
    "totalPages": 0,
    "pageSize": 10,
    "totalElements": 0,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

---

### 3.8 Checkout Order

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/orders/checkout` |
| **Purpose** | Create a pending order from cart items with calculated price totals |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Request Body

**DTO:** `CheckoutRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `entityIds` | `List<UUID>` | ✅ Required | `@NotEmpty(message = "Entity IDs cannot be empty")`<br>Each element: `@NotNull(message = "Entity ID cannot be null")` | List of Course IDs or Subscription IDs to purchase |
| `entityType` | `PurchaseEntityType` | ✅ Required | `@NotNull(message = "Entity type is required")`<br>Enum: `COURSE`, `SUBSCRIPTION` | Type of entity purchased |

#### Example Request

```http
POST /api/v1/orders/checkout
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "entityIds": ["019ebac1-40fb-7a3f-a81e-5bb1533573c1"],
  "entityType": "COURSE"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `CheckoutDetailResponse`

**DTO:** `CheckoutDetailResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `orderId` | `UUID` | No | Generated pending order ID |
| `totalAmount` | `BigDecimal` | No | Calculated total amount payable after discounts |
| `entityType` | `PurchaseEntityType` | No | `COURSE` or `SUBSCRIPTION` |
| `items` | `List<CourseItemDetailResponse>` | No | List of items included in this order |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "orderId": "019ebac1-40fb-7a3f-a81e-5bb153357322",
    "totalAmount": 399200.00,
    "entityType": "COURSE",
    "items": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb153357323",
        "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
        "title": "Spring Boot 3.5 Masterclass",
        "thumbnailUrl": "https://pub-r2.dev-edu.com/courses/spring_boot.jpg",
        "description": "Master modern Spring Boot...",
        "timestamp": "2026-08-25T10:00:00",
        "status": "PENDING",
        "originalPrice": 499000.00,
        "discountedPrice": 399200.00
      }
    ]
  },
  "timestamp": 1721234567890
}
```

#### Response Status

| HTTP Status | `ApiResponse.status` | Description |
| :--- | :--- | :--- |
| `200 OK` | `OK` | Order created in `PENDING` state |
| `400 BAD_REQUEST` | `BAD_REQUEST` | Validation failed or course already owned |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` | Unauthenticated |

---

### 3.9 Get Order Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/orders` |
| **Purpose** | Retrieve details and item breakdown for an order |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orderId` | `UUID` | ✅ Required | Target order ID |

#### Response

**Response Data (`ApiResponse.data`):** `CheckoutDetailResponse`

---

### 3.10 Get Order History

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/orders/history` |
| **Purpose** | Get past completed, failed, or cancelled orders for current student |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orderStatus` | `PaymentStatus` | ✅ Required | Status filter: `COMPLETED`, `FAILED`, `CANCELLED` *(Note: `PENDING` is strictly prohibited and returns 400)* |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<OrderDetailResponse>`

**DTO:** `OrderDetailResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Order ID |
| `totalAmount` | `BigDecimal` | No | Final paid amount |
| `status` | `PaymentStatus` | No | Order status (`COMPLETED`, `FAILED`, `CANCELLED`) |
| `createdAt` | `LocalDateTime` | No | Order creation date |
| `items` | `List<CourseItemDetailResponse>` | No | Line items |

---

### 3.11 Cancel Order

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/orders/cancel` |
| **Purpose** | Cancel an unpaid pending order |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orderId` | `UUID` | ✅ Required | Order ID to cancel |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Order has been cancelled"`)

---

### 3.12 Purchase / Create Payment Session

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/enrollments` |
| **Purpose** | Initiate payment transaction with gateway provider and generate redirect URL |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Request Body

**DTO:** `PaymentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `orderId` | `UUID` | ✅ Required | `@NotNull(message = "Order is required")` | Pending order ID |
| `paymentMethod` | `PaymentMethod` | ✅ Required | `@NotNull(message = "Payment method is required")`<br>Enum: `VNPAY`, `MOMO`, `ZALOPAY`, `PAYPAL`, `STRIPE` | Chosen payment gateway |
| `ipAddress` | `String` | ❌ Automatic | Handled automatically by controller via `X-FORWARDED-FOR` or `request.getRemoteAddr()` | Client IP |

#### Example Request

```http
POST /api/v1/enrollments
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "orderId": "019ebac1-40fb-7a3f-a81e-5bb153357322",
  "paymentMethod": "VNPAY"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `PaymentInfoResponse`

**DTO:** `PaymentInfoResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `paymentId` | `UUID` | No | Generated payment transaction ID |
| `orderId` | `UUID` | No | Associated order ID |
| `entityType` | `PurchaseEntityType` | No | `COURSE` or `SUBSCRIPTION` |
| `paymentUrl` | `String` | No | URL to redirect client to payment gateway |
| `totalAmount` | `BigDecimal` | No | Transaction charge amount |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "paymentId": "019ebac1-40fb-7a3f-a81e-5bb153357333",
    "orderId": "019ebac1-40fb-7a3f-a81e-5bb153357322",
    "entityType": "COURSE",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39920000&vnp_Command=pay...",
    "totalAmount": 399200.00
  },
  "timestamp": 1721234567890
}
```

---

### 3.13 VNPay Return Callback

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/enrollments/vnpay-return` |
| **Purpose** | Process return redirect callback from VNPay after student finishes payment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters (From VNPay)

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vnp_TxnRef` | `String` | ✅ Required | VNPay payment session reference code |
| `vnp_ResponseCode`| `String` | ✅ Required | Gateway response code (`00` = Success) |

#### Response

**Response Data (`ApiResponse.data`):** `Map<String, String>` (`{"message": "Payment return processed successfully."}`)

---

### 3.14 Cancel Payment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/enrollments/cancel` |
| **Purpose** | Cancel an active pending payment session |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `paymentId` | `UUID` | ✅ Required | Payment transaction ID to cancel |

#### Response

**Response Data (`ApiResponse.data`):** `Map<String, String>` (`{"message": "Payment cancelled successfully."}`)

---
## 4. Lecture Module

Handles video lectures, learning progress tracking with segment-based analytics, lecture attachments/materials, and lecture-specific discussion comments.

---

### 4.1 Get Lectures by Course

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/lectures` |
| **Purpose** | Get ordered list of all lectures in a course |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any (Completed status calculated if authenticated student) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Course unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `List<LectureResponse>`

**DTO:** `LectureResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Lecture unique identifier |
| `title` | `String` | No | Lecture title |
| `summary` | `String` | No | Short synopsis |
| `content` | `String` | Yes | `null` on list view; populated on detail endpoint |
| `videoObjectKey` | `String` | Yes | `null` on list view; populated on detail endpoint |
| `uploadedAt` | `LocalDateTime` | Yes | Video upload timestamp |
| `isCompleted` | `Boolean` | Yes | `true` if current student watched ≥ 90% threshold |
| `duration` | `Long` | Yes | Total video length in seconds |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    {
      "id": "019ebac1-40fb-7a3f-a81e-5bb153357341",
      "title": "1. Introduction to Spring Boot 3.5",
      "summary": "Overview of features, architecture, and project setup",
      "content": null,
      "videoObjectKey": null,
      "uploadedAt": "2026-08-01T10:00:00",
      "isCompleted": true,
      "duration": 1820
    }
  ],
  "timestamp": 1721234567890
}
```

---

### 4.2 Get Lecture Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/lectures/{lectureId}` |
| **Purpose** | Get full lecture notes and streaming video key |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Student must be enrolled, or Lecturer/Admin) |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | Lecture unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `LectureResponse` (with full `content` and `videoObjectKey`)

---

### 4.3 Get Lecture Materials

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/lectures/{lectureId}/materials` |
| **Purpose** | Get download attachments and source code files for a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | Lecture unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `List<MaterialResponse>`

**DTO:** `MaterialResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Material attachment ID |
| `title` | `String` | No | Attachment display title |
| `fileObjectKey` | `String` | No | S3 storage key |
| `fileOriginalName`| `String` | No | Original uploaded filename |
| `uploadedAt` | `LocalDateTime` | No | Upload timestamp |

---

### 4.4 Create Lecture

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/lectures` |
| **Purpose** | Create a new lecture under a course |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

#### Request Body

**DTO:** `LectureRequest` (`application/json`) — Validation Group: `CreateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ❌ Must be null | `@Null(groups = {CreateValidation.class})` | Auto-generated UUIDv7 |
| `courseId` | `UUID` | ✅ Required | `@NotNull(groups = {CreateValidation.class})` | Target course ID |
| `title` | `String` | ✅ Required | `@NotBlank(groups = {CreateValidation.class, UpdateValidation.class})` | Lecture title |
| `summary` | `String` | ✅ Required | `@NotBlank(groups = {CreateValidation.class, UpdateValidation.class})` | Brief synopsis |
| `content` | `String` | ❌ Optional | None | Detailed markdown notes |
| `videoObjectKey` | `String` | ❌ Optional | None | S3 storage key of uploaded video |

#### Example Request

```http
POST /api/v1/lectures
Authorization: Bearer <lecturer_token>
Content-Type: application/json

{
  "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
  "title": "2. Spring Security 6 & OAuth2",
  "summary": "Deep dive into filters, security contexts, and password grant.",
  "content": "### Security Architecture\nDetailed lecture content here...",
  "videoObjectKey": "lectures/spring_security_6.mp4"
}
```

#### Response

**Response Data (`ApiResponse.data`):** `LectureResponse`

---

### 4.5 Create Lecture Material

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/lectures/materials` |
| **Purpose** | Attach a file or document to a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

#### Request Body

**DTO:** `MaterialRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | `@NotNull(message = "Lecture ID is required")` | Associated lecture ID |
| `title` | `String` | ✅ Required | `@NotBlank(message = "Title is required")` | Display name of attachment |
| `fileObjectKey` | `String` | ✅ Required | `@NotBlank(message = "File object key is required")` | S3 object key |

#### Response

**Response Data (`ApiResponse.data`):** `MaterialResponse`

---

### 4.6 Update Lecture

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/lectures` |
| **Purpose** | Update lecture title, summary, or content |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

#### Request Body

**DTO:** `LectureRequest` (`application/json`) — Validation Group: `UpdateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | `@NotNull(groups = {UpdateValidation.class})` | Target lecture ID |
| `title` | `String` | ✅ Required | `@NotBlank(...)` | Lecture title |
| `summary` | `String` | ✅ Required | `@NotBlank(...)` | Summary |
| `content` | `String` | ❌ Optional | None | Detailed content |
| `videoObjectKey` | `String` | ❌ Must be null | `@Null(groups = {UpdateValidation.class})` | Video key cannot be modified via update |

---

### 4.7 Delete Lecture

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/lectures` |
| **Purpose** | Soft delete a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | Lecture unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Lecture deleted successfully"`)

---

### 4.8 Delete Lecture Material

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/lectures/materials` |
| **Purpose** | Remove an attachment from a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `materialId` | `UUID` | ✅ Required | Material unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Material deleted successfully"`)

---

### 4.9 Update Video Progress

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/lectures/progress` |
| **Purpose** | Send watched video time segments to compute lecture completion |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

#### Request Body

**DTO:** `ProgressSegmentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | `@NotNull(message = "Lecture ID is required")` | Lecture ID |
| `segmentStart` | `Integer` | ✅ Required | `@NotNull`, `@Min(value = 0, message = "Segment start must be non-negative")` | Interval start in seconds |
| `segmentEnd` | `Integer` | ✅ Required | `@NotNull`, `@Min(value = 0, message = "Segment end must be non-negative")` | Interval end in seconds |

#### Example Request

```http
PUT /api/v1/lectures/progress
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "lectureId": "019ebac1-40fb-7a3f-a81e-5bb153357341",
  "segmentStart": 0,
  "segmentEnd": 300
}
```

#### Response

**Response Data (`ApiResponse.data`):** `ProgressResponse`

**DTO:** `ProgressResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `lectureId` | `UUID` | Target lecture ID |
| `completed` | `Boolean` | `true` if watched threshold (≥90%) has been achieved |

---

### 4.10 Filter Lecture Comments

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/lectures/comments/filter` |
| **Purpose** | Paginate top-level comments or specific reply threads for a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `CommentPageRequest` (`application/json`)

| Field | Type | Required | Default | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | — | `@NotNull(message = "Lecture id must not be null")` | Target lecture ID |
| `parentCommentId` | `UUID` | ❌ Optional | `null` | None. If null, returns root comments. If provided, returns replies to this comment. | Parent comment ID |
| `page` | `Integer` | ❌ Optional | `0` | Reset to 0 by controller default | 0-based page index |
| `size` | `Integer` | ❌ Optional | `10` | Reset to 10 by controller default | Items per page |
| `sortBy` | `String` | ❌ Optional | `null` | None | Sort column |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CommentResponse>`

**DTO:** `CommentResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Comment ID |
| `authorUsername` | `String` | No | Username of comment author |
| `authorFullName` | `String` | No | Display name of author |
| `authorAvatarUrl` | `String` | Yes | Avatar image URL |
| `rootCommentId` | `UUID` | Yes | ID of top-level ancestor comment |
| `parentCommentId` | `UUID` | Yes | ID of immediate parent comment |
| `content` | `String` | No | Comment body text |
| `createdAt` | `LocalDateTime` | No | Creation timestamp |
| `isDeleted` | `Boolean` | No | `true` if marked deleted |
| `isMine` | `Boolean` | No | `true` if authored by current user |
| `depth` | `int` | No | Comment tree nesting depth |
| `replyCount` | `int` | No | Total direct replies |

---

### 4.11 Create Lecture Comment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/lectures/comments` |
| **Purpose** | Post a new comment or reply on a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `CommentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | `@NotNull(message = "Lecture id must not be null")` | Target lecture ID |
| `parentCommentId` | `UUID` | ❌ Optional | Nullable | Parent comment ID if replying |
| `content` | `String` | ✅ Required | `@NotBlank(message = "Comment content must not be blank")` | Comment body text |

#### Response

**Response Data (`ApiResponse.data`):** `CommentResponse`

---

### 4.12 Delete Lecture Comment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/lectures/comments` |
| **Purpose** | Delete a comment (Author or Admin/Lecturer) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Ownership verified in service layer) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `commentId` | `UUID` | ✅ Required | Target comment ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Comment deleted successfully"`)

---
## 5. Assignment Module

Handles practical coding assignments, homework tasks tied to lectures, student file submissions, and instructor grading feedback.

---

### 5.1 Get Assignments

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/assignments` |
| **Purpose** | Retrieve assignment details by `assignmentId` or list of assignments for a `lectureId` |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (For students, includes their submission status and file key) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ❌ Optional* | Retrieve list of assignments for this lecture (`*At least one of lectureId or assignmentId is required`) |
| `assignmentId` | `UUID` | ❌ Optional* | Retrieve specific assignment details |

#### Response

- When `assignmentId` is provided: **`ApiResponse.data`:** `AssignmentResponse`
- When `lectureId` is provided: **`ApiResponse.data`:** `List<AssignmentResponse>`

**DTO:** `AssignmentResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Assignment unique identifier |
| `title` | `String` | No | Assignment title |
| `description` | `String` | No | Instructions and requirements |
| `createdAt` | `LocalDateTime` | No | Creation date |
| `fileObjectKey` | `String` | Yes | Student's submitted file key (`null` if not submitted yet or viewed by lecturer) |
| `submittedAt` | `LocalDateTime` | Yes | Submission timestamp (`null` if not submitted yet) |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    {
      "id": "019ebac1-40fb-7a3f-a81e-5bb153357351",
      "title": "Build a Custom OAuth2 Password Grant Server",
      "description": "Implement authentication provider, tokens, and Redis refresh logic.",
      "createdAt": "2026-08-05T14:00:00",
      "fileObjectKey": "submissions/student_bob_assign1.zip",
      "submittedAt": "2026-08-10T16:45:00"
    }
  ],
  "timestamp": 1721234567890
}
```

---

### 5.2 Create Assignment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/assignments` |
| **Purpose** | Create an assignment for a lecture |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN`, `LECTURER` (`@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")`) |

#### Request Body

**DTO:** `AssignmentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lectureId` | `UUID` | ✅ Required | `@NotNull(message = "Lecture is required")` | Associated lecture ID |
| `title` | `String` | ✅ Required | `@NotBlank(message = "Title is required")` | Assignment title |
| `description` | `String` | ✅ Required | `@NotBlank(message = "Description is required")` | Assignment guidelines / prompt |

#### Response

**Response Data (`ApiResponse.data`):** `AssignmentResponse`

---

### 5.3 Delete Assignment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/assignments` |
| **Purpose** | Soft delete an assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN`, `LECTURER` (`@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | Assignment unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Assignment deleted successfully"`)

---

### 5.4 Get Feedback

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/assignments/feedbacks` |
| **Purpose** | Get instructor grading comments and feedback for a student's submission |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (For `STUDENT`, `studentUsername` is forced to current username) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | Target assignment ID |
| `studentUsername` | `String` | ❌ Optional | Target student's username (Required for instructors; automatically overridden for students) |

#### Response

**Response Data (`ApiResponse.data`):** `List<FeedbackResponse>`

**DTO:** `FeedbackResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Feedback record ID |
| `feedback` | `String` | No | Feedback review comments |
| `lecturer` | `String` | No | Instructor's username |
| `lecturerFullName` | `String` | No | Instructor's full name |
| `lecturerAvatar` | `String` | Yes | Instructor's avatar URL |
| `createdAt` | `LocalDateTime` | No | Feedback timestamp |

---

### 5.5 Create Feedback

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/assignments/feedbacks` |
| **Purpose** | Provide feedback / review on a student's assignment submission |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN`, `LECTURER` (`@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")`) |

#### Request Body

**DTO:** `FeedbackRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | `@NotNull(message = "Assignment is required")` | Target assignment ID |
| `studentUsername` | `String` | ✅ Required | `@NotBlank(message = "Student username is required")` | Student receiving feedback |
| `feedback` | `String` | ✅ Required | `@NotBlank(message = "Feedback is required")` | Feedback body |

#### Response

**Response Data (`ApiResponse.data`):** `FeedbackResponse`

---

### 5.6 Delete Feedback

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/assignments/feedbacks` |
| **Purpose** | Remove a feedback entry |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN`, `LECTURER` (`@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `feedbackId` | `UUID` | ✅ Required | Target feedback ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Feedback deleted successfully"`)

---

### 5.7 Get Submissions

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/assignments/submissions` |
| **Purpose** | Get paginated list of student submissions for an assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN`, `LECTURER` (`@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | — | Target assignment ID |
| `page` | `int` | ❌ Optional | `0` | 0-based page number |
| `size` | `int` | ❌ Optional | `10` | Page size |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<SubmissionResponse>`

**DTO:** `SubmissionResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Submission ID |
| `studentUsername` | `String` | No | Submitting student's username |
| `fileObjectKey` | `String` | No | S3 storage key of submitted file |
| `submittedAt` | `LocalDateTime` | No | Submission timestamp |
| `fileName` | `String` | Yes | Original uploaded file name |
| `contentType` | `String` | Yes | MIME type |
| `fileSize` | `Long` | Yes | File size in bytes |

---

### 5.8 Submit Assignment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/assignments/submissions` |
| **Purpose** | Submit or replace homework file for an assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`) |

#### Request Body

**DTO:** `SubmissionRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | `@NotNull(message = "Assignment is required")` | Target assignment ID |
| `fileObjectKey` | `String` | ✅ Required | `@NotBlank(message = "File object key is required")` | Storage key of uploaded submission file |

#### Response

**Response Data (`ApiResponse.data`):** `SubmissionResponse`

---

### 5.9 Cancel Submission

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/assignments/submissions` |
| **Purpose** | Withdraw / delete a student's submission |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | Assignment ID of submission to withdraw |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Submission deleted successfully"`)

---
## 6. File Storage Module

Implements pre-signed URL upload flows with direct streaming to S3/Cloudflare R2, private document download URLs, and metadata retrieval.

---

### 6.1 Create Pre-signed Upload URL

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/files/pre-signed-url` |
| **Purpose** | Generate pre-signed PUT URL for direct client-to-storage file uploading |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `FilePreSignUploadRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fileName` | `String` | ✅ Required | `@NotBlank(message = "fileName must not be blank")` | Original filename with extension |
| `contentType` | `String` | ✅ Required | `@NotBlank(message = "contentType must not be blank")` | MIME type (e.g. `video/mp4`, `image/png`, `application/pdf`) |
| `fileSize` | `Long` | ✅ Required | `@NotNull(message = "fileSize must not be null")`<br>`@Min(1)` | File size in bytes (minimum 1) |
| `isPublic` | `Boolean` | ❌ Optional | Default `false` | If `true`, stores in public bucket/folder for CDN access |

#### Example Request

```http
POST /api/v1/files/pre-signed-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "lecture1_slides.pdf",
  "contentType": "application/pdf",
  "fileSize": 2048576,
  "isPublic": false
}
```

#### Response

**Response Data (`ApiResponse.data`):** `FileUploadResponse`

**DTO:** `FileUploadResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `originalFileName`| `String` | No | Original file name |
| `contentType` | `String` | No | MIME type |
| `fileSize` | `Long` | No | Size in bytes |
| `uploadUrl` | `String` | No | Pre-signed PUT URL valid for direct client upload |
| `objectKey` | `String` | No | Storage object key path to supply to domain endpoints |
| `publicUrl` | `String` | Yes | Public CDN URL (if public) |
| `downloadUrl` | `String` | Yes | Pre-signed GET URL (if private) |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "originalFileName": "lecture1_slides.pdf",
    "contentType": "application/pdf",
    "fileSize": 2048576,
    "uploadUrl": "https://pub-r2.dev-edu.com/private/lecture1_slides.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "objectKey": "private/lecture1_slides.pdf",
    "publicUrl": null,
    "downloadUrl": null
  },
  "timestamp": 1721234567890
}
```

---

### 6.2 Get File Metadata

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/files/metadata` |
| **Purpose** | Retrieve stored file details and size from database and storage |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fullObjectKey` | `String` | ✅ Required | Full object key identifier |

#### Response

**Response Data (`ApiResponse.data`):** `FileUploadResponse`

---

### 6.3 Get Download Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/files/download` |
| **Purpose** | Generate pre-signed GET download URL for private files or CDN link for public files |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fullObjectKey` | `String` | ✅ Required | Target storage object key |

#### Response

**Response Data (`ApiResponse.data`):** `FileUploadResponse` (with populated `downloadUrl` or `publicUrl`)

---

### 6.4 Confirm Image Upload

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/files/confirm-image-upload` |
| **Purpose** | Confirm successful image upload and retrieve public CDN URL for rich text editor embedding |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fullObjectKey` | `String` | ✅ Required | Uploaded image object key |

#### Response

**Response Data (`ApiResponse.data`):** `String` (Public accessible image URL)

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "https://pub-r2.dev-edu.com/images/embedded_diagram.png",
  "timestamp": 1721234567890
}
```

---
## 7. Forum Module

Handles community discussion posts with full versioning history, admin approval workflows, bookmarks/saves, Elasticsearch full-text search, and multi-level threaded comments.

---

### 7.1 Get All Post Versions - Admin Review Queue

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/versions` |
| **Purpose** | Get post versions filtered by status for moderation review |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | `PostStatus` | ✅ Required | Enum: `PENDING`, `SUPERSEDED`, `APPROVED`, `REJECTED` |
| `lastCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<PostResponse>`

---

### 7.2 Get Author's Posted Posts

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/posted` |
| **Purpose** | Get current authenticated author's created posts |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | `PostStatus` | ✅ Required | Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `SUPERSEDED`) |
| `lastCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<PostResponse>`

---

### 7.3 Get Versions by Post ID

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/versions/{postId}` |
| **Purpose** | Retrieve version history for a post |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Author or Admin) |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | Post unique identifier |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `PostStatus` | ❌ Optional | `APPROVED` | Version status filter |

#### Response

**Response Data (`ApiResponse.data`):** `List<PostResponse>`

---

### 7.4 Update Post Version Status - Admin

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/forum/posts/versions` |
| **Purpose** | Approve or reject a pending post version |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Request Body

**Payload:** `Map<String, Object>` (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postVersionId` | `String` (UUID format) | ✅ Required | Target post version ID |
| `postStatus` | `String` | ✅ Required | Target status enum string (`APPROVED`, `REJECTED`, etc.) |

#### Response

**Response Data (`ApiResponse.data`):** `UpdatePostVersionResult`

---

### 7.5 Delete Post Version

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/forum/posts/versions` |
| **Purpose** | Delete a specific post revision |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Author or Admin) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postVersionId` | `UUID` | ✅ Required | Target version ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Post version deleted successfully"`)

---

### 7.6 Get Published Post Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts` |
| **Purpose** | View approved published post content and author details |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any (Populates `isSaved` and `isMine` flags if authenticated) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Post unique identifier |

#### Response

**Response Data (`ApiResponse.data`):** `PostResponse`

**DTO:** `PostResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Post unique identifier |
| `title` | `String` | No | Post title |
| `shortDescription` | `String` | No | Short synopsis |
| `thumbUrl` | `String` | Yes | Thumbnail image URL |
| `content` | `String` | No | Full post body HTML / Markdown |
| `status` | `PostStatus` | No | Post lifecycle state (`APPROVED`) |
| `createdAt` | `LocalDateTime` | No | Publication timestamp |
| `updatedAt` | `LocalDateTime` | No | Modification timestamp |
| `isSaved` | `Boolean` | Yes | `true` if current student bookmarked post |
| `isMine` | `Boolean` | Yes | `true` if current user is author |
| `authorUsername` | `String` | No | Author username |
| `authorFullName` | `String` | No | Author full name |
| `authorAvatarUrl` | `String` | Yes | Author avatar URL |
| `views` | `Integer` | No | Total view count |
| `comments` | `Integer` | No | Total comments count |

---

### 7.7 Create Post

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/forum/posts` |
| **Purpose** | Create a new forum post draft/submission |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `PostRequest` (`application/json`) — Validation Group: `CreateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ❌ Must be null | `@Null(groups = {CreateValidation.class})` | Auto-generated ID |
| `thumbObjectKey` | `String` | ✅ Required | `@NotBlank(groups = {CreateValidation.class, UpdateValidation.class})` | S3 thumbnail object key |
| `title` | `String` | ✅ Required | `@NotBlank`, `@Size(max = 255)` | Post title (max 255) |
| `shortDescription` | `String` | ✅ Required | `@NotBlank`, `@Size(max = 500)` | Summary preview (max 500) |
| `content` | `String` | ✅ Required | `@NotBlank` | Post body content |

#### Response

**Response Data (`ApiResponse.data`):** `PostVersionResponse`

**DTO:** `PostVersionResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Created post version ID |
| `title` | `String` | Post title |
| `shortDescription` | `String` | Summary |
| `status` | `PostStatus` | Status (defaults to `PENDING`) |
| `content` | `String` | Body content |
| `updatedAt` | `LocalDateTime` | Timestamp |

---

### 7.8 Update Post

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/forum/posts` |
| **Purpose** | Update an existing post by generating a new revision version |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Author only) |

#### Request Body

**DTO:** `PostRequest` (`application/json`) — Validation Group: `UpdateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | `@NotNull(groups = {UpdateValidation.class})` | Target post ID to modify |
| `thumbObjectKey` | `String` | ✅ Required | `@NotBlank(...)` | S3 thumbnail key |
| `title` | `String` | ✅ Required | `@NotBlank`, `@Size(max = 255)` | Updated title |
| `shortDescription` | `String` | ✅ Required | `@NotBlank`, `@Size(max = 500)` | Updated summary |
| `content` | `String` | ✅ Required | `@NotBlank` | Updated content |

#### Response

**Response Data (`ApiResponse.data`):** `PostVersionResponse`

---

### 7.9 Delete Post

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/forum/posts` |
| **Purpose** | Soft delete an entire post and all its revisions |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Author or Admin) |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | Target post ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Post deleted successfully"`)

---

### 7.10 Get Saved Posts

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/saved` |
| **Purpose** | Get cursor-paginated list of articles bookmarked by the current user |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<SavedPostResponse>`

**DTO:** `SavedPostResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Bookmark record ID |
| `postId` | `UUID` | Bookmarked post ID |
| `authorUsername` | `String` | Post author username |
| `authorFullName` | `String` | Author full name |
| `authorAvatarUrl` | `String` | Author avatar URL |
| `thumbUrl` | `String` | Thumbnail URL |
| `title` | `String` | Post title |
| `shortDescription` | `String` | Post summary |
| `postedDate` | `LocalDateTime` | Creation date |
| `savedAt` | `LocalDateTime` | Bookmark saved timestamp |

---

### 7.11 Save / Bookmark Post

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/forum/posts/{postId}/save` |
| **Purpose** | Save an article to user's bookmarks |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | Target post ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Post saved successfully"`)

---

### 7.12 Unsave Post

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/forum/posts/{postId}/save` |
| **Purpose** | Remove an article from user's bookmarks |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | Target post ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Post unsaved successfully"`)

---

### 7.13 Get Post Feed

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/feed` |
| **Purpose** | Browse main forum timeline feed |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<PostResponse>`

---

### 7.14 Search Posts - Elasticsearch

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/search` |
| **Purpose** | Full-text search across forum posts powered by Elasticsearch |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keyword` | `String` | ✅ Required | Search terms / phrase |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<PostResponse>`

---

### 7.15 Get Related Posts

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/posts/{postId}/related` |
| **Purpose** | Get recommended related articles based on Elasticsearch similarity |
| **Authentication** | Public / Authenticated |
| **Permission** | Any |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | Target post ID |

#### Response

**Response Data (`ApiResponse.data`):** `List<PostResponse>`

---

### 7.16 Get Post Root Comments

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/comments` |
| **Purpose** | Get top-level discussion comments on a post |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | Target post ID |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CommentResponse>`

**DTO:** `CommentResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Comment ID |
| `authorUsername` | `String` | Author username |
| `authorFullName` | `String` | Author full name |
| `authorAvatarUrl` | `String` | Author avatar URL |
| `content` | `String` | Comment body |
| `replyCount` | `int` | Number of child replies |
| `repliedToCommentId` | `UUID` | Parent comment ID (`null` for root) |
| `createdAt` | `LocalDateTime` | Creation timestamp |
| `isDeleted` | `Boolean` | Soft deletion indicator |
| `isMine` | `Boolean` | `true` if current user authored comment |

---

### 7.17 Get Post Comment Replies

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/forum/comments/replies` |
| **Purpose** | Get replies to a specific parent comment |
| **Authentication** | Public (`permitAll()`) / Authenticated |
| **Permission** | Any |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `parentCommentId` | `UUID` | ✅ Required | Target parent comment ID |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CommentResponse>`

---

### 7.18 Create Comment or Reply

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/forum/comments` |
| **Purpose** | Post a new comment or reply on a forum post |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `CommentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `postId` | `UUID` | ✅ Required | `@NotNull(message = "Post ID cannot be null")` | Target post ID |
| `content` | `String` | ✅ Required | `@NotBlank(message = "Content cannot be blank")` | Comment body |
| `repliedToCommentId` | `UUID` | ❌ Optional | Nullable | Parent comment ID if replying |

#### Response

**Response Data (`ApiResponse.data`):** `CommentResponse`

---

### 7.19 Delete Comment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/forum/comments` |
| **Purpose** | Delete a comment (Author or Admin) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `commentId` | `UUID` | ✅ Required | Target comment ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Comment deleted successfully."`)

---
## 8. Metric Module

Provides system analytics, user and revenue growth metrics, platform engagement stats, and leaderboards for system administrators.

> **Base Route:** `/api/metrics`  
> All endpoints in this module require `ADMIN` role (`@PreAuthorize("hasAuthority('ADMIN')")`).

---

### 8.1 Dashboard Overview

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/dashboard` |
| **Purpose** | Get high-level KPI metrics across the entire platform |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Response

**Response Data (`ApiResponse.data`):** `DashboardOverviewDto`

**DTO:** `DashboardOverviewDto`

| Field | Type | Description |
| :--- | :--- | :--- |
| `totalUsers` | `long` | Total registered users |
| `totalCourses` | `long` | Total published courses |
| `totalLectures` | `long` | Total video lectures |
| `totalAssignments`| `long` | Total assignments |
| `totalEnrollments`| `long` | Total course enrollments |
| `totalRevenue` | `BigDecimal` | Lifetime platform revenue |
| `courseCompletionRate`| `double` | Average course completion percentage |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "totalUsers": 1250,
    "totalCourses": 35,
    "totalLectures": 420,
    "totalAssignments": 110,
    "totalEnrollments": 3400,
    "totalRevenue": 1540000000.00,
    "courseCompletionRate": 78.5
  },
  "timestamp": 1721234567890
}
```

---

### 8.2 Users Growth

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/users-growth` |
| **Purpose** | Get new user registration time-series data |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `period` | `GrowthPeriod` | ❌ Optional | `DAILY` | Aggregation interval: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |

#### Response

**Response Data (`ApiResponse.data`):** `List<GrowthDataDto>`

**DTO:** `GrowthDataDto`

| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | `LocalDate` | Bucket date |
| `count` | `long` | Registrations count |

---

### 8.3 Courses Growth

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/courses-growth` |
| **Purpose** | Get course creation and publication trend over time |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `period` | `GrowthPeriod` | ❌ Optional | `DAILY` | Interval: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |

#### Response

**Response Data (`ApiResponse.data`):** `List<GrowthDataDto>`

---

### 8.4 Revenue Growth

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/revenue-growth` |
| **Purpose** | Get gross revenue timeline data |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `period` | `GrowthPeriod` | ❌ Optional | `DAILY` | Interval: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |

#### Response

**Response Data (`ApiResponse.data`):** `List<RevenueGrowthDto>`

**DTO:** `RevenueGrowthDto`

| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | `LocalDate` | Bucket date |
| `amount` | `BigDecimal` | Gross revenue for bucket |

---

### 8.5 Activity Metrics

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/activity` |
| **Purpose** | Retrieve user activity logs and daily active users (DAU) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `days` | `int` | ❌ Optional | `30` | Number of trailing days to inspect |

#### Response

**Response Data (`ApiResponse.data`):** `ActivityMetricDto`

**DTO:** `ActivityMetricDto`

| Field | Type | Description |
| :--- | :--- | :--- |
| `dailyActiveUsers` | `long` | Distinct active users today |
| `totalRequestLogs` | `long` | Total HTTP API request count in window |
| `recentActivities` | `List<RecentActivityDto>` | Detailed activity feed items |
| `actionDistribution`| `Map<String, Long>` | Aggregated counts grouped by action type |

---

### 8.6 Top Courses

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/top-courses` |
| **Purpose** | Retrieve top performing courses by enrollment and revenue |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | `int` | ❌ Optional | `10` | Number of items to return |

#### Response

**Response Data (`ApiResponse.data`):** `List<TopCourseDto>`

**DTO:** `TopCourseDto`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Course ID |
| `title` | `String` | Course title |
| `price` | `BigDecimal` | List price |
| `createdBy` | `String` | Instructor username |
| `createdAt` | `LocalDateTime` | Publication date |
| `enrollmentCount` | `long` | Enrolled students count |
| `averageRating` | `double` | Average rating |
| `reviewCount` | `long` | Total review count |
| `totalRevenue` | `BigDecimal` | Gross course revenue |

---

### 8.7 Top Users & Contributors

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/metrics/top-users` |
| **Purpose** | Retrieve top learners by spend/enrollment and top forum contributors |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | `int` | ❌ Optional | `10` | Number of items per category |

#### Response

**Response Data (`ApiResponse.data`):** `TopUserDto`

**DTO:** `TopUserDto`

| Field | Type | Description |
| :--- | :--- | :--- |
| `topStudents` | `List<TopStudentDto>` | Students with highest enrollment/spend |
| `topContributors`| `List<TopContributorDto>` | Users with most published forum posts and comments |

---
## 9. Tracking Module

Audit logging of student assignment submissions and lifecycle events.

---

### 9.1 Get Submission Tracking Logs

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/assignments/submissions/tracking` |
| **Purpose** | View submission and un-submission activity history for an assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Student sees own logs; Instructor/Admin must supply `studentUsername`) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | — | Target assignment ID |
| `studentUsername` | `String` | ❌ Optional* | — | Student username (`*Required for non-student callers; students automatically view own logs`) |
| `page` | `int` | ❌ Optional | `0` | 0-based page index |

#### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<SubmissionLogResponse>`

**DTO:** `SubmissionLogResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Tracking log ID |
| `status` | `SubmissionEvent.Action` | No | Action type (`SUBMITTED`, `UNSUBMITTED`) |
| `details` | `String` | Yes | Audit details |
| `updatedAt` | `LocalDateTime` | No | Event timestamp |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb153357388",
        "status": "SUBMITTED",
        "details": "Student submitted file: submissions/student_bob_assign1.zip",
        "updatedAt": "2026-08-10T16:45:00"
      }
    ],
    "totalPages": 1,
    "pageSize": 10,
    "totalElements": 1,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

---
## 10. Chat & AI Consultation Module

AI-powered chatbot assistant for personalized course guidance and semantic course recommendations (utilizing OpenAI function calling and PostgreSQL `pgvector` HNSW vector embeddings).

> **Base Route:** `/api/chat`

---

### 10.1 Send Consultation Message

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/chat/messages` |
| **Purpose** | Send inquiry to AI assistant and receive advice along with matching course cards |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Body

**DTO:** `ChatMessageRequest` (`application/json`)

| Field | Type | Required | Default | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `conversationId` | `UUID` | ❌ Optional | `null` | Valid UUID format. If omitted, initializes a new conversation. | Existing conversation identifier |
| `message` | `String` | ✅ Required | — | `@NotBlank(message = "Message cannot be empty")`<br>`@Size(max = 500, message = "Message must not exceed 500 characters")` | User input message prompt (max 500 characters) |
| `history` | `List<HistoryItemDto>` | ❌ Optional | `null` | List elements must have valid `role` and `content` | Client-provided conversation turns |

#### Example Request

```http
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": null,
  "message": "Hi, I am looking for a beginner-friendly Java Spring Boot course.",
  "history": []
}
```

#### Response

**Response Data (`ApiResponse.data`):** `ChatMessageResponse`

**DTO:** `ChatMessageResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `conversationId` | `UUID` | No | Active conversation ID |
| `reply` | `ReplyDto` | No | AI assistant response message |
| `reply.role` | `String` | No | Message role (e.g. `"assistant"`) |
| `reply.content` | `String` | No | Assistant reply markdown text |
| `courses` | `List<CourseCardResponse>`| No | Array of recommended courses matched via vector search |

**DTO:** `CourseCardResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | No | Course unique identifier |
| `title` | `String` | No | Course title |
| `shortDescription` | `String` | No | Short synopsis |
| `price` | `BigDecimal` | Yes | Course price |
| `thumbnailUrl` | `String` | Yes | Course thumbnail URL |
| `matchReason` | `String` | Yes | AI explanation for recommending this course |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "conversationId": "019ebac1-40fb-7a3f-a81e-5bb1533573d3",
    "reply": {
      "role": "assistant",
      "content": "Here is a great course to get started with Spring Boot from scratch:"
    },
    "courses": [
      {
        "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
        "title": "Spring Boot 3.5 Masterclass",
        "shortDescription": "Master modern Spring Boot, JPA, and Microservices.",
        "price": 399200.00,
        "thumbnailUrl": "https://pub-r2.dev-edu.com/courses/spring_boot.jpg",
        "matchReason": "Covers foundational Java backend concepts and Spring ecosystem."
      }
    ]
  },
  "timestamp": 1721234567890
}
```

---

### 10.2 Get User Conversations List

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/chat/conversations` |
| **Purpose** | Get list of user's past AI consultation conversations |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated |

#### Request Parameters

None.

#### Response

**Response Data (`ApiResponse.data`):** `List<ChatConversationSummaryResponse>`

**DTO:** `ChatConversationSummaryResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Conversation ID |
| `lastMessagePreview`| `String` | Yes | Snippet of latest message |
| `updatedAt` | `LocalDateTime` | No | Last message timestamp |

#### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    {
      "id": "019ebac1-40fb-7a3f-a81e-5bb1533573d3",
      "lastMessagePreview": "Here is a great course to get started...",
      "updatedAt": "2026-08-25T14:30:00"
    }
  ],
  "timestamp": 1721234567890
}
```

---

### 10.3 Get Message Details in Conversation

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/chat/conversations/{id}/messages` |
| **Purpose** | Retrieve full turn-by-turn chat history for a conversation |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Conversation owner) |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target conversation ID |

#### Response

**Response Data (`ApiResponse.data`):** `List<ChatMessageDetailResponse>`

**DTO:** `ChatMessageDetailResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Message unique identifier |
| `role` | `String` | No | Message sender (`user` or `assistant`) |
| `content` | `String` | No | Message text content |
| `referencedCourseIds`| `List<UUID>` | Yes | Array of referenced course IDs |
| `courses` | `List<CourseCardResponse>` | No | Embedded recommended course cards |
| `createdAt` | `LocalDateTime` | No | Creation timestamp |

---

### 10.4 Delete Conversation

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/chat/conversations/{id}` |
| **Purpose** | Delete an AI chat conversation and all associated message history |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Conversation owner) |

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target conversation ID |

#### Response

**Response Data (`ApiResponse.data`):** `String` (`"Conversation deleted successfully"`)

---
## 11. Quiz & Examination Module

Comprehensive test assessment engine: quiz lifecycle, question quotas, automated scoring, active testing sessions with optimistic autosave and heartbeat, essay grading, and AI-assisted quiz generation from document source files.

---

### 11.1 Quiz Lifecycle & Configurations

#### 11.1.1 Create Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes` |
| **Purpose** | Create a new quiz blueprint in `DRAFT` status |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Request Body

**DTO:** `QuizRequest` (`application/json`) — Validation Group: `CreateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | `@NotNull(groups = {CreateValidation.class}, message = "Course ID is required")` | Associated course ID |
| `title` | `String` | ✅ Required | `@NotBlank(groups = {CreateValidation.class, UpdateValidation.class}, message = "Quiz title is required")` | Quiz title |
| `description` | `String` | ❌ Optional | Nullable | Guidelines / description |

##### Response

**Response Data (`ApiResponse.data`):** `QuizResponse`

**DTO:** `QuizResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Quiz unique identifier |
| `courseId` | `UUID` | No | Associated course ID |
| `title` | `String` | No | Quiz title |
| `description` | `String` | Yes | Quiz description |
| `status` | `QuizStatus` | No | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED` |
| `createdBy` | `String` | No | Creator username |
| `submittedBy` | `String` | Yes | Submitter username |
| `submittedAt` | `LocalDateTime` | Yes | Submission timestamp |
| `approvedBy` | `String` | Yes | Approver username |
| `approvedAt` | `LocalDateTime` | Yes | Approval timestamp |
| `rejectedBy` | `String` | Yes | Rejecter username |
| `rejectedAt` | `LocalDateTime` | Yes | Rejection timestamp |
| `rejectionReason`| `String` | Yes | Rejection remarks |
| `createdAt` | `LocalDateTime` | No | Creation date |
| `updatedAt` | `LocalDateTime` | No | Last update |

---

#### 11.1.2 Duplicate Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/{id}/duplicate` |
| **Purpose** | Clone a quiz along with all its type configurations, questions, and options |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz ID to duplicate |

##### Response

**Response Data (`ApiResponse.data`):** `QuizResponse` (New cloned quiz in `DRAFT` status)

---

#### 11.1.3 Update Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/quizzes/{id}` |
| **Purpose** | Update quiz metadata (Only allowed while in `DRAFT` status) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target quiz ID |

##### Request Body

**DTO:** `QuizRequest` (`application/json`) — Validation Group: `UpdateValidation.class`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `String` | ✅ Required | `@NotBlank(groups = {CreateValidation.class, UpdateValidation.class})` | Quiz title |
| `description` | `String` | ❌ Optional | Nullable | Quiz description |

##### Response

**Response Data (`ApiResponse.data`):** `QuizResponse`

---

#### 11.1.4 Get Quiz Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quizzes/{id}` |
| **Purpose** | Retrieve full quiz details, configured question quotas, and questions with options |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT`, `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz unique identifier |

##### Response

**Response Data (`ApiResponse.data`):** `QuizDetailResponse`

**DTO:** `QuizDetailResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `quiz` | `QuizResponse` | Quiz master metadata |
| `typeConfigs` | `List<QuizTypeConfigResponse>` | Question quotas and scoring rules |
| `questions` | `List<QuizQuestionResponse>` | List of quiz questions and options |

---

#### 11.1.5 Get Quizzes by Course

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quizzes/course/{courseId}` |
| **Purpose** | Get cursor-paginated list of quizzes for a course filtered by status |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Associated course ID |

##### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `QuizStatus` | ✅ Required | — | Filter: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED` |
| `keyword` | `String` | ❌ Optional | `""` | Search term matching quiz title |
| `nextCursor` | `String` | ❌ Optional | `null` | Pagination cursor |

##### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<QuizResponse>`

---

#### 11.1.6 Add / Update Quiz Type Config

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/{id}/type-configs` |
| **Purpose** | Configure required question counts and points per type (e.g. 10 Single Choice @ 1pt) |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz unique identifier |

##### Request Body

**DTO:** `QuizTypeConfigRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `questionType` | `QuestionType` | ✅ Required | `@NotNull(message = "Question type is required")`<br>Enum: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `ESSAY` | Question type |
| `requiredCount` | `Integer` | ✅ Required | `@NotNull`, `@Min(value = 1, message = "Required count must be at least 1")` | Number of questions required |
| `pointsPerQuestion`| `BigDecimal` | ✅ Required | `@NotNull`, `@DecimalMin(value = "0.0", message = "Points must be non-negative")` | Points awarded per question |
| `scoringMethod` | `ScoringMethod` | ✅ Required | `@NotNull(message = "Scoring method is required")`<br>Enum: `AUTO`, `MANUAL` | Scoring strategy |

##### Response

**Response Data (`ApiResponse.data`):** `QuizTypeConfigResponse`

**DTO:** `QuizTypeConfigResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Config record ID |
| `quizId` | `UUID` | Associated Quiz ID |
| `questionType` | `QuestionType` | Question type |
| `requiredCount` | `Integer` | Required question quota |
| `pointsPerQuestion`| `BigDecimal` | Points per item |
| `scoringMethod` | `ScoringMethod` | `AUTO` or `MANUAL` |

---

#### 11.1.7 Get Quiz Type Configs

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quizzes/{id}/type-configs` |
| **Purpose** | Retrieve all question type scoring configurations for a quiz |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target quiz ID |

##### Response

**Response Data (`ApiResponse.data`):** `List<QuizTypeConfigResponse>`

---

#### 11.1.8 Delete Quiz Type Config

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/quizzes/{id}/type-configs/{typeConfigId}` |
| **Purpose** | Remove a question type configuration rule |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz ID |
| `typeConfigId` | `UUID` | ✅ Required | Config ID to remove |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Quiz type config deleted successfully"`)

---

#### 11.1.9 Submit Quiz for Review

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/{id}/submit` |
| **Purpose** | Transition quiz from `DRAFT` to `PENDING` status for Admin review |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz ID to submit |

##### Response

**Response Data (`ApiResponse.data`):** `QuizResponse`

---

#### 11.1.10 List Quizzes for Admin Review

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quizzes` |
| **Purpose** | Admin queue for inspecting quizzes submitted for review |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

##### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `QuizStatus` | ✅ Required | — | Status filter (`PENDING`, `APPROVED`, `REJECTED`). `DRAFT` is prohibited. |
| `keyword` | `String` | ❌ Optional | `""` | Title keyword search |
| `nextCursor` | `String` | ❌ Optional | `null` | Pagination cursor |

##### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<QuizResponse>`

---

#### 11.1.11 Review Quiz - Admin

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/{id}/review` |
| **Purpose** | Approve or reject a submitted quiz |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target quiz ID |

##### Request Body

**DTO:** `QuizReviewRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `approved` | `Boolean` | ✅ Required | `@NotNull(message = "Approved status is required")` | `true` for APPROVED, `false` for REJECTED |
| `rejectionReason` | `String` | ❌ Optional* | Required if `approved == false` | Rejection comments |

##### Response

**Response Data (`ApiResponse.data`):** `QuizResponse`

---

### 11.2 Question & Option Management

#### 11.2.1 Add Question to Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/{id}/questions` |
| **Purpose** | Add a single choice, multiple choice, or essay question to a quiz |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target quiz ID |

##### Request Body

**DTO:** `QuizQuestionRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `questionType` | `QuestionType` | ✅ Required | `@NotNull(message = "Question type is required")`<br>Enum: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `ESSAY` | Question type |
| `content` | `String` | ✅ Required | `@NotBlank(message = "Question content is required")` | Question stem text |
| `orderIndex` | `Integer` | ❌ Optional | Nullable | Order position index |
| `options` | `List<QuizQuestionOptionRequest>` | ❌ Optional* | `@Valid` (Required for choice questions) | List of options |

**DTO:** `QuizQuestionOptionRequest`

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ❌ Optional | Nullable (for update) | Option ID |
| `optionText` | `String` | ✅ Required | `@NotBlank(message = "Option text is required")` | Choice content |
| `isCorrect` | `Boolean` | ✅ Required | `@NotNull(message = "isCorrect is required")` | Whether this choice is correct |
| `orderIndex` | `Integer` | ❌ Optional | Nullable | Display position index |

##### Response

**Response Data (`ApiResponse.data`):** `QuizQuestionResponse`

**DTO:** `QuizQuestionResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Question unique identifier |
| `quizId` | `UUID` | Associated Quiz ID |
| `questionType` | `QuestionType` | Question type |
| `content` | `String` | Question content |
| `points` | `BigDecimal` | Points for question |
| `orderIndex` | `Integer` | Order index |
| `options` | `List<QuizQuestionOptionResponse>` | List of choices |

---

#### 11.2.2 Update Question in Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/quizzes/{id}/questions/{questionId}` |
| **Purpose** | Update question content, scoring, or options |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz ID |
| `questionId` | `UUID` | ✅ Required | Question ID to update |

##### Request Body

**DTO:** `QuizQuestionRequest` (`application/json`)

##### Response

**Response Data (`ApiResponse.data`):** `QuizQuestionResponse`

---

#### 11.2.3 Delete Question from Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/quizzes/{id}/questions/{questionId}` |
| **Purpose** | Delete a question from a quiz |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Quiz ID |
| `questionId` | `UUID` | ✅ Required | Question ID to delete |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Question deleted successfully"`)

---

### 11.3 Quiz Assignment Management

#### 11.3.1 Create Quiz Assignment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quiz-assignments` |
| **Purpose** | Schedule a quiz for students with time limits and attempt limits |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Request Body

**DTO:** `CreateAssignmentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `quizId` | `UUID` | ✅ Required | `@NotNull(message = "Quiz ID is required")` | Target quiz ID |
| `assignmentName` | `String` | ✅ Required | `@NotBlank(message = "Assignment name is required")` | Display name of exam schedule |
| `startTime` | `LocalDateTime`| ✅ Required | `@NotNull(message = "Start time is required")` | Opening start date/time |
| `endTime` | `LocalDateTime`| ❌ Optional | Nullable | Closing deadline date/time |
| `durationMinutes`| `Integer` | ✅ Required | `@NotNull`, `@Min(value = 1, message = "Duration must be at least 1 minute")` | Test duration in minutes |
| `shuffleQuestions`| `Boolean` | ❌ Optional | Default `false` | Randomize question order |
| `shuffleOptions` | `Boolean` | ❌ Optional | Default `false` | Randomize choice options |
| `maxAttempts` | `Integer` | ✅ Required | `@NotNull`, `@Min(value = 1, message = "Max attempts must be at least 1")` | Max attempts allowed per student |

##### Response

**Response Data (`ApiResponse.data`):** `QuizAssignmentResponse`

**DTO:** `QuizAssignmentResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Assignment unique identifier |
| `quizId` | `UUID` | No | Associated Quiz ID |
| `assignmentName` | `String` | No | Name of assignment |
| `startTime` | `LocalDateTime` | No | Start timestamp |
| `endTime` | `LocalDateTime` | Yes | End timestamp |
| `durationMinutes`| `Integer` | No | Test duration limit |
| `shuffleQuestions`| `Boolean` | Yes | Shuffle flag |
| `shuffleOptions` | `Boolean` | Yes | Shuffle flag |
| `maxAttempts` | `Integer` | No | Maximum attempts |
| `status` | `AssignmentStatus`| No | `SCHEDULED`, `ACTIVE`, `CLOSED` |
| `createdBy` | `String` | No | Creator username |
| `createdAt` | `LocalDateTime` | No | Creation date |

---

#### 11.3.2 Delete Quiz Assignment

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/quiz-assignments/{id}` |
| **Purpose** | Delete a quiz assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target assignment ID |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Assignment deleted successfully"`)

---

#### 11.3.3 Get Assignments by Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-assignments/quiz/{quizId}` |
| **Purpose** | Get all scheduled assignments linked to a quiz |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `quizId` | `UUID` | ✅ Required | Target quiz ID |

##### Response

**Response Data (`ApiResponse.data`):** `List<QuizAssignmentResponse>`

---

#### 11.3.4 Get Quiz Assignment Details

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-assignments/{id}` |
| **Purpose** | Get details of a specific quiz assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT`, `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Target assignment ID |

##### Response

**Response Data (`ApiResponse.data`):** `QuizAssignmentResponse`

---

#### 11.3.5 Get Quiz Assignments by Course - Student

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-assignments` |
| **Purpose** | List available quiz assignments in an enrolled course for a student |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

##### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Target course ID |

##### Response

**Response Data (`ApiResponse.data`):** `List<QuizAssignmentResponse>`

---

### 11.4 Taking Quiz & Attempts

#### 11.4.1 Start / Resume Quiz Attempt

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quiz-assignments/{assignmentId}/start` |
| **Purpose** | Start a new attempt or resume an existing active attempt with browser session lock |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | Assignment to take |

##### Headers / Query Parameters

| Parameter | Source | Type | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `X-Session-Token` | Header | `String` | ❌ Optional | Client session token (Auto-generated UUID if omitted) |
| `sessionToken` | Query Param | `String` | ❌ Optional | Fallback query parameter for session token |

##### Response

**Response Data (`ApiResponse.data`):** `StartAttemptResponse`

**DTO:** `StartAttemptResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | No | Attempt unique identifier |
| `assignmentId` | `UUID` | No | Associated assignment ID |
| `quizId` | `UUID` | No | Associated quiz ID |
| `studentUsername` | `String` | No | Student username |
| `attemptNumber` | `Integer` | No | Attempt sequence number (1, 2, ...) |
| `status` | `AttemptStatus` | No | `IN_PROGRESS` |
| `startedAt` | `LocalDateTime` | No | Start timestamp |
| `expiresAt` | `LocalDateTime` | No | Hard deadline after which test auto-submits |
| `maxScore` | `BigDecimal` | No | Total possible score |
| `activeSessionToken`| `String` | No | Active token required for subsequent autosave and heartbeat calls |
| `questions` | `List<QuizQuestionResponse>` | No | Questions (Note: Option `isCorrect` flags are omitted during active test) |
| `existingAnswers` | `List<QuizAttemptAnswerEntityDto>` | Yes | Previously saved answers (for session resume) |

---

#### 11.4.2 Get My Attempts History

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-assignments/{assignmentId}/my-attempts` |
| **Purpose** | View all previous submitted attempts for an assignment |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `assignmentId` | `UUID` | ✅ Required | Assignment ID |

##### Response

**Response Data (`ApiResponse.data`):** `List<SubmitAttemptResponse>`

---

#### 11.4.3 Autosave Quiz Answer

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quiz-attempts/{attemptId}/autosave` |
| **Purpose** | Incrementally save student answers with optimistic version locking |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Active attempt ID |

##### Request Body

**DTO:** `AutosaveRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `questionId` | `UUID` | ✅ Required | `@NotNull(message = "Question ID is required")` | Target question ID |
| `answerText` | `String` | ❌ Optional | Nullable | Answer text for Essay questions |
| `selectedOptionIds`| `List<UUID>` | ❌ Optional | Nullable | Selected choice IDs for Single/Multiple Choice |
| `clientSeq` | `Integer` | ✅ Required | `@NotNull(message = "clientSeq is required")` | Monotonic client-side sequence counter |
| `sessionToken` | `String` | ✅ Required | `@NotBlank(message = "sessionToken is required")` | Must match active session token |

##### Response

**Response Data (`ApiResponse.data`):** `AutosaveResponse`

**DTO:** `AutosaveResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `attemptId` | `UUID` | Attempt ID |
| `questionId` | `UUID` | Question ID |
| `autosaveVersion` | `Integer` | Optimistic lock sequence version |
| `lastSavedAt` | `LocalDateTime` | Timestamp saved |
| `saved` | `Boolean` | `true` if save succeeded |
| `message` | `String` | Status description |

---

#### 11.4.4 Submit Quiz Attempt

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quiz-attempts/{attemptId}/submit` |
| **Purpose** | Finalize test attempt, perform automated objective grading, and close session |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Active attempt ID to submit |

##### Response

**Response Data (`ApiResponse.data`):** `SubmitAttemptResponse`

**DTO:** `SubmitAttemptResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | No | Attempt ID |
| `attemptNumber` | `Integer` | No | Sequence number |
| `status` | `AttemptStatus` | No | `SUBMITTED`, `GRADING` (if essays pending), or `GRADED` |
| `startedAt` | `LocalDateTime` | No | Started timestamp |
| `submittedAt` | `LocalDateTime` | No | Submitted timestamp |
| `gradedAt` | `LocalDateTime` | Yes | Graded timestamp (`null` if awaiting essay grading) |
| `totalScore` | `BigDecimal` | No | Auto-graded objective score |
| `maxScore` | `BigDecimal` | No | Total possible maximum score |

---

#### 11.4.5 Send Heartbeat

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quiz-attempts/{attemptId}/heartbeat` |
| **Purpose** | Periodic liveness heartbeat and device verification |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT` (`@PreAuthorize("hasAuthority('STUDENT')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Attempt ID |

##### Request Body

**DTO:** `HeartbeatRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionToken` | `String` | ✅ Required | `@NotBlank(message = "sessionToken is required")` | Active session token |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Heartbeat acknowledged."`)

---

#### 11.4.6 Get Attempt Session State

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-attempts/{attemptId}` |
| **Purpose** | Fetch current in-flight state of an attempt |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT`, `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Attempt ID |

##### Response

**Response Data (`ApiResponse.data`):** `StartAttemptResponse`

---

#### 11.4.7 Get Attempt Full Review

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-attempts/{attemptId}/review` |
| **Purpose** | View full post-test review including correct answers, choices, and explanations |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT`, `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Attempt ID |

##### Response

**Response Data (`ApiResponse.data`):** `QuizAttemptReviewResponse`

**DTO:** `QuizAttemptReviewResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | No | Attempt ID |
| `assignmentId` | `UUID` | No | Assignment ID |
| `quizId` | `UUID` | No | Quiz ID |
| `studentUsername` | `String` | No | Student username |
| `attemptNumber` | `Integer` | No | Attempt index |
| `status` | `AttemptStatus` | No | Status |
| `startedAt` | `LocalDateTime` | No | Start timestamp |
| `submittedAt` | `LocalDateTime` | No | Submission timestamp |
| `gradedAt` | `LocalDateTime` | Yes | Final graded timestamp |
| `maxScore` | `BigDecimal` | No | Max score |
| `totalScore` | `BigDecimal` | No | Total score awarded |
| `answers` | `List<AttemptAnswerResultDto>` | No | Question breakdown with correct option indicators |

---

#### 11.4.8 Get Attempt Result Summary

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-attempts/{attemptId}/result` |
| **Purpose** | Get graded score overview without revealing question details |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `STUDENT`, `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Attempt ID |

##### Response

**Response Data (`ApiResponse.data`):** `AttemptResultResponse`

---

### 11.5 Essay Grading

#### 11.5.1 Get Essay Submissions for Quiz

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quiz-gradings/{quizId}/essays`<br>`GET /api/v1/quiz-gradings/{quizId}/pending` |
| **Purpose** | Get cursor-paginated list of student essay answers for manual grading |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN`, `LECTURER` (`@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `quizId` | `UUID` | ✅ Required | Target quiz ID |

##### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `String` | ❌ Optional | `"ALL"` | Filter: `"ALL"`, `"PENDING"`, `"GRADED"` |
| `nextCursor` | `String` | ❌ Optional | `null` | Pagination cursor |

##### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<QuizEssaySubmissionResponse>`

**DTO:** `QuizEssaySubmissionResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `attemptAnswerId`| `UUID` | No | Answer record ID |
| `attemptId` | `UUID` | No | Attempt ID |
| `questionId` | `UUID` | No | Question ID |
| `assignmentId` | `UUID` | No | Assignment ID |
| `assignmentName` | `String` | No | Name of assignment |
| `studentUsername`| `String` | No | Student username |
| `studentFullName`| `String` | No | Student display name |
| `submittedAt` | `LocalDateTime` | No | Submission timestamp |
| `questionContent`| `String` | No | Essay prompt statement |
| `maxPoints` | `BigDecimal` | No | Maximum points possible |
| `answerText` | `String` | No | Student's written answer |
| `awardedPoints` | `BigDecimal` | Yes | Points awarded by grader |
| `feedback` | `String` | Yes | Grader comments |
| `gradedBy` | `String` | Yes | Grader username |
| `gradedAt` | `LocalDateTime` | Yes | Graded timestamp |
| `essayStatus` | `String` | No | `"PENDING_GRADE"` or `"GRADED"` |

---

#### 11.5.2 Grade Essay Question

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quiz-gradings/attempts/{attemptId}/questions/{questionId}` |
| **Purpose** | Submit points and feedback for a student essay answer |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attemptId` | `UUID` | ✅ Required | Target attempt ID |
| `questionId` | `UUID` | ✅ Required | Target essay question ID |

##### Request Body

**DTO:** `GradeEssayRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `awardedPoints` | `BigDecimal` | ✅ Required | `@NotNull(message = "Awarded points is required")`<br>`@DecimalMin(value = "0.0", message = "Awarded points cannot be negative")` | Score awarded (≥ 0.0) |
| `feedback` | `String` | ❌ Optional | Nullable | Grader feedback comments |

##### Response

**Response Data (`ApiResponse.data`):** `AttemptResultResponse` (with updated total score)

---

### 11.6 AI Quiz Generation & Documents

#### 11.6.1 Generate Quiz from Document

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/generate-from-document` |
| **Purpose** | Launch an asynchronous LLM generation pipeline to create questions from document chunks |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Request Body

**DTO:** `GenerateQuizFromDocumentRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Nullable in DTO, required by business logic | Target course ID |
| `quizId` | `UUID` | ❌ Optional | Nullable (Creates new draft quiz if omitted) | Target quiz ID |
| `sourceType` | `DocumentSourceType` | ✅ Required | Enum: `LIBRARY`, `UPLOAD` | Source origin |
| `documentId` | `UUID` | ❌ Optional* | Required if `sourceType == LIBRARY` | Library document ID |
| `documentObjectKey`| `String` | ❌ Optional* | Required if `sourceType == UPLOAD` (`@Size(max = 500)`) | S3 storage key |
| `documentName` | `String` | ❌ Optional | `@Size(max = 255)` | File name |
| `saveDocument` | `Boolean` | ❌ Optional | Default `false` | If true, promotes uploaded doc to global library |
| `topic` | `String` | ❌ Optional | `@Size(max = 255)` | Target topic scope |
| `description` | `String` | ❌ Optional | `@Size(max = 2000)` | Context guidelines |
| `totalQuestions` | `Integer` | ❌ Optional | `@Min(1)`, `@Max(100)` | Target question count (1–100) |
| `typeDistribution`| `Map<QuestionType, Integer>` | ❌ Optional | Map of QuestionType to counts | Distribution by question type |
| `difficultyDistribution`| `Map<QuestionDifficulty, Integer>`| ❌ Optional | Map of Difficulty to counts | Distribution by difficulty |

##### Response

**Response Data (`ApiResponse.data`):** `QuizGenerationJobResponse`

**DTO:** `QuizGenerationJobResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `jobId` | `UUID` | No | Background generation job ID for polling |
| `courseId` | `UUID` | No | Course ID |
| `documentId` | `UUID` | Yes | Source document ID |
| `documentName` | `String` | Yes | Source document name |
| `status` | `QuizGenerationJobStatus` | No | `PENDING`, `EXTRACTING`, `PLANNING`, `GENERATING`, `VALIDATING`, `COMPLETED`, `FAILED` |
| `currentStep` | `String` | Yes | Step description |
| `requestedTotal` | `Integer` | Yes | Target question count |
| `usableCapacity` | `Integer` | Yes | Document capacity |
| `processedCount` | `Integer` | Yes | Processed count |
| `acceptedCount` | `Integer` | Yes | Validated accepted questions count |
| `rejectedCount` | `Integer` | Yes | Rejected questions count |
| `rejectionReasons`| `Map<String, Integer>` | Yes | Breakdown of validation rejections |
| `resultQuizId` | `UUID` | Yes | Generated Quiz ID |
| `errorMessage` | `String` | Yes | Failure error message |
| `tokenUsage` | `Integer` | Yes | Total LLM tokens used |
| `executionTimeMs`| `Long` | Yes | Total pipeline runtime in ms |

---

#### 11.6.2 Generate Quiz from File Upload

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/quizzes/generate-from-file` |
| **Purpose** | Upload a PDF file directly and launch AI quiz generation |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |
| **Content-Type** | `multipart/form-data` |

##### Form Parameters

| Parameter | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` | `MultipartFile` | ✅ Required | `@NotNull(message = "File is required")` | Uploaded PDF document file |
| `quizId` | `UUID` | ✅ Required | `@NotNull(message = "Quiz ID is required")` | Target quiz ID |
| `description` | `String` | ✅ Required | `@NotBlank(message = "Description is required")` | Prompt / generation instructions |
| `saveDocument` | `Boolean` | ❌ Optional | Default `false` | Save to document library |

##### Response

**Response Data (`ApiResponse.data`):** `QuizGenerationJobResponse`

---

#### 11.6.3 Get Quiz Generation Job Status

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quizzes/generation-jobs/{jobId}` |
| **Purpose** | Poll the progress and result of an AI quiz generation job |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jobId` | `UUID` | ✅ Required | Generation job ID |

##### Response

**Response Data (`ApiResponse.data`):** `QuizGenerationJobResponse`

---

#### 11.6.4 Get Question Source Traceability

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/quizzes/generation-jobs/{jobId}/traceability/{questionId}` |
| **Purpose** | Trace an AI-generated question back to the exact PDF page, section, and text chunk |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jobId` | `UUID` | ✅ Required | Generation job ID |
| `questionId` | `UUID` | ✅ Required | Generated question ID |

##### Response

**Response Data (`ApiResponse.data`):** `QuestionSourceTraceResponse`

**DTO:** `QuestionSourceTraceResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Trace ID |
| `questionId` | `UUID` | Question ID |
| `generationJobId`| `UUID` | Job ID |
| `documentId` | `UUID` | Source Document ID |
| `chunkId` | `UUID` | Text chunk ID |
| `sectionName` | `String` | Heading section in PDF |
| `pageNumber` | `Integer` | Page number in source PDF |
| `modelName` | `String` | OpenAI model used |
| `promptVersion` | `String` | Prompt version |
| `attemptCount` | `Integer` | Generation retries count |
| `validationMetrics`| `String` | JSON string with quality validation scores |
| `createdAt` | `LocalDateTime` | Timestamp |

---

#### 11.6.5 Search Document Library

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/documents/library` |
| **Purpose** | Search global course document repository for AI quiz generation sources |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fileName` | `String` | ❌ Optional | File name filter query |
| `nextCursor` | `String` | ❌ Optional | Pagination cursor |

##### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<CourseDocumentResponse>`

**DTO:** `CourseDocumentResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Document ID |
| `title` | `String` | Display title |
| `fileName` | `String` | File name |
| `fileObjectKey` | `String` | S3 object storage key |
| `fileSize` | `Long` | File size in bytes |
| `contentHash` | `String` | SHA-256 content hash |
| `status` | `DocumentStatus` | `UPLOADING`, `PROCESSING`, `READY`, `FAILED` |
| `visibility` | `DocumentVisibility` | `TEMPORARY`, `GLOBAL` |
| `isPromoted` | `Boolean` | Whether promoted to permanent library |
| `createdBy` | `String` | Uploader username |
| `createdAt` | `LocalDateTime` | Upload date |
| `updatedAt` | `LocalDateTime` | Modification date |

---

#### 11.6.6 Upload Document to Global Library - Admin

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/documents/library/upload` |
| **Purpose** | Admin upload directly into permanent global reference library |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |
| **Content-Type** | `multipart/form-data` |

##### Form Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | `MultipartFile` | ✅ Required | Document file (PDF, Markdown) |
| `title` | `String` | ❌ Optional | Custom title |

##### Response

**Response Data (`ApiResponse.data`):** `CourseDocumentResponse`

---

#### 11.6.7 Delete Document from Library - Admin

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/documents/library/{id}` |
| **Purpose** | Soft delete document from global library |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Document unique identifier |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Document deleted successfully"`)

---

#### 11.6.8 Get Document Upload Audit Logs

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/documents/audits/course/{courseId}` |
| **Purpose** | Get document upload and promotion audit logs for a course |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `LECTURER`, `ADMIN` (`@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | `UUID` | ✅ Required | Associated course ID |

##### Response

**Response Data (`ApiResponse.data`):** `List<DocumentUploadAuditResponse>`

**DTO:** `DocumentUploadAuditResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Audit ID |
| `uploadedBy` | `String` | Uploader username |
| `userRole` | `String` | Role (`LECTURER`, `ADMIN`) |
| `fileName` | `String` | Uploaded file name |
| `fileSize` | `Long` | Size in bytes |
| `contentHash` | `String` | SHA-256 hash |
| `quizId` | `UUID` | Associated Quiz ID |
| `courseId` | `UUID` | Associated Course ID |
| `generationJobId`| `UUID` | Linked AI job ID |
| `requestedSave` | `Boolean` | Whether user requested promotion |
| `isPromoted` | `Boolean` | Promotion status |
| `promotionStatus`| `String` | Status string |
| `failureReason` | `String` | Failure message if any |
| `createdAt` | `LocalDateTime` | Log timestamp |

---
## 12. Notification & FCM Module

Unified notification feed (combining personal notifications and role-targeted broadcast announcements), read status tracking, and Firebase Cloud Messaging (FCM) device token management.

---

### 12.1 Personal & Feed Notifications

#### 12.1.1 Get Unified Notification Feed

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/notifications` |
| **Purpose** | Get unified cursor-paginated notification feed combining personal and role-targeted announcements |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

##### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cursor` | `String` | ❌ Optional | Keyset cursor pagination token |

##### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<NotificationResponse>`

**DTO:** `NotificationResponse`

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Notification unique identifier |
| `username` | `String` | Yes | Target user (`null` for group notifications) |
| `type` | `String` | No | System event trigger type |
| `title` | `String` | No | Notification title |
| `content` | `String` | No | Notification message body |
| `targetData` | `Map<NotificationTargetType, String>` | Yes | Deep link map (e.g. `{"COURSE": "019ebac1-...", "LECTURE": "019ebac1-..."}`) |
| `isRead` | `Boolean` | No | Read status |
| `readAt` | `LocalDateTime` | Yes | Timestamp when marked as read |
| `createdAt` | `LocalDateTime` | No | Created timestamp |
| `category` | `NotificationCategory` | No | `PERSONAL` or `GROUP` |
| `createdBy` | `String` | Yes | Creator username (for admin group announcements) |
| `targetRoles` | `List<RoleEnum>` | Yes | Target roles (for group announcements) |

##### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "contents": [
      {
        "id": "019ebac1-40fb-7a3f-a81e-5bb153357391",
        "username": "student_bob",
        "type": "COURSE_NEW_LECTURE",
        "title": "New Lecture Added",
        "content": "A new lecture '2. Spring Security 6' has been published in Spring Boot 3.5 Masterclass.",
        "targetData": {
          "COURSE": "019ebac1-40fb-7a3f-a81e-5bb1533573c1",
          "LECTURE": "019ebac1-40fb-7a3f-a81e-5bb153357341"
        },
        "isRead": false,
        "readAt": null,
        "createdAt": "2026-08-25T15:00:00",
        "category": "PERSONAL",
        "createdBy": null,
        "targetRoles": null
      }
    ],
    "totalPages": 0,
    "pageSize": 15,
    "totalElements": 0,
    "currentPage": 0,
    "nextCursor": null
  },
  "timestamp": 1721234567890
}
```

---

#### 12.1.2 Get Unread Notification Counts

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/notifications/unread-count` |
| **Purpose** | Get badge unread counters for personal, group, and total unread notifications |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

##### Response

**Response Data (`ApiResponse.data`):** `UnreadCountResponse`

**DTO:** `UnreadCountResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `personalUnreadCount`| `long` | Number of unread personal notifications |
| `groupUnreadCount` | `long` | Number of unread group announcements for caller's role |
| `totalUnreadCount` | `long` | Sum of personal and group unread count |

##### Example Response

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "personalUnreadCount": 3,
    "groupUnreadCount": 1,
    "totalUnreadCount": 4
  },
  "timestamp": 1721234567890
}
```

---

#### 12.1.3 Mark Notification(s) as Read

| Property | Value |
| :--- | :--- |
| **Endpoint** | `PUT /api/v1/notifications/read` |
| **Purpose** | Mark a specific notification as read, or mark ALL notifications as read if `id` is omitted |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

##### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | ❌ Optional | `null` | Notification ID. If omitted, marks ALL notifications as read for current user. |
| `category` | `NotificationCategory` | ❌ Optional | `PERSONAL` | Category of target notification (`PERSONAL` or `GROUP`) |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Notification marked as read successfully"`)

---

#### 12.1.4 Delete Personal Notification

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/notifications/{id}` |
| **Purpose** | Remove a personal notification from user's feed |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (Owner only) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Personal notification ID |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Notification deleted successfully"`)

---

### 12.2 Group Notifications (Admin)

#### 12.2.1 Create Group Notification

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/notifications/group` |
| **Purpose** | Admin broadcast announcement to specific user roles |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

##### Request Body

**DTO:** `CreateGroupNotificationRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `String` | ✅ Required | Must not be blank | Announcement title |
| `content` | `String` | ✅ Required | Must not be blank | Announcement message |
| `targetRoles` | `Set<RoleEnum>` | ✅ Required | Validated non-empty in service | Target audience roles (`ADMIN`, `LECTURER`, `STUDENT`) |

##### Example Request

```http
POST /api/v1/notifications/group
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Scheduled System Maintenance",
  "content": "DevEdu platform will undergo scheduled maintenance this Sunday from 01:00 to 03:00 UTC.",
  "targetRoles": ["STUDENT", "LECTURER"]
}
```

##### Response

**Response Data (`ApiResponse.data`):** `NotificationResponse`

---

#### 12.2.2 Delete Group Notification

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/notifications/group/{id}` |
| **Purpose** | Soft delete an admin group announcement |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

##### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ Required | Group notification unique identifier |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Group notification deleted successfully"`)

---

#### 12.2.3 Get All Group Notifications

| Property | Value |
| :--- | :--- |
| **Endpoint** | `GET /api/v1/notifications/group/all` |
| **Purpose** | Admin view of all broadcast group notifications |
| **Authentication** | Required (Bearer Token) |
| **Permission** | `ADMIN` (`@PreAuthorize("hasAuthority('ADMIN')")`) |

##### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cursor` | `String` | ❌ Optional | Keyset cursor pagination token |

##### Response

**Response Data (`ApiResponse.data`):** `CustomPaging<NotificationResponse>`

---

### 12.3 FCM Device Tokens

#### 12.3.1 Register FCM Device Token

| Property | Value |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/notifications/device-tokens` |
| **Purpose** | Register or update browser/mobile Firebase Cloud Messaging (FCM) push token |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

##### Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `User-Agent` | `String` | ❌ Optional | Browser/client device user-agent string |

##### Request Body

**DTO:** `RegisterDeviceTokenRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fcmToken` | `String` | ✅ Required | `@NotBlank(message = "fcmToken must not be blank")` | FCM registration token string |
| `deviceType` | `String` | ❌ Optional | e.g. `WEB`, `ANDROID`, `IOS` | Client device platform |

##### Example Request

```http
POST /api/v1/notifications/device-tokens
Authorization: Bearer <token>
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
Content-Type: application/json

{
  "fcmToken": "c1a9Fz3...:APA91bFw8...",
  "deviceType": "WEB"
}
```

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Device token registered successfully"`)

---

#### 12.3.2 Unregister FCM Device Token

| Property | Value |
| :--- | :--- |
| **Endpoint** | `DELETE /api/v1/notifications/device-tokens` |
| **Purpose** | Unregister / deactivate FCM device push token upon user logout |
| **Authentication** | Required (Bearer Token) |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

##### Request Body

**DTO:** `UnregisterDeviceTokenRequest` (`application/json`)

| Field | Type | Required | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fcmToken` | `String` | ✅ Required | `@NotBlank(message = "fcmToken must not be blank")` | FCM registration token to remove |

##### Response

**Response Data (`ApiResponse.data`):** `String` (`"Device token unregistered successfully"`)

---
