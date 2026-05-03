import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { fmtDate } from "@/lib/format";

const REASON_LABEL: Record<string, string> = {
  FALSE_INFO: "허위/과장",
  BAD_TREATMENT: "부당대우",
  SPAM: "스팸",
  OTHER: "기타",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="card p-10">
          <h1 className="text-lg font-bold">접근 권한이 없습니다</h1>
          <p className="mt-2 text-sm text-ink-500">
            관리자만 접근할 수 있습니다. 관리자 계정으로 로그인해주세요.
          </p>
          <Link href="/" className="btn-outline mt-4">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const status = sp.status || "OPEN";

  const [reports, openCount, resolvedCount, rejectedCount] = await Promise.all([
    db.report.findMany({
      where: { status },
      include: { reporter: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.report.count({ where: { status: "OPEN" } }),
    db.report.count({ where: { status: "RESOLVED" } }),
    db.report.count({ where: { status: "REJECTED" } }),
  ]);

  const campaignIds = Array.from(
    new Set(reports.map((r) => r.campaignId).filter((x): x is string => !!x))
  );
  const campaigns = await db.campaign.findMany({
    where: { id: { in: campaignIds } },
    include: { advertiser: true },
  });
  const cMap = new Map(campaigns.map((c) => [c.id, c]));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold text-brand-600">ADMIN</div>
        <h1 className="text-2xl font-bold">신고 처리</h1>
        <p className="mt-1 text-sm text-ink-500">
          접수된 신고를 검토하고 처리 상태를 변경하세요.
        </p>
      </div>

      <div className="flex gap-2">
        <Tab href="/admin?status=OPEN" active={status === "OPEN"} label={`접수 ${openCount}`} />
        <Tab
          href="/admin?status=RESOLVED"
          active={status === "RESOLVED"}
          label={`처리 ${resolvedCount}`}
        />
        <Tab
          href="/admin?status=REJECTED"
          active={status === "REJECTED"}
          label={`기각 ${rejectedCount}`}
        />
      </div>

      {reports.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          해당 상태의 신고가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const c = r.campaignId ? cMap.get(r.campaignId) : null;
            return (
              <div key={r.id} className="card space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-red-100 text-red-700">
                        {REASON_LABEL[r.reason] || r.reason}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        {fmtDate(r.createdAt)} · 신고자 {r.reporter.nickname}
                      </span>
                    </div>
                    {c && (
                      <div className="mt-2 rounded-md bg-ink-50 p-2 text-xs">
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-ink-500">
                          {c.advertiser.companyName} · {c.category}
                        </div>
                      </div>
                    )}
                    <p className="mt-2 whitespace-pre-line text-sm text-ink-700">
                      {r.detail}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`badge ${
                        r.status === "OPEN"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "RESOLVED"
                            ? "bg-emerald-500 text-white"
                            : "bg-ink-200 text-ink-700"
                      }`}
                    >
                      {r.status === "OPEN" ? "접수" : r.status === "RESOLVED" ? "처리" : "기각"}
                    </span>
                  </div>
                </div>
                {r.status === "OPEN" && (
                  <form
                    action={`/api/admin/reports/${r.id}`}
                    method="post"
                    className="flex flex-wrap gap-2 border-t border-ink-100 pt-3"
                  >
                    <input
                      name="adminNote"
                      placeholder="처리 메모 (선택)"
                      className="input flex-1 text-xs"
                    />
                    <button
                      name="action"
                      value="resolve"
                      className="badge bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      처리 완료
                    </button>
                    <button
                      name="action"
                      value="reject"
                      className="badge bg-ink-200 text-ink-700 hover:bg-ink-300"
                    >
                      기각
                    </button>
                  </form>
                )}
                {r.adminNote && (
                  <div className="rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-700">
                    <b>관리자 메모:</b> {r.adminNote}
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
