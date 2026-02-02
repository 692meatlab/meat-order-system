-- Order Management - 스키마 업데이트
-- 기존 테이블에 필요한 컬럼 추가

-- users 테이블에 role 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- parts_cost 테이블 컬럼명 변경 및 추가
ALTER TABLE parts_cost RENAME COLUMN name TO part_name;
ALTER TABLE parts_cost RENAME COLUMN cost_per_kg TO price_per_100g;
ALTER TABLE parts_cost ADD COLUMN IF NOT EXISTS cost_type VARCHAR(20) DEFAULT 'weight';

-- packaging_cost 테이블 컬럼명 변경
ALTER TABLE packaging_cost RENAME COLUMN name TO packaging_name;
ALTER TABLE packaging_cost RENAME COLUMN cost TO price;

-- sku_products 테이블 컬럼 변경
ALTER TABLE sku_products RENAME COLUMN name TO sku_name;
ALTER TABLE sku_products DROP COLUMN IF EXISTS packaging_id;
ALTER TABLE sku_products ADD COLUMN IF NOT EXISTS packaging VARCHAR(100);
ALTER TABLE sku_products RENAME COLUMN cost TO selling_price;

-- sku_compositions 테이블 수정
ALTER TABLE sku_compositions DROP COLUMN IF EXISTS parts_cost_id;
ALTER TABLE sku_compositions ADD COLUMN IF NOT EXISTS part_name VARCHAR(100);
ALTER TABLE sku_compositions RENAME COLUMN weight_grams TO weight;
ALTER TABLE sku_compositions ADD COLUMN IF NOT EXISTS composition_type VARCHAR(20) DEFAULT 'weight';

-- vendor_mappings 테이블 수정
ALTER TABLE vendor_mappings ADD COLUMN IF NOT EXISTS product_code VARCHAR(100);
ALTER TABLE vendor_mappings RENAME COLUMN vendor_product_name TO product_name;

-- orders 테이블에 추가 컬럼
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_issued BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b_type_downloaded BOOLEAN DEFAULT FALSE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_release_date ON orders(release_date);
CREATE INDEX IF NOT EXISTS idx_sku_products_name ON sku_products(sku_name);
