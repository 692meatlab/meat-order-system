# Order Management API 문서

> Base URL: `https://meat-order-system-production.up.railway.app`

## 인증

데이터 변경 API(POST/PUT/DELETE)는 API 키 인증이 필요합니다.

```
X-API-Key: your-api-key
```

환경변수 `API_KEY`가 설정되지 않은 경우 인증이 비활성화됩니다.

---

## 시스템

### GET /api/health
헬스체크

**응답:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-03-13T12:00:00"
}
```

### GET /api/init
초기 데이터 로드 (페이지 최초 로드 시 사용)

**응답:**
```json
{
  "users": [...],
  "parts": [...],
  "packaging": [...],
  "sku_products": [...],
  "vendor_mappings": [...],
  "calendar": {...}
}
```

---

## 사용자

### GET /api/users
사용자 목록

**응답:** `{ "users": [{ "id": 1, "name": "홍길동", "created_at": "..." }] }`

### POST /api/users
사용자 생성

**요청:** `{ "name": "홍길동" }`
**응답:** `201 { "user": { "id": 1, "name": "홍길동" } }`

### DELETE /api/users/:id
사용자 삭제

---

## SKU 상품

### GET /api/sku-products
SKU 상품 목록 (구성품 포함)

### POST /api/sku-products
SKU 상품 생성

**요청:**
```json
{
  "sku_name": "한우등심세트 1kg",
  "selling_price": 89000,
  "packaging_name": "선물포장",
  "compositions": [
    { "part_name": "등심", "weight": 500 },
    { "part_name": "안심", "weight": 500 }
  ]
}
```

### PUT /api/sku-products/:id
SKU 상품 수정

### DELETE /api/sku-products/:id
SKU 상품 삭제 (구성품도 CASCADE 삭제)

---

## 원가

### GET /api/parts-cost
부위별 원가 목록

### POST /api/parts-cost
부위별 원가 생성/수정

**요청:** `{ "part_name": "등심", "price_per_100g": 7800, "cost_type": "한우" }`

### DELETE /api/parts-cost/:id

### GET /api/packaging-cost
포장재 원가 목록

### POST /api/packaging-cost
포장재 원가 생성/수정

**요청:** `{ "packaging_name": "선물포장", "price": 5000 }`

### DELETE /api/packaging-cost/:id

---

## 거래처

### GET /api/vendor-mappings
거래처 매핑 목록

**파라미터:** `vendor_name` (선택)

### POST /api/vendor-mappings
거래처 매핑 생성

**요청:** `{ "vendor_name": "거래처", "product_code": "P001", "sku_product_id": 1 }`

### GET /api/vendor-templates
거래처 템플릿 목록

### POST /api/vendor-templates
거래처 템플릿 저장

### GET /api/vendor-mappings/suggest
유사 매핑 제안

**파라미터:** `q` (검색어, 필수), `vendor` (거래처명, 선택)

---

## 주문

### GET /api/orders
주문 목록

**파라미터:** `user_id`, `status`, `date_from`, `date_to`, `limit` (기본 500)

### POST /api/orders
주문 생성 (bulk)

**요청:**
```json
{
  "user_id": 1,
  "orders": [{
    "vendor_name": "거래처",
    "sku_name": "한우등심세트",
    "quantity": 5,
    "recipient": "김철수",
    "phone": "010-1234-5678",
    "address": "서울시 강남구",
    "release_date": "2026-03-15"
  }]
}
```
**응답:** `201 { "created_ids": [1], "count": 1 }`

### PUT /api/orders/:id
주문 수정

### POST /api/orders/bulk-update
주문 일괄 수정

**요청:** `{ "order_ids": [1,2,3], "updates": { "shipped": true } }`

### DELETE /api/orders/:id
주문 삭제

### POST /api/orders/bulk-delete
주문 일괄 삭제

---

## 통계/분석

### GET /api/orders/stats
주문 통계 (거래처별/월별/SKU별 집계)

### GET /api/orders/anomaly-stats
이상치 감지용 통계 (거래처+SKU별 평균/표준편차)

### POST /api/orders/check-duplicates
중복 주문 감지

**요청:** `{ "orders": [{ "recipient": "김철수", "sku_name": "...", "address": "..." }] }`

---

## 에러 응답

모든 에러는 다음 형식:
```json
{
  "error": "에러 메시지"
}
```

| 코드 | 설명 |
|------|------|
| 400 | 잘못된 요청 (필수 필드 누락 등) |
| 401 | 인증 실패 (API 키 없거나 잘못됨) |
| 503 | DB 연결 실패 |
| 500 | 서버 내부 오류 |
