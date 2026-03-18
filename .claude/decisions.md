# order-management (주문관리 시스템) 아키텍처 결정 기록

> 세션 종료 시 중요한 결정사항을 여기에 추가한다.
> 형식: [날짜] **결정** | **이유** | **대안** | **영향**

---

## 결정 이력

(새 결정은 위에 추가)

### 2026-03-18: 10대 기능 확장 (Phase 6)

- **결정**: 검색/필터 강화, 모바일 CSS, 원가/주문/업로드 이력, 매출 리포트, 재고 관리, 알림 시스템, 역할 제한, 백업/복원 등 10개 기능 일괄 구현
- **이유**: 프로덕션 운영 필수 기능 (감사 추적, 재고 관리, 자동 알림, 데이터 백업)
- **대안**: 기능별 순차 배포 (선택 안 함 - 기능 간 의존성이 높아 일괄 구현이 효율적)
- **영향**:
  - 신규 마이그레이션: 005~012 (8개), 신규 DB 테이블: 9개
  - 신규 Blueprint: uploads.py, inventory.py, notifications.py, backup.py (4개)
  - API 엔드포인트: 31 → 50+개
  - 프론트엔드: app.es6.js 3070 → 3800줄 (검색 UI, 모달, 이력, 재고, 알림, 백업 등)
  - 테스트: 71 → 98개 (단위) + Playwright E2E 테스트 추가
  - 기존 함수 수정: renderPartsTable, renderPackagingTable, renderSkuTable, buildOrderManagementTable, convertOrders에 새 기능 연결

### 2026-03-18: Playwright E2E 테스트 도입

- **결정**: 단위 테스트(pytest)에 추가로 Playwright 기반 브라우저 E2E 테스트 도입
- **이유**: API mock 기반 단위 테스트만으로는 UI 렌더링, 페이지 전환, 사용자 워크플로우 검증 불가
- **대안**: Selenium (선택 안 함 - 느리고 무거움), Cypress (선택 안 함 - Python 프로젝트에서 Node.js 의존성 추가 부담)
- **영향**: tests/e2e/ 디렉토리, playwright 패키지 추가, conftest.py에 Flask 서버 fixture

### 2026-03-17: 프로젝트 품질 대폭 개선

- **결정**: 보안/테스트/아키텍처/문서를 전면 개선
- **이유**: 프로덕션 운영에 필수적인 보안(인증, CORS, 에러 정보 비노출), 테스트(71개), 로깅이 부재
- **대안**: 점진적 개선 (선택 안 함 - 보안 이슈는 즉시 조치 필요)
- **영향**: app.py, config.py, tests/ 전체, docs/API.md

### 2026-03-17: JS 모듈 분리 (단일 파일 → 5개)

- **결정**: app.es6.js (2,969줄)를 core/ui/convert/orders/features 5개 파일로 분리
- **이유**: 유지보수성, 코드 검색, 협업 효율 향상
- **대안**: 번들러(Vite) 도입 후 ES Module 사용 (선택 안 함 - 빌드 스텝 추가 부담)
- **영향**: static/js/ 5개 파일, templates/index.html 스크립트 태그

### 2026-03-17: API 키 인증 도입 (옵션형)

- **결정**: 환경변수 API_KEY 설정 시에만 쓰기 API 인증 활성화, 읽기는 공개
- **이유**: 인증 없이 누구나 데이터 삭제 가능했던 보안 취약점 해결
- **대안**: JWT 토큰 기반 인증 (선택 안 함 - 1인 사용 시스템에 과도)
- **영향**: app.py (require_api_key 데코레이터, 16개 엔드포인트)

### 2026-03-13: Firebase → Flask 전면 이식 완료

- **결정**: 레거시 index.html(Firebase 기반, ~180개 JS 함수)의 모든 핵심 기능을 Flask 버전으로 100% 이식
- **이유**: Firebase 의존성 제거, PostgreSQL 단일 DB로 통합, 서버사이드 데이터 관리 강화
- **대안**: Firebase 유지하면서 점진적 이전 (선택 안 함 - 이중 관리 부담)
- **영향**: `static/js/app.es6.js` (1192→2604줄), `templates/index.html`, `app.py`, `migrations/003_add_missing_columns.sql`

