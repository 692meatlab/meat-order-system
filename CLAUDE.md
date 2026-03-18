# Order Management - Claude Code 설정

> 이 문서는 Claude Code가 프로젝트를 이해하고 작업하는 데 필요한 컨텍스트를 제공합니다.

---

## 프로젝트 개요

**Order Management**는 발주서 변환 및 송장 등록 시스템입니다.
엑셀 발주서를 업로드하면 자동으로 파싱하여 송장 등록까지 처리합니다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| 발주서 변환 | 엑셀 파일 업로드 → 자동 컬럼 매핑 → SKU 매칭 |
| 송장 등록 | 변환완료 → 변환확정 → 등록 워크플로우 |
| 전체주문관리 | 배송/입금/세금계산서 상태 관리, 텍스트 검색, 다중 필터, 프리셋 |
| SKU 상품관리 | 상품 등록, 원가 계산, 구성품 관리, 재고 현황 |
| 거래처별 매핑 | 거래처 상품명 → SKU 자동 매칭 |
| 원가 변동 이력 | 부위/포장재 가격 변경 시 자동 이력 기록, 추이 차트 |
| 주문 이력/코멘트 | 주문 필드 변경 감사 추적, 코멘트 기능 |
| 매출 리포트 | 거래처별/월별/SKU별 매출 집계, CSS 바 차트, 엑셀 다운로드 |
| 재고 관리 | SKU별 현재고/최소재고 관리, 수동 조정, 부족 알림 |
| 알림 시스템 | 미입금(D+7)/미출고(D+3)/재고부족 자동 알림, 벨 아이콘 |
| 업로드 이력 | 엑셀 업로드 파일명/행수/매칭율 추적 |
| 백업/복원 | 전체 데이터 JSON 내보내기/가져오기 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Python Flask |
| Database | Railway PostgreSQL (전용) |
| Frontend | Vanilla JS (ES6+) + Custom CSS |
| Excel | openpyxl (서버), SheetJS (클라이언트, 변환/다운로드) |
| CORS | flask-cors |
| 테스트 | pytest + pytest-cov |
| 배포 | Vercel |

---

## 파일 구조

```
order-management/
├── app.py                    # Flask 메인 앱 (API 엔드포인트, DB 연결)
├── config.py                 # Config 클래스 (환경변수 관리, 검증)
├── pytest.ini                # pytest 설정
├── requirements.txt          # Python 의존성
├── vercel.json               # Vercel 배포 설정
│
├── routes/
│   ├── orders.py             # 주문 CRUD, 검색/필터, 이력/코멘트
│   ├── sku.py                # SKU 상품, 부위/포장재 원가, 원가 이력
│   ├── vendors.py            # 거래처 매핑/템플릿
│   ├── users.py              # 사용자 관리, 역할 변경
│   ├── dashboard.py          # 대시보드, 매출 리포트
│   ├── uploads.py            # 엑셀 업로드 이력
│   ├── inventory.py          # 재고 관리
│   ├── notifications.py      # 알림 시스템
│   └── backup.py             # 백업/복원
│
├── services/
│   ├── __init__.py
│   └── excel_parser.py       # 엑셀 파싱 로직 (서버사이드)
│
├── templates/
│   └── index.html            # 메인 페이지 (SPA, 모달 포함)
│
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.es6.js        # 프론트엔드 로직 (소스, ~3800줄)
│       ├── app.js            # app.es6.js 복사본 (배포용)
│       ├── app.core.js       # 상수, 전역변수, 초기화, API 호출, 유틸리티
│       ├── app.ui.js         # UI 렌더링 (달력, 메뉴, 테이블, 모달)
│       ├── app.convert.js    # 발주서 변환 워크플로우
│       ├── app.orders.js     # 주문관리, 다운로드, SKU CRUD
│       └── app.features.js   # AI-Native Phase 1+2 기능
│
├── migrations/
│   ├── 001_initial.sql       # 테이블 생성 SQL
│   ├── 002_update_schema.sql # 스키마 업데이트
│   ├── 003_add_missing_columns.sql # 누락 컬럼 추가
│   ├── 004_migration_tracking_and_fixes.sql # 마이그레이션 추적
│   ├── 005_add_grade_column.sql    # 부위 등급
│   ├── 006_search_enhancement.sql  # 텍스트 검색 강화, 필터 프리셋
│   ├── 007_cost_history.sql        # 원가 변동 이력
│   ├── 008_upload_history.sql      # 업로드 이력
│   ├── 009_order_history.sql       # 주문 이력/코멘트
│   ├── 010_inventory.sql           # 재고 관리
│   ├── 011_notifications.sql       # 알림 시스템
│   └── 012_backup_log.sql          # 백업 이력
│
├── .claude/
│   ├── decisions.md          # 아키텍처 결정 기록
│   ├── rules/
│   │   └── ai-native.md      # AI 네이티브 규칙
│   └── commands/             # 슬래시 커맨드
│
├── tests/                    # pytest 테스트 스위트 (98개 테스트)
├── docs/
│   └── API.md                # 전체 API 문서
│
├── index.html                # 레거시 (Firebase 버전, 참조용)
├── CLAUDE.md                 # 이 파일
└── .env.example              # 환경변수 예시
```

