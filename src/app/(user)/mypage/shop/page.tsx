import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "포인트샵 - 여긴" };

const CATEGORY_LABEL: Record<string, string> = {
  GIFTCARD: "기프티콘",
  COUPON: "쿠폰",
  BADGE: "배지/혜택",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; code?: string; error?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");
  const sp = await searchParams;

  const [items, recent] = await Promise.all([
    db.redeemItem.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { cost: "asc" }],
    }),
    db.redeem.findMany({
      where: { userId: me.id },
      include: { item: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.category] = acc[it.category] || []).push(it);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
        <h1 className="mt-1 text-2xl font-bold">🎁 포인트샵</h1>
        <p className="mt-1 text-sm text-ink-500">
          쌓은 포인트로 기프티콘과 쿠폰을 교환하세요.
        </p>
      </div>

      <div className="card flex items-center justify-between border-brand-300 bg-brand-50 p-5">
        <div>
          <div className="text-xs text-brand-700">현재 보유</div>
          <div className="text-3xl font-black text-brand-700">
            {me.point.toLocaleString()}P
          </div>
        </div>
        <Link href="/mypage/points" className="text-xs text-brand-600 underline-offset-2 hover:underline">
          내역 보기 →
        </Link>
      </div>

      {sp.ok && sp.code && (
        <div className="card border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm font-bold text-emerald-700">
            ✅ 교환 완료! 발급 코드:
          </div>
          <div className="mt-1 break-all font-mono text-base font-black text-emerald-900">
            {sp.code}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">
            ※ 데모 코드입니다. 실제 운영 시 기프티콘 발급사 API와 연동해주세요.
          </div>
        </div>
      )}
      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat}>
          <h2 className="mb-3 text-base font-bold">{CATEGORY_LABEL[cat] || cat}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {list.map((it) => {
              const ok = me.point >= it.cost && it.stock > 0;
              return (
                <div key={it.id} className="card overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="space-y-2 p-3">
                    <div className="text-sm font-bold">{it.name}</div>
                    <div className="line-clamp-2 text-[11px] text-ink-500">
                      {it.description}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-base font-black text-brand-600">
                        {it.cost.toLocaleString()}P
                      </span>
                      <span className="text-[11px] text-ink-500">
                        재고 {it.stock}
                      </span>
                    </div>
                    <form action={`/api/redeem/${it.id}`} method="post">
                      <button
                        disabled={!ok}
                        className={`w-full rounded-md py-2 text-xs font-bold ${
                          ok
                            ? "bg-brand-500 text-white hover:bg-brand-600"
                            : "bg-ink-100 text-ink-400"
                        }`}
                      >
                        {it.stock <= 0
                          ? "품절"
                          : me.point < it.cost
                            ? `${(it.cost - me.point).toLocaleString()}P 부족`
                            : "교환하기"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {recent.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-bold">최근 교환 내역</h2>
          <div className="card divide-y divide-ink-100">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold">{r.item.name}</div>
                  <div className="font-mono text-[11px] text-ink-500">
                    {r.code}
                  </div>
                  <div className="text-[10px] text-ink-400">
                    {fmtDate(r.createdAt)}
                  </div>
                </div>
                <span className="badge bg-red-50 text-red-700">
                  -{r.cost.toLocaleString()}P
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
