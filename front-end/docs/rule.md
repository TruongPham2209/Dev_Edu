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
