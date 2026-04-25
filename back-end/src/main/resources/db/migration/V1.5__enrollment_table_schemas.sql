CREATE TABLE IF NOT EXISTS "payment_history" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username            VARCHAR(255) NOT NULL,
    amount              DECIMAL(10, 2) NOT NULL,
    status              VARCHAR(50) NOT NULL,

    payment_method      VARCHAR(50) NOT NULL,
    transaction_id      VARCHAR(255) NOT NULL,
    payment_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "order" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(255) NOT NULL,
    total_amount        DECIMAL(10, 2) NOT NULL,
    status              VARCHAR(50) NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "order_item" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL,
    item_id             UUID NOT NULL, -- course_id for course purchase, or other entity ID for different types of transactions
    item_type           VARCHAR(50) NOT NULL, -- 'course', 'subscription', etc.
    price               DECIMAL(10, 2) NOT NULL,
    UNIQUE (order_id, item_id)
);

CREATE TABLE IF NOT EXISTS "cart_item" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(255) NOT NULL,
    item_id             UUID NOT NULL,
    item_type           VARCHAR(50) NOT NULL, -- 'course', 'subscription', etc.
    added_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username, course_id)
);

CREATE TABLE IF NOT EXISTS "enrollment" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID NOT NULL,
    student_username    VARCHAR(255) NOT NULL,
    payment_id          UUID NOT NULL,
    enrolled_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, student_id)
);