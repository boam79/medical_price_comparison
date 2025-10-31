import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "의료기관 비급여 항목 비교 서비스 | 병원 가격 비교",
  description:
    "여러 의료기관의 비급여 진료비를 한눈에 비교하세요. 공공데이터 기반 실시간 가격 정보를 제공합니다.",
  keywords: ["비급여", "의료비", "병원 비교", "진료비", "의료기관", "가격 비교"],
  authors: [{ name: "의료비 비교 자동화 프로젝트" }],
  openGraph: {
    title: "의료기관 비급여 항목 비교 서비스",
    description: "여러 의료기관의 비급여 진료비를 한눈에 비교하세요",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "의료기관 비급여 항목 비교 서비스",
    description: "여러 의료기관의 비급여 진료비를 한눈에 비교하세요",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t bg-white/60 backdrop-blur py-6 text-sm text-gray-600">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex flex-col gap-2">
                <p>
                  제작자: <span className="font-medium">boam79</span> · 문의: <a className="underline" href="mailto:ckadltmfxhrxhrxhr@gmail.com">ckadltmfxhrxhrxhr@gmail.com</a>
                </p>
                <p>
                  가격 정보는 공공데이터 응답을 기반으로 하며, 실제 진료비와 다를 수 있습니다.
                </p>
                <p>
                  데이터 출처: <a className="underline" href="https://www.data.go.kr/" target="_blank" rel="noopener noreferrer">공공데이터포털</a> · 제공기관: 건강보험심사평가원
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
