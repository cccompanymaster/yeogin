import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { fmtDate } from "@/lib/format";

const CHANNEL_LABEL: Record<string, string> = {
  blog: "네이버 블로그",
  insta: "인스타그램",
  youtube: "유튜브",
  tiktok: "틱톡",
};

export default async function AdminSnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-lg font-bold">접근 권한이 없습니다</h1>
      </div>
    );
  }
  const sp = await searchParams;
  const status = sp.status || "PENDING";

  const [items, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db.snsVerification.findMany({
      where: { status },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.snsVerification.count({ where: { status: "PENDING" } }),
    db.snsVerification.count({ where: { status: "APPROVED" } }),
    db.snsVerification.count({ where: { status: "REJECTED" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="text-xs text-ink-500">← 운영센터</Link>
        <h1 className="mt-1 text-2xl font-bold">SNS 인증샷 검수</h1>
      </div>

      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="flex gap-2">
        <Tab
          href="/admin/sns?status=PENDING"
          active={status === "PENDING"}
          label={`검수 대기 ${pendingCount}`}
        />
        <Tab
          href="/admin/sns?status=APPROVED"
          active={status === "APPROVED"}
          label={`승인 ${approvedCount}`}
        />
        <Tab
          href="/admin/sns?status=REJECTED"
          active={status === "REJECTED"}
          label={`반려 ${rejectedCount}`}
        />
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          {status === "PENDING" ? "검수 대기 중인 항목이 없습니다." : "내역이 없습니다."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <div key={v.id} className="card space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-100 text-brand-700">
                      {CHANNEL_LABEL[v.channel]}
                    </span>
                    <span className="text-sm font-bold">{v.user.nickname}</span>
                    <span className="text-[11px] text-ink-500">
                      {v.user.email} · {fmtDate(v.createdAt)}
                    </span>
                  </div>
                  <a
                    href={v.url}
                    target="_blank"
                    className="mt-1 line-clamp-1 block text-xs text-brand-600 hover:underline"
                  >
                    {v.url}
                  </a>
                  <div className="mt-1 text-sm">
                    주장 수치: <b>{v.metric.toLocaleString()}명</b>
                  </div>
                </div>
                <span
                  className={`badge ${
                    v.status === "APPROVED"
                      ? "bg-emerald-500 text-white"
                      : v.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {v.status === "PENDING" ? "검수대기" : v.status === "APPROVED" ? "승인" : "반려"}
                </span>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.imageData}
                alt="인증샷"
                className="max-h-72 w-full rounded-lg border border-ink-200 object-contain"
              />

              {v.rejectReason && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  <b>반려 사유:</b> {v.rejectReason}
                </div>
              )}

              {v.status === "PENDING" && (
                <form
                  action={`/api/admin/sns/${v.id}`}
                  method="post"
                  className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3"
                >
                  <input
                    name="rejectReason"
                    placeholder="반려 사유 (반려 시)"
                    className="input flex-1 text-xs"
                  />
                  <button
                    name="action"
                    value="approve"
                    className="btn-primary py-1.5"
                  >
                    승인
                  </button>
                  <button
                    name="action"
                    value="reject"
                    className="btn-outline py-1.5 text-red-600"
                  >
                    반려
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
        active
          ? "bg-ink-900 text-white"
          : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100"
      }`}
    >
      {label}
    </Link>
  );
}
