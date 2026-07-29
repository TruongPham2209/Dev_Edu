-- ===== quizzes =====
DROP INDEX IF EXISTS idx_quizzes_created_by;
DROP INDEX IF EXISTS idx_quizzes_pending;

CREATE INDEX IF NOT EXISTS idx_quizzes_pending
    ON quizzes (submitted_at) WHERE deleted_at IS NULL AND status = 'PENDING';
-- Composite theo mục đích thực tế: partial index chỉ chứa các Quiz đang chờ duyệt,
-- giữ index nhỏ dù bảng quizzes lớn (Q2 — hàng chờ duyệt của Admin)

DROP INDEX IF EXISTS idx_quiz_questions_quiz_type;