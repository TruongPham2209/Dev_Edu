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
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    author_id       UUID NOT NULL,
    tags            VARCHAR(255)[],
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "forum_post_history" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "forum_comment" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id                 UUID NOT NULL,
    content                 TEXT NOT NULL,
    author_id               UUID NOT NULL,
    parent_comment_id       UUID,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "category" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    created_by      VARCHAR(255) NOT NULL,
    deleted_at      TIMESTAMP,
    description     VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "course" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category_id     UUID,
    price           DECIMAL(10, 2) NOT NULL,
    created_by      VARCHAR(255) NOT NULL,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "course_lecturer" (
    course_id       UUID NOT NULL,
    lecturer_id     UUID NOT NULL,
    PRIMARY KEY (course_id, lecturer_id)
);

CREATE TABLE IF NOT EXISTS "course_payment" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID NOT NULL,
    student_id          UUID NOT NULL,
    amount              DECIMAL(10, 2) NOT NULL,
    status              VARCHAR(50) NOT NULL,
    payment_method      VARCHAR(50) NOT NULL,
    transaction_id      VARCHAR(255) NOT NULL,
    payment_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, student_id)
);

CREATE TABLE IF NOT EXISTS "enrollment" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL,
    student_id      UUID NOT NULL,
    enrolled_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, student_id)
);

CREATE TABLE IF NOT EXISTS "lecture" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id               UUID NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    content                 TEXT,
    video_object_key        VARCHAR(255),
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
    student_id              UUID NOT NULL,
    completed_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "lecture_comment" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id              UUID NOT NULL,
    student_id              UUID NOT NULL,
    content                 TEXT NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_comment_id       UUID,
    deleted_at              TIMESTAMP
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
    student_id              UUID NOT NULL,
    file_object_key         VARCHAR(255) NOT NULL,
    submitted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS "submission_feedback" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id           UUID NOT NULL,
    lecturer_id             UUID NOT NULL,
    feedback                TEXT NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "submission_tracking" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id           UUID NOT NULL,
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