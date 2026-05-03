import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { won } from "@/lib/format";

const FEE_RATE = 0.1; // 플랫폼 수수료 10%

export default async function BillingPage() {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const campaigns = await db.campaign.findMany({
    where: { advertiserId: session.id },
    include: {
      reviews: { where: { status: "APPROVED" } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = campaigns.map((c) => {
    const completed = c.reviews.length;
    const grossValue = completed * c.offerValue; // 제공 가치 합계
    const fee = Math.round(grossValue * FEE_RATE);
    const net = grossValue + fee;
    return { c, completed, grossValue, fee, net };
  });

  const totalGross = rows.reduce((s, r) => s + r.grossValue, 0);
  const totalFee = rows.reduce((s, r) => s + r.fee, 0);
  const totalNet = totalGross + totalFee;
  const totalCompleted = rows.reduce((s, r) => s + r.completed, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">정산 내역</h1>
        <p className="mt-1 text-sm text-ink-500">
          승인된 리뷰 기준으로 자동 집계됩니다. 매월 1일·15일 정산 처리됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="누적 완료 리뷰" value={`${totalCompleted}건`} />
        <Stat label="제공 가치 합계" value={won(totalGross)} />
        <Stat label="플랫폼 수수료(10%)" value={won(totalFee)} />
        <Stat label="총 결제 예상액" value={won(totalNet)} highlight />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left">캠페인</th>
              <th className="px-4 py-3 text-right">완료</th>
              <th className="px-4 py-3 text-right">제공 가치</th>
              <th className="px-4 py-3 text-right">수수료</th>
              <th className="px-4 py-3 text-right">합계</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-500">
                  정산 가능한 캠페인이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.c.id}>
                  <td className="px-4 py-3">
                    <div className="line-clamp-1 font-semibold">{r.c.title}</div>
                    <div className="text-[11px] text-ink-500">
                      신청 {r.c._count.applications}명 · 완료 {r.completed}/{r.c.capacity}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{r.completed}건</td>
                  <td className="px-4 py-3 text-right">{won(r.grossValue)}</td>
                  <td className="px-4 py-3 text-right text-ink-500">{won(r.fee)}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-600">
                    {won(r.net)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-5 text-xs text-ink-500">
        ※ 본 화면은 데모입니다. 실제 결제·세금계산서 발행 기능은 향후 연동 예정입니다.
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
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
