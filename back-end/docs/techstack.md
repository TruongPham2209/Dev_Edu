# Tech Stack & Dependencies — Dev-Edu Backend

> This document lists the full technology stack and dependencies utilized across the project, including configuration details and dependency injection patterns.

---

## Table of Contents

- [1. General Information](#1-general-information)
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

## 1. General Information

| Attribute | Value |
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
- **Purpose**: Core application framework
- **Configuration**: `application.properties`
- **Entry point**: `BackEndApplication.java` — `@SpringBootApplication`

### Spring Web (`spring-boot-starter-web`)

- **Purpose**: REST API development
- **Configured at**: `WebConfig.java`
- **Configured Beans**:
  - `RestTemplate` — HTTP client bean
  - `CorsConfigurationSource` — CORS configuration enabling origins `localhost:5500`, `localhost:5555`
- **Annotations**: `@EnableWebMvc`, `@EnableWebSecurity`

### Spring Thymeleaf (`spring-boot-starter-thymeleaf`)

- **Purpose**: Server-side rendering for OAuth2 login pages and HTML templates (emails, etc.)
- **Additional Dependency**: `thymeleaf-extras-springsecurity6` — Spring Security integration for Thymeleaf templates
- **Configuration**: Static resource handler in `WebConfig.java` serving assets from `classpath:/static/images/`

### Spring Validation (`spring-boot-starter-validation`)

- **Purpose**: Bean Validation (JSR 380) for request DTOs
- **Annotations**: `@Valid`, `@Validated`, `@NotBlank`, `@NotNull`, `@Size`, `@Pattern`, `@Email`, `@DecimalMin`, `@DecimalMax`, `@Min`, `@FutureOrPresent`, `@Null`
- **Validation Groups**: `CreateValidation`, `UpdateValidation`, `DeleteValidation`, `SortValidation` — marker interfaces under `common/validation/`

### Virtual Threads (Java 21)

- **Configured at**: `CommonConfig.java`
- **Bean**: `Executor taskExecutor()` — using `Executors.newThreadPerTaskExecutor(Thread.ofVirtual())`
- **Purpose**: Virtual thread executor for non-blocking asynchronous processing (batch deletion, background tasks)

### Scheduling

- **Annotation**: `@EnableScheduling` in `CommonConfig.java`
- **Purpose**: Cron jobs for data cleanup (soft-deleted entities, expired files, expired payments)
- **Cron Jobs**: Defined in `CronJobConstant.java` and implemented inside module `scheduler/` packages

---

## 3. Security & Authentication

### Spring Security (`spring-boot-starter-security`)

- **Configured at**: `AuthorizationServerConfig.java`, `SecurityBeansConfig.java`
- **Beans**:
  - `PasswordEncoder` — BCrypt version $2B, strength 9
  - `SessionRegistry` — Session management
  - `HttpSessionEventPublisher`
- **Annotation**: `@EnableMethodSecurity` — Method-level security with `@PreAuthorize`

### OAuth2 Authorization Server (`spring-boot-starter-oauth2-authorization-server`)

- **Purpose**: Full self-hosted OAuth2 Authorization Server
- **Configured at**: `AuthorizationServerConfig.java`, `JwtConfig.java`, `InitDataConfig.java`
- **Custom Password Grant Type**: Implemented custom grant `urn:custom:password`:
  - `OAuth2PasswordGrantAuthenticationConverter` — Converts request
  - `OAuth2PasswordGrantAuthenticationProvider` — Handles authentication logic
  - `OAuth2PasswordGrantAuthenticationToken` — Token data structure
- **Registered Client**: JDBC persistence, Caffeine in-memory cache
  - Default client: `web_client` / `web_client_secret`
  - Grant types: `authorization_code`, `refresh_token`, `urn:custom:password`
  - Access token TTL: 5 minutes
  - Refresh token TTL: 1 day
- **JWT**:
  - RSA key pair (3072-bit), generated at runtime
  - Custom claims: `roles`, `token_type`
  - `JwtAuthenticationConverter` — Extracts roles from JWT claims into granted authorities
- **Security Filter Chains**:
  - **Order 1**: Authorization Server endpoints (token, OIDC)
  - **Order 2**: Web security — API endpoints, form login, logout
- **Custom Handlers**:
  - `AuthEntryPointHandler` — Authentication entry point exception handling
  - `AuthFailureHandler` — Login failure handling
  - `AuthSuccessHandler` — Login success handling
  - `LoggingSecurityFilter` — Logs security events
- **Public Endpoints**: Defined in `WebEndpointConstant.java`

---

## 4. Database & ORM

### PostgreSQL (`postgresql` driver & pgvector extension)

- **Purpose**: Primary database & vector embeddings storage for AI Chatbot
- **Docker Image**: `pgvector/pgvector:pg16`
- **Environment Configuration**: `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- **Vector Search Engine**: Extension `vector`
  - Data type: `vector(1536)` for 1536-dimensional OpenAI embeddings
  - Indexing: HNSW index with `vector_cosine_ops` for fast cosine similarity search (`<=>`)
  - Native Query Casting: `CAST(:embedding AS vector)` within native `@Modifying` upsert statements
- **Connection Pool**: HikariCP
  - Max pool size: 20, Min idle: 10, Connection timeout: 30s, Idle timeout: 10min, Max lifetime: 30min

### Spring Data JPA (`spring-boot-starter-data-jpa`)

- **Purpose**: ORM framework, repository pattern
- **Hibernate Dialect**: `PostgreSQLDialect`
- **DDL Mode**: `validate` — schema validation only
- **Usage**:
  - `JpaRepository` — base repository interface
  - `@Query` — custom JPQL and native queries
  - Interface-based projections (`*Projection`) for optimized query performance
  - `@PrePersist` — auto-generating UUIDs and timestamps

### Flyway (`flyway-core`, `flyway-database-postgresql`)

- **Purpose**: Database schema migration management
- **Configuration**:
  - `spring.flyway.enabled=true`
  - `spring.flyway.baseline-on-migrate=true`
  - `spring.flyway.validate-on-migrate=true`
- **Migration Scripts**: `src/main/resources/db/migration/`

---

## 5. Caching

### Redis (`spring-boot-starter-data-redis`)

- **Purpose**: Distributed cache
- **Configured at**: `CachingConfig.java`
- **Annotation**: `@EnableCaching`
- **Bean**: `RedisTemplate<String, Object>`
  - Key serializer: `StringRedisSerializer`
  - Value serializer: `GenericJackson2JsonRedisSerializer` (supporting Java Time API)
- **Prefix Naming**: Defined in `RedisPrefixConstant.java` (`dev_edu:{entity_type}:{identifier}:`)
- **Duration**: Defined in `RedisDurationConstant.java`
- **Utility**: `RedisUtils.java` — Helper methods for Redis operations

### Caffeine (`caffeine`)

- **Purpose**: In-memory caching for `RegisteredClientRepository`
- **Configured at**: `AuthorizationServerConfig.java`
- **Cache Instances**: 2 Caffeine caches for client lookup (by ID and by clientId)
  - Max size: 100 entries per cache
  - TTL: Configured via `RedisDurationConstant.REGISTERED_CLIENT_DURATION`

---

## 6. Message Broker

### Apache Kafka (`spring-kafka`)

- **Purpose**: Event-driven architecture for asynchronous processing
- **Configuration**: `application.properties`
  - Producer: `StringSerializer` + `JsonSerializer`
  - Consumer: `StringDeserializer`, group-id: `dev-edu-group`
  - Auto-commit: disabled, Ack mode: `manual_immediate`, Concurrency: 3
- **Topics** (Defined in `KafkaTopicConstant.java`):

| Topic | Purpose |
|---|---|
| `file-delete-topic` | File storage deletion |
| `video-duration-event-topic` | Extract video duration |
| `mail-send-topic` | Send email events |
| `request-log-topic` | HTTP request logging |
| `tracking-event-topic` | User tracking events |
| `submission-event-topic` | Assignment submission tracking |
| `cron-job-event-topic` | Cron job execution logging |
| `post-elastic-data-update-topic` | Sync forum posts to Elasticsearch |
| `post-interactive-elastic-data-update-topic` | Sync post interaction analytics |
| `post-elastic-data-delete-topic` | Delete posts from Elasticsearch |

- **Utility**: `KafkaUtils.java` — Event publishing helper

---

## 7. Search Engine

### Elasticsearch (`elasticsearch-java` 8.14.1)

- **Purpose**: Full-text search engine for forum posts
- **Configured at**: `ElasticConfig.java`
- **Bean**: `ElasticsearchClient` — using `RestClientTransport` + `JacksonJsonpMapper`
- **Index**: Defined in `ElasticIndexConstant.java`
- **Data Sync**: Automated synchronization from PostgreSQL upon startup (`InitDataConfig.syncPostToElastic`)
- **Real-time Updates**: Handled via Kafka events

---

## 8. File Storage

### Cloudflare R2 / AWS S3 SDK (`software.amazon.awssdk:s3` 2.31.50)

- **Purpose**: Object storage for uploaded files (images, videos, documents)
- **Configured at**: `S3Config.java`
- **Beans**:
  - `S3Presigner` — Pre-signed URL generation for direct client uploads
  - `S3Client` — Direct storage management
- **HTTP Transport**: `software.amazon.awssdk:apache-client`

---

## 9. Email Service

### Brevo SDK (`com.brevo:brevo` 1.1.0)

- **Purpose**: Transactional email delivery (registrations, notifications, etc.)
- **Configured at**: `BrevoConfig.java`
- **Beans**: `SendSmtpEmailSender`, `ApiClient`, `TransactionalEmailsApi`
- **Async Execution**: Emails dispatched via Kafka topic `mail-send-topic`

---

## 10. Payment Gateway

### VNPay

- **Purpose**: Online payment processing
- **Configuration**: `application.properties` (`vnpay.tmn-code`, `vnpay.hash-secret`, `vnpay.url`, `vnpay.return-url`)
- **Utility**: `PaymentUtils.java` — URL creation & signature verification helpers
- **Controller**: `PurchaseController` handling VNPay return callbacks
- **Supported Payment Methods**: VNPay (Active), MoMo, ZaloPay, PayPal, Stripe

---

## 11. Object Mapping

### MapStruct (`org.mapstruct` 1.5.5.Final)

- **Purpose**: Compile-time object mapping (Entity ↔ DTO)
- **Annotation**: `@Mapper(componentModel = "spring")`
- **Mappers**: `CourseMapper`, `UserMapper`, `LectureMapper`, `PostMapper`, etc.

### Lombok (`org.projectlombok`)

- **Purpose**: Boilerplate code reduction (`@Data`, `@Builder`, `@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@FieldDefaults`, `@Slf4j`)

---

## 12. PDF Generation

### Flying Saucer (`org.xhtmlrenderer:flying-saucer-pdf` 9.13.3)

- **Purpose**: HTML/XHTML to PDF template rendering

---

## 13. ID Generation

### UUID Creator (`com.github.f4b6a3:uuid-creator` 5.3.3)

- **Purpose**: UUIDv7 (time-ordered epoch) generation for primary keys
- **Generator**: `UuidV7Generator.java` via `@PrePersist` hooks (`UuidCreator.getTimeOrderedEpoch()`)

---

## 14. Development & Build Tools

- **Spring Boot DevTools**: Hot reload support
- **Spring Boot JSON**: Jackson JSON serialization (`JavaTimeModule`)
- **Spring Boot Test**: Testing framework
- **Maven Compiler Plugin**: Java 21 configuration with Lombok + MapStruct processors

---

## 15. Monitoring & Observability

### Spring Boot Actuator (`spring-boot-starter-actuator`)

- **Endpoints Exposed**: `health`, `info`, `metrics`, `trace`
- **Logging Levels**: `com.pht.dev_edu`: DEBUG, `org.hibernate.SQL`: DEBUG

---

## 16. Containerization

### Docker & Docker Compose (`docker-compose.yml`)

| Service | Image | Port |
|---|---|---|
| `app` | Build from `Dockerfile.dev` | 9000 |
| `postgres` | `pgvector/pgvector:pg16` | 5433→5432 |
| `redis` | `redis:7-alpine` | 6380→6379 |
| `elasticsearch` | `elasticsearch:8.14.1` | 9200 |
| `kafka` | `apache/kafka:3.7.1` | 9092, 29092 |

---

## 17. AI & Vector Database Integration

### OpenAI REST API Integration

- **Embedding Model**: `text-embedding-3-small` (1536 dimensions)
- **Chat Model**: `gpt-4o-mini`
- **Function Calling Tools**:
  - `search_courses_semantic(query)`: Semantic course search via vector cosine similarity.
  - `search_courses_filtered(...)`: Parameter-based course filtering.

### Automated Vector Synchronization

- **CommandLineRunner Initializer**: `@Order(4)` in `InitDataConfig.java` automatically indexes un-embedded or modified courses upon system startup.

---

## Dependency Injection Summary

| Pattern | Annotation | Usage Scope |
|---|---|---|
| Constructor Injection | `@RequiredArgsConstructor` + `@FieldDefaults(makeFinal=true)` | All Controllers & Services |
| Configuration Classes | `@Configuration` + `@Bean` | `common/config/` |
| Component Scanning | `@Component`, `@Service`, `@Repository` | System layers |
| Method Security | `@EnableMethodSecurity` + `@PreAuthorize` | SecurityBeansConfig + Controllers |
| Scheduling | `@EnableScheduling` + `@Scheduled` | CommonConfig + Scheduler classes |
| Caching | `@EnableCaching` | CachingConfig |