---

## 데이터베이스

### Railway PostgreSQL (별도 프로젝트)

> ⚠️ jungmaein-pro, hyupshin-erp-agent와 별도의 Railway 프로젝트 사용

**테이블 구조:**

| 테이블 | 설명 |
|--------|------|
| users | 사용자 (발주 담당자, role 포함) |
| sku_products | SKU 상품 마스터 |
| sku_compositions | SKU 구성품 (부위 조합) |
| vendor_mappings | 거래처별 상품 매핑 |
| vendor_templates | 거래처별 엑셀 템플릿 |
| orders | 주문 데이터 |
| parts_cost | 부위별 원가 (grade 포함) |
| packaging_cost | 포장재 원가 |
| filter_presets | 검색 필터 프리셋 (JSONB) |
| cost_history | 원가 변동 이력 |
| upload_history | 엑셀 업로드 이력 |
| order_history | 주문 변경 감사 이력 |
| order_comments | 주문 코멘트 |
| inventory | SKU별 재고 (현재고/최소재고) |
| inventory_log | 재고 변동 로그 |
| notifications | 시스템 알림 |
| backup_log | 백업/복원 이력 |

---

## API 엔드포인트

### 사용자
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/users | 사용자 목록 |
| POST | /api/users | 사용자 생성 |
| PUT | /api/users/:id | 사용자 수정 (이름/역할) |
| DELETE | /api/users/:id | 사용자 삭제 |

### SKU 상품
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/sku-products | 상품 목록 |
| POST | /api/sku-products | 상품 생성 |
| PUT | /api/sku-products/:id | 상품 수정 |
| DELETE | /api/sku-products/:id | 상품 삭제 |

### 거래처
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/vendors | 거래처 목록 |
| GET | /api/vendor-mappings | 거래처 매핑 |
| POST | /api/vendor-mappings | 매핑 생성 |
| GET | /api/vendor-mappings/suggest | 유사 SKU 제안 |

### 주문
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/orders | 주문 목록 (검색/필터 지원) |
| POST | /api/orders | 주문 생성 (bulk) |
| PUT | /api/orders/:id | 주문 수정 (변경 이력 자동 기록) |
| POST | /api/orders/bulk-update | 일괄 수정 |
| DELETE | /api/orders/:id | 주문 삭제 |
| GET | /api/orders/stats | 주문 통계 집계 |
| GET | /api/orders/anomaly-stats | 이상치 감지용 통계 |
| POST | /api/orders/check-duplicates | 중복 주문 감지 |
| GET | /api/orders/:id/history | 주문 변경 이력 |
| GET | /api/orders/:id/comments | 주문 코멘트 조회 |
| POST | /api/orders/:id/comments | 주문 코멘트 추가 |

### 검색/필터
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/filter-presets | 필터 프리셋 목록 |
| POST | /api/filter-presets | 필터 프리셋 저장 |
| DELETE | /api/filter-presets/:id | 필터 프리셋 삭제 |

