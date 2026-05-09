"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('yeogin_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-100">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-7xl">⚠️</div>
            <h1 className="mt-4 text-2xl font-black">앗, 문제가 발생했어요</h1>
            <p className="mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
              잠깐 사이에 오류가 발생했어요. 새로고침하거나 홈으로 돌아가
              다시 시도해주세요.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-[10px] text-ink-400">
                error: {error.digest}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={reset} className="btn-primary">
                다시 시도
              </button>
              <Link href="/" className="btn-outline">
                홈으로 가기
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
