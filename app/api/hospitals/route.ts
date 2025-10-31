import { NextRequest, NextResponse } from "next/server";
import { HospitalApiResponse, Hospital } from "@/types";

const API_BASE_URL = "http://apis.data.go.kr/B551182/nonPaymentDamtInfoService";

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

    // 공공데이터 API 호출
    const url = new URL(`${API_BASE_URL}/getNonPaymentItemCdListNm`);

    // 필수 파라미터
    url.searchParams.set("ServiceKey", apiKey);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "1000");
    url.searchParams.set("resultType", "json");

    // 선택 파라미터
    if (sido) url.searchParams.set("sido", sido);
    if (gugun) url.searchParams.set("gugun", gugun);

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      console.error(`API request failed. Status: ${response.status}, URL: ${url.toString()}`);
      // API 호출 실패 시 샘플 데이터 반환 (개발용)
      return NextResponse.json({
        hospitals: [
          {
            org_cd: "A001",
            org_nm: "서울아산병원",
            si: "서울특별시",
            gun: "송파구"
          },
          {
            org_cd: "A002",
            org_nm: "삼성서울병원",
            si: "서울특별시",
            gun: "강남구"
          },
          {
            org_cd: "A003",
            org_nm: "세브란스병원",
            si: "서울특별시",
            gun: "서대문구"
          }
        ],
        totalCount: 3,
        _isMock: true
      });
    }

    const data: HospitalApiResponse = await response.json();
    console.log("API Response structure:", JSON.stringify(data).substring(0, 500));

    // 에러 처리
    if (data.response?.header?.resultCode !== "00") {
      return NextResponse.json(
        {
          error: data.response?.header?.resultMsg || "API 호출 실패",
        },
        { status: 400 }
      );
    }

    // 안전한 데이터 추출
    const items = data.response?.body?.items;
    let hospitals: Hospital[] = [];
    
    if (Array.isArray(items)) {
      hospitals = items as Hospital[];
    } else if (items) {
      hospitals = [items as Hospital];
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


