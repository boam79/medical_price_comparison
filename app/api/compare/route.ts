import { NextRequest, NextResponse } from "next/server";
import { NonCoveredItem, ComparisonResult, ComparisonInput } from "@/types";
import { combinedSimilarity } from "@/lib/utils/similarity";

/**
 * 병원 간 비급여 항목 비교 API
 * POST /api/compare
 * Body: { hospital_codes: string[], hospital_names: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body: ComparisonInput = await request.json();
    const { hospital_codes, hospital_names } = body;

    if (!hospital_codes || hospital_codes.length < 2) {
      return NextResponse.json(
        { error: "At least 2 hospitals are required for comparison" },
        { status: 400 }
      );
    }

    // 비급여 항목 조회
    const nonCoveredResponse = await fetch(
      `${request.nextUrl.origin}/api/noncovered?hospital_codes=${hospital_codes.join(",")}`
    );

    if (!nonCoveredResponse.ok) {
      const errorData = await nonCoveredResponse.json();
      return NextResponse.json(
        { error: "Failed to fetch non-covered items", details: errorData },
        { status: 500 }
      );
    }

    const { items }: { items: NonCoveredItem[] } = await nonCoveredResponse.json();

    // 병원별로 항목 그룹화
    const itemsByHospital: Record<string, NonCoveredItem[]> = {};
    items.forEach((item) => {
      if (!itemsByHospital[item.org_cd]) {
        itemsByHospital[item.org_cd] = [];
      }
      itemsByHospital[item.org_cd].push(item);
    });

    // 비교 결과 생성
    const comparisonResults: ComparisonResult[] = [];
    const processedItems = new Set<string>(); // 중복 처리 방지

    // 첫 번째 병원의 항목을 기준으로 비교
    const firstHospitalCode = hospital_codes[0];
    const firstHospitalItems = itemsByHospital[firstHospitalCode] || [];

    for (const baseItem of firstHospitalItems) {
      const itemKey = `${baseItem.apc_cd}-${baseItem.apc_nm}`;
      if (processedItems.has(itemKey)) continue;
      processedItems.add(itemKey);

      const comparisonResult: ComparisonResult = {
        item_name: baseItem.apc_nm,
        item_code: baseItem.apc_cd,
        hospitals: [],
      };

      // 각 병원에서 해당 항목 찾기
      for (let i = 0; i < hospital_codes.length; i++) {
        const hospitalCode = hospital_codes[i];
        const hospitalName = hospital_names?.[i] || hospitalCode;
        const hospitalItems = itemsByHospital[hospitalCode] || [];

        // 정확한 코드 매칭 먼저 시도
        let matchedItem = hospitalItems.find(
          (item) => item.apc_cd === baseItem.apc_cd
        );

        // 코드 매칭 실패 시 유사도 기반 매칭
        if (!matchedItem) {
          let bestMatch = null;
          let bestScore = 0;

          for (const item of hospitalItems) {
            const similarity = combinedSimilarity(
              baseItem.apc_nm,
              item.apc_nm
            );
            if (similarity > bestScore && similarity >= 0.8) {
              bestScore = similarity;
              bestMatch = item;
            }
          }

          matchedItem = bestMatch || undefined;
        }

        if (matchedItem) {
          const price = matchedItem.price
            ? typeof matchedItem.price === "string"
              ? parseFloat(matchedItem.price.replace(/,/g, ""))
              : matchedItem.price
            : 0;

          comparisonResult.hospitals.push({
            name: hospitalName,
            price: price,
            unit: matchedItem.med_rnk_unit,
          });
        }
      }

      // 최소 2개 병원에서 데이터가 있는 경우만 결과에 포함
      if (comparisonResult.hospitals.length >= 2) {
        // 가격 차이 계산
        const prices = comparisonResult.hospitals.map((h) =>
          typeof h.price === "number" ? h.price : 0
        );
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceDiff = maxPrice - minPrice;
        const priceDiffPercent =
          minPrice > 0 ? (priceDiff / minPrice) * 100 : 0;

        comparisonResult.price_difference = priceDiff;
        comparisonResult.price_difference_percentage = priceDiffPercent;

        comparisonResults.push(comparisonResult);
      }
    }

    // 가격 차이 기준 정렬
    comparisonResults.sort((a, b) => {
      const diffA = a.price_difference_percentage || 0;
      const diffB = b.price_difference_percentage || 0;
      return diffB - diffA;
    });

    return NextResponse.json({
      results: comparisonResults,
      totalResults: comparisonResults.length,
      hospitals: hospital_codes.map((code, i) => ({
        code,
        name: hospital_names?.[i] || code,
      })),
    });
  } catch (error) {
    console.error("Error comparing items:", error);
    return NextResponse.json(
      {
        error: "Failed to compare items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