### 2026-03-13: 변환/확정 데이터 클라이언트 메모리 관리

- **결정**: 변환완료(convertedData)와 변환확정(confirmedData) 데이터는 클라이언트 JS 배열에서 관리. 전체주문관리 등록 시에만 `/api/orders POST`로 DB 저장
- **이유**: 레거시 Firebase 패턴과 동일한 UX 유지 (임시 데이터는 DB에 불필요하게 저장하지 않음)
- **대안**: 모든 단계에서 DB 저장 (선택 안 함 - 과도한 DB I/O, 임시 데이터 정리 로직 필요)
- **영향**: 브라우저 새로고침 시 변환완료/확정 데이터 초기화 (등록 전 데이터는 유지 안됨)

### 2026-03-13: SheetJS 클라이언트 파싱 + 자동 컬럼 매핑

- **결정**: 엑셀 파싱을 클라이언트에서 SheetJS로 수행, 3단계 자동 매핑 (정확→startsWith→includes)
- **이유**: 서버 부하 감소, Vercel 무료 플랜 제한(10초) 우회, 레거시와 동일한 매핑 규칙 유지
- **대안**: 서버사이드 openpyxl 파싱 (이미 /api/upload-excel 존재하지만, 클라이언트 파싱이 더 빠르고 유연)
- **영향**: MAPPING_RULES/MAPPING_EXCLUDES 상수로 매핑 로직 통합

---

## 기술 스택 선택 배경

### JavaScript + Firebase
- **선택 이유**: 서버리스 아키텍처로 별도 백엔드 인프라 불필요, Firebase Realtime DB/Firestore로 실시간 데이터 동기화
- **대안 검토**: Python Flask(서버 운영 필요), Supabase(팀 친숙도 낮음)
- **장점**: 프론트엔드 중심 개발, 인증/DB/호스팅 일원화

### GitHub Pages 배포
- **선택 이유**: 정적 파일 호스팅 무료, GitHub 저장소와 자동 연동
- **대안 검토**: Vercel(Firebase와 이중 외부 서비스), Netlify(동일 이유)
- **주의**: SPA 라우팅 설정 주의 필요(404 처리)

### 엑셀 발주서 변환
- **선택 이유**: 기존 업무 흐름(엑셀 발주서)과 호환, SheetJS(xlsx) 라이브러리로 브라우저 내 처리
- **패턴**: 엑셀 업로드 → 파싱 → Firebase 저장 → 발주서 화면 표시
- **대안 검토**: 서버 사이드 파싱(불필요한 복잡성)

### 송장 등록
- **선택 이유**: 발주 → 출고 → 송장 번호 등록의 업무 흐름 디지털화
- **패턴**: Firebase에 주문 상태(pending/shipped/delivered) 관리

### Flask 백엔드 (일부)
- **선택 이유**: 엑셀 변환 등 서버 처리가 필요한 일부 기능에 Python Flask 활용
- **구성**: app.py, routes/, services/ 구조
- **마이그레이션**: Firebase 클라이언트 SDK로 점진적 이전 중

### Flask + PostgreSQL 전면 전환 (2026-03)
- **선택 이유**: Firebase 무료 플랜 제한, 데이터 쿼리 유연성 (JOIN/집계), Railway PostgreSQL로 안정적 운영
- **대안 검토**: Firebase 유지 (무료 제한, 복잡한 쿼리 불가), Supabase (이전 비용)
- **결과**: 모든 CRUD API 완성, 프론트엔드 Firebase SDK 완전 제거

### 브랜치 전략
- **현재 브랜치**: `main`
- **Remote**: `https://github.com/692meatlab/meat-order-system.git`
- **주의**: 원격 인증 문제로 push 보류 중 → 로컬 커밋만 유지
