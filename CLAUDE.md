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
| 전체주문관리 | 배송/입금/세금계산서 상태 관리, 필터링, 집계 |
| SKU 상품관리 | 상품 등록, 원가 계산, 구성품 관리 |
| 거래처별 매핑 | 거래처 상품명 → SKU 자동 매칭 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Python Flask |
| Database | Railway PostgreSQL (전용) |
| Frontend | Vanilla JS + Tailwind CSS |
| Excel | openpyxl (서버), SheetJS (클라이언트) |
| 배포 | Vercel |

---

## 파일 구조

```
order-management/
├── app.py                    # Flask 메인 앱
├── config.py                 # 환경 설정
├── requirements.txt          # Python 의존성
├── vercel.json               # Vercel 배포 설정
│
├── services/
│   ├── __init__.py
│   └── excel_parser.py       # 엑셀 파싱 로직
│
├── templates/
│   └── index.html            # 메인 페이지
│
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js            # 프론트엔드 로직
│
├── migrations/
│   └── 001_initial.sql       # 테이블 생성 SQL
│
├── .claude/
│   └── rules/
│       └── ai-native.md      # AI 네이티브 규칙
│
├── scripts/
│   └── verify_all.js         # 검증 스크립트 (레거시)
│
├── index.html                # 레거시 (Firebase 버전)
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
| users | 사용자 (발주 담당자) |
| sku_products | SKU 상품 마스터 |
| sku_compositions | SKU 구성품 (부위 조합) |
| vendor_mappings | 거래처별 상품 매핑 |
| vendor_templates | 거래처별 엑셀 템플릿 |
| orders | 주문 데이터 |
| parts_cost | 부위별 원가 |
| packaging_cost | 포장재 원가 |

---

## API 엔드포인트

### 사용자
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/users | 사용자 목록 |
| POST | /api/users | 사용자 생성 |
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

### 주문
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/orders | 주문 목록 |
| POST | /api/orders | 주문 생성 (bulk) |
| PUT | /api/orders/:id | 주문 수정 |
| POST | /api/orders/bulk-update | 일괄 수정 |
| DELETE | /api/orders/:id | 주문 삭제 |

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

### Phase 2: 프론트엔드 연결 (진행 중)
- 기존 HTML/CSS 유지
- JS를 Firebase → Flask API 호출로 변경

### Phase 3: 데이터 마이그레이션
- Firebase 데이터 export
- PostgreSQL로 import

### Phase 4: 검증 및 전환
- 모든 기능 테스트
- Firebase 코드 제거

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
# Flask 앱 실행
python app.py

# API 테스트
curl http://localhost:5000/api/health
curl http://localhost:5000/api/users

# 전체 기능 테스트
# 브라우저에서 http://localhost:5000 접속
```

---

## 레거시 참조

기존 Firebase 버전은 `index.html` (루트)에 보존되어 있습니다.
새 버전은 `templates/index.html`을 사용합니다.
