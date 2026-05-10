import Link from "next/link";
import { CHANNEL_LABEL, TYPE_LABEL, dday, won } from "@/lib/format";
import { FavoriteButton } from "@/components/FavoriteButton";
import { scoreColor } from "@/lib/matching";

type Props = {
  c: {
    id: string;
    title: string;
    thumbnail: string;
    type: string;
    channel: string;
    category: string;
    region: string | null;
    offer: string;
    offerValue: number;
    capacity: number;
    appliedCount: number;
    applyEnd: Date | string;
    fastMatch: boolean;
  };
  favorited?: boolean;
  loggedIn?: boolean;
  matchScore?: number;
};

export function CampaignCard({
  c,
  favorited = false,
  loggedIn = false,
  matchScore: ms,
}: Props) {
  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="card tilt-3d group overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.thumbnail}
          alt={c.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1">
          <span className="badge bg-ink-900/80 text-white">{TYPE_LABEL[c.type]}</span>
          {c.fastMatch && (
            <span className="badge bg-brand-500 text-white">⚡ 빠른선정</span>
          )}
          {typeof ms === "number" && (
            <span
              className={`badge tilt-pop ${scoreColor(ms)}`}
              title="나와의 매칭 점수"
            >
              ✦ {ms}
            </span>
          )}
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <span className="badge bg-white/95 text-brand-600">{dday(c.applyEnd)}</span>
          <FavoriteButton
            campaignId={c.id}
            initialFavorited={favorited}
            loggedIn={loggedIn}
            size="sm"
          />
        </div>
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-500 dark:text-ink-400">
          <span>{c.category}</span>
          <span>·</span>
          <span>{CHANNEL_LABEL[c.channel]}</span>
          {c.region && (
            <>
              <span>·</span>
              <span>{c.region}</span>
            </>
          )}
        </div>
        <div className="line-clamp-2 text-sm font-bold leading-tight text-ink-900 dark:text-ink-100">
          {c.title}
        </div>
        <div className="line-clamp-1 text-xs text-ink-600 dark:text-ink-300">{c.offer}</div>
        <div className="flex items-center justify-between pt-1.5 text-[11px]">
          <span className="font-semibold text-brand-600 dark:text-brand-400">{won(c.offerValue)} 상당</span>
          <span className="text-ink-500 dark:text-ink-400">
            {c.appliedCount}명 신청 / {c.capacity}명 모집
          </span>
        </div>
      </div>
    </Link>
  );
}
