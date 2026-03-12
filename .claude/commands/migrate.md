# DB 마이그레이션 실행 절차

> Railway PostgreSQL 데이터베이스 마이그레이션을 안전하게 실행하는 절차입니다.
> **마이그레이션 전 반드시 백업을 수행하세요.**

---

## 전제 조건

```
□ DATABASE_URL 환경변수 설정 확인
□ Railway 프로젝트 접근 권한 확인
□ 마이그레이션 SQL 파일 검토 완료
□ 로컬 테스트 환경에서 먼저 테스트 완료
□ 영향받는 테이블 목록 파악
□ 롤백 계획 수립
```

---

## 1. 현재 DB 상태 확인

```python
import os, psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
load_dotenv()

with psycopg.connect(os.getenv('DATABASE_URL'), row_factory=dict_row) as conn:
    # 현재 테이블 목록
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    print("현재 테이블 목록:")
    for row in cur.fetchall():
        print(f"  {row['table_name']}: {row['size']}")
```

---

## 2. 마이그레이션 전 백업

```bash
# Railway PostgreSQL 백업 (pg_dump 사용)
# DATABASE_URL 형식: postgresql://user:pass@host:port/dbname

export DATABASE_URL=$(cat .env | grep DATABASE_URL | cut -d= -f2-)

# 백업 파일 생성 (날짜 포함)
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$DATABASE_URL" > "/c/Users/김민서/Desktop/Project/order-management/backups/$BACKUP_FILE"

echo "백업 완료: $BACKUP_FILE"
ls -lh "/c/Users/김민서/Desktop/Project/order-management/backups/$BACKUP_FILE"
```

---

## 3. 마이그레이션 SQL 파일 확인

```bash
# migrations 디렉토리 내 파일 목록 확인
ls -la /c/Users/김민서/Desktop/Project/order-management/migrations/

# 마이그레이션 파일 내용 확인 (실행 전 반드시 검토)
cat /c/Users/김민서/Desktop/Project/order-management/migrations/001_initial.sql
cat /c/Users/김민서/Desktop/Project/order-management/migrations/002_update_schema.sql
```

---

## 4. 로컬 테스트 DB에서 먼저 테스트

```bash
# 로컬 PostgreSQL이 있는 경우 (로컬에서 먼저 검증)
export TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/order_test"

# 테스트 DB에 마이그레이션 적용
psql "$TEST_DATABASE_URL" -f migrations/001_initial.sql
psql "$TEST_DATABASE_URL" -f migrations/002_update_schema.sql

# 적용 결과 확인
psql "$TEST_DATABASE_URL" -c "\dt"
```

---

## 5. run_migration.py 실행

```bash
cd /c/Users/김민서/Desktop/Project/order-management

# 기존 마이그레이션 스크립트 실행
python run_migration.py

# 실행 결과 확인
echo "마이그레이션 결과: $?"
```

---

## 6. Railway DB에 마이그레이션 적용

```bash
# 환경변수 로드
source .env 2>/dev/null || export $(cat .env | xargs)

# 특정 마이그레이션 파일 적용
psql "$DATABASE_URL" -f migrations/002_update_schema.sql

# 또는 Python으로 적용
python -c "
import os, psycopg
from dotenv import load_dotenv
load_dotenv()

with psycopg.connect(os.getenv('DATABASE_URL')) as conn:
    with open('migrations/002_update_schema.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    conn.execute(sql)
    print('마이그레이션 완료')
"
```

---

## 7. 마이그레이션 후 검증

```python
import os, psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
load_dotenv()

with psycopg.connect(os.getenv('DATABASE_URL'), row_factory=dict_row) as conn:
    cur = conn.cursor()

    # 테이블 구조 확인
    tables = ['users', 'sku_products', 'sku_compositions', 'vendor_mappings',
              'vendor_templates', 'orders', 'parts_cost', 'packaging_cost']

    print("=== 마이그레이션 후 테이블 상태 ===")
    for table in tables:
        try:
            cur.execute(f"SELECT COUNT(*) as cnt FROM {table}")
            count = cur.fetchone()['cnt']
            print(f"  {table}: {count}건 (정상)")
        except Exception as e:
            print(f"  {table}: 오류 - {e}")

    # 컬럼 구조 확인 (orders 테이블)
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'orders'
        ORDER BY ordinal_position
    """)
    print("\n=== orders 테이블 컬럼 ===")
    for col in cur.fetchall():
        print(f"  {col['column_name']}: {col['data_type']}")
```

---

## 8. 롤백 절차 (문제 발생 시)

```bash
# 백업 파일로 복원
BACKUP_FILE="backup_20240115_103000.sql"  # 실제 백업 파일명으로 변경

# 기존 테이블 삭제 후 복원 (주의: 현재 데이터 손실)
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql "$DATABASE_URL" -f "backups/$BACKUP_FILE"

echo "롤백 완료"
```

---

## 마이그레이션 로그 기록

마이그레이션 실행 후 반드시 기록:

```bash
# 마이그레이션 실행 기록 (CLAUDE.md 또는 별도 파일)
echo "## 마이그레이션 기록" >> MIGRATION_LOG.md
echo "- 날짜: $(date '+%Y-%m-%d %H:%M')" >> MIGRATION_LOG.md
echo "- 파일: migrations/002_update_schema.sql" >> MIGRATION_LOG.md
echo "- 이유: [변경 이유 기술]" >> MIGRATION_LOG.md
echo "- 영향 테이블: [테이블 목록]" >> MIGRATION_LOG.md
echo "" >> MIGRATION_LOG.md
```

---

## 주의사항

- Railway DB 직접 수정은 **절대 금지** (마이그레이션 파일 통해서만 변경)
- 마이그레이션 전 **반드시 백업** 수행
- 프로덕션 DB는 **점검 시간(트래픽 적은 시간)에** 실행
- 마이그레이션 실패 시 즉시 롤백 진행
- 스키마 변경 시 **이전 버전 데이터 호환성** 반드시 확인
