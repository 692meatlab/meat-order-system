-- 006: 검색 강화 - 텍스트 검색 인덱스 및 필터 프리셋 테이블
-- 실행일: 2026-03-18

-- pg_trgm 확장 (텍스트 유사도 검색)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 텍스트 검색용 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_recipient_trgm ON orders USING gin (recipient gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_address_trgm ON orders USING gin (address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_sku_name_trgm ON orders USING gin (sku_name gin_trgm_ops);

-- 필터 프리셋 테이블
CREATE TABLE IF NOT EXISTS filter_presets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    preset_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 마이그레이션 기록
INSERT INTO schema_migrations (version, name) VALUES ('006', 'search_enhancement')
ON CONFLICT DO NOTHING;
