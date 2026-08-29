# Architecture & Codebase Structure — DevEdu Frontend

This document outlines the system architecture, routing mechanisms, component organization, and codebase layout for the DevEdu Frontend (Next.js 16 + Material UI).

---

## 1. Architecture Overview

* **Framework Routing**: **Next.js App Router** (Structured under `src/app`).
* **Architectural Pattern**: **Role & Feature-based Boundary** combined with a **Layered Architecture**:
  * **Presentation Layer (UI & Pages)**: Located at `src/app/` and `src/components/`.
  * **Business & State Layer (Hooks & Services)**: Located at `src/hooks/` and `src/lib/api/`.
  * **Domain & Type Layer**: Located at `src/lib/type/`.
  * **Authentication & Guard Layer**: Located at `src/proxy.ts` and `src/lib/auth/`.

---

## 2. Directory Layout

```text
front-end/
├── docs/                        # System documentation
├── public/                      # Static assets (logos, favicons, images...)
├── src/
│   ├── app/                     # Next.js App Router (Pages, Route Groups, API routes)
│   │   ├── (admin)/             # Admin route group (dashboard, users, courses, quizzes, notifications, discounts, posts)
│   │   ├── (lecturer)/          # Lecturer route group (courses management, submissions, grading)
│   │   ├── (student)/           # Student route group (home, courses, my-courses, cart, checkout, profile, forum)
│   │   ├── api/                 # Next.js API Routes (Route handlers e.g. token proxy)
│   │   ├── login/               # Authentication & Server Actions (Guest-only)
│   │   ├── logout/              # Logout route handler
│   │   ├── register/            # Registration page (Guest-only)
│   │   ├── firebase-messaging-sw.js # Firebase Cloud Messaging (FCM) Service Worker
│   │   ├── globals.css          # Global CSS styles
│   │   └── layout.tsx           # Root Layout (Inject Providers, Fonts, AuthSync)
│   ├── components/              # Reusable UI Components
│   │   ├── auth/                # Session synchronization component (AuthSync)
│   │   ├── card/                # Card UI components (CourseCard, PostCard, SkeletonCard...)
│   │   ├── chat/                # Direct messaging chat window & conversation list
│   │   ├── common/              # Common UI (ButtonAction, DataTable, CommentItem, Skeletons, Form wrappers)
│   │   │   └── form/            # Form controls (FormInput, FilterSelect, RichTextEditor, FileUpload, FormDialog)
│   │   ├── dialog/              # Business Modal Dialogs (CourseForm, CategoryForm, LectureForm...)
│   │   ├── layout/              # Header, Footer, Navigation Bar, UserMenu per role
│   │   ├── providers/           # AppProviders (React Query, MUI ThemeProvider, Antd ConfigProvider, ToastProvider)
│   │   └── skeleton/            # Shared skeleton loaders
│   ├── hooks/                   # Custom React Hooks (useDebounce, ...)
│   ├── lib/                     # Core Logic, API Client, Authentication & Types
│   │   ├── api/                 # Backend REST API calls & React Query Hooks (courses.ts, users.ts, forum.ts, quizzes.ts...)
│   │   ├── auth/                # Auth logic (JWT parser, RBAC routes, Cookie helper, Login logic)
│   │   ├── theme/               # Centralized Light/Dark Theme Subsystem (types, tokens, overrides, provider)
│   │   │   ├── components.ts    # Global MUI component default overrides (MuiPaper, MuiCard, MuiCssBaseline...)
│   │   │   ├── create-app-theme.ts # Dynamic MUI Theme & AntD Algorithm generator
│   │   │   ├── theme-provider.tsx # ThemeModeProvider & useThemeMode hook
│   │   │   ├── tokens.ts        # Light/Dark color palette semantic tokens
│   │   │   └── types.ts         # ThemeMode union type ('light' | 'dark')
│   │   ├── type/                # TypeScript interfaces & Enums (api.ts, courses.ts, users.ts, quizzes.ts...)
│   │   ├── util/                # Utility functions (date-utils.ts, file-utils.tsx, status-utils.ts)
│   │   ├── auth-storage.ts      # LocalStorage auth state management
│   │   ├── navigation.ts        # Navigation helpers
│   │   ├── role-theme.ts        # Role-based color palette / theme configuration
│   │   ├── roles.tsx            # Role checking utilities
│   │   ├── toast-context.tsx    # Context API for Toast notifications
│   │   └── use-api-with-toast.ts# Hook wrapping API calls with automatic Toast feedback
│   ├── __tests__/               # Integration / UI Unit tests
│   ├── proxy.ts                 # Middleware / Route Protection Proxy (Next.js 16 Edge Middleware)
│   └── setupTests.ts            # Vitest & Testing Library configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies & scripts declaration
├── tsconfig.json                # TypeScript compiler configuration
└── vitest.config.ts             # Vitest configuration
```

---

## 3. Core Component Roles

1. **`src/app/(admin)`, `(lecturer)`, `(student)` (Route Groups)**:
   * Group pages by user role without altering public URL structures.
   * Each Route Group maintains its own `layout.tsx` rendering role-specific layout controls (Header, Sidebar, Navigation).

