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