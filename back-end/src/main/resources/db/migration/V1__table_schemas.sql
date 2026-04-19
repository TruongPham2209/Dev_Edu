CREATE TABLE IF NOT EXISTS "user" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username        VARCHAR(255) UNIQUE, # Null if using google login, first login must set username
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(255),
    password        VARCHAR(255), # Null if using google login

    email           VARCHAR(255) UNIQUE, # Null if using oauth login
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "auth_provider" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    provider            VARCHAR(50) NOT NULL, # 'google', 'facebook', etc.
    provider_user_id    VARCHAR(255) NOT NULL, # The user ID from the OAuth provider
    UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS "role" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    description     VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "user_role" (
    user_id         UUID NOT NULL,
    role_id         UUID NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS "forum_post" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author                  VARCHAR(100) NOT NULL,
    current_version_id      UUID,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "saved_post" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username                VARCHAR(100) NOT NULL,
    post_id         UUID NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username, post_id)
);

CREATE TABLE IF NOT EXISTS "forum_post_version" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id             UUID NOT NULL,
    version_number      INT NOT NULL,
    title               VARCHAR(255) NOT NULL,
    short_description   VARCHAR(255) NOT NULL,
    thumb_url           VARCHAR(255) NOT NULL,
    thumb_object_key    VARCHAR(255) NOT NULL,
    content             TEXT NOT NULL,
    status              VARCHAR(50) NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "forum_comment" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id                 UUID NOT NULL,
    content                 TEXT NOT NULL,
    author                  UUID NOT NULL,
    parent_comment_id       UUID,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "category" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL UNIQUE,
    thumbnail_object_key    VARCHAR(255) NOT NULL,
    thumbnail_url           TEXT NOT NULL,
    created_by              VARCHAR(255) NOT NULL,
    deleted_at              TIMESTAMP,
    description             VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "course" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                   VARCHAR(255) NOT NULL,
    thumbnail_url           TEXT NOT NULL,
    thumbnail_object_key    VARCHAR(255) NOT NULL,
    description             TEXT,
    category_id             UUID,
    price                   DECIMAL(10, 2) NOT NULL,
    created_by              VARCHAR(255) NOT NULL,
    deleted_at              TIMESTAMP,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "course_lecturer" (
    course_id           UUID NOT NULL,
    lecturer_username   VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, lecturer_username)
);

CREATE TABLE IF NOT EXISTS "payment_history" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(255) NOT NULL,
    amount              DECIMAL(10, 2) NOT NULL,
    status              VARCHAR(50) NOT NULL,
    payment_method      VARCHAR(50) NOT NULL,
    transaction_id      VARCHAR(255) NOT NULL,
    payment_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "enrollment" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID NOT NULL,
    student_username    VARCHAR(255) NOT NULL,
    payment_id          UUID NOT NULL,
    enrolled_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, student_id)
);

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

CREATE TABLE IF NOT EXISTS "assignment" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id              UUID NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "assignment_submission" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id           UUID NOT NULL,
    student_username        VARCHAR(255) NOT NULL,
    file_object_key         VARCHAR(255) NOT NULL,
    submitted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS "submission_feedback" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id           UUID NOT NULL,
    lecturer                VARCHAR(255) NOT NULL,
    feedback                TEXT NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "submission_tracking" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id           UUID NOT NULL,
    actor                   VARCHAR(255) NOT NULL,
    status                  VARCHAR(50) NOT NULL,
    details                 TEXT,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "livestream" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id               UUID NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    stream_url              TEXT,
    start_time              TIMESTAMP,
    end_time                TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "log_tracking" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username                VARCHAR(255) NOT NULL,
    aggregate_id            UUID NOT NULL,
    action                  VARCHAR(255) NOT NULL,
    details                 TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "log_cronjob" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL,
    detail                  TEXT NOT NULL,
    status                  VARCHAR(50) NOT NULL,
    error_message           TEXT,
    error_stacktrace        TEXT,
    started_at              TIMESTAMP NOT NULL,
    finished_at             TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "log_request" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username                VARCHAR(255) NOT NULL,
    method                  VARCHAR(10) NOT NULL,
    uri                     TEXT NOT NULL,
    request_body            TEXT,
    response_body           TEXT,
    timestamp               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "file_upload" (
    id              UUID PRIMARY KEY,
    object_key      VARCHAR(512) NOT NULL UNIQUE,

    file_name       VARCHAR(255),
    content_type    VARCHAR(100),
    file_size       BIGINT,

    status          VARCHAR(20) NOT NULL,

    created_by      VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    confirmed_at    TIMESTAMP,
    expired_at      TIMESTAMP,

    checksum        VARCHAR(128)
);