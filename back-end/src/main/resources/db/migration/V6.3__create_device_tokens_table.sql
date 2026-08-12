-- =====================================================================
-- BẢNG THIẾT BỊ / FCM TOKEN (device_tokens)
-- =====================================================================
CREATE TABLE IF NOT EXISTS device_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(100) NOT NULL,
    fcm_token     TEXT NOT NULL,
    device_type   VARCHAR(20) NOT NULL DEFAULT 'web',
    user_agent    TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at  TIMESTAMPTZ DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_fcm_token UNIQUE (fcm_token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_username_active
    ON device_tokens (username) WHERE is_active = TRUE;
