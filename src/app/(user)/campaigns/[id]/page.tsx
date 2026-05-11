import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ApplyModal } from "@/components/ApplyModal";
import { ReportButton } from "@/components/ReportButton";
import { CampaignCard } from "@/components/CampaignCard";
import { StarRating } from "@/components/StarRating";
import { getUserSession } from "@/lib/session";
import { matchScore, buildCategoryFrequency, scoreColor, scoreLabel } from "@/lib/matching";

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

  // 매칭 분석
  let myMatch: { score: number; reason: string } | null = null;
  if (me) {
    const history = await db.application.findMany({
      where: { userId: me.id },
      include: { campaign: { select: { category: true } } },
      take: 50,
    });
    const freq = buildCategoryFrequency(history);
    myMatch = matchScore(me, c, freq);
  }

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

  // 이 광고주의 다른 캠페인 + 평균 평점
  const [otherFromAdv, advRatingAgg] = await Promise.all([
    db.campaign.findMany({
      where: {
        advertiserId: c.advertiserId,
        id: { not: c.id },
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.advertiserRating.aggregate({
      where: { advertiserId: c.advertiserId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);
  const advAvg = advRatingAgg._avg.rating || 0;
  const advCount = advRatingAgg._count._all;

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

  // 타입별 STEP 안내
  const STEP_TEXT: Record<string, string[]> = {
    VISIT: [
      "광고주와 리뷰어 일정 조율 (5일 이내 연락 권장)",
      "매장 방문 후 체험 및 사진 촬영",
      "리뷰 마감일까지 리뷰 작성 및 등록",
    ],
    DELIVERY: [
      "선정 후 등록한 주소로 제품 배송 (3~5일 내)",
      "제품 수령 후 사용 및 사진/영상 촬영",
      "리뷰 마감일까지 리뷰 작성 및 등록",
    ],
    PURCHASE: [
      "직접 매장/온라인몰에서 제품 구매",
      "영수증 인증 + 사용 후 콘텐츠 제작",
      "리뷰 등록 후 페이백 처리",
    ],
    REPORTER: [
      "광고주가 제공한 자료/보도자료 확인",
      "자료 기반으로 콘텐츠 작성",
      "리뷰 마감일까지 리뷰 작성 및 등록",
    ],
    PLATFORM_REPORTER: [
      "여긴 운영팀 자료 확인",
      "자료 기반 콘텐츠 작성",
      "리뷰 마감일까지 등록",
    ],
    PAYBACK: [
      "구매 → 영수증 인증 → 콘텐츠 작성",
      "리뷰 검수 후 페이백 (3~5일 소요)",
      "리뷰 마감일까지 등록",
    ],
    SAME_DAY: [
      "선정 즉시 당일 활동 시작",
      "당일 콘텐츠 제작 및 등록",
      "당일 포인트 지급",
    ],
    PACKAGE: [
      "포장 패키지 수령",
      "언박싱 + 사용 후기 작성",
      "리뷰 마감일까지 등록",
    ],
  };
  const steps = STEP_TEXT[c.type] || STEP_TEXT.VISIT;

  // JSON-LD: Offer/Event 구조화 데이터
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: c.title,
    description: c.description,
    image: [c.thumbnail],
    startDate: c.applyStart.toISOString(),
    endDate: c.applyEnd.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    location: c.address
      ? { "@type": "Place", name: c.region || "온라인", address: c.address }
      : { "@type": "VirtualLocation" },
    organizer: { "@type": "Organization", name: c.advertiser.companyName },
    offers: {
      "@type": "Offer",
      price: c.offerValue,
      priceCurrency: "KRW",
      description: c.offer,
      availability:
        c.appliedCount >= c.capacity ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    aggregateRating:
      advCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: advAvg.toFixed(1),
            reviewCount: advCount,
          }
        : undefined,
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <div className="md:col-span-2 space-y-6">
        {/* 헤더 */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-ink-500 dark:text-ink-400">
                [{c.region ?? "온라인"}]
              </div>
              <h1 className="mt-1 text-2xl font-black leading-tight">{c.title}</h1>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {CHANNEL_LABEL[c.channel]}
            </span>
            <span className="text-ink-300">|</span>
            <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
              {TYPE_LABEL[c.type]}
            </span>
            <span className="text-ink-300">|</span>
            <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
              {c.category}
            </span>
            {c.fastMatch && (
              <span className="badge bg-brand-500 text-white">⚡ 빠른선정</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
            <Link
              href={`/store/${c.advertiserId}`}
              className="font-semibold text-ink-700 hover:text-brand-600 dark:text-ink-200"
            >
              {c.advertiser.companyName} →
            </Link>
            {advCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                ★ <b>{advAvg.toFixed(1)}</b>
                <span className="text-ink-400">({advCount})</span>
              </span>
            )}
          </div>
        </div>

        {/* 메인 비주얼 */}
        <div className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.thumbnail} alt={c.title} className="aspect-[16/10] w-full object-cover" />
        </div>

        {/* STEP 안내 박스 */}
        <div className="card border-ink-200 bg-ink-50 p-5 dark:border-ink-700 dark:bg-ink-900/40">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span>📌</span>
            <span>
              해당 체험단은 <span className="text-brand-600">{TYPE_LABEL[c.type]}</span> 체험단입니다.
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-600 dark:text-ink-300">
            리뷰어가 캠페인에 신청한 후, 사진과 후기를 작성하는 절차입니다.
          </p>
          <div className="mt-3 space-y-1 text-sm">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-bold text-brand-600">STEP{i + 1}.</span>
                <span className="text-ink-700 dark:text-ink-200">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 주최자 + 제공내역 */}
        <div className="card p-5">
          <Field label="주최자" value={c.advertiser.companyName} />
          <Field
            label="제공서비스/물품"
            value={`${c.offer} (${won(c.offerValue)} 상당)`}
            highlight
          />
          {c.address && (
            <Field
              label="방문 주소"
              value={c.address}
              extra={
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(c.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 hover:underline"
                >
                  지도 열기 ↗
                </a>
              }
            />
          )}
          {(c.visitDays || c.visitTime) && (
            <Field
              label="방문 및 예약 안내"
              value={
                <div className="space-y-0.5 text-sm">
                  {c.visitDays && <div>· 방문 가능 요일: {c.visitDays}</div>}
                  {c.visitTime && <div>· 방문 가능 시간: {c.visitTime}</div>}
                  <div className="text-xs text-ink-500 dark:text-ink-400">
                    📌 자세한 일정은 광고주와 직접 조율해주세요.
                  </div>
                </div>
              }
            />
          )}
        </div>

        {/* 키워드 */}
        {c.keywords && (
          <div className="card p-5">
            <Field
              label="키워드 정보"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {c.keywords.split(",").map((k) => (
                    <span
                      key={k}
                      className="badge bg-sky-50 px-2.5 py-1 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                    >
                      {k.trim()}
                    </span>
                  ))}
                </div>
              }
            />
          </div>
        )}

        {/* 체험단 미션 — 아이콘 그리드 */}
        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">체험단 미션</h2>
          <div className="rounded-lg bg-emerald-100 px-3 py-1.5 text-center text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {CHANNEL_LABEL[c.channel]}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-5">
            <MissionIcon icon="🔑" label="키워드" />
            {c.missionPhotos > 0 && (
              <MissionIcon icon="🖼️" label={`${c.missionPhotos}장 이상`} />
            )}
            {c.missionWords > 0 && (
              <MissionIcon icon="✏️" label={`${c.missionWords.toLocaleString()}자 이상`} />
            )}
            {c.missionMap && <MissionIcon icon="📍" label="지도 첨부" />}
            {c.missionVideo && <MissionIcon icon="🎬" label="동영상 or GIF" />}
            <MissionIcon icon="🛡" label="공정위 표기" />
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            {c.guide}
          </p>
        </div>

        {/* 매장 요청 사항 */}
        {c.storeRequest && (
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold">▼ 매장 요청 사항</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-200">
              {c.storeRequest}
            </p>
          </div>
        )}

        {/* 캠페인 소개 */}
        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">캠페인 소개</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            {c.description}
          </p>
        </div>

        {/* 필수 체크 사항 */}
        <div className="card border-brand-200 bg-brand-50 p-5 dark:border-brand-700 dark:bg-brand-900/20">
          <h2 className="text-center text-base font-bold text-brand-700 dark:text-brand-300">
            {TYPE_LABEL[c.type]} 필수 체크 사항
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-700 dark:text-ink-200">
            <li>✔ 리뷰 미등록 시 취소횟수 부과되며, 제공된 서비스 비용이 청구될 수 있습니다.</li>
            <li>✔ 초과비용은 본인 부담이며, 타 쿠폰 중복 적용 및 포장 불가합니다.</li>
            <li>✔ 예약 후 방문하지 않거나, 당일취소의 경우 노쇼 패널티 부과됩니다.</li>
            <li>✔ 작성하신 콘텐츠는 6개월 유지, 업체 홍보용으로 활용될 수 있습니다.</li>
          </ul>
        </div>

        {/* 공정위 문구 */}
        <div className="card p-5 text-center">
          <h3 className="text-sm font-bold">공정위 문구 (배너)</h3>
          <div className="mt-3 rounded-lg bg-sky-50 p-6 dark:bg-sky-900/30">
            <div className="text-xs text-sky-700 dark:text-sky-300">📘 #협찬</div>
            <div className="mt-1 text-base font-black text-sky-700 dark:text-sky-300">
              당첨된 이후 확인 가능
            </div>
          </div>
          <p className="mt-2 text-[11px] text-ink-500 dark:text-ink-400">
            공정위 이용 가이드에 따라 협찬 표기는 게시물 최상단에 명시해야 합니다.
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

        {c.tags && (
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold">관련 태그</h2>
            <div className="flex flex-wrap gap-1">
              {c.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                <Link
                  key={t}
                  href={`/campaigns?tag=${encodeURIComponent(t)}`}
                  className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4 md:sticky md:top-20 md:h-fit">
        {myMatch && (
          <div className="card overflow-hidden">
            <div
              className={`flex items-center justify-between px-4 py-3 ${scoreColor(myMatch.score)}`}
            >
              <div>
                <div className="text-[11px] font-bold opacity-90">나와의 매칭</div>
                <div className="text-2xl font-black">{myMatch.score}점</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-90">{scoreLabel(myMatch.score)}</div>
              </div>
            </div>
            <div className="p-3 text-[11px] text-ink-600">
              {myMatch.reason || "프로필을 등록하면 매칭 점수가 높아져요"}
            </div>
          </div>
        )}
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
      <span className="text-ink-500 dark:text-ink-400">{label}</span>
      <span className="font-semibold text-ink-800 dark:text-ink-100">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
  extra,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-start gap-3 border-b border-ink-100 py-3 last:border-b-0 dark:border-ink-700">
      <div className="pt-0.5 text-sm font-bold text-ink-700 dark:text-ink-200">{label}</div>
      <div className="text-sm">
        <div className={highlight ? "font-semibold text-brand-700 dark:text-brand-300" : "text-ink-800 dark:text-ink-100"}>
          {value}
        </div>
        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
}

function MissionIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-ink-100 p-3 text-center dark:border-ink-700">
      <div className="text-2xl">{icon}</div>
      <div className="text-[11px] font-bold text-ink-700 dark:text-ink-200">{label}</div>
    </div>
  );
}
