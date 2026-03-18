-- 017: 스마트 중복 감지
-- 정규화 컬럼 (검색 가속)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS normalized_recipient VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS normalized_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS normalized_address VARCHAR(500);

-- 중복 제외 목록 (의도적 중복 허용)
CREATE TABLE IF NOT EXISTS duplicate_exclusions (
    id SERIAL PRIMARY KEY,
    order_id_1 INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    order_id_2 INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_norm_recipient ON orders(normalized_recipient);
CREATE INDEX IF NOT EXISTS idx_orders_norm_phone ON orders(normalized_phone);
