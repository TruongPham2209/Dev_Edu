-- =========================================================
-- CORE: Quiz domain
-- =========================================================

CREATE TABLE IF NOT EXISTS quizzes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by          VARCHAR(150) NOT NULL,
    submitted_by        VARCHAR(150),
    submitted_at        TIMESTAMP,
    approved_by         VARCHAR(150),
    approved_at         TIMESTAMP,
    rejected_by         VARCHAR(150),
    rejected_at         TIMESTAMP,
    rejection_reason    TEXT,
    reviewed_by         VARCHAR(150),
    reviewed_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,
    deleted_by          VARCHAR(150)
);


-- "bản thiết kế cấu trúc đề thi" — quy định trước khi tạo câu hỏi: loại này cần bao nhiêu câu, mỗi câu bao nhiêu điểm, chấm tự động hay chấm tay.
-- Dùng để validate khi Instructor thêm câu hỏi thật (vd chặn không cho thêm câu Essay thứ 6 nếu config chỉ cho phép 5) và để UI hiện tiến độ "đã tạo x/y câu".
CREATE TABLE IF NOT EXISTS quiz_question_type_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id             UUID NOT NULL,
    question_type       VARCHAR(30) NOT NULL,
    required_count      INTEGER NOT NULL DEFAULT 0,
    points_per_question NUMERIC(6,2) NOT NULL CHECK (points_per_question >= 0),
    scoring_method      VARCHAR(20) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (quiz_id, question_type)
);


-- chứa nội dung từng câu hỏi thật sự trong đề — loại câu hỏi, nội dung, điểm, thứ tự hiển thị.
-- Là bảng trung tâm mà mọi thứ khác (option, answer) tham chiếu tới.
CREATE TABLE IF NOT EXISTS quiz_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id             UUID NOT NULL,
    question_type       VARCHAR(30) NOT NULL,
    content             TEXT NOT NULL,
    points              NUMERIC(6,2) NOT NULL CHECK (points >= 0),
    order_index         INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,
    deleted_by          VARCHAR(150)
);


-- chứa các phương án trả lời cho câu Single/Multiple Choice, đánh dấu phương án nào đúng (is_correct).
-- Đây là bảng "nhạy cảm" nhất về bảo mật — nhiệm vụ ẩn is_correct khỏi Frontend trước khi chấm điểm nằm ở tầng API, không phải ở bảng, nhưng bảng này là nơi giữ đáp án đúng duy nhất.
CREATE TABLE IF NOT EXISTS quiz_question_options (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id         UUID NOT NULL,
    option_text         TEXT NOT NULL,
    is_correct          BOOLEAN NOT NULL DEFAULT false,
    order_index         INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,
    deleted_by          VARCHAR(150)
);


-- Một Quiz có thể có nhiều Assignment (giao lại nhiều lớp, nhiều đợt khác nhau) mà không cần nhân bản câu hỏi.
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id             UUID NOT NULL,
    start_time          TIMESTAMP NOT NULL,
    end_time            TIMESTAMP,
    duration_minutes    INTEGER NOT NULL CHECK (duration_minutes > 0),
    shuffle_questions   BOOLEAN NOT NULL DEFAULT false,
    shuffle_options     BOOLEAN NOT NULL DEFAULT false,
    max_attempts        INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts > 0),
    status              VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_by          VARCHAR(150) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,
    deleted_by          VARCHAR(150)
);


-- đại diện một lần làm bài cụ thể của một học viên — là "trung tâm điều phối" của toàn bộ quá trình thi: theo dõi trạng thái (IN_PROGRESS/SUBMITTED/GRADING/GRADED/EXPIRED/ABANDONED), thời gian bắt đầu/hết hạn, tổng điểm, và ai đang "giữ quyền" làm bài (active_session_token) để chống multi-tab.
-- Mọi hành động autosave/submit/chấm điểm đều xoay quanh 1 dòng trong bảng này.
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id           UUID NOT NULL,
    quiz_id                 UUID NOT NULL,
    student_username        VARCHAR(150) NOT NULL,
    attempt_number          INTEGER NOT NULL CHECK (attempt_number > 0),
    status                  VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at              TIMESTAMP NOT NULL,
    submitted_at            TIMESTAMP,
    graded_at               TIMESTAMP,
    total_score             NUMERIC(6,2),
    max_score               NUMERIC(6,2) NOT NULL,
    question_order          JSONB NOT NULL,
    active_session_token    VARCHAR(100),
    lock_acquired_at        TIMESTAMP,
    last_heartbeat_at       TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- giữ câu trả lời mới nhất của học viên cho từng câu hỏi — phục vụ 3 việc:
