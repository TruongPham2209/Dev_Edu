# Dev Edu Backend API Documentation (Frontend Integration)

This document is generated from backend source code (controllers, DTOs, validation annotations, exception handling, security configuration, and API-related services). It is intended to be sufficient for frontend integration without reading backend code.

## 0) Global Conventions

### 0.1 Base URL

- REST APIs are root-relative and use `/api/v1` prefix.
- OAuth2 Authorization Server endpoints are root-relative (e.g., `/oauth2/token`).

### 0.2 Response Envelope (All REST APIs)

All REST endpoints return an `ApiResponse` envelope, even on error:

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {},
  "timestamp": 1710000000000
}
```

| Field | Type | Description | Nullable |
| --- | --- | --- | --- |
| `success` | boolean | `true` for success, `false` for failure | No |
| `status` | string | HttpStatus enum name | No |
| `message` | string | Message for UI/logs | No |
| `data` | object/array/string/null | Payload | Yes |
| `timestamp` | number | Unix epoch ms | No |

**Important:** Errors still return HTTP 200. Always check `success` and `status`.

### 0.3 Date/Time

- `LocalDateTime` → ISO-8601 string without timezone (e.g., `2024-05-13T10:15:30`).
- `LocalDate` → `YYYY-MM-DD`.
- Because `LocalDateTime` has no timezone, treat values as server-local time.

### 0.4 Pagination

`CustomPaging<T>` is used for both page-based and cursor-based paging:

```json
{
  "contents": [],
  "totalPages": 0,
  "pageSize": 10,
  "totalElements": 0,
  "currentPage": 0,
  "nextCursor": "..."
}
```

Rules:

- Page-based: send `page` and `size` (page is 0-based). If size <= 0 or > 50, backend defaults to 10.
- Cursor-based: send `nextCursor` returned from previous response. Do not decode or modify it.
- `nextCursor` is Base64 URL-safe encoded JSON: `{ "timeStamp": "2024-05-13T10:15:30", "id": "uuid" }`.

### 0.5 Security Summary

- Bearer JWT is required for protected endpoints: `Authorization: Bearer <access_token>`.
- Roles (authorities): `ADMIN`, `LECTURER`, `STUDENT`.
- Some endpoints are public. Others call `SecurityContextUtils.getCurrentUsernameForController()` and require authentication even without `@PreAuthorize`.
- Session login (`/login`) exists for web flows and sets `JSESSIONID` cookie. API clients should use Bearer tokens.

### 0.6 Global Error Handling

Errors are wrapped in `ApiResponse` with `success=false`:

| Status | Typical cases | Example message |
| --- | --- | --- |
| `BAD_REQUEST` | Validation, missing params, invalid types | `Invalid input data.` |
| `UNAUTHORIZED` | Not authenticated | `Authentication required or missing credentials.` |
| `FORBIDDEN` | Access denied | `Access denied.` |
| `NOT_FOUND` | Entity not found | `File not found.` |
| `CONFLICT` | Duplicate/constraint | `Data constraint violation.` |
| `METHOD_NOT_ALLOWED` | Wrong HTTP method | `Method not allowed.` |
| `REQUEST_TIMEOUT` | Timeout | `This request has expired.` |
| `INTERNAL_SERVER_ERROR` | Server errors | `Internal server error.` |

**Edge case:** Some controller validation throws `BadRequestException` with messages that do not perfectly match the condition (e.g., `change-password`). Always use server message as the source of truth.

---

## 1) Authentication and Authorization

### 1.1 OAuth2 Token (Password Grant)

**Basic Information**

- API name: OAuth2 Token (Password Grant)
- Description: Obtain access token via username/password.
- HTTP method: `POST`
- Full endpoint URL: `/oauth2/token`
- Module/group: Authentication

**Security**

- Authentication required: OAuth2 client authentication (configured in registered clients)
- Token type: Bearer (returned)
- Required headers:
  - `Content-Type: application/x-www-form-urlencoded`
  - Client credentials (commonly Basic auth)

**Request Information**

Form fields:

| Field | Required | Description |
| --- | --- | --- |
| `grant_type` | Yes | Must be `password` |
| `username` | Yes | User login |
| `password` | Yes | User password |
| `scope` | Yes | Space-delimited scopes |

**Response Information**

OAuth2 standard response (not wrapped in `ApiResponse`):

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "r1-bQhG4u2k2kF...",
  "scope": "openid"
}
```

