ALTER TABLE payment_history
ADD COLUMN order_id UUID;

UPDATE payment_history
SET order_id = gen_random_uuid()
WHERE payment_history.order_id IS NULL;

ALTER TABLE payment_history
ALTER COLUMN order_id SET NOT NULL;