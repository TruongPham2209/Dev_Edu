# Frontend Testing Guide — Dev-Edu

> Comprehensive testing documentation for the Dev-Edu Next.js frontend application.

---

## 1. Overview

The Dev-Edu Frontend unit & integration testing suite is built using **Vitest**, **React Testing Library**, and **jsdom**. The test suite validates UI component rendering, custom React hooks, route protection middleware (`proxy.ts`), form validations, and state integrations.

---

## 2. Testing Tech Stack

| Tool / Framework | Version | Role / Purpose |
|---|---|---|
| **Vitest** | ^3.x | Fast Unit & Integration test runner |
| **React Testing Library** | ^16.x | Component rendering, queries, and DOM assertions |
| **jsdom** | ^26.x | In-memory DOM implementation for Node.js environment |
| **@testing-library/jest-dom** | ^6.x | Custom matchers for DOM state assertions (`toBeInTheDocument`, etc.) |
| **@testing-library/user-event** | ^14.x | Simulating realistic browser interactions (clicks, inputs, keypresses) |

---

## 3. Configuration & Setup

### 3.1 `vitest.config.ts`

The testing environment is configured with path alias mapping (`@` → `./src`) and jsdom environment:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.2 `src/setupTests.ts`

Pre-loads `@testing-library/jest-dom` extensions before executing test suites:

```typescript
import '@testing-library/jest-dom';
```

---

## 4. Test Directory Layout

Tests are located under `src/__tests__/` and alongside components:

```
src/
├── __tests__/
│   └── proxy.test.ts          # Route protection & RBAC middleware tests
├── components/
│   └── ...                    # UI component unit test files (*.test.tsx)
├── setupTests.ts              # Testing setup script
```

---

## 5. Running Tests

### 5.1 Run All Tests (Single Pass)

```bash
npm run test
```

### 5.2 Run Tests in Watch Mode

```bash
npm run test -- --watch
```

### 5.3 Run Specific Test File

```bash
npx vitest run src/__tests__/proxy.test.ts
```

### 5.4 Generate Test Coverage Report

```bash
npx vitest run --coverage
```

---

## 6. Key Testing Patterns

### 6.1 Route Protection & RBAC Testing (`proxy.test.ts`)

Verifies route access rules, token verification, redirect behavior, and role-based authorization for public, student, lecturer, and admin routes.

### 6.2 Component Testing Strategy

- **User-centric Queries**: Use `getByRole`, `getByText`, and `getByLabelText` instead of implementation details.
- **Provider Wrapping**: Wrap components under test with `QueryClientProvider` (TanStack Query) and Material UI `ThemeProvider` where needed.
- **Mocking Next.js Navigation**: Mock `next/navigation` hooks (`useRouter`, `usePathname`, `useSearchParams`) in tests.
