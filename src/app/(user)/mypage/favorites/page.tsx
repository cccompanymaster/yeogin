import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { CampaignCard } from "@/components/CampaignCard";

export default async function FavoritesPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const favs = await db.favorite.findMany({
    where: { userId: session.id },
    include: { campaign: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
        <h1 className="mt-1 text-2xl font-bold">관심 캠페인</h1>
        <p className="mt-1 text-sm text-ink-500">
          하트를 누른 캠페인을 한 곳에서 확인하세요. 마감일을 놓치지 않아요.
        </p>
      </div>

      {favs.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 관심 캠페인이 없습니다.
          <div className="mt-3">
            <Link href="/campaigns" className="btn-primary">
              캠페인 둘러보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {favs.map((f) => (
            <CampaignCard
              key={f.id}
              c={f.campaign}
              favorited
              loggedIn
            />
          ))}
        </div>
      )}
    </div>
  );
}
