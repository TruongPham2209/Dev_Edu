# Danh Sách Công Nghệ & Thu Thư Viện (Tech Stack & Dependencies)

Tài liệu này chi tiết hóa toàn bộ các công nghệ, thư viện (dependencies) và công cụ phát triển được sử dụng trong dự án DevEdu Frontend dựa trên phân tích thực tế file `package.json` và mã nguồn trong `src/`.

---

## 1. Nền Tảng Khung & Ngôn Ngữ (Core Framework & Language)

| Công nghệ | Phiên bản | Mục đích sử dụng | Nơi cấu hình / Khởi tạo |
| :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.2` | React Framework hỗ trợ App Router, Server Components, SSR, Server Actions và Route Handlers. | `next.config.ts`, `src/app/` |
| **React** | `19.2.4` | Thư viện xây dựng giao diện người dùng thời gian thực (UI Library). | `package.json`, các file `.tsx` |
| **React DOM** | `19.2.4` | Thư viện Render cây DOM cho React trên trình duyệt. | `src/app/layout.tsx` |
| **TypeScript** | `^5.0.0` | Ngôn ngữ lập trình kiểm soát kiểu dữ liệu tĩnh (Static Typing). | `tsconfig.json` |

---

## 2. Giao Diện & Thiết Kế (UI Libraries & Styling Engine)

### 2.1. Material UI (MUI v9) - Thư viện UI Chính
* **Packages**: `@mui/material` (`^9.0.0`), `@mui/icons-material` (`^9.0.0`), `@mui/material-nextjs` (`^9.0.0`).
* **Mục đích**: Cung cấp toàn bộ các component giao diện chuẩn hệ thống (Button, Dialog, Paper, Typography, Box, Stack, Grid, Snackbar, Alert, Table, Skeleton...).
* **Cấu hình Theme (`ThemeProvider`)**:
  * Đặt tại [app-providers.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/components/providers/app-providers.tsx).
  * Tùy chỉnh Palette màu: `primary.main` (`#2563eb`), `secondary.main` (`#7c3aed`), `background.default` (`#f8fafc`).
  * Tùy chỉnh Typography: Sử dụng font chữ biến `--font-geist-sans`.
  * Style Overrides: Bo góc button (`borderRadius: 14`), bo góc paper (`borderRadius: 16`), tắt chữ hoa mặc định (`textTransform: "none"`).
* **AppRouterCacheProvider**: Khởi tạo tại [layout.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/app/layout.tsx) bằng gói `@mui/material-nextjs/v16-appRouter` để tích hợp mượt mà với SSR của Next.js App Router.

### 2.2. Ant Design (Antd v6) & Emotion
* **Packages**: `antd` (`^6.3.7`), `@ant-design/icons` (`^6.2.2`), `@emotion/react` (`^11.14.0`), `@emotion/styled` (`^11.14.1`), `@emotion/cache` (`^11.14.0`).
* **Mục đích**: Phối hợp hỗ trợ một số component giao diện đặc thù và làm style engine cho MUI.
* **Cấu hình**: Đính kèm bọc `ConfigProvider` trong `app-providers.tsx` để đồng bộ token bảng màu (`colorPrimary: "#2563eb"`) với MUI.

### 2.3. Utility CSS & Icons
* **Tailwind PostCSS v4**: `@tailwindcss/postcss` (`^4`), `tailwindcss` (`^4`). Khai báo style cơ bản tại `src/app/globals.css`.
* **Lucide React**: `lucide-react` (`^0.540.0`). Thư viện icon chính được dùng rộng rãi trên các thanh điều hướng, nút bấm, và thông báo.

---

## 3. Quản Lý Dữ Liệu & Gọi API (Data Fetching & State Management)

