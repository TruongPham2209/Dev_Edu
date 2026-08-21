# Quy Trình Tự Động Tạo Quiz Từ Tài Liệu Khóa Học & Quản Lý Thư Viện Tài Liệu (Option 3 — End-to-End Flow)

Tài liệu này mô tả chi tiết kiến trúc, flow logic, state machine, cơ chế Save Policy, quy trình Promote tài liệu tạm thành Global Document, luồng Admin Upload, hệ thống Audit Logging và danh sách API endpoints của tính năng **Tự động tạo Quiz từ Tài liệu Khóa học** trong Dev-Edu Backend.

---

## 1. Tổng Quan Kiến Trúc & Luồng Dữ Liệu End-to-End

Hệ thống hỗ trợ 2 nguồn tài liệu (Source Document) khi Generate Quiz:
1. **Existing Global Document**: Tài liệu đã tồn tại trong Thư viện chung (`visibility = GLOBAL`, `status = READY`). Tái sử dụng lại ngay mà không cần upload, parse hay tạo embedding lại.
2. **New PDF Upload**: Upload trực tiếp file PDF khi Generate Quiz chỉ định `quizId`, `description`, `saveDocument` (mặc định: `false`) và `file`.

### Sơ Đồ Kiến Trúc Luồng Tổng Thể (Reference Architecture)

```text
                         ┌─────────────────────┐
                         │   Document Library  │
                         │   Global Documents  │
                         └──────────┬──────────┘
                                    │
                         Lecturer chọn Document (sourceType = LIBRARY)
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Quiz Generation    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                                  Quiz


    Lecturer
       │
       │ Upload PDF (quizId, description, saveDocument = true/false, file)
       ▼
┌─────────────────────┐
│ Temporary Upload    │  (fileObjectKey: temporary/{jobId}/file.pdf, visibility = TEMPORARY)
│ Private Storage     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Document Processing │  (Extract / OCR Check / Chunk / Vector Embeddings)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Quiz Generation     │  (Access Check / Capacity Check / Planning / Generation / Validation)
└──────────┬──────────┘
           │
           ▼
      Quiz Success? (acceptedCount > 0 & Quiz persisted)
       /          \
     NO            YES
     │              │
     ▼              ▼
  Cleanup      Persist Quiz
                    │
                    ▼
             saveDocument?
               /       \
             NO         YES
             │           │
             ▼           ▼
          TTL        Promote to Global Document & Confirm file_upload
          Cleanup    (Copy/Move to Private Bucket: documents/{docId}/file.pdf)
                         │
                         ▼
                  Document Library (visibility = GLOBAL, isPromoted = true)

Admin Direct Upload:
    Admin ──► Upload PDF ──► Private Bucket ──► Document Processing ──► Global Library
```

---

## 2. Kiểm Tra Slot Khả Dụng Của Đề Thi & Chặn Sớm (Early Capacity Guard)

Khi người dùng gửi yêu cầu sinh câu hỏi cho một đề thi đã tồn tại (`quizId`):
1. **Validate Access Rights**: Gọi `QuizAccessService.validateAccessByQuiz` kiểm tra quyền của giảng viên đối với đề thi.
2. **Derive Course & Configs**: Lấy `courseId` từ `QuizEntity` và đọc các chỉ tiêu loại câu hỏi từ `quiz_question_type_configs`.
3. **Tính Số Câu Còn Thiếu**: Đếm số câu hiện có trong `quiz_questions` cho mỗi loại (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `ESSAY`):
   $$\text{remainingCount} = \max(0, \text{requiredCount} - \text{currentQuestionCount})$$
4. **Early Abort**: Nếu tổng số câu còn lại $\le 0$, hệ thống quăng ngay `BadRequestException` và không tiến hành pipeline.

---

## 3. Vòng Đời Tài Liệu Tạm, Save Policy & Cronjob Protection

### Confirm File Trong Bảng `file_upload` Tránh Cronjob Quét Xóa
Các file upload mới được lưu bản ghi trong `file_upload`. Hệ thống có cronjob định kỳ dọn dẹp các file chưa confirm. Khi `saveDocument = true` và tài liệu được lưu/promote thành công:
- Hệ thống tự động cập nhật `FileUploadEntity.status = UploadStatus.COMPLETED` và `confirmedAt = LocalDateTime.now()` trong bảng `file_upload`.
- Đảm bảo file được bảo vệ an toàn tuyệt đối khỏi cronjob dọn rác.

### Thời Điểm Lưu Tài Liệu
- Tài liệu được promote/lưu vào Thư viện chung ngay khi **pipeline hoàn tất việc sinh và validate thành công các câu hỏi hợp lệ** (khi phản hồi danh sách câu hỏi cho giảng viên xem trước), không cần chờ tới bước xác nhận publish bài thi.

---

## 4. API Endpoints Reference

### 1. Lấy Danh Sách Tài Liệu Thư Viện Chung (Cursor Pagination)
- **Endpoint**: `GET /api/v1/documents/library`
- **Query Params**:
  - `nextCursor` (String, optional): Cursor phân trang.
  - `fileName` (String, optional): Tìm kiếm theo tên file / tiêu đề tài liệu.
- **Kích thước trang cố định**: `15`
- **Response** (`200 OK` - `CustomPaging<CourseDocumentResponse>`):
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Giáo trình Mạng Máy Tính Nâng Cao.pdf",
        "fileName": "Giáo trình Mạng Máy Tính Nâng Cao.pdf",
        "fileObjectKey": "documents/global/1771589000-MangMayTinh.pdf",
        "fileSize": 2450800,
        "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "status": "READY",
        "visibility": "GLOBAL",
        "isPromoted": true,
        "createdBy": "admin1",
        "createdAt": "2026-08-20T10:00:00Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 15,
    "totalElements": 1,
    "totalPages": 1,
    "nextCursor": null
  }
}
```

---

### 2. Sinh Quiz Từ Upload PDF Mới
- **Endpoint**: `POST /api/v1/quizzes/generate-from-file` (`multipart/form-data`)
- **Authorization**: `hasAnyAuthority('LECTURER', 'ADMIN')`
- **Form Parameters**:
  - `quizId` (UUID, required)
  - `description` (String, required - mô tả độ khó, chất lượng câu hỏi, định hướng phân bổ)
  - `saveDocument` (Boolean, optional, defaultValue = `false`)
  - `file` (MultipartFile, required - PDF)

---

### 3. Admin Upload Trực Tiếp Vào Thư Viện Chung
- **Endpoint**: `POST /api/v1/documents/library/upload` (`multipart/form-data`)
- **Authorization**: `hasAuthority('ADMIN')`
- **Form Parameters**:
  - `file` (MultipartFile, required - PDF)
  - `title` (String, optional)