**Error Handling**

OAuth2 error response (not wrapped):

```json
{ "error": "invalid_grant", "error_description": "Invalid username or password." }
```

**Example (fetch)**

```js
const body = new URLSearchParams({
  grant_type: "password",
  username: "student01",
  password: "Password@123",
  scope: "openid"
});

const res = await fetch("/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: body.toString()
});
const token = await res.json();
```

### 1.2 OAuth2 Token (Refresh)

**Basic Information**

- API name: OAuth2 Token (Refresh)
- Description: Refresh access token.
- HTTP method: `POST`
- Full endpoint URL: `/oauth2/token`
- Module/group: Authentication

**Request Information**

| Field | Required | Description |
| --- | --- | --- |
| `grant_type` | Yes | Must be `refresh_token` |
| `refresh_token` | Yes | Refresh token |

**Example (fetch)**

```js
const body = new URLSearchParams({
  grant_type: "refresh_token",
  refresh_token: refreshToken
});

await fetch("/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: body.toString()
});
```

### 1.4 Logout

- URL: `/logout`
- Method: `GET` or `POST`
- Cookie cleared: `JSESSIONID`

---

## 2) User Module

### 2.1 Change Password

**Basic Information**

- API name: Change Password
- Description: Change current user's password.
- HTTP method: `POST`
- Full endpoint URL: `/api/v1/users/change-password`
- Module/group: User

**Security**

- Authentication required: Yes
- Required role/authority: Authenticated
- Token type: Bearer
- Required headers: `Authorization`, `Content-Type: application/json`

**Request Information**

Body (JSON):

| Field | Type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| `oldPassword` | string | Yes | Non-empty | |
| `newPassword` | string | Yes | Non-empty | |

**Response Information**

Success example:

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "Change password successful.",
  "timestamp": 1710000000000
}
```

Response data fields:

| Field | Type | Description |
| --- | --- | --- |
| `data` | string | Success message |

**Error Handling**

| Status | Message | When it happens |
| --- | --- | --- |
| `BAD_REQUEST` | `New password cannot match old password.` | Missing `oldPassword` or `newPassword` |
| `UNAUTHORIZED` | `Please login to access this resource` | Missing/invalid token |

**Example (fetch)**

```js
await fetch("/api/v1/users/change-password", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    oldPassword: "Old@1234",
    newPassword: "New@1234"
  })
});
```

### 2.2 Register User

**Basic Information**

- API name: Register User
- Description: Create a student account.
- HTTP method: `POST`
- Full endpoint URL: `/api/v1/users/register`
- Module/group: User

**Security**

- Authentication required: No

**Request Information**

Body (JSON): `RegisterUser`

| Field | Type | Required | Validation | Nullable |
| --- | --- | --- | --- | --- |
| `username` | string | Yes | `@NotBlank`, regex `^[a-zA-Z0-9_]+$` | No |
| `email` | string | Yes | `@NotBlank`, `@Email` | No |
| `password` | string | Yes | Regex: min 8, upper/lower/number/special | No |
| `fullName` | string | Yes | `@NotBlank` | No |
| `role` | RoleEnum | No | Not required | Yes |

**Response Information**

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "Register successful. Please login to continue.",
  "timestamp": 1710000000000
}
```

**Error Handling**

| Status | Message | When it happens |
| --- | --- | --- |
| `BAD_REQUEST` | `Invalid input data.` | Validation failed |
| `CONFLICT` | `Data constraint violation.` | Duplicate username/email |

**Example (fetch)**

```js
await fetch("/api/v1/users/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "student01",
    email: "student01@example.com",
    password: "Password@123",
    fullName: "Student One"
  })
});
```

