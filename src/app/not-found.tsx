import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-ink-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-7xl">🧭</div>
            <h1 className="mt-4 text-3xl font-black">404</h1>
            <p className="mt-2 text-sm text-ink-500">
              찾으시는 페이지가 사라졌거나, 주소가 틀렸어요.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/" className="btn-primary">
                홈으로 가기
              </Link>
              <Link href="/campaigns" className="btn-outline">
                캠페인 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
