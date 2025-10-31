import { NextRequest, NextResponse } from "next/server";
import { HospitalApiResponse, NonCoveredItem } from "@/types";

const API_BASE_URL = "http://apis.data.go.kr/B551182/nonPaymentDamtInfoService";

/**
 * 비급여 항목 조회 API
 * GET /api/noncovered?hospital_codes=xxx,yyy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalCodes = searchParams.get("hospital_codes");

    if (!hospitalCodes) {
      return NextResponse.json(
        { error: "hospital_codes parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const codes = hospitalCodes.split(",");
    const allItems: NonCoveredItem[] = [];

    // 병원별로 API 호출
    for (const orgCd of codes) {
      try {
        const url = new URL(`${API_BASE_URL}/getNonPaymentItemHmDamtInfo`);

        url.searchParams.set("ServiceKey", apiKey);
        url.searchParams.set("pageNo", "1");
        url.searchParams.set("numOfRows", "1000");
        url.searchParams.set("resultType", "json");
        url.searchParams.set("orgCd", orgCd);

        const response = await fetch(url.toString(), {
          next: { revalidate: 3600 }, // 1시간 캐시
        });

        if (!response.ok) {
          console.error(`API request failed for ${orgCd}:`, response.statusText);
          continue;
        }

        const data: HospitalApiResponse = await response.json();

        if (data.response?.header?.resultCode !== "00") {
          console.error(`API error for ${orgCd}:`, data.response?.header?.resultMsg || "Unknown error");
          continue;
        }

        // 안전한 데이터 추출
        const items = data.response?.body?.items;
        const validItems: NonCoveredItem[] = Array.isArray(items) ? items : [];
        allItems.push(...validItems);
      } catch (error) {
        console.error(`Error fetching items for ${orgCd}:`, error);
        // 개별 병원 실패는 무시하고 계속 진행
      }
    }

    return NextResponse.json({
      items: allItems,
      totalCount: allItems.length,
    });
  } catch (error) {
    console.error("Error fetching non-covered items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch non-covered items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


