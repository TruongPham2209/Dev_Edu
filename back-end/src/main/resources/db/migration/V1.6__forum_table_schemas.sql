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
    post_id                 UUID NOT NULL,
    saved_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP,

    root_comment_id         UUID,
    replied_to_comment_id   UUID,

    depth                   INT NOT NULL -- 0 for top-level comment, 1 for reply (max depth 1 for forum comments)
);