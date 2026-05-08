import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import { REASON_LABEL } from "@/lib/points";

export const metadata = { title: "포인트 내역 - 여긴" };

export default async function PointsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");

  const items = await db.pointHistory.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const earned = items.filter((i) => i.delta > 0).reduce((s, i) => s + i.delta, 0);
  const spent = items.filter((i) => i.delta < 0).reduce((s, i) => s + Math.abs(i.delta), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
        <h1 className="mt-1 text-2xl font-bold">포인트 내역</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="현재 잔액" value={`${me.point.toLocaleString()}P`} highlight />
        <Stat label="누적 적립" value={`+${earned.toLocaleString()}P`} />
        <Stat label="누적 차감" value={`-${spent.toLocaleString()}P`} />
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 포인트 내역이 없습니다.
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {items.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {REASON_LABEL[p.reason] || p.reason}
                </div>
                {p.note && (
                  <div className="line-clamp-1 text-[11px] text-ink-500">{p.note}</div>
                )}
                <div className="text-[11px] text-ink-400">{fmtDate(p.createdAt)}</div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-base font-black ${
                    p.delta > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {p.delta > 0 ? "+" : ""}
                  {p.delta.toLocaleString()}P
                </span>
                <span className="text-[10px] text-ink-400">
                  잔액 {p.balance.toLocaleString()}P
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card border-brand-200 bg-brand-50 p-4 text-xs text-brand-700">
        💡 포인트는 향후 추가 캠페인 신청 가산점이나 포인트샵 상품 교환 시 사용 예정입니다.
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? "border-brand-300 bg-brand-50" : ""}`}>
      <div className="text-xs text-ink-500">{label}</div>
      <div
        className={`mt-1 text-xl font-black ${
          highlight ? "text-brand-700" : "text-ink-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