### 원가 이력
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/cost-history | 원가 변동 이력 조회 |

### 매출 리포트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/dashboard/vendor-report | 거래처별 매출 리포트 |

### 업로드 이력
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/upload-history | 업로드 이력 조회 |
| POST | /api/upload-history | 업로드 이력 기록 |

### 재고 관리
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/inventory | 전체 재고 목록 |
| PUT | /api/inventory/:sku_product_id | 재고/최소재고 수정 |
| POST | /api/inventory/adjust | 재고 수동 조정 |
| GET | /api/inventory/alerts | 최소재고 이하 알림 |

### 알림
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/notifications | 알림 목록 |
| POST | /api/notifications/mark-read | 알림 읽음 처리 |
| POST | /api/notifications/generate | 알림 자동 생성 |

### 백업/복원
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/backup/export | 전체 데이터 JSON 다운로드 |
| POST | /api/backup/import | JSON으로 데이터 복원 |
| GET | /api/backup/log | 백업 이력 조회 |

### 엑셀
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/upload-excel | 엑셀 업로드 및 파싱 |

### 시스템
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/health | 헬스체크 |

---

## 환경 변수

```bash
# .env
DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway
SECRET_KEY=your-secret-key
DEBUG=False
API_KEY=           # 설정 시 쓰기 API 인증 활성화
CORS_ORIGINS=*     # 허용 도메인
LOG_LEVEL=INFO     # 로깅 레벨
```

---

## 개발 환경 설정

```bash
# 1. 가상환경 생성
python -m venv venv
venv\Scripts\activate  # Windows

# 2. 의존성 설치
pip install -r requirements.txt

# 3. 환경변수 설정
copy .env.example .env
# .env 파일 편집하여 DATABASE_URL 설정

# 4. DB 마이그레이션 (Railway에서 직접 실행)
# migrations/001_initial.sql 내용 실행

# 5. 로컬 실행
python app.py
```

---

## 배포

```bash
# Vercel CLI
vercel --prod

# 환경변수 설정 (Vercel 대시보드)
DATABASE_URL=postgresql://...
SECRET_KEY=...
```

---

## 마이그레이션 가이드 (Firebase → PostgreSQL)

### Phase 1: 백엔드 구축 ✅
- Flask 앱 기본 구조
- API 엔드포인트 구현

### Phase 2: 프론트엔드 연결 ✅
- JS를 Firebase → Flask API 호출로 변경 완료
- SheetJS 클라이언트 파싱으로 발주서 변환 구현
- 변환완료 → 변환확정 → 주문등록 워크플로우 완성

### Phase 3: 전체 기능 이식 ✅
- 발주서 변환 (자동 컬럼 매핑, SKU 매칭)
- 변환확정 (인라인 편집, 빠른매칭, 정렬)
- 전체주문관리 (상태 토글, 송장 업로드, 일괄 업데이트)
- 엑셀 다운로드 (B타입, 전체주문, 통합조회)

### Phase 4: 검증 및 전환 ✅
- 모든 기능 테스트
- Firebase 코드 제거

### Phase 5: 품질 강화 ✅
- API 키 인증 미들웨어
- 구조화된 로깅 (Python logging)
- CORS 설정
- 테스트 스위트 (71개)
- JS 모듈 분리 (5개 파일)
- API 문서화

### Phase 6: 10대 기능 확장 ✅
- 주문 검색/필터 강화 (텍스트 검색, 다중 필터, 프리셋)
- 모바일 반응형 CSS
- 원가 변동 이력 추적 + 차트
- 엑셀 업로드 이력 관리
- 주문 변경 감사 이력 + 코멘트
- 거래처별 매출 리포트 + 엑셀 다운로드
- SKU별 재고 관리 + 수동 조정
- 인앱 알림 시스템 (미입금/미출고/재고부족)
- UI 수준 역할 기반 제한 (admin/manager/user)
- JSON 백업/복원
- 테스트 스위트 확장 (71개 → 98개)
- Playwright E2E 테스트

---

## 연관 프로젝트

