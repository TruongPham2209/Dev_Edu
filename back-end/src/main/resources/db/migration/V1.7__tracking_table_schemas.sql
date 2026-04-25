CREATE TABLE IF NOT EXISTS "submission_tracking" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id           UUID NOT NULL,
    actor                   VARCHAR(255) NOT NULL,
    status                  VARCHAR(50) NOT NULL,
    details                 TEXT,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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