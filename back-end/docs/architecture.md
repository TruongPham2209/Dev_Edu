# Kiến trúc hệ thống Dev-Edu Backend

> Tài liệu này mô tả kiến trúc và cách tổ chức code của project Dev-Edu Backend, được sinh tự động từ codebase thực tế.

---

## Mục lục

- [1. Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
- [2. Cấu trúc package chính](#2-cấu-trúc-package-chính)
- [3. Mô tả từng package](#3-mô-tả-từng-package)
- [4. Kiến trúc phân tầng (Layered Architecture)](#4-kiến-trúc-phân-tầng-layered-architecture)
- [5. Cách các layer tương tác](#5-cách-các-layer-tương-tác)
- [6. Module-based Package Organization](#6-module-based-package-organization)

---

## 1. Tổng quan kiến trúc

Dev-Edu Backend là một ứng dụng **Spring Boot 3.5** sử dụng **Java 21**, được tổ chức theo kiến trúc **Layered Architecture kết hợp Module-based Package Organization**. Mỗi module nghiệp vụ (user, course, enrollment, assignment, lecture, file, forum, livestream, metric, tracking) được tổ chức thành một package riêng biệt, bên trong mỗi module lại tuân thủ kiến trúc phân tầng: `controller → service → repository → entity`.

Các thành phần dùng chung (cross-cutting concerns) được đặt trong package `common`.

---

## 2. Cấu trúc package chính

```
com.pht.dev_edu/
├── BackEndApplication.java          # Entry point
├── common/                          # Thành phần dùng chung
│   ├── config/                      # Cấu hình hệ thống
│   ├── constant/                    # Hằng số hệ thống
│   ├── dto/                         # DTO dùng chung
│   ├── exception/                   # Xử lý exception
│   │   ├── data/                    # Exception liên quan dữ liệu
│   │   ├── io/                      # Exception liên quan I/O
│   │   ├── security/                # Exception liên quan bảo mật
│   │   └── server/                  # Exception liên quan server
│   ├── generator/                   # Generator (UUID)
│   ├── security/                    # Security filters & providers
│   ├── service/                     # Service dùng chung
│   ├── util/                        # Hàm tiện ích
│   └── validation/                  # Validation groups
│
├── user/                            # Module quản lý người dùng
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   └── service/
│
├── course/                          # Module quản lý khóa học
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── enrollment/                      # Module đăng ký & thanh toán
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── assignment/                      # Module bài tập
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── lecture/                         # Module bài giảng
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── file/                            # Module quản lý file
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── kafka/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── forum/                           # Module diễn đàn
│   ├── controller/
│   ├── document/                    # Elasticsearch document
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── livestream/                      # Module livestream
│   ├── entity/
│   └── repo/
│
├── metric/                          # Module thống kê/dashboard
│   ├── controller/
│   ├── dto/
│   ├── repo/
│   └── service/
│
└── tracking/                        # Module tracking & logging
    ├── controller/
    ├── dto/
    ├── entity/
    ├── kafka/
    ├── mapper/
    ├── repo/
    └── service/
```

---

## 3. Mô tả từng package

### 3.1. `common` — Thành phần dùng chung

| Sub-package | Vai trò | Ví dụ |
|---|---|---|
| `config/` | Cấu hình hệ thống: security, CORS, caching, S3, Brevo mail, Elasticsearch, JWT, init data | `AuthorizationServerConfig`, `CachingConfig`, `S3Config` |
| `constant/` | Định nghĩa hằng số: Kafka topics, Redis prefix/duration, Cron job names, Web endpoints | `KafkaTopicConstant`, `RedisPrefixConstant`, `WebEndpointConstant` |
| `dto/` | DTO dùng chung: response wrapper, paging, enum | `ApiResponse`, `CustomPaging`, `RoleEnum`, `ItemStatus` |
| `exception/` | Hệ thống exception phân tầng: `AbstractException` → các abstract class con → exception cụ thể | `GlobalExceptionHandler`, `BadRequestException`, `DataNotFoundException` |
| `generator/` | ID generator sử dụng UUIDv7 | `UuidV7Generator` |
| `security/` | OAuth2 custom grant type (password), security filters, handlers | `OAuth2PasswordGrantAuthenticationProvider`, `LoggingSecurityFilter` |
| `service/` | Service dùng chung: batch delete processor, mail service | `DeleteProcessor`, `MailServiceImpl` |
| `util/` | Utility classes: API response builder, exception message parser, paging, security context, Redis, Kafka, payment | `ApiUtils`, `PagingUtils`, `SecurityContextUtils`, `RedisUtils` |
| `validation/` | Validation group interfaces cho Bean Validation | `CreateValidation`, `UpdateValidation`, `DeleteValidation` |

### 3.2. `user` — Module quản lý người dùng

Quản lý xác thực (authentication), đăng ký, profile, thay đổi mật khẩu, và avatar.

- **Controller**: `AuthController`, `ProfileController`, `UserController`
- **Entity**: `UserEntity` (implements `UserDetails`), `RoleEntity`, `AuthProviderEntity`
- **DTO**: `RegisterUser`, `UserInfoResponse`, `UserInfoProjection`

### 3.3. `course` — Module quản lý khóa học

Quản lý danh mục (category), khóa học (course), giảm giá (discount), và đánh giá (review).

- **Controller**: `CategoryController`, `CourseCategoryController`, `CourseDiscountController`, `ReviewController`
- **Entity**: `CategoryEntity`, `CourseEntity`, `CourseDiscountEntity`, `CourseReviewEntity`, `CourseLecturerEntity`
- **DTO**: `CategoryRequest`, `CourseRequest`, `CourseDiscountRequest`, `ReviewRequest`, và các projection/response

### 3.4. `enrollment` — Module đăng ký & thanh toán

Quản lý giỏ hàng, đơn hàng, thanh toán (VnPay), và ghi danh khóa học.

- **Controller**: `CartItemController`, `EnrollmentController`, `OrderController`, `PurchaseController`
- **Entity**: `CartItemEntity`, `EnrollmentEntity`, `OrderEntity`, `OrderItemEntity`, `PaymentHistoryEntity`
- **DTO**: `CheckoutRequest`, `PaymentRequest`, `PaymentMethod`, `PaymentStatus`, `PurchaseEntityType`

### 3.5. `assignment` — Module bài tập

Quản lý bài tập, nộp bài, và phản hồi giảng viên.

- **Controller**: `AssignmentController`
- **Entity**: `AssignmentEntity`, `SubmissionEntity`, `FeedbackEntity`
- **DTO**: `AssignmentRequest`, `SubmissionRequest`, `FeedbackRequest`

### 3.6. `lecture` — Module bài giảng

Quản lý bài giảng, tài liệu (material), bình luận, và tiến độ học.

- **Controller**: `LectureController`, `CommentController` (LectureCommentController)
- **Entity**: `LectureEntity`, `LectureMaterialEntity`, `LectureCommentEntity`, `LectureProgressEntity`
- **DTO**: `LectureRequest`, `MaterialRequest`, `CommentRequest`, `ProgressSegmentRequest`

### 3.7. `file` — Module quản lý file

Quản lý upload file thông qua pre-signed URL (Cloudflare R2/S3).

- **Controller**: `FileController`
- **Entity**: `FileUploadEntity`
- **Kafka**: Consumer xử lý sự kiện xóa file

### 3.8. `forum` — Module diễn đàn

Quản lý bài viết (post), phiên bản bài viết (post version), bình luận, tìm kiếm (Elasticsearch).

- **Controller**: `PostController`, `CommentController` (ForumCommentController)
- **Entity**: `PostEntity`, `PostVersionEntity`, `CommentEntity`, `SavedPostEntity`
- **Document**: Elasticsearch document cho tìm kiếm bài viết

### 3.9. `livestream` — Module livestream

Hiện tại chỉ có entity và repository cơ bản, chưa có controller/service hoàn chỉnh.

### 3.10. `metric` — Module thống kê

Dashboard quản trị: tổng quan, biểu đồ tăng trưởng, doanh thu, top khóa học/người dùng.

- **Controller**: `MetricController`
- **DTO**: `DashboardOverviewDto`, `GrowthDataDto`, `GrowthPeriod`, `TopCourseDto`, `TopUserDto`

### 3.11. `tracking` — Module tracking & logging

Ghi log request, tracking sự kiện, theo dõi nộp bài (submission tracking).

- **Controller**: `SubmissionTrackingController`
- **Entity**: `LogRequestEntity`, `LogTrackingEntity`, `LogCronJobEntity`, `MailTrackingEntity`, `SubmissionTrackingEntity`
- **Kafka**: Consumer xử lý sự kiện tracking

---

## 4. Kiến trúc phân tầng (Layered Architecture)

Mỗi module nghiệp vụ tuân thủ kiến trúc phân tầng sau:

```
┌─────────────────────────┐
│     Controller Layer    │  ← Nhận HTTP request, validate, delegate
├─────────────────────────┤
│      Service Layer      │  ← Business logic, transaction
├─────────────────────────┤
│    Repository Layer     │  ← Truy vấn database (JPA)
├─────────────────────────┤
│      Entity Layer       │  ← Domain model, JPA entity
└─────────────────────────┘
```

### Vai trò chi tiết từng layer:

| Layer | Naming | Annotation | Vai trò |
|---|---|---|---|
| **Controller** | `*Controller` | `@RestController` | Nhận request HTTP, validate input (via `@Valid`/`@Validated`), lấy thông tin user từ `SecurityContextUtils`, gọi service, trả `ApiResponse` |
| **Service** | `*Service` / `*ServiceImpl` | `@Service` | Chứa business logic, kiểm tra quyền logic-level, gọi repository, xử lý cache Redis, gửi event Kafka |
| **Repository** | `*Repository` | extends `JpaRepository` | Truy vấn database thông qua Spring Data JPA, custom query bằng `@Query` |
| **Entity** | `*Entity` | `@Entity` | Ánh xạ bảng database, sử dụng JPA annotations, có `@PrePersist` để auto-gen UUID và timestamp |
| **Mapper** | `*Mapper` | `@Mapper` (MapStruct) | Chuyển đổi giữa Entity ↔ DTO/Response |
| **DTO** | `*Request`, `*Response`, `*Projection` | Lombok `@Data` | Chứa dữ liệu request/response, có validation annotations |
| **Scheduler** | Trong `scheduler/` | `@Scheduled` | Cron job dọn dẹp dữ liệu soft-deleted |

---

## 5. Cách các layer tương tác

```
Client (Frontend)
    │
    ▼
┌─── Controller ───┐
│  @PreAuthorize    │  ← Method-level security
│  @Valid/@Validated │  ← Bean Validation
│  SecurityContext   │  ← Lấy username/authorities
│  ApiUtils.build    │  ← Wrap response
└────────┬─────────┘
         │
         ▼
┌─── Service ──────┐
│  Business Logic   │
│  Redis Cache      │  ← RedisUtils / RedisTemplate
│  Kafka Events     │  ← KafkaTemplate.send()
│  Authorization    │  ← Check authorities in code
│  Transaction      │  ← @Transactional
└────────┬─────────┘
         │
         ▼
┌─── Repository ───┐
│  JPA Repository   │
│  @Query           │
│  Projection       │  ← Interface-based projections
└────────┬─────────┘
         │
         ▼
┌─── Database ─────┐
│  PostgreSQL       │
│  Flyway migration │
└──────────────────┘
```

### Luồng xử lý bất đồng bộ (Kafka):

```
Service Layer
    │
    ├─→ KafkaTemplate.send(topic, event)
    │
    ▼
Kafka Consumer (tracking/kafka, file/kafka)
    │
    ▼
Tracking/Logging Repository → Database
```

---

## 6. Module-based Package Organization

Project sử dụng cách tổ chức **package-by-feature** thay vì package-by-layer thuần túy:

- **Ưu điểm**: Mỗi module (user, course, enrollment...) là một đơn vị độc lập, dễ bảo trì, dễ tìm kiếm code liên quan.
- **Cross-cutting**: Các thành phần dùng chung nằm trong `common/` (config, exception, util, constant, security).
- **Nhất quán**: Mỗi module đều tuân thủ cùng cấu trúc: `controller/`, `service/`, `repo/`, `entity/`, `dto/`, `mapper/`, `scheduler/`.

### Naming Convention tổng hợp:

| Pattern | Ý nghĩa | Ví dụ |
|---|---|---|
| `*Entity` | JPA Entity, ánh xạ bảng DB | `UserEntity`, `CourseEntity` |
| `*Request` | DTO cho request body | `CourseRequest`, `PaymentRequest` |
| `*Response` | DTO cho response body | `UserInfoResponse`, `CourseResponse` |
| `*Projection` | Interface projection cho JPA query | `CourseDetailProjection` |
| `*Controller` | REST Controller | `CourseController` |
| `*Service` / `*ServiceImpl` | Business logic | `CourseService`, `MailServiceImpl` |
| `*Repository` | Spring Data JPA Repository | `UserRepository` |
| `*Mapper` | MapStruct mapper | `CourseMapper` |
| `*Config` | Spring Configuration class | `CachingConfig`, `S3Config` |
| `*Constant` | Hằng số | `KafkaTopicConstant` |
| `*Utils` | Static utility methods | `PagingUtils`, `ApiUtils` |
| `*Enum` | Enum type | `RoleEnum`, `ItemStatus` |
| `*Event` | Kafka event payload | `SubmissionEvent`, `FileDeleteEvent` |
