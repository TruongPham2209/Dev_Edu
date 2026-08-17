# Dev-Edu Education Platform 🎓

> **Dev-Edu** is a comprehensive Online Education & Learning Management System (LMS). The platform supports course management, video lectures, assignments, quizzes, discussion forums, AI-driven learning assistant integration, and automated tuition payment processing.

---

## 📋 Table of Contents

- [1. Overview](#1-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Technology Stack](#3-technology-stack)
- [4. Key Features](#4-key-features)
- [5. Repository Structure](#5-repository-structure)
- [6. Quick Start Guide](#6-quick-start-guide)
- [7. Sub-system Documentation](#7-sub-system-documentation)

---

## 1. Overview

The **Dev-Edu** project is designed as a modern web application with a clear separation between the **Frontend** (Next.js SPA/SSR) and the **Backend** (Spring Boot RESTful APIs & OAuth2 Server):

- 🎨 **Frontend**: Responsive user interface optimized for student, lecturer, and administrator user experiences (UX).
- ⚙️ **Backend**: High-performance API server with strict security (OAuth2, RBAC), Java 21 Virtual Threads support, cloud storage integration, and asynchronous processing.

---

## 2. System Architecture

```text
[ Client (Browser) ]
       │
       ├── (HTTP / REST API & OAuth2) ──► [ Frontend: Next.js 16 (Port 5555) ]
       │                                            │
       └── (REST APIs / WebSockets) ───────────────┼───────────────┐
                                                   ▼               ▼
                                       [ Backend: Spring Boot 3.5 (Port 9020/9000) ]
                                                   │
         ┌───────────────────┬─────────────────────┼─────────────────────┬───────────────────┐
         ▼                   ▼                     ▼                     ▼                   ▼
[ PostgreSQL 16 ]    [ Redis Cache ]     [ Apache Kafka ]     [ Elasticsearch ]     [ Cloudflare R2 ]
(pgvector / Data)    (Session/Cache)     (Async Events)       (Full-text Search)    (Media Storage)
```

---

## 3. Technology Stack

### 🖥️ Frontend Stack (`front-end/`)
- **Core Framework**: Next.js 16.2 (App Router, Server Components), React 19, TypeScript 5
- **UI & Styling**: Material UI (MUI v9), Ant Design (v6), Tailwind CSS v4, Lucide React Icons
- **State Management**: TanStack React Query v5 (Server State), React Context API
- **Rich Text & Media**: TipTap Editor v3
- **Notifications**: Firebase Cloud Messaging (FCM v12)
- **Testing & Tools**: Vitest v4, React Testing Library, ESLint 9

### ⚙️ Backend Stack (`back-end/`)
- **Core Framework**: Java 21 (Virtual Threads), Spring Boot 3.5.13
- **Security & Authentication**: Spring Security 6, OAuth2 Authorization Server (Self-hosted)
- **Database & ORM**: PostgreSQL 16 (with `pgvector`), Spring Data JPA, Flyway Migration
- **Caching & Message Broker**: Redis 7, Apache Kafka 3.7.1
- **Search Engine & AI**: Elasticsearch 8.14.1, OpenAI SDK (`gpt-4o-mini`, `text-embedding-3-small`)
- **Cloud Storage & Email**: Cloudflare R2 (S3 API), Brevo API
- **Containerization**: Docker, Docker Compose

---

## 4. Key Features

- 👨‍🎓 **Student Experience**:
  - Smart course discovery, filtering, and search (Full-text & Semantic search).
  - Shopping cart & Multi-gateway checkout: VNPay, MoMo, ZaloPay, PayPal.
  - Video lecture streaming, assignment submission, and learning progress tracking.
  - Interactive quiz & essay exams (Autosave, real-time timer countdown).
  - Q&A Discussion Forum, AI Assistant for course consulting, Firebase FCM push notifications.

- 👨‍🏫 **Lecturer Dashboard**:
  - Manage course content, video lectures, and learning materials.
  - Create quiz question banks & exam matrix configurations.
  - Essay grading interface with student feedback and submission history.

- 🛡️ **Admin Portal**:
  - Real-time analytics dashboard tracking users, courses, and revenue growth.
  - User management, Role-Based Access Control (RBAC), and batch user import.
  - Content moderation for forum posts and courses, system-wide discount campaigns.

---

## 5. Repository Structure

Project root directory layout:

```text
Dev_Edu/
├── front-end/               # Frontend Application (Next.js 16 App Router)
│   ├── docs/                # FE specific architecture & API docs
│   ├── src/                 # React / Next.js source code
│   ├── package.json         # FE dependencies & scripts
│   └── README.md            # Detailed Frontend guide
│
├── back-end/                # Backend Application (Spring Boot 3.5)
│   ├── docs/                # Detailed docs: techstack.md, architecture.md, api.md, rule.md
│   ├── src/                 # Java / Spring Boot source code
│   ├── pom.xml              # BE Maven dependencies
│   ├── docker-compose.yml   # Docker stack configuration (Postgres, Redis, Kafka, ES)
│   └── README.md            # Detailed Backend guide
│
└── README.md                # Main System Documentation (This file)
```

---

## 6. Quick Start Guide

### Prerequisites:
- **Node.js** 20+ & **npm** 10+
- **JDK** 21+ & **Maven** 3.8+
- **Docker** & **Docker Compose** v2+

### 1. Launch Backend & Infrastructure

Configure the environment file and launch backend containers:

```bash
cd back-end

# Copy environment configuration template
cp .env.dev .env

# Start infrastructure (Postgres, Redis, Kafka, Elasticsearch) & Backend app via Docker Compose
docker compose up -d --build
```
> The Backend API will listen at `http://localhost:9000` (or `http://localhost:9020` depending on `.env`).

### 2. Launch Frontend Application

Install dependencies and start the Next.js development server:

```bash
cd front-end

# Install dependencies
npm install

# Start Next.js Dev Server (Port 5555)
npm run dev
```
> Access the Frontend application at `http://localhost:5555`.

---

## 7. Sub-system Documentation

Please refer to the detailed documentation for each sub-system via the links below:

| Sub-system | README Path | Testing Guide | Main Content |
|---|---|---|---|
| 🖥️ **Frontend** | [front-end/README.md](front-end/README.md) | [front-end/docs/testing.md](front-end/docs/testing.md) | Setup guide, Next.js 16 configuration, Material UI, React Query, Firebase FCM, `src/app` architecture, Vitest testing suite. |
| ⚙️ **Backend** | [back-end/README.md](back-end/README.md) | [back-end/docs/testing.md](back-end/docs/testing.md) | Setup guide for Java 21, Docker Compose stack, backend modules description, configuration workflows, JUnit 5/Mockito test suite. |

---

## 8. Testing Overview

Both sub-systems include automated test suites:

- 🧪 **Backend Testing**: Built with JUnit 5, Mockito, and Spring Boot Test. Run tests via `./mvnw test` inside `back-end/`. See [Backend Testing Guide](back-end/docs/testing.md).
- 🧪 **Frontend Testing**: Built with Vitest, React Testing Library, and jsdom. Run tests via `npm run test` inside `front-end/`. See [Frontend Testing Guide](front-end/docs/testing.md).

---

✨ *The Dev-Edu system is designed and built for modern education and learning experiences.*
