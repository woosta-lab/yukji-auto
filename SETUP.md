# 설치 및 초기 설정 가이드

## 빠른 시작 (5분)

### 1단계: 저장소 클론 및 의존성 설치

```bash
cd /home/ubuntu/yukji-app
npm install
```

### 2단계: 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 다음을 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

> Supabase 프로젝트 생성 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고

### 3단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3001 접속

## 프로젝트 구조

```
yukji-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── pos/upload/           # POS 엑셀 업로드 API
│   │   │   ├── invoice/upload/       # 명세서 OCR 업로드 API
│   │   │   ├── invoice/approve/      # 명세서 승인 API
│   │   │   ├── pl/report/            # P&L 리포트 API
│   │   │   ├── dashboard/stats/      # 대시보드 통계 API
│   │   │   └── audit-log/            # 감사 로그 API
│   │   ├── page.tsx                  # 홈 (대시보드)
│   │   ├── pos-upload/page.tsx       # POS 업로드 페이지
│   │   ├── invoice-upload/page.tsx   # 명세서 업로드 페이지
│   │   ├── pl/page.tsx               # P&L 페이지
│   │   ├── audit-log/page.tsx        # 감사 로그 페이지
│   │   ├── layout.tsx                # 레이아웃 (네비게이션 포함)
│   │   └── globals.css               # 전역 스타일
│   ├── components/
│   │   ├── Navigation.tsx            # 상단 네비게이션
│   │   ├── Dashboard.tsx             # 대시보드
│   │   ├── POSUpload.tsx             # POS 업로드 UI
│   │   ├── InvoiceUpload.tsx         # 명세서 업로드 UI
│   │   ├── PLReport.tsx              # P&L 리포트 UI
│   │   └── AuditLog.tsx              # 감사 로그 UI
│   └── lib/
│       ├── supabase.ts               # Supabase 클라이언트
│       └── parsers/
│           ├── posExcelParser.ts     # POS 엑셀 파서
│           └── invoiceOCRParser.ts   # 명세서 OCR 파서
├── supabase/
│   └── migrations/
│       └── 001_init_schema.sql       # DB 스키마
├── public/                           # 정적 파일
├── .env.local.example                # 환경 변수 템플릿
├── next.config.js                    # Next.js 설정
├── tailwind.config.ts                # Tailwind CSS 설정
├── tsconfig.json                     # TypeScript 설정
├── package.json                      # 의존성
├── README.md                         # 프로젝트 설명
├── SETUP.md                          # 이 파일
└── DEPLOYMENT.md                     # 배포 가이드
```

## 주요 기능별 파일 맵

### POS 엑셀 업로드

| 파일 | 역할 |
|------|------|
| `src/lib/parsers/posExcelParser.ts` | 엑셀 파싱 로직 |
| `src/app/api/pos/upload/route.ts` | 업로드 API |
| `src/components/POSUpload.tsx` | UI 컴포넌트 |
| `src/app/pos-upload/page.tsx` | 페이지 |

### 명세서 OCR

| 파일 | 역할 |
|------|------|
| `src/lib/parsers/invoiceOCRParser.ts` | OCR 파싱 로직 |
| `src/app/api/invoice/upload/route.ts` | 업로드 API |
| `src/app/api/invoice/approve/route.ts` | 승인 API |
| `src/components/InvoiceUpload.tsx` | UI 컴포넌트 |
| `src/app/invoice-upload/page.tsx` | 페이지 |

### P&L 리포트

| 파일 | 역할 |
|------|------|
| `src/app/api/pl/report/route.ts` | P&L 계산 API |
| `src/components/PLReport.tsx` | UI 컴포넌트 |
| `src/app/pl/page.tsx` | 페이지 |

### 감사 로그

| 파일 | 역할 |
|------|------|
| `src/app/api/audit-log/route.ts` | 로그 조회 API |
| `src/components/AuditLog.tsx` | UI 컴포넌트 |
| `src/app/audit-log/page.tsx` | 페이지 |

## 데이터 흐름

### POS 엑셀 업로드 흐름

```
사용자 업로드
    ↓
POSUpload.tsx (UI)
    ↓
/api/pos/upload (API)
    ↓
posExcelParser.ts (파싱)
    ↓
Supabase Storage (파일 저장)
    ↓
pos_sales_daily_item (DB 저장)
    ↓
audit_log (기록)
    ↓
대시보드 (반영)
```

### 명세서 OCR 흐름

```
사용자 업로드
    ↓
InvoiceUpload.tsx (UI)
    ↓
/api/invoice/upload (API)
    ↓
invoiceOCRParser.ts (OCR)
    ↓
Supabase Storage (파일 저장)
    ↓
invoices + invoice_items (DB 저장)
    ↓
audit_log (기록)
    ↓
검수 UI (수정 가능)
    ↓
/api/invoice/approve (승인)
    ↓
inventory_ledger (재고 반영)
```

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 타입 체크
npx tsc --noEmit

# 포맷팅 (선택사항)
npm run format
```

## 환경 변수 설명

| 변수 | 설명 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 | ✅ |

## 데이터베이스 테이블

### 핵심 테이블

| 테이블 | 설명 | 행 |
|--------|------|-----|
| `users` | 사용자 정보 | 1 (오너만) |
| `std_item` | 표준 품목 마스터 | 50+ |
| `pos_sales_daily_item` | POS 상품-일자별 판매 | 매일 증가 |
| `invoices` | 명세서 | 매주 증가 |
| `invoice_items` | 명세서 라인 아이템 | 명세서당 10-20 |
| `inventory_ledger` | 재고 원장 | 매일 증가 |
| `audit_log` | 감사 로그 | 매일 증가 |

## 의존성

### 주요 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| `next` | 15.0.0 | 웹 프레임워크 |
| `react` | 18.3.1 | UI 라이브러리 |
| `@supabase/supabase-js` | 2.39.0 | DB/Auth 클라이언트 |
| `xlsx` | 0.18.5 | 엑셀 파싱 |
| `tesseract.js` | 5.0.0 | OCR |
| `tailwindcss` | 3.4.1 | CSS 프레임워크 |

## 문제 해결

### 포트 3001이 이미 사용 중인 경우

```bash
# 다른 포트 사용
PORT=3002 npm run dev

# 또는 기존 프로세스 종료
lsof -ti:3001 | xargs kill -9
```

### Supabase 연결 오류

```
Error: Failed to connect to Supabase
```

해결:
1. `.env.local` 파일 확인
2. Supabase 프로젝트 상태 확인
3. 네트워크 연결 확인

### 의존성 설치 오류

```bash
# 캐시 초기화
npm cache clean --force

# 재설치
rm -rf node_modules package-lock.json
npm install
```

## 다음 단계

1. [DEPLOYMENT.md](./DEPLOYMENT.md)에서 Supabase 설정
2. 테스트 데이터 입력
3. 실제 데이터로 테스트
4. Vercel에 배포

## 지원

문제가 발생하면:

1. 콘솔 오류 메시지 확인
2. [README.md](./README.md) 참고
3. [DEPLOYMENT.md](./DEPLOYMENT.md) 참고
4. Supabase 대시보드에서 로그 확인

## 라이선스

MIT
