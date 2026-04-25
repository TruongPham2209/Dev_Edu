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

CREATE TABLE IF NOT EXISTS "course_review" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id               UUID NOT NULL,
    student_username        VARCHAR(255) NOT NULL,
    rating                  INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment                 TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, student_username) -- Ensure a student can only review a course once
);

CREATE TABLE IF NOT EXISTS "course_lecturer" (
    course_id           UUID NOT NULL,
    lecturer_username   VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, lecturer_username)
);

CREATE TABLE IF NOT EXISTS "course_discount" (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id                   UUID, -- If null, the coupon can be applied to any course; if not null, it can only be applied to the specified course

    description                 TEXT NOT NULL,
    discount_percentage         DECIMAL(10, 2) NOT NULL,

    valid_from                  TIMESTAMP NOT NULL,
    valid_to                    TIMESTAMP NOT NULL,

    created_by                  VARCHAR(255) NOT NULL,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);