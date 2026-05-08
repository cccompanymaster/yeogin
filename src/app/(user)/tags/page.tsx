import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = {
  title: "인기 태그 - 여긴",
  description: "트렌드 태그로 캠페인을 한 번에 둘러보세요.",
};

export default async function TagsPage() {
  const campaigns = await db.campaign.findMany({
    where: { status: "OPEN" },
    select: { tags: true, appliedCount: true },
  });

  // 태그 카운트 + 인기도 (신청자수 합산)
  const tagMap = new Map<string, { count: number; weight: number }>();
  for (const c of campaigns) {
    const tags = (c.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
    for (const t of tags) {
      const cur = tagMap.get(t) || { count: 0, weight: 0 };
      cur.count += 1;
      cur.weight += c.appliedCount;
      tagMap.set(t, cur);
    }
  }

  const sorted = Array.from(tagMap.entries())
    .map(([tag, v]) => ({ tag, ...v }))
    .sort((a, b) => b.weight - a.weight);

  const top10 = sorted.slice(0, 10);
  const others = sorted.slice(10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">🏷️ 인기 태그</h1>
        <p className="mt-1 text-sm text-ink-500">
          요즘 사람들이 가장 많이 찾는 태그로 캠페인을 둘러보세요.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 태그가 등록된 캠페인이 없습니다.
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-base font-bold">🔥 TOP 10</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {top10.map((t, i) => (
                <Link
                  key={t.tag}
                  href={`/campaigns?tag=${encodeURIComponent(t.tag)}`}
                  className={`card flex items-center justify-between p-3 hover:border-brand-300 ${
                    i < 3 ? "border-brand-300 bg-brand-50" : ""
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-ink-400">#{i + 1}</div>
                    <div className="text-sm font-bold">#{t.tag}</div>
                    <div className="text-[11px] text-ink-500">
                      캠페인 {t.count}개 · {t.weight}명 신청
                    </div>
                  </div>
                  {i < 3 && <span className="text-lg">🔥</span>}
                </Link>
              ))}
            </div>
          </section>

          {others.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold">전체 태그</h2>
              <div className="flex flex-wrap gap-1.5">
                {others.map((t) => (
                  <Link
                    key={t.tag}
                    href={`/campaigns?tag=${encodeURIComponent(t.tag)}`}
                    className="badge bg-white px-2.5 py-1 text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100"
                  >
                    #{t.tag}{" "}
                    <span className="ml-1 text-[10px] text-ink-400">{t.count}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
