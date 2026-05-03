import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "여긴 - 진짜 후기로 연결되는 체험단",
  description: "맛집·카페·뷰티·식품 등 매일 새로운 체험단 캠페인. 무료로 신청하세요.",
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
