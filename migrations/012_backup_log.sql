-- 012: 백업 로그 테이블
-- 실행일: 2026-03-18

CREATE TABLE IF NOT EXISTS backup_log (
    id SERIAL PRIMARY KEY,
    backup_type VARCHAR(20) NOT NULL,
    table_count INTEGER DEFAULT 0,
    total_rows INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name) VALUES ('012', 'backup_log')
ON CONFLICT DO NOTHING;
