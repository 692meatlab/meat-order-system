# 배포 절차

> Order Management 시스템을 Vercel에 배포하는 절차입니다.
> **반드시 테스트 통과 후 배포하세요.**

---

## 전제 조건 체크리스트

```
□ 모든 테스트 통과 확인 (test.md 실행)
□ .env 파일의 DATABASE_URL 유효성 확인
□ SECRET_KEY 설정 확인
□ git status 확인 (커밋되지 않은 변경사항 없음)
□ Vercel CLI 설치 확인
```

---

## 1. 배포 전 최종 테스트

```bash
# 로컬에서 Flask 앱 실행
cd /c/Users/김민서/Desktop/Project/order-management
python app.py &

# 헬스체크
sleep 2
curl -s http://localhost:5000/api/health

# 핵심 API 동작 확인
curl -s http://localhost:5000/api/users
curl -s http://localhost:5000/api/sku-products
curl -s http://localhost:5000/api/orders

# Flask 서버 종료
kill %1
```

---

## 2. Git 상태 확인 및 커밋

```bash
cd /c/Users/김민서/Desktop/Project/order-management

# 변경사항 확인
git status
git diff

# 필요 시 커밋 (node_modules 절대 포함하지 않을 것)
git add app.py config.py requirements.txt routes/ services/ templates/ static/ migrations/
git commit -m "feat: [변경 내용 상세 기술]"

# 원격 저장소에 푸시
git push origin main
```

---

## 3. Vercel 환경변수 설정 확인

```bash
# Vercel 대시보드에서 설정 필요한 환경변수:
# DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway
# SECRET_KEY=your-secure-secret-key
# DEBUG=False

# Vercel CLI로 환경변수 설정 (선택)
vercel env add DATABASE_URL production
vercel env add SECRET_KEY production
```

---

## 4. Vercel 배포 실행

```bash
cd /c/Users/김민서/Desktop/Project/order-management

# 프로덕션 배포
vercel --prod

# 배포 완료 후 URL 확인
# 예: https://order-management-xxx.vercel.app
```

---

## 5. 배포 후 검증

```bash
# 배포된 URL로 헬스체크
PROD_URL="https://[your-vercel-domain]"

curl -s "$PROD_URL/api/health"
curl -s "$PROD_URL/api/users"
curl -s "$PROD_URL/api/sku-products"

# 메인 페이지 접속 확인
curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/"
```

---

## 6. Railway DB 연결 확인

```bash
# Railway PostgreSQL 연결 테스트 (프로덕션 환경변수 사용)
python -c "
import os
import psycopg
# 프로덕션 DATABASE_URL로 테스트
DB_URL = 'postgresql://postgres:xxx@xxx.railway.app:5432/railway'
try:
    conn = psycopg.connect(DB_URL)
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM orders')
    print('Railway DB 연결 성공, 주문 건수:', cur.fetchone()[0])
    conn.close()
except Exception as e:
    print('Railway DB 연결 실패:', e)
"
```

---

## 7. 롤백 절차 (문제 발생 시)

```bash
# 이전 배포로 롤백
vercel rollback

# 또는 특정 배포 ID로 롤백
vercel rollback [deployment-id]

# 롤백 후 상태 확인
curl -s "https://[your-vercel-domain]/api/health"
```

---

## 배포 체크리스트 (최종)

```
□ vercel.json 설정 확인
□ requirements.txt 최신화 확인
□ node_modules git에 없음 확인
□ .env 파일 git에 없음 확인 (.gitignore 확인)
□ 배포 후 헬스체크 통과
□ 주요 API 엔드포인트 정상 응답 확인
□ 배포 URL 팀 공유
```

---

## 주의사항

- **배포 전 반드시 테스트 통과 확인** (test.md 절차 먼저 실행)
- `node_modules` 절대 커밋/배포하지 않을 것
- `DATABASE_URL`에 실제 Railway 연결 정보 사용
- Vercel 무료 플랜의 경우 실행 시간 제한(10초) 주의
