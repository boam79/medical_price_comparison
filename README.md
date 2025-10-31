# 🏥 의료기관 비급여 항목 비교 서비스

여러 의료기관의 비급여 진료비를 한눈에 비교할 수 있는 Next.js 웹 애플리케이션입니다.

## 📋 프로젝트 개요

본 프로젝트는 공공데이터포털의 비급여 진료비 정보를 활용하여 여러 병원의 가격을 비교할 수 있는 서비스를 제공합니다.

### 주요 기능
- 🔍 **병원 검색**: 시도, 시군구, 병원명으로 검색
- 📊 **가격 비교**: 여러 병원의 공통 비급여 항목 자동 비교
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- 📥 **CSV 내보내기**: 비교 결과를 파일로 다운로드
- 🔗 **SEO 최적화**: 검색 엔진 친화적 구조

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Language**: TypeScript
- **Data Fetching**: SWR
- **Deployment**: Vercel

## 🚀 시작하기

### 필수 조건
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd medical-price-comparison

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 PUBLIC_DATA_API_KEY 설정

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 열기
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
medical-price-comparison/
├── app/
│   ├── api/                    # API Route Handlers
│   │   ├── hospitals/         # 병원 목록 조회
│   │   ├── noncovered/        # 비급여 항목 조회
│   │   └── compare/           # 비교 로직
│   ├── compare/               # 비교 결과 페이지
│   ├── about/                 # 서비스 소개 페이지
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # 메인 페이지
│   ├── sitemap.ts             # 사이트맵
│   └── robots.ts              # robots.txt
├── components/
│   └── ui/                    # shadcn/ui 컴포넌트
├── lib/
│   └── utils/                 # 유틸리티 함수
│       └── similarity.ts      # 유사도 매칭 알고리즘
├── types/
│   └── index.ts               # TypeScript 타입 정의
└── public/                    # 정적 파일
```

## 🔑 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
PUBLIC_DATA_API_KEY=your_api_key_here
```

공공데이터포털에서 발급받은 API 키를 입력하세요.

## 📊 API 엔드포인트

### GET /api/hospitals
병원 목록 조회
- Query params: `search`, `sido`, `gugun`

### GET /api/noncovered
비급여 항목 조회
- Query params: `hospital_codes` (쉼표로 구분)

### POST /api/compare
병원 간 비교
- Body: `{ hospital_codes: string[], hospital_names: string[] }`

## 🎨 주요 기능 설명

### 1. 병원 검색
- 자동완성 검색 기능
- 시도/시군구 필터링
- 병원 선택 및 제거

### 2. 가격 비교
- 공통 항목 자동 매칭 (유사도 알고리즘 사용)
- 가격 차이 및 차이율 계산
- 가격 차이율 기준 정렬

### 3. 반응형 디자인
- **모바일**: 카드형 레이아웃
- **데스크톱**: 테이블형 레이아웃
- Tailwind CSS breakpoints 활용

### 4. SEO 최적화
- 메타데이터 설정 (title, description, OG tags)
- 구조화 데이터 (JSON-LD)
- sitemap.xml 및 robots.txt 자동 생성

## 🧪 테스트

```bash
# 린트 검사
npm run lint

# 타입 체크
npm run type-check
```

## 📦 배포

### Vercel 배포

1. GitHub 저장소에 코드 푸시
2. Vercel에서 프로젝트 import
3. 환경변수 설정 (`PUBLIC_DATA_API_KEY`)
4. 자동 배포 완료

## ⚠️ 주의사항

- 공공데이터 API의 응답 시간이 다소 걸릴 수 있습니다
- 표시된 가격은 참고용이며, 실제 진료비와 다를 수 있습니다
- 모든 병원의 모든 항목이 포함되지 않을 수 있습니다

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🙏 참고 자료

- [공공데이터포털](https://www.data.go.kr/)
- [Next.js 문서](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

© 2025 의료비 비교 자동화 프로젝트
