# Rules & Conventions — Dev-Edu Backend

> This document summarizes the business rules, coding guidelines, validation constraints, and architectural conventions across the Dev-Edu Backend system.

---

## Table of Contents

- [1. Business Rules](#1-business-rules)
- [2. Data Validation Rules](#2-data-validation-rules)
- [3. Error Handling Guidelines](#3-error-handling-guidelines)
- [4. Authorization & Security Rules](#4-authorization--security-rules)
- [5. Naming Conventions](#5-naming-conventions)
- [6. Code Organization Rules](#6-code-organization-rules)
- [7. Common Recurring Patterns](#7-common-recurring-patterns)
- [8. Guidelines for Developing New Features](#8-guidelines-for-developing-new-features)

---

## 1. Business Rules

### 1.1. Role Hierarchy

| Role | Key Capabilities |
|---|---|
| `ADMIN` | Complete administrative permissions: CRUD operations on courses, categories, users, discounts, approving forum posts, and viewing system metrics. |
| `LECTURER` | Manages lectures, materials, assignments, feedback, and student submissions for assigned courses. |
| `STUDENT` | Course enrollment, purchasing courses, submitting assignments, commenting, leaving reviews, and creating forum posts. |

- User registration automatically assigns the `STUDENT` role (hardcoded in `AuthController`).
- Batch user creation with custom role assignments is restricted exclusively to `ADMIN`.
- System defaults initialize 3 primary roles upon application startup (`InitDataConfig`).

### 1.2. Course Management

- Every course must belong to a valid Category.
- Every course must have **at least one assigned lecturer** (`lecturerUsernames` `@NotEmpty`).
- Non-ADMIN users only have visibility into courses and categories with `ACTIVE` status.
- Highlighted courses are cached within Redis for high performance.
- Course deletion follows a soft-delete strategy; physical cleanup is performed asynchronously via cron jobs.

### 1.3. Payment & Enrollment Workflows

- Purchase Workflow: Cart → Order Creation (Checkout) → Payment → Enrollment
- Purchasable Entity Types: `COURSE`, `SUBSCRIPTION`
- Payment Gateways: VNPay (Active implementation), MoMo, ZaloPay, PayPal, Stripe
- Querying order history with `PENDING` status is prohibited.
- Expired orders and payment sessions are cleaned up automatically via scheduled cron jobs.
- Invalid items within user shopping carts are purged automatically.

### 1.4. Discounts & Promotions

- Discounts can target a specific course (`courseId`) or apply system-wide (`courseId = null`).
- Valid discount range: `0.01%` to `100%`.
- Discount start dates must be present or future timestamps (`validFrom`, `validTo`).

### 1.5. Forum & Community

- Forum posts support **versioning**: modifications generate a new post version.
- Post Lifecycle: `PENDING` → `APPROVED` / `REJECTED`. Approving a new version transitions the previous active version to `SUPERSEDED`.
- Content approval/rejection is restricted to `ADMIN` users.
- Full-text search and related post suggestions are powered by Elasticsearch integration.
- Post modifications automatically trigger Kafka events (`post-elastic-data-update-topic`) to synchronize Elasticsearch.

### 1.6. Lectures & Learning Progress

- Every lecture belongs to a specific course.
- Lectures contain learning materials and streaming video media.
- Video progress is tracked using interval segments (`segmentStart`, `segmentEnd`).
- `videoObjectKey` **must remain null** during lecture updates to prevent accidental media overwrite.

### 1.7. Assignments & Submissions

- Assignments are bound to specific lectures.
- Students submit assignments via file keys (`fileObjectKey`).
- Instructors leave structured feedback for student submissions.
- Submission tracking logs every submission attempt.

### 1.8. File Storage

- Employs the **pre-signed URL pattern**: Client requests URL → Uploads directly to Cloudflare R2 → Confirms upload status.
- Storage buckets: Public (media/avatars) and Private (assignments/documents).
- Failed and expired file metadata records are purged by scheduled jobs.
- Physical file deletion is performed asynchronously via Kafka event (`file-delete-topic`).

### 1.9. Soft Delete & Automated Cleanup

- Entities use soft-deletion by setting status to `DELETED`.
- Periodic cron jobs execute physical data purges:
  - File: `cleanExpiredAndFailedFilesJob`
  - Assignment: `cleanDeletedAssignmentsJob`
  - Category: `cleanDeletedCategoriesJob`
  - Course: `cleanDeletedCoursesJob`
  - Forum: `cleanDeletedForumPostsJob`, `cleanDeletedForumCommentsJob`
  - Lecture: `cleanDeletedLecturesJob`, `cleanDeletedLectureCommentsJob`
  - Payment: `cleanExpiredPaymentSessionsJob`, `cleanInvalidCartItemsJob`, `cleanExpiredOrdersJob`

---

## 2. Data Validation Rules

- Request DTOs utilize JSR 380 annotations (`@NotBlank`, `@NotNull`, `@Size`, `@Email`, `@Min`, `@DecimalMin`).
- Validation Marker Groups separate constraints for creation versus updates (`CreateValidation`, `UpdateValidation`).
- Controller endpoints enforce validation via `@Valid` or `@Validated(Group.class)`.

---

## 3. Error Handling Guidelines

- Swallowing exceptions (`catch (Exception e) {}`) is strictly prohibited.
- Business exceptions extend `AbstractException` and specify custom error codes.
- `GlobalExceptionHandler` intercept exceptions and format responses into standardized JSON payloads containing error status and timestamps.

---

## 4. Authorization & Security Rules

- Method-level security is enforced via `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")`.
- Resource ownership validation is performed inside the service layer (e.g. verifying that a lecturer is assigned to the specified course).
- Password security utilizes BCrypt hashing with strength factor 9.

---

## 5. Naming Conventions

- **Java Classes**: `PascalCase` (`UserServiceImpl`, `CourseController`).
- **Methods & Variables**: `camelCase` (`getUserById`, `courseDiscount`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` (`DEFAULT_PAGE_SIZE`, `ROLE_ADMIN`).
- **Database Tables**: `snake_case` (`users`, `course_discounts`).
- **REST Endpoints**: Kebab-case plural nouns (`/api/v1/courses`, `/api/v1/user-profiles`).

---

## 6. Code Organization Rules

- Maintain clear layer separation: `Controller` → `Service` → `Repository` → `Entity`.
- Controllers must remain thin, delegating all domain logic and transactional processing to services.
- Data mapping between entities and DTOs should strictly use MapStruct mappers (`*Mapper`).

---

## 7. Common Recurring Patterns

- **Pre-signed File Uploads**: Request URL → Direct S3 Upload → Callback Confirmation.
- **Unified Pagination**: Request parameters (`page`, `size`, `sort`) processed by `PagingUtils` returning standardized paginated responses.
- **Asynchronous Processing**: Non-blocking workloads dispatched through Kafka topics or Java 21 Virtual Threads (`taskExecutor`).

---

## 8. Guidelines for Developing New Features

1. Create database migration script under `src/main/resources/db/migration/V*__description.sql`.
2. Define domain Entity models with proper JPA annotations and `@PrePersist` UUIDv7 hooks.
3. Build repository interface extending `JpaRepository`.
4. Define DTO models with validation group markers (`CreateValidation`, `UpdateValidation`).
5. Create MapStruct interface mapper for Entity ↔ DTO conversion.
6. Implement Service interface and ServiceImpl class with `@Transactional` management.
7. Expose REST endpoints in Controller class returning standardized `ApiResponse`.
