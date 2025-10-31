# 공공데이터 API 프록시 설정 가이드

해외 IP 차단을 우회하기 위해 서울 리전 프록시 서버를 구축합니다.

## 🔍 문제 원인

공공데이터포털 API는 해외 IP 접근을 차단합니다. Vercel의 기본 리전이 해외일 경우 401 Unauthorized 에러가 발생합니다.

## ✅ 해결 방법

### 방법 1: AWS Lambda + API Gateway (권장)

#### 1단계: Lambda 함수 생성

1. AWS 콘솔 → Lambda → 함수 생성
   - 함수 이름: `public-data-proxy`
   - 런타임: Node.js 20.x
   - 리전: **ap-northeast-2 (서울)**
   - 실행 역할: 기본 역할 사용

2. `aws-lambda-proxy/index.js` 코드를 Lambda 함수에 붙여넣기

3. 배포

#### 2단계: API Gateway 설정

1. API Gateway → REST API 생성
   - 이름: `public-data-proxy-api`
   - 리전: **ap-northeast-2 (서울)**

2. 리소스 생성
   - Actions → Create Resource
   - Resource Path: `proxy`
   - Enable CORS: Yes

3. 메서드 생성
   - Actions → Create Method → POST
   - Integration type: Lambda Function
   - Lambda Function: `public-data-proxy` 선택

4. API 배포
   - Actions → Deploy API
   - Deployment stage: `prod`
   - 배포 후 Invoke URL 복사 (예: `https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/prod`)

#### 3단계: Vercel 환경변수 설정

Vercel 프로젝트 → Settings → Environment Variables

- Key: `PUBLIC_DATA_PROXY_URL`
- Value: API Gateway Invoke URL (예: `https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/prod`)
- Environments: Production, Preview, Development

#### 4단계: 코드 적용

API 라우트가 자동으로 프록시를 사용하도록 설정되어 있습니다.

---

### 방법 2: 간단한 Node.js 프록시 서버 (빠른 테스트용)

#### 1단계: 프록시 서버 코드 작성

```javascript
// proxy-server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/proxy', async (req, res) => {
  try {
    const { endpoint, params } = req.body;
    const url = new URL(endpoint);
    Object.entries(params || {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    
    const response = await fetch(url.toString());
    const text = await response.text();
    
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});
```

#### 2단계: 국내 호스팅에 배포

- 카페24, 네이버 클라우드, AWS EC2 (서울 리전) 등
- 배포 후 프록시 URL을 Vercel 환경변수에 설정

---

## 🧪 테스트

프록시 설정 후 다음 URL로 테스트:

```
https://medical-price-comparison.vercel.app/api/hospitals?search=서울아산병원
```

정상 응답 시 `_isMock` 필드가 없고 실제 병원 데이터가 반환됩니다.

---

## 📝 참고사항

- 프록시 서버는 반드시 **서울 리전**에 배포해야 합니다
- API Gateway는 사용량에 따라 비용이 발생할 수 있습니다 (무료 티어 범위 내)
- Lambda 함수 타임아웃을 최소 10초로 설정 권장

