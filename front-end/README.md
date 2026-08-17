# 🎓 DevEdu Frontend

A modern Online Education & Learning Management Platform (E-Learning & Course Management System) built on **Next.js 16 (App Router)**, **Material UI (MUI v9)**, **TanStack React Query (v5)**, **TypeScript**, and **Firebase Push Notifications**.

---

## 🌟 Key Features

### 👨‍🎓 For Students
* **Course Discovery & Search**: Search and filter courses by category, price, and keywords; view detailed lectures and reviews.
* **Enrollment & Cart**: Online shopping cart, checkout processing, and multi-gateway payment integration (VNPay, MoMo, ZaloPay, PayPal, Stripe).
* **Learning Experience**: Video streaming, progress tracking, and downloadable learning materials.
* **Quiz & Exam System**: Interactive multiple-choice & essay exams featuring Autosave, real-time heartbeats, exam history, and instant score summaries.
* **Discussion Forum**: Post creation, comments, Q&A interactions, and bookmarking favorite posts.
* **Real-time Chat**: Direct messaging between students and instructors.
* **Real-time Notifications**: Instant push notifications via Firebase Cloud Messaging (FCM).

### 👨‍🏫 For Lecturers
* **Course Management**: Create and update course contents, lectures, assignments, and resource materials.
* **Question Bank & Quiz Builder**: Build question banks, matrix-based exam configurations, publish quizzes, and assign tests.
* **Essay Grading**: Intuitive grading interface to review student essay answers and submit feedback.
* **Student Roster**: Track enrolled students and review assignment submission histories.

### 🛡️ For Administrators
* **Analytics Dashboard**: Real-time charts tracking user growth, course counts, revenue, and system activity logs.
* **User & Role Management (RBAC)**: Manage user accounts, perform batch user imports, and assign roles (`ADMIN`, `LECTURER`, `STUDENT`).
* **Content Moderation**: Moderate forum posts, course publications, and quiz approvals.
* **Group Notifications**: Dispatch system notifications to target user groups or all users.
* **Discounts & Promotions**: Manage system-wide course discount campaigns.

---

## 🛠️ Technology Stack

* **Core Framework**: [Next.js 16.2](https://nextjs.org/) (App Router, Server Components, Edge Proxy Middleware)
* **UI & Styling**: [Material UI (MUI v9)](https://mui.com/), [Ant Design (v6)](https://ant.design/), Tailwind CSS v4, Lucide React Icons
* **State Management**: [TanStack React Query v5](https://tanstack.com/query) (Server State), React Context API (UI State)
* **Rich Text Editor**: [TipTap Editor v3](https://tiptap.dev/)
* **Real-time Push Notifications**: [Firebase Cloud Messaging (FCM v12)](https://firebase.google.com/)
* **Testing & Tools**: [Vitest v4](https://vitest.dev/), React Testing Library, ESLint 9, TypeScript 5

---

## 📁 Project Structure

```text
front-end/
├── docs/                        # Architecture, API integration, tech stack & rules documentation
├── public/                      # Static assets (images, icons, manifest)
├── src/
│   ├── app/                     # Next.js App Router (Pages & Route Groups)
│   │   ├── (admin)/             # Admin portal (/admin/*)
│   │   ├── (lecturer)/          # Lecturer portal (/lecturer/*)
│   │   ├── (student)/           # Student portal (/home, /courses, /profile, /cart...)
│   │   ├── login/               # Authentication & OAuth Server Actions
│   │   ├── register/            # User registration page
│   │   └── firebase-messaging-sw.js # Firebase Cloud Messaging Service Worker
│   ├── components/              # React UI Components
│   │   ├── auth/                # Auth state synchronization (AuthSync)
│   │   ├── card/                # CourseCard, PostCard, SkeletonCard...
│   │   ├── chat/                # Messaging chat window & conversation list
│   │   ├── common/              # Common UI, Form wrappers, DataTable, Dialogs
│   │   ├── layout/              # Navbars, Headers, Footers by role
│   │   └── providers/           # AppProviders (MUI Theme, React Query, Antd, Toast)
│   ├── hooks/                   # Custom React Hooks
│   ├── lib/
│   │   ├── api/                 # REST API Services & React Query Custom Hooks
│   │   ├── auth/                # OAuth2, JWT Token logic & Cookie Helpers
│   │   ├── type/                # TypeScript Interfaces & Enums
│   │   └── proxy.ts             # Next.js 16 Route Protection Middleware
│   └── __tests__/               # Unit & Integration Tests
├── next.config.ts               # Next.js Configuration
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript Configuration
└── vitest.config.ts             # Vitest Configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file at the root of `front-end/` with the following properties:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:9020

# Keycloak / OAuth2 Client Configuration
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=devedu-frontend
KEYCLOAK_CLIENT_SECRET=your_client_secret_here
KEYCLOAK_REALM=devedu

# Firebase Push Notification Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5555`.

### 3. Testing & Code Quality
```bash
# Run unit tests via Vitest
npm run test

# Run ESLint check
npm run lint
```

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## 📚 Detailed Documentation

Five standardized documents are provided in `docs/`:

1. 📖 **[docs/architecture.md](docs/architecture.md)** — Architecture overview, layer diagrams, RBAC Proxy middleware, and directory organization.
2. 🧰 **[docs/techstack.md](docs/techstack.md)** — Technology dependencies list and configuration purposes.
3. 🔌 **[docs/api-integration.md](docs/api-integration.md)** — API services catalog, request/response DTOs, and React Query custom hooks.
4. 🧪 **[docs/testing.md](docs/testing.md)** — Vitest unit and integration testing suite, setup configs, and test commands.
5. 📏 **[docs/rule.md](docs/rule.md)** — Naming conventions, component guidelines, form validation patterns, and UI rules.
