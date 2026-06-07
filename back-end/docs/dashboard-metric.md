# Tài liệu bàn giao: Hệ thống Dashboard Metrics & Analytics

Hệ thống Dashboard Metrics & Analytics được thiết kế nhằm cung cấp các số liệu thống kê chi tiết phục vụ cho mục đích quản trị hệ thống học tập trực tuyến (Dev_Edu). Toàn bộ nghiệp vụ truy vấn được tối ưu hóa bằng cách sử dụng `NamedParameterJdbcTemplate` với các câu lệnh SQL Native thuần túy, đảm bảo hiệu năng tối đa và tính chính xác cao.

---

## 1. Danh sách Metric đã triển khai

| Tên Metric | Ý nghĩa nghiệp vụ |
| :--- | :--- |
| **Tổng số người dùng (Total Users)** | Đánh giá tổng quy mô học viên và giảng viên tham gia hệ thống. |
| **Tổng số khóa học (Total Courses)** | Phản ánh số lượng khóa học hiện tại đang hoạt động trên nền tảng. |
| **Tổng số bài học (Total Lessons)** | Đo lường mức độ phong phú về mặt nội dung chi tiết bài giảng. |
| **Tổng số bài tập (Total Assignments)** | Đánh giá năng lực kiểm tra, đo lường tiến trình giảng dạy và đánh giá học viên. |
| **Tổng số lượt học (Total Enrollments)** | Thể hiện mức độ quan tâm của học viên đối với các khóa học nói chung. |
| **Tổng doanh thu (Total Revenue)** | Tổng tiền tích lũy từ các giao dịch thanh toán thành công của học viên. |
| **Tỷ lệ hoàn thành (Completion Rate)** | Tỷ lệ phần trăm giữa số lượt đăng ký đã hoàn thành 100% bài học trên tổng số lượt đăng ký. |
| **Tăng trưởng người dùng (User Growth)** | Phân tích xu hướng đăng ký mới của người dùng trong khoảng thời gian xác định (ngày, tuần, tháng, năm). |
| **Tăng trưởng khóa học (Course Growth)** | Xu hướng xuất bản và đưa khóa học mới lên nền tảng theo thời gian (ngày, tuần, tháng, năm). |
| **Tăng trưởng doanh thu (Revenue Growth)** | Doanh thu thu hoạch thực tế theo thời gian (ngày, tuần, tháng, năm) để phân tích xu hướng tài chính. |
| **Hoạt động hệ thống (System Activity)** | Thống kê số lượng Active Users trong ngày, tải hệ thống qua request logs và phân loại hành động của người dùng. |
| **Top khóa học (Top Courses)** | Bảng xếp hạng khóa học dựa trên lượt đăng ký học viên, đánh giá và doanh thu mang lại. |
| **Top người dùng (Top Users)** | Phân loại và xếp hạng học viên tích cực nhất (mua nhiều, chi nhiều) và người đóng góp tích cực nhất trên Forum. |

---

## 2. Danh sách API endpoints

Tất cả API dưới đây đều được bảo vệ và chỉ chấp nhận quyền hạn của Quản trị viên (`ADMIN`):
- Header yêu cầu: `Authorization: Bearer <Token>` có role `ADMIN`
- Format response chung: `com.pht.dev_edu.common.dto.ApiResponse`