### 3.1. TanStack React Query (v5)
* **Package**: `@tanstack/react-query` (`^5.100.14`).
* **Mục đích**: Quản lý Server State, tự động caching dữ liệu, tự động refetching khi dữ liệu thay đổi, hỗ trợ tải danh sách phân trang vô hạn (`useInfiniteQuery`).
* **Khởi tạo Provider**: Bọc `QueryClientProvider` tại `src/components/providers/app-providers.tsx`.
* **Mô hình tích hợp**: Mỗi domain API (`courses.ts`, `users.ts`, `forum.ts`, `enrollments.ts`, `assignments.ts`, `lectures.ts`, `metrics.ts`) cung cấp các custom hooks bọc `useQuery`, `useMutation`, và `useInfiniteQuery`. Khi mutation thành công, tự động gọi `queryClient.invalidateQueries({ queryKey: [...] })`.

### 3.2. Native Fetch Client & Custom Wrapper
* **File khởi tạo**: [client.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/api/client.ts).
* **Mục đích**: Bọc hàm `fetch` mặc định, tự động trích xuất JWT Token từ `localStorage` hoặc Cookie `access_token`, kiểm tra cấu trúc Envelope `ApiResponse<T>` và ném ra `ApiError`.

### 3.3. Notification State (Toast Context)
* **File khởi tạo**: [toast-context.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/toast-context.tsx).
* **Mục đích**: Provider dạng React Context quản lý danh sách các thông báo nổi (Snackbar / Alert) góc trên màn hình.
* **Hook bọc**: [use-api-with-toast.ts](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/lib/use-api-with-toast.ts) giúp tự động hiển thị Toast thông báo thành công hoặc lỗi từ `ApiError`.

---

## 4. Soạn Thảo Văn Bản & Xử Lý File (Rich Text & File Utilities)

### 4.1. Trình soạn thảo TipTap
* **Packages**: `@tiptap/react` (`^3.23.4`), `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/pm`.
* **Mục đích**: Cung cấp giao diện soạn thảo văn bản giàu tính năng (Rich Text) cho mô tả khóa học, nội dung bài đăng diễn đàn và nội dung bài học.
* **Cấu hình**: Triển khai tại component [rich-text-editor.tsx](file:///e:/WorkSpace/Projects/Dev_Edu/front-end/src/components/common/form/rich-text-editor.tsx).

### 4.2. Xử lý File Excel
* **Package**: `xlsx` (`^0.18.5`).
* **Mục đích**: Đọc và xuất file Excel đối với các tính năng quản lý bài nộp hoặc tạo danh sách người dùng hàng loạt.

---

## 5. Thử Nghiệm & Kiểm Thử (Testing Infrastructure)

| Thư viện | Phiên bản | Mục đích sử dụng | Nơi cấu hình |
| :--- | :--- | :--- | :--- |
| **Vitest** | `^4.1.10` | Test Runner tốc độ cao thay thế cho Jest. | `vitest.config.ts` |
| **Testing Library React** | `^16.3.2` | Render và tương tác với React Component trong môi trường test. | `src/setupTests.ts` |
| **Testing Library Jest DOM** | `^7.0.0` | Mở rộng các matcher kiểm tra DOM element (`toBeInTheDocument`, `toHaveValue`...). | `src/setupTests.ts` |
| **Testing Library User Event** | `^14.6.1` | Giả lập các sự kiện người dùng (click, type, hover...). | Các file `*.test.tsx` |
| **JSDOM** | `^29.1.1` | Giả lập môi trường DOM của trình duyệt trong Node.js khi chạy test. | `vitest.config.ts` |

---

## 6. Công Cụ Đóng Gói & Kiểm Lỗi (Build Tools & Linters)

* **ESLint 9 & eslint-config-next**: Kiểm tra quy chuẩn cú pháp mã nguồn JavaScript/TypeScript.
* **Babel React Compiler Plugin**: `babel-plugin-react-compiler` (`1.0.0`). Tối ưu hóa hiệu năng render React tự động.
* **Google Fonts (`Geist`, `Geist_Mono`)**: Nhúng font chữ tối ưu hóa trực tiếp tại `src/app/layout.tsx`.
