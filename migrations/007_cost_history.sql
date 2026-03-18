-- 007: 원가 변동 이력 테이블
-- 실행일: 2026-03-18

CREATE TABLE IF NOT EXISTS cost_history (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    item_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    old_price INTEGER,
    new_price INTEGER,
    grade VARCHAR(20),
    changed_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name) VALUES ('007', 'cost_history')
ON CONFLICT DO NOTHING;
