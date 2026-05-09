import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { REGIONS } from "@/lib/format";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3">
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
      </div>
      <div className="card p-6">
        <h1 className="text-xl font-bold">프로필 수정</h1>
        <p className="mt-1 text-sm text-ink-500">
          활동 지역과 채널을 정확히 입력하면 선정 확률이 올라갑니다.
        </p>
        {sp.ok && (
          <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            저장되었습니다.
          </div>
        )}
        {sp.error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {decodeURIComponent(sp.error)}
          </div>
        )}
        <form action="/api/auth/profile" method="post" className="mt-5 space-y-3">
          <div>
            <label className="label">이메일</label>
            <input className="input bg-ink-50" defaultValue={me.email} disabled />
          </div>
          <div>
            <label className="label">닉네임 *</label>
            <input className="input" name="nickname" required defaultValue={me.nickname} />
          </div>
          <div>
            <label className="label">연락처</label>
            <input
              className="input"
              name="phone"
              defaultValue={me.phone ?? ""}
              placeholder="010-0000-0000"
            />
          </div>
          <div>
            <label className="label">활동 지역 (📍 내 주변 자동 적용)</label>
            <select className="input" name="region" defaultValue={me.region ?? ""}>
              <option value="">선택 안 함</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">블로그 URL</label>
            <input
              className="input"
              name="blogUrl"
              defaultValue={me.blogUrl ?? ""}
              placeholder="https://blog.naver.com/..."
            />
          </div>
          <div>
            <label className="label">인스타 URL</label>
            <input
              className="input"
              name="instaUrl"
              defaultValue={me.instaUrl ?? ""}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="label">유튜브 URL</label>
            <input
              className="input"
              name="youtubeUrl"
              defaultValue={me.youtubeUrl ?? ""}
              placeholder="https://youtube.com/@..."
            />
          </div>
          <div className="rounded-lg border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-900">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="publicProfile"
                value="1"
                defaultChecked={me.publicProfile}
                className="mt-0.5"
              />
              <span>
                <b>광고주 검색 노출 허용</b>
                <span className="block text-xs text-ink-500 dark:text-ink-400">
                  광고주가 인플루언서 검색에서 내 프로필을 볼 수 있고, 직접 캠페인
                  초대를 보낼 수 있습니다. 끄면 검색에 노출되지 않습니다.
                </span>
              </span>
            </label>
          </div>
          <button className="btn-primary w-full py-2.5">저장</button>
        </form>
      </div>
    </div>
  );
}
