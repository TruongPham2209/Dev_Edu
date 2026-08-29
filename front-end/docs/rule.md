# Coding Standards & Architecture Patterns — DevEdu Frontend

This document summarizes coding conventions, architectural design patterns, and application standards enforced across the DevEdu Frontend project.

---

## 1. Naming Conventions

### 1.1. Files & Directories

- **React Component & Page files**: Use `kebab-case` (`course-card.tsx`, `form-input.tsx`, `animated-tabs.tsx`).
- **Custom Hooks**: Prefix with `use-` in `kebab-case` (`use-auth.ts`, `use-debounce.ts`, `use-api-with-toast.ts`).
- **API Client & Helper files**: Use `kebab-case` (`courses.ts`, `date-utils.ts`, `role-theme.ts`).
- **Types & Interfaces files**: Use `kebab-case` inside `src/lib/type/` (`courses.ts`, `users.ts`, `assignments.ts`).

### 1.2. Variables, Functions & Components

- **React Component Name**: Use **PascalCase** (`CourseFormDialog`, `DataTable`, `FormInput`).
- **Functions & Variables**: Use **camelCase** (`getCourseById`, `handleSave`, `isSearchingLecturers`).
- **Custom Hook Name**: Use **camelCase** starting with `use` (`useCourseByIdQuery`, `useToast`, `useDebounce`).
- **TypeScript Types & Interfaces**: Use **PascalCase** (`CourseRequest`, `CourseResponse`, `CustomPaging<T>`).
- **Enums**: Use **PascalCase** (`RoleEnum`, `ItemStatus`, `PaymentStatus`).

---

## 2. Component Layout Structure

A React component file must adhere to the following order:

1. **Directives**: `"use client";` on the top line if required.
2. **Imports**:
   - External libraries (`react`, `@mui/material`, `@tanstack/react-query`, `lucide-react`).
   - Shared components & helpers (`@/components/common/...`, `@/lib/...`).
   - Types & Enums (`@/lib/type/...`).
3. **TypeScript Props Type**: Define `type Props` or `interface Props` directly above the component function.
4. **Component Function Definition**:

```tsx
export function CourseFormDialog({ open, onClose, onSave }: CourseFormDialogProps) {
  // 4.1. Custom Hooks & Query Hooks
  const toast = useToast();
  const { data, isLoading } = useCourseByIdQuery(...);

  // 4.2. Local Component State
  const [form, setForm] = useState<CourseRequest>(initialValue);
  const [touched, setTouched] = useState(false);

  // 4.3. Derived State & Validation Logic (useMemo)
  const errors = useMemo(() => ({
    title: form.title.trim().length < 3,
  }), [form]);
  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  // 4.4. Effects
  useEffect(() => { ... }, [open]);

  // 4.5. Event Handlers & Callbacks
  const handleSave = () => { ... };

  // 4.6. Render JSX
  return (
    <FormDialog ...>
      ...
    </FormDialog>
  );
}
```

---

## 3. Form Handling & Validation Rules

The project adopts **Controlled Components with Custom Validation**:

1. **State Management**: Managed via `useState` using typed interfaces (`CourseRequest`, `CategoryRequest`).
2. **Validation Logic**:
   - Error states computed via `useMemo` based on form state.
   - `touched` flag tracks whether the user interacted or submitted to prevent immediate error display.
3. **Error Presentation**: Pass `error={touched && errors.field}` and `helperText="..."` directly to input wrappers (`FormInput`, `FilterSelect`, `FileUpload`).
4. **Submit Button State**: FormDialog submit buttons accept `isSubmitDisabled={!isValid || saving}`.

---

## 4. UI Loading, Error & Empty States

Asynchronous pages or data components must handle 4 states:

1. **Loading State**: Render appropriate Skeleton loaders (`SkeletonCard`, `CourseManageGridSkeleton`, or MUI `Skeleton`).
2. **Error State**: Render [error-state.tsx](../src/components/common/error-state.tsx) displaying error messages and a "Retry" button (triggering React Query `refetch`).
3. **Empty State**: Render [empty-state.tsx](../src/components/common/empty-state.tsx) when array data is empty (`data.length === 0`).
4. **Success State**: Render primary UI components.

