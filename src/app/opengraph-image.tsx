import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "여긴 - 진짜 후기로 연결되는 체험단";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            📍
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, opacity: 0.95 }}>여긴</div>
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.05,
            marginTop: 40,
          }}
        >
          진짜 후기로
        </div>
        <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05 }}>
          연결되는 체험단
        </div>
        <div
          style={{
            fontSize: 28,
            opacity: 0.92,
            marginTop: 32,
          }}
        >
          맛집·카페·뷰티·식품 — 매일 새로운 캠페인
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 24,
            fontWeight: 700,
            background: "#fff",
            color: "#c2410c",
            padding: "16px 28px",
            borderRadius: 999,
          }}
        >
          yeogin.kr
        </div>
      </div>
    ),
    { ...size }
  );
}
