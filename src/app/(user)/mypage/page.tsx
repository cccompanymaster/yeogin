import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { ReviewModal } from "@/components/ReviewModal";
import { CHANNEL_LABEL, STATUS_LABEL, REVIEW_STATUS_LABEL, TYPE_LABEL, TRUST_LABEL, fmtDate, won } from "@/lib/format";

export default async function MyPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");

  const [apps, penalties] = await Promise.all([
    db.application.findMany({
      where: { userId: me.id },
      include: { campaign: true, review: true },
      orderBy: { createdAt: "desc" },
    }),
    db.penalty.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-500">안녕하세요</div>
            <div className="text-xl font-black">{me.nickname}님</div>
            <div className="mt-1 text-xs text-ink-500">{me.email}</div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="btn-outline">로그아웃</button>
          </form>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="신뢰등급" value={TRUST_LABEL[me.trustGrade]} />
          <Stat label="포인트" value={`${me.point.toLocaleString()}P`} />
          <Stat label="총 신청" value={`${apps.length}회`} />
        </div>
        <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-[11px] text-ink-600">
          신뢰등급은 리뷰 승인 누적과 패널티에 따라 자동 조정됩니다. 등급이 높을수록 캠페인 선정 확률이 올라갑니다.
        </div>
      </div>

      {penalties.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">패널티 내역</h2>
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

      <div>
        <h2 className="mb-3 text-lg font-bold">신청 내역</h2>
        {apps.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            아직 신청한 캠페인이 없습니다.
            <div className="mt-3">
              <Link href="/campaigns" className="btn-primary">캠페인 둘러보기</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map((a) => (
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
                </div>
              </div>
              {a.review?.status === "REJECTED" && a.review.rejectReason && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  <b>반려 사유:</b> {a.review.rejectReason} · 위 버튼으로 재등록 가능합니다.
                </div>
              )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 p-3 text-center">
      <div className="text-[11px] text-ink-500">{label}</div>
      <div className="mt-0.5 text-base font-black text-ink-900">{value}</div>
    </div>
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
