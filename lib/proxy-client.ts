/**
 * 공공데이터포털 API 프록시 클라이언트
 * 해외 IP 차단 우회를 위해 서울 리전 프록시 서버를 통해 요청
 */

const PROXY_BASE_URL = process.env.PUBLIC_DATA_PROXY_URL || "";

interface ProxyRequest {
  endpoint: string;
  params: Record<string, string>;
}

/**
 * 프록시를 통해 공공데이터 API 호출
 */
export async function fetchViaProxy(endpoint: string, params: Record<string, string>) {
  // 프록시 URL이 설정되지 않은 경우 직접 호출 (로컬 개발용)
  if (!PROXY_BASE_URL) {
    const url = new URL(endpoint);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return fetch(url.toString());
  }

  // 프록시 서버를 통해 요청
  const proxyRequest: ProxyRequest = {
    endpoint,
    params,
  };

  const response = await fetch(`${PROXY_BASE_URL}/proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(proxyRequest),
  });

  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.status}`);
  }

  return response;
}