-- (1) resume bài làm khi refresh,
-- (2) làm nguồn dữ liệu để chấm điểm,
-- (3) hiển thị lại bài làm + đáp án sau khi hoàn thành.
-- Mỗi (attempt, question) chỉ có đúng 1 dòng, được ghi đè (upsert) liên tục.
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id          UUID NOT NULL,
    question_id         UUID NOT NULL,
    question_type       VARCHAR(30) NOT NULL,
    answer_text         TEXT,
    selected_option_ids JSONB,
    is_correct          BOOLEAN,
    awarded_points      NUMERIC(6,2),
    graded_by           VARCHAR(150),
    graded_at           TIMESTAMP,
    autosave_version    INTEGER NOT NULL DEFAULT 1,
    last_saved_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (attempt_id, question_id)
);


-- là "cuốn nhật ký" ghi lại mọi lần autosave, không bao giờ sửa/xóa.
-- Nhiệm vụ riêng của nó là đảm bảo không mất dữ liệu khi có sự cố (mất mạng, ghi đè sai thứ tự, bug ở bảng state) — có thể "replay" lại để khôi phục.
-- Đây cũng là bảng phát triển nhanh nhất nên có nhiệm vụ phụ là ứng viên đầu tiên cho partition/archival theo thời gian.
CREATE TABLE IF NOT EXISTS quiz_attempt_answer_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id          UUID NOT NULL,
    question_id         UUID NOT NULL,
    answer_text         TEXT,
    selected_option_ids JSONB,
    client_seq          INTEGER NOT NULL,
    session_token       VARCHAR(100) NOT NULL,
    saved_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ghi lại lịch sử chấm điểm Essay — ai chấm, chấm bao nhiêu điểm, feedback gì, lúc nào.
-- Tách khỏi quiz_attempt_answers (chỉ giữ điểm hiện tại) để hỗ trợ chấm lại (regrade) và giải quyết khiếu nại điểm mà vẫn biết lịch sử thay đổi.
CREATE TABLE IF NOT EXISTS quiz_essay_gradings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_answer_id   UUID NOT NULL,
    question_id         UUID NOT NULL,
    attempt_id          UUID NOT NULL,
    grader_username     VARCHAR(150) NOT NULL,
    awarded_points      NUMERIC(6,2) NOT NULL CHECK (awarded_points >= 0),
    feedback            TEXT,
    graded_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- theo dõi các phiên đăng nhập đang hoạt động của người dùng — là nơi hệ thống tra cứu để quyết định có cho phép đăng nhập/mở tab mới hay không, phục vụ trực tiếp yêu cầu hạn chế multi-device/multi-tab.
CREATE TABLE IF NOT EXISTS user_quiz_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(150) NOT NULL,
    session_token       VARCHAR(100) NOT NULL UNIQUE,
    device_info         TEXT,
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at          TIMESTAMP NOT NULL,
    revoked_at          TIMESTAMP,
    revoked_reason      VARCHAR(50)
);


-- ghi nhận ai đã làm gì, khi nào với mọi entity trong domain Quiz (submit duyệt, approve, reject, start attempt, submit, grade...) — phục vụ truy vết, giải trình khi có tranh chấp, và compliance.
-- Không tham gia vào logic nghiệp vụ runtime, chỉ là "sổ ghi chép" song song.
CREATE TABLE IF NOT EXISTS quiz_audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type         VARCHAR(30) NOT NULL,
    entity_id           UUID NOT NULL,
    action              VARCHAR(50) NOT NULL,
    performed_by        VARCHAR(150) NOT NULL,
    old_value           JSONB,
    new_value           JSONB,
    note                TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);