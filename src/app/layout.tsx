import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.SITE_URL || "https://yeogin.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "여긴 - 진짜 후기로 연결되는 체험단",
    template: "%s | 여긴",
  },
  description:
    "맛집·카페·뷰티·식품 등 매일 새로운 체험단 캠페인. 무료로 신청하고 솔직한 후기를 남기세요.",
  keywords: [
    "체험단", "블로그체험단", "인스타체험단", "유튜브체험단",
    "맛집체험단", "강남맛집", "리뷰", "인플루언서마케팅", "여긴",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "여긴",
    title: "여긴 - 진짜 후기로 연결되는 체험단",
    description: "맛집·카페·뷰티 등 매일 새 캠페인. 무료로 시작!",
  },
  twitter: {
    card: "summary_large_image",
    title: "여긴 - 진짜 후기로 연결되는 체험단",
    description: "맛집·카페·뷰티 등 매일 새 캠페인. 무료로 시작!",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
