import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { relativeTime } from "@/lib/relative";
import { fmtDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "받은 제안 - 마이페이지" };

const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "대기중", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  ACCEPTED: { text: "수락", cls: "bg-emerald-500 text-white" },
  REJECTED: { text: "거절", cls: "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300" },
  EXPIRED: { text: "만료", cls: "bg-ink-200 text-ink-500 dark:bg-ink-700 dark:text-ink-400" },
  CANCELED: { text: "취소", cls: "bg-ink-200 text-ink-500 dark:bg-ink-700 dark:text-ink-400" },
};

export default async function ReceivedInvitesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const sp = await searchParams;

  const now = new Date();

  // 만료된 항목 자동 처리
  await db.directInvite.updateMany({
    where: { userId: session.id, status: "PENDING", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  const invites = await db.directInvite.findMany({
    where: { userId: session.id },
    include: {
      advertiser: {
        select: { id: true, companyName: true },
      },
      campaign: { select: { id: true, title: true, thumbnail: true, offer: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const pending = invites.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
        <h1 className="mt-1 text-2xl font-bold">📨 받은 제안</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          광고주가 직접 보낸 캠페인 참여 초대입니다.
          {pending > 0 && (
            <>
              {" "}
              <b className="text-brand-600">대기중 {pending}건</b>
            </>
          )}
        </p>
      </div>

      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          ✓ 처리되었습니다.
        </div>
      )}
      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      {invites.length === 0 ? (
        <EmptyState
          icon="📨"
          title="아직 받은 제안이 없습니다"
          description="SNS 채널을 인증하고 활동지역을 등록하면 광고주가 직접 초대할 가능성이 올라가요."
          cta={{ href: "/mypage/edit", label: "프로필 보강하기" }}
        />
      ) : (
        <div className="space-y-3">
          {invites.map((iv) => {
            const badge = STATUS_BADGE[iv.status];
            const expired = iv.status === "PENDING" && iv.expiresAt && new Date(iv.expiresAt) < now;
            return (
              <div key={iv.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="badge bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900">
                        {iv.advertiser.companyName}
                      </span>
                      <span className={`badge ${badge.cls}`}>{badge.text}</span>
                      <span className="text-ink-500 dark:text-ink-400">
                        {relativeTime(iv.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-2 text-base font-bold">{iv.title}</h2>
                    {iv.campaign && (
                      <Link
                        href={`/campaigns/${iv.campaign.id}`}
                        className="mt-2 flex items-center gap-3 rounded-lg border border-ink-200 p-2 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={iv.campaign.thumbnail}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <div className="line-clamp-1 text-sm font-bold">
                            {iv.campaign.title}
                          </div>
                          <div className="line-clamp-1 text-[11px] text-ink-500 dark:text-ink-400">
                            {iv.campaign.offer}
                          </div>
                        </div>
                        <span className="text-xs text-brand-600">상세 →</span>
                      </Link>
                    )}
                    {iv.offerSummary && (
                      <div className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                        💝 {iv.offerSummary}
                      </div>
                    )}
                    <p className="mt-3 whitespace-pre-line text-sm text-ink-700 dark:text-ink-200">
                      {iv.message}
                    </p>
                    {iv.expiresAt && iv.status === "PENDING" && (
                      <div className="mt-2 text-[11px] text-ink-500">
                        ⏰ {fmtDate(iv.expiresAt)}까지 답변 가능
                      </div>
                    )}
                  </div>
                </div>
                {iv.status === "PENDING" && !expired && (
                  <div className="flex gap-2 border-t border-ink-100 p-3 dark:border-ink-700">
                    <form
                      action={`/api/invites/${iv.id}`}
                      method="post"
                      className="flex-1"
                    >
                      <input type="hidden" name="action" value="accept" />
                      <button className="btn-primary w-full py-2.5">
                        수락하기
                      </button>
                    </form>
                    <form
                      action={`/api/invites/${iv.id}`}
                      method="post"
                      className="flex-1"
                    >
                      <input type="hidden" name="action" value="reject" />
                      <button className="btn-outline w-full py-2.5">
                        정중히 거절
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