### 2.3 Batch Create Users

**Basic Information**

- API name: Batch Create Users
- Description: Create multiple users.
- HTTP method: `POST`
- Full endpoint URL: `/api/v1/users/batch-users`
- Module/group: User

**Security**

- Authentication required: Yes
- Required role/authority: `ADMIN`
- Token type: Bearer

**Request Information**

Body: array of `RegisterUser`.

**Response Information**

`data`: `Create users successful.`

**Example (fetch)**

```js
await fetch("/api/v1/users/batch-users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  },
  body: JSON.stringify([
    {
      username: "student02",
      email: "student02@example.com",
      password: "Password@123",
      fullName: "Student Two"
    },
    {
      username: "student03",
      email: "student03@example.com",
      password: "Password@123",
      fullName: "Student Three"
    }
  ])
});
```

### 2.4 Update Avatar

**Basic Information**

- API name: Update Avatar
- HTTP method: `PUT`
- Full endpoint URL: `/api/v1/users/avatar`
- Module/group: User

**Security**

- Authentication required: Yes
- Token type: Bearer

**Request Information**

Body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `avatarObjectKey` | string | Yes | Non-empty |

**Response Information**

Example:

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": "https://cdn.example.com/avatars/u1.png",
  "timestamp": 1710000000000
}
```

**Example (fetch)**

```js
await fetch("/api/v1/users/avatar", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    avatarObjectKey: "public-bucket/dev_edu/1710000000000-avatar.png"
  })
});
```

### 2.5 Set Username (Google Login)

**Basic Information**

- API name: Set Username
- HTTP method: `PUT`
- Full endpoint URL: `/api/v1/users/username`
- Module/group: User

**Security**

- Authentication required: Yes

**Request Information**

Body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | Yes | Non-empty |
| `username` | string | Yes | Non-empty |

**Response Information**

`data`: `Username đã được cập nhật thành công.`

**Example (fetch)**

```js
await fetch("/api/v1/users/username", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    email: "student01@example.com",
    username: "student01"
  })
});
```

---

## 3) Category Module

### 3.1 Get Categories

**Basic Information**

- API name: Get Categories
- HTTP method: `GET`
- Full endpoint URL: `/api/v1/categories`
- Module/group: Category

**Security**

- Authentication required: No
- Token type: Bearer optional

**Request Information**

Query:

| Param | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| `status` | `ItemStatus` | No | `ACTIVE`, `DELETED`, `ALL` | Non-admin forced to `ACTIVE` |

**Response Information**

`data`: `CategoryResponse[]`

Example:

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    {
      "id": "2f8d2a3e-6ab4-4d2d-8f9e-2a8f1c4b9d1a",
      "name": "Programming",
      "description": "All programming courses",
      "thumbnailObjectKey": "public-bucket/dev_edu/1710000000000-programming.png",
      "thumbnailUrl": "https://cdn.example.com/dev_edu/1710000000000-programming.png"
    }
  ],
  "timestamp": 1710000000000
}
```

**Example (fetch)**

```js
await fetch("/api/v1/categories");
```

### 3.2 Create Category

**Basic Information**

- API name: Create Category
- HTTP method: `POST`
- Full endpoint URL: `/api/v1/categories`
- Module/group: Category

**Security**

- Authentication required: Yes
- Required role/authority: `ADMIN`

**Request Information**

Body: `CategoryRequest` (CreateValidation)

| Field | Type | Required | Validation | Nullable |
| --- | --- | --- | --- | --- |
| `id` | UUID | Yes | Must be null | Yes |
| `name` | string | Yes | `@NotBlank` | No |
| `description` | string | Yes | `@NotBlank` | No |
| `thumbnailObjectKey` | string | Yes | `@NotBlank` | No |

**Response Information**

`CategoryResponse` (same fields as Get Categories).

**Example (fetch)**