| 프로젝트 | 역할 | DB |
|---------|------|-----|
| **jungmaein-pro** | 도축장 경매 | Railway (별도) |
| **hyupshin-erp-agent** | 협신 ERP | Railway (별도) |
| **order-management** | 발주 관리 | Railway (전용) ← 이 프로젝트 |

---

## AI 네이티브 개발 원칙

> **참조 규칙**: `.claude/rules/ai-native.md`

### 핵심 원칙 요약

| 원칙 | 이 프로젝트 적용 |
|------|-----------------|
| **기존 기능 보장** | 리팩토링 시 기존 동작 필수 확인 |
| **점진적 개선** | Firebase → Flask 단계적 마이그레이션 |
| **검증 우선** | API 테스트 후 프론트 연결 |

### 검증 방법

```bash
# 테스트 실행
pytest tests/ -v

# Flask 앱 실행
python app.py

# API 테스트
curl http://localhost:5000/api/health
```

---

## 레거시 참조

기존 Firebase 버전은 `index.html` (루트)에 보존되어 있습니다.
새 버전은 `templates/index.html`을 사용합니다.

---

## Claude Code 4대 개념 적용

> 이 섹션은 Claude Code의 Rules/Skills/Commands/Sub-Agents를 전문가급으로 적용한 설정입니다.

---

## Rules (규칙)

### 핵심 규칙 - 반드시 준수

| 규칙 | 설명 |
|------|------|
| **주문 데이터 수정 기록** | 주문 데이터를 직접 수정할 경우 반드시 커밋 메시지에 이유 기록 |
| **배포 전 테스트 필수** | `/test` 명령어 실행 후 모든 항목 통과 시에만 배포 진행 |
| **node_modules 커밋 금지** | `node_modules/` 는 절대 git에 포함하지 않을 것 |
| **환경변수 하드코딩 금지** | DATABASE_URL, SECRET_KEY 등 절대 코드에 직접 작성 금지 |
| **Railway DB 직접 수정 금지** | DB 변경은 반드시 migrations/ 폴더의 SQL 파일로만 진행 |
| **마이그레이션 전 백업 필수** | DB 스키마 변경 전 반드시 pg_dump로 백업 수행 |
| **고객 주문 데이터 외부 전송 금지** | 주문 데이터는 내부 시스템에서만 사용, 외부 API 전송 금지 |
| **기존 기능 보장** | 리팩토링 시 기존 동작 필수 확인 (ai-native.md 참조) |
| **테스트 통과 후 커밋** | pytest tests/ 전체 통과 확인 후에만 커밋 |

### 코드 컨벤션 규칙

```python
# Flask 라우트: 기능별 Blueprint 분리
# 에러 처리: 모든 DB 작업에 try/except 필수
# 로깅: 주문 생성/수정/삭제 이벤트 반드시 로그 기록
# DB 연결: g 객체 사용, 요청 종료 시 자동 닫기 (teardown_appcontext)
```

```javascript
// 함수명: camelCase
// 상수: UPPER_SNAKE_CASE
// DOM 요소: 접두사로 구분 (btn, input, div 등)
// 에러 처리: try/catch 후 showToast로 사용자 알림
```

---

## Skills (스킬)

### 스킬 1: 발주서 변환 패턴 (5단계)

```
1단계: 엑셀 업로드 → /api/upload-excel POST 요청
2단계: 서버에서 openpyxl 파싱 → 헤더 자동 감지
3단계: vendor_mappings 테이블 참조 → SKU 자동 매칭
4단계: 미매칭 항목 사용자 수동 매핑
5단계: 확정 → orders 테이블 bulk INSERT
```

### 스킬 2: API 디버깅 패턴

```bash
# 1. Flask 디버그 모드로 실행
FLASK_DEBUG=1 python app.py

# 2. 특정 엔드포인트 상세 테스트
curl -v -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '[{"sku_code": "TEST"}]' 2>&1 | grep -E "< HTTP|{|}"

# 3. DB 쿼리 로그 확인
# psycopg3 connection에 로그 핸들러 추가
```

### 스킬 3: 마이그레이션 안전 패턴

