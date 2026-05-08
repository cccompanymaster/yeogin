import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { CHARGE_PACKAGES, ADV_REASON_LABEL } from "@/lib/advertiser-points";
import { fmtDate, won } from "@/lib/format";

export default async function ChargePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; need?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const adv = await db.advertiser.findUnique({ where: { id: session.id } });
  if (!adv) redirect("/advertiser/login");

  const history = await db.advertiserPointHistory.findMany({
    where: { advertiserId: adv.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const sp = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/advertiser/billing" className="text-xs text-ink-500">
          ← 정산
        </Link>
        <h1 className="mt-1 text-2xl font-bold">포인트 충전</h1>
        <p className="mt-1 text-sm text-ink-500">
          충전한 포인트로 캠페인을 등록하고 빠른선정 옵션을 사용할 수 있습니다.
        </p>
      </div>

      {sp.need && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ 캠페인 등록에 필요한 포인트가 부족합니다.{" "}
          <b>{Number(sp.need).toLocaleString()}P</b> 충전이 필요해요.
        </div>
      )}
      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          ✅ {Number(sp.ok).toLocaleString()}P 충전이 완료되었습니다.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="card border-brand-300 bg-brand-50 p-5 md:col-span-3">
          <div className="text-xs text-brand-700">현재 잔액</div>
          <div className="mt-1 text-3xl font-black text-brand-700">
            {adv.point.toLocaleString()}P
          </div>
          <div className="mt-1 text-[11px] text-brand-600">
            1P = 1원 · 캠페인 등록 시 자동 차감
          </div>
        </div>

        {CHARGE_PACKAGES.map((p) => (
          <form
            key={p.amount}
            action="/api/advertiser/billing/charge"
            method="post"
            className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <input type="hidden" name="amount" value={p.amount} />
            <div className="text-xs text-ink-500">{won(p.amount)} 결제</div>
            <div className="text-base font-black text-ink-900">{p.label}</div>
            {p.bonus > 0 && (
              <div className="text-xs font-semibold text-emerald-600">
                +{p.bonus.toLocaleString()}P 보너스
              </div>
            )}
            <button className="btn-primary mt-auto py-2.5 text-sm">충전</button>
          </form>
        ))}
      </div>

      <div className="rounded-lg bg-ink-50 p-4 text-xs text-ink-500">
        ⚠️ 본 화면은 데모이며 실제 결제가 발생하지 않습니다. 운영 시 PortOne /
        토스페이먼츠 등 결제 게이트웨이를 연동해주세요.
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold">최근 내역</h2>
        {history.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            충전·차감 내역이 없습니다.
          </div>
        ) : (
          <div className="card divide-y divide-ink-100">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">
                    {ADV_REASON_LABEL[h.reason] || h.reason}
                  </div>
                  {h.note && (
                    <div className="line-clamp-1 text-[11px] text-ink-500">
                      {h.note}
                    </div>
                  )}
                  <div className="text-[11px] text-ink-400">
                    {fmtDate(h.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-base font-black ${
                      h.delta > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {h.delta > 0 ? "+" : ""}
                    {h.delta.toLocaleString()}P
                  </span>
                  <span className="text-[10px] text-ink-400">
                    잔액 {h.balance.toLocaleString()}P
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