```js
await fetch("/api/v1/categories", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    id: null,
    name: "Programming",
    description: "All programming courses",
    thumbnailObjectKey: "public-bucket/dev_edu/1710000000000-programming.png"
  })
});
```

### 3.3 Update Category

- Method: `PUT` `/api/v1/categories`
- Security: `ADMIN`
- Body: `CategoryRequest` (UpdateValidation) with non-null `id`

### 3.4 Delete Category

- Method: `DELETE` `/api/v1/categories/{categoryId}`
- Security: `ADMIN`
- Path: `categoryId` (UUID)

---

## 4) Course Module

### 4.1 Get Courses

**Basic Information**

- API name: Get Courses
- HTTP method: `GET`
- Full endpoint URL: `/api/v1/courses`
- Module/group: Course

**Security**

- Authentication required: No
- Token type: Bearer optional

**Request Information**

Query:

| Param | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `sortBy` | string | No | empty | If empty, sort by `created_at` desc, `id` desc |
| `nextCursor` | string | No | null | Cursor-based paging |
| `categoryId` | UUID | No | null | Filter |
| `keyword` | string | No | null | Search |
| `page` | number | No | 0 | Page-based paging |
| `status` | `ItemStatus` | No | null | Forced to `ACTIVE` for non-admin |

**Response Information**

`data`: `CustomPaging<CourseResponse>`

CourseResponse fields:

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | UUID | No | |
| `title` | string | No | |
| `thumbnailObjectKey` | string | No | |
| `thumbnailUrl` | string | Yes | |
| `description` | string | No | |
| `createdAt` | LocalDateTime | No | |
| `originalPrice` | number | Yes | May be null if not set |
| `discountedPercentage` | number | Yes | |
| `discountedPrice` | number | Yes | |
| `validTo` | LocalDateTime | Yes | |
| `lecturers` | string[] | Yes | |

**Example (fetch)**

```js
await fetch("/api/v1/courses?keyword=java&page=0");
```

### 4.2 Get Course Details

- Method: `GET`
- Full endpoint URL: `/api/v1/courses/{courseId}/`
- Security: Public
- Response: `CourseDetailProjection`

CourseDetailProjection fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `title` | string | No |
| `description` | string | No |
| `thumbnailUrl` | string | Yes |
| `thumbnailObjectKey` | string | No |
| `originalPrice` | number | Yes |
| `discountedPercentage` | number | Yes |
| `validTo` | LocalDateTime | Yes |
| `createdBy` | string | No |
| `createdAt` | LocalDateTime | No |

### 4.3 Create Course

- Method: `POST`
- URL: `/api/v1/courses`
- Security: `ADMIN`
- Body: `CourseRequest` (CreateValidation)

CourseRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | UUID | No | Must be null on create |
| `categoryId` | UUID | Yes | `@NotNull` |
| `title` | string | Yes | `@NotBlank`, `@Size(max=255)` |
| `description` | string | Yes | `@NotBlank` |
| `price` | number | Yes | `@DecimalMin("0.0")` |
| `thumbnailObjectKey` | string | Yes | `@NotBlank` |
| `lecturerUsernames` | string[] | Yes | `@NotEmpty`, each `@NotBlank` |

### 4.4 Update Course

- Method: `PUT`
- URL: `/api/v1/courses`
- Security: `ADMIN`
- Body: `CourseRequest` (UpdateValidation) with non-null `id`

### 4.5 Delete Course

- Method: `DELETE`
- URL: `/api/v1/courses?courseId=5d5a7b39-84e0-4aef-9b4c-1c7e577bc21f`
- Security: `ADMIN`

### 4.6 Get Reviews

- Method: `GET`
- URL: `/api/v1/courses/reviews?courseId=5d5a7b39-84e0-4aef-9b4c-1c7e577bc21f&nextCursor=...`
- Security: Public
- Response: `CustomPaging<ReviewResponse>`

ReviewResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `comment` | string | No |
| `rating` | number | No |
| `username` | string | No |
| `createdAt` | LocalDateTime | No |

### 4.7 Create Review

