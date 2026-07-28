-- ===== quizzes =====
CREATE INDEX IF NOT EXISTS idx_quizzes_course_status
    ON quizzes (course_id, status) WHERE deleted_at IS NULL;
-- Mục đích: danh sách Quiz theo Course + lọc theo trạng thái (vd chỉ hiện APPROVED cho học viên) (Q1)

CREATE INDEX IF NOT EXISTS idx_quizzes_created_by
    ON quizzes (created_by) WHERE deleted_at IS NULL;
-- Mục đích: Instructor xem "Quiz của tôi"

CREATE INDEX IF NOT EXISTS idx_quizzes_pending
    ON quizzes (submitted_at) WHERE status = 'PENDING' AND deleted_at IS NULL;
-- Composite theo mục đích thực tế: partial index chỉ chứa các Quiz đang chờ duyệt,
-- giữ index nhỏ dù bảng quizzes lớn (Q2 — hàng chờ duyệt của Admin)

-- ===== quiz_question_type_configs =====
CREATE INDEX IF NOT EXISTS idx_qtc_quiz
    ON quiz_question_type_configs (quiz_id);
-- Mục đích: load cấu hình số lượng/điểm khi hiển thị form tạo câu hỏi

-- ===== quiz_questions =====
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_order
    ON quiz_questions (quiz_id, order_index) WHERE deleted_at IS NULL;
-- Mục đích: load toàn bộ câu hỏi theo đúng thứ tự hiển thị (Q3)

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_type
    ON quiz_questions (quiz_id, question_type) WHERE deleted_at IS NULL;
-- Mục đích: đếm số câu theo loại để validate với quiz_question_type_configs

-- ===== quiz_question_options =====
CREATE INDEX IF NOT EXISTS idx_quiz_question_options_question_order
    ON quiz_question_options (question_id, order_index) WHERE deleted_at IS NULL;
-- Mục đích: load các option theo đúng thứ tự cho 1 câu hỏi (Q3)

-- ===== quiz_assignments =====
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz
    ON quiz_assignments (quiz_id) WHERE deleted_at IS NULL;
-- Mục đích: liệt kê các đợt giao bài của 1 Quiz

CREATE INDEX IF NOT EXISTS idx_quiz_assignments_status_time
    ON quiz_assignments (status, start_time) WHERE deleted_at IS NULL;
-- Composite: Job/scheduler quét Assignment cần chuyển ACTIVE/CLOSED theo mốc thời gian

-- ===== quiz_attempts =====
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_assignment_student
    ON quiz_attempts (assignment_id, student_username);
-- Composite: đếm/liệt kê số lần học viên đã làm trong 1 Assignment (Q5) — cột đầu chọn lọc theo assignment,
-- cột sau lọc theo học viên, phù hợp cách truy vấn "của tôi trong đợt này"

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_status
    ON quiz_attempts (student_username, status);
-- Composite: dashboard "bài đang làm / đã nộp của tôi" theo học viên (Q6)

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_expiring
    ON quiz_attempts (expires_at) WHERE status = 'IN_PROGRESS';
-- Partial index: job quét attempt hết hạn để auto-submit chỉ cần scan các attempt còn dang dở (Q10)

-- ===== quiz_attempt_answers =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt_question
    ON quiz_attempt_answers (attempt_id, question_id);
-- Bắt buộc: đảm bảo 1 câu hỏi chỉ có 1 dòng state / attempt, đồng thời phục vụ UPSERT autosave (Q7)

CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt
    ON quiz_attempt_answers (attempt_id);
-- Mục đích: lấy toàn bộ câu trả lời của 1 attempt để chấm điểm / hiển thị kết quả (Q8)

CREATE INDEX IF NOT EXISTS idx_attempt_answers_pending_grading
    ON quiz_attempt_answers (attempt_id, question_id)
    WHERE question_type = 'ESSAY' AND awarded_points IS NULL;
-- Partial index: danh sách bài Essay chưa chấm cho Instructor (Q11)

-- ===== quiz_attempt_answer_logs =====
CREATE INDEX IF NOT EXISTS idx_answer_logs_attempt_question_time
    ON quiz_attempt_answer_logs (attempt_id, question_id, saved_at DESC);
-- Composite: phục hồi/replay lịch sử autosave của 1 câu hỏi theo thứ tự thời gian gần nhất (Q9)

-- ===== quiz_essay_gradings =====
CREATE INDEX IF NOT EXISTS idx_essay_gradings_answer_time
    ON quiz_essay_gradings (attempt_answer_id, graded_at DESC);
-- Mục đích: xem lịch sử chấm/regrade của 1 câu trả lời Essay cụ thể

-- ===== user_quiz_sessions =====
CREATE INDEX IF NOT EXISTS idx_user_quiz_sessions_username_active
    ON user_quiz_sessions (username, is_active);
-- Composite: kiểm tra phiên đang hoạt động của user khi có login mới (Q12)

CREATE INDEX IF NOT EXISTS idx_user_quiz_sessions_expires
    ON user_quiz_sessions (expires_at) WHERE is_active = true;
-- Partial index: job dọn dẹp / auto-revoke session hết hạn

-- ===== quiz_audit_logs =====
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON quiz_audit_logs (entity_type, entity_id, created_at DESC);
-- Composite: truy vết toàn bộ lịch sử của 1 entity cụ thể theo thời gian (Q13)

CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by
    ON quiz_audit_logs (performed_by, created_at DESC);
-- Mục đích: truy vết "user X đã làm gì" phục vụ điều tra/khiếu nại