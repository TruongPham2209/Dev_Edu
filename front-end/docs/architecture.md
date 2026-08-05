# Kiến Trúc & Cấu Trúc Mã Nguồn (Architecture & Codebase Structure)

Tài liệu này mô tả kiến trúc tổng thể, cơ chế điều hướng, phân chia thành phần và quy cách tổ chức mã nguồn của hệ thống Frontend DevEdu (Next.js 16 + Material UI).

---

## 1. Tổng Quan Kiến Trúc

* **Framework Routing**: **Next.js App Router** (Xác định từ cấu trúc thư mục `src/app`).
* **Mô hình kiến trúc**: Phân theo **Role & Feature-based Boundary** kết hợp kiến trúc phân lớp (**Layered Architecture**):
  * **Presentation Layer (UI & Pages)**: Nằm tại `src/app/` và `src/components/`.
  * **Business & State Layer (Hooks & Services)**: Nằm tại `src/hooks/` và `src/lib/api/`.
  * **Domain & Type Layer**: Nằm tại `src/lib/type/`.
  * **Authentication & Guard Layer**: Nằm tại `src/proxy.ts` và `src/lib/auth/`.

---

## 2. Thư Mục & Vai Trò (Directory Layout)

```
front-end/
├── docs/                        # Tài liệu hướng dẫn hệ thống
├── public/                      # Asset tĩnh (logo, favicon, images...)
├── src/
│   ├── app/                     # Next.js App Router (Pages, Route Groups, API routes)
│   │   ├── (admin)/             # Route group dành cho Quản trị viên (Admin)
│   │   ├── (lecturer)/          # Route group dành cho Giảng viên (Lecturer)
│   │   ├── (student)/           # Route group dành cho Học viên (Student)
│   │   ├── api/                 # Next.js API Routes (Route handlers như token proxy)
│   │   ├── login/               # Trang Đăng nhập (Guest-only) & Server Actions
│   │   ├── logout/              # Route đăng xuất
│   │   ├── register/            # Trang Đăng ký (Guest-only)
│   │   ├── globals.css          # CSS toàn cục
│   │   └── layout.tsx           # Root Layout (Inject Providers, Fonts, AuthSync)
│   ├── components/              # UI Components tái sử dụng
│   │   ├── auth/                # Component xử lý đồng bộ phiên đăng nhập (AuthSync)
│   │   ├── card/                # Các loại Card UI (CourseCard, PostCard, SkeletonCard...)
│   │   ├── common/              # Common UI (ButtonAction, DataTable, CommentItem, Skeletons, Form wrappers)
│   │   │   └── form/            # Form controls (FormInput, FilterSelect, RichTextEditor, FileUpload, FormDialog)
│   │   ├── dialog/              # Các Modal/Dialog nghiệp vụ (CourseForm, CategoryForm, LectureForm...)
│   │   ├── layout/              # Header, Footer, Navigation Bar, UserMenu cho từng role
│   │   ├── providers/           # AppProviders (React Query, MUI ThemeProvider, Antd ConfigProvider, ToastProvider)
│   │   └── skeleton/            # Skeleton loaders dùng chung
│   ├── hooks/                   # Custom React Hooks mở rộng (useDebounce, ...)
│   ├── lib/                     # Core Logic, API Client, Authentication & Types
│   │   ├── api/                 # Hàm gọi API backend & React Query Hooks (courses.ts, users.ts, forum.ts...)
│   │   ├── auth/                # Logic xác thực (JWT parser, RBAC routes, Cookie helper, Login logic)
│   │   ├── type/                # Định nghĩa TypeScript interfaces & Enums (api.ts, courses.ts, users.ts...)
│   │   ├── util/                # Hàm tiện ích (date-utils.ts, file-utils.tsx, status-utils.ts)
│   │   ├── auth-storage.ts      # Quản lý auth state tại localStorage
│   │   ├── navigation.ts        # Helper điều hướng
│   │   ├── role-theme.ts        # Cấu hình màu sắc/theme theo Role
│   │   ├── roles.tsx            # Helper kiểm tra role
│   │   ├── toast-context.tsx    # Context API quản lý thông báo Toast
│   │   └── use-api-with-toast.ts# Hook bọc gọi API kèm Toast tự động
│   ├── __tests__/               # Integration / UI Unit tests
│   ├── proxy.ts                 # Middleware / Proxy bảo vệ Route (Next.js 16 Edge Middleware)
│   └── setupTests.ts            # Cấu hình Vitest & Testing Library
├── next.config.ts               # Cấu hình Next.js
├── package.json                 # Khai báo dependency & scripts
├── tsconfig.json                # Cấu hình TypeScript compiler
└── vitest.config.ts             # Cấu hình chạy Unit Test
```

---

## 3. Ý Nghĩa Và Vai Trò Của Các Component Chính

1. **`src/app/(admin)`, `(lecturer)`, `(student)` (Route Groups)**:
   * Route Groups giúp nhóm các trang theo vai trò người dùng mà không làm thay đổi đường dẫn URL công khai.
   * Mỗi Route Group có `layout.tsx` riêng để render Bố cục giao diện (Header, Sidebar, Navigation) đặc thù cho vai trò đó.