- Method: `POST`
- URL: `/api/v1/courses/reviews`
- Security: `STUDENT`
- Body: `ReviewRequest`

ReviewRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `courseId` | UUID | Yes | `@NotNull` |
| `content` | string | Yes | `@NotBlank` |
| `rating` | number | Yes | `@Min(1)` and `@Min(5)` (effective min 5) |

### 4.8 Delete Review

- Method: `DELETE`
- URL: `/api/v1/courses/reviews?reviewId=3bba21a1-4d9a-4c77-88a2-3e79cbb98f29`
- Security: Authenticated

---

## 5) Lecture Module

### 5.1 Get Lectures by Course

- Method: `GET`
- URL: `/api/v1/lectures?courseId=5d5a7b39-84e0-4aef-9b4c-1c7e577bc21f`
- Security: Public
- Response: `LectureResponse[]`

LectureResponse fields:

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | UUID | No | |
| `title` | string | No | |
| `summary` | string | No | |
| `content` | string | Yes | Null in list view |
| `videoObjectKey` | string | Yes | Null in list view |
| `uploadedAt` | LocalDateTime | No | |
| `isCompleted` | boolean | Yes | Only for students |

### 5.2 Get Lecture Detail

- Method: `GET`
- URL: `/api/v1/lectures/8b2f77d8-c4b8-4c4b-a67b-0f4bd0d5595f`
- Security: Authenticated
- Response: `LectureResponse`

### 5.3 Get Lecture Materials

- Method: `GET`
- URL: `/api/v1/lectures/8b2f77d8-c4b8-4c4b-a67b-0f4bd0d5595f/materials`
- Security: Authenticated
- Response: `MaterialResponse[]`

MaterialResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `title` | string | No |
| `fileObjectKey` | string | No |
| `fileOriginalName` | string | Yes |
| `uploadedAt` | LocalDateTime | No |

### 5.4 Create Lecture

- Method: `POST`
- URL: `/api/v1/lectures`
- Security: `LECTURER` or `ADMIN`
- Body: `LectureRequest` (CreateValidation)

LectureRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Must be null on create |
| `courseId` | UUID | Yes | `@NotNull` |
| `title` | string | Yes | `@NotBlank` |
| `summary` | string | Yes | `@NotBlank` |
| `content` | string | No | Optional |
| `videoObjectKey` | string | No | Must be null on update (per annotation) |

### 5.5 Update Lecture

- Method: `PUT`
- URL: `/api/v1/lectures`
- Security: `LECTURER` or `ADMIN`
- Body: `LectureRequest` (UpdateValidation) with non-null `id`

### 5.6 Delete Lecture

- Method: `DELETE`
- URL: `/api/v1/lectures?lectureId=8b2f77d8-c4b8-4c4b-a67b-0f4bd0d5595f`
- Security: `LECTURER` or `ADMIN`

### 5.7 Add Material

- Method: `POST`
- URL: `/api/v1/lectures/materials`
- Security: `LECTURER` or `ADMIN`
- Body: `MaterialRequest`

MaterialRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `lectureId` | UUID | Yes | `@NotNull` |
| `title` | string | Yes | `@NotBlank` |
| `fileObjectKey` | string | Yes | `@NotBlank` |

### 5.8 Delete Material

- Method: `DELETE`
- URL: `/api/v1/lectures/materials?materialId=0d6d01cb-3b35-4c60-a0d2-0a6a9c6d2fae`
- Security: `LECTURER` or `ADMIN`

### 5.9 Update Progress

- Method: `PUT`
- URL: `/api/v1/lectures/progress`
- Security: `STUDENT`
- Body: `ProgressSegmentRequest`
- Response: `ProgressResponse`

ProgressSegmentRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `lectureId` | UUID | Yes | `@NotNull` |
| `segmentStart` | number | Yes | `@NotNull`, `@Min(0)` |
| `segmentEnd` | number | Yes | `@NotNull`, `@Min(0)` |

ProgressResponse fields:

| Field | Type | Description |
| --- | --- | --- |
| `lectureId` | UUID | Lecture ID |
| `completed` | boolean | Completed or not |