2. **`src/components/common/form/` (Form Control Wrappers)**:
   * `FormInput`: Wraps native input/textarea controls using MUI Stack & Typography, handling focus effects, icons, helper texts, and character counters.
   * `FilterSelect`: MUI select dropdown for category and status filtering.
   * `RichTextEditor`: Feature-rich WYSIWYG editor based on `@tiptap/react`.
   * `FileUpload`: Drag-and-drop file uploader supporting image previews and size/extension validation.
   * `FormDialog`: Universal Modal Dialog wrapping creation and editing forms.

3. **`src/components/common/data-table.tsx`**:
   * Shared Data Table component supporting pagination, row actions, empty states, and loading indicators.

4. **`src/components/chat/` (Chat Interface & Conversation List)**:
   * Direct messaging interface between students and instructors/admins, supporting conversation lists, message histories, and read receipts.

5. **`src/lib/api/` (API Layer & Server State Hooks)**:
   * API calling wrappers (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) and custom React Query hooks (`useQuery`, `useInfiniteQuery`, `useMutation`).

6. **`src/proxy.ts` (Next.js 16 Proxy / Middleware)**:
   * Inspects JWT tokens from `access_token` cookies on incoming requests.
   * Enforces Role-Based Access Control (RBAC): Redirects unauthenticated requests to `/login`, or redirects unauthorized access to the default dashboard corresponding to the user's role (`/admin`, `/lecturer`, `/home`).

---

## 4. Routing & RBAC Protection

### 4.1. Route Categorization
* **Public Routes**: Publicly accessible pages (`/home`, `/courses`, `/courses/[id]`, `/forum`, `/posts/[id]`).
* **Guest-only Routes**: Restricted to unauthenticated users (`/login`, `/register`). Authenticated users attempting access are redirected by `proxy.ts`.
* **Protected Routes**:
  * Admin Portal: `/admin/*` (Requires `ADMIN` role).
  * Lecturer Portal: `/lecturer/*` (Requires `LECTURER` role).
  * Cart & Checkout: `/cart`, `/checkout` (Requires `STUDENT` role).
  * Profile Page: `/profile` (Accessible by any authenticated user).

---

## 5. Server Components vs Client Components

* **Server Components (Default)**:
  * Used for landing pages, course detail pages, and server actions (`src/app/layout.tsx`, `src/app/(student)/home/page.tsx`, `src/app/login/page.tsx`).
  * Responsibilities: Reading auth cookies, fetching initial server data, SEO optimization, and streaming props to Client Components.
* **Client Components (`"use client"`)**:
  * Used for interactive components (`src/components/`), modal forms (`FormDialog`), filters, search bars, and management dashboards invoking APIs via React Query.
  * Responsibilities: Managing local state, user event handling (click, submit), and real-time API invocation.

---

## 6. State Management & Subsystems

1. **Server State (Backend REST API Data)**:
   * Managed centrally via **TanStack React Query (v5)**.
   * Features automated caching, infinite scrolling (`useInfiniteQuery`), and query invalidation (`queryClient.invalidateQueries`) following successful mutations.

2. **Local Component State**:
   * Managed via native React `useState`, `useMemo`, `useEffect` within Dialog Forms and UI controls.

3. **Global UI State (Toast Notifications)**:
   * Managed via React Context API (`ToastContext` at `src/lib/toast-context.tsx`).
   * Provides `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()` displaying MUI Snackbars.

4. **Auth State & Synchronization**:
   * Tokens stored in **HTTP-Only Cookies** (for Server Side & `proxy.ts`) and **`localStorage`** (for Client Side API client).
   * `AuthSync` component and `auth-init-script` in `layout.tsx` synchronize authentication state between server and client.

5. **Quiz System Architecture**:
   * **Exam Matrix Configurations**: Configuring question difficulty ratios (easy/medium/hard) per topic.
   * **Attempt Lifecycle**: Sessions (`startAttempt`), periodic answer sync (`autosaveAttempt`), heartbeat checks (`heartbeatAttempt`), and final submission (`submitAttempt`).
   * **Essay Grading**: Instructors view pending essay submissions (`getPendingGradings`), assign scores, and provide feedback (`gradeEssayQuestion`).

6. **Notification Subsystem & FCM Push**:
   * `src/app/firebase-messaging-sw.js` Service Worker renders push notifications even when the browser runs in background.
   * FCM registration tokens are registered with the backend API `/api/v1/notifications`.
   * Personal and group notification channels support unread count indicators.

7. **Theme Subsystem & Dark/Light Mode Architecture**:
   * Managed via `ThemeModeProvider` at `src/lib/theme/theme-provider.tsx` wrapping the app in `AppProviders`.
   * Dynamically constructs Material UI Theme (`createAppTheme`) and aligns Ant Design Algorithm (`antdTheme.darkAlgorithm` vs `defaultAlgorithm`).
   * `layout.tsx` injects an inline `#theme-init-script` that sets `data-theme="dark"` attribute and `dark` class on `<html>` before hydration to prevent FOUC (Flash of Unstyled Content).
   * MUI global overrides in `src/lib/theme/components.ts` customize `MuiCssBaseline`, `MuiPaper`, `MuiCard`, `MuiAppBar`, `MuiDialog`, `MuiMenu`, `MuiPopover`, `MuiDrawer`, `MuiTableCell`, `MuiOutlinedInput`, `MuiChip`, `MuiTooltip` default behaviors across Light and Dark modes.

