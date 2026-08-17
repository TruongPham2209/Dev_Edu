# Dev-Edu Backend Application 🎓

> **Dev-Edu Backend** is an API server supplying RESTful services for the Online Education & Learning Management System (LMS Platform). The system is built on **Java 21** and **Spring Boot 3.5.13**, adhering to a **Layered Architecture combined with Module-based Package Organization**.

---

## 📋 Table of Contents

- [1. Overview](#1-overview)
- [2. Core Business Modules](#2-core-business-modules)
- [3. Technology Stack](#3-technology-stack)
- [4. Prerequisites](#4-prerequisites)
- [5. Setup & Running Guide](#5-setup--running-guide)
  - [Option 1: Docker Compose (Recommended)](#option-1-docker-compose-recommended)
  - [Option 2: Local Development](#option-2-local-development)
- [6. Project Structure](#6-project-structure)
- [7. Detailed Documentation](#7-detailed-documentation)
- [8. Coding Conventions](#8-coding-conventions)

---

## 1. Overview

**Dev-Edu Backend** is engineered to power learning management workflows, including technology course catalogs, video lectures, student assignments, grading, interactive forums, AI learning consultation, and automated tuition payment processing.

Key Highlights:
- 🔐 **Security & Authorization**: Self-hosted OAuth2 Authorization Server powered by Spring Security 6, BCrypt encryption, supporting both Form Login and Google OAuth2 login.
- ⚡ **High Performance**: Harnessing Java 21 Virtual Threads for non-blocking asynchronous processing (Async Tasks, Cron Jobs).
- 🧠 **AI & Search Integration**: OpenAI GPT-4o-mini integration for AI Chatbot consulting, Vector Database (`pgvector`) for semantic search, and Elasticsearch for full-text search.
- 💳 **Flexible Payments**: Support for VNPay, MoMo, ZaloPay, and PayPal with automated order fulfillment and course enrollment workflows.
- ☁️ **Cloud Storage**: Cloudflare R2 (S3-compatible API) integration for media and document assets.

---

## 2. Core Business Modules

| Module | Description |
|---|---|
| 👤 **User** | Registration, login, profile management, password updates, Role-Based Access Control (`ADMIN`, `LECTURER`, `STUDENT`). |
| 📚 **Course** | Category management, course catalog, featured courses, discount programs, and course reviews. |
| 🛒 **Enrollment** | Shopping cart, order creation (Checkout), online payment processing, enrollment tracking. |
| 🎥 **Lecture** | Managing lecture content, video streaming URLs, and supplementary learning documents. |
| 📝 **Assignment** | Managing assignments, student submissions, grading workflows, and instructor feedback. |
| ❓ **Quiz** | Quiz creation, question banks, exam matrices, and automated assessment. |
| 💬 **Forum** | Discussion forum, comments, versioned post histories, and content moderation. |
| 🤖 **Chat / AI** | AI Assistant answering student questions and recommending courses via OpenAI API. |
| 📡 **Notification** | Real-time push notifications sent to users via Firebase Cloud Messaging (FCM). |
| 📁 **File** | Secure upload/download management with Cloudflare R2 and async event processing via Apache Kafka. |
| 📊 **Metric & Tracking** | Analytics reporting revenue, user access metrics, and learning progress. |

---

## 3. Technology Stack

- **Core Framework**: Java 21, Spring Boot 3.5.13
- **Security**: Spring Security 6, OAuth2 Authorization Server
- **Database & ORM**: PostgreSQL 16 (with `pgvector`), Spring Data JPA, Flyway Migration
- **Cache & In-Memory**: Redis 7
- **Message Queue**: Apache Kafka 3.7.1
- **Search Engine**: Elasticsearch 8.14.1
- **Cloud Storage**: Cloudflare R2 (AWS S3 SDK)
- **Mail Service**: Brevo API
- **AI Integration**: OpenAI SDK (`gpt-4o-mini`, `text-embedding-3-small`)
- **Containerization**: Docker, Docker Compose

👉 *For complete details, refer to:* [**Tech Stack & Dependencies Document**](docs/techstack.md)

---

## 4. Prerequisites

Ensure your system meets the following prerequisites before running the project:

- **JDK**: Java 21 or higher (OpenJDK 21 or Eclipse Temurin 21 recommended)
- **Build Tool**: Maven 3.8+ (or use the included Maven Wrapper script `./mvnw`)
- **Container Engine**: Docker Desktop or Docker Engine + Docker Compose v2+
- **Git**: Source control management

---

## 5. Setup & Running Guide

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd back-end
```

### Step 2: Environment Configuration

Copy the provided `.env.dev` template to `.env`:

```bash
# Linux / macOS
cp .env.dev .env

# Windows (PowerShell)
Copy-Item .env.dev .env
```

Verify and update configuration properties in `.env` (Port, Database Credentials, API Keys):
```env
SERVER_PORT=9020
POSTGRES_HOST=jdbc:postgresql://localhost:5433
POSTGRES_DB=dev_education
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourPassword
REDIS_HOST=localhost
REDIS_PORT=6380
BOOTSTRAP_SERVER=localhost:29092
...
```

---

### Option 1: Docker Compose (Recommended)

Builds and runs the entire stack (PostgreSQL, Redis, Kafka, Elasticsearch, Backend app) inside containers:

```bash
# Start all services in background
docker compose up -d --build

# View application logs
docker compose logs -f app

# Stop all services
docker compose down
```

The application will be accessible at `http://localhost:9000` (or the configured `SERVER_PORT`).

---

### Option 2: Local Development

#### 1. Start Infrastructure Containers:

```bash
docker compose up -d postgres redis kafka elasticsearch
```

#### 2. Launch Spring Boot Application:

- **Linux / macOS:**
  ```bash
  ./mvnw clean spring-boot:run
  ```

- **Windows (PowerShell / CMD):**
  ```powershell
  .\mvnw.cmd clean spring-boot:run
  ```

The server will start at `http://localhost:9020` (or configured port in `.env`).

---

## 6. Project Structure

Organized into domain modules inside package `com.pht.dev_edu`:

```text
src/main/java/com/pht/dev_edu/
├── BackEndApplication.java          # Main Application Entry Point
├── common/                          # System-wide Config, Exception, DTO & Utilities
│   ├── config/                      # WebConfig, SecurityBeansConfig, CommonConfig...
│   ├── constant/                    # System Constants
│   ├── dto/                         # ResponseGeneral, PaginationDTO...
│   ├── exception/                   # GlobalExceptionHandler, Custom Exceptions
│   ├── security/                    # Token filters, Auth providers
│   └── util/                        # Helper utilities (DateTime, Security, String...)
├── user/                            # User Management Module
├── course/                          # Course & Review Management Module
├── enrollment/                      # Shopping Cart, Order & Payment Module
├── lecture/                         # Lecture Management Module
├── assignment/                      # Assignment & Submission Module
├── quiz/                            # Quiz Management Module
├── forum/                           # Forum & Discussion Module
├── file/                            # File Storage Module
├── chat/                            # AI Chatbot Module
├── notification/                    # Firebase Push Notification Module
└── metric/                          # System Analytics Module
```

👉 *Read the full architecture overview in:* [**Architecture Document**](docs/architecture.md)

---

## 7. Detailed Documentation

Detailed technical documents located in the [`docs/`](docs/) directory:

| Document | Path | Key Content |
|---|---|---|
| 🛠️ **Tech Stack** | [docs/techstack.md](docs/techstack.md) | Comprehensive list of dependencies, libraries, bean configurations, and external integrations. |
| 🏗️ **Architecture** | [docs/architecture.md](docs/architecture.md) | Layered architecture, module package design, layer interactions, and data flow. |
| 📡 **API Reference** | [docs/api.md](docs/api.md) | Complete REST API endpoint reference, request DTOs, response schemas, and authorization requirements. |
| 🧪 **Testing Guide** | [docs/testing.md](docs/testing.md) | Unit & Integration testing suite, JUnit 5/Mockito structure, and test execution commands. |
| 📜 **Rules & Conventions** | [docs/rule.md](docs/rule.md) | Business logic rules, validation rules, exception handling conventions, and feature development guidelines. |

---

## 8. Coding Conventions

When contributing code, please follow these conventions:

1. **Coding Style**: Follow the Google Java Style Guide. Variables/methods should use `camelCase`, and classes/interfaces should use `PascalCase`.
2. **Standard Response**: All REST endpoints return a unified `ResponseGeneral<T>` format containing `status`, `message`, `data`, and `timestamp`.
3. **Data Validation**: Utilize Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`) along with marker group interfaces (`CreateValidation`, `UpdateValidation`).
4. **Exception Handling**: Avoid swallowing exceptions. Throw specific custom exceptions defined in `common/exception` to be formatted by `GlobalExceptionHandler`.

👉 *Read full guidelines in:* [**Rules & Conventions Document**](docs/rule.md)

---

✨ *Happy Coding with Dev-Edu Backend!*
