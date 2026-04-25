CREATE TABLE IF NOT EXISTS "lecture" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id               UUID NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    summary                 VARCHAR(255),
    content                 TEXT,
    video_object_key        VARCHAR(255),
    duration                INT, -- Duration in seconds
    lecture_order           INT NOT NULL,
    created_by              VARCHAR(255) NOT NULL,
    deleted_at              TIMESTAMP,
    uploaded_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "lecture_material" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id              UUID NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    file_object_key         VARCHAR(255) NOT NULL,
    file_type               VARCHAR(50) NOT NULL,
    file_original_name      VARCHAR(255) NOT NULL,
    uploaded_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "lecture_progress" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id              UUID NOT NULL,
    student                 VARCHAR(255) NOT NULL,
    completed_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "lecture_comment" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id              UUID NOT NULL,
    username                VARCHAR(255) NOT NULL,
    content                 TEXT NOT NULL,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP,

    root_comment_id         UUID, -- depth 0 comment
    parent_comment_id       UUID, -- The parent depth
    reply_to_comment_id     UUID, -- For depth 2 comments, this points to the parent comment; for depth 1 comments, this is null

    depth                   INT NOT NULL -- 0 for top-level comment, 1 for reply, 2 for reply to reply (max depth 2)
);