**Edge cases from service**

- `segmentStart >= segmentEnd` → `BAD_REQUEST` (`Invalid segment range`)
- Lecture not found/deleted → `NOT_FOUND` (`Lecture not found`)
- Must complete previous lectures before accessing this one
- `segmentEnd` exceeds duration → `BAD_REQUEST`

### 5.10 Lecture Comments

- POST `/api/v1/lectures/comments/filter` (list)
- POST `/api/v1/lectures/comments` (create)
- DELETE `/api/v1/lectures/comments?commentId=4d822b5e-2e67-4e6d-8b12-2b9b2d2e6ce3` (delete)

CommentPageRequest fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `lectureId` | UUID | Yes | |
| `parentCommentId` | UUID | No | Null for root comments |
| `page` | number | No | Defaults to 0 |
| `size` | number | No | Defaults to 10 |
| `nextCursor` | string | No | Cursor paging |

CommentResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `rootCommentId` | UUID | Yes |
| `parentCommentId` | UUID | Yes |
| `content` | string | Yes |
| `createdAt` | LocalDateTime | No |
| `isDeleted` | boolean | No |
| `isMine` | boolean | No |
| `depth` | number | No |
| `replyCount` | number | No |

---

## 6) Assignment Module

### 6.1 Get Assignments

- Method: `GET`
- URL: `/api/v1/assignments?lectureId=8b2f77d8-c4b8-4c4b-a67b-0f4bd0d5595f`
- Security: Authenticated
- Response: `AssignmentResponse[]`

AssignmentResponse fields:

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | UUID | No | |
| `title` | string | No | |
| `description` | string | No | |
| `createdAt` | LocalDateTime | No | |
| `fileObjectKey` | string | Yes | Null if not submitted |
| `submittedAt` | LocalDateTime | Yes | Null if not submitted |

### 6.2 Create Assignment

- Method: `POST`
- URL: `/api/v1/assignments`
- Security: `ADMIN` or `LECTURER`
- Body: `AssignmentRequest`

### 6.3 Delete Assignment

- Method: `DELETE`
- URL: `/api/v1/assignments?assignmentId=7d26cfe1-4b65-4f88-8f08-01cb6a9b8f6f`
- Security: `ADMIN` or `LECTURER`

### 6.4 Feedbacks

- GET `/api/v1/assignments/feedbacks?submissionId=9b5ad6f1-7e95-4c79-9f75-8fd4b7b3fcd2`
- POST `/api/v1/assignments/feedbacks` (ADMIN or LECTURER)
- DELETE `/api/v1/assignments/feedbacks?feedbackId=0b7f2b36-86c2-40f1-97a9-efb0bc5c08df` (ADMIN or LECTURER)

FeedbackRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `submissionId` | UUID | Yes | `@NotNull` |
| `feedback` | string | Yes | `@NotBlank` |

FeedbackResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `feedback` | string | No |
| `lecturer` | string | No |
| `createdAt` | LocalDateTime | No |

### 6.5 Submissions

- GET `/api/v1/assignments/submissions?assignmentId=7d26cfe1-4b65-4f88-8f08-01cb6a9b8f6f&page=0&size=10` (ADMIN or LECTURER)
- POST `/api/v1/assignments/submissions`
- DELETE `/api/v1/assignments/submissions?assignmentId=7d26cfe1-4b65-4f88-8f08-01cb6a9b8f6f`

SubmissionRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `assignmentId` | UUID | Yes | `@NotNull` |
| `fileObjectKey` | string | Yes | `@NotBlank` |

SubmissionResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `studentUsername` | string | No |
| `fileObjectKey` | string | No |
| `submittedAt` | LocalDateTime | No |

### 6.6 Submission Tracking Logs

- GET `/api/v1/assignments/submissions/tracking?assignmentId=7d26cfe1-4b65-4f88-8f08-01cb6a9b8f6f&studentUsername=student01&page=0`

