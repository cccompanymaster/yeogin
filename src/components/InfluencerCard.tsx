import Link from "next/link";
import { TRUST_LABEL } from "@/lib/format";

export type InfluencerCardData = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  trustGrade: string;
  heartCount: number;
  blogVisitors: number | null;
  blogVerifiedAt: Date | null;
  instaFollowers: number | null;
  instaVerifiedAt: Date | null;
  youtubeSubscribers: number | null;
  youtubeVerifiedAt: Date | null;
  completedCount?: number;
};

const fmt = (n: number | null | undefined) => {
  if (!n) return null;
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}천`;
  return n.toLocaleString();
};

const GRADE_BG: Record<string, string> = {
  BRONZE: "bg-amber-700",
  SILVER: "bg-ink-400",
  GOLD: "bg-yellow-500",
  PLATINUM: "bg-blue-500",
  DIAMOND: "bg-pink-500",
};

export function InfluencerCard({ u }: { u: InfluencerCardData }) {
  const blog = fmt(u.blogVisitors);
  const insta = fmt(u.instaFollowers);
  const yt = fmt(u.youtubeSubscribers);

  return (
    <Link
      href={`/advertiser/influencers/${u.id}`}
      className="card group flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
          {u.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatarUrl} alt={u.nickname} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">👤</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="line-clamp-1 text-sm font-bold">{u.nickname}</span>
            <span
              className={`badge text-white ${GRADE_BG[u.trustGrade] || "bg-ink-400"}`}
            >
              {TRUST_LABEL[u.trustGrade]}
            </span>
          </div>
          {u.bio && (
            <div className="line-clamp-1 text-[11px] text-ink-500 dark:text-ink-400">
              {u.bio}
            </div>
          )}
          <div className="text-[11px] text-ink-500 dark:text-ink-400">
            {u.region ?? "지역 미설정"}
            {typeof u.completedCount === "number" && (
              <> · 완료 {u.completedCount}회</>
            )}
            {u.heartCount > 0 && <> · ❤️ {u.heartCount}</>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
        <Metric
          label="블로그"
          value={blog}
          verified={!!u.blogVerifiedAt}
          color="#03c75a"
        />
        <Metric
          label="인스타"
          value={insta}
          verified={!!u.instaVerifiedAt}
          color="#e1306c"
        />
        <Metric
          label="유튜브"
          value={yt}
          verified={!!u.youtubeVerifiedAt}
          color="#ff0000"
        />
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  verified,
  color,
}: {
  label: string;
  value: string | null;
  verified: boolean;
  color: string;
}) {
  if (!value) {
    return (
      <div className="rounded-md bg-ink-50 px-2 py-1.5 text-center text-ink-400 dark:bg-ink-900 dark:text-ink-500">
        <div className="text-[10px]">{label}</div>
        <div className="font-bold">—</div>
      </div>
    );
  }
  return (
    <div
      className="rounded-md px-2 py-1.5 text-center text-white"
      style={{ background: color, opacity: verified ? 1 : 0.45 }}
    >
      <div className="text-[10px]">
        {label} {verified && "✓"}
      </div>
      <div className="font-black">{value}</div>
    </div>
  );
}
