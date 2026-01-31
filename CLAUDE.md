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
| Frontend | 순수 HTML/CSS/JavaScript (No Framework) |
| Database | Firebase Realtime Database |
| Excel | SheetJS (xlsx.js) |
| 배포 | 정적 HTML (GitHub Pages) |

---

## 파일 구조

```
order-management/
├── index.html              # 메인 앱 (전체 코드 포함, ~6000줄)
├── CLAUDE.md               # 이 파일
├── .claude/
│   └── rules/
│       └── ai-native.md    # AI 네이티브 규칙
└── scripts/
    └── verify_all.js       # 검증 스크립트
```

---

## 현재 구조적 특징

### 모놀리식 구조 (개선 필요)
- **문제**: 6,000줄+ 코드가 단일 HTML 파일에 존재
- **영향**: 유지보수 어려움, 코드 탐색 불편
- **개선 방향**: CSS/JS 파일 분리, 모듈화

### Firebase 의존성
- 모든 데이터가 Firebase Realtime Database에 저장
- 클라이언트에서 직접 Firebase 접근 (보안 규칙 중요)

---

## 주요 데이터 구조 (Firebase)

```javascript
// Firebase 데이터 구조
{
  userList: ["사용자1", "사용자2"],
  users: {
    "사용자1": {
      convertedData: [...],      // 변환완료 데이터
      confirmedOrders: [...],    // 변환확정 데이터
      orderManagement: [...]     // 전체주문 데이터
    }
  },
  skuProducts: {...},            // SKU 상품 목록
  vendorMappings: {...},         // 거래처별 매핑
  partsCost: {...},              // 부위별 원가
  packagingCost: {...}           // 포장재 원가
}
```

---

## 주요 함수 (index.html 내)

| 함수명 | 역할 | 위치 (대략) |
|--------|------|-------------|
| `handleFileSelect()` | 엑셀 파일 업로드 처리 | ~3200줄 |
| `handleConvert()` | 발주서 변환 로직 | ~3400줄 |
| `findHeaderRow()` | 헤더 행 자동 탐지 | ~3480줄 |
| `autoMapColumns()` | 컬럼 자동 매핑 | 변환 로직 |
| `findMatchingSku()` | SKU 매칭 | 변환 로직 |
| `renderResult()` | 변환 결과 렌더링 | UI 렌더링 |
| `handleRegisterInvoice()` | 송장 등록 | 확정 처리 |

---

## 환경 변수 / 설정

Firebase 설정이 index.html에 하드코딩되어 있음:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  // ...
};
```

> ⚠️ **보안 주의**: Firebase 보안 규칙으로 데이터 접근 제어 필요

---

## 개선 로드맵

### Phase 1: 코드 분리 (구조 개선)
```
□ CSS → styles/main.css 분리
□ JS → scripts/app.js 분리
□ 모듈화: utils.js, firebase.js, excel.js, ui.js
```

### Phase 2: 보안 강화
```
□ Firebase 보안 규칙 검토
□ 환경변수 분리 (.env 또는 config.js)
```

### Phase 3: 기능 개선
```
□ 에러 핸들링 강화
□ 오프라인 지원 (IndexedDB 캐시)
□ 성능 최적화 (대량 데이터 처리)
```

---

## AI 네이티브 개발 원칙

> **참조 규칙**: `.claude/rules/ai-native.md`

### 핵심 원칙 요약

| 원칙 | 이 프로젝트 적용 |
|------|-----------------|
| **검증 시스템 신뢰** | ESLint + 브라우저 테스트 통과 = 배포 가능 |
| **점진적 개선** | 기존 기능 유지하면서 단계적 분리 |
| **기능 보장 우선** | 리팩토링 시 기존 동작 필수 확인 |

### 검증 방법

```bash
# JS 린트 체크
npx eslint index.html --ext .html

# 또는 Node.js 스크립트
node scripts/verify_all.js
```

---

## 연관 프로젝트

| 프로젝트 | 역할 |
|---------|------|
| **jungmaein-pro** | 도축장 경매 데이터 |
| **platform-multisite** | 육류 데이터 크롤링 (로컬) |
| **meat-crawler-cloud** | 클라우드 크롤러 |

---

## 자주 사용하는 작업

```bash
# 로컬 서버 실행 (Live Server 등)
npx serve .

# 검증 실행
node scripts/verify_all.js

# GitHub Pages 배포
git push origin main
```
