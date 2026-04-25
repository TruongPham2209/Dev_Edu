-- lecture
CREATE INDEX IF NOT EXISTS idx_active_lecture_course_id_order
    ON "lecture" (course_id, lecture_order ASC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deleted_lecture_deleted_at
    ON "lecture" (deleted_at DESC)
    WHERE deleted_at IS NOT NULL;


-- lecture material
CREATE INDEX IF NOT EXISTS idx_active_material_lecture_id
    ON "lecture_material" (lecture_id, uploaded_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deleted_material_deleted_at
    ON "lecture_material" (deleted_at DESC);


-- lecture progress
CREATE INDEX IF NOT EXISTS idx_lecture_progress_student_lecture_id
	ON "lecture_progress" (lecture_id, student);


-- lecture comment
CREATE INDEX IF NOT EXISTS idx_lecture_root_comment
    ON "lecture_comment" (lecture_id, created_at DESC, id DESC)
    WHERE depth = 0 AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lecture_nlevel_comment
    ON "lecture_comment" (parent_comment_id, created_at DESC, id DESC)
    WHERE depth > 0 AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_comment_root_active
    ON lecture_comment (root_comment_id)
    WHERE deleted_at IS NULL;


-- assignment
CREATE INDEX idx_active_assignment_lecture_created
    ON assignment (lecture_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_assignment_deleted_at
    ON assignment (deleted_at);


-- submission
CREATE INDEX IF NOT EXISTS idx_submission_assignment_id_student
	ON "assignment_submission" (assignment_id, student_username);

CREATE INDEX IF NOT EXISTS idx_submission_assignment_id_submitted_at
	ON "assignment_submission" (assignment_id, submitted_at DESC);


-- submission feedback
CREATE INDEX IF NOT EXISTS idx_feedback_submission_id_created_at
	ON "submission_feedback" (submission_id, created_at DESC);
