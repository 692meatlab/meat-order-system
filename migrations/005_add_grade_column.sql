-- 부위별 원가에 등급 컬럼 추가
ALTER TABLE parts_cost ADD COLUMN IF NOT EXISTS grade VARCHAR(20);

-- 기존 데이터에 기본 등급 설정
UPDATE parts_cost SET grade = '1++' WHERE grade IS NULL;

-- 마이그레이션 기록
INSERT INTO schema_migrations (version, description) VALUES
    ('005', '부위별 원가 등급 컬럼 추가')
ON CONFLICT (version) DO NOTHING;
