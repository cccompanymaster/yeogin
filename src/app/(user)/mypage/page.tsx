import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { ReviewModal } from "@/components/ReviewModal";
import { SnsCard } from "@/components/SnsCard";
import { AttendanceCard } from "@/components/AttendanceCard";
import { AdvertiserRatingModal } from "@/components/AdvertiserRatingModal";
import { AvatarUpload } from "@/components/AvatarUpload";
import { isYouTubeAutoEnabled } from "@/lib/sns";
import {
  CHANNEL_LABEL,
  STATUS_LABEL,
  REVIEW_STATUS_LABEL,
  TYPE_LABEL,
  TRUST_LABEL,
  fmtDate,
  won,
} from "@/lib/format";

type SP = Promise<{ tab?: string }>;

export default async function MyPage({ searchParams }: { searchParams: SP }) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");
  const sp = await searchParams;
  const tab = sp.tab === "done" ? "done" : "active";

  const [apps, penalties, cancelCount, doneCount, pendingVerifs, advRatings] =
    await Promise.all([
      db.application.findMany({
        where: { userId: me.id },
        include: { campaign: true, review: true },
        orderBy: { createdAt: "desc" },
      }),
      db.penalty.findMany({ where: { userId: me.id }, orderBy: { createdAt: "desc" } }),
      db.application.count({ where: { userId: me.id, status: "CANCELED" } }),
      db.review.count({ where: { userId: me.id, status: "APPROVED" } }),
      db.snsVerification.findMany({
        where: { userId: me.id, status: "PENDING" },
        select: { channel: true },
      }),
      db.advertiserRating.findMany({
        where: { userId: me.id },
        select: { campaignId: true, rating: true, comment: true },
      }),
    ]);
  const pendingSet = new Set(pendingVerifs.map((p) => p.channel));
  const ratingMap = new Map(advRatings.map((r) => [r.campaignId, r]));

  const activeApps = apps.filter((a) => a.status !== "COMPLETED" && a.status !== "REJECTED");
  const doneApps = apps.filter((a) => a.status === "COMPLETED" || a.status === "REJECTED");
  const list = tab === "done" ? doneApps : activeApps;

  const ytAuto = isYouTubeAutoEnabled();

  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      {/* 사이드바 */}
      <aside className="space-y-4 md:sticky md:top-20 md:h-fit">
        <div className="space-y-1 text-sm">
          <div className="px-2 py-1 text-base font-black">마이페이지</div>
          <SideLink href="/mypage" label="📋 내 체험단" active />
          <SideLink href="/mypage/favorites" label="❤️ 관심 캠페인" />
          <SideLink href="/mypage/shop" label="🛍️ 포인트샵" />
          <SideLink href="/mypage/points" label="💰 포인트 내역" />
          <SideLink href="/mypage/invite" label="🎁 친구 초대" />
          <SideLink href="/notifications" label="🔔 알림함" />
          <div className="mt-3 border-t border-ink-100 pt-3 text-[11px] font-bold text-ink-400 dark:border-ink-700">
            내 정보 관리
          </div>
          <SideLink href="/mypage/edit" label="프로필 수정" />
          <SideLink href="/mypage" label="내 채널" />
          <div className="mt-3 border-t border-ink-100 pt-3 text-[11px] font-bold text-ink-400 dark:border-ink-700">
            커뮤니티
          </div>
          <SideLink href="/community" label="커뮤니티" />
          <div className="mt-3 border-t border-ink-100 pt-3 text-[11px] font-bold text-ink-400 dark:border-ink-700">
            고객센터
          </div>
          <SideLink href="/faq" label="자주 묻는 질문" />
          <SideLink href="/trust-grade" label="🏆 신뢰등급 안내" />
          <SideLink href="/community" label="문의 / 커뮤니티" />
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="btn-outline w-full">로그아웃</button>
        </form>
      </aside>

      {/* 메인 */}
      <div className="space-y-6">
        {/* 출석체크 + 친구 초대 빠른 카드 */}
        <div className="grid gap-3 md:grid-cols-2">
          <AttendanceCard
            streak={me.attendStreak}
            doneToday={
              !!me.lastAttendAt &&
              new Date(me.lastAttendAt).toDateString() === new Date().toDateString()
            }
          />
          <Link
            href="/mypage/invite"
            className="card flex items-center gap-4 overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-4 text-white transition hover:brightness-110"
          >
            <div className="text-3xl">🎁</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">친구 초대 이벤트</div>
              <div className="text-xs opacity-90">
                코드 공유 → 양쪽 +1,000P
              </div>
              <div className="mt-1 font-mono text-xs">{me.referralCode}</div>
            </div>
            <span className="text-sm">→</span>
          </Link>
        </div>

        {/* 프로필 헤더 */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <AvatarUpload initialUrl={me.avatarUrl} nickname={me.nickname} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">{me.nickname}</span>
                  <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {TRUST_LABEL[me.trustGrade]}
                  </span>
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{me.email}</div>
                {me.bio && (
                  <div className="mt-1 text-xs text-ink-600 dark:text-ink-300">{me.bio}</div>
                )}
              </div>
            </div>
            <Link href="/mypage/edit" className="text-ink-400 hover:text-ink-700">
              ✏️
            </Link>
          </div>

          {/* 통계 */}
          <div className="mt-5 grid grid-cols-4 gap-2 text-center md:grid-cols-8">
            <Stat label="신청수" value={`${apps.length}회`} />
            <Stat label="활동지역" value={me.region ? me.region.split(" ").pop()! : "미설정"} />
            <Stat label="취소횟수" value={`${cancelCount}회`} tone="danger" />
            <Stat label="하트수" value={`${me.heartCount}개`} />
            <Stat label="체험경력" value={`${doneCount}회`} />
            <Stat label="활동주제" value="미등록" tone="muted" />
            <Stat label="패널티" value={`${penalties.length}회`} tone="danger" />
            <Stat label="포인트" value={`${me.point.toLocaleString()}P`} tone="brand" />
          </div>
        </div>

        {/* SNS 카드 */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold">SNS 연결</h2>
            <span className="text-[11px] text-ink-500">
              연결된 채널이 많을수록 캠페인 선정 확률이 올라가요
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <SnsCard
              channel="blog"
              url={me.blogUrl}
              metric={me.blogVisitors}
              verifiedAt={me.blogVerifiedAt}
              pendingVerification={pendingSet.has("blog")}
              youtubeAutoEnabled={ytAuto}
            />
            <SnsCard
              channel="insta"
              url={me.instaUrl}
              metric={me.instaFollowers}
              verifiedAt={me.instaVerifiedAt}
              pendingVerification={pendingSet.has("insta")}
              youtubeAutoEnabled={ytAuto}
            />
            <SnsCard
              channel="youtube"
              url={me.youtubeUrl}
              metric={me.youtubeSubscribers}
              verifiedAt={me.youtubeVerifiedAt}
              pendingVerification={pendingSet.has("youtube")}
              youtubeAutoEnabled={ytAuto}
            />
            <SnsCard
              channel="tiktok"
              url={me.tiktokUrl}
              metric={me.tiktokFollowers}
              verifiedAt={me.tiktokVerifiedAt}
              pendingVerification={pendingSet.has("tiktok")}
              youtubeAutoEnabled={ytAuto}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-500">
            ✓ 유튜브는 URL만 입력하면 구독자 수가 {ytAuto ? "자동으로 가져와집니다." : "자동 가져오기 가능 (관리자 설정 필요)."}
            <br />· 블로그·인스타·틱톡은 공식 자동 인증이 어려워 현재는 직접 입력 방식입니다.
          </p>
        </div>

        {/* 패널티 */}
        {penalties.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-bold">패널티 내역</h2>
            <div className="card divide-y divide-ink-100">
              {penalties.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-semibold text-red-600">{p.reason}</div>
                    <div className="text-[11px] text-ink-500">{fmtDate(p.createdAt)}</div>
                  </div>
                  <span className="badge bg-red-500 text-white">-{p.point}P</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 캠페인 탭 */}
        <div>
          <div className="mb-3 flex gap-2 border-b border-ink-200">
            <Tab href="/mypage" active={tab === "active"} label={`진행중 ${activeApps.length}`} />
            <Tab href="/mypage?tab=done" active={tab === "done"} label={`완료/미선정 ${doneApps.length}`} />
          </div>
          {list.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink-500">
              {tab === "active" ? "진행중인 캠페인이 없습니다." : "완료된 내역이 없습니다."}
              <div className="mt-3">
                <Link href="/campaigns" className="btn-primary">
                  캠페인 둘러보기
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((a) => (
                <div key={a.id} className="card space-y-2 p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.campaign.thumbnail}
                      alt=""
                      className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                        <span>{TYPE_LABEL[a.campaign.type]}</span>
                        <span>·</span>
                        <span>{CHANNEL_LABEL[a.campaign.channel]}</span>
                      </div>
                      <Link
                        href={`/campaigns/${a.campaign.id}`}
                        className="line-clamp-1 text-sm font-bold hover:text-brand-600"
                      >
                        {a.campaign.title}
                      </Link>
                      <div className="text-[11px] text-ink-500">
                        {won(a.campaign.offerValue)} 상당 · 신청일 {fmtDate(a.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={a.status} />
                      {a.status === "SELECTED" && !a.review && (
                        <ReviewModal applicationId={a.id} />
                      )}
                      {a.review && (
                        <span
                          className={`badge ${
                            a.review.status === "APPROVED"
                              ? "bg-blue-100 text-blue-700"
                              : a.review.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          리뷰 {REVIEW_STATUS_LABEL[a.review.status]}
                        </span>
                      )}
                      {a.review?.status === "REJECTED" && (
                        <ReviewModal applicationId={a.id} />
                      )}
                      {a.status === "COMPLETED" && (
                        <AdvertiserRatingModal
                          campaignId={a.campaignId}
                          campaignTitle={a.campaign.title}
                          existing={ratingMap.get(a.campaignId) ?? null}
                        />
                      )}
                    </div>
                  </div>
                  {a.review?.status === "REJECTED" && a.review.rejectReason && (
                    <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      <b>반려 사유:</b> {a.review.rejectReason} · 위 버튼으로 재등록 가능합니다.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "brand" | "muted";
}) {
  const color =
    tone === "danger"
      ? "text-red-600"
      : tone === "brand"
        ? "text-brand-600"
        : tone === "muted"
          ? "text-ink-400"
          : "text-ink-900";
  return (
    <div className="rounded-lg bg-ink-50 px-2 py-2.5 dark:bg-ink-900">
      <div className="text-[10px] text-ink-500 dark:text-ink-400">{label}</div>
      <div className={`mt-0.5 text-sm font-black ${color} dark:opacity-95`}>{value}</div>
    </div>
  );
}

function SideLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-2 py-1.5 ${
        active
          ? "bg-brand-50 font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
          : "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
      }`}
    >
      {label}
    </Link>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold ${
        active
          ? "border-brand-500 text-brand-600"
          : "border-transparent text-ink-500 hover:text-ink-700"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-ink-100 text-ink-700",
    SELECTED: "bg-emerald-500 text-white",
    REJECTED: "bg-ink-200 text-ink-500",
    COMPLETED: "bg-blue-500 text-white",
    CANCELED: "bg-ink-200 text-ink-500",
  };
  return (
    <span className={`badge ${map[status] || "bg-ink-100 text-ink-700"}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
