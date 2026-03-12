# 주문 현황 확인 절차

> 발주서 변환 및 송장 등록 시스템의 주문 현황을 종합적으로 확인하는 절차입니다.

---

## 1. 서비스 가동 확인

```bash
# 로컬 Flask 서버 실행 여부 확인
curl -s http://localhost:5000/api/health

# 응답 예시
# {"status": "ok", "db": "connected"}
```

---

## 2. 주문 목록 조회

```bash
# 전체 주문 목록
curl -s http://localhost:5000/api/orders | python -m json.tool

# 특정 거래처 주문 필터링
curl -s "http://localhost:5000/api/orders?vendor=거래처명" | python -m json.tool

# 날짜 범위 필터링
curl -s "http://localhost:5000/api/orders?start=2024-01-01&end=2024-12-31" | python -m json.tool
```

---

## 3. 주문 상태별 집계

```bash
# 배송 상태 확인
curl -s http://localhost:5000/api/orders | python -c "
import json, sys
orders = json.load(sys.stdin)
delivery = {}
for o in orders:
    status = o.get('delivery_status', '미처리')
    delivery[status] = delivery.get(status, 0) + 1
print('배송 상태:', delivery)
"

# 입금 상태 확인
curl -s http://localhost:5000/api/orders | python -c "
import json, sys
orders = json.load(sys.stdin)
payment = {}
for o in orders:
    status = o.get('payment_status', '미입금')
    payment[status] = payment.get(status, 0) + 1
print('입금 상태:', payment)
"
```

---

## 4. SKU 상품 재고 현황

```bash
# SKU 상품 목록 확인
curl -s http://localhost:5000/api/sku-products | python -m json.tool

# 거래처 매핑 상태
curl -s http://localhost:5000/api/vendor-mappings | python -m json.tool
```

---

## 5. 발주서 변환 현황 확인

```bash
# 변환 대기 중인 발주서 확인 (Flask 앱 내 상태)
curl -s "http://localhost:5000/api/orders?status=pending" | python -m json.tool

# 변환 완료된 발주서 확인
curl -s "http://localhost:5000/api/orders?status=converted" | python -m json.tool

# 송장 등록 완료 확인
curl -s "http://localhost:5000/api/orders?status=registered" | python -m json.tool
```

---

## 6. 데이터베이스 직접 조회 (주의: 읽기 전용)

```python
# python으로 DB 직접 조회 (읽기 전용)
import os
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv('DATABASE_URL')
with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        # 오늘 주문 건수
        cur.execute("SELECT COUNT(*) as cnt FROM orders WHERE created_at::date = CURRENT_DATE")
        print("오늘 주문:", cur.fetchone())

        # 처리 대기 주문
        cur.execute("SELECT COUNT(*) as cnt FROM orders WHERE delivery_status IS NULL OR delivery_status = '미배송'")
        print("미배송 주문:", cur.fetchone())
```

---

## 7. 주문 수정 시 필수 기록

주문 데이터를 직접 수정하는 경우 **반드시 이유를 기록**해야 합니다:

```bash
# 수정 전 반드시 이유를 코드 주석 또는 커밋 메시지에 기록
# 예: "2024-01-15 홍길동 주문 수정 - 거래처 요청으로 수량 변경 (10kg → 15kg)"
git commit -m "fix: 홍길동 주문 수량 수정 - 거래처 직접 요청"
```

---

## 주의사항

- 주문 데이터 **직접 수정 시 반드시 이유를 커밋 메시지에 기록**
- DB 직접 UPDATE/DELETE는 **반드시 트랜잭션** 사용 후 확인
- 생산 데이터는 **백업 후** 수정 진행
