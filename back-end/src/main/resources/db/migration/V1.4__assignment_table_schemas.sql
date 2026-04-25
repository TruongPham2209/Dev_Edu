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