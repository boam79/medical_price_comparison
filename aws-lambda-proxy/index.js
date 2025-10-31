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
    "Content-Type": "application/json",
  };

  // CORS preflight 처리
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // 요청 본문 파싱
    const body = JSON.parse(event.body || "{}");
    const { endpoint, params } = body;

    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "endpoint is required" }),
      };
    }

    // 공공데이터 API 호출
    const url = new URL(endpoint);
    Object.entries(params || {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const responseText = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        "Content-Type": response.headers.get("content-type") || "application/xml",
      },
      body: responseText,
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

