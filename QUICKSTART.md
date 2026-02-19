# 🚀 빠른 시작 가이드 (5분)

## 1단계: 프로젝트 설정 (1분)

```bash
# ZIP 파일 압축 해제
unzip yukji-app.zip
cd yukji-app

# 의존성 설치
npm install
```

## 2단계: Supabase 프로젝트 생성 (2분)

1. **https://supabase.com** 방문
2. **"New Project"** 클릭
3. 프로젝트 이름: `yukji-app`
4. 데이터베이스 비밀번호 설정
5. 리전: `Asia Pacific (Singapore)` 선택
6. **"Create new project"** 클릭 (약 2-3분 소요)

## 3단계: 환경 변수 설정 (1분)

### 3-1. Supabase 프로젝트 생성 완료 후

1. Supabase 대시보드 > **Settings** > **API**
2. 다음 정보 복사:
   - `Project URL` (SUPABASE_URL)
   - `anon public` (SUPABASE_ANON_KEY)

### 3-2. 환경 변수 파일 생성

```bash
# .env.local 파일 생성
cp .env.local.example .env.local
```

### 3-3. .env.local 파일 수정

```bash
# 텍스트 에디터로 .env.local 열기
# 다음과 같이 수정:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**찾는 위치:**
- **SUPABASE_URL**: Supabase 대시보드 > Settings > API > Project URL
- **SUPABASE_ANON_KEY**: Supabase 대시보드 > Settings > API > anon public
- **SERVICE_ROLE_KEY**: Supabase 대시보드 > Settings > API > service_role secret

## 4단계: 데이터베이스 마이그레이션 (1분)

### 4-1. Supabase 콘솔 열기

1. Supabase 대시보드 > **SQL Editor**
2. **"New Query"** 클릭

### 4-2. SQL 실행

1. `supabase/migrations/001_init_schema.sql` 파일 열기
2. 전체 내용 복사
3. Supabase SQL Editor에 붙여넣기
4. **"Run"** 클릭

### 4-3. Storage 버킷 생성

1. Supabase 대시보드 > **Storage**
2. **"New Bucket"** 클릭
3. 이름: `documents`
4. Public 체크박스 **해제** (비공개)
5. **"Create Bucket"** 클릭

## 5단계: 개발 서버 실행 (즉시)

```bash
npm run dev
```

브라우저에서 **http://localhost:3001** 접속

## 🎯 테스트 항목

### POS 엑셀 업로드 테스트

1. 대시보드 > **"POS 업로드"** 클릭
2. 샘플 엑셀 파일 준비:
   ```
   상품코드 | 상품명 | 일자 | 수량 | 실매출액
   001 | 소고기 등심 | 2026-02-08 | 5 | 250000
   002 | 돼지고기 삼겹살 | 2026-02-08 | 3 | 180000
   ```
3. 파일 드래그&드롭
4. **"업로드"** 클릭
5. 성공 메시지 확인

### 명세서 OCR 업로드 테스트

1. 대시보드 > **"명세서 업로드"** 클릭
2. 명세서 이미지 준비 (스마트폰으로 촬영)
3. 파일 드래그&드롭
4. **"업로드 및 OCR 인식"** 클릭
5. OCR 결과 확인:
   - 거래처명
   - 발행일
   - 총액
   - 라인 아이템

## 📊 기본 기능

| 페이지 | URL | 기능 |
|--------|-----|------|
| 대시보드 | http://localhost:3001 | 오늘/이번달 통계 |
| POS 업로드 | http://localhost:3001/pos-upload | 엑셀 파일 업로드 |
| 명세서 업로드 | http://localhost:3001/invoice-upload | 이미지/PDF 업로드 |
| P&L | http://localhost:3001/pl | 손익계산서 |
| 감사 로그 | http://localhost:3001/audit-log | 작업 기록 |

## 🔧 문제 해결

### "Cannot find module '@supabase/supabase-js'"

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### "Failed to connect to Supabase"

1. `.env.local` 파일 확인
2. SUPABASE_URL과 SUPABASE_ANON_KEY 값 확인
3. Supabase 프로젝트 상태 확인 (https://supabase.com)

### 포트 3001이 이미 사용 중

```bash
# 다른 포트 사용
PORT=3002 npm run dev
```

## 📚 다음 단계

1. **테스트 데이터 입력**
   - 표준 품목 마스터 (std_item)
   - POS 항목 매핑 (pos_item_map)
   - 거래처 (vendors)

2. **실제 데이터 테스트**
   - OK포스 엑셀 파일 업로드
   - 명세서 이미지 OCR 테스트
   - P&L 리포트 생성

3. **배포 준비**
   - [DEPLOYMENT.md](./DEPLOYMENT.md) 참고
   - Vercel에 배포

## 📖 상세 가이드

- **설치 가이드**: [SETUP.md](./SETUP.md)
- **배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **프로젝트 설명**: [README.md](./README.md)

## ✅ 체크리스트

- [ ] npm install 완료
- [ ] Supabase 프로젝트 생성
- [ ] .env.local 파일 작성
- [ ] SQL 마이그레이션 실행
- [ ] Storage 버킷 생성
- [ ] npm run dev 실행
- [ ] http://localhost:3001 접속 확인
- [ ] POS 업로드 테스트
- [ ] 명세서 OCR 테스트

---

**완료되면 모든 기능이 작동합니다! 🎉**