---

## 5. API Call & Query Guidelines

1. **No Direct API Calls in Components**:
   - Component files must not call `fetch()` directly inside handlers or `useEffect`.
   - All API endpoints must be declared inside `src/lib/api/` and exported as React Query Custom Hooks.
2. **Cache Invalidation**:
   - Mutation Hooks (`useCreateCourseMutation`, `useUpdateCourseMutation`) must invalidate relevant queries on `onSuccess`:
     ```typescript
     queryClient.invalidateQueries({ queryKey: ["courses"] });
     ```
3. **Toast Feedback**:
   - Utilize `useApiWithToast()` hook to automatically present `ApiError` feedback.

---

## 6. Material UI Styling Rules

1. **Prefer `sx` Prop**:
   - Avoid inline `style={{ ... }}` properties. Use MUI `sx` with Theme palette tokens:
     ```tsx
     <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, color: "primary.main" }}>
     ```
2. **Theme Colors & Alpha Utility**:
   - Utilize `alpha(theme.palette.primary.main, 0.1)` from `@mui/material` for subtle background tints.
3. **Responsive Breakpoints**:
   - Define responsiveness using breakpoint objects in `sx`:
     ```tsx
     <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }}>
     ```
4. **Use Form Control Wrappers**:
   - Prefer `FormInput`, `SearchInput`, `FilterSelect`, `FileUpload`, `RichTextEditor` over raw `TextField`.

---

## 7. State Scope Guidelines

- **Local State**: UI transient states (dialog open/close, un-debounced search input, active tab).
- **Server State**: Managed via `@tanstack/react-query` for backend REST API data.
- **Global UI State**: React Context API for global UI components (`ToastProvider`).
- **Auth State**: Synchronized between HTTP-Only cookies and `localStorage` via `AuthSync`.

---

## 8. Role-Based Access Control (RBAC) Rules

- Route protection enforced via `src/proxy.ts` (Next.js Edge Middleware).
- Never remove or bypass token validation on protected routes (`/admin`, `/lecturer`, `/cart`, `/checkout`).
- Roles: `ADMIN`, `LECTURER`, `STUDENT`.
- Role default routes: `ADMIN` -> `/admin`, `LECTURER` -> `/lecturer`, `STUDENT` -> `/home`.

---

## 9. Common Development Patterns

1. **Management Dashboard Pattern (Admin / Lecturer)**:
   - **Header**: `ManageHeader` (Title, Subtitle, Action Button e.g. "Add Course").
   - **Toolbar**: `SearchInput` (debounced) + `FilterSelect` (category/status filter).
   - **Body**: `DataTable` or Card Grid with Skeletons.
   - **Dialogs**: `FormDialog` for Create/Edit, `ConfirmDialog` for Delete.

2. **Infinite Scroll Pattern**:
   - Use React Query `useInfiniteQuery` with `nextCursor`.
   - Infinite scroll button (`InfiniteLoadButton`) or scroll listener.

---

## 10. Language Rules

- All codebase symbols, function names, variables, and components must be named in English.
- Displayed text, notifications, titles, and documentation must be written in English.

---

## 11. Shared Component Guidelines

- Prefer reusing components in `src/components/common` and `src/components/shared`.
- Create new component definitions only if no suitable shared component exists.

---

## 12. Theme & Dark/Light Mode Conventions

1. **Centralized Subsystem**:
   - All theme configuration, tokens, component overrides, and providers reside inside `src/lib/theme/` (`types.ts`, `tokens.ts`, `components.ts`, `create-app-theme.ts`, `theme-provider.tsx`).
   - Do NOT create ad-hoc theme providers or inline mode state logic in individual components. Always use `useThemeMode()` hook.

2. **Persistence & Flash Prevention**:
   - The theme mode is persisted in `localStorage` under key `dev_edu_theme_mode` (`"light" | "dark"`).
   - Default theme is `"light"`.
   - An inline script `#theme-init-script` in `src/app/layout.tsx` executes before React hydration to inject `data-theme="dark"` attribute and `dark` CSS class on `<html>` to prevent FOUC (Flash of Unstyled Content).

3. **No Hardcoded Hex/RGBA Colors in Components**:
   - Do NOT hardcode static color values (`#ffffff`, `#0f172a`, `#1e293b`, `#f8fafc`, `rgba(0,0,0,...)`, `white`, `black`) in `sx` or inline styles.
   - Use MUI semantic tokens:
     - Backgrounds: `background.default`, `background.paper`, `action.hover`, `action.selected`.
     - Text: `text.primary`, `text.secondary`, `text.disabled`.
     - Borders: `divider`.
     - Statuses: `primary.main`, `error.main`, `success.main`, `warning.main`.

4. **Dynamic Theme Palette Colors**:
   - When referencing palette primary/secondary/error colors in dark mode, resolve colors dynamically:
     ```tsx
     color: (theme) => theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main
     ```
   - Use `alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.08)` for translucent background tints.

5. **Icon & SVG Color Inheritance**:
   - Icons inside buttons, tabs, or badges must inherit the parent text contrast:
     ```tsx
     "& svg, & .MuiSvgIcon-root": { color: "inherit", transition: "color 0.2s ease" }
     ```

6. **RSC Serialization Guard (`"use client"`)**:
   - Components rendered inside Next.js App Router Server Pages that contain inline theme callbacks (`sx={{ boxShadow: (theme) => ... }}`) or hooks MUST have `"use client";` at the very top line to prevent React Server Component serialization crashes.

---

## 13. TypeScript & Zero-Any Policy

1. **Strict Prohibition of `any`**:
   - The use of `any` (e.g., `: any`, `as any`, `<any>`) is strictly forbidden across the entire project, including production code, unit tests, integration tests, fixtures, factories, mocks, and test utilities.
   - Every function parameter, return type, state variable, component prop, and API response must have an explicit, type-safe definition.

2. **Alternatives to `any`**:
   - **Unknown Data / External Input**: Use `unknown` with runtime type narrowing / type guards:
     ```ts
     function parsePayload(input: unknown): UserResponse {
       if (typeof input === "object" && input !== null && "id" in input) {
         return input as UserResponse;
       }
       throw new Error("Invalid payload");
     }
     ```
   - **Generic Data Structures**: Use TypeScript Generics (`<T>`, `<TData, TError>`):
     ```ts
     interface ApiResponse<T> {
       data: T;
       status: number;
     }
     ```
   - **Dynamic Record Objects**: Use `Record<string, unknown>` instead of `Record<string, any>` or `any`.
   - **Event Handlers**: Use React event types (`React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.KeyboardEvent`).
   - **Error Handling**: Type catch blocks with `error: unknown` or `error: Error | ApiError`:
     ```ts
     try {
       await execute();
     } catch (err: unknown) {
       const message = err instanceof Error ? err.message : "Unknown error";
       toast.error(message);
     }
     ```

3. **API & Data Models**:
   - All backend DTOs and API responses must be declared inside `src/lib/type/`.
   - Never cast API results or component properties via `(obj as any).property`. Extend the interface in `src/lib/type/` if backend fields are updated.


---

## 14. Testing & Mock Data Type Safety

### 14.1. Strict Type Safety for Test Data

- All unit test mock data, fixtures, factories, and mocked API responses must conform to the actual TypeScript types used by the production code.
- When a component expects a strongly typed prop, test data **MUST** use that exact type.
- Do **NOT** weaken or bypass the production type just to make a test compile.
- The preferred approach is to fix the mock data so that it satisfies the expected type.

**Example**:

```tsx
interface Question {
  id: string;
  type: QuestionType;
  content: string;
  required: boolean;
}

// ✅ Correct: Mock data conforms strictly to the production interface
const mockQuestion: Question = {
  id: "question-1",
  type: "ESSAY",
  content: "Explain the concept.",
  required: true,
};

render(<QuestionCard question={mockQuestion} />);

// ❌ Prohibited: Using type-escape assertions
const mockQuestion = {
  id: "question-1",
  type: "ESSAY",
  content: "Explain the concept.",
} as never;
```

### 14.2. `as never` Is Strictly Forbidden for Mock Data

`as never` must **NOT** be used to bypass TypeScript errors in unit tests.

In particular, **NEVER** use `mockData as never` to pass incompatible mock data into:
- React components
- Component props
- Custom hooks
- React Query mocks
- API mocks
- Callbacks & event handlers
- Generic components
- Utility functions

If TypeScript reports that mock data is incompatible with the expected type, investigate and fix the mock data itself. `as never` is considered a type-safety violation unless `never` is genuinely part of the production type contract.

### 14.3. No Type-Escape Assertions in Tests

The following patterns are strictly prohibited for bypassing type errors in test code:
- `as any`
- `as never`
- `as unknown as SomeType`
- `@ts-ignore`
- `@ts-expect-error` (unless testing intentional negative compiler behavior)

These must **NOT** be used as shortcuts to make tests compile.

If an existing test contains one of these patterns:
1. Identify the actual type expected by the production code.
2. Trace the type to its canonical definition (`src/lib/type/`).
3. Fix the mock/fixture/factory to conform to that type.
4. Only modify production types if the production type itself is proven to be incorrect.

### 14.4. Explicitly Typed Mock Data

Prefer explicitly typed mocks when the data represents a domain or API model:

```ts
// ✅ Correct: Explicit type definition validates structure at compile-time
const mockQuiz: Quiz = {
  id: "quiz-1",
  title: "Operating Systems",
  questions: [],
};

// For arrays:
const mockQuizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "Operating Systems",
    questions: [],
  },
];

// ❌ Prohibited: Type assertion disguising missing or incompatible fields
const mockQuiz = {
  id: "quiz-1",
  title: "Operating Systems",
} as Quiz;
```

### 14.5. Mock Factories

When the same type of mock data is used across multiple tests, prefer typed factory functions.

```ts
// Factory Definition
export const createMockQuiz = (
  overrides: Partial<Quiz> = {},
): Quiz => ({
  id: "quiz-1",
  title: "Test Quiz",
  questions: [],
  ...overrides,
});

// Usage
const quiz = createMockQuiz({
  title: "Custom Quiz",
});
```

**Requirements**:
- Factory return types must use the real production type (`Quiz`, `UserResponse`, etc.).
- Do **NOT** return `any`, `unknown`, or `never`.
- Do **NOT** cast the result with `as never` or `as any`.
- Default values must satisfy the complete production type.

### 14.6. Reuse Existing Fixtures

Before creating new mock data, check whether existing fixtures or factories already exist:
- Shared fixtures (`src/__tests__/fixtures/...`)
- Mock factories (`createMockUser`, `createMockCourse`)
- Test utilities and API response fixtures

Prefer reusing or extending existing typed fixtures instead of creating duplicate mock objects. This prevents different tests from representing the same domain model inconsistently.

### 14.7. React Component Props

When testing a component with strongly typed props, the test must respect the component's declared prop contract.

```tsx
type UserCardProps = {
  user: User;
};

// ✅ Correct: Mock satisfies User interface
render(<UserCard user={mockUser} />);
```

- If `mockUser` does not satisfy `User`, fix `mockUser`.
- Do **NOT** change `type UserCardProps = { user: User };` to a weaker type (e.g. `user?: User` or `user: Partial<User>`) merely to make the test pass.

### 14.8. Generic Reusable Components

Reusable components that support multiple data models must preserve their generic types in tests.

```tsx
const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Test User",
  },
];

// ✅ Correct: Preserve generic parameter
render(
  <DataTable<User>
    data={mockUsers}
    getRowId={(user) => user.id}
  />,
);

// ❌ Prohibited: Bypassing generic constraints
render(<DataTable data={mockUsers as never} />);
render(<DataTable data={mockUsers as any} />);
```

If a reusable component genuinely supports multiple data types, use a generic component API rather than broad types or type assertions.

### 14.9. React Query Mock Data

Mocked React Query data must conform to the actual query response type.

**Trace the type flow**:
```text
API Response Type (src/lib/type/...)
      ↓
API Service (src/lib/api/...)
      ↓
React Query Hook (useQuery / useInfiniteQuery)
      ↓
Hook Return Type (data)
      ↓
Component Props
      ↓
Test Mock
```

**Example**:
```ts
// ✅ Correct: Full response contract respected
const mockQuizResponse: QuizResponse = {
  data: [
    {
      id: "quiz-1",
      title: "Test Quiz",
    },
  ],
  total: 1,
};

// ❌ Prohibited: Assertion bypasses type validation
const mockQuizResponse = {
  data: [],
  total: 1,
} as never;
```

### 14.10. API Mocking

Mocked API requests and responses must use the same types as the production API layer.

For every API mock, verify:
- Request parameters and query strings
- Request body
- Response data and envelopes (`ApiResponse<T>`)
- Nested objects and arrays
- Nullable and optional fields
- Enums and discriminated unions

Reuse types from `src/lib/type/` where applicable. Do not create weaker test-only versions of production API types simply to simplify mocks.

### 14.11. Partial Test Data

A test may intentionally need only a subset of a large domain object.
- Before using `Partial<T>`, determine whether the component under test actually accepts partial data.
- If the production component requires `user: User`, provide a valid `User` object.
- Do **NOT** convert the production prop to `user: Partial<User>` only because the test does not use every property.
- If repeated full objects make tests unnecessarily verbose, use a typed factory:

```ts
const createMockUser = (
  overrides: Partial<User> = {},
): User => ({
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "STUDENT",
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

### 14.12. Discriminated Unions

Mocks for discriminated unions must contain the correct properties for the selected discriminator.

```ts
type Question =
  | {
      type: "ESSAY";
      id: string;
      answer: string;
    }
  | {
      type: "SINGLE_CHOICE";
      id: string;
      options: Option[];
      answer: string;
    };

// ✅ Correct: Discriminator matches required fields
const mockQuestion: Question = {
  type: "ESSAY",
  id: "question-1",
  answer: "",
};

// ❌ Incorrect: Missing fields hidden with type-escape
const mockQuestion = {
  type: "ESSAY",
  id: "question-1",
} as never;
```

The discriminator and its associated properties must remain consistent.

### 14.13. Do Not Modify Production Types to Fix Tests

Test failures caused by invalid mock data must normally be fixed in the test. Do **NOT** make production types weaker just to satisfy existing mocks.

For example, if production defines:
```ts
interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}
```

And the test provides:
```ts
const mockQuiz = {
  id: "quiz-1",
  title: "Test Quiz",
};
```

The correct fix is:
```ts
const mockQuiz: Quiz = {
  id: "quiz-1",
  title: "Test Quiz",
  questions: [],
};
```

Do **NOT** change the production type to:
```ts
interface Quiz {
  id: string;
  title: string;
  questions?: Question[];
}
```
unless the actual application/API contract proves that `questions` is optional.

### 14.14. Type Definition Is the Source of Truth

When a mock fails TypeScript validation:
1. Inspect the component, function, or hook being tested.
2. Identify the exact expected type.
3. Trace the type to its canonical definition (`src/lib/type/`).
4. Inspect existing production usage.
5. Inspect existing fixtures and factories.
6. Update the mock to satisfy the real contract.

Do **NOT** infer the type from the test alone. Production type definitions and actual API/domain contracts are the source of truth.

### 14.15. Testing Type-Safety Verification

Before completing a testing-related change:
1. Run TypeScript type checking (`npm run type-check` or `npx tsc --noEmit`).
2. Run ESLint (`npm run lint`).
3. Run the affected unit tests (`npm test` or `npx vitest run ...`).
4. Run the full test suite when practical.

The test suite must pass without:
- `as never`
- `as any`
- Unsafe double assertions (`as unknown as T`)
- `@ts-ignore`
- Unnecessary `@ts-expect-error`

The objective is not merely to make tests compile, but to ensure that test data accurately represents the real application data contract.