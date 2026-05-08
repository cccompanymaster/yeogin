import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ApplyModal } from "@/components/ApplyModal";
import { ReportButton } from "@/components/ReportButton";
import { CampaignCard } from "@/components/CampaignCard";
import { StarRating } from "@/components/StarRating";
import { getUserSession } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await db.campaign.findUnique({
    where: { id },
    select: { title: true, offer: true, thumbnail: true, category: true },
  });
  if (!c) return { title: "캠페인" };
  return {
    title: c.title,
    description: `${c.category} · ${c.offer}`,
    openGraph: {
      title: c.title,
      description: c.offer,
      images: [c.thumbnail],
    },
  };
}
import {
  CHANNEL_LABEL,
  TYPE_LABEL,
  dday,
  fmtDate,
  won,
} from "@/lib/format";

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await db.campaign.findUnique({
    where: { id },
    include: { advertiser: true },
  });
  if (!c) notFound();

  const session = await getUserSession();
  const myApp = session
    ? await db.application.findUnique({
        where: { campaignId_userId: { campaignId: c.id, userId: session.id } },
      })
    : null;
  const me = session
    ? await db.user.findUnique({ where: { id: session.id } })
    : null;

  const defaultUrl =
    c.channel === "BLOG"
      ? me?.blogUrl
      : c.channel === "INSTA"
        ? me?.instaUrl
        : me?.youtubeUrl;

  const ended = new Date(c.applyEnd) < new Date() || c.status !== "OPEN";

  // 비슷한 캠페인 추천: 같은 카테고리 우선 → 같은 타입 보강
  const similarRaw = await db.campaign.findMany({
    where: {
      id: { not: c.id },
      status: "OPEN",
      applyEnd: { gt: new Date() },
      OR: [{ category: c.category }, { type: c.type }],
    },
    orderBy: [{ appliedCount: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
  const similar = similarRaw.slice(0, 4);

  // 이 광고주의 다른 캠페인
  const otherFromAdv = await db.campaign.findMany({
    where: {
      advertiserId: c.advertiserId,
      id: { not: c.id },
      status: "OPEN",
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // 이 캠페인 승인 후기 (있다면)
  const recentReviews = await db.review.findMany({
    where: { campaignId: c.id, status: "APPROVED" },
    include: { user: true },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  let favSet = new Set<string>();
  if (session && (similar.length > 0 || otherFromAdv.length > 0)) {
    const ids = [...similar, ...otherFromAdv].map((x) => x.id);
    const favs = await db.favorite.findMany({
      where: { userId: session.id, campaignId: { in: ids } },
      select: { campaignId: true },
    });
    favSet = new Set(favs.map((f) => f.campaignId));
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.thumbnail} alt={c.title} className="aspect-[16/10] w-full object-cover" />
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap gap-1.5">
              <span className="badge bg-ink-900 text-white">{TYPE_LABEL[c.type]}</span>
              <span className="badge bg-ink-100 text-ink-700">{CHANNEL_LABEL[c.channel]}</span>
              <span className="badge bg-ink-100 text-ink-700">{c.category}</span>
              {c.region && (
                <span className="badge bg-ink-100 text-ink-700">{c.region}</span>
              )}
              {c.fastMatch && (
                <span className="badge bg-brand-500 text-white">⚡ 빠른선정</span>
              )}
            </div>
            <h1 className="text-2xl font-black leading-tight">{c.title}</h1>
            <div className="text-sm text-ink-600">{c.advertiser.companyName}</div>
            {c.address && (
              <div className="text-xs text-ink-500">📍 {c.address}</div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">제공 내역</h2>
          <div className="rounded-lg bg-brand-50 p-4 text-sm font-semibold text-brand-700">
            {c.offer}
          </div>
          <div className="mt-2 text-xs text-ink-500">
            제공 가치: <b className="text-ink-800">{won(c.offerValue)} 상당</b>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">캠페인 소개</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
            {c.description}
          </p>
        </div>

        {recentReviews.length > 0 && (
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              📣 이전 참여자 후기
              <span className="text-xs font-normal text-ink-500">
                평균{" "}
                <b className="text-amber-500">
                  {(recentReviews.reduce((s, r) => s + (r.rating || 0), 0) /
                    recentReviews.length).toFixed(1)}
                </b>
                점
              </span>
            </h2>
            <div className="space-y-2">
              {recentReviews.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-ink-100 p-3 hover:bg-ink-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{r.user.nickname}</span>
                    {r.rating && <StarRating rating={r.rating} size="sm" />}
                  </div>
                  {r.highlight && (
                    <p className="mt-1 text-sm italic text-amber-900">"{r.highlight}"</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">미션 가이드</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
            {c.guide}
          </p>
          {c.keywords && (
            <div className="mt-3">
              <div className="label">필수 키워드</div>
              <div className="flex flex-wrap gap-1">
                {c.keywords.split(",").map((k) => (
                  <span key={k} className="badge bg-ink-100 text-ink-700">
                    #{k.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4 md:sticky md:top-20 md:h-fit">
        <div className="card space-y-4 p-5">
          <div>
            <div className="text-xs text-ink-500">신청 마감</div>
            <div className="text-2xl font-black text-brand-600">{dday(c.applyEnd)}</div>
            <div className="text-[11px] text-ink-500">{fmtDate(c.applyEnd)}까지</div>
          </div>
          <hr className="border-ink-100" />
          <Row label="모집 인원" value={`${c.capacity}명`} />
          <Row label="현재 신청자" value={`${c.appliedCount}명`} />
          <Row label="발표일" value={fmtDate(c.announceAt)} />
          <Row
            label="리뷰 기간"
            value={`${fmtDate(c.reviewStart)} ~ ${fmtDate(c.reviewEnd)}`}
          />
          <hr className="border-ink-100" />
          {!session ? (
            <Link href="/login" className="btn-primary w-full py-3 text-base">
              로그인 후 신청하기
            </Link>
          ) : ended ? (
            <button disabled className="btn-primary w-full py-3 text-base">
              신청 마감
            </button>
          ) : myApp ? (
            <div className="rounded-lg bg-ink-100 p-3 text-center text-sm font-semibold text-ink-700">
              ✓ 이미 신청한 캠페인입니다
            </div>
          ) : (
            <ApplyModal
              campaignId={c.id}
              channel={CHANNEL_LABEL[c.channel]}
              defaultUrl={defaultUrl}
            />
          )}
          <div className="border-t border-ink-100 pt-3 text-right">
            <ReportButton campaignId={c.id} loggedIn={!!session} />
          </div>
        </div>
      </aside>

      {(similar.length > 0 || otherFromAdv.length > 0) && (
        <div className="md:col-span-3 space-y-8">
          {similar.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">비슷한 캠페인 추천</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {similar.map((s) => (
                  <CampaignCard
                    key={s.id}
                    c={s}
                    favorited={favSet.has(s.id)}
                    loggedIn={!!session}
                  />
                ))}
              </div>
            </section>
          )}
          {otherFromAdv.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">
                {c.advertiser.companyName}의 다른 캠페인
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {otherFromAdv.map((s) => (
                  <CampaignCard
                    key={s.id}
                    c={s}
                    favorited={favSet.has(s.id)}
                    loggedIn={!!session}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-800">{value}</span>
    </div>
  );
}
