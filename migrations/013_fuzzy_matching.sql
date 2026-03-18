-- 013: 퍼지 SKU 매칭
-- 매칭 별칭 테이블 (사용자가 등록한 대체명)
CREATE TABLE IF NOT EXISTS matching_aliases (
    id SERIAL PRIMARY KEY,
    sku_product_id INTEGER REFERENCES sku_products(id) ON DELETE CASCADE,
    alias_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_matching_aliases_name ON matching_aliases(alias_name);

-- 정규화된 이름 컬럼 (검색 가속)
ALTER TABLE vendor_mappings ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(200);
ALTER TABLE sku_products ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(200);
