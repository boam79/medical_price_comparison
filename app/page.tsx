"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const router = useRouter();
  const [selectedHospitals, setSelectedHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidoFilter, setSidoFilter] = useState("");
  const [gugunFilter, setGugunFilter] = useState("");

  // 병원 목록 조회
  const { data, error, isLoading } = useSWR<{
    hospitals: Hospital[];
    totalCount: number;
  }>(() => {
    if (!searchTerm) return null;
    const params = new URLSearchParams();
    params.set("search", searchTerm);
    if (sidoFilter) params.set("sido", sidoFilter);
    if (gugunFilter) params.set("gugun", gugunFilter);
    return `/api/hospitals?${params.toString()}`;
  }, fetcher);

  const handleHospitalSelect = (hospital: Hospital) => {
    // 중복 선택 방지
    if (selectedHospitals.find((h) => h.org_cd === hospital.org_cd)) {
      return;
    }
    setSelectedHospitals([...selectedHospitals, hospital]);
  };

  const handleRemoveHospital = (orgCd: string) => {
    setSelectedHospitals(
      selectedHospitals.filter((h) => h.org_cd !== orgCd)
    );
  };

  const handleCompare = () => {
    if (selectedHospitals.length < 2) {
      alert("최소 2개 이상의 병원을 선택해주세요.");
      return;
    }

    // 비교 페이지로 이동
    const hospitalCodes = selectedHospitals.map((h) => h.org_cd).join(",");
    const hospitalNames = selectedHospitals.map((h) => h.org_nm).join(",");
    router.push(
      `/compare?codes=${hospitalCodes}&names=${encodeURIComponent(hospitalNames)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-end gap-2">
            <Link href="/about">
              <Button variant="outline" size="sm">
                서비스 소개
              </Button>
            </Link>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
            🏥 의료기관 비급여 항목 비교
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            여러 병원의 비급여 진료비를 한눈에 비교하세요
          </p>
        </div>

        {/* 선택된 병원 표시 */}
        {selectedHospitals.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-lg">선택된 병원 ({selectedHospitals.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedHospitals.map((hospital) => (
                  <div
                    key={hospital.org_cd}
                    className="group relative inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium">
                      {hospital.org_nm}
                    </span>
                    <button
                      onClick={() => handleRemoveHospital(hospital.org_cd)}
                      className="rounded-full p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                      aria-label="제거"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색 카드 */}
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>병원 검색</CardTitle>
            <CardDescription>
              비교하고 싶은 병원을 검색하여 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 검색 입력 */}
            <div className="space-y-2">
              <Input
                placeholder="병원 이름을 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-base"
              />
            </div>

            {/* 필터 (간단한 텍스트 입력으로 대체) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  시도
                </label>
                <Input
                  placeholder="예: 서울특별시"
                  value={sidoFilter}
                  onChange={(e) => setSidoFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  시군구
                </label>
                <Input
                  placeholder="예: 강남구"
                  value={gugunFilter}
                  onChange={(e) => setGugunFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* 검색 결과 */}
            {searchTerm && (
              <div className="mt-4 space-y-2">
                {isLoading && (
                  <div className="py-8 text-center text-gray-500">
                    검색 중...
                  </div>
                )}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900 dark:text-red-400">
                    검색 중 오류가 발생했습니다: {error.message}
                  </div>
                )}
                {data && data.hospitals.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                )}
                {data && data.hospitals.length > 0 && (
                  <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    {data.hospitals.map((hospital) => (
                      <div
                        key={hospital.org_cd}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div>
                          <div className="font-medium">{hospital.org_nm}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {hospital.si} {hospital.gun}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleHospitalSelect(hospital)}
                          disabled={selectedHospitals.some(
                            (h) => h.org_cd === hospital.org_cd
                          )}
                        >
                          {selectedHospitals.some((h) => h.org_cd === hospital.org_cd)
                            ? "선택됨"
                            : "선택"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 비교 버튼 */}
            <div className="pt-4">
              <Button
                onClick={handleCompare}
                disabled={selectedHospitals.length < 2}
                className="w-full text-lg"
                size="lg"
              >
                {selectedHospitals.length < 2
                  ? "병원을 2개 이상 선택해주세요"
                  : "비교하기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내 메시지 */}
        <div className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            💡 이 서비스는 공공데이터포털의 비급여 진료비 정보를 제공합니다.
          </p>
          <p className="mt-1">
            실제 진료비는 병원마다 다를 수 있으니, 정확한 가격은 직접 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
