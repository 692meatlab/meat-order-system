-- 마이그레이션 추적 테이블
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- 기존 마이그레이션 기록 (이미 적용된 것들)
INSERT INTO schema_migrations (version, description) VALUES
    ('001', '초기 테이블 생성')
ON CONFLICT (version) DO NOTHING;

INSERT INTO schema_migrations (version, description) VALUES
    ('002', '스키마 정규화')
ON CONFLICT (version) DO NOTHING;

INSERT INTO schema_migrations (version, description) VALUES
    ('003', '누락 컬럼 추가')
ON CONFLICT (version) DO NOTHING;

INSERT INTO schema_migrations (version, description) VALUES
    ('004', '마이그레이션 추적 + 스키마 수정')
ON CONFLICT (version) DO NOTHING;

-- 스키마 수정: sender_address와 sender_addr 중복 해결
-- sender_address가 001에서 생성, sender_addr가 003에서 추가됨
-- sender_addr로 통일 (app.py에서 sender_addr 사용)
-- 기존 sender_address 데이터를 sender_addr로 이전
UPDATE orders SET sender_addr = sender_address
WHERE sender_addr IS NULL AND sender_address IS NOT NULL;

-- 추가 인덱스 (통계 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_sku_name ON orders(sku_name);
CREATE INDEX IF NOT EXISTS idx_orders_recipient ON orders(recipient);
