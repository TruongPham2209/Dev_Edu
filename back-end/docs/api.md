# API Reference — Dev-Edu Backend

> Tài liệu mô tả toàn bộ REST API đã được triển khai trong hệ thống, được sinh tự động từ codebase thực tế.

---

## Mục lục

- [Thông tin chung](#thông-tin-chung)
- [1. User Module](#1-user-module)
  - [1.1 Đăng ký tài khoản](#11-đăng-ký-tài-khoản)
  - [1.2 Tạo nhiều user (batch)](#12-tạo-nhiều-user-batch)
  - [1.3 Lấy danh sách user](#13-lấy-danh-sách-user)
  - [1.4 Đổi mật khẩu](#14-đổi-mật-khẩu)
  - [1.5 Cập nhật avatar](#15-cập-nhật-avatar)
  - [1.6 Đặt username cho Google Login](#16-đặt-username-cho-google-login)
  - [1.7 Lấy thông tin user hiện tại](#17-lấy-thông-tin-user-hiện-tại)
- [2. Course Module](#2-course-module)
  - [2.1 Lấy tất cả danh mục](#21-lấy-tất-cả-danh-mục)
  - [2.2 Tạo danh mục](#22-tạo-danh-mục)
  - [2.3 Cập nhật danh mục](#23-cập-nhật-danh-mục)
  - [2.4 Xóa danh mục](#24-xóa-danh-mục)
  - [2.5 Lấy danh sách khóa học](#25-lấy-danh-sách-khóa-học)
  - [2.6 Lấy khóa học nổi bật](#26-lấy-khóa-học-nổi-bật)
  - [2.7 Lấy chi tiết khóa học](#27-lấy-chi-tiết-khóa-học)
  - [2.8 Tạo khóa học](#28-tạo-khóa-học)
  - [2.9 Cập nhật khóa học](#29-cập-nhật-khóa-học)
  - [2.10 Xóa khóa học](#210-xóa-khóa-học)
  - [2.11 Lấy danh sách giảm giá](#211-lấy-danh-sách-giảm-giá)
  - [2.12 Tạo giảm giá](#212-tạo-giảm-giá)
  - [2.13 Xóa giảm giá](#213-xóa-giảm-giá)
  - [2.14 Lấy đánh giá khóa học](#214-lấy-đánh-giá-khóa-học)
  - [2.15 Lấy đánh giá của tôi](#215-lấy-đánh-giá-của-tôi)
  - [2.16 Tạo đánh giá](#216-tạo-đánh-giá)
  - [2.17 Xóa đánh giá](#217-xóa-đánh-giá)
- [3. Enrollment Module](#3-enrollment-module)
  - [3.1 Thêm khóa học vào giỏ hàng](#31-thêm-khóa-học-vào-giỏ-hàng)
  - [3.2 Xóa khóa học khỏi giỏ hàng](#32-xóa-khóa-học-khỏi-giỏ-hàng)
  - [3.3 Lấy danh sách giỏ hàng](#33-lấy-danh-sách-giỏ-hàng)
  - [3.4 Lấy khóa học đã ghi danh](#34-lấy-khóa-học-đã-ghi-danh)
  - [3.5 Lấy khóa học được phân công (Lecturer)](#35-lấy-khóa-học-được-phân-công-lecturer)
  - [3.6 Lấy danh sách học viên đã ghi danh](#36-lấy-danh-sách-học-viên-đã-ghi-danh)
  - [3.7 Checkout đơn hàng](#37-checkout-đơn-hàng)
  - [3.8 Lấy chi tiết đơn hàng](#38-lấy-chi-tiết-đơn-hàng)
  - [3.9 Lấy lịch sử đơn hàng](#39-lấy-lịch-sử-đơn-hàng)
  - [3.10 Hủy đơn hàng](#310-hủy-đơn-hàng)
  - [3.11 Thanh toán (Purchase)](#311-thanh-toán-purchase)
  - [3.12 VnPay Return Callback](#312-vnpay-return-callback)
  - [3.13 Hủy thanh toán](#313-hủy-thanh-toán)
- [4. Lecture Module](#4-lecture-module)
- [5. Assignment Module](#5-assignment-module)
- [6. File Module](#6-file-module)
- [7. Forum Module](#7-forum-module)
- [8. Metric Module](#8-metric-module)
- [10. Chat Module](#10-chat-module)
  - [10.1 Gửi tin nhắn tư vấn khoá học](#101-gửi-tin-nhắn-tư-vấn-khoá-học)
  - [10.2 Lấy danh sách hội thoại cũ](#102-lấy-danh-sách-hội-thoại-cũ)
  - [10.3 Lấy chi tiết tin nhắn trong hội thoại](#103-lấy-chi-tiết-tin-nhắn-trong-hội-thoại)
- [11. Quiz Module](#11-quiz-module)
  - [11.1 Quản lý bài kiểm tra trắc nghiệm](#111-quản-lý-bài-kiểm-tra-trắc-nghiệm)
  - [11.2 Quản lý câu hỏi & phương án](#112-quản-lý-câu-hỏi--phương-án)
  - [11.3 Giao bài tập Quiz](#113-giao-bài-tập-quiz)
  - [11.4 Thực hiện làm bài Quiz](#114-thực-hiện-làm-bài-quiz)
  - [11.5 Chấm điểm tự luận Quiz](#115-chấm-điểm-tự-luận-quiz)
- [12. Notification Module](#12-notification-module)
  - [12.1 Quản lý thông báo cá nhân](#121-quản-lý-thông-báo-cá-nhân)
  - [12.2 Quản lý thông báo nhóm](#122-quản-lý-thông-báo-nhóm)
  - [12.3 Đăng ký FCM Device Token](#123-đăng-ký-fcm-device-token)

---

## Thông tin chung

### Base URL

```
http://localhost:9000
```

### Response Format (tất cả API)

Mọi API đều trả về cùng format `ApiResponse`:

**Thành công (HTTP 200):**

```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": { ... },
  "timestamp": 1721234567890
}
```

**Lỗi (HTTP 200 — error status nằm trong body):**

```json
{
  "success": false,
  "status": "BAD_REQUEST",
  "message": "Mô tả lỗi",
  "data": null,
  "timestamp": 1721234567890
}
```

> **Lưu ý quan trọng**: Tất cả response đều trả HTTP status 200, status code thực tế nằm trong field `status` của `ApiResponse`.

### Xác thực (Authentication)

- Sử dụng **OAuth2 Bearer Token (JWT)** trong header `Authorization`.
- Header: `Authorization: Bearer <access_token>`
- Token được lấy thông qua OAuth2 token endpoint với custom password grant type.

### Các status lỗi có thể xảy ra (chung cho tất cả API)

| Status trong `ApiResponse.status` | Ý nghĩa |
|---|---|
| `UNAUTHORIZED` (401) | Chưa đăng nhập hoặc token hết hạn |
| `FORBIDDEN` (403) | Không có quyền truy cập |
| `BAD_REQUEST` (400) | Dữ liệu đầu vào không hợp lệ |
| `CONFLICT` (409) | Vi phạm ràng buộc dữ liệu (unique, foreign key) |
| `METHOD_NOT_ALLOWED` (405) | HTTP method không được hỗ trợ |
| `REQUEST_TIMEOUT` (408) | Request hết thời gian |
| `INTERNAL_SERVER_ERROR` (500) | Lỗi server |

### Role hệ thống

| Role | Mô tả |
|---|---|
| `ADMIN` | Quản trị viên — toàn quyền |
| `LECTURER` | Giảng viên — quản lý bài giảng, bài tập |
| `STUDENT` | Học viên — học, nộp bài, thanh toán |

---

## 1. User Module

### 1.1 Đăng ký tài khoản

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/users/register` |
| **Permission** | `permitAll()` — Không cần đăng nhập |
| **Mô tả** | Đăng ký tài khoản mới với role STUDENT |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `username` | `String` | ✅ | Chỉ chứa `[a-zA-Z0-9_]` |
| `email` | `String` | ✅ | Phải là email hợp lệ |
| `password` | `String` | ✅ | Tối thiểu 8 ký tự, gồm uppercase, lowercase, số, ký tự đặc biệt `@$!%*?&` |
| `fullName` | `String` | ✅ | Không được trống |

> **Lưu ý**: Field `role` trong DTO bị override thành `STUDENT` ở controller.

**Response thành công:** `"Register successful. Please login to continue."`

---

### 1.2 Tạo nhiều user (batch)

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/users/batch-users` |
| **Permission** | `ADMIN` |
| **Mô tả** | Tạo nhiều user cùng lúc |

**Request Body:** Mảng `RegisterUser[]` (cùng format như đăng ký, nhưng có thể chỉ định `role`).

**Response thành công:** `"Create users successful."`

---

### 1.3 Lấy danh sách user

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/users` |
| **Permission** | `ADMIN` |
| **Mô tả** | Tìm kiếm/lọc danh sách user có phân trang |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `page` | `int` | ✅ | Số trang (0-based) |
| `role` | `RoleEnum` | ✅ | Lọc theo role: `ADMIN`, `LECTURER`, `STUDENT` |
| `keyword` | `String` | ✅ | Từ khóa tìm kiếm |

**Response thành công:** Object `CustomPaging` chứa danh sách user. Page size mặc định: 15.

---

### 1.4 Đổi mật khẩu

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/users/change-password` |
| **Permission** | Authenticated (bất kỳ role nào) |
| **Mô tả** | Đổi mật khẩu cho user hiện tại |

**Request Body:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `oldPassword` | `String` | ✅ | Mật khẩu cũ |
| `newPassword` | `String` | ✅ | Mật khẩu mới |

**Response thành công:** `"Change password successful."`

---

### 1.5 Cập nhật avatar

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/users/avatar` |
| **Permission** | Authenticated |
| **Mô tả** | Cập nhật avatar cho user hiện tại |

**Request Body:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `avatarObjectKey` | `String` | ✅ | Object key của file avatar đã upload |

**Response thành công:** URL mới của avatar (String).

---

### 1.6 Đặt username cho Google Login

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/users/username` |
| **Permission** | Authenticated |
| **Mô tả** | Đặt username sau khi đăng nhập bằng Google |

**Request Body:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `email` | `String` | ✅ | Email từ tài khoản Google |
| `username` | `String` | ✅ | Username mới |

**Response thành công:** `"Username đã được cập nhật thành công."`

---

### 1.7 Lấy thông tin user hiện tại

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/me` |
| **Permission** | Authenticated |
| **Mô tả** | Lấy thông tin profile của user đang đăng nhập |

**Response thành công:**

```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "avatarUrl": "string | null",
  "role": "ADMIN | LECTURER | STUDENT"
}
```

---

## 2. Course Module

### 2.1 Lấy tất cả danh mục

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/categories` |
| **Permission** | `permitAll()` (GET) |
| **Mô tả** | Lấy danh sách tất cả danh mục. Non-ADMIN chỉ thấy danh mục `ACTIVE`. |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `status` | `ItemStatus` | ❌ | `ACTIVE`, `DELETED`, `ALL`. Non-ADMIN luôn bị override thành `ACTIVE` |

---

### 2.2 Tạo danh mục

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/categories` |
| **Permission** | `ADMIN` |
| **Mô tả** | Tạo danh mục mới |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | `UUID` | ❌ | **Phải null** khi tạo (validation group `CreateValidation`) |
| `name` | `String` | ✅ | Không được trống |
| `description` | `String` | ✅ | Không được trống |
| `thumbnailObjectKey` | `String` | ✅ | Không được trống |

---

### 2.3 Cập nhật danh mục

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/categories` |
| **Permission** | `ADMIN` |
| **Mô tả** | Cập nhật danh mục |

**Request Body:** Cùng format `CategoryRequest` nhưng `id` **bắt buộc** (validation group `UpdateValidation`).

---

### 2.4 Xóa danh mục

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/categories/{categoryId}` |
| **Permission** | `ADMIN` |

**Path Variable:** `categoryId` — `UUID`

---

### 2.5 Lấy danh sách khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/courses` |
| **Permission** | `permitAll()` |
| **Mô tả** | Lấy danh sách khóa học có phân trang dạng cursor. Non-ADMIN chỉ thấy `ACTIVE`. |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `sortBy` | `String` | ❌ | Trường sắp xếp |
| `nextCursor` | `String` | ❌ | Cursor cho trang tiếp theo (Base64 encoded) |
| `categoryId` | `UUID` | ❌ | Lọc theo danh mục |
| `keyword` | `String` | ❌ | Từ khóa tìm kiếm |
| `page` | `int` | ❌ | Trang (mặc định 0) |
| `status` | `ItemStatus` | ❌ | Non-ADMIN bị override thành `ACTIVE` |

**Response:** `CustomPaging` chứa danh sách khóa học. ADMIN: 10 items/page, others: 15 items/page.

---

### 2.6 Lấy khóa học nổi bật

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/courses/highlighted` |
| **Permission** | `permitAll()` |
| **Mô tả** | Lấy danh sách khóa học nổi bật (có thể được cache trong Redis) |

---

### 2.7 Lấy chi tiết khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/courses/{courseId}/` |
| **Permission** | `permitAll()` |

**Path Variable:** `courseId` — `UUID`

---

### 2.8 Tạo khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/courses` |
| **Permission** | `ADMIN` |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | `UUID` | ❌ | **Phải null** khi tạo |
| `categoryId` | `UUID` | ✅ | ID danh mục |
| `title` | `String` | ✅ | Tối đa 255 ký tự |
| `description` | `String` | ✅ | Không được trống |
| `price` | `BigDecimal` | ❌ | ≥ 0.0 |
| `thumbnailObjectKey` | `String` | ✅ | Object key thumbnail |
| `lecturerUsernames` | `List<String>` | ✅ | Ít nhất 1 lecturer, mỗi phần tử không trống |

---

### 2.9 Cập nhật khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/courses` |
| **Permission** | `ADMIN` |

**Request Body:** Cùng format `CourseRequest`, `id` **bắt buộc**.

---

### 2.10 Xóa khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/courses` |
| **Permission** | `ADMIN` |

**Query Parameter:** `courseId` — `UUID`

---

### 2.11 Lấy danh sách giảm giá

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/course-discounts` |
| **Permission** | `ADMIN` |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `nextCursor` | `String` | ❌ | Cursor phân trang |
| `courseId` | `UUID` | ❌ | Nếu có, lọc discount theo khóa học |

---

### 2.12 Tạo giảm giá

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/course-discounts` |
| **Permission** | `ADMIN` |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `courseId` | `UUID` | ❌ | Null = áp dụng cho tất cả khóa học |
| `description` | `String` | ✅ | Mô tả discount |
| `discountPercentage` | `BigDecimal` | ✅ | 0.01 – 100.00 |
| `validFrom` | `LocalDate` | ✅ | Không được trong quá khứ (`@FutureOrPresent`) |
| `validTo` | `LocalDate` | ✅ | Không được trong quá khứ (`@FutureOrPresent`) |

---

### 2.13 Xóa giảm giá

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/course-discounts` |
| **Permission** | `ADMIN` |

**Query Parameter:** `discountId` — `UUID`

---

### 2.14 Lấy đánh giá khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/courses/reviews` |
| **Permission** | `permitAll()` (GET) |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `courseId` | `UUID` | ✅ | ID khóa học |
| `nextCursor` | `String` | ❌ | Cursor phân trang |

---

### 2.15 Lấy đánh giá của tôi

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/courses/reviews/me` |
| **Permission** | `STUDENT` |

**Query Parameter:** `courseId` — `UUID`

---

### 2.16 Tạo đánh giá

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/courses/reviews` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `courseId` | `UUID` | ✅ | |
| `content` | `String` | ✅ | Không được trống |
| `rating` | `int` | ✅ | 1 – 5 |

---

### 2.17 Xóa đánh giá

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/courses/reviews` |
| **Permission** | Authenticated (STUDENT xóa của mình, ADMIN xóa bất kỳ) |

**Query Parameter:** `reviewId` — `UUID`

---

## 3. Enrollment Module

### 3.1 Thêm khóa học vào giỏ hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/cart/items/courses` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `courseId` | `String` (UUID format) | ✅ |

---

### 3.2 Xóa khóa học khỏi giỏ hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/cart/items/courses` |
| **Permission** | `STUDENT` |

**Query Parameter:** `courseId` — `UUID`

---

### 3.3 Lấy danh sách giỏ hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/cart/items/courses` |
| **Permission** | `STUDENT` |

**Query Parameter:** `nextCursor` — `String` (❌ optional)

---

### 3.4 Lấy khóa học đã ghi danh

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments` |
| **Permission** | `STUDENT` |

**Query Parameter:** `nextCursor` — `String` (❌ optional)

---

### 3.5 Lấy khóa học được phân công (Lecturer)

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments/assigned-courses` |
| **Permission** | `LECTURER` |

**Query Parameters:**

| Param | Type | Bắt buộc |
|---|---|---|
| `nextCursor` | `String` | ❌ |
| `keyword` | `String` | ❌ |
| `categoryId` | `UUID` | ❌ |

---

### 3.6 Lấy danh sách học viên đã ghi danh

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments/enrolled-users` |
| **Permission** | `LECTURER` hoặc `ADMIN` |

**Query Parameters:**

| Param | Type | Bắt buộc |
|---|---|---|
| `courseId` | `UUID` | ✅ |
| `nextCursor` | `String` | ❌ |

---

### 3.7 Checkout đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/orders/checkout` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `entityIds` | `List<UUID>` | ✅ | Không được rỗng |
| `entityType` | `PurchaseEntityType` | ✅ | `COURSE` hoặc `SUBSCRIPTION` |

---

### 3.8 Lấy chi tiết đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/orders` |
| **Permission** | `STUDENT` |

**Query Parameter:** `orderId` — `UUID`

---

### 3.9 Lấy lịch sử đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/orders/history` |
| **Permission** | `STUDENT` |

**Query Parameters:**

| Param | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `nextCursor` | `String` | ❌ | |
| `orderStatus` | `PaymentStatus` | ✅ | `COMPLETED`, `FAILED`, `CANCELLED` (không chấp nhận `PENDING`) |

---

### 3.10 Hủy đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/orders/cancel` |
| **Permission** | `STUDENT` |

**Query Parameter:** `orderId` — `UUID`

---

### 3.11 Thanh toán (Purchase)

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/enrollments` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `orderId` | `UUID` | ✅ | ID đơn hàng cần thanh toán |
| `paymentMethod` | `PaymentMethod` | ✅ | `VNPAY`, `MOMO`, `ZALOPAY`, `PAYPAL`, `STRIPE` |

> IP address được tự động lấy từ header `X-FORWARDED-FOR` hoặc `request.getRemoteAddr()`.

---

### 3.12 VnPay Return Callback

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/enrollments/vnpay-return` |
| **Permission** | `STUDENT` |
| **Mô tả** | Callback từ VnPay sau thanh toán |

**Query Parameters (từ VnPay):** `vnp_TxnRef`, `vnp_ResponseCode`

---

### 3.13 Hủy thanh toán

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/enrollments/cancel` |
| **Permission** | `STUDENT` |

**Query Parameter:** `paymentId` — `UUID`

---

## 4. Lecture Module

### 4.1 Lấy bài giảng theo khóa học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/lectures` |
| **Permission** | `permitAll()` |

**Query Parameter:** `courseId` — `UUID` (✅)

---

### 4.2 Lấy chi tiết bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/lectures/{lectureId}` |
| **Permission** | Authenticated |

---

### 4.3 Lấy tài liệu bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/lectures/{lectureId}/materials` |
| **Permission** | Authenticated |

---

### 4.4 Tạo bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/lectures` |
| **Permission** | `LECTURER` hoặc `ADMIN` |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | `UUID` | ❌ | **Phải null** khi tạo |
| `courseId` | `UUID` | ✅ (create) | |
| `title` | `String` | ✅ | Không được trống |
| `summary` | `String` | ✅ | Không được trống |
| `content` | `String` | ❌ | |
| `videoObjectKey` | `String` | ❌ (create) | **Phải null** khi update |

---

### 4.5 Tạo tài liệu (Material)

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/lectures/materials` |
| **Permission** | `LECTURER` hoặc `ADMIN` |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `lectureId` | `UUID` | ✅ |
| `title` | `String` | ✅ |
| `fileObjectKey` | `String` | ✅ |

---

### 4.6 Cập nhật bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/lectures` |
| **Permission** | `LECTURER` hoặc `ADMIN` |

**Request Body:** Cùng `LectureRequest`, `id` **bắt buộc**, `videoObjectKey` **phải null**.

---

### 4.7 Xóa bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/lectures` |
| **Permission** | `LECTURER` hoặc `ADMIN` |

**Query Parameter:** `lectureId` — `UUID`

---

### 4.8 Xóa tài liệu

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/lectures/materials` |
| **Permission** | `LECTURER` hoặc `ADMIN` |

**Query Parameter:** `materialId` — `UUID`

---

### 4.9 Cập nhật tiến độ xem video

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/lectures/progress` |
| **Permission** | `STUDENT` |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `lectureId` | `UUID` | ✅ | |
| `segmentStart` | `Integer` | ✅ | ≥ 0 |
| `segmentEnd` | `Integer` | ✅ | ≥ 0 |

---

### 4.10 Lấy bình luận bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/lectures/comments/filter` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `lectureId` | `UUID` | ✅ | |
| `parentCommentId` | `UUID` | ❌ | Null = lấy comment gốc |
| `page` | `Integer` | ❌ | Mặc định 0 |
| `size` | `Integer` | ❌ | Mặc định 10 |

---

### 4.11 Tạo bình luận bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/lectures/comments` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `lectureId` | `UUID` | ✅ |
| `parentCommentId` | `UUID` | ❌ |
| `content` | `String` | ✅ |

---

### 4.12 Xóa bình luận bài giảng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/lectures/comments` |
| **Permission** | Authenticated |

**Query Parameter:** `commentId` — `UUID`

---

## 5. Assignment Module

### 5.1 Lấy bài tập

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/assignments` |
| **Permission** | Authenticated |
| **Mô tả** | Lấy theo `lectureId` (danh sách) hoặc `assignmentId` (chi tiết). Ít nhất 1 trong 2 phải có. |

**Query Parameters:**

| Param | Type | Bắt buộc |
|---|---|---|
| `lectureId` | `UUID` | ❌ (nhưng 1 trong 2 phải có) |
| `assignmentId` | `UUID` | ❌ (nhưng 1 trong 2 phải có) |

---

### 5.2 Tạo bài tập

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/assignments` |
| **Permission** | `ADMIN` hoặc `LECTURER` |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `lectureId` | `UUID` | ✅ |
| `title` | `String` | ✅ |
| `description` | `String` | ✅ |

---

### 5.3 Xóa bài tập

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/assignments` |
| **Permission** | `ADMIN` hoặc `LECTURER` |

**Query Parameter:** `assignmentId` — `UUID`

---

### 5.4 Lấy feedback

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/assignments/feedbacks` |
| **Permission** | Authenticated (STUDENT chỉ xem của mình) |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `assignmentId` | `UUID` | ✅ | |
| `studentUsername` | `String` | ❌ | STUDENT: tự override thành username mình |

---

### 5.5 Tạo feedback

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/assignments/feedbacks` |
| **Permission** | `ADMIN` hoặc `LECTURER` |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `assignmentId` | `UUID` | ✅ |
| `studentUsername` | `String` | ✅ |
| `feedback` | `String` | ✅ |

---

### 5.6 Xóa feedback

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/assignments/feedbacks` |
| **Permission** | `ADMIN` hoặc `LECTURER` |

**Query Parameter:** `feedbackId` — `UUID`

---

### 5.7 Lấy submissions

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/assignments/submissions` |
| **Permission** | `ADMIN` hoặc `LECTURER` |

**Query Parameters:**

| Param | Type | Bắt buộc | Default |
|---|---|---|---|
| `assignmentId` | `UUID` | ✅ | |
| `page` | `int` | ❌ | 0 |
| `size` | `int` | ❌ | 10 |

---

### 5.8 Nộp bài

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/assignments/submissions` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `assignmentId` | `UUID` | ✅ |
| `fileObjectKey` | `String` | ✅ |

---

### 5.9 Hủy nộp bài

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/assignments/submissions` |
| **Permission** | Authenticated |

**Query Parameter:** `assignmentId` — `UUID`

---

## 6. File Module

### 6.1 Tạo Pre-signed Upload URL

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/files/pre-signed-url` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `fileName` | `String` | ✅ | |
| `contentType` | `String` | ✅ | MIME type |
| `fileSize` | `Long` | ✅ | ≥ 1 |
| `isPublic` | `Boolean` | ❌ | |

---

### 6.2 Lấy metadata file

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/files/metadata` |
| **Permission** | Authenticated |

**Query Parameter:** `fullObjectKey` — `String`

---

### 6.3 Lấy thông tin download

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/files/download` |
| **Permission** | Authenticated |

**Query Parameter:** `fullObjectKey` — `String`

---

### 6.4 Xác nhận upload ảnh

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/files/confirm-image-upload` |
| **Permission** | Authenticated |

**Query Parameter:** `fullObjectKey` — `String`

---

## 7. Forum Module

### 7.1 Lấy post versions (Admin)

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/versions` |
| **Permission** | `ADMIN` |

**Query Parameters:** `status` (`PostStatus`: `PENDING`, `SUPERSEDED`, `APPROVED`, `REJECTED`) ✅, `lastCursor` ❌

---

### 7.2 Lấy bài viết đã đăng

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/posted` |
| **Permission** | Authenticated |

**Query Parameters:** `lastCursor` ❌, `status` (`PostStatus`) ✅

---

### 7.3 Lấy versions theo post ID

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/versions/{postId}` |
| **Permission** | Authenticated |

**Path Variable:** `postId`, **Query Parameter:** `status` (default `APPROVED`)

---

### 7.4 Cập nhật trạng thái post version (Admin)

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/forum/posts/versions` |
| **Permission** | `ADMIN` |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `postVersionId` | `String` (UUID) | ✅ |
| `postStatus` | `String` (PostStatus) | ✅ |

---

### 7.5 Xóa post version

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/posts/versions` |
| **Permission** | Authenticated (chủ sở hữu hoặc ADMIN) |

**Query Parameter:** `postVersionId` — `UUID`

---

### 7.6 Lấy chi tiết bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts` |
| **Permission** | `permitAll()` (GET) |

**Query Parameter:** `id` — `UUID` (✅)

---

### 7.7 Tạo bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/forum/posts` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `postId` | `UUID` | ❌ | **Phải null** khi tạo |
| `thumbObjectKey` | `String` | ✅ | |
| `title` | `String` | ✅ | Tối đa 255 ký tự |
| `shortDescription` | `String` | ✅ | Tối đa 500 ký tự |
| `content` | `String` | ✅ | |

---

### 7.8 Cập nhật bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `PUT /api/v1/forum/posts` |
| **Permission** | Authenticated |

**Request Body:** Cùng `PostRequest`, `postId` **bắt buộc**.

---

### 7.9 Xóa bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/posts` |
| **Permission** | Authenticated (chủ sở hữu hoặc ADMIN) |

**Query Parameter:** `postId` — `UUID`

---

### 7.10 Lấy bài viết đã lưu

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/saved` |
| **Permission** | Authenticated |

**Query Parameter:** `nextCursor` ❌

---

### 7.11 Lưu bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/forum/posts/{postId}/save` |
| **Permission** | Authenticated |

---

### 7.12 Bỏ lưu bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/posts/{postId}/save` |
| **Permission** | Authenticated |

---

### 7.13 Feed bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/feed` |
| **Permission** | Authenticated |

**Query Parameter:** `nextCursor` ❌

---

### 7.14 Tìm kiếm bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/search` |
| **Permission** | Authenticated |
| **Mô tả** | Full-text search qua Elasticsearch |

**Query Parameters:** `keyword` (`String`) ✅, `nextCursor` ❌

---

### 7.15 Bài viết liên quan

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/posts/{postId}/related` |
| **Permission** | Authenticated |

---

### 7.16 Lấy bình luận bài viết

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/comments` |
| **Permission** | `permitAll()` (GET) |

**Query Parameters:** `postId` (`UUID`) ✅, `nextCursor` ❌

---

### 7.17 Lấy reply comments

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/forum/comments/replies` |
| **Permission** | `permitAll()` (GET) |

**Query Parameters:** `parentCommentId` (`UUID`) ✅, `nextCursor` ❌

---

### 7.18 Tạo bình luận

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/v1/forum/comments` |
| **Permission** | Authenticated |

**Request Body:**

| Field | Type | Bắt buộc |
|---|---|---|
| `postId` | `UUID` | ✅ |
| `content` | `String` | ✅ |
| `repliedToCommentId` | `UUID` | ❌ |

---

### 7.19 Xóa bình luận

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `DELETE /api/v1/forum/comments` |
| **Permission** | Authenticated (chủ sở hữu hoặc ADMIN) |

**Query Parameter:** `commentId` — `UUID`

---

## 8. Metric Module

> Tất cả API metric yêu cầu role `ADMIN`.
> Base path: `/api/metrics`

### 8.1 Dashboard Overview

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/dashboard` |
| **Permission** | `ADMIN` |

---

### 8.2 Users Growth

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/users-growth` |
| **Permission** | `ADMIN` |

**Query Parameter:** `period` — `GrowthPeriod` (default `DAILY`): `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`

---

### 8.3 Courses Growth

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/courses-growth` |
| **Permission** | `ADMIN` |

**Query Parameter:** `period` — `GrowthPeriod` (default `DAILY`)

---

### 8.4 Revenue Growth

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/revenue-growth` |
| **Permission** | `ADMIN` |

**Query Parameter:** `period` — `GrowthPeriod` (default `DAILY`)

---

### 8.5 Activity Metrics

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/activity` |
| **Permission** | `ADMIN` |

**Query Parameter:** `days` — `int` (default `30`)

---

### 8.6 Top Courses

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/top-courses` |
| **Permission** | `ADMIN` |

**Query Parameter:** `limit` — `int` (default `10`)

---

### 8.7 Top Users

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/metrics/top-users` |
| **Permission** | `ADMIN` |

**Query Parameter:** `limit` — `int` (default `10`)

---

## 9. Tracking Module

### 9.1 Lấy submission tracking logs

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/v1/assignments/submissions/tracking` |
| **Permission** | Authenticated (STUDENT chỉ xem của mình) |

**Query Parameters:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `assignmentId` | `UUID` | ✅ | |
| `studentUsername` | `String` | ❌ | STUDENT: tự override; Non-student: bắt buộc |
| `page` | `int` | ❌ | Default 0 |

---

## 10. Chat Module

Module tư vấn khoá học tự động bằng AI Chatbot (sử dụng OpenAI Function Calling + PostgreSQL pgvector semantic search).

### 10.1 Gửi tin nhắn tư vấn khoá học

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `POST /api/chat/messages` |
| **Permission** | Public (Optional Auth: Có JWT sẽ cá nhân hoá & lưu lịch sử; không JWT xử lý như anonymous) |

**Request Body:**

```json
{
  "conversationId": "uuid | null",
  "message": "Cho mình hỏi khoá học backend phù hợp cho người mới bắt đầu",
  "history": [
    { "role": "user", "content": "Chào chatbot" },
    { "role": "assistant", "content": "Chào bạn! Mình có thể giúp gì cho bạn?" }
  ]
}
```

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `conversationId` | `UUID` | ❌ | Null nếu tạo hội thoại mới. Đăng nhập: BE validate conversationId thuộc sở hữu user. |
| `message` | `String` | ✅ | Nội dung tin nhắn (tối đa 500 ký tự). |
| `history` | `Array` | ❌ | Bắt buộc khi dùng anonymous (FE tự quản lý lịch sử). Bị bỏ qua khi đã đăng nhập (BE tự load từ DB). |

**Response Data (`ChatMessageResponse`):**

```json
{
  "conversationId": "019ebac1-40fb-7a3f-a81e-5bb1533573d3",
  "reply": {
    "role": "assistant",
    "content": "Dưới đây là một số khoá học lập trình backend dành cho người mới bắt đầu..."
  },
  "courses": [
    {
      "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573d4",
      "title": "Lập trình Java Spring Boot Căn Bản",
      "shortDescription": "Khóa học nhập môn Spring Boot từ zero đến hero",
      "price": 499000.00,
      "thumbnailUrl": "https://pub-r2.dev/thumbnail.jpg",
      "matchReason": "Phù hợp với nhu cầu học Java của bạn"
    }
  ]
}
```

---

### 10.2 Lấy danh sách hội thoại cũ

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/chat/conversations` |
| **Permission** | Authenticated (`STUDENT` / `LECTURER` / `ADMIN`) |

**Response Data (`List<ChatConversationSummaryResponse>`):**

```json
[
  {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573d3",
    "lastMessagePreview": "Dưới đây là một số khoá học lập trình backend dành cho người mới bắt đầu...",
    "updatedAt": "2026-08-12T16:50:00"
  }
]
```

---

### 10.3 Lấy chi tiết tin nhắn trong hội thoại

| Thuộc tính | Giá trị |
|---|---|
| **Endpoint** | `GET /api/chat/conversations/{id}/messages` |
| **Permission** | Authenticated (User sở hữu hội thoại) |

**Path Variable:** `id` — `UUID` (ID hội thoại)

**Response Data (`List<ChatMessageDetailResponse>`):**

```json
[
  {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573e1",
    "role": "user",
    "content": "Cho mình hỏi khoá học backend phù hợp cho người mới bắt đầu",
    "referencedCourseIds": null,
    "courses": [],
    "createdAt": "2026-08-12T16:49:50"
  },
  {
    "id": "019ebac1-40fb-7a3f-a81e-5bb1533573e2",
    "role": "assistant",
    "content": "Dưới đây là một số khoá học lập trình backend dành cho người mới bắt đầu...",
    "referencedCourseIds": [
      "019ebac1-40fb-7a3f-a81e-5bb1533573d4"
    ],
    "courses": [
      {
        "courseId": "019ebac1-40fb-7a3f-a81e-5bb1533573d4",
        "title": "Lập trình Java Spring Boot Căn Bản",
        "shortDescription": "Khóa học nhập môn Spring Boot từ zero đến hero",
        "price": 499000.00,
        "thumbnailUrl": "https://pub-r2.dev/thumbnail.jpg",
        "matchReason": "Khoá học được gợi ý trong hội thoại"
      }
    ],
    "createdAt": "2026-08-12T16:50:00"
  }
]
```

---

## 11. Quiz Module

Module tạo đề thi trắc nghiệm/tự luận, làm bài, chấm điểm tự động & giao bài tập quiz.

### 11.1 Quản lý bài kiểm tra trắc nghiệm

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `GET /api/v1/quizzes`<br>`POST /api/v1/quizzes`<br>`GET /api/v1/quizzes/{id}`<br>`PUT /api/v1/quizzes/{id}`<br>`DELETE /api/v1/quizzes/{id}` |
| **Permission** | `LECTURER`, `ADMIN` (Tạo, Sửa, Xoá); `STUDENT` (Xem danh sách/chi tiết) |

---

### 11.2 Quản lý câu hỏi & phương án

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `GET /api/v1/quizzes/{quizId}/questions`<br>`POST /api/v1/quizzes/{quizId}/questions`<br>`PUT /api/v1/quizzes/{quizId}/questions/{questionId}`<br>`DELETE /api/v1/quizzes/{quizId}/questions/{questionId}` |
| **Permission** | `LECTURER`, `ADMIN` |

---

### 11.3 Giao bài tập Quiz

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `POST /api/v1/quizzes/{quizId}/assignments`<br>`GET /api/v1/quizzes/assignments`<br>`DELETE /api/v1/quizzes/assignments/{id}` |
| **Permission** | `LECTURER`, `ADMIN` |

---

### 11.4 Thực hiện làm bài Quiz

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `POST /api/v1/quizzes/attempts/start`<br>`POST /api/v1/quizzes/attempts/{attemptId}/save`<br>`POST /api/v1/quizzes/attempts/{attemptId}/submit`<br>`GET /api/v1/quizzes/attempts/{attemptId}/result` |
| **Permission** | Authenticated (`STUDENT`) |

---

### 11.5 Chấm điểm tự luận Quiz

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `GET /api/v1/quizzes/grading/pending`<br>`POST /api/v1/quizzes/grading/grade` |
| **Permission** | `LECTURER`, `ADMIN` |

---

## 12. Notification Module

Module quản lý thông báo cá nhân, thông báo nhóm và đăng ký thiết bị push notification (FCM).

### 12.1 Quản lý thông báo cá nhân

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `GET /api/v1/notifications`<br>`PATCH /api/v1/notifications/{id}/read`<br>`PATCH /api/v1/notifications/read-all` |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |

---

### 12.2 Quản lý thông báo nhóm

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `GET /api/v1/notifications/groups`<br>`POST /api/v1/notifications/groups`<br>`PATCH /api/v1/notifications/groups/{id}/read` |
| **Permission** | `ADMIN` (Tạo); Authenticated (Xem & đánh dấu đã đọc theo Role target) |

---

### 12.3 Đăng ký FCM Device Token

| Thuộc tính | Giá trị |
|---|---|
| **Endpoints** | `POST /api/v1/device-tokens`<br>`DELETE /api/v1/device-tokens` |
| **Permission** | Authenticated (`STUDENT`, `LECTURER`, `ADMIN`) |


