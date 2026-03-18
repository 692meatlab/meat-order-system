-- 018: 수요 예측
-- 예측 캐시 (계산 비용 절감)
CREATE TABLE IF NOT EXISTS forecast_cache (
    id SERIAL PRIMARY KEY,
    sku_name VARCHAR(200) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_qty NUMERIC(10,2),
    confidence_low NUMERIC(10,2),
    confidence_high NUMERIC(10,2),
    calculated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sku_name, forecast_date)
);

-- 예측 정확도 로그
CREATE TABLE IF NOT EXISTS forecast_accuracy_log (
    id SERIAL PRIMARY KEY,
    sku_name VARCHAR(200),
    forecast_date DATE,
    predicted_qty NUMERIC(10,2),
    actual_qty INTEGER,
    error_pct NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_cache_lookup ON forecast_cache(sku_name, forecast_date);
CREATE INDEX IF NOT EXISTS idx_orders_sku_date ON orders(sku_name, order_date);
