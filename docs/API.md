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

### PUT /api/users/:id
사용자 수정 (이름/역할)

**요청:** `{ "name": "홍길동", "role": "manager" }`
**역할:** `admin`, `manager`, `user`

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

### GET /api/cost-history
원가 변동 이력 조회

**파라미터:** `table_name` (parts_cost/packaging_cost), `item_id`, `date_from`, `date_to`

**응답:**
```json
{
  "history": [{
    "id": 1, "table_name": "parts_cost", "item_id": 5,
    "item_name": "등심", "old_price": 7000, "new_price": 7200,
    "grade": "1++", "changed_at": "2026-03-18T10:30:00"
  }]
}
```

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

**파라미터:** `user_id`, `status`, `date_from`, `date_to`, `limit` (기본 500), `search` (텍스트 검색), `shipped`, `paid`, `invoice_issued` (불린 필터), `vendors` (거래처 다중 선택)

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

### GET /api/orders/:id/history
주문 변경 이력

**응답:**
```json
{
  "history": [{
    "id": 1, "order_id": 100, "action": "update",
    "field_name": "shipped", "old_value": "false", "new_value": "true",
    "created_at": "2026-03-18T14:00:00"
  }]
}
```

### GET /api/orders/:id/comments
주문 코멘트 목록

**응답:** `{ "comments": [{ "id": 1, "user_name": "홍길동", "content": "...", "created_at": "..." }] }`

### POST /api/orders/:id/comments
주문 코멘트 추가

**요청:** `{ "user_name": "홍길동", "content": "배송 확인됨" }`

---

## 검색/필터

### GET /api/filter-presets
저장된 필터 프리셋 목록

**파라미터:** `user_id` (선택)

### POST /api/filter-presets
필터 프리셋 저장

**요청:** `{ "user_id": 1, "name": "미입금 필터", "preset_json": { "paid": false } }`

### DELETE /api/filter-presets/:id
필터 프리셋 삭제

---

## 통계/분석

### GET /api/orders/stats
주문 통계 (거래처별/월별/SKU별 집계)

### GET /api/orders/anomaly-stats
이상치 감지용 통계 (거래처+SKU별 평균/표준편차)

### POST /api/orders/check-duplicates
중복 주문 감지

**요청:** `{ "orders": [{ "recipient": "김철수", "sku_name": "...", "address": "..." }] }`

### GET /api/dashboard/vendor-report
거래처별 매출 리포트

**파라미터:** `date_from`, `date_to`, `vendor` (선택)

**응답:**
```json
{
  "vendor_summary": [{ "vendor_name": "거래처A", "order_count": 50, "total_qty": 200, "total_amount": 5000000, "shipped_count": 45, "paid_count": 40 }],
  "monthly_trend": [{ "month": "2026-03", "order_count": 50, "total_amount": 5000000 }],
  "sku_breakdown": [{ "sku_name": "한우등심세트", "order_count": 30, "total_qty": 120, "total_amount": 3000000 }]
}
```

---

## 업로드 이력

### GET /api/upload-history
엑셀 업로드 이력

**파라미터:** `user_id`, `date_from`, `date_to`

**응답:** `{ "history": [{ "id": 1, "filename": "주문서.xlsx", "row_count": 50, "matched_count": 48, "unmatched_count": 2, "vendor_name": "거래처A", "status": "completed", "created_at": "..." }] }`

### POST /api/upload-history
업로드 이력 기록

**요청:** `{ "user_id": 1, "filename": "주문서.xlsx", "row_count": 50, "matched_count": 48, "unmatched_count": 2, "vendor_name": "거래처A" }`

---

## 재고 관리

### GET /api/inventory
전체 재고 목록 (SKU명 JOIN)

**응답:** `{ "inventory": [{ "id": 1, "sku_product_id": 5, "sku_name": "한우등심세트", "current_stock": 120, "min_stock": 50 }] }`

### PUT /api/inventory/:sku_product_id
재고/최소재고 수정 (UPSERT)

**요청:** `{ "current_stock": 150, "min_stock": 60 }`

### POST /api/inventory/adjust
재고 수동 조정

**요청:** `{ "sku_product_id": 5, "change_qty": 20, "change_type": "manual", "note": "반품 처리" }`

**응답:** `{ "before_stock": 100, "after_stock": 120 }`

### GET /api/inventory/alerts
최소재고 이하 SKU 알림

---

## 알림 시스템

### GET /api/notifications
알림 목록

**파라미터:** `unread_only` (boolean)

**응답:** `{ "notifications": [{ "id": 1, "type": "unpaid", "title": "미입금 알림", "message": "...", "is_read": false, "created_at": "..." }], "unread_count": 5 }`

### POST /api/notifications/mark-read
알림 읽음 처리

**요청:** `{ "ids": [1, 2, 3] }` 또는 `{}` (전체 읽음)

### POST /api/notifications/generate
알림 자동 생성 (미입금 D+7, 미출고 D+3, 재고 부족)

**응답:** `{ "created": 3 }`

---

## 백업/복원

### GET /api/backup/export
전체 데이터 JSON 다운로드 (8개 테이블)

### POST /api/backup/import
JSON 데이터 복원

**파라미터:** `confirm=true` (없으면 미리보기만)

**미리보기 응답:** `{ "preview": { "users": 5, "orders": 100 } }`

**복원 응답:** `{ "success": true, "total_rows": 1250 }`

### GET /api/backup/log
백업/복원 이력

**응답:** `{ "logs": [{ "backup_type": "export", "table_count": 8, "total_rows": 1250, "created_at": "..." }] }`

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
