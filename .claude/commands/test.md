# 테스트 실행 절차

> Order Management 시스템의 전체 기능을 테스트하는 절차입니다.
> **배포 전 반드시 모든 테스트를 통과해야 합니다.**

---

## 1. 테스트 환경 준비

```bash
cd /c/Users/김민서/Desktop/Project/order-management

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 의존성 설치 확인
pip install -r requirements.txt

# 테스트용 환경변수 설정 (로컬 DB 또는 테스트 DB)
cp .env.example .env.test
# .env.test에 테스트 DATABASE_URL 설정
```

---

## 2. Flask 앱 실행

```bash
# 로컬 Flask 서버 실행
export FLASK_ENV=development
python app.py &
FLASK_PID=$!

# 서버 시작 대기
sleep 3
echo "Flask 서버 PID: $FLASK_PID"
```

---

## 3. API 단위 테스트

```bash
# 헬스체크
echo "=== 헬스체크 ==="
curl -s http://localhost:5000/api/health

# 사용자 API
echo "=== 사용자 API ==="
curl -s http://localhost:5000/api/users
curl -s -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "테스트유저"}'

# SKU 상품 API
echo "=== SKU 상품 API ==="
curl -s http://localhost:5000/api/sku-products

# 거래처 API
echo "=== 거래처 API ==="
curl -s http://localhost:5000/api/vendors
curl -s http://localhost:5000/api/vendor-mappings

# 주문 API
echo "=== 주문 API ==="
curl -s http://localhost:5000/api/orders
```

---

## 4. 기존 test_api.py 실행

```bash
cd /c/Users/김민서/Desktop/Project/order-management

# 기존 API 테스트 파일 실행
python test_api.py

# 테스트 결과 확인
echo "Exit code: $?"
```

---

## 5. 발주서 변환 기능 테스트

```bash
# 엑셀 파일 업로드 테스트 (테스트용 엑셀 파일 필요)
# 테스트 엑셀 파일 생성
python -c "
import openpyxl
wb = openpyxl.Workbook()
ws = wb.active
ws['A1'] = '상품명'
ws['B1'] = '수량'
ws['C1'] = '단가'
ws['A2'] = '테스트상품'
ws['B2'] = 10
ws['C2'] = 5000
wb.save('/tmp/test_order.xlsx')
print('테스트 엑셀 파일 생성 완료')
"

# 엑셀 업로드 API 테스트
curl -s -X POST http://localhost:5000/api/upload-excel \
  -F "file=@/tmp/test_order.xlsx" \
  -F "vendor=테스트거래처" | python -m json.tool
```

---

## 6. 주문 CRUD 테스트

```bash
# 주문 생성 테스트
ORDER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '[{
    "sku_code": "TEST-001",
    "product_name": "테스트상품",
    "quantity": 5,
    "unit_price": 10000,
    "vendor": "테스트거래처"
  }]')
echo "주문 생성: $ORDER_RESPONSE"

# 주문 수정 테스트 (ID 추출 후)
ORDER_ID=$(echo $ORDER_RESPONSE | python -c "import json,sys; data=json.load(sys.stdin); print(data[0].get('id', ''))" 2>/dev/null)
if [ ! -z "$ORDER_ID" ]; then
  curl -s -X PUT http://localhost:5000/api/orders/$ORDER_ID \
    -H "Content-Type: application/json" \
    -d '{"delivery_status": "배송완료"}' | python -m json.tool
fi
```

---

## 7. 프론트엔드 기능 테스트 체크리스트

브라우저에서 `http://localhost:5000` 접속 후 수동 확인:

```
□ 메인 페이지 로딩 정상
□ 엑셀 파일 드래그&드롭 업로드 동작
□ 발주처 선택 후 변환 동작
□ SKU 자동 매칭 결과 표시
□ 변환완료 목록 표시
□ 변환확정 이동 동작
□ 일괄 편집 기능 동작
□ 엑셀 다운로드 동작
□ 주문 목록 조회 정상
□ 배송/입금/세금계산서 상태 변경
□ 필터링 동작
□ 집계 계산 정확성
```

---

## 8. 테스트 데이터 정리

```bash
# 테스트로 생성된 데이터 정리 (테스트 DB 사용 권장)
python -c "
import os, psycopg
from dotenv import load_dotenv
load_dotenv()
# 주의: 프로덕션 DB에서는 실행하지 않을 것
db_url = os.getenv('DATABASE_URL', '')
if 'test' in db_url or 'local' in db_url:
    with psycopg.connect(db_url) as conn:
        conn.execute(\"DELETE FROM orders WHERE vendor = '테스트거래처'\")
        conn.execute(\"DELETE FROM users WHERE name = '테스트유저'\")
        print('테스트 데이터 정리 완료')
else:
    print('경고: 프로덕션 DB에서는 정리하지 않습니다.')
"

# Flask 서버 종료
kill $FLASK_PID 2>/dev/null
```

---

## 9. 테스트 통과 기준

| 항목 | 기준 |
|------|------|
| 헬스체크 | HTTP 200, DB connected |
| 사용자 API | CRUD 정상 동작 |
| SKU 상품 API | 조회/생성/수정/삭제 정상 |
| 주문 API | bulk 생성, 수정, 삭제 정상 |
| 엑셀 업로드 | 파싱 성공, SKU 매칭 동작 |
| 프론트엔드 | 핵심 기능 수동 확인 완료 |

**모든 항목 통과 시에만 배포 진행**
