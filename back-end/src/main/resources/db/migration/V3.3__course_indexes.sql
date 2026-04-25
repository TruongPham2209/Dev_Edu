-- category
CREATE INDEX IF NOT EXISTS idx_category_deleted
    ON      category (deleted_at);


-- course
CREATE INDEX idx_course_title_active
    ON      course
    USING   gin (unaccent(title) gin_trgm_ops)
    WHERE   deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_course_active_category_id_cursor
    ON      course (category_id, created_at DESC, id DESC)
    WHERE   deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_course_active_cursor
    ON      course (created_at DESC, id DESC)
    WHERE   deleted_at IS NULL;


-- course lecturer
CREATE INDEX IF NOT EXISTS idx_course_lecturer_course_id
    ON "course_lecturer" (course_id);


-- course review
CREATE INDEX IF NOT EXISTS idx_course_review_course_id
    ON "course_review" (course_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_course_review_owner_course_id
    ON "course_review" (student_username, course_id, created_at DESC);