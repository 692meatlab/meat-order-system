# order-management (주문관리 시스템) 아키텍처 결정 기록

> 세션 종료 시 중요한 결정사항을 여기에 추가한다.
> 형식: [날짜] **결정** | **이유** | **대안** | **영향**

---

## 결정 이력

(새 결정은 위에 추가)

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