```
1단계: 현재 스키마 확인 (information_schema 조회)
2단계: pg_dump로 백업
3단계: 로컬 테스트 DB에서 먼저 적용
4단계: 기존 데이터 호환성 확인
5단계: 트래픽 적은 시간에 프로덕션 적용
6단계: 적용 후 즉시 헬스체크 및 주요 기능 확인
```

### 스킬 4: Vercel 배포 최적화 패턴

```python
# vercel.json 설정 핵심:
# - routes: Flask app.py를 진입점으로 설정
# - maxDuration: 10초 이내 (무료 플랜 제한)
# - memory: 최소 필요 메모리로 설정
# 무거운 작업(엑셀 파싱)은 스트리밍 또는 청크로 처리
```

### 스킬 5: 주문 상태 워크플로우 관리

```
발주서 업로드 → [변환대기]
     ↓ 자동 파싱/SKU 매칭
[변환완료] → 사용자 검토
     ↓ 확정
[변환확정] → 일괄 편집 가능
     ↓ 등록
[송장등록완료] → 배송/입금/세금계산서 상태 관리
```

---

## Commands (커맨드)

> `.claude/commands/` 디렉토리에 위치한 슬래시 커맨드 목록

| 커맨드 | 파일 | 설명 |
|--------|------|------|
| `/orders` | `orders.md` | 주문 현황 확인 및 조회 절차 |
| `/status` | `status.md` | 시스템 전체 상태 점검 절차 |
| `/deploy` | `deploy.md` | Vercel 배포 절차 (테스트 포함) |
| `/test` | `test.md` | 전체 기능 테스트 실행 절차 |
| `/migrate` | `migrate.md` | DB 마이그레이션 안전 실행 절차 |

### 커맨드 사용 예시

```
# 주문 현황 빠르게 확인할 때
/orders

# 배포 전 체크
/test
/deploy

# DB 스키마 변경할 때
/migrate

# 시스템 이상 감지 시
/status
```

---

## Sub-Agents (서브 에이전트)

### 서브 에이전트 활용 시나리오

#### 시나리오 1: 대량 주문 데이터 분석

```
메인 에이전트: 분석 목표 설정, 결과 취합
서브 에이전트 1: orders 테이블 통계 분석 (월별 주문량, 거래처별 집계)
서브 에이전트 2: SKU 상품별 판매량 분석
서브 에이전트 3: 미처리 주문 (미배송/미입금) 목록 추출
```

```bash
# 서브 에이전트 활성화 프롬프트
"use subagents - 주문 데이터 분석:
 Agent1: SELECT로 월별 주문 통계 분석
 Agent2: SKU별 판매 현황 분석
 Agent3: 미처리 주문 목록 정리
 결과를 종합하여 요약 리포트 작성"
```

#### 시나리오 2: 전체 시스템 점검

```
메인 에이전트: 점검 결과 취합 및 보고
서브 에이전트 1: Flask API 엔드포인트 전체 테스트
서브 에이전트 2: DB 테이블 상태 및 데이터 무결성 확인
서브 에이전트 3: Vercel 배포 상태 및 환경변수 확인
```

#### 시나리오 3: 마이그레이션 검증

```
메인 에이전트: 마이그레이션 계획 수립 및 실행 감독
서브 에이전트 1: 기존 스키마 분석 및 마이그레이션 SQL 검토
서브 에이전트 2: 로컬 테스트 DB에서 마이그레이션 검증
서브 에이전트 3: 데이터 호환성 및 롤백 계획 수립
```

### 서브 에이전트 사용 기준

```
단순 작업 (1개 파일 수정, 단일 API 조회) → 메인 에이전트
복합 작업 (3개 이상 파일, 다중 DB 테이블) → use subagents
대용량 분석 (전체 주문 데이터 분석) → use subagents
배포 + 검증 동시 진행 → use subagents
```

---

## 세션 시작 체크리스트

Claude Code 세션 시작 시 반드시 확인:

```
1. git pull origin main (최신 코드 동기화)
2. .env 파일 존재 확인 (DATABASE_URL 설정 여부)
3. /status 실행 (시스템 상태 확인)
4. 작업 목표 명확히 정의 후 시작
```
