# Quy Chuẩn Lập Trình & Pattern Thiết Kế (Coding Rules & Architecture Patterns)

Tài liệu này tổng hợp các quy tắc lập trình (coding conventions), mẫu thiết kế (design patterns) và chuẩn mực phát triển ứng dụng đang được áp dụng nhất quán trong dự án DevEdu Frontend. Developer khi phát triển tính năng mới **bắt buộc tuân thủ** các quy định này để bảo đảm tính đồng bộ của hệ thống.

---

## 1. Quy Tắc Đặt Tên (Naming Conventions)

### 1.1. Thư mục và File

- **React Component & Page files**: Dùng `kebab-case` cho tên file (`course-card.tsx`, `form-input.tsx`, `animated-tabs.tsx`).
- **Custom Hooks**: Đặt tiền tố `use-` và dùng `kebab-case` (`use-auth.ts`, `use-debounce.ts`, `use-api-with-toast.ts`).
- **API Client & Helper files**: Dùng `kebab-case` (`courses.ts`, `date-utils.ts`, `role-theme.ts`).
- **Types / Interfaces files**: Dùng `kebab-case` nằm trong `src/lib/type/` (`courses.ts`, `users.ts`, `assignments.ts`).

### 1.2. Biến, Hàm và Component

- **React Component Name**: Dùng **PascalCase** (`CourseFormDialog`, `DataTable`, `FormInput`).
- **Hàm & Biến (Functions & Variables)**: Dùng **camelCase** (`getCourseById`, `handleSave`, `isSearchingLecturers`).
- **Custom Hook Name**: Dùng **camelCase** bắt đầu bằng `use` (`useCourseByIdQuery`, `useToast`, `useDebounce`).
- **TypeScript Types & Interfaces**: Dùng **PascalCase** (`CourseRequest`, `CourseResponse`, `CustomPaging<T>`).
- **Enums**: Dùng **PascalCase** (`RoleEnum`, `ItemStatus`, `PaymentStatus`).

---

## 2. Quy Tắc Cấu Trúc Một Component (Component Layout Order)

Một file Component React phải được sắp xếp theo đúng thứ tự chuẩn sau:

1. **Directive (nếu có)**: `"use client";` ở dòng đầu tiên.
2. **Imports**:
   - Thư viện bên ngoài (`react`, `@mui/material`, `@tanstack/react-query`, `lucide-react`).
   - Component dùng chung & Helper (`@/components/common/...`, `@/lib/...`).
   - Types & Enums (`@/lib/type/...`).
3. **TypeScript Props Type**: Định nghĩa `type Props` hoặc `interface Props` ngay phía trên component.
4. **Component Definition**:

