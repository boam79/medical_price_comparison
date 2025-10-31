import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "서비스 소개 | 의료기관 비급여 항목 비교",
  description:
    "의료기관 비급여 항목 비교 서비스에 대해 알아보세요. 공공데이터 기반 투명한 가격 정보를 제공합니다.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              서비스 소개
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              여러 의료기관의 비급여 진료비를 쉽게 비교할 수 있습니다
            </p>
          </div>

          {/* 주요 기능 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>주요 기능</CardTitle>
              <CardDescription>이 서비스의 핵심 기능들을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-lg">🔍 병원 검색</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  시도, 시군구, 병원명으로 원하는 의료기관을 쉽게 찾아보세요.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-lg">📊 가격 비교</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  여러 병원의 공통 비급여 항목을 자동으로 비교하고 가격 차이를 한눈에 확인하세요.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-lg">📥 데이터 내보내기</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  비교 결과를 CSV 파일로 다운로드하여 오프라인에서도 활용할 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-lg">📱 반응형 디자인</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  모바일, 태블릿, 데스크톱 모든 기기에서 편리하게 사용할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 데이터 출처 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>데이터 출처</CardTitle>
              <CardDescription>신뢰할 수 있는 공공 데이터를 활용합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                이 서비스는{" "}
                <a
                  href="https://www.data.go.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 underline dark:text-blue-400"
                >
                  공공데이터포털(data.go.kr)
                </a>
                의 비급여 진료비 정보를 활용하여 제작되었습니다.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ⚠️ 실제 진료비는 병원마다 다를 수 있으므로, 정확한 가격은 의료기관에 직접 문의해주세요.
              </p>
            </CardContent>
          </Card>

          {/* 이용 방법 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>이용 방법</CardTitle>
              <CardDescription>간단한 3단계로 시작하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">병원 검색 및 선택</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    비교하고 싶은 병원을 검색하여 2개 이상 선택하세요.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">비교 실행</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "비교하기" 버튼을 클릭하여 공통 비급여 항목을 확인하세요.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">결과 확인 및 저장</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    가격 차이를 확인하고 필요시 CSV 파일로 다운로드하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>주요 사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900">
                <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
                  ⚠️ 제한 사항
                </h3>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>• 공공데이터의 응답 시간이나 데이터 부재로 인한 오류가 발생할 수 있습니다.</li>
                  <li>• 표시된 가격은 참고용이며, 실제 진료비와 다를 수 있습니다.</li>
                  <li>• 모든 병원의 모든 항목이 포함되지 않을 수 있습니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="text-center">
            <Link href="/">
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700">
                시작하기
              </button>
            </Link>
          </div>

          {/* JSON-LD 구조화 데이터 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "의료기관 비급여 항목 비교 서비스",
                description:
                  "여러 의료기관의 비급여 진료비를 한눈에 비교하는 웹 애플리케이션",
                url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app",
                applicationCategory: "HealthApplication",
                operatingSystem: "Any",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "KRW",
                },
                author: {
                  "@type": "Organization",
                  name: "의료비 비교 자동화 프로젝트",
                },
              }),
            }}
          />
        </div>
      </div>
    </div>
  );
}

