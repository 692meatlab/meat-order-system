-- 008: 엑셀 업로드 이력 테이블
-- 실행일: 2026-03-18

CREATE TABLE IF NOT EXISTS upload_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(500) NOT NULL,
    file_size INTEGER DEFAULT 0,
    row_count INTEGER DEFAULT 0,
    matched_count INTEGER DEFAULT 0,
    unmatched_count INTEGER DEFAULT 0,
    vendor_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name) VALUES ('008', 'upload_history')
ON CONFLICT DO NOTHING;
