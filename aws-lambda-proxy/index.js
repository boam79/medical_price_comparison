/**
 * AWS Lambda 프록시 함수 (서울 리전)
 * 공공데이터포털 API 요청을 서울 리전에서 중계하여 해외 IP 차단 우회
 * 
 * 배포 방법:
 * 1. AWS Lambda 콘솔에서 새 함수 생성 (Node.js 20.x, 서울 리전)
 * 2. 이 코드를 붙여넣고 배포
 * 3. API Gateway에서 새 REST API 생성 후 Lambda 함수 연결
 * 4. 배포 후 엔드포인트 URL을 Vercel 환경변수 PUBLIC_DATA_PROXY_URL에 설정
 */

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // HTTP 메서드 확인 (REST API와 HTTP API v2 모두 지원)
  const httpMethod = event.requestContext?.http?.method || event.httpMethod;
  
  // CORS preflight 처리
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // 요청 본문 파싱 (REST API와 HTTP API v2 모두 지원)
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
    const { endpoint, params } = body;

    if (!endpoint) {
      return {
        statusCode: 400,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "endpoint is required" }),
      };
    }

    // endpoint가 전체 URL이면 그대로 사용, 아니면 params와 조합
    let targetUrl;
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      // 전체 URL인 경우
      targetUrl = new URL(endpoint);
      // params가 있으면 추가 파라미터로 설정
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          targetUrl.searchParams.set(key, String(value));
        }
      });
    } else {
      // base URL만 있는 경우 params로 쿼리 구성
      targetUrl = new URL(endpoint);
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          targetUrl.searchParams.set(key, String(value));
        }
      });
    }

    // 공공데이터 API 호출
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PublicDataProxy/1.0)",
      },
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") || "application/xml";

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        "Content-Type": contentType,
      },
      body: responseText,
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

