-- =====================================================================
-- 1. BẢNG THÔNG BÁO CÁ NHÂN (notification_personal)
-- =====================================================================
CREATE TABLE IF NOT EXISTS notification_personal (
     id            UUID PRIMARY KEY,
     username      VARCHAR(255) NOT NULL,
     type          VARCHAR(100) NOT NULL,
     title         VARCHAR(500) NOT NULL,
     content       TEXT NULL,
     target_data   JSONB NULL,
     is_read       BOOLEAN NOT NULL DEFAULT FALSE,
     read_at       TIMESTAMP NULL,
     created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at    TIMESTAMP NULL
);

COMMENT ON TABLE notification_personal IS
    'Lưu thông báo cá nhân, được hệ thống tự động sinh ra khi có sự kiện
    liên quan trực tiếp tới 1 user (bình luận, bài viết được duyệt/từ chối,
    feedback bài giảng, kết quả quiz, ...). Mỗi user có field is_read riêng
    để đánh dấu đã đọc, không cần bảng phụ vì mỗi thông báo chỉ thuộc 1 user.';



COMMENT ON COLUMN notification_personal.type IS
    'Loại sự kiện sinh thông báo, lưu dạng chuỗi tự do (VD: COMMENT, POST_APPROVED, POST_REJECTED,
    LECTURE_FEEDBACK, QUIZ_RESULT, ...). BE tự quản lý theo enum, DB không check constraint.';
COMMENT ON COLUMN notification_personal.target_data IS
    'Dữ liệu thô (object type, object id, các tham số liên quan, ...) dạng JSONB
    để FE tự build URL đích khi click vào thông báo. BE không build/lưu URL trực tiếp.';
COMMENT ON COLUMN notification_personal.is_read IS
    'Trạng thái đã đọc của thông báo (TRUE = đã đọc, FALSE = chưa đọc). Mặc định FALSE khi tạo.';
COMMENT ON COLUMN notification_personal.read_at IS
    'Thời điểm user đánh dấu đã đọc thông báo, NULL nếu chưa đọc.';



-- =====================================================================
-- 2. BẢNG THÔNG BÁO NHÓM (notification_group)
-- =====================================================================
CREATE TABLE IF NOT EXISTS notification_group (
      id            UUID PRIMARY KEY,
      title         VARCHAR(500) NOT NULL,
      content       TEXT NULL,
      type          VARCHAR(100) NULL,
      target_data   JSONB NULL,
      created_by    VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP NULL,
      deleted_at    TIMESTAMP NULL
);

COMMENT ON TABLE notification_group IS
    'Lưu thông báo cho nhóm (role), do ADMIN chủ động tạo. 1 thông báo nhóm có thể
    nhắm tới nhiều role cùng lúc (STUDENT/LECTURER/ADMIN), danh sách role được lưu
    ở bảng notification_group_target. Xóa thông báo nhóm dùng soft-delete (deleted_at)
    để không phá vỡ dữ liệu trạng thái đọc đã ghi nhận ở notification_group_read_status.';


COMMENT ON COLUMN notification_group.type IS
    'Loại thông báo nhóm, lưu dạng chuỗi tự do, BE tự quản lý theo enum, DB không check constraint.';
COMMENT ON COLUMN notification_group.target_data IS
    'Dữ liệu thô dạng JSONB để FE tự build URL đích khi click vào thông báo nhóm.
    BE không build/lưu URL trực tiếp.';



-- =====================================================================
-- 3. BẢNG ROLE ĐÍCH CỦA THÔNG BÁO NHÓM (notification_group_target)
-- =====================================================================
CREATE TABLE IF NOT EXISTS notification_group_target (
     id                        UUID PRIMARY KEY,
     notification_group_id     UUID NOT NULL,
     role                      VARCHAR(50) NOT NULL,
     created_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notification_group_target IS
    'Lưu danh sách role được nhắm tới cho từng thông báo nhóm (1 thông báo có thể
    chọn nhiều role: STUDENT, LECTURER, ADMIN -> nhiều dòng trong bảng này).
    Không có FK tới notification_group (microservice), liên kết bằng notification_group_id.';


COMMENT ON COLUMN notification_group_target.notification_group_id IS
    'Tham chiếu logic tới notification_group.id (không có FK do kiến trúc microservice).';
COMMENT ON COLUMN notification_group_target.role IS
    'Role được nhắm tới cho thông báo (STUDENT/LECTURER/ADMIN), lưu dạng chuỗi tự do,
    BE tự quản lý theo enum, DB không check constraint.';



-- =====================================================================
-- 4. BẢNG TRẠNG THÁI ĐỌC THÔNG BÁO NHÓM (notification_group_read_status)
-- =====================================================================
CREATE TABLE IF NOT EXISTS notification_group_read_status (
      id                        UUID PRIMARY KEY,
      notification_group_id     UUID NOT NULL,
      username                  VARCHAR(255) NOT NULL,
      is_read                   BOOLEAN NOT NULL DEFAULT TRUE,
      read_at                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at                TIMESTAMP NULL
);

COMMENT ON TABLE notification_group_read_status IS
    'Lưu trạng thái đọc thông báo nhóm theo từng user (vì 1 thông báo nhóm được nhiều
    user cùng role xem, không thể dùng 1 field is_read chung như notification_personal).
    Quy ước: user chưa có dòng dữ liệu ứng với (notification_group_id, username)
    => coi như CHƯA đọc. Khi user đọc/đánh dấu đọc thì upsert 1 dòng vào đây
    (ON CONFLICT (notification_group_id, username) DO UPDATE).';


COMMENT ON COLUMN notification_group_read_status.notification_group_id IS
    'Tham chiếu logic tới notification_group.id (không có FK do kiến trúc microservice).';
COMMENT ON COLUMN notification_group_read_status.read_at IS
    'Thời điểm user đọc/đánh dấu đã đọc thông báo lần gần nhất.';