2. **`src/components/common/form/` (Form Control Wrappers)**:
   * `FormInput`: Bọc thẻ input/textarea chuẩn HTML bằng MUI Stack & Typography, xử lý hiệu ứng focus, icon, helper text và đếm số ký tự.
   * `FilterSelect`: Dropdown chọn danh mục/trạng thái chuẩn MUI.
   * `RichTextEditor`: Trình soạn thảo văn bản giàu tính năng dựa trên `@tiptap/react` tích hợp thanh công cụ định dạng HTML.
   * `FileUpload`: Khung tải file kéo-thả hỗ trợ xem trước ảnh (image preview) và kiểm tra dung lượng/định dạng.
   * `FormDialog`: Khung Modal Dialog dùng chung cho tất cả các biểu mẫu tạo mới / chỉnh sửa.

3. **`src/components/common/data-table.tsx`**:
   * Bảng dữ liệu dùng chung (Data Table) hỗ trợ phân trang, hành động dòng (actions), trạng thái rỗng và hiển thị chỉ báo tải.

4. **`src/lib/api/` (API Layer & Server State Hooks)**:
   * Tập hợp các hàm gọi REST API nguyên bản (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) và các custom hooks React Query (`useQuery`, `useInfiniteQuery`, `useMutation`).

5. **`src/proxy.ts` (Next.js 16 Proxy / Middleware)**:
   * Kiểm tra mã JWT token từ cookie `access_token` trên mỗi request.
   * Áp dụng quy tắc RBAC (Phân quyền theo vai trò): Chuyển hướng người dùng chưa đăng nhập về `/login`, hoặc người dùng truy cập sai vai trò về trang mặc định tương ứng với vai trò của họ (`/admin`, `/lecturer`, `/home`).

---

## 4. Cơ Chế Điều Hướng (Routing & RBAC Protection)

### 4.1. Phân loại Route

* **Public Routes**: Trang công khai ai cũng truy cập được (`/home`, `/courses`, `/courses/[id]`, `/forum`, `/posts/[id]`).
* **Guest-only Routes**: Trang chỉ dành cho người chưa đăng nhập (`/login`, `/register`). Nếu người dùng đã đăng nhập truy cập vào đây, `proxy.ts` sẽ tự động chuyển hướng họ tới trang tương ứng với vai trò của họ.
* **Protected Routes**:
  * Trang Admin: `/admin/*` (yêu cầu vai trò `ADMIN`).
  * Trang Giảng viên: `/lecturer/*` (yêu cầu vai trò `LECTURER`).
  * Trang Giỏ hàng / Đặt hàng: `/cart`, `/checkout` (yêu cầu vai trò `STUDENT`).
  * Trang Hồ sơ: `/profile` (dành cho bất kỳ người dùng đã xác thực).

### 4.2. Cấu trúc Routing Linh Hoạt
* **Dynamic Route**: `src/app/(student)/courses/[id]/page.tsx`, `src/app/(admin)/admin/courses/[id]/page.tsx`.
* **Nested Layout**: Root Layout (`app/layout.tsx`) bọc AppProviders -> Group Layout (`(admin)/admin/layout.tsx`) bọc Header/Sidebar Admin -> Page Component.

---

## 5. Phân Chia Server Component vs Client Component

Hệ thống tuân thủ chặt chẽ nguyên tắc của Next.js App Router:

* **Server Components (Default)**:
  * Được dùng tại các trang chủ, trang chi tiết khóa học, trang đăng nhập/đăng ký server action (`src/app/layout.tsx`, `src/app/(student)/home/page.tsx`, `src/app/login/page.tsx`).
  * Nhiệm vụ: Đọc Cookie xác thực, lấy dữ liệu ban đầu phía server, tối ưu SEO và truyền dữ liệu ban đầu cho Client Components.
* **Client Components (`"use client"`)**:
  * Được dùng tại toàn bộ các component tương tác (`src/components/`), các modal form (`FormDialog`), bộ lọc, thanh tìm kiếm, và các trang quản lý cần gọi API qua React Query.
  * Nhiệm vụ: Quản lý local state, lắng nghe sự kiện người dùng (click, submit, change), và gọi API thời gian thực.

---

## 6. Cơ Chế Quản Lý State (State Management Architecture)

1. **Server State (Dữ liệu từ API Backend)**:
   * Được quản lý tập trung bằng **TanStack React Query (v5)**.
   * Tự động cache dữ liệu, hỗ trợ phân trang vô hạn (Infinite Scroll via `useInfiniteQuery`), và tự động làm mới dữ liệu (`queryClient.invalidateQueries`) sau khi thực hiện Mutation thành công (Thêm/Sửa/Xóa).

2. **Local Component State**:
   * Quản lý bằng `useState`, `useMemo`, `useEffect` nguyên bản của React trong các Dialog Form và bộ lọc UI.

3. **Global UI State (Toast / Notifications)**:
   * Quản lý bằng React Context API (`ToastContext` tại `src/lib/toast-context.tsx`).
   * Cung cấp các hàm `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()` hiển thị MUI Snackbar góc trên bên phải màn hình.

4. **Auth State & Synchronization**:
   * Token lưu song song tại **Cookie HTTP-Only** (dành cho Server Side & `proxy.ts`) và **`localStorage`** (dành cho Client Side API client).
   * Component `AuthSync` và đoạn mã script `auth-init-script` tại `layout.tsx` chịu trách nhiệm đồng bộ trạng thái đăng nhập giữa Server và Client khi tải trang.
