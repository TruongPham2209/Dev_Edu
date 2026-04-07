-- Note:
-- 1) PRIMARY KEY and UNIQUE constraints in V1 already create indexes automatically.
-- 2) This file adds indexes mainly for foreign keys, sorting, and soft-delete filters.

CREATE INDEX idx_auth_user_id ON auth_provider(user_id);

-- forum
CREATE INDEX IF NOT EXISTS idx_forum_post_author_id ON "forum_post" (author_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_updated_at ON "forum_post" (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_post_active_created_at
	ON "forum_post" (created_at DESC)
	WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_forum_post_history_post_id_updated_at
	ON "forum_post_history" (post_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_comment_post_id_created_at
	ON "forum_comment" (post_id, created_at ASC);

-- course
CREATE INDEX IF NOT EXISTS idx_course_category_id ON "course" (category_id);
CREATE INDEX IF NOT EXISTS idx_course_created_by ON "course" (created_by);
CREATE INDEX IF NOT EXISTS idx_course_active_created_at
	ON "course" (created_at DESC)
	WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_course_lecturer_lecturer_id ON "course_lecturer" (lecturer_id);

CREATE INDEX IF NOT EXISTS idx_course_payment_student_id_payment_date
	ON "course_payment" (student_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_enrollment_student_id ON "enrollment" (student_id);

-- lecture
CREATE INDEX IF NOT EXISTS idx_lecture_course_id_order ON "lecture" (course_id, lecture_order ASC);
CREATE INDEX IF NOT EXISTS idx_lecture_active_uploaded_at
	ON "lecture" (uploaded_at DESC)
	WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lecture_material_lecture_id ON "lecture_material" (lecture_id);
CREATE INDEX IF NOT EXISTS idx_lecture_material_active_uploaded_at
	ON "lecture_material" (uploaded_at DESC)
	WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lecture_progress_student_id_lecture_id
	ON "lecture_progress" (student_id, lecture_id);

CREATE INDEX IF NOT EXISTS idx_lecture_comment_lecture_id_created_at
	ON "lecture_comment" (lecture_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_lecture_comment_parent_comment_id
	ON "lecture_comment" (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_lecture_comment_student_id
	ON "lecture_comment" (student_id);

-- assignment
CREATE INDEX IF NOT EXISTS idx_assignment_lecture_id ON "assignment" (lecture_id);
CREATE INDEX IF NOT EXISTS idx_assignment_active_created_at
	ON "assignment" (created_at DESC)
	WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assignment_submission_student_id_submitted_at
	ON "assignment_submission" (student_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_submission_feedback_submission_id_created_at
	ON "submission_feedback" (submission_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submission_tracking_submission_id_updated_at
	ON "submission_tracking" (submission_id, updated_at DESC);

-- livestream
CREATE INDEX IF NOT EXISTS idx_livestream_course_id_start_time
	ON "livestream" (course_id, start_time DESC);