### 2.1 Tổng quan chỉ số hệ thống
* **Method**: `GET`
* **URL**: `/api/metrics/dashboard`
* **Response mẫu**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "totalUsers": 1280,
    "totalCourses": 34,
    "totalLectures": 256,
    "totalAssignments": 98,
    "totalEnrollments": 1820,
    "totalRevenue": 154300.50,
    "courseCompletionRate": 72.35
  },
  "timestamp": 1717758336000
}
```

### 2.2 Biểu đồ tăng trưởng người dùng
* **Method**: `GET`
* **URL**: `/api/metrics/users-growth`
* **Query Params**: `period` (Giá trị: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`. Mặc định: `DAILY`)
* **Response mẫu (DAILY)**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    { "date": "2026-05-08", "count": 5 },
    { "date": "2026-05-09", "count": 12 },
    { "date": "2026-05-10", "count": 0 }
  ],
  "timestamp": 1717758336000
}
```

### 2.3 Biểu đồ tăng trưởng khóa học
* **Method**: `GET`
* **URL**: `/api/metrics/courses-growth`
* **Query Params**: `period` (Giá trị: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`. Mặc định: `DAILY`)
* **Response mẫu (DAILY)**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    { "date": "2026-05-08", "count": 1 },
    { "date": "2026-05-09", "count": 0 },
    { "date": "2026-05-10", "count": 2 }
  ],
  "timestamp": 1717758336000
}
```

### 2.4 Biểu đồ tăng trưởng doanh thu
* **Method**: `GET`
* **URL**: `/api/metrics/revenue-growth`
* **Query Params**: `period` (Giá trị: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`. Mặc định: `DAILY`)
* **Response mẫu (DAILY)**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    { "date": "2026-05-08", "amount": 150.00 },
    { "date": "2026-05-09", "amount": 0.00 },
    { "date": "2026-05-10", "amount": 349.99 }
  ],
  "timestamp": 1717758336000
}
```

### 2.5 Thống kê hoạt động
* **Method**: `GET`
* **URL**: `/api/metrics/activity`
* **Query Params**: `days` (mặc định: 30)
* **Response mẫu**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "dailyActiveUsers": 85,
    "totalRequestLogs": 15420,
    "recentActivities": [
      {
        "username": "student_dev",
        "action": "SUBMIT_ASSIGNMENT",
        "details": "Submitted assignment for Java OOP",
        "createdAt": "2026-06-07T11:45:00"
      }
    ],
    "actionDistribution": {
      "LOGIN": 320,
      "VIEW_COURSE": 1250,
      "POST_FORUM": 45
    }
  },
  "timestamp": 1717758336000
}
```

### 2.6 Top Khóa Học Phổ Biến
* **Method**: `GET`
* **URL**: `/api/metrics/top-courses`
* **Query Params**: `limit` (mặc định: 10)
* **Response mẫu**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": [
    {
      "id": "e8d98d28-3e4b-4bda-bc6c-1793a38ea822",
      "title": "Spring Boot Microservices",
      "price": 199.99,
      "createdBy": "lecturer_alice",
      "createdAt": "2026-02-10T09:00:00",
      "enrollmentCount": 452,
      "averageRating": 4.82,
      "reviewCount": 112,
      "totalRevenue": 90395.48
    }
  ],
  "timestamp": 1717758336000
}
```

### 2.7 Top Người Dùng Tích Cực
* **Method**: `GET`
* **URL**: `/api/metrics/top-users`
* **Query Params**: `limit` (mặc định: 10)
* **Response mẫu**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Request successful",
  "data": {
    "topStudents": [
      {
        "username": "student_alpha",
        "fullName": "Nguyễn Văn A",
        "email": "alpha@gmail.com",
        "enrollmentCount": 8,
        "totalSpent": 1240.50
      }
    ],
    "topContributors": [
      {
        "username": "contributor_beta",
        "fullName": "Trần Văn B",
        "postCount": 18,
        "commentCount": 142
      }
    ]
  },
  "timestamp": 1717758336000
}
```

---

## 3. SQL / Logic thống kê chi tiết

### 3.1 Tỷ lệ hoàn thành khóa học (Course Completion Rate)
**Logic**: 
Một enrollment hoàn thành khi học viên đã xem xong toàn bộ các bài giảng thuộc khóa học đó (số lượng record trong bảng `lecture_progress` bằng số lượng `lecture` của khóa học).
**SQL**:
```sql
WITH course_lecture_count AS (
    SELECT course_id, COUNT(*) as total_lectures
    FROM lecture
    WHERE deleted_at IS NULL
    GROUP BY course_id
),
student_lecture_progress AS (
    SELECT l.course_id, lp.student, COUNT(*) as completed_lectures
    FROM lecture_progress lp
    JOIN lecture l ON lp.lecture_id = l.id
    WHERE l.deleted_at IS NULL
    GROUP BY l.course_id, lp.student
),
enrollment_status AS (
    SELECT 
        e.course_id, 
        e.student_username,
        COALESCE(clc.total_lectures, 0) as total_lectures,
        COALESCE(slp.completed_lectures, 0) as completed_lectures
    FROM enrollment e
    LEFT JOIN course_lecture_count clc ON e.course_id = clc.course_id
    LEFT JOIN student_lecture_progress slp ON e.course_id = slp.course_id AND e.student_username = slp.student
)
SELECT 
    COUNT(*) as total_enrollments,
    SUM(CASE WHEN total_lectures > 0 AND completed_lectures >= total_lectures THEN 1 ELSE 0 END) as completed_enrollments
FROM enrollment_status
```

