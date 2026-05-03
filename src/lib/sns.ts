// 외부 SNS 가져오기 헬퍼
// - YouTube: 공식 Data API v3 (API 키만 필요, 무료 10,000 unit/일)
// - Naver Blog: 공식 API 없음 → 수동 입력
// - Instagram: 공식 Graph API는 본인 비즈니스 계정만 → 수동 입력
// - TikTok: 수동 입력

export type FetchResult =
  | { ok: true; metric: number; verifiedHandle?: string }
  | { ok: false; error: string };

const YT_API = "https://www.googleapis.com/youtube/v3";

function pickHandle(url: string): { type: "id" | "handle" | "user" | null; value: string } {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\//, "");
    if (path.startsWith("channel/")) return { type: "id", value: path.split("/")[1] };
    if (path.startsWith("@")) return { type: "handle", value: path.replace(/\/.*$/, "") };
    if (path.startsWith("user/")) return { type: "user", value: path.split("/")[1] };
    if (path.startsWith("c/")) return { type: "user", value: path.split("/")[1] };
    return { type: null, value: "" };
  } catch {
    if (url.startsWith("@")) return { type: "handle", value: url };
    return { type: null, value: "" };
  }
}

export async function fetchYouTubeSubs(url: string): Promise<FetchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { ok: false, error: "YouTube API 키가 설정되지 않았습니다 (관리자 문의)." };

  const parsed = pickHandle(url);
  if (!parsed.type) return { ok: false, error: "유튜브 URL 형식을 인식할 수 없습니다." };

  let endpoint = "";
  if (parsed.type === "id") {
    endpoint = `${YT_API}/channels?part=statistics,snippet&id=${parsed.value}&key=${apiKey}`;
  } else if (parsed.type === "handle") {
    endpoint = `${YT_API}/channels?part=statistics,snippet&forHandle=${encodeURIComponent(parsed.value)}&key=${apiKey}`;
  } else {
    endpoint = `${YT_API}/channels?part=statistics,snippet&forUsername=${encodeURIComponent(parsed.value)}&key=${apiKey}`;
  }

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `YouTube API 오류 (${res.status})` };
    const data = await res.json();
    const items = (data.items as Array<{ statistics?: { subscriberCount?: string }; snippet?: { title?: string } }>) || [];
    if (items.length === 0) return { ok: false, error: "채널을 찾을 수 없습니다." };
    const subs = Number(items[0].statistics?.subscriberCount || 0);
    return { ok: true, metric: subs, verifiedHandle: items[0].snippet?.title };
  } catch {
    return { ok: false, error: "YouTube 정보 조회 중 오류가 발생했습니다." };
  }
}

export function isYouTubeAutoEnabled() {
  return !!process.env.YOUTUBE_API_KEY;
}
