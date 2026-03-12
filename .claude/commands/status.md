# 시스템 상태 확인 절차

> Order Management 시스템의 전체 상태를 점검하는 절차입니다.
> Flask 백엔드, Railway PostgreSQL, Vercel 프론트엔드 상태를 종합 확인합니다.

---

## 1. Flask 앱 헬스체크

```bash
# 로컬 서버 헬스체크
curl -s http://localhost:5000/api/health

# 프로덕션(Vercel) 헬스체크
curl -s https://[your-vercel-domain]/api/health

# 응답 예시
# {"status": "ok", "db": "connected", "timestamp": "2024-01-15T10:30:00"}
```

---

## 2. 데이터베이스 연결 상태

```bash
# 환경변수 확인
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
db_url = os.getenv('DATABASE_URL', '미설정')
if db_url != '미설정':
    # URL에서 비밀번호 마스킹
    parts = db_url.split('@')
    print('DB URL:', parts[-1] if len(parts) > 1 else '설정됨')
else:
    print('DATABASE_URL 미설정!')
"

# DB 연결 테스트
python -c "
import os
import psycopg
from dotenv import load_dotenv
load_dotenv()

try:
    conn = psycopg.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    cur.execute('SELECT version()')
    print('DB 연결 성공:', cur.fetchone())
    cur.execute('SELECT COUNT(*) FROM orders')
    print('주문 건수:', cur.fetchone()[0])
    conn.close()
except Exception as e:
    print('DB 연결 실패:', e)
"
```

---

## 3. 주요 테이블 상태 확인

```python
import os, psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
load_dotenv()

with psycopg.connect(os.getenv('DATABASE_URL'), row_factory=dict_row) as conn:
    tables = ['users', 'sku_products', 'vendor_mappings', 'vendor_templates', 'orders', 'parts_cost', 'packaging_cost']
    for t in tables:
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) as cnt FROM {t}")
        count = cur.fetchone()['cnt']
        print(f"{t}: {count}건")
```

---

## 4. Flask 앱 프로세스 확인

```bash
# 실행 중인 Flask 프로세스 확인 (Windows)
tasklist | findstr python

# 포트 사용 확인 (Windows)
netstat -ano | findstr :5000

# Flask 앱 직접 실행
cd /c/Users/김민서/Desktop/Project/order-management
python app.py
```

---

## 5. 의존성 패키지 상태

```bash
# requirements.txt 기반 패키지 설치 확인
pip list | grep -E "flask|psycopg|openpyxl|gunicorn|python-dotenv"

# 현재 설치된 버전 vs requirements.txt 비교
pip freeze > current_packages.txt
diff requirements.txt current_packages.txt
```

---

## 6. Vercel 배포 상태

```bash
# Vercel CLI 상태 확인 (Vercel CLI 설치 필요)
vercel ls

# 최근 배포 로그
vercel logs

# 현재 배포 URL 확인
cat vercel.json
```

---

## 7. 환경변수 점검

```bash
# .env 파일 존재 여부 확인 (내용 출력 금지)
ls -la /c/Users/김민서/Desktop/Project/order-management/.env

# 필수 환경변수 설정 여부 확인
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
required = ['DATABASE_URL', 'SECRET_KEY']
for key in required:
    val = os.getenv(key)
    status = '설정됨' if val else '미설정!'
    print(f'{key}: {status}')
"
```

---

## 8. API 엔드포인트 일괄 점검

```bash
BASE_URL="http://localhost:5000"

echo "=== API 엔드포인트 점검 ==="
endpoints=(
    "/api/health"
    "/api/users"
    "/api/sku-products"
    "/api/vendors"
    "/api/vendor-mappings"
    "/api/orders"
)

for ep in "${endpoints[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ep")
    echo "$ep: HTTP $status"
done
```

---

## 상태 기준

| 상태 | 기준 |
|------|------|
| 정상 | 모든 API 200 응답, DB 연결 성공 |
| 주의 | 일부 엔드포인트 응답 지연 (2초 이상) |
| 위험 | DB 연결 실패 또는 메인 API 오류 |
