# 배포 가이드

## 1. Supabase 설정

### 1.1 프로젝트 생성

1. [Supabase](https://supabase.com) 방문
2. "New Project" 클릭
3. 프로젝트 이름: `yukji-app`
4. 리전: `Asia Pacific (Singapore)` 또는 가까운 지역
5. 데이터베이스 비밀번호 설정
6. 프로젝트 생성 (약 2-3분 소요)

### 1.2 환경 변수 설정

프로젝트 생성 후 Settings > API에서:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

`.env.local` 파일에 입력:

```bash
cp .env.local.example .env.local
# 위의 값들을 .env.local에 입력
```

### 1.3 데이터베이스 마이그레이션

1. Supabase 콘솔 > SQL Editor 접속
2. "New Query" 클릭
3. `supabase/migrations/001_init_schema.sql` 파일의 내용 복사
4. 붙여넣기 후 "Run" 실행

### 1.4 Storage 설정

1. Supabase 콘솔 > Storage 접속
2. "New Bucket" 클릭
3. 이름: `documents`
4. Public 체크박스 해제 (비공개)
5. 생성

### 1.5 RLS (Row Level Security) 정책

기본 RLS 정책은 마이그레이션에서 생성되었습니다.
필요시 Supabase 콘솔 > Authentication > Policies에서 수정 가능합니다.

## 2. 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3001 접속
```

## 3. Vercel 배포 (Frontend)

### 3.1 Vercel 계정 생성

1. [Vercel](https://vercel.com) 방문
2. GitHub 계정으로 로그인

### 3.2 프로젝트 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

또는 Vercel 대시보드에서:

1. "New Project" 클릭
2. GitHub 저장소 선택
3. Framework: "Next.js"
4. Environment Variables 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy 클릭

### 3.3 배포 후 확인

- Vercel 대시보드에서 배포 상태 확인
- 프로덕션 URL 접속하여 기능 테스트

## 4. 테스트 데이터 준비

### 4.1 표준 품목 마스터 입력

Supabase 콘솔 > Table Editor > `std_item`에서:

```sql
INSERT INTO std_item (name, category, base_uom, is_liquor, is_meat) VALUES
('소고기 등심', '육류', 'kg', false, true),
('돼지고기 삼겹살', '육류', 'kg', false, true),
('닭다리살', '육류', 'kg', false, true),
('맥주 (OB)', '주류', 'ea', true, false),
('소주 (처음처럼)', '주류', 'ea', true, false),
('상추', '채소', 'kg', false, false),
('깻잎', '채소', 'kg', false, false),
('쌈장', '양념', 'kg', false, false);
```

### 4.2 POS 항목 매핑 입력

Supabase 콘솔 > Table Editor > `pos_item_map`에서:

```sql
INSERT INTO pos_item_map (item_code, item_name, std_item_id) VALUES
('001', '소고기 등심', (SELECT id FROM std_item WHERE name='소고기 등심')),
('002', '돼지고기 삼겹살', (SELECT id FROM std_item WHERE name='돼지고기 삼겹살')),
('003', '닭다리살', (SELECT id FROM std_item WHERE name='닭다리살')),
('010', '맥주', (SELECT id FROM std_item WHERE name='맥주 (OB)')),
('011', '소주', (SELECT id FROM std_item WHERE name='소주 (처음처럼)'));
```

### 4.3 거래처 입력

Supabase 콘솔 > Table Editor > `vendors`에서:

```sql
INSERT INTO vendors (name, phone, address) VALUES
('삼부주류', '02-1234-5678', '서울시 강남구'),
('한우마트', '02-2345-6789', '서울시 서초구'),
('신선채소', '02-3456-7890', '서울시 동작구');
```

## 5. 실제 데이터 테스트

### 5.1 POS 엑셀 파일 준비

OK포스에서 "상품-일자별" 매출 리포트 다운로드:

- 헤더: 4행
- 컬럼: 상품코드, 상품명, 일자, 수량, 실매출액
- 예시:
  ```
  001, 소고기 등심, 2026-02-08, 5, 250000
  002, 돼지고기 삼겹살, 2026-02-08, 3, 180000
  ```

### 5.2 명세서 이미지 준비

거래처 명세서를 스마트폰으로 촬영:

- 형식: JPEG, PNG
- 크기: 1000x1000 이상 권장
- 내용: 거래처명, 발행일, 품목, 수량, 단가, 금액

### 5.3 업로드 테스트

1. 대시보드 > POS 업로드
2. 엑셀 파일 드래그&드롭
3. "업로드" 클릭
4. 결과 확인

명세서 테스트:

1. 대시보드 > 명세서 업로드
2. 이미지 파일 드래그&드롭
3. "업로드 및 OCR 인식" 클릭
4. OCR 결과 확인

## 6. 모니터링 및 유지보수

### 6.1 로그 확인

Vercel 대시보드 > Logs에서 실시간 로그 확인

### 6.2 성능 모니터링

Vercel 대시보드 > Analytics에서:
- 페이지 로드 시간
- 에러율
- API 응답 시간

### 6.3 데이터베이스 백업

Supabase 콘솔 > Backups에서:
- 자동 백업 설정 (매일)
- 수동 백업 생성

## 7. 문제 해결

### 7.1 Supabase 연결 오류

```
Error: Failed to connect to Supabase
```

해결:
- `.env.local`의 URL과 키 확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 확인

### 7.2 OCR 성능 저하

```
OCR processing is slow
```

해결:
- 이미지 크기 축소 (1000x1000 이하)
- 명도 조정 (밝은 이미지 권장)
- 브라우저 콘솔에서 `Tesseract.setLogging(false)` 실행

### 7.3 파일 업로드 실패

```
Error: File upload failed
```

해결:
- 파일 크기 확인 (10MB 이하)
- 파일 형식 확인 (.xlsx, .xls, .jpg, .png)
- Storage 버킷 권한 확인

## 8. 보안 체크리스트

- [ ] `.env.local` 파일은 Git에 커밋하지 않음
- [ ] Supabase RLS 정책 검토
- [ ] API 키는 서버 환경 변수에만 저장
- [ ] HTTPS 사용 확인
- [ ] CORS 설정 확인

## 9. 성능 최적화

### 9.1 이미지 최적화

```bash
# Sharp를 사용한 이미지 압축
npm install sharp
```

### 9.2 데이터베이스 인덱스

주요 쿼리에 인덱스 생성:

```sql
CREATE INDEX idx_pos_sales_daily_item_date ON pos_sales_daily_item(sale_date);
CREATE INDEX idx_pos_sales_daily_item_item_code ON pos_sales_daily_item(item_code);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_inventory_ledger_item_date ON inventory_ledger(std_item_id, date);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

### 9.3 캐싱 전략

Next.js 캐싱 설정:

```typescript
// API 라우트에서
export const revalidate = 60 // 60초마다 재검증
```

## 10. 다음 단계

- [ ] 사용자 인증 추가 (Supabase Auth)
- [ ] 권한 관리 (RBAC) 구현
- [ ] 모바일 앱 (React Native) 개발
- [ ] 실시간 알림 추가
- [ ] 고급 분석 기능 추가
