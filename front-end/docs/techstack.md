# Tech Stack & Dependencies — DevEdu Frontend

This document details the technologies, libraries, and development tools utilized within the DevEdu Frontend project based on `package.json` and codebase analysis.

---

## 1. Core Framework & Language

| Technology | Version | Purpose | Configuration / Entry |
| :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.2` | React Framework with App Router, Server Components, SSR, Server Actions, and Route Handlers (dev server running on port `5555`). | `next.config.ts`, `src/app/`, `package.json` |
| **React** | `19.2.4` | UI library for reactive interface development. | `package.json`, `.tsx` files |
| **React DOM** | `19.2.4` | DOM rendering engine for React. | `src/app/layout.tsx` |
| **TypeScript** | `^5.0.0` | Static typing language for type safety across components. | `tsconfig.json` |

---

## 2. UI Libraries & Styling Engine

### 2.1. Material UI (MUI v9) - Primary UI Component Suite
* **Packages**: `@mui/material` (`^9.0.0`), `@mui/icons-material` (`^9.0.0`), `@mui/material-nextjs` (`^9.0.0`).
* **Purpose**: Core component system (Button, Dialog, Paper, Typography, Box, Stack, Grid, Snackbar, Alert, Table, Skeleton...).
* **Theme Configuration (`ThemeProvider`)**:
  * Located at [app-providers.tsx](../src/components/providers/app-providers.tsx).
  * Color Palette: `primary.main` (`#2563eb`), `secondary.main` (`#7c3aed`), `background.default` (`#f8fafc`).
  * Typography: Configured to use font variable `--font-geist-sans`.
  * Style Overrides: Rounded buttons (`borderRadius: 14`), rounded papers (`borderRadius: 16`), disabled default uppercase transform (`textTransform: "none"`).
* **AppRouterCacheProvider**: Initialized in [layout.tsx](../src/app/layout.tsx) via `@mui/material-nextjs/v16-appRouter` for seamless Next.js 16 App Router SSR integration.

### 2.2. Ant Design (Antd v6) & Emotion
* **Packages**: `antd` (`^6.3.7`), `@ant-design/icons` (`^6.2.2`), `@emotion/react` (`^11.14.0`), `@emotion/styled` (`^11.14.1`), `@emotion/cache` (`^11.14.0`).
* **Purpose**: Provides specific specialized UI components and acts as style engine for MUI.
* **Configuration**: Wrapped via `ConfigProvider` in `app-providers.tsx` to align palette tokens (`colorPrimary: "#2563eb"`) with MUI.

### 2.3. Utility CSS & Icons
* **Tailwind PostCSS v4**: `@tailwindcss/postcss` (`^4`), `tailwindcss` (`^4`). Core base styles declared in `src/app/globals.css`.
* **Lucide React**: `lucide-react` (`^0.540.0`). Primary icon library used across navbars, buttons, and alert components.

---

## 3. Data Fetching & State Management

### 3.1. TanStack React Query (v5)
* **Package**: `@tanstack/react-query` (`^5.100.14`).
* **Purpose**: Server state management, data caching, automated refetching, infinite list scrolling (`useInfiniteQuery`).
* **Provider Initialization**: Wrapped in `src/components/providers/app-providers.tsx`.
* **Integration Pattern**: Domain API modules (`courses.ts`, `users.ts`, `forum.ts`, `enrollments.ts`, `assignments.ts`, `lectures.ts`, `metrics.ts`, `quizzes.ts`, `chat.ts`, `notification.ts`) expose custom query/mutation hooks. Successful mutations trigger `queryClient.invalidateQueries(...)`.

### 3.2. Native Fetch Client & Custom Wrapper
* **Entry file**: [client.ts](../src/lib/api/client.ts).
* **Purpose**: Wraps native `fetch`, automatically extracts JWT Tokens from `localStorage` or Cookie `access_token`, validates envelope response structure `ApiResponse<T>`, and throws `ApiError`.

### 3.3. Toast Context
* **Entry file**: [toast-context.tsx](../src/lib/toast-context.tsx).
* **Purpose**: React Context provider managing floating snackbars and alert toasts.
* **Hook Wrapper**: [use-api-with-toast.ts](../src/lib/use-api-with-toast.ts) automatically presents success or error toasts from API responses.

### 3.4. Firebase Cloud Messaging (FCM Push Notifications)
* **Package**: `firebase` (`^12.17.1`).
* **Purpose**: Registers web push notification service worker (`src/app/firebase-messaging-sw.js`) and handles real-time push notifications.

---

## 4. Rich Text & File Utilities

### 4.1. TipTap Rich Text Editor
* **Packages**: `@tiptap/react` (`^3.23.4`), `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/pm`.
* **Purpose**: Feature-rich WYSIWYG rich text editor for course descriptions, forum posts, and lecture contents ([rich-text-editor.tsx](../src/components/common/form/rich-text-editor.tsx)).

### 4.2. Excel Processing
* **Package**: `xlsx` (`^0.18.5`).
* **Purpose**: Parsing and exporting Excel files for batch user creation and assignment submission records.

---

## 5. Testing Infrastructure

| Library | Version | Purpose | Config File |
| :--- | :--- | :--- | :--- |
| **Vitest** | `^4.1.10` | High-speed test runner replacing Jest. | `vitest.config.ts` |
| **Testing Library React** | `^16.3.2` | Rendering and inspecting React components in test runner. | `src/setupTests.ts` |
| **Testing Library Jest DOM** | `^7.0.0` | Custom DOM element matchers (`toBeInTheDocument`, `toHaveValue`...). | `src/setupTests.ts` |
| **Testing Library User Event** | `^14.6.1` | Simulating user interactions (click, type, hover). | `*.test.tsx` files |
| **JSDOM** | `^29.1.1` | Simulating browser DOM environment in Node.js during test execution. | `vitest.config.ts` |

---

## 6. Build Tools & Linters

* **ESLint 9 & eslint-config-next**: Source code syntax check.
* **Babel React Compiler Plugin**: `babel-plugin-react-compiler` (`1.0.0`). Automated React render optimization.
* **Google Fonts (`Geist`, `Geist_Mono`)**: Direct font optimization initialized in `src/app/layout.tsx`.
