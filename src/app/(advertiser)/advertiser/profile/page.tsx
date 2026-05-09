import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";

export const metadata = { title: "프로필 수정 - 비즈센터" };

export default async function AdvertiserProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const adv = await db.advertiser.findUnique({ where: { id: session.id } });
  if (!adv) redirect("/advertiser/login");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/advertiser/dashboard" className="text-xs text-ink-500">
        ← 대시보드
      </Link>
      <h1 className="mt-1 text-2xl font-bold">프로필 수정</h1>
      <p className="mt-1 text-sm text-ink-500">
        매장 정보를 최신으로 유지해주세요. 캠페인 노출과 검수에 활용됩니다.
      </p>

      {sp.ok && (
        <div className="card mt-4 border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          ✓ 저장되었습니다.
        </div>
      )}
      {sp.error && (
        <div className="card mt-4 border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <form
        action="/api/advertiser/profile"
        method="post"
        className="mt-6 space-y-4"
      >
        <div>
          <label className="label">이메일 (변경 불가)</label>
          <input className="input bg-ink-50 dark:bg-ink-900" defaultValue={adv.email} disabled />
        </div>
        <div>
          <label className="label">상호명 *</label>
          <input className="input" name="companyName" required defaultValue={adv.companyName} />
        </div>
        <div>
          <label className="label">사업자번호 *</label>
          <input className="input" name="bizNumber" required defaultValue={adv.bizNumber} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">담당자명 *</label>
            <input className="input" name="contactName" required defaultValue={adv.contactName} />
          </div>
          <div>
            <label className="label">연락처 *</label>
            <input className="input" name="phone" required defaultValue={adv.phone} />
          </div>
        </div>

        <div className="card border-ink-200 p-4 dark:border-ink-700">
          <h2 className="text-sm font-bold">비밀번호 변경 (선택)</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="label">현재 비밀번호</label>
              <input className="input" name="currentPassword" type="password" />
            </div>
            <div>
              <label className="label">새 비밀번호 (6자+)</label>
              <input className="input" name="newPassword" type="password" minLength={6} />
            </div>
          </div>
        </div>

        <button className="btn-primary w-full py-2.5">저장</button>
      </form>
    </div>
  );
}
