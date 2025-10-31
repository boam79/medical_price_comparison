import { NextRequest, NextResponse } from "next/server";
import { HospitalApiResponse, Hospital } from "@/types";

// 병원 기본목록 실제 엔드포인트
const API_BASE_URL_PRIMARY = "https://apis.data.go.kr/B551182/hospInfoServicev2";
const API_BASE_URL_FALLBACK = "http://apis.data.go.kr/B551182/hospInfoServicev2";

/**
 * 병원 목록 조회 API
 * GET /api/hospitals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sido = searchParams.get("sido");
    const gugun = searchParams.get("gugun");
    const searchTerm = searchParams.get("search");

    // API 키는 서버 환경변수에서 가져옴
    const apiKey = process.env.PUBLIC_DATA_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    // 공공데이터 API 호출 (병원기본목록)
    const url = new URL(`${API_BASE_URL_PRIMARY}/getHospBasisList`);

    // 필수 파라미터
    // 게이트웨이 구현 편차 대응: 두 파라미터 모두 전송
    url.searchParams.set("ServiceKey", apiKey);
    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "50");
    // 일부 게이트웨이는 JSON 응답을 지원 (미지원 시 XML → mock fallback 동작)
    url.searchParams.set("_type", "json");

    // 선택 파라미터
    if (sido) url.searchParams.set("sidoCd", sido);
    if (gugun) url.searchParams.set("sgguCd", gugun);
    if (searchTerm) url.searchParams.set("yadmNm", searchTerm);

    // 프록시 URL이 설정되어 있으면 프록시를 통해 요청
    const proxyUrl = process.env.PUBLIC_DATA_PROXY_URL;
    let response: Response;

    if (proxyUrl) {
      // 프록시를 통해 요청
      try {
        const proxyResponse = await fetch(`${proxyUrl}/proxy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: url.toString(),
            params: {},
          }),
        });

        if (!proxyResponse.ok) {
          throw new Error(`Proxy request failed: ${proxyResponse.status}`);
        }

        // 프록시 응답을 Response 객체로 변환
        const proxyText = await proxyResponse.text();
        response = new Response(proxyText, {
          status: proxyResponse.status,
          headers: { "Content-Type": proxyResponse.headers.get("content-type") || "application/xml" },
        });
      } catch (proxyError) {
        console.error("Proxy request failed, falling back to direct:", proxyError);
        // 프록시 실패 시 직접 요청으로 fallback
        response = await fetch(url.toString(), {
          next: { revalidate: 120 },
          cache: "no-store",
        });
      }
    } else {
      // 프록시가 없으면 직접 요청
      response = await fetch(url.toString(), {
        next: { revalidate: 120 },
        cache: "no-store",
      });

      if (!response.ok) {
        // 1차 실패 시 http 베이스로 재시도
        const fbUrl = new URL(url.toString().replace(API_BASE_URL_PRIMARY, API_BASE_URL_FALLBACK));
        response = await fetch(fbUrl.toString(), { next: { revalidate: 120 }, cache: "no-store" });
      }
    }

    if (!response.ok) {
      console.error(`Hospitals API failed. url=${url.toString()} status=${response.status}`);
      
      // 401 에러는 해외 IP 차단 가능성이 높음
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: "API 인증 실패",
            message: "해외 IP 차단으로 인한 오류일 수 있습니다. 서울 리전 프록시 설정이 필요합니다.",
            upstreamStatus: response.status,
            hospitals: [],
            totalCount: 0
          },
          { status: 502 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Upstream API request failed", 
          upstreamStatus: response.status,
          hospitals: [],
          totalCount: 0
        },
        { status: 502 }
      );
    }

    const data: HospitalApiResponse = await response.json();
    console.log("Hospitals API Response (truncated):", JSON.stringify(data).substring(0, 500));

    // 에러 처리
    if (data.response?.header?.resultCode !== "00") {
      return NextResponse.json(
        {
          error: data.response?.header?.resultMsg || "API 호출 실패",
        },
        { status: 400 }
      );
    }

    // 안전한 데이터 추출 및 필드 매핑
    const items: any = data.response?.body?.items;
    let hospitals: Hospital[] = [];

    const normalize = (item: any): Hospital => ({
      org_cd: item?.ykiho ?? item?.org_cd ?? "",
      org_nm: item?.yadmNm ?? item?.org_nm ?? "",
      si: item?.sidoCdNm ?? item?.si ?? "",
      gun: item?.sgguCdNm ?? item?.gun ?? "",
    });

    if (Array.isArray(items)) {
      hospitals = (items as any[]).map(normalize);
    } else if (items) {
      hospitals = [normalize(items as any)];
    }

    // 클라이언트 측 필터링 (searchTerm이 있는 경우)
    if (searchTerm) {
      hospitals = hospitals.filter((hospital) =>
        hospital.org_nm.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return NextResponse.json({
      hospitals,
      totalCount: hospitals.length,
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      {
        error: "Failed to fetch hospitals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


