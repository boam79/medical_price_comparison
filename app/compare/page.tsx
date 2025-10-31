"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComparisonResult } from "@/types";

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitalNames, setHospitalNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchComparison = async () => {
      const codes = searchParams.get("codes");
      const names = searchParams.get("names");

      if (!codes || !names) {
        setError("병원 정보가 없습니다.");
        setLoading(false);
        return;
      }

      const hospitalCodes = codes.split(",");
      const hospitalNamesList = decodeURIComponent(names).split(",");
      setHospitalNames(hospitalNamesList);

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hospital_codes: hospitalCodes,
            hospital_names: hospitalNamesList,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "비교 실패");
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [searchParams]);

  const handleExportCSV = () => {
    if (results.length === 0) return;

    // CSV 헤더
    const headers = ["항목명", "항목코드", ...hospitalNames, "최대가격차", "가격차이율(%)"];
    const rows = results.map((item) => {
      const prices = item.hospitals.map((h) => h.price);
      return [
        item.item_name,
        item.item_code,
        ...prices,
        item.price_difference || 0,
        item.price_difference_percentage
          ? item.price_difference_percentage.toFixed(2)
          : "0.00",
      ];
    });

    // CSV 생성
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // BOM 추가 (Excel 한글 인코딩)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "비급여_항목_비교.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return "정보 없음";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "정보 없음";
    return `${numPrice.toLocaleString()}원`;
  };

  // 모바일 카드형 레이아웃 컴포넌트
  const MobileCardView = () => (
    <div className="space-y-4 md:hidden">
      {results.map((item, idx) => (
        <Card key={`${item.item_code}-${idx}`}>
          <CardHeader>
            <CardTitle className="text-base">{item.item_name}</CardTitle>
            <CardDescription className="text-xs">코드: {item.item_code}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.hospitals.map((hospital) => (
                <div
                  key={hospital.name}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                >
                  <span className="font-medium text-sm">{hospital.name}</span>
                  <span className="font-bold text-lg">{formatPrice(hospital.price)}</span>
                </div>
              ))}
              {item.price_difference_percentage && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    가격 차이
                  </div>
                  <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {item.price_difference_percentage.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // 데스크톱 테이블형 레이아웃 컴포넌트
  const DesktopTableView = () => (
    <div className="hidden md:block">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">항목명</TableHead>
              <TableHead className="min-w-[100px]">항목코드</TableHead>
              {hospitalNames.map((name) => (
                <TableHead key={name} className="min-w-[120px] text-center">
                  {name}
                </TableHead>
              ))}
              <TableHead className="min-w-[100px] text-center">가격차이</TableHead>
              <TableHead className="min-w-[80px] text-center">차이율</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((item, idx) => (
              <TableRow key={`${item.item_code}-${idx}`}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell className="text-xs text-gray-500">{item.item_code}</TableCell>
                {item.hospitals.map((hospital) => (
                  <TableCell key={hospital.name} className="text-center font-medium">
                    {formatPrice(hospital.price)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium text-blue-600">
                  {item.price_difference
                    ? `${item.price_difference.toLocaleString()}원`
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {item.price_difference_percentage
                      ? `${item.price_difference_percentage.toFixed(1)}%`
                      : "-"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            비교 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              메인으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              비교 결과
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {results.length}개의 공통 항목을 찾았습니다
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="whitespace-nowrap"
            >
              다시 비교
            </Button>
            <Button
              onClick={handleExportCSV}
              className="whitespace-nowrap"
            >
              📥 CSV 다운로드
            </Button>
          </div>
        </div>

        {/* 결과가 없는 경우 */}
        {results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                공통 항목을 찾을 수 없습니다
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                선택하신 병원들 간에 공통된 비급여 항목이 없거나 데이터가 없습니다.
              </p>
              <Button onClick={() => router.push("/")}>다른 병원 선택</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>총 비교 항목</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>평균 가격 차이율</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(
                      results.reduce(
                        (sum, item) =>
                          sum + (item.price_difference_percentage || 0),
                        0
                      ) / results.length
                    ).toFixed(1)}
                    %
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>최대 가격 차이율</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.max(
                      ...results.map((item) => item.price_difference_percentage || 0)
                    ).toFixed(1)}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 비교 결과 표시 */}
            <MobileCardView />
            <DesktopTableView />
          </>
        )}
      </div>
    </div>
  );
}

