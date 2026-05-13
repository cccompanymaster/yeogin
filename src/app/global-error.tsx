"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#fff7ed",
          color: "#1f2937",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 72 }}>🛟</div>
          <h1 style={{ marginTop: 16, fontSize: 24, fontWeight: 900 }}>
            치명적인 오류가 발생했어요
          </h1>
          <p
            style={{
              marginTop: 8,
              maxWidth: 480,
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터로 문의해주세요.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "monospace",
                fontSize: 10,
                color: "#9ca3af",
              }}
            >
              error: {error.digest}
            </p>
          )}
          <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background: "#f97316",
                color: "white",
                fontWeight: 700,
                border: 0,
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background: "white",
                color: "#374151",
                fontWeight: 700,
                border: "1px solid #d1d5db",
                textDecoration: "none",
              }}
            >
              홈으로 가기
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
