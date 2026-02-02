-- Order Management - 초기 테이블 생성
-- Railway PostgreSQL에서 실행

-- 기존 테이블 삭제 (순서 중요 - 외래키 참조 역순)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS vendor_mappings CASCADE;
DROP TABLE IF EXISTS vendor_templates CASCADE;
DROP TABLE IF EXISTS sku_compositions CASCADE;
DROP TABLE IF EXISTS sku_products CASCADE;
DROP TABLE IF EXISTS packaging_cost CASCADE;
DROP TABLE IF EXISTS parts_cost CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 사용자 테이블
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 부위별 원가 (100g당)
-- ============================================================
CREATE TABLE parts_cost (
    id SERIAL PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL UNIQUE,
    price_per_100g INTEGER DEFAULT 0,
    cost_type VARCHAR(20) DEFAULT 'weight',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 포장재 원가
-- ============================================================
CREATE TABLE packaging_cost (
    id SERIAL PRIMARY KEY,
    packaging_name VARCHAR(100) NOT NULL UNIQUE,
    price INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SKU 상품
-- ============================================================
CREATE TABLE sku_products (
    id SERIAL PRIMARY KEY,
    sku_name VARCHAR(200) NOT NULL,
    packaging VARCHAR(100),
    selling_price INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SKU 상품 구성품 (부위 조합)
-- ============================================================
CREATE TABLE sku_compositions (
    id SERIAL PRIMARY KEY,
    sku_product_id INTEGER REFERENCES sku_products(id) ON DELETE CASCADE,
    part_name VARCHAR(100) NOT NULL,
    weight INTEGER DEFAULT 0,
    composition_type VARCHAR(20) DEFAULT 'weight',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 거래처 매핑
-- ============================================================
CREATE TABLE vendor_mappings (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    product_code VARCHAR(100),
    product_name VARCHAR(200),
    sku_product_id INTEGER REFERENCES sku_products(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 거래처 엑셀 템플릿
-- ============================================================
CREATE TABLE vendor_templates (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL UNIQUE,
    template_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 주문
-- ============================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    order_date DATE,
    vendor_name VARCHAR(100),
    product_name VARCHAR(200),
    sku_name VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    recipient VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    memo TEXT,
    order_no VARCHAR(100),
    sender_name VARCHAR(100),
    sender_phone VARCHAR(50),
    sender_address TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    invoice_no VARCHAR(100),
    shipped BOOLEAN DEFAULT FALSE,
    paid BOOLEAN DEFAULT FALSE,
    invoice_issued BOOLEAN DEFAULT FALSE,
    release_date DATE,
    b_type_downloaded BOOLEAN DEFAULT FALSE,
    shipped_at TIMESTAMP,
    paid_at TIMESTAMP,
    invoice_issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_release_date ON orders(release_date);
CREATE INDEX idx_orders_vendor ON orders(vendor_name);
CREATE INDEX idx_orders_shipped ON orders(shipped);
CREATE INDEX idx_orders_paid ON orders(paid);
CREATE INDEX idx_vendor_mappings_vendor ON vendor_mappings(vendor_name);
CREATE INDEX idx_sku_products_name ON sku_products(sku_name);
CREATE INDEX idx_sku_compositions_sku ON sku_compositions(sku_product_id);

-- ============================================================
-- 코멘트
-- ============================================================
COMMENT ON TABLE users IS '발주서 변환 사용자 (담당자)';
COMMENT ON TABLE parts_cost IS '부위별 원가 (100g당)';
COMMENT ON TABLE packaging_cost IS '포장재 비용';
COMMENT ON TABLE sku_products IS 'SKU 상품 마스터';
COMMENT ON TABLE sku_compositions IS 'SKU 상품 구성품 (부위 조합)';
COMMENT ON TABLE vendor_mappings IS '거래처별 상품명 → SKU 매핑';
COMMENT ON TABLE vendor_templates IS '거래처별 엑셀 템플릿 설정';
COMMENT ON TABLE orders IS '주문 데이터';
