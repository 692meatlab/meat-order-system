# Meat Order System (발주 관리 시스템)

발주서 변환 및 송장 등록 시스템

## 사용 방법

아래 URL로 접속하세요:

### https://meat-order-system-production.up.railway.app

> 별도 설치 없이 브라우저에서 바로 사용 가능합니다.

---

## (개발자용) 로컬 실행 방법

### 1. 클론

```bash
git clone https://github.com/692meatlab/meat-order-system.git
cd meat-order-system
```

### 2. 가상환경 생성 및 활성화

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 설치

```bash
pip install -r requirements.txt
```

### 4. 환경변수 설정

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

`.env` 파일을 열어서 실제 값 입력:

```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
SECRET_KEY=your-secret-key
DEBUG=True
```

> **참고**: DATABASE_URL은 Railway PostgreSQL 연결 정보입니다. 관리자에게 문의하세요.

### 5. 실행

```bash
python app.py
```

### 6. 접속

브라우저에서 http://localhost:5000 접속

## 기술 스택

- **Backend**: Python Flask
- **Database**: PostgreSQL (Railway)
- **Frontend**: Vanilla JS + Tailwind CSS

## 주요 기능

- 발주서 변환 (엑셀 → SKU 매칭)
- 송장 등록
- 전체 주문 관리
- SKU 상품 관리
- 거래처별 매핑
- 대시보드 달력
