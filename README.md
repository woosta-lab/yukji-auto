# 육지 외식 운영 자동화 시스템

직원의 엑셀/서류 입력 시간을 거의 0으로 만드는 외식 운영 자동화 앱/웹입니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **OCR**: Tesseract.js
- **Deploy**: Vercel (Frontend) + Supabase (Backend)

## 주요 기능

### MVP1 (현재 구현)

1. **POS 엑셀 업로드**
   - 상품-일자별 매출 리포트 파싱
   - 자동 DB 저장
   - 드래그&드롭 UI

2. **명세서 OCR 업로드**
   - 이미지/PDF 업로드
   - Tesseract OCR로 자동 인식
   - 거래처명, 발행일, 총액, 라인 아이템 추출
   - 검수 및 승인 기능

3. **P&L 손익계산서**
   - 일별/월별 자동 생성
   - 매출, 원가, 인건비, 영업이익 계산
   - 원가율, 인건비율, 이익율 분석

4. **감사 로그**
   - 모든 업로드/수정/승인 기록
   - 사용자별 작업 추적

5. **대시보드**
   - 오늘/이번달 주요 지표
   - 최근 업로드 현황

## 설치 및 실행

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repo-url>
cd yukji-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일에 Supabase 정보 입력
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com) 회원가입 및 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_init_schema.sql` 실행
3. Storage에서 "documents" 버킷 생성
4. `.env.local`에 API 키 입력

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3001에서 앱 실행

## API 엔드포인트

### POS 관련
- `POST /api/pos/upload` - POS 엑셀 업로드
- `GET /api/dashboard/stats` - 대시보드 통계

### 명세서 관련
- `POST /api/invoice/upload` - 명세서 OCR 업로드
- `POST /api/invoice/approve` - 명세서 승인

### P&L 관련
- `GET /api/pl/report` - P&L 리포트 조회

### 감사 로그
- `GET /api/audit-log` - 감사 로그 조회

## 데이터베이스 스키마

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 (오너만) |
| `std_item` | 표준 품목 마스터 |
| `pos_item_map` | POS 항목 매핑 |
| `pos_reports` | 업로드된 POS 파일 정보 |
| `pos_sales_daily_item` | POS 상품-일자별 판매 (핵심) |
| `vendors` | 거래처 |
| `invoices` | 명세서 |
| `invoice_items` | 명세서 라인 아이템 |
| `inventory_ledger` | 재고 원장 |
| `audit_log` | 감사 로그 |
| `daily_closing` | 일마감 기록 |

## 파싱 규칙

### POS 엑셀 파싱
- 헤더: 4행
- 필수 컬럼: 상품코드, 상품명, 일자, 수량, 실매출액
- 날짜 형식: YYYY-MM-DD 또는 YYYY/MM/DD

### 명세서 OCR
- 지원 형식: JPEG, PNG, WebP, PDF
- 추출 항목: 거래처명, 발행일, 총액, 라인 아이템
- OCR 엔진: Tesseract.js (한글+영문)

## 운영 규칙

- **마감 시간**: 매일 23:59
- **승인자**: 김상우(Owner) 단독
- **자동화 목표**: 자동 80% + 검수 20%

## 배포

### Vercel (Frontend)

```bash
npm run build
# Vercel CLI로 배포
vercel deploy
```

### Supabase (Backend)

- 자동 배포 (SQL 마이그레이션은 Supabase 콘솔에서 수동 실행)

## 향후 계획 (MVP2+)

- [ ] 주류 재고 자동화
- [ ] 로스율 자동 계산
- [ ] 원물 변동 분석
- [ ] 사용자 권한 관리 (RBAC)
- [ ] 마감 프로세스 자동화
- [ ] 모바일 앱 (React Native)
- [ ] 실시간 알림

## 문제 해결

### Tesseract OCR이 느린 경우
- 브라우저 콘솔에서 `Tesseract.setLogging(false)` 실행
- 이미지 크기 축소 (1000x1000 이하 권장)

### Supabase 연결 오류
- `.env.local` 파일의 API 키 확인
- Supabase 프로젝트의 API 설정 확인
- 네트워크 연결 확인

## 라이선스

MIT

## 문의

김상우 (Owner)
