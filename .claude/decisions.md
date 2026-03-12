# order-management (주문관리 시스템) 아키텍처 결정 기록

> 세션 종료 시 중요한 결정사항을 여기에 추가한다.
> 형식: [날짜] **결정** | **이유** | **대안** | **영향**

---

## 결정 이력

(새 결정은 위에 추가)

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

### 브랜치 전략
- **현재 브랜치**: `main`
- **Remote**: `https://github.com/692meatlab/meat-order-system.git`
- **주의**: 원격 인증 문제로 push 보류 중 → 로컬 커밋만 유지
