# Rules & Conventions — Dev-Edu Backend

> Tài liệu này tổng hợp các business rules, coding rules, validation rules, và conventions được suy luận từ codebase hiện tại. Dùng làm chuẩn tham chiếu khi phát triển tính năng mới.

---

## Mục lục

- [1. Quy tắc nghiệp vụ (Business Rules)](#1-quy-tắc-nghiệp-vụ-business-rules)
- [2. Quy tắc validate dữ liệu](#2-quy-tắc-validate-dữ-liệu)
- [3. Quy tắc xử lý lỗi](#3-quy-tắc-xử-lý-lỗi)
- [4. Quy tắc phân quyền (Authorization)](#4-quy-tắc-phân-quyền-authorization)
- [5. Quy tắc đặt tên (Naming Convention)](#5-quy-tắc-đặt-tên-naming-convention)
- [6. Quy tắc tổ chức code](#6-quy-tắc-tổ-chức-code)
- [7. Patterns lặp lại (Common Patterns)](#7-patterns-lặp-lại-common-patterns)
- [8. Quy tắc phát triển tính năng mới](#8-quy-tắc-phát-triển-tính-năng-mới)

---

## 1. Quy tắc nghiệp vụ (Business Rules)

### 1.1. Hệ thống Role

| Role | Khả năng chính |
|---|---|
| `ADMIN` | Toàn quyền quản lý: CRUD course, category, user, discount, phê duyệt bài forum, xem metric |
| `LECTURER` | Quản lý lecture, material, assignment, feedback, submission thuộc khóa học được phân công |
| `STUDENT` | Đăng ký, mua khóa học, nộp bài, comment, review, tạo bài forum |

- Đăng ký mặc định luôn nhận role `STUDENT` (hardcode trong `AuthController`).
- Chỉ `ADMIN` mới tạo user batch với role tùy chọn.
- Hệ thống có 3 role mặc định được init khi khởi động (`InitDataConfig`).

### 1.2. Quản lý khóa học

- Mỗi khóa học phải thuộc một category.
- Mỗi khóa học phải có **ít nhất 1 lecturer** được phân công (`lecturerUsernames` @NotEmpty).
- Non-ADMIN chỉ thấy khóa học/category có status `ACTIVE` (override ở controller).
- Có hệ thống khóa học nổi bật (highlighted) được cache trong Redis.
- Xóa khóa học là soft-delete, dọn dẹp thật sự bằng cron job.

### 1.3. Hệ thống thanh toán

- Luồng mua khóa học: Giỏ hàng → Checkout (tạo Order) → Thanh toán (Payment) → Ghi danh (Enrollment)
- Các loại entity có thể mua: `COURSE`, `SUBSCRIPTION`
- Phương thức thanh toán hỗ trợ: VnPay (đang triển khai), MOMO, ZaloPay, PayPal, Stripe (dự kiến)
- Không cho phép lấy lịch sử đơn hàng với status `PENDING`.
- Order và payment session expired sẽ bị dọn dẹp bởi cron job.
- Giỏ hàng có invalid items bị dọn dẹp tự động.

### 1.4. Hệ thống giảm giá

- Discount có thể áp dụng cho 1 khóa học cụ thể hoặc tất cả (courseId = null).
- Giá trị discount: 0.01% – 100%.
- Ngày áp dụng phải ở hiện tại hoặc tương lai.
- Discount có lịch trình bắt đầu/kết thúc (`validFrom`, `validTo`).

### 1.5. Forum (Diễn đàn)

- Bài viết forum có hệ thống **versioning**: mỗi lần chỉnh sửa tạo version mới.
- Trạng thái bài viết: `PENDING` → `APPROVED`/`REJECTED`. Khi approve version mới, version cũ thành `SUPERSEDED`.
- Chỉ `ADMIN` mới phê duyệt/từ chối bài viết.
- User có thể lưu bài viết (saved posts).
- Tìm kiếm bài viết full-text qua Elasticsearch.
- Bài viết có "related posts" dựa trên Elasticsearch similarity.
- Dữ liệu bài viết được sync từ PostgreSQL sang Elasticsearch qua Kafka events.

### 1.6. Bài giảng & Tiến độ

- Mỗi bài giảng thuộc một khóa học.
- Bài giảng có tài liệu (materials) và video.
- Tiến độ xem video được track theo segment (`segmentStart`, `segmentEnd`).
- `videoObjectKey` **phải null** khi cập nhật bài giảng (không cho đổi video qua update, chỉ set khi create).

### 1.7. Assignment & Submission

- Mỗi assignment thuộc một lecture.
- Student nộp bài bằng file (qua `fileObjectKey`).
- Lecturer/Admin gửi feedback cho student theo assignment.
- Hệ thống tracking submission logs cho mỗi student.

### 1.8. File Upload

- Sử dụng **pre-signed URL** pattern: frontend xin URL → upload trực tiếp lên Cloudflare R2 → confirm upload.
- File có 2 bucket: public và private.
- File expired/failed bị dọn dẹp bởi cron job.
- Xóa file thật sự thông qua Kafka event (`file-delete-topic`).

### 1.9. Soft Delete & Cleanup

- Entities bị xóa thường dùng soft-delete (đánh dấu status `DELETED`).
- Cron job chạy định kỳ để dọn dẹp thật sự các bản ghi soft-deleted.
- Danh sách cron job cleanup (trong `CronJobConstant`):
  - File: `cleanExpiredAndFailedFilesJob`
  - Assignment: `cleanDeletedAssignmentsJob`
  - Category: `cleanDeletedCategoriesJob`
  - Course: `cleanDeletedCoursesJob`
  - Forum: `cleanDeletedForumPostsJob`, `cleanDeletedForumCommentsJob`
  - Lecture: `cleanDeletedLecturesJob`, `cleanDeletedLectureCommentsJob`, `cleanDeletedMaterialsJob`
  - Payment: `cleanExpiredPaymentSessionsJob`, `cleanInvalidCartItemsJob`, `cleanExpiredOrdersJob`

---

## 2. Quy tắc validate dữ liệu

### 2.1. Validation Groups

Hệ thống sử dụng **Bean Validation Groups** để phân biệt validate khi tạo và cập nhật:

| Group | Ý nghĩa | Áp dụng cho field `id` |
|---|---|---|
| `CreateValidation` | Khi tạo mới | `@Null` — ID phải null |
| `UpdateValidation` | Khi cập nhật | `@NotNull` — ID bắt buộc |
| `DeleteValidation` | Khi xóa | Không tìm thấy sử dụng cụ thể |
| `SortValidation` | Validate sorting | Không tìm thấy sử dụng cụ thể |

**Cách sử dụng trong controller:**

```java
// Tạo mới
@PostMapping
public ResponseEntity<ApiResponse> create(@Validated({CreateValidation.class}) @RequestBody CourseRequest req) { ... }

// Cập nhật
@PutMapping
public ResponseEntity<ApiResponse> update(@Validated({UpdateValidation.class}) @RequestBody CourseRequest req) { ... }
```

### 2.2. Validation Annotations thường dùng

| Annotation | Mô tả | Ví dụ |
|---|---|---|
| `@NotBlank` | String không null, không trống, không chỉ whitespace | `title`, `description` |
| `@NotNull` | Không null | `courseId`, `assignmentId` |
| `@NotEmpty` | Collection/array không rỗng | `lecturerUsernames` |
| `@Null` | Phải null (cho create) | `id` khi tạo mới |
| `@Size(max=N)` | Giới hạn độ dài | `title` max 255, `shortDescription` max 500 |
| `@Pattern` | Regex pattern | Username: `^[a-zA-Z0-9_]+$` |
| `@Email` | Email format | `email` |
| `@DecimalMin`/`@DecimalMax` | Giới hạn giá trị số thập phân | Price ≥ 0.0, discount 0.01–100 |
| `@Min` | Giới hạn giá trị số nguyên tối thiểu | `rating` ≥ 1, `segmentStart` ≥ 0 |
| `@FutureOrPresent` | Ngày không được trong quá khứ | `validFrom`, `validTo` |

### 2.3. Password Validation

```
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
```

- Tối thiểu 8 ký tự
- Phải có chữ thường, chữ hoa, số, ký tự đặc biệt

### 2.4. Manual Validation ở Controller

Một số API sử dụng `Map<String, String>` thay vì DTO có annotations, trong trường hợp này validate thủ công:

```java
if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
    throw new BadRequestException("New password cannot match old password.");
}
```

---

## 3. Quy tắc xử lý lỗi

### 3.1. Exception Hierarchy

```
RuntimeException
└── AbstractException (abstract, có getHttpStatus())
    ├── AbstractDataException → BadRequestException, DataNotFoundException,
    │                           ConvertDataException, ExceededLimitException
    ├── AbstractSecurityException → AccessDeniedException, UnauthorizedException,
    │                               InvalidSignatureException
    ├── AbstractIOException → FilePerformException
    └── AbstractServerException → GenerateKeyException, ServerInternalException,
                                  ServerOverloadException
```

### 3.2. Global Exception Handler

`GlobalExceptionHandler` (`@RestControllerAdvice`) xử lý tất cả exception:

| Exception Type | HTTP Status (trong body) | Message mẫu |
|---|---|---|
| `AuthenticationException` | 401 | Tùy loại: "Incorrect username or password.", "Your account has been disabled." |
| `AccessDeniedException`, `AuthorizationDeniedException` | 403 | "Access denied." |
| `MethodArgumentNotValidException`, `ConstraintViolationException` | 400 | "Invalid input data." |
| `MissingServletRequestParameterException` | 400 | "Missing required request parameter." |
| `DataIntegrityViolationException` | 409 | "Data constraint violation." |
| `TimeoutException` | 408 | "This request has expired." |
| `TransactionSystemException` | 500 | "A transaction error occurred." |
| `AbstractException` (custom) | Tùy subclass | Message từ exception |
| `Exception` (fallback) | 500 | "Undefined exception." |

### 3.3. Response Error Format

Mọi error đều trả HTTP 200 với body:

```json
{
  "success": false,
  "status": "BAD_REQUEST",  // Hoặc status code tương ứng
  "message": "Mô tả lỗi cho user",
  "data": null,
  "timestamp": 1721234567890
}
```

> **Quan trọng**: HTTP status code luôn là 200. Error code nằm trong field `status`.

### 3.4. Error Message Policy

- **Client-facing message**: Ngắn gọn, generic, không lộ thông tin hệ thống.
- **Log message**: Chi tiết, bao gồm tên field, giá trị, stack trace.
- Không bao giờ trả stack trace cho client.

---

## 4. Quy tắc phân quyền (Authorization)

### 4.1. Method-level Security

Sử dụng `@PreAuthorize` annotation ở controller level:

```java
@PreAuthorize("hasAuthority('ADMIN')")                    // Chỉ ADMIN
@PreAuthorize("hasAuthority('STUDENT')")                  // Chỉ STUDENT
@PreAuthorize("hasAuthority('LECTURER')")                 // Chỉ LECTURER
@PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")    // ADMIN hoặc LECTURER
@PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")    // Tương tự
@PreAuthorize("permitAll()")                              // Không yêu cầu auth
```

### 4.2. Logic-level Authorization

Ngoài `@PreAuthorize`, một số service thực hiện kiểm tra quyền bổ sung:

```java
// Controller lấy authorities và truyền xuống service
var authorities = SecurityContextUtils.getCurrentUserAuthorities();
var username = SecurityContextUtils.getCurrentUsernameForController();

// Service kiểm tra
if (authorities.contains(RoleEnum.STUDENT.name())) {
    studentUsername = username; // STUDENT chỉ xem của mình
}
```

### 4.3. Public vs Authenticated Endpoints

- **Public GET endpoints** (không cần auth): Được khai báo trong `WebEndpointConstant.GET_PERMIT_ALL_ENDPOINTS`:
  - `/api/v1/categories`
  - `/api/v1/courses`, `/api/v1/courses/**`
  - `/api/v1/lectures`
  - `/api/v1/courses/reviews`
  - `/api/v1/forum/posts`, `/api/v1/forum/posts/**`
  - `/api/v1/forum/comments`, `/api/v1/forum/comments/replies`

- **Permit All (mọi method)**: `/login`, `/oauth2/authorize`, `/actuator/**`, static resources

- **Mọi endpoint khác**: yêu cầu authenticated.

### 4.4. SecurityContext Utils

- `getCurrentUsernameForController()` — trả username hoặc throw `UnauthorizedException` nếu chưa login.
- `getCurrentUsername()` — trả username hoặc `null` (cho public endpoints).
- `getCurrentUserAuthorities()` — trả `Set<String>` các authorities.

---

## 5. Quy tắc đặt tên (Naming Convention)

### 5.1. Package Naming

```
com.pht.dev_edu.{module_name}.{layer_name}
```

Ví dụ: `com.pht.dev_edu.course.controller`, `com.pht.dev_edu.user.service`

### 5.2. Class Naming

| Loại | Pattern | Ví dụ |
|---|---|---|
| Entity | `{DomainName}Entity` | `UserEntity`, `CourseEntity` |
| Controller | `{Feature}Controller` | `AuthController`, `CategoryController` |
| Service | `{Feature}Service` (interface) | `UserService`, `CourseService` |
| Service Impl | `{Feature}ServiceImpl` | `MailServiceImpl` |
| Repository | `{DomainName}Repository` | `UserRepository`, `CourseRepository` |
| Mapper | `{DomainName}Mapper` | `UserMapper`, `CourseMapper` |
| Request DTO | `{Feature}Request` | `CourseRequest`, `PaymentRequest` |
| Response DTO | `{Feature}Response` | `UserInfoResponse`, `CourseResponse` |
| Projection | `{Feature}Projection` | `CourseDetailProjection`, `UserInfoProjection` |
| Config | `{Feature}Config` | `CachingConfig`, `S3Config` |
| Constants | `{Feature}Constant` | `KafkaTopicConstant` |
| Utils | `{Feature}Utils` | `PagingUtils`, `ApiUtils` |
| Event (Kafka) | `{Feature}Event` | `SubmissionEvent`, `FileDeleteEvent` |
| Enum | `{Feature}Enum` hoặc `{Feature}` | `RoleEnum`, `ItemStatus`, `PostStatus` |
| Exception | `{ErrorType}Exception` | `BadRequestException`, `DataNotFoundException` |

### 5.3. Field Naming

- Entity fields: camelCase, mapping DB column bằng `@Column(name = "snake_case")`
- DTO fields: camelCase, tự động serialize thành camelCase JSON
- Redis keys: `dev_edu:{entity}:{identifier}:`
- Kafka topics: `kebab-case` (ví dụ: `file-delete-topic`)

### 5.4. API Endpoint Naming

- Base path: `/api/v1/{resource-name}`
- Resource name: lowercase, plural, kebab-case nếu multi-word
- Ví dụ: `/api/v1/courses`, `/api/v1/course-discounts`, `/api/v1/forum/posts`
- Ngoại lệ: Metric module dùng `/api/metrics/` (không có `v1`)

---

## 6. Quy tắc tổ chức code

### 6.1. Controller Pattern

```java
@RestController("UniqueControllerName")
@RequestMapping("/api/v1/{resource}")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class XxxController {
    XxxService xxxService;

    @PreAuthorize("hasAuthority('ROLE')")
    @GetMapping
    public ResponseEntity<ApiResponse> getItems(...) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = xxxService.doSomething(authorities, username, ...);
        return ApiUtils.buildSuccessResponse(result);
    }
}
```

**Quy tắc cần tuân thủ:**

1. Luôn dùng `@RequiredArgsConstructor` + `@FieldDefaults(makeFinal = true)` cho constructor injection.
2. Dùng `SecurityContextUtils.getCurrentUsernameForController()` cho endpoint cần auth.
3. Dùng `SecurityContextUtils.getCurrentUsername()` cho endpoint public (có thể null).
4. Wrap response bằng `ApiUtils.buildSuccessResponse(data)`.
5. Không đặt business logic trong controller, chỉ delegate cho service.
6. Dùng `@Validated({GroupName.class})` hoặc `@Valid` cho request body.

### 6.2. DTO Pattern

```java
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class XxxRequest {
    @Null(groups = {CreateValidation.class})
    @NotNull(groups = {UpdateValidation.class})
    UUID id;

    @NotBlank(message = "...", groups = {CreateValidation.class, UpdateValidation.class})
    String title;
}
```

**Quy tắc cần tuân thủ:**

1. Mỗi field validation phải có `message` rõ ràng.
2. Dùng validation groups cho `id` field: `@Null` khi create, `@NotNull` khi update.
3. Các field khác thường áp dụng cả 2 groups.

### 6.3. Entity Pattern

```java
@Entity
@Table(name = "table_name")
@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class XxxEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UuidCreator.getTimeOrderedEpoch();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
```

**Quy tắc cần tuân thủ:**

1. ID luôn là `UUID`, generate bằng `UuidCreator.getTimeOrderedEpoch()` (UUIDv7).
2. Luôn có `@PrePersist` để auto-generate ID và timestamp.
3. Dùng `@Column(name = "snake_case")` cho mapping tên cột.
4. DDL không tự tạo bảng (mode `validate`), phải dùng Flyway migration.

### 6.4. Paging Pattern

Hệ thống hỗ trợ **2 loại phân trang**:

#### Offset-based Paging (`CustomPaging` + `Page`)

```java
var pageable = PagingUtils.getPageable(page, size);
Page<Entity> pages = repository.findAll(pageable);
return new CustomPaging<>(pages, mapper::toResponse);
```

#### Cursor-based Paging (`nextCursor`)

```java
// Decode cursor → query với WHERE createdAt < cursor → encode nextCursor
TimeStampCursor cursor = PagingUtils.decodeTimeStampCursor(nextCursor);
// Query n+1 items, nếu có n+1 thì còn trang tiếp
CustomPaging<R> result = PagingUtils.getPagedWithCursor(content, mapper, getTime, getId, pageSize);
```

- Cursor được encode dưới dạng **Base64** chứa JSON `{timestamp, id}`.
- Query `n+1` items để xác định có trang tiếp không.

---

## 7. Patterns lặp lại (Common Patterns)

### 7.1. Response Wrapper Pattern

Mọi API trả cùng format `ApiResponse`:

```java
return ApiUtils.buildSuccessResponse(data);    // Thành công
return ApiUtils.buildErrorResponse(msg, ex, status); // Lỗi
```

### 7.2. Role-based Data Filtering Pattern

Non-ADMIN bị override status filter:

```java
Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();
if (!authorities.contains(RoleEnum.ADMIN.name())) {
    status = ItemStatus.ACTIVE; // Force chỉ thấy ACTIVE
}
```

### 7.3. Owner-or-Admin Authorization Pattern

```java
// Service check: chỉ owner hoặc ADMIN mới được thao tác
reviewService.deleteReview(authorities, username, reviewId);
// Trong service:
if (!authorities.contains("ADMIN") && !review.getUsername().equals(username)) {
    throw new AccessDeniedException("...");
}
```

### 7.4. Async Event Pattern (Kafka)

Thay vì xử lý đồng bộ, các tác vụ nặng được gửi qua Kafka:

- Xóa file → `KafkaUtils.sendDeleteFileEvent(objectKey)`
- Log request → `kafkaTemplate.send(REQUEST_LOG_TOPIC, event)`
- Sync Elasticsearch → `kafkaTemplate.send(POST_ELASTIC_DATA_UPDATE_TOPIC, data)`

### 7.5. Cleanup Cron Job Pattern

```java
deleteProcessor.executeCleanupJob(
    CronJobConstant.JOB_NAME,
    () -> repository.deleteOldRecords(),
    "Deleted %d records successfully"
);
```

- Tất cả cron job đều log kết quả qua Kafka (`CRON_JOB_EVENT_TOPIC`).
- Có error handling và stack trace logging.

### 7.6. Soft Delete Pattern

```java
// Thay vì xóa thật, đánh dấu
entity.setDeletedAt(LocalDateTime.now());
entity.setDeletedBy(username);
repository.save(entity);
// Cron job sẽ dọn dẹp sau
```

### 7.7. Redis Cache Invalidation Pattern

- Khi tạo/cập nhật/xóa entity → xóa cache Redis tương ứng.
- Sử dụng `RedisUtils` với prefix từ `RedisPrefixConstant`.

### 7.8. File Upload Flow Pattern

```
1. Frontend gọi POST /files/pre-signed-url → nhận pre-signed URL + objectKey
2. Frontend upload trực tiếp lên Cloudflare R2
3. Frontend gọi POST /files/confirm-image-upload → confirm upload thành công
4. Sử dụng objectKey trong các API khác (thumbnailObjectKey, videoObjectKey, etc.)
```

---

## 8. Quy tắc phát triển tính năng mới

### 8.1. Checklist tạo module mới

1. **Tạo package**: `com.pht.dev_edu.{module_name}/` với sub-packages: `controller/`, `service/`, `repo/`, `entity/`, `dto/`, `mapper/`
2. **Entity**: Extends hoặc follow pattern entity hiện tại (UUID id, `@PrePersist`, timestamps)
3. **Flyway migration**: Tạo file `V{N}__{description}.sql` trong `src/main/resources/db/migration/`
4. **Repository**: `extends JpaRepository<Entity, UUID>`
5. **Mapper**: `@Mapper(componentModel = "spring")`
6. **DTO**: Dùng validation groups nếu cùng DTO cho cả create/update
7. **Service**: Business logic, cache Redis nếu cần, gửi Kafka event nếu cần
8. **Controller**: Follow controller pattern, dùng `@PreAuthorize`, wrap response bằng `ApiUtils`
9. **Scheduler** (nếu có soft-delete): Thêm cron job cleanup

### 8.2. Coding Standards bắt buộc

- ✅ Dùng `@RequiredArgsConstructor` + `@FieldDefaults(makeFinal=true)` cho DI
- ✅ Dùng `var` (Java 21 type inference) cho local variables
- ✅ UUID cho tất cả primary keys, generate bằng UUIDv7
- ✅ `LocalDateTime` cho timestamp fields
- ✅ Lombok cho boilerplate code
- ✅ MapStruct cho entity ↔ DTO mapping
- ✅ `ApiUtils.buildSuccessResponse()` cho response
- ✅ `SecurityContextUtils` cho lấy user info
- ✅ Validation messages bằng tiếng Anh
- ❌ Không đặt business logic trong controller
- ❌ Không expose stack trace cho client
- ❌ Không tự quản lý transaction nếu không cần thiết (để Spring quản lý)
- ❌ Không hardcode strings — dùng constants

### 8.3. Redis Convention

- Key format: `dev_edu:{entity_type}:{identifier}`
- Duration: định nghĩa trong `RedisDurationConstant`
- Prefix: định nghĩa trong `RedisPrefixConstant`

### 8.4. Kafka Convention

- Topic naming: `kebab-case-topic` (ví dụ: `file-delete-topic`)
- Định nghĩa constant trong `KafkaTopicConstant`
- Consumer group: `dev-edu-group`
- Ack mode: `manual_immediate`

### 8.5. Exception Convention

- Business/data errors: Extend `AbstractDataException`
- Security errors: Extend `AbstractSecurityException`
- I/O errors: Extend `AbstractIOException`
- Server errors: Extend `AbstractServerException`
- Không tạo exception mới nếu đã có exception phù hợp (ví dụ: `BadRequestException`, `DataNotFoundException`)

### 8.6. API Endpoint Convention

- Versioning: `/api/v1/`
- Resource plural: `/api/v1/courses`, `/api/v1/users`
- Sub-resource: `/api/v1/courses/reviews`, `/api/v1/lectures/comments`
- Action-based (hiếm): `/api/v1/orders/checkout`, `/api/v1/files/pre-signed-url`
- Filter qua POST body: `/api/v1/lectures/comments/filter`

### 8.7. Public Endpoint Registration

Nếu tạo endpoint public mới, phải thêm vào `WebEndpointConstant`:

```java
// Cho permit all mọi method
PERMIT_ALL_MATCHERS.add("/api/v1/new-resource");

// Cho permit all chỉ GET
GET_PERMIT_ALL_ENDPOINTS.add("/api/v1/new-resource");

// Cho CSRF ignoring (nếu cần)
CSRF_IGNORING_MATCHERS.add("/api/v1/new-resource");
```
