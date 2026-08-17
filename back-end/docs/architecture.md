# Dev-Edu Backend System Architecture

> This document describes the architecture and codebase organization of the Dev-Edu Backend project.

---

## Table of Contents

- [1. Architecture Overview](#1-architecture-overview)
- [2. Primary Package Structure](#2-primary-package-structure)
- [3. Detailed Package Descriptions](#3-detailed-package-descriptions)
- [4. Layered Architecture](#4-layered-architecture)
- [5. Layer Interactions](#5-layer-interactions)
- [6. Module-based Package Organization](#6-module-based-package-organization)

---

## 1. Architecture Overview

Dev-Edu Backend is a **Spring Boot 3.5** application powered by **Java 21**, organized using a **Layered Architecture combined with Module-based Package Organization**. Each business module (user, course, enrollment, assignment, lecture, file, forum, livestream, quiz, notification, metric, tracking, chat) is structured into its own distinct package, containing the layered hierarchy: `controller → service → repository → entity`.

Cross-cutting concerns and shared infrastructure components reside within the `common` package.

---

## 2. Primary Package Structure

```text
com.pht.dev_edu/
├── BackEndApplication.java          # Main Application Entry Point
├── common/                          # Cross-cutting Shared Components
│   ├── config/                      # System Configurations
│   ├── constant/                    # System Constants
│   ├── dto/                         # Shared DTOs
│   ├── exception/                   # Exception Handling Hierarchy
│   │   ├── data/                    # Data Exception classes
│   │   ├── io/                      # I/O Exception classes
│   │   ├── security/                # Security Exception classes
│   │   └── server/                  # Server Exception classes
│   ├── generator/                   # ID Generators (UUIDv7)
│   ├── security/                    # Security filters & OAuth2 Providers
│   ├── service/                     # Shared Services
│   ├── util/                        # Utility helper functions
│   └── validation/                  # Bean Validation groups
│
├── user/                            # User Management Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   └── service/
│
├── course/                          # Course & Review Management Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── enrollment/                      # Shopping Cart, Order & Payment Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── assignment/                      # Assignment & Submission Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── lecture/                         # Lecture Management Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── file/                            # Storage & Upload Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── kafka/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── forum/                           # Forum & Discussion Module
│   ├── controller/
│   ├── document/                    # Elasticsearch document
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── livestream/                      # Livestream Module
│   ├── entity/
│   └── repo/
│
├── metric/                          # Dashboard & Analytics Module
│   ├── controller/
│   ├── dto/
│   ├── repo/
│   └── service/
│
├── quiz/                            # Quiz & Examination Module
│   ├── controller/                  # QuizController, QuizQuestionController, QuizAttemptController, QuizAssignmentController, QuizGradingController
│   ├── dto/
│   ├── entity/                      # QuizEntity, QuizQuestionEntity, QuizAttemptEntity...
│   ├── kafka/                       # Kafka event handlers
│   ├── mapper/
│   ├── repo/
│   ├── scheduler/
│   └── service/
│
├── notification/                    # Notification & FCM Token Module
│   ├── controller/                  # NotificationController, NotificationGroupController, DeviceTokenController
│   ├── dto/
│   ├── entity/                      # NotificationPersonalEntity, NotificationGroupEntity, DeviceTokenEntity...
│   ├── mapper/
│   ├── repo/
│   └── service/
│
├── tracking/                        # Tracking & Logging Module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── kafka/
│   ├── mapper/
│   ├── repo/
│   └── service/
│
└── chat/                            # AI Chatbot Module
    ├── controller/                  # ChatController
    ├── dto/                         # Request, Response, CourseCard DTOs
    │   └── openai/                  # OpenAI API DTOs (Tools, Messages)
    ├── entity/                      # CourseEmbeddingEntity, ChatConversationEntity, ChatMessageEntity
    ├── repository/                  # CourseEmbeddingRepository (pgvector HNSW), ChatConversationRepository, ChatMessageRepository
    └── service/                     # ChatService/Impl, CourseEmbeddingService/Impl, OpenAiService/Impl
```

---

## 3. Detailed Package Descriptions

### 3.1. `common` — Shared Infrastructure

| Sub-package | Role | Examples |
|---|---|---|
| `config/` | System configurations: Security, CORS, Caching, S3, Brevo mail, Elasticsearch, JWT, data initialization | `AuthorizationServerConfig`, `CachingConfig`, `S3Config` |
| `constant/` | System constants: Kafka topics, Redis prefixes/durations, Cron job identifiers, Web endpoints | `KafkaTopicConstant`, `RedisPrefixConstant`, `WebEndpointConstant` |
| `dto/` | Common DTO wrappers: response models, pagination, global enums | `ApiResponse`, `CustomPaging`, `RoleEnum`, `ItemStatus` |
| `exception/` | Layered exception hierarchy: `AbstractException` → Specialized base classes → Specific exceptions | `GlobalExceptionHandler`, `BadRequestException`, `DataNotFoundException` |
| `generator/` | Time-ordered UUIDv7 generator | `UuidV7Generator` |
| `security/` | Custom OAuth2 password grant providers, security filters, handlers | `OAuth2PasswordGrantAuthenticationProvider`, `LoggingSecurityFilter` |
| `service/` | Common services: asynchronous batch deletion, transactional mail service | `DeleteProcessor`, `MailServiceImpl` |
| `util/` | Utility classes: API response builders, exception formatters, pagination helpers, security context, Redis/Kafka/Payment helpers | `ApiUtils`, `PagingUtils`, `SecurityContextUtils`, `RedisUtils` |
| `validation/` | Bean Validation marker interfaces | `CreateValidation`, `UpdateValidation`, `DeleteValidation` |

### 3.2. `user` — User Management Module

Handles user registration, authentication, profiles, password changes, and avatars.

### 3.3. `course` — Course Management Module

Handles course categories, course listings, discounts, and student reviews.

### 3.4. `enrollment` — Shopping Cart & Payment Module

Handles cart management, checkout orders, VNPay payment processing, and course enrollments.

### 3.5. `assignment` — Assignment Module

Manages assignment creation, student submissions, and instructor feedback.

### 3.6. `lecture` — Lecture Module

Manages lecture content, attachments, student comments, and learning progress.

### 3.7. `file` — File Storage Module

Handles file uploads via Cloudflare R2 / S3 pre-signed URLs.

### 3.8. `forum` — Forum Module

Manages forum posts, version histories, comments, and Elasticsearch search integration.

### 3.9. `livestream` — Livestream Module

Provides entity models for streaming sessions.

### 3.10. `metric` — Analytics & Dashboard Module

Admin analytics reporting growth charts, revenue metrics, top courses, and top users.

### 3.11. `tracking` — Tracking & Logging Module

Logs HTTP requests, system events, cron executions, and assignment submissions.

### 3.12. `chat` — AI Chatbot Consultation Module

AI assistant providing course recommendations using OpenAI Chat Completions (Function Calling) and Vector Similarity (`pgvector`).

### 3.13. `quiz` — Quiz & Examination Module

Manages question banks, automated exam grading, essay grading interfaces, and quiz assignments.

### 3.14. `notification` — Notification & FCM Device Token Module

Manages personal and group notifications, read tracking, and Firebase Cloud Messaging (FCM) device tokens.

---

## 4. Layered Architecture

Each business module follows a strict 4-tier architecture:

```text
┌─────────────────────────┐
│     Controller Layer    │  ← Handles HTTP requests, validation, delegation
├─────────────────────────┤
│      Service Layer      │  ← Business logic, authorization checks, transactions
├─────────────────────────┤
│    Repository Layer     │  ← Database persistence (JPA)
├─────────────────────────┤
│      Entity Layer       │  ← Domain entities & ORM mapping
└─────────────────────────┘
```

| Layer | Naming | Annotation | Role |
|---|---|---|---|
| **Controller** | `*Controller` | `@RestController` | Receives HTTP requests, validates input (`@Valid`/`@Validated`), retrieves SecurityContext, delegates to services, returns standard `ApiResponse`. |
| **Service** | `*Service` / `*ServiceImpl` | `@Service` | Contains business logic, code-level access authorization, repository calls, Redis caching, Kafka event publishing. |
| **Repository** | `*Repository` | extends `JpaRepository` | Database persistence via Spring Data JPA and custom `@Query` definitions. |
| **Entity** | `*Entity` | `@Entity` | ORM table mappings, `@PrePersist` UUIDv7 and timestamp generation. |
| **Mapper** | `*Mapper` | `@Mapper` (MapStruct) | Compile-time mapping between Entity ↔ DTOs. |
| **DTO** | `*Request`, `*Response`, `*Projection` | Lombok `@Data` | Request payload validation and response projections. |

---

## 5. Layer Interactions

```text
Client (Frontend)
    │
    ▼
┌─── Controller ───┐
│  @PreAuthorize    │  ← Method-level security
│  @Valid/@Validated │  ← Bean Validation
│  SecurityContext   │  ← Current user & roles
│  ApiUtils.build    │  ← Response wrapping
└────────┬─────────┘
         │
         ▼
┌─── Service ──────┐
│  Business Logic   │
│  Redis Cache      │  ← RedisUtils / RedisTemplate
│  Kafka Events     │  ← KafkaTemplate.send()
│  Transaction      │  ← @Transactional
└────────┬─────────┘
         │
         ▼
┌─── Repository ───┐
│  JPA Repository   │
│  @Query           │
│  Projection       │  ← Interface projections
└────────┬─────────┘
         │
         ▼
┌─── Database ─────┐
│  PostgreSQL       │
│  Flyway Migration │
└──────────────────┘
```

---

## 6. Module-based Package Organization

The project employs a **package-by-feature** strategy:

- **Modular**: Each feature package (`user`, `course`, `enrollment`...) is an isolated business unit.
- **Cross-cutting**: System concerns live inside `common/`.
- **Consistent Structure**: Every package uses standard sub-folders: `controller/`, `service/`, `repo/`, `entity/`, `dto/`, `mapper/`, `scheduler/`.
