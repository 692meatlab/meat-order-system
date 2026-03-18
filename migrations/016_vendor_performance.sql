-- 016: 거래처 성과 분석용 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_vendor_dates ON orders(vendor_name, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status ON orders(vendor_name, shipped, paid, invoice_issued);