### 3.2 Lập lịch khoảng thời gian & Lấp đầy dải dữ liệu trống (Gap Filling & Grouping)
**Logic**:
Tầng Service sẽ tính toán thời điểm bắt đầu (`since`) và bước nhảy (increment step) dựa trên `period` được FE truyền lên:
* **DAILY**: Lấy 30 ngày gần nhất. SQL sử dụng `DATE_TRUNC('day', ...)` nhóm theo ngày. Java lấp dải ngày bằng cách cộng thêm `plusDays(1)`.
* **WEEKLY**: Lấy 12 tuần gần nhất (bắt đầu từ Thứ Hai đầu tiên trong phạm vi). SQL dùng `DATE_TRUNC('week', ...)`. Java lấp dải ngày bằng cách cộng thêm `plusWeeks(1)`.
* **MONTHLY**: Lấy 12 tháng gần nhất (bắt đầu từ ngày đầu tiên của tháng). SQL dùng `DATE_TRUNC('month', ...)`. Java lấp dải ngày bằng cách cộng thêm `plusMonths(1)`.
* **YEARLY**: Lấy 5 năm gần nhất (bắt đầu từ ngày đầu năm). SQL dùng `DATE_TRUNC('year', ...)`. Java lấp dải ngày bằng cách cộng thêm `plusYears(1)`.

### 3.3 Top Khóa Học (Top Courses Leaderboard)
**Logic**: 
Truy vấn tích hợp các subquery để tính tổng số học viên đăng ký, điểm số đánh giá trung bình từ bảng review và doanh thu tích lũy từ bảng `order_item` cho khóa học cụ thể, tránh phép JOIN trực tiếp nhiều bảng gây nhân đôi bản ghi (Cartesian Product).
**SQL**:
```sql
SELECT 
    c.id, 
    c.title, 
    c.price, 
    c.created_by,
    c.created_at,
    (SELECT COUNT(*) FROM enrollment e WHERE e.course_id = c.id) as enrollment_count,
    (SELECT COALESCE(AVG(cr.rating), 0.0) FROM course_review cr WHERE cr.course_id = c.id) as average_rating,
    (SELECT COUNT(*) FROM course_review cr WHERE cr.course_id = c.id) as review_count,
    (SELECT COALESCE(SUM(oi.price), 0.0) FROM order_item oi JOIN "order" o ON oi.order_id = o.id WHERE oi.item_id = c.id AND oi.item_type = 'course' AND o.status = 'COMPLETED') as total_revenue
FROM course c
WHERE c.deleted_at IS NULL
ORDER BY enrollment_count DESC, total_revenue DESC
LIMIT :limit
```

---

## 4. Đề xuất mở rộng trong tương lai

1. **Cohort Analysis / Retention Rate**: Thống kê tỷ lệ học viên tiếp tục hoạt động hoặc mua thêm khóa học ở tuần/tháng tiếp theo kể từ ngày đăng ký đầu tiên.
2. **Engagement Metrics**: Phân tích thời gian trung bình học viên xem video/bài học (`duration` vs `completed_at`).
3. **Refund Rates / Cancel Rate**: Phân tích các giao dịch bị `CANCELLED` hoặc `FAILED` để phát hiện lỗi cổng thanh toán hoặc nhu cầu hủy học của học viên.
4. **Active Forum Topics**: Đo lường tương tác trên các chủ đề forum (views/likes/responses) nhằm thúc đẩy phát triển cộng đồng tự học.