SubmissionLogResponse fields:

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Log ID |
| `status` | string | `SUBMITTED` or `UNSUBMITTED` |
| `details` | string | Details |
| `updatedAt` | LocalDateTime | Timestamp |

---

## 7) Forum Module

### 7.1 Post Versions

- GET `/api/v1/forum/posts/versions?status=PENDING&lastCursor=...` (ADMIN)
- GET `/api/v1/forum/posts/versions/6c1e64c8-7c2f-4a52-8b44-8dcb2585a5cc?status=APPROVED` (Authenticated)
- PUT `/api/v1/forum/posts/versions` (ADMIN)
- DELETE `/api/v1/forum/posts/versions?postVersionId=2f6f5b6c-2f5c-44a1-bb27-03e3e03a1a55` (Authenticated)

Update request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `postVersionId` | string (UUID) | Yes | Required |
| `postStatus` | string | Yes | `PENDING`, `SUPERSEDED`, `APPROVED`, `REJECTED` |

### 7.2 Post CRUD

- POST `/api/v1/forum/posts`
- PUT `/api/v1/forum/posts`
- DELETE `/api/v1/forum/posts?postId=6c1e64c8-7c2f-4a52-8b44-8dcb2585a5cc`

PostRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `postId` | UUID | Create: null / Update: required | `@Null` (create), `@NotNull` (update) |
| `thumbObjectKey` | string | Yes | `@NotBlank` |
| `title` | string | Yes | `@NotBlank`, `@Size(max=255)` |
| `shortDescription` | string | Yes | `@NotBlank`, `@Size(max=500)` |
| `content` | string | Yes | `@NotBlank` |

PostResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `title` | string | No |
| `content` | string | No |
| `createdAt` | LocalDateTime | No |
| `updatedAt` | LocalDateTime | No |

### 7.3 Saved Posts

- GET `/api/v1/forum/posts/saved?nextCursor=...`
- POST `/api/v1/forum/posts/6c1e64c8-7c2f-4a52-8b44-8dcb2585a5cc/save`
- DELETE `/api/v1/forum/posts/6c1e64c8-7c2f-4a52-8b44-8dcb2585a5cc/save`

SavedPostResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `postId` | UUID | No |
| `thumbUrl` | string | Yes |
| `title` | string | No |
| `shortDescription` | string | No |
| `savedAt` | LocalDateTime | No |

### 7.4 Feed/Search/Related

- GET `/api/v1/forum/posts/feed?nextCursor=...`
- GET `/api/v1/forum/posts/search?keyword=java&nextCursor=...`
- GET `/api/v1/forum/posts/6c1e64c8-7c2f-4a52-8b44-8dcb2585a5cc/related`

### 7.5 Forum Comments

- GET `/api/v1/forum/comments?postId=6c1e64c8-7c2f-4a52-8b44-8dcb2585a5cc&nextCursor=...`
- GET `/api/v1/forum/comments/replies?parentCommentId=94a06c2f-87c7-4cda-9a57-640f17f05397&nextCursor=...`
- POST `/api/v1/forum/comments`
- DELETE `/api/v1/forum/comments?commentId=94a06c2f-87c7-4cda-9a57-640f17f05397`

CommentRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `postId` | UUID | Yes | `@NotNull` |
| `content` | string | Yes | `@NotBlank` |
| `repliedToCommentId` | UUID | No | Optional |

CommentResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `author` | string | No |
| `content` | string | Yes |
| `replyCount` | number | No |
| `repliedToCommentId` | UUID | Yes |
| `createdAt` | LocalDateTime | No |
| `isDeleted` | boolean | No |
| `isMine` | boolean | No |

---

## 8) Enrollment / Payment / Cart Module

### 8.1 Purchase

- POST `/api/v1/enrollments`

PurchaseRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `entityIds` | UUID[] | Yes | `@NotEmpty`, each `@NotNull` |
| `entityType` | string | Yes | `COURSE`, `SUBSCRIPTION` |
| `paymentMethod` | string | Yes | `VNPAY`, `MOMO`, `ZALOPAY`, `PAYPAL`, `STRIPE` |
| `ipAddress` | string | No | Set by backend |

PurchaseDetailResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `paymentId` | UUID | No |
| `paymentUrl` | string | Yes |
| `totalAmount` | number | No |
| `entityType` | string | No |
| `items` | array | Yes |

### 8.2 VNPay Return

- GET `/api/v1/enrollments/vnpay-return?vnp_TxnRef=123456&vnp_ResponseCode=00`

### 8.3 Cancel Payment

- DELETE `/api/v1/enrollments/cancel?paymentId=4c6d2a2a-4cb3-4f0f-a0c0-6a2b89f0a5aa`

### 8.4 Enrollments

- GET `/api/v1/enrollments?nextCursor=...` (STUDENT)
- GET `/api/v1/enrollments/assigned-courses?nextCursor=...` (LECTURER)
- GET `/api/v1/enrollments/enrolled-users?courseId=5d5a7b39-84e0-4aef-9b4c-1c7e577bc21f&nextCursor=...` (LECTURER/ADMIN)

### 8.5 Course Discounts

- GET `/api/v1/course-discounts?nextCursor=...&courseId=5d5a7b39-84e0-4aef-9b4c-1c7e577bc21f`
- POST `/api/v1/course-discounts`
- DELETE `/api/v1/course-discounts?discountId=3f1a3f77-1e7c-4c8c-bbd0-12a4470a67d8`

CourseDiscountRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `courseId` | UUID | No | Nullable |
| `description` | string | Yes | `@NotBlank` |
| `discountPercentage` | number | Yes | `@DecimalMin(0.01)`, `@DecimalMax(100.00)` |
| `validFrom` | LocalDate | Yes | `@FutureOrPresent` |
| `validTo` | LocalDate | Yes | `@FutureOrPresent` |

### 8.6 Cart Items

- POST `/api/v1/cart/items/courses`
- DELETE `/api/v1/cart/items/courses?courseId=5d5a7b39-84e0-4aef-9b4c-1c7e577bc21f`
- GET `/api/v1/cart/items/courses?nextCursor=...`

CourseItemResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `id` | UUID | No |
| `registered` | boolean | No |
| `originalPrice` | number | Yes |
| `discountedPrice` | number | Yes |
| `title` | string | No |
| `thumbnailUrl` | string | Yes |

---

## 9) File Module

### 9.1 Get Pre-signed Upload URL

- POST `/api/v1/files/pre-signed-url`

FilePreSignUploadRequest fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `fileName` | string | Yes | `@NotBlank` |
| `contentType` | string | Yes | `@NotBlank` |
| `fileSize` | number | Yes | `@NotNull`, `@Min(1)` |
| `isPublic` | boolean | No | Optional |

FileUploadResponse fields:

| Field | Type | Nullable |
| --- | --- | --- |
| `originalFileName` | string | Yes |
| `contentType` | string | Yes |
| `fileSize` | number | Yes |
| `uploadUrl` | string | No |
| `objectKey` | string | No |
| `publicUrl` | string | Yes |
| `downloadUrl` | string | Yes |

### 9.2 Get Download Info

- GET `/api/v1/files/download?fullObjectKey=public-bucket/dev_edu/1710000000000-programming.png`

### 9.3 Confirm Image Upload

- POST `/api/v1/files/confirm-image-upload?fullObjectKey=public-bucket/dev_edu/1710000000000-programming.png`

---

## 10) Frontend Integration Notes

- Always parse `ApiResponse.success` + `ApiResponse.status` before using data.
- For map-style request bodies, key names are case-sensitive:
  - `oldPassword`, `newPassword`
  - `avatarObjectKey`
  - `email`, `username`
  - `postVersionId`, `postStatus`
  - `courseId`
- `isMine` fields depend on authentication; if unauthenticated they may be `false` or unset.
- Many response fields can be null (see DTO notes above).
- Some error messages are in Vietnamese. Do not hardcode English-only UI.

