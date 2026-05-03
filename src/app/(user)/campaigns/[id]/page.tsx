import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ApplyModal } from "@/components/ApplyModal";
import { getUserSession } from "@/lib/session";
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
        </div>
      </aside>
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
