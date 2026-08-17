# API Reference — Dev-Edu Backend

> Comprehensive REST API reference documentation for the Dev-Edu Backend system.

---

## Table of Contents

- [General Information](#general-information)
- [1. User Module](#1-user-module)
  - [1.1 User Registration](#11-user-registration)
  - [1.2 Batch Create Users](#12-batch-create-users)
  - [1.3 Get User List](#13-get-user-list)
  - [1.4 Change Password](#14-change-password)
  - [1.5 Update Avatar](#15-update-avatar)
  - [1.6 Set Username for Google Login](#16-set-username-for-google-login)
  - [1.7 Get Current User Profile](#17-get-current-user-profile)
- [2. Course Module](#2-course-module)
  - [2.1 Get All Categories](#21-get-all-categories)
  - [2.2 Create Category](#22-create-category)
  - [2.3 Update Category](#23-update-category)
  - [2.4 Delete Category](#24-delete-category)
  - [2.5 Get Course List](#25-get-course-list)
  - [2.6 Get Featured Courses](#26-get-featured-courses)
  - [2.7 Get Course Details](#27-get-course-details)
  - [2.8 Create Course](#28-create-course)
  - [2.9 Update Course](#29-update-course)
  - [2.10 Delete Course](#210-delete-course)
  - [2.11 Get Discount List](#211-get-discount-list)
  - [2.12 Create Discount](#212-create-discount)
  - [2.13 Delete Discount](#213-delete-discount)
  - [2.14 Get Course Reviews](#214-get-course-reviews)
  - [2.15 Get My Reviews](#215-get-my-reviews)
  - [2.16 Create Review](#216-create-review)
  - [2.17 Delete Review](#217-delete-review)
- [3. Enrollment Module](#3-enrollment-module)
  - [3.1 Add Course to Cart](#31-add-course-to-cart)
  - [3.2 Remove Course from Cart](#32-remove-course-from-cart)
  - [3.3 Get Cart List](#33-get-cart-list)
  - [3.4 Get Enrolled Courses](#34-get-enrolled-courses)
  - [3.5 Get Assigned Courses (Lecturer)](#35-get-assigned-courses-lecturer)
  - [3.6 Get Enrolled Students List](#36-get-enrolled-students-list)
  - [3.7 Checkout Order](#37-checkout-order)
  - [3.8 Get Order Details](#38-get-order-details)
  - [3.9 Get Order History](#39-get-order-history)
  - [3.10 Cancel Order](#310-cancel-order)
  - [3.11 Purchase / Payment](#311-purchase--payment)
  - [3.12 VNPay Return Callback](#312-vnpay-return-callback)
  - [3.13 Cancel Payment](#313-cancel-payment)
- [4. Lecture Module](#4-lecture-module)
- [5. Assignment Module](#5-assignment-module)
- [6. File Module](#6-file-module)
- [7. Forum Module](#7-forum-module)
- [8. Metric Module](#8-metric-module)
- [10. Chat Module](#10-chat-module)
  - [10.1 Send Consultation Message](#101-send-consultation-message)
  - [10.2 Get Conversation History](#102-get-conversation-history)
  - [10.3 Get Message Details in Conversation](#103-get-message-details-in-conversation)
- [11. Quiz Module](#11-quiz-module)
  - [11.1 Quiz Assessment Management](#111-quiz-assessment-management)
  - [11.2 Questions & Options Management](#112-questions--options-management)
  - [11.3 Assign Quiz](#113-assign-quiz)
  - [11.4 Take Quiz Attempt](#114-take-quiz-attempt)
  - [11.5 Essay Grading](#115-essay-grading)
- [12. Notification Module](#12-notification-module)
  - [12.1 Personal Notifications](#121-personal-notifications)
  - [12.2 Group Notifications](#122-group-notifications)
  - [12.3 Register FCM Device Token](#123-register-fcm-device-token)

---

## General Information

### Base URL

```
http://localhost:9000
```

### Response Format (All APIs)

All API endpoints return data wrapped in the `ApiResponse` envelope:

**Success (HTTP 200):**

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": { ... },
  "timestamp": 1721234567890
}
```

**Error (HTTP 200 — error status in payload body):**

```json
{
  "success": false,
  "status": "BAD_REQUEST",
  "message": "Error description",
  "data": null,
  "timestamp": 1721234567890
}
```

> **Important Note**: All responses return HTTP status 200; actual business status codes reside in the `status` property of `ApiResponse`.

### Authentication

- Authenticate using **OAuth2 Bearer Token (JWT)** in the `Authorization` header.
- Header format: `Authorization: Bearer <access_token>`
- Tokens are issued via the OAuth2 token endpoint using custom password grant type.

### Possible Error Statuses (Global)

| Status in `ApiResponse.status` | Meaning |
|---|---|
| `UNAUTHORIZED` (401) | Unauthenticated or expired token |
| `FORBIDDEN` (403) | Insufficient permissions |
| `BAD_REQUEST` (400) | Invalid input payload |
| `CONFLICT` (409) | Data constraint violation (unique, foreign key) |
| `METHOD_NOT_ALLOWED` (405) | HTTP method not supported |
| `REQUEST_TIMEOUT` (408) | Request timed out |
| `INTERNAL_SERVER_ERROR` (500) | Internal server error |

### System Roles

| Role | Description |
|---|---|
| `ADMIN` | Administrator — full system access |
| `LECTURER` | Instructor — manages lectures, materials, assignments, grading |
| `STUDENT` | Student — enrolls, submits assignments, makes payments |

---

## 1. User Module

### 1.1 User Registration

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/users/register` |
| **Permission** | Public (No authentication required) |
| **Description** | Register a new account with STUDENT role |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `username` | `String` | ✅ | Alphanumeric characters and underscores only (`[a-zA-Z0-9_]`) |
| `email` | `String` | ✅ | Must be a valid email address |
| `password` | `String` | ✅ | Minimum 8 characters, requiring uppercase, lowercase, number, and special character `@$!%*?&` |
| `fullName` | `String` | ✅ | Must not be blank |

> **Note**: The `role` field in the DTO is overridden to `STUDENT` in the controller.

**Success Response:** `"Register successful. Please login to continue."`

---

### 1.2 Batch Create Users

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/users/batch-users` |
| **Permission** | `ADMIN` |
| **Description** | Batch create multiple user accounts simultaneously |

**Request Body:** Array of `RegisterUser[]` (same format as registration, but `role` can be specified).

**Success Response:** `"Create users successful."`

---

### 1.3 Get User List

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/users` |
| **Permission** | `ADMIN` |
| **Description** | Search and filter paginated list of users |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `page` | `int` | ✅ | Page number (0-based) |
| `role` | `RoleEnum` | ✅ | Filter by role: `ADMIN`, `LECTURER`, `STUDENT` |
| `keyword` | `String` | ✅ | Search keyword |

**Success Response:** `CustomPaging` object containing user list. Default page size: 15.

---

### 1.4 Change Password

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/users/change-password` |
| **Permission** | Authenticated (Any role) |
| **Description** | Change password for current logged-in user |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `oldPassword` | `String` | ✅ | Old password |
| `newPassword` | `String` | ✅ | New password |

**Success Response:** `"Change password successful."`

---

### 1.5 Update Avatar

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/users/avatar` |
| **Permission** | Authenticated |
| **Description** | Update avatar for current logged-in user |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `avatarObjectKey` | `String` | ✅ | Object key of uploaded avatar file |

**Success Response:** New avatar URL (String).

---

### 1.6 Set Username for Google Login

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/users/username` |
| **Permission** | Authenticated |
| **Description** | Set username after Google OAuth login |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `String` | ✅ | Email from Google account |
| `username` | `String` | ✅ | New username |

**Success Response:** `"Username updated successfully."`

---

### 1.7 Get Current User Profile

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/me` |
| **Permission** | Authenticated |
| **Description** | Get profile information of current logged-in user |

**Success Response:**

```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "avatarUrl": "string | null",
  "role": "ADMIN | LECTURER | STUDENT"
}
```

---

## 2. Course Module

### 2.1 Get All Categories

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/categories` |
| **Permission** | `permitAll()` (GET) |
| **Description** | Get list of all categories. Non-ADMIN users see ACTIVE categories only. |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `status` | `ItemStatus` | ❌ | `ACTIVE`, `DELETED`, `ALL`. Non-ADMIN is overridden to `ACTIVE` |

---

### 2.2 Create Category

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/categories` |
| **Permission** | `ADMIN` |
| **Description** | Create a new course category |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | `UUID` | ❌ | **Must be null** during creation (validation group `CreateValidation`) |
| `name` | `String` | ✅ | Must not be blank |
| `description` | `String` | ✅ | Must not be blank |
| `thumbnailObjectKey` | `String` | ✅ | Must not be blank |

---

### 2.3 Update Category

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/categories` |
| **Permission** | `ADMIN` |
| **Description** | Update an existing category |

**Request Body:** Same format as `CategoryRequest`, but `id` is **required** (validation group `UpdateValidation`).

---

### 2.4 Delete Category

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/categories/{categoryId}` |
| **Permission** | `ADMIN` |

**Path Variable:** `categoryId` — `UUID`

---

### 2.5 Get Course List

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/courses` |
| **Permission** | `permitAll()` |
| **Description** | Get cursor-paginated list of courses. Non-ADMIN users see ACTIVE courses only. |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `sortBy` | `String` | ❌ | Sort field |
| `nextCursor` | `String` | ❌ | Cursor for next page (Base64 encoded) |
| `categoryId` | `UUID` | ❌ | Filter by category |
| `keyword` | `String` | ❌ | Search keyword |
| `page` | `int` | ❌ | Page number (default 0) |
| `status` | `ItemStatus` | ❌ | Non-ADMIN requests are overridden to `ACTIVE` |

**Response:** `CustomPaging` containing course list. ADMIN: 10 items/page, others: 15 items/page.

---

### 2.6 Get Featured Courses

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/courses/highlighted` |
| **Permission** | `permitAll()` |
| **Description** | Get list of highlighted featured courses (cached in Redis) |

---

### 2.7 Get Course Details

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/courses/{courseId}/` |
| **Permission** | `permitAll()` |

**Path Variable:** `courseId` — `UUID`

---

### 2.8 Create Course

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/courses` |
| **Permission** | `ADMIN` |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | `UUID` | ❌ | **Must be null** during creation |
| `categoryId` | `UUID` | ✅ | Category ID |
| `title` | `String` | ✅ | Maximum 255 characters |
| `description` | `String` | ✅ | Must not be blank |
| `price` | `BigDecimal` | ❌ | ≥ 0.0 |
| `thumbnailObjectKey` | `String` | ✅ | Thumbnail object key |
| `lecturerUsernames` | `List<String>` | ✅ | At least 1 lecturer username required, elements must not be blank |

---

### 2.9 Update Course

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/courses` |
| **Permission** | `ADMIN` |

**Request Body:** Same format as `CourseRequest`, `id` is **required**.

---

### 2.10 Delete Course

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/courses` |
| **Permission** | `ADMIN` |

**Query Parameter:** `courseId` — `UUID`

---

### 2.11 Get Discount List

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/course-discounts` |
| **Permission** | `ADMIN` |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `nextCursor` | `String` | ❌ | Pagination cursor |
| `courseId` | `UUID` | ❌ | Optional course filter |

---

### 2.12 Create Discount

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/course-discounts` |
| **Permission** | `ADMIN` |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `courseId` | `UUID` | ❌ | Null = applies to all courses |
| `description` | `String` | ✅ | Discount description |
| `discountPercentage` | `BigDecimal` | ✅ | 0.01 – 100.00 |
| `validFrom` | `LocalDate` | ✅ | Must not be in the past (`@FutureOrPresent`) |
| `validTo` | `LocalDate` | ✅ | Must not be in the past (`@FutureOrPresent`) |

---

### 2.13 Delete Discount

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/course-discounts` |
| **Permission** | `ADMIN` |

**Query Parameter:** `discountId` — `UUID`

---

### 2.14 Get Course Reviews

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/courses/reviews` |
| **Permission** | `permitAll()` (GET) |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `courseId` | `UUID` | ✅ | Course ID |
| `nextCursor` | `String` | ❌ | Pagination cursor |

---

### 2.15 Get My Reviews

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/courses/reviews/me` |
| **Permission** | `STUDENT` |

**Query Parameter:** `courseId` — `UUID`

---

### 2.16 Create Review

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/courses/reviews` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `courseId` | `UUID` | ✅ | |
| `content` | `String` | ✅ | Must not be blank |
| `rating` | `int` | ✅ | 1 – 5 |

---

### 2.17 Delete Review

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/courses/reviews` |
| **Permission** | Authenticated (STUDENT deletes own review, ADMIN can delete any) |

**Query Parameter:** `reviewId` — `UUID`

---

## 3. Enrollment Module

### 3.1 Add Course to Cart

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/cart/items/courses` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `courseId` | `String` (UUID format) | ✅ |

---

### 3.2 Remove Course from Cart

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/cart/items/courses` |
| **Permission** | `STUDENT` |

**Query Parameter:** `courseId` — `UUID`

---

### 3.3 Get Cart List

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/cart/items/courses` |
| **Permission** | `STUDENT` |

**Query Parameter:** `nextCursor` — `String` (❌ optional)

---

### 3.4 Get Enrolled Courses

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments` |
| **Permission** | `STUDENT` |

**Query Parameter:** `nextCursor` — `String` (❌ optional)

---

### 3.5 Get Assigned Courses (Lecturer)

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments/assigned-courses` |
| **Permission** | `LECTURER` |

**Query Parameters:**

| Param | Type | Required |
|---|---|---|
| `nextCursor` | `String` | ❌ |
| `keyword` | `String` | ❌ |
| `categoryId` | `UUID` | ❌ |

---

### 3.6 Get Enrolled Students List

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments/enrolled-users` |
| **Permission** | `LECTURER` or `ADMIN` |

**Query Parameters:**

| Param | Type | Required |
|---|---|---|
| `courseId` | `UUID` | ✅ |
| `nextCursor` | `String` | ❌ |

---

### 3.7 Checkout Order

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/orders/checkout` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `entityIds` | `List<UUID>` | ✅ | Must not be empty |
| `entityType` | `PurchaseEntityType` | ✅ | `COURSE` or `SUBSCRIPTION` |

---

### 3.8 Get Order Details

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/orders` |
| **Permission** | `STUDENT` |

**Query Parameter:** `orderId` — `UUID`

---

### 3.9 Get Order History

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/orders/history` |
| **Permission** | `STUDENT` |

**Query Parameters:**

| Param | Type | Required | Constraint |
|---|---|---|---|
| `nextCursor` | `String` | ❌ | |
| `orderStatus` | `PaymentStatus` | ✅ | `COMPLETED`, `FAILED`, `CANCELLED` (`PENDING` not accepted) |

---

### 3.10 Cancel Order

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/orders/cancel` |
| **Permission** | `STUDENT` |

**Query Parameter:** `orderId` — `UUID`

---

### 3.11 Purchase / Payment

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/enrollments` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `UUID` | ✅ | Order ID for payment |
| `paymentMethod` | `PaymentMethod` | ✅ | `VNPAY`, `MOMO`, `ZALOPAY`, `PAYPAL`, `STRIPE` |

> Client IP address is automatically resolved from `X-FORWARDED-FOR` header or `request.getRemoteAddr()`.

---

### 3.12 VNPay Return Callback

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments/vnpay-return` |
| **Permission** | `STUDENT` |
| **Description** | Callback endpoint invoked by VNPay following payment completion |

**Query Parameters (from VNPay):** `vnp_TxnRef`, `vnp_ResponseCode`

---

### 3.13 Cancel Payment

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/enrollments/cancel` |
| **Permission** | `STUDENT` |

**Query Parameter:** `paymentId` — `UUID`

---

## 4. Lecture Module

### 4.1 Get Lectures by Course

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/lectures` |
| **Permission** | `permitAll()` |

**Query Parameter:** `courseId` — `UUID` (✅)

---

### 4.2 Get Lecture Details

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/lectures/{lectureId}` |
| **Permission** | Authenticated |

---

### 4.3 Get Lecture Materials

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/lectures/{lectureId}/materials` |
| **Permission** | Authenticated |

---

### 4.4 Create Lecture

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/lectures` |
| **Permission** | `LECTURER` or `ADMIN` |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | `UUID` | ❌ | **Must be null** during creation |
| `courseId` | `UUID` | ✅ (create) | |
| `title` | `String` | ✅ | Must not be blank |
| `summary` | `String` | ✅ | Must not be blank |
| `content` | `String` | ❌ | |
| `videoObjectKey` | `String` | ❌ (create) | **Must be null** during update |

---

### 4.5 Create Material

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/lectures/materials` |
| **Permission** | `LECTURER` or `ADMIN` |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `lectureId` | `UUID` | ✅ |
| `title` | `String` | ✅ |
| `fileObjectKey` | `String` | ✅ |

---

### 4.6 Update Lecture

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/lectures` |
| **Permission** | `LECTURER` or `ADMIN` |

**Request Body:** Same `LectureRequest` format, `id` **required**, `videoObjectKey` **must be null**.

---

### 4.7 Delete Lecture

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/lectures` |
| **Permission** | `LECTURER` or `ADMIN` |

**Query Parameter:** `lectureId` — `UUID`

---

### 4.8 Delete Material

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/lectures/materials` |
| **Permission** | `LECTURER` or `ADMIN` |

**Query Parameter:** `materialId` — `UUID`

---

### 4.9 Update Video Progress

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/lectures/progress` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `lectureId` | `UUID` | ✅ | |
| `segmentStart` | `Integer` | ✅ | ≥ 0 |
| `segmentEnd` | `Integer` | ✅ | ≥ 0 |

---

### 4.10 Get Lecture Comments

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/lectures/comments/filter` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `lectureId` | `UUID` | ✅ | |
| `parentCommentId` | `UUID` | ❌ | Null = fetch top-level comments |
| `page` | `Integer` | ❌ | Default 0 |
| `size` | `Integer` | ❌ | Default 10 |

---

### 4.11 Create Lecture Comment

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/lectures/comments` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `lectureId` | `UUID` | ✅ |
| `parentCommentId` | `UUID` | ❌ |
| `content` | `String` | ✅ |

---

### 4.12 Delete Lecture Comment

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/lectures/comments` |
| **Permission** | Authenticated |

**Query Parameter:** `commentId` — `UUID`

---

## 5. Assignment Module

### 5.1 Get Assignments

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/assignments` |
| **Permission** | Authenticated |
| **Description** | Fetch by `lectureId` (list) or `assignmentId` (details). At least 1 parameter is required. |

**Query Parameters:**

| Param | Type | Required |
|---|---|---|
| `lectureId` | `UUID` | ❌ (At least 1 required) |
| `assignmentId` | `UUID` | ❌ (At least 1 required) |

---

### 5.2 Create Assignment

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/assignments` |
| **Permission** | `ADMIN` or `LECTURER` |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `lectureId` | `UUID` | ✅ |
| `title` | `String` | ✅ |
| `description` | `String` | ✅ |

---

### 5.3 Delete Assignment

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/assignments` |
| **Permission** | `ADMIN` or `LECTURER` |

**Query Parameter:** `assignmentId` — `UUID`

---

### 5.4 Get Feedback

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/assignments/feedbacks` |
| **Permission** | Authenticated (STUDENT sees own feedback only) |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `assignmentId` | `UUID` | ✅ | |
| `studentUsername` | `String` | ❌ | STUDENT: Automatically overridden to current username |

---

### 5.5 Create Feedback

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/assignments/feedbacks` |
| **Permission** | `ADMIN` or `LECTURER` |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `assignmentId` | `UUID` | ✅ |
| `studentUsername` | `String` | ✅ |
| `feedback` | `String` | ✅ |

---

### 5.6 Delete Feedback

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/assignments/feedbacks` |
| **Permission** | `ADMIN` or `LECTURER` |

**Query Parameter:** `feedbackId` — `UUID`

---

### 5.7 Get Submissions

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/assignments/submissions` |
| **Permission** | `ADMIN` or `LECTURER` |

**Query Parameters:**

| Param | Type | Required | Default |
|---|---|---|---|
| `assignmentId` | `UUID` | ✅ | |
| `page` | `int` | ❌ | 0 |
| `size` | `int` | ❌ | 10 |

---

### 5.8 Submit Assignment

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/assignments/submissions` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `assignmentId` | `UUID` | ✅ |
| `fileObjectKey` | `String` | ✅ |

---

### 5.9 Cancel Submission

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/assignments/submissions` |
| **Permission** | Authenticated |

**Query Parameter:** `assignmentId` — `UUID`

---

## 6. File Module

### 6.1 Create Pre-signed Upload URL

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/files/pre-signed-url` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `fileName` | `String` | ✅ | |
| `contentType` | `String` | ✅ | MIME type |
| `fileSize` | `Long` | ✅ | ≥ 1 |
| `isPublic` | `Boolean` | ❌ | |

---

### 6.2 Get File Metadata

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/files/metadata` |
| **Permission** | Authenticated |

**Query Parameter:** `fullObjectKey` — `String`

---

### 6.3 Get Download Details

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/files/download` |
| **Permission** | Authenticated |

**Query Parameter:** `fullObjectKey` — `String`

---

### 6.4 Confirm Image Upload

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/files/confirm-image-upload` |
| **Permission** | Authenticated |

**Query Parameter:** `fullObjectKey` — `String`

---

## 7. Forum Module

### 7.1 Get Post Versions (Admin)

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/versions` |
| **Permission** | `ADMIN` |

**Query Parameters:** `status` (`PostStatus`: `PENDING`, `SUPERSEDED`, `APPROVED`, `REJECTED`) ✅, `lastCursor` ❌

---

### 7.2 Get Posted Articles

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/posted` |
| **Permission** | Authenticated |

**Query Parameters:** `lastCursor` ❌, `status` (`PostStatus`) ✅

---

### 7.3 Get Versions by Post ID

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/versions/{postId}` |
| **Permission** | Authenticated |

**Path Variable:** `postId`, **Query Parameter:** `status` (default `APPROVED`)

---

### 7.4 Update Post Version Status (Admin)

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/forum/posts/versions` |
| **Permission** | `ADMIN` |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `postVersionId` | `String` (UUID) | ✅ |
| `postStatus` | `String` (PostStatus) | ✅ |

---

### 7.5 Delete Post Version

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/posts/versions` |
| **Permission** | Authenticated (Post owner or ADMIN) |

**Query Parameter:** `postVersionId` — `UUID`

---

### 7.6 Get Post Details

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts` |
| **Permission** | `permitAll()` (GET) |

**Query Parameter:** `id` — `UUID` (✅)

---

### 7.7 Create Post

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/forum/posts` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `postId` | `UUID` | ❌ | **Must be null** during creation |
| `thumbObjectKey` | `String` | ✅ | |
| `title` | `String` | ✅ | Maximum 255 characters |
| `shortDescription` | `String` | ✅ | Maximum 500 characters |
| `content` | `String` | ✅ | |

---

### 7.8 Update Post

| Property | Value |
|---|---|
| **Endpoint** | `PUT /api/v1/forum/posts` |
| **Permission** | Authenticated |

**Request Body:** Same `PostRequest` format, `postId` **required**.

---

### 7.9 Delete Post

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/posts` |
| **Permission** | Authenticated (Post owner or ADMIN) |

**Query Parameter:** `postId` — `UUID`

---

### 7.10 Get Saved Posts

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/saved` |
| **Permission** | Authenticated |

**Query Parameter:** `nextCursor` ❌

---

### 7.11 Save Post

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/forum/posts/{postId}/save` |
| **Permission** | Authenticated |

---

### 7.12 Unsave Post

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/posts/{postId}/save` |
| **Permission** | Authenticated |

---

### 7.13 Post Feed

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/feed` |
| **Permission** | Authenticated |

**Query Parameter:** `nextCursor` ❌

---

### 7.14 Search Posts

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/search` |
| **Permission** | Authenticated |
| **Description** | Full-text search powered by Elasticsearch |

**Query Parameters:** `keyword` (`String`) ✅, `nextCursor` ❌

---

### 7.15 Related Posts

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/{postId}/related` |
| **Permission** | Authenticated |

---

### 7.16 Get Post Comments

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/comments` |
| **Permission** | `permitAll()` (GET) |

**Query Parameters:** `postId` (`UUID`) ✅, `nextCursor` ❌

---

### 7.17 Get Comment Replies

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/forum/comments/replies` |
| **Permission** | `permitAll()` (GET) |

**Query Parameters:** `parentCommentId` (`UUID`) ✅, `nextCursor` ❌

---

### 7.18 Create Comment

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/forum/comments` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `postId` | `UUID` | ✅ |
| `content` | `String` | ✅ |
| `repliedToCommentId` | `UUID` | ❌ |

---

### 7.19 Delete Comment

| Property | Value |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/comments` |
| **Permission** | Authenticated (Comment owner or ADMIN) |

**Query Parameter:** `commentId` — `UUID`

---

## 8. Metric Module

> All metric endpoints require `ADMIN` role.
> Base path: `/api/metrics`

### 8.1 Dashboard Overview

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/dashboard` |
| **Permission** | `ADMIN` |

---

### 8.2 Users Growth

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/users-growth` |
| **Permission** | `ADMIN` |

**Query Parameter:** `period` — `GrowthPeriod` (default `DAILY`): `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`

---

### 8.3 Courses Growth

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/courses-growth` |
| **Permission** | `ADMIN` |

**Query Parameter:** `period` — `GrowthPeriod` (default `DAILY`)

---

### 8.4 Revenue Growth

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/revenue-growth` |
| **Permission** | `ADMIN` |

**Query Parameter:** `period` — `GrowthPeriod` (default `DAILY`)

---

### 8.5 Activity Metrics

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/activity` |
| **Permission** | `ADMIN` |

**Query Parameter:** `days` — `int` (default `30`)

---

### 8.6 Top Courses

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/top-courses` |
| **Permission** | `ADMIN` |

**Query Parameter:** `limit` — `int` (default `10`)

---

### 8.7 Top Users

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/metrics/top-users` |
| **Permission** | `ADMIN` |

**Query Parameter:** `limit` — `int` (default `10`)

---

## 9. Tracking Module

### 9.1 Get Submission Tracking Logs

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/assignments/submissions/tracking` |
| **Permission** | Authenticated (STUDENT sees own logs only) |

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `assignmentId` | `UUID` | ✅ | |
| `studentUsername` | `String` | ❌ | STUDENT: Automatically overridden; Non-student: Required |
| `page` | `int` | ❌ | Default 0 |

---

## 10. Chat Module

Automated AI Chatbot course consultation module (powered by OpenAI Function Calling + PostgreSQL pgvector semantic search).

### 10.1 Send Consultation Message

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/chat/messages` |
| **Permission** | Public (Optional Auth: JWT enables personalization & history saving; unauthenticated handled as anonymous) |

**Request Body:**

```json
{
  "conversationId": "uuid | null",
  "message": "Hi, please suggest backend courses suitable for beginners",
  "history": [
    { "role": "user", "content": "Hello chatbot" },
    { "role": "assistant", "content": "Hello! How can I help you today?" }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | `UUID` | ❌ | Null when starting a new conversation. Authenticated: Backend validates conversation ownership. |
| `message` | `String` | ✅ | Message prompt content (Maximum 500 characters). |
| `history` | `Array` | ❌ | Required for anonymous requests (Frontend manages history). Ignored when authenticated (Backend loads from DB). |

**Response Data (`ChatMessageResponse`):**

```json
{
  "conversationId": "019ebac1-40fb-7a3f-a81e-5bb1533573d3",
  "reply": {
    "role": "assistant",
    "content": "Here are some backend programming courses suitable for beginners..."
  },
  "courses": [
    {
      "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573d4",
      "title": "Java Spring Boot Fundamentals",
      "shortDescription": "Introductory Spring Boot course from zero to hero",
      "price": 499000.00,
      "thumbnailUrl": "https://pub-r2.dev/thumbnail.jpg",
      "matchReason": "Matched to your Java learning preferences"
    }
  ]
}
```

---

### 10.2 Get Conversation History

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/chat/conversations` |
| **Permission** | Authenticated (`STUDENT` / `LECTURER` / `ADMIN`) |

**Response Data (`List<ChatConversationSummaryResponse>`):**

```json
[
  {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573d3",
    "lastMessagePreview": "Here are some backend programming courses suitable for beginners...",
    "updatedAt": "2026-08-12T16:50:00"
  }
]
```

---

### 10.3 Get Message Details in Conversation

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/chat/conversations/{id}/messages` |
| **Permission** | Authenticated (Conversation owner) |

**Path Variable:** `id` — `UUID` (Conversation ID)

**Response Data (`List<ChatMessageDetailResponse>`):**

```json
[
  {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573e1",
    "role": "user",
    "content": "Hi, please suggest backend courses suitable for beginners",
    "referencedCourseIds": null,
    "courses": [],
    "createdAt": "2026-08-12T16:49:50"
  },
  {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573e2",
    "role": "assistant",
    "content": "Here are some backend programming courses suitable for beginners...",
    "referencedCourseIds": [
      "019ebac1-40fb-7a3f-a81e-5bb1533573d4"
    ],
    "courses": [
      {
        "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573d4",
        "title": "Java Spring Boot Fundamentals",
        "shortDescription": "Introductory Spring Boot course from zero to hero",
        "price": 499000.00,
        "thumbnailUrl": "https://pub-r2.dev/thumbnail.jpg",
        "matchReason": "Course recommended in conversation"
      }
    ],
    "createdAt": "2026-08-12T16:50:00"
  }
]
```

---

## 11. Quiz Module

Quiz assessment creation, essay/multiple-choice attempt management, automated scoring & quiz assignments.

### 11.1 Quiz Assessment Management

| Property | Value |
|---|---|
| **Endpoints** | `GET /api/v1/quizzes`<br>`POST /api/v1/quizzes`<br>`GET /api/v1/quizzes/{id}`<br>`PUT /api/v1/quizzes/{id}`<br>`DELETE /api/v1/quizzes/{id}` |
| **Permission** | `LECTURER`, `ADMIN` (CRUD); `STUDENT` (View list/details) |

---

### 11.2 Questions & Options Management

| Property | Value |
|---|---|
| **Endpoints** | `GET /api/v1/quizzes/{quizId}/questions`<br>`POST /api/v1/quizzes/{quizId}/questions`<br>`PUT /api/v1/quizzes/{quizId}/questions/{questionId}`<br>`DELETE /api/v1/quizzes/{quizId}/questions/{questionId}` |
| **Permission** | `LECTURER`, `ADMIN` |

---

### 11.3 Assign Quiz

| Property | Value |
|---|---|
| **Endpoints** | `POST /api/v1/quizzes/{quizId}/assignments`<br>`GET /api/v1/quizzes/assignments`<br>`DELETE /api/v1/quizzes/assignments/{id}` |
| **Permission** | `LECTURER`, `ADMIN` |

---

### 11.4 Take Quiz Attempt

| Property | Value |
|---|---|
| **Endpoints** | `POST /api/v1/quizzes/attempts/start`<br>`POST /api/v1/quizzes/attempts/{attemptId}/save`<br>`POST /api/v1/quizzes/attempts/{attemptId}/submit`<br>`GET /api/v1/quizzes/attempts/{attemptId}/result` |
| **Permission** | Authenticated (`STUDENT`) |

---

### 11.5 Essay Grading

| Property | Value |
|---|---|
| **Endpoints** | `GET /api/v1/quizzes/grading/pending`<br>`POST /api/v1/quizzes/grading/grade` |
| **Permission** | `LECTURER`, `ADMIN` |

---

## 12. Notification Module

Personal notification management, role-target group notifications, and Firebase Cloud Messaging (FCM) device token registration.

### 12.1 Personal Notifications

| Property | Value |
|---|---|
| **Endpoints** | `GET /api/v1/notifications`<br>`PATCH /api/v1/notifications/{id}/read`<br>`PATCH /api/v1/notifications/read-all` |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

---

### 12.2 Group Notifications

| Property | Value |
|---|---|
| **Endpoints** | `GET /api/v1/notifications/groups`<br>`POST /api/v1/notifications/groups`<br>`PATCH /api/v1/notifications/groups/{id}/read` |
| **Permission** | `ADMIN` (Create); Authenticated (View & mark read by target role) |

---

### 12.3 Register FCM Device Token

| Property | Value |
|---|---|
| **Endpoints** | `POST /api/v1/device-tokens`<br>`DELETE /api/v1/device-tokens` |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |


