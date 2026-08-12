# Tech Stack & Dependencies — Dev-Edu Backend

> Tài liệu này liệt kê toàn bộ tech stack và dependency đang được sử dụng trong project, cùng cách cấu hình và inject trong codebase.

---

## Mục lục

- [1. Thông tin chung](#1-thông-tin-chung)
- [2. Framework & Runtime](#2-framework--runtime)
- [3. Security & Authentication](#3-security--authentication)
- [4. Database & ORM](#4-database--orm)
- [5. Caching](#5-caching)
- [6. Message Broker](#6-message-broker)
- [7. Search Engine](#7-search-engine)
- [8. File Storage](#8-file-storage)
- [9. Email Service](#9-email-service)
- [10. Payment Gateway](#10-payment-gateway)
- [11. Object Mapping](#11-object-mapping)
- [12. PDF Generation](#12-pdf-generation)
- [13. ID Generation](#13-id-generation)
- [14. Development & Build Tools](#14-development--build-tools)
- [15. Monitoring & Observability](#15-monitoring--observability)
- [16. Containerization](#16-containerization)
- [17. AI & Vector Database Integration](#17-ai--vector-database-integration)

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| **Group ID** | `com.pht` |
| **Artifact ID** | `dev-edu` |
| **Version** | `0.0.1-SNAPSHOT` |
| **Java Version** | 21 |
| **Spring Boot Version** | 3.5.13 |
| **Build Tool** | Maven (with Maven Wrapper) |
| **Server Port** | 9000 (configurable via `SERVER_PORT` env) |

---

## 2. Framework & Runtime

### Spring Boot 3.5.13

- **Dependency**: `spring-boot-starter-parent` (parent POM)
- **Mục đích**: Framework chính cho toàn bộ ứng dụng
- **Cấu hình**: `application.properties`
- **Entry point**: `BackEndApplication.java` — `@SpringBootApplication`

### Spring Web (`spring-boot-starter-web`)

- **Mục đích**: Xây dựng REST API
- **Cấu hình tại**: `WebConfig.java`
- **Beans được tạo**:
  - `RestTemplate` — HTTP client bean
  - `CorsConfigurationSource` — cấu hình CORS cho phép các origin `localhost:5500`, `localhost:5555`
- **Annotations sử dụng**: `@EnableWebMvc`, `@EnableWebSecurity`

### Spring Thymeleaf (`spring-boot-starter-thymeleaf`)

- **Mục đích**: Server-side rendering cho trang login OAuth2 và các template HTML (email template, v.v.)
- **Dependency bổ sung**: `thymeleaf-extras-springsecurity6` — tích hợp Spring Security vào Thymeleaf templates
- **Cấu hình**: static resource handler trong `WebConfig.java` phục vụ file tĩnh từ `classpath:/static/images/`

### Spring Validation (`spring-boot-starter-validation`)

- **Mục đích**: Bean Validation (JSR 380) cho request DTO
- **Sử dụng**: `@Valid`, `@Validated`, `@NotBlank`, `@NotNull`, `@Size`, `@Pattern`, `@Email`, `@DecimalMin`, `@DecimalMax`, `@Min`, `@FutureOrPresent`, `@Null`
- **Validation Groups**: `CreateValidation`, `UpdateValidation`, `DeleteValidation`, `SortValidation` — interface marker trong `common/validation/`

### Virtual Threads (Java 21)

- **Cấu hình tại**: `CommonConfig.java`
- **Bean**: `Executor taskExecutor()` — sử dụng `Executors.newThreadPerTaskExecutor(Thread.ofVirtual())`
- **Mục đích**: Virtual thread executor cho xử lý bất đồng bộ (batch delete, async tasks)

### Scheduling

- **Annotation**: `@EnableScheduling` trong `CommonConfig.java`
- **Mục đích**: Chạy cron job dọn dẹp dữ liệu (soft-deleted entities, expired files, expired payments)
- **Các cron job**: được định nghĩa trong `CronJobConstant.java` và triển khai trong `scheduler/` package của mỗi module

---

## 3. Security & Authentication

### Spring Security (`spring-boot-starter-security`)

- **Cấu hình tại**: `AuthorizationServerConfig.java`, `SecurityBeansConfig.java`
- **Beans**:
  - `PasswordEncoder` — BCrypt version $2B, strength 9
  - `SessionRegistry` — quản lý session
  - `HttpSessionEventPublisher`
- **Annotation**: `@EnableMethodSecurity` — bật `@PreAuthorize` ở method-level

### OAuth2 Authorization Server (`spring-boot-starter-oauth2-authorization-server`)

- **Mục đích**: Hệ thống xác thực OAuth2 hoàn chỉnh, tự host Authorization Server
- **Cấu hình tại**: `AuthorizationServerConfig.java`, `JwtConfig.java`, `InitDataConfig.java`
- **Custom Password Grant Type**: Triển khai custom grant type `urn:custom:password` thông qua:
  - `OAuth2PasswordGrantAuthenticationConverter` — converter request
  - `OAuth2PasswordGrantAuthenticationProvider` — xử lý authentication
  - `OAuth2PasswordGrantAuthenticationToken` — token model
- **Registered Client**: Lưu trong DB (JDBC), cache bằng Caffeine in-memory
  - Client mặc định: `web_client` / `web_client_secret`
  - Grant types: `authorization_code`, `refresh_token`, `urn:custom:password`
  - Access token TTL: 5 phút
  - Refresh token TTL: 1 ngày
- **JWT**:
  - RSA key pair 3072-bit, generate tại runtime
  - Custom claims: `roles`, `token_type`
  - `JwtAuthenticationConverter` — extract roles từ JWT claims thành authorities
- **Security Filter Chains**:
  - **Order 1**: Authorization Server endpoints (token, OIDC)
  - **Order 2**: Web security — API endpoints, form login, logout
- **Custom handlers**:
  - `AuthEntryPointHandler` — xử lý authentication entry point
  - `AuthFailureHandler` — xử lý login fail
  - `AuthSuccessHandler` — xử lý login thành công
  - `LoggingSecurityFilter` — log security events
- **Public endpoints (không cần auth)**: Được định nghĩa trong `WebEndpointConstant.java`

---

## 4. Database & ORM

### PostgreSQL (`postgresql` driver & pgvector extension)

- **Mục đích**: Database chính & lưu trữ vector embeddings cho AI Chatbot
- **Image**: `pgvector/pgvector:pg16` (thay cho `postgres:16-alpine` tiêu chuẩn)
- **Cấu hình**: env variables `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- **Vector Search Engine**: Extension `vector`
  - Kiểu dữ liệu: `vector(1536)` cho embedding 1536 chiều từ OpenAI
  - Indexing: HNSW index với `vector_cosine_ops` cho phép tìm kiếm cosine similarity siêu tốc (`<=>`)
  - Native Query Casting: `CAST(:embedding AS vector)` trong câu lệnh native `@Modifying` upsert
- **Connection Pool**: HikariCP
  - Max pool size: 20
  - Min idle: 10
  - Connection timeout: 30s
  - Idle timeout: 10min
  - Max lifetime: 30min

### Spring Data JPA (`spring-boot-starter-data-jpa`)

- **Mục đích**: ORM framework, repository pattern
- **Hibernate dialect**: `PostgreSQLDialect`
- **DDL mode**: `validate` — chỉ validate schema, không tự tạo bảng
- **Sử dụng**:
  - `JpaRepository` — base interface cho tất cả repository
  - `@Query` — custom JPQL/native queries
  - Interface-based projections (`*Projection`) cho truy vấn tối ưu
  - `@PrePersist` — auto-generate UUID và timestamp

### Flyway (`flyway-core`, `flyway-database-postgresql`)

- **Mục đích**: Database migration management
- **Cấu hình**:
  - `spring.flyway.enabled=true`
  - `spring.flyway.baseline-on-migrate=true`
  - `spring.flyway.validate-on-migrate=true`
- **Migration scripts**: `src/main/resources/db/migration/`

---

## 5. Caching

### Redis (`spring-boot-starter-data-redis`)

- **Mục đích**: Distributed cache
- **Cấu hình tại**: `CachingConfig.java`
- **Annotation**: `@EnableCaching`
- **Bean**: `RedisTemplate<String, Object>`
  - Key serializer: `StringRedisSerializer`
  - Value serializer: `GenericJackson2JsonRedisSerializer` (hỗ trợ Java Time API)
- **Prefix naming**: Định nghĩa trong `RedisPrefixConstant.java`
  - Format: `dev_edu:{entity_type}:{identifier}:`
  - Ví dụ: `dev_edu:users:username:`, `dev_edu:courses:`, `dev_edu:courses:highlighted`
- **Duration**: Định nghĩa trong `RedisDurationConstant.java`
- **Utility**: `RedisUtils.java` — helper methods cho thao tác Redis

### Caffeine (`caffeine`)

- **Mục đích**: In-memory cache cho `RegisteredClientRepository`
- **Cấu hình tại**: `AuthorizationServerConfig.java`
- **Cache**: 2 Caffeine cache instances cho client lookup (by ID và by clientId)
  - Max size: 100 entries mỗi cache
  - TTL: theo `RedisDurationConstant.REGISTERED_CLIENT_DURATION`

---

## 6. Message Broker

### Apache Kafka (`spring-kafka`)

- **Mục đích**: Event-driven architecture cho async processing
- **Cấu hình tại**: `application.properties`
  - Producer: `StringSerializer` + `JsonSerializer`
  - Consumer: `StringDeserializer`, group-id: `dev-edu-group`
  - Auto-commit: disabled
  - Ack mode: `manual_immediate`
  - Concurrency: 3
  - Max poll records: 1
- **Topics** (định nghĩa trong `KafkaTopicConstant.java`):

| Topic | Mục đích |
|---|---|
| `file-delete-topic` | Xóa file từ storage |
| `video-duration-event-topic` | Lấy duration của video |
| `mail-send-topic` | Gửi email |
| `request-log-topic` | Log HTTP request |
| `tracking-event-topic` | Event tracking |
| `submission-event-topic` | Tracking nộp bài |
| `cron-job-event-topic` | Log kết quả cron job |
| `post-elastic-data-update-topic` | Sync bài viết lên Elasticsearch |
| `post-interactive-elastic-data-update-topic` | Sync dữ liệu tương tác bài viết |
| `post-elastic-data-delete-topic` | Xóa bài viết khỏi Elasticsearch |

- **Inject**: `KafkaTemplate<String, Object>` inject vào service classes
- **Utility**: `KafkaUtils.java` — helper methods cho gửi event

---

## 7. Search Engine

### Elasticsearch (`elasticsearch-java` 8.14.1)

- **Mục đích**: Full-text search cho bài viết forum
- **Cấu hình tại**: `ElasticConfig.java`
- **Bean**: `ElasticsearchClient` — sử dụng `RestClientTransport` + `JacksonJsonpMapper`
- **Index**: Định nghĩa trong `ElasticIndexConstant.java`
- **Sync**: Tự động sync dữ liệu từ PostgreSQL khi khởi động (`InitDataConfig.syncPostToElastic`)
- **Cập nhật realtime**: Thông qua Kafka events

---

## 8. File Storage

### Cloudflare R2 / AWS S3 SDK (`software.amazon.awssdk:s3` 2.31.50)

- **Mục đích**: Object storage cho file upload (ảnh, video, tài liệu)
- **Cấu hình tại**: `S3Config.java`
- **Beans**:
  - `S3Presigner` — tạo pre-signed URL cho upload
  - `S3Client` — thao tác trực tiếp với storage
- **Config properties**:
  - `cloudflare.r2.endpoint`
  - `cloudflare.r2.access-key` / `secret-key`
  - `cloudflare.r2.public-bucket-name` / `private-bucket-name`
  - `cloudflare.r2.public-url`
- **HTTP Client**: `software.amazon.awssdk:apache-client` — HTTP transport cho S3 SDK

---

## 9. Email Service

### Brevo SDK (`com.brevo:brevo` 1.1.0)

- **Mục đích**: Gửi email transactional (đăng ký, thông báo, v.v.)
- **Cấu hình tại**: `BrevoConfig.java`
- **Beans**:
  - `SendSmtpEmailSender` — thông tin người gửi
  - `ApiClient` — Brevo API client với API key auth
  - `TransactionalEmailsApi` — API gửi email
- **Service**: `MailService` (interface) → `MailServiceImpl`
- **Gửi qua Kafka**: Email events được gửi qua Kafka topic `mail-send-topic` và xử lý async

---

## 10. Payment Gateway

### VnPay

- **Mục đích**: Cổng thanh toán online
- **Cấu hình tại**: `application.properties`
  - `vnpay.tmn-code`, `vnpay.hash-secret`, `vnpay.url`, `vnpay.return-url`
- **Utility**: `PaymentUtils.java` — helper tạo URL thanh toán, verify chữ ký
- **Controller**: `PurchaseController` xử lý VnPay return callback
- **Enum hỗ trợ**: `PaymentMethod` (VNPAY, MOMO, ZALOPAY, PAYPAL, STRIPE — chỉ VnPay đang triển khai)

---

## 11. Object Mapping

### MapStruct (`org.mapstruct` 1.5.5.Final)

- **Mục đích**: Compile-time mapping giữa Entity ↔ DTO
- **Cấu hình build**: Maven Compiler Plugin với annotation processor paths cho cả Lombok và MapStruct
- **Annotation**: `@Mapper(componentModel = "spring")`
- **Vị trí**: `mapper/` package trong mỗi module
- **Ví dụ**: `CourseMapper`, `UserMapper`, `LectureMapper`, `PostMapper`

### Lombok (`org.projectlombok`)

- **Mục đích**: Giảm boilerplate code
- **Annotations thường dùng**: `@Data`, `@Builder`, `@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@FieldDefaults`, `@Slf4j`, `@ToString`
- **Pattern nhất quán**: `@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)` cho service/controller; `@FieldDefaults(level = AccessLevel.PRIVATE)` cho DTO/entity

---

## 12. PDF Generation

### Flying Saucer (`org.xhtmlrenderer:flying-saucer-pdf` 9.13.3)

- **Mục đích**: Generate PDF từ HTML/XHTML templates
- **Sử dụng**: Không tìm thấy controller/service cụ thể sử dụng trực tiếp trong codebase hiện tại, có thể đang được phát triển

---

## 13. ID Generation

### UUID Creator (`com.github.f4b6a3:uuid-creator` 5.3.3)

- **Mục đích**: Tạo UUIDv7 (time-ordered epoch) cho primary key
- **Sử dụng tại**: `UuidV7Generator.java` và `@PrePersist` trong entity
- **Method**: `UuidCreator.getTimeOrderedEpoch()`
- **Ưu điểm**: UUIDv7 có tính chất thời gian, tối ưu cho indexing trong database

---

## 14. Development & Build Tools

### Spring Boot DevTools (`spring-boot-devtools`)

- **Mục đích**: Hot reload trong development
- **Scope**: runtime, optional

### Spring Boot JSON (`spring-boot-starter-json`)

- **Mục đích**: Jackson JSON serialization/deserialization
- **Cấu hình JavaTimeModule**: trong `CachingConfig.java` và `PagingUtils.java`

### Spring Boot Test (`spring-boot-starter-test`)

- **Mục đích**: Testing framework
- **Scope**: test
- **Ghi chú**: Các dependency test bổ sung (JPA test, Redis test, Security test, WebMvc test) đang bị comment out trong `pom.xml`

### Maven Compiler Plugin

- **Cấu hình**: Java 21 source/target
- **Annotation processors**: Lombok + MapStruct (thứ tự quan trọng)

---

## 15. Monitoring & Observability

### Spring Boot Actuator (`spring-boot-starter-actuator`)

- **Mục đích**: Health check, metrics, tracing
- **Endpoints exposed**: `health`, `info`, `metrics`, `trace`
- **Health details**: `always` show
- **Tracing sampling**: 100%
- **Logging levels**:
  - `com.pht.dev_edu`: DEBUG
  - `org.springframework.web`: DEBUG
  - `org.hibernate.SQL`: DEBUG
  - `org.hibernate.orm.jdbc.bind`: TRACE

---

## 16. Containerization

### Docker

- **Dockerfile**: `Dockerfile.dev` — cho development
- **Docker Compose** (`docker-compose.yml`):

| Service | Image | Port |
|---|---|---|
| `app` | Build từ Dockerfile.dev | 9000 |
| `postgres` | `pgvector/pgvector:pg16` | 5433→5432 |
| `redis` | `redis:7-alpine` | 6380→6379 |
| `elasticsearch` | `elasticsearch:8.14.1` | 9200 |
| `kafka` | `apache/kafka:3.7.1` | 9092, 29092 |

- **Volumes**: `m2-cache`, `postgres-data`, `redis-data`, `kafka-data`
- **Health check**: PostgreSQL có healthcheck, app depends_on postgres healthy

---

## 17. AI & Vector Database Integration

### OpenAI REST API Integration

- **Model Embedding**: `text-embedding-3-small` (1536 chiều)
- **Model Chat Completions**: `gpt-4o-mini` (hoặc `gpt-4o`)
- **HTTP Client**: Spring 6 / Spring Boot 3 `RestClient` (Base URL: `https://api.openai.com`)
- **Header**: `Authorization: Bearer ${OPENAI_API_KEY}`
- **OpenAI Function Calling (Tools)**:
  - `search_courses_semantic(query)`: Tìm kiếm khoá học bằng ngữ nghĩa tự nhiên qua vector cosine similarity.
  - `search_courses_filtered(category, level, priceMin, priceMax)`: Lọc khoá học chính xác theo tiêu chí.

### Automated Vector Synchronization

- **CommandLineRunner Initializer**: Cấu hình `@Order(4)` trong `InitDataConfig.java` tự động rà soát và tạo embedding cho các khoá học chưa có data hoặc bị thay đổi nội dung khi ứng dụng khởi chạy.
- **HTML Stripping & Sanitization**: Bóc tách toàn bộ thẻ HTML trong mô tả khoá học (`stripHtmlTags`) và xoá bỏ prompt instruction nghi ngờ (`sanitizeText`) trước khi sinh vector.


---

## Tóm tắt cơ chế Dependency Injection

| Cơ chế | Annotation | Nơi sử dụng |
|---|---|---|
| Constructor Injection | `@RequiredArgsConstructor` + `@FieldDefaults(makeFinal=true)` | Tất cả Controller, Service |
| Configuration class | `@Configuration` + `@Bean` | `common/config/` |
| Component scan | `@Component`, `@Service`, `@Repository` | Entity layers |
| Method Security | `@EnableMethodSecurity` + `@PreAuthorize` | SecurityBeansConfig + Controllers |
| Scheduling | `@EnableScheduling` + `@Scheduled` | CommonConfig + Scheduler classes |
| Caching | `@EnableCaching` | CachingConfig |
