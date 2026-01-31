# AI 네이티브 개발 규칙 - Order Management

> **기반**: Peter Steinberger (Moltbot 제작자) 인사이트
> **원칙**: "검증 시스템을 신뢰하라"

---

## 1. 검증 파이프라인

### 필수 검증 단계
```
1. ESLint 체크 → JS 문법/스타일 검증
2. HTML 유효성 → 구조 검증
3. 브라우저 테스트 → 기능 동작 확인
4. Firebase 연결 → 데이터 저장/로드 확인
```

### 검증 통과 = 배포 가능
```
✅ ESLint 에러 0개
✅ 콘솔 에러 없음
✅ 핵심 기능 동작 확인
→ GitHub Pages 배포 가능
```

---

## 2. 코드 변경 규칙

### 기존 기능 보장 (최우선)
```
🚨 기존 기능이 안 되면 절대 안 됨
🚨 변경 후 반드시 수동 테스트
🚨 문제 발생 시 즉시 롤백
```

### 점진적 개선
```javascript
// ❌ 한번에 전체 리팩토링
// 6000줄을 한번에 분리하면 버그 발생 확률 높음

// ✅ 단계별 분리
// 1단계: CSS만 분리
// 2단계: 유틸 함수 분리
// 3단계: Firebase 로직 분리
// 각 단계마다 테스트
```

---

## 3. 테스트 체크리스트

### 발주서 변환 테스트
```
□ 엑셀 파일 드래그&드롭 업로드
□ 발주처 선택 후 변환
□ SKU 자동 매칭 확인
□ 변환완료 목록 표시
```

### 송장 등록 테스트
```
□ 변환완료 → 변환확정 이동
□ 일괄 편집 기능
□ 엑셀 다운로드
□ 송장 등록 완료
```

### 전체주문관리 테스트
```
□ 주문 목록 조회
□ 상태 변경 (배송/입금/세금계산서)
□ 필터링 동작
□ 집계 계산
```

### 데이터 저장 테스트
```
□ Firebase 저장 확인
□ 새로고침 후 데이터 유지
□ 다른 사용자 데이터 분리
```

---

## 4. 코드 스타일

### JavaScript
```javascript
// 함수명: camelCase
function handleFileSelect() { ... }

// 상수: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// DOM 요소: 접두사로 구분
const btnConvert = document.getElementById('btn-convert');
const inputFile = document.getElementById('file-input');

// 에러 처리 필수
try {
    const data = await fetchData();
} catch (error) {
    console.error('데이터 로드 실패:', error);
    showToast('데이터를 불러올 수 없습니다.', 'error');
}
```

### HTML/CSS
```html
<!-- 클래스명: kebab-case -->
<div class="order-management-container">
    <button class="btn-primary">저장</button>
</div>

<!-- CSS 변수 활용 -->
<style>
:root {
    --primary-color: #3498db;
    --danger-color: #e74c3c;
}
</style>
```

---

## 5. Firebase 규칙

### 데이터 구조 변경 시
```
1. 기존 데이터 백업 (export)
2. 마이그레이션 스크립트 작성
3. 테스트 환경에서 먼저 적용
4. 프로덕션 적용
```

### 보안 규칙 체크
```javascript
// ⚠️ 현재: 클라이언트에서 직접 접근
// 보안 규칙으로 최소한의 보호 필요

// Firebase 보안 규칙 예시
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

---

## 6. 성능 고려사항

### 대량 데이터 처리
```javascript
// ❌ 전체 데이터 한번에 렌더링
renderAll(data); // 10000건 → 브라우저 멈춤

// ✅ 가상 스크롤 또는 페이지네이션
renderPage(data, page, pageSize);
```

### 엑셀 처리
```javascript
// ❌ 동기 처리 (UI 블로킹)
const wb = XLSX.read(data);

// ✅ Web Worker 사용 (백그라운드 처리)
worker.postMessage({ action: 'parse', data });
```

---

## 7. Prompt Request 형식

코드 변경 요청 시:
```
## 문제 (What)
- 발주서 변환 시 특정 엑셀 형식 인식 안 됨

## 영향 범위 (Where)
- handleConvert(), findHeaderRow(), autoMapColumns()

## 현재 동작
- "상품명" 컬럼만 인식

## 기대 동작
- "품명", "제품명", "아이템" 컬럼도 인식

## 검증 계획
- 다양한 엑셀 파일로 테스트
- 기존 파일들 정상 동작 확인
```

---

## 8. 리팩토링 우선순위

### 즉시 개선 (안전)
```
1. 주석 정리
2. 미사용 코드 제거
3. 중복 코드 함수화 (동일 파일 내)
```

### 단계적 개선 (주의 필요)
```
1. CSS 파일 분리
2. 유틸리티 함수 분리 (utils.js)
3. Firebase 로직 분리 (firebase.js)
4. UI 렌더링 분리 (ui.js)
```

### 장기 개선 (계획 필요)
```
1. 모듈 번들러 도입 (Vite 등)
2. TypeScript 마이그레이션
3. 컴포넌트 프레임워크 도입 (Vue/React)
```
