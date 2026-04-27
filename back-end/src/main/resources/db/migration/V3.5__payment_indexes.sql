-- course discount
CREATE INDEX IF NOT EXISTS idx_course_discount_course_id_valid_from_valid_to
    ON course_discount (course_id, valid_from, valid_to);


-- cart item
CREATE INDEX IF NOT EXISTS idx_cart_item_type_item_id
    ON cart_item (username, item_type, item_id);


-- order item
CREATE INDEX IF NOT EXISTS idx_order_item_order_id
    ON order_item (order_id, item_type, item_id);


-- payment
CREATE INDEX IF NOT EXISTS idx_payment_username_time_cursor
    ON payment (username, created_at DESC, id DESC);


-- enrollment
CREATE INDEX IF NOT EXISTS idx_enrollment_course_id
    ON enrollment (course_id);

CREATE INDEX IF NOT EXISTS idx_enrollment_username_time_cursor
    ON enrollment (username, course_id, enrolled_at DESC, id DESC);