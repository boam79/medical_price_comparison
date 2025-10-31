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
        {children}
      </body>
    </html>
  );
}
