-- Order Management - 누락 컬럼 추가
-- orders 테이블에 발주서 변환 워크플로우에 필요한 컬럼 추가

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_no VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_file VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sender_addr TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_no VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_vendor_name ON orders(vendor_name);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_no ON orders(invoice_no);
