-- 010: 재고 관리 테이블
-- 실행일: 2026-03-18

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    sku_product_id INTEGER REFERENCES sku_products(id) ON DELETE CASCADE UNIQUE,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_log (
    id SERIAL PRIMARY KEY,
    sku_product_id INTEGER REFERENCES sku_products(id) ON DELETE CASCADE,
    change_type VARCHAR(20) NOT NULL,
    change_qty INTEGER NOT NULL,
    before_stock INTEGER,
    after_stock INTEGER,
    reference_id INTEGER,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name) VALUES ('010', 'inventory')
ON CONFLICT DO NOTHING;