```tsx
export function CourseFormDialog({ open, onClose, onSave }: CourseFormDialogProps) {
  // 4.1. Custom Hooks / React Query Hooks
  const toast = useToast();
  const { data, isLoading } = useCourseByIdQuery(...);

  // 4.2. Local Component State
  const [form, setForm] = useState<CourseRequest>(initialValue);
  const [touched, setTouched] = useState(false);

  // 4.3. Derived State & Validation Logic (với useMemo)
  const errors = useMemo(() => ({
    title: form.title.trim().length < 3,
  }), [form]);
  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  // 4.4. Effects (useEffect)
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

## 3. Quy Tắc Xử Lý Form & Validate Dữ Liệu (Form Handling & Validation)

Project **không sử dụng** thư viện ngoài như Zod hay React Hook Form mà áp dụng mô hình **Controlled Component với Custom Validation**:

1. **State Quản Lý**: Quản lý bằng `useState` với kiểu dữ liệu TypeScript nguyên bản (`CourseRequest`, `CategoryRequest`).
2. **Validation Logic**:
   - Tính toán danh sách lỗi thông qua `useMemo` dựa trên state của form.
   - Quản lý biến trạng thái `touched` (true khi người dùng nhấn lưu hoặc tương tác) để tránh hiển thị lỗi ngay khi mở modal.
3. **Hiển thị Lỗi**: Truyền thuộc tính `error={touched && errors.field}` và `helperText="..."` trực tiếp vào các component wrapper như `FormInput`, `FilterSelect`, `FileUpload`.
4. **Vô hiệu hóa Nút Submit**: Nút submit của `FormDialog` luôn nhận prop `isSubmitDisabled={!isValid || saving}`.

---

## 4. Quy Tắc Xử Lý Loading, Error Và Empty State Trên UI

Mọi trang async hoặc component truy xuất dữ liệu **bắt buộc** phải xử lý đủ 4 trạng thái:

1. **Loading State (Đang tải)**:
   - Sử dụng Skeleton Component tương ứng (`SkeletonCard`, `CourseManageGridSkeleton`, hoặc `Skeleton` từ MUI). Không sử dụng icon xoay đơn điệu cho cả trang.
2. **Error State (Gặp lỗi)**:
   - Render component [error-state.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/components/common/error-state.tsx) hiển thị thông báo lỗi và cung cấp nút bấm "Retry" (gọi lại hàm `refetch` từ React Query).
3. **Empty State (Danh sách rỗng)**:
   - Render component [empty-state.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/components/common/empty-state.tsx) khi mảng trả về rỗng (`data.length === 0`).
4. **Success State (Thành công)**: Render dữ liệu chính thức vào giao diện.

---

## 5. Quy Tắc Gọi API & Xử Lý Phản Hồi (API Call & Response Rules)

1. **Không gọi API trực tiếp trong Component**:
   - Không viết trực tiếp `fetch()` hoặc `axios` trong component hay `useEffect`.
   - Tất cả API phải được khai báo trong `src/lib/api/` và xuất ra dưới dạng React Query Custom Hook.
2. **Quản lý Cache Invalidation**:
   - Tất cả Mutation Hooks (`useCreateCourseMutation`, `useUpdateCourseMutation`...) sau khi thực thi thành công (`onSuccess`) **phải** làm mới cache tương ứng:
     ```typescript
     queryClient.invalidateQueries({ queryKey: ["courses"] });
     ```
3. **Xử lý Thông báo Toast**:
   - Tích hợp hook `useApiWithToast()` để tự động bắt lỗi từ `ApiError` và hiển thị thông báo lỗi dạng Snackbar tới người dùng.

---

## 6. Quy Tắc Sử Dụng Material UI (MUI Usage & Styling Rules)

1. **Ưu tiên `sx` Prop**:
   - Không dùng inline style (`style={{ ... }}`) ngoại trừ các trường hợp đặc biệt.
   - Ưu tiên dùng thuộc tính `sx` của MUI kết hợp các token thiết kế từ Theme:
     ```tsx
     <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, color: "primary.main" }}>
     ```
2. **Sử dụng Bảng Màu Theme HSL / Alpha Utility**:
   - Kết hợp hàm `alpha(theme.palette.primary.main, 0.1)` từ `@mui/material` để tạo các hiệu ứng nền mờ, viền mờ mềm mại.
3. **Đáp ứng Đa Màn Hình (Responsive Breakpoints)**:
   - Định nghĩa responsive thông qua object breakpoint trong `sx`:
     ```tsx
     <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }}>
     ```
4. **Sử dụng Component Wrapper Chuẩn Hệ Thống**:
   - Sử dụng `FormInput`, `SearchInput`, `FilterSelect`, `FileUpload`, `RichTextEditor` thay vì trực tiếp `TextField` nguyên bản của MUI để đảm bảo giao diện đồng bộ.

---

## 7. Quy Tắc Quản Lý State (State Scope Rules)

- **Local State**: Chỉ dùng cho dữ liệu tạm thời của giao diện (trạng thái đóng/mở modal, nội dung ô search chưa debounce, tab đang chọn).
- **Server State**: Bắt buộc dùng `@tanstack/react-query` cho toàn bộ dữ liệu đến từ Backend.
- **Global UI State**: Chỉ dùng React Context API cho các tính năng ứng dụng toàn hệ thống như `ToastProvider`.
- **Auth State**: Đồng bộ token giữa Cookie HTTP-Only và `localStorage` thông qua `AuthSync`.

---

## 8. Quy Tắc Phân Quyền & Route Bảo Vệ (RBAC Rules)

- Kiểm soát phân quyền dựa trên `src/proxy.ts` (Next.js Edge Middleware).
- Tuyệt đối không xóa hoặc bỏ qua kiểm tra token trên các route bảo vệ (`/admin`, `/lecturer`, `/cart`, `/checkout`).
- Danh sách quyền (Roles): `ADMIN`, `LECTURER`, `STUDENT`.
- Trang mặc định theo quyền: `ADMIN` -> `/admin`, `LECTURER` -> `/lecturer`, `STUDENT` -> `/home`.

---

## 9. Các Pattern Chuẩn Cần Áp Dụng Khi Phát Triển Tính Năng Mới

1. **Pattern Trang Quản Lý (Admin / Lecturer Management Pattern)**:
   - **Header**: Sử dụng `ManageHeader` (gồm Tiêu đề, Mô tả, Nút hành động chính như "Add Course", "Create User").
   - **Toolbar**: Gồm `SearchInput` (hỗ trợ debounce search) + `FilterSelect` (Lọc theo danh mục/trạng thái).
   - **Body**: `DataTable` hoặc Grid danh sách card kết hợp Skeletons.
   - **Dialog Action**: Modal `FormDialog` cho các hành động Thêm/Sửa, và `ConfirmDialog` cho hành động Xóa.

2. **Pattern Tải Dữ Liệu Vô Hạn (Infinite Scroll Pattern)**:
   - Sử dụng `useInfiniteQuery` của React Query kết hợp `nextCursor`.
   - Trang hiển thị nút "Load More" (`InfiniteLoadButton`) hoặc tự động kích hoạt khi cuộn.

## 10. Quy tắc sử dụng ngôn ngữ

- Không được sử dụng tiếng Việt trong code, các biến, hàm, Component cần có ý nghĩa và sử dụng tiếng Anh.
- Các thông báo, tiêu đề, text hiển thị đều sử dụng tiếng Anh.

## 11. Quy tắc sử dụng các component chung

- Ưu tiên sử dụng các component trong folder `src/components/common` và `src/components/shared`.
- Chỉ tạo component mới nếu chưa tìm thấy component phù hợp trong các folder trên.
