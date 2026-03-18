-- 015: 수익성 분석용 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_sku_vendor ON orders(sku_name, vendor_name);
CREATE INDEX IF NOT EXISTS idx_sku_compositions_sku ON sku_compositions(sku_product_id);
