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
    const apiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    // 공공데이터 API 호출 (병원기본목록)
    const url = new URL(`${API_BASE_URL_PRIMARY}/getHospBasisList`);

    // 필수 파라미터
    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "50");
    // 일부 게이트웨이는 JSON 응답을 지원 (미지원 시 XML → mock fallback 동작)
    url.searchParams.set("_type", "json");

    // 선택 파라미터
    if (sido) url.searchParams.set("sidoCd", sido);
    if (gugun) url.searchParams.set("sgguCd", gugun);
    if (searchTerm) url.searchParams.set("yadmNm", searchTerm);

    let response = await fetch(url.toString(), {
      next: { revalidate: 120 },
      cache: "no-store",
    });

    if (!response.ok) {
      // 1차 실패 시 http 베이스로 재시도
      const fbUrl = new URL(url.toString().replace(API_BASE_URL_PRIMARY, API_BASE_URL_FALLBACK));
      response = await fetch(fbUrl.toString(), { next: { revalidate: 120 }, cache: "no-store" });
      if (!response.ok) {
        console.error(`Hospitals API failed. primary=${url.toString()} status=${response.status}`);
        return NextResponse.json(
          { error: "Upstream API request failed", upstreamStatus: response.status },
          { status: 502 }
        );
      }
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


