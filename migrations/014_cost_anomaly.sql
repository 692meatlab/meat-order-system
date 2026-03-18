-- 014: 원가 이상 감지
-- cost_history 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_cost_history_lookup
    ON cost_history(table_name, item_id, changed_at DESC);

-- 이상 감지 로그
CREATE TABLE IF NOT EXISTS cost_anomaly_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    item_id INTEGER NOT NULL,
    item_name VARCHAR(100),
    old_price INTEGER,
    new_price INTEGER,
    change_pct NUMERIC(10,2),
    z_score NUMERIC(10,4),
    severity VARCHAR(10) DEFAULT 'warning',
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
