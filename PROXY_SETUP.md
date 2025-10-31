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

3. Lambda 함수 설정
   - General → Timeout: 30초 (최대)
   - General → Memory: 256 MB (최소)
   - Configuration → Permissions: 
     - 실행 역할이 자동 생성되지만, 필요시 CloudWatch Logs 권한 확인

4. 배포
   - 상단 "Deploy" 버튼 클릭

#### 2단계: API Gateway 설정

**옵션 A: REST API (권장)**

1. API Gateway → REST API 생성
   - 이름: `public-data-proxy-api`
   - 리전: **ap-northeast-2 (서울)**
   - Endpoint Type: Regional

2. 리소스 생성
   - Actions → Create Resource
   - Resource Path: `proxy`
   - Enable CORS: Yes

3. 메서드 생성
   - Actions → Create Method → POST
   - Integration type: Lambda Function
   - Lambda Function: `public-data-proxy` 선택
   - Use Lambda Proxy integration: **체크**
   - Use Default Timeout: 체크 해제, Timeout: 29000ms (최대 30초)

4. CORS 설정
   - Actions → Enable CORS
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type`
   - Access-Control-Allow-Methods: `POST, OPTIONS`

5. API 배포
   - Actions → Deploy API
   - Deployment stage: `prod` (없으면 생성)
   - 배포 후 Invoke URL 복사 (예: `https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/prod`)

**옵션 B: HTTP API (더 간단)**

1. API Gateway → HTTP API 생성
   - 이름: `public-data-proxy-api`
   - 리전: **ap-northeast-2 (서울)**

2. 라우트 생성
   - Routes → Create
   - Method: POST
   - Path: `/proxy`

3. 통합 생성
   - Integrations → Create
   - Integration type: Lambda
   - Lambda Function: `public-data-proxy` 선택

4. API 배포
   - Deploy → Create stage
   - Stage name: `prod`
   - 배포 후 Invoke URL 복사 (예: `https://xxxxx.execute-api.ap-northeast-2.amazonaws.com`)

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

### 1단계: Lambda 함수 직접 테스트

Lambda 콘솔 → Test 탭 → 새 테스트 이벤트 생성:

```json
{
  "body": "{\"endpoint\":\"https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?ServiceKey=YOUR_KEY&pageNo=1&numOfRows=5\",\"params\":{}}"
}
```

실행 후 결과 확인:
- Status: 200
- 응답 본문에 XML 또는 JSON 데이터 포함

### 2단계: API Gateway 엔드포인트 테스트

터미널에서 직접 호출:

```bash
curl -X POST https://YOUR-API-GATEWAY-URL/prod/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?ServiceKey=YOUR_KEY&pageNo=1&numOfRows=5",
    "params": {}
  }'
```

정상 응답 시 XML 또는 JSON 데이터가 반환됩니다.

### 3단계: Vercel 애플리케이션 테스트

프록시 URL 설정 후 Vercel 재배포 → 다음 URL로 테스트:

```
https://medical-price-comparison.vercel.app/api/hospitals?search=서울아산병원
```

**정상 응답 특징:**
- `_isMock` 필드가 없음
- `hospitals` 배열에 실제 병원 데이터 포함
- `totalCount`가 0보다 큼

**에러 응답 시 확인사항:**
- Vercel 환경변수 `PUBLIC_DATA_PROXY_URL`이 올바르게 설정되었는지
- API Gateway Invoke URL 끝에 `/proxy` 경로가 포함되었는지
- Lambda 함수가 정상 배포되었는지 (CloudWatch Logs 확인)

---

## 📝 참고사항

### 필수 요구사항
- 프록시 서버는 반드시 **서울 리전 (ap-northeast-2)**에 배포해야 합니다
- Lambda 함수 타임아웃을 최소 30초로 설정 권장 (공공데이터 API 응답이 느릴 수 있음)
- API Gateway Invoke URL은 끝에 `/proxy` 경로를 포함해야 합니다

### 비용
- Lambda: 무료 티어 (월 100만 요청, 40만 GB-초)
- API Gateway: REST API는 무료 티어 없음, HTTP API는 월 100만 요청까지 무료
- 예상 비용: 소규모 사용 시 월 $1-5 수준

### 트러블슈팅
- **502 Bad Gateway**: Lambda 함수 타임아웃 확인, CloudWatch Logs 확인
- **401 Unauthorized**: API 키가 올바르게 전달되는지 확인
- **CORS 에러**: API Gateway의 CORS 설정 확인
- **타임아웃**: Lambda 함수 타임아웃을 30초로 증가

### 보안
- Lambda 함수는 VPC에 배치하지 않아도 됩니다 (공공 API는 인터넷 접근 가능)
- API Gateway에 API Key를 설정하여 무단 접근 방지 가능 (선택사항)

