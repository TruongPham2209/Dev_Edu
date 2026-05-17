DROP INDEX IF EXISTS idx_feedback_submission_id_created_at;

CREATE INDEX IF NOT EXISTS idx_feedback_assignment_id_student_created_at
    ON "submission_feedback" (assignment_id, student_username, created_at DESC);