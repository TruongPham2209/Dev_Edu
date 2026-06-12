ALTER TABLE order_item
ADD COLUMN original_price DECIMAL(10, 2);

ALTER TABLE order_item
RENAME COLUMN price TO discounted_price;

UPDATE order_item
SET original_price = discounted_price
WHERE order_item.original_price IS NULL;

ALTER TABLE order_item
ALTER COLUMN original_price SET NOT NULL;