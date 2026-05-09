import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { CATEGORIES, REGIONS } from "@/lib/format";

export const metadata = { title: "환영합니다 - 여긴" };

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");
  const sp = await searchParams;

  const interests = (me.interests || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="card overflow-hidden bg-gradient-to-br from-brand-500 to-pink-500 p-6 text-white">
        <div className="text-3xl">🎉</div>
        <h1 className="mt-2 text-2xl font-black">
          {me.nickname}님, 여긴에 오신 걸 환영해요!
        </h1>
        <p className="mt-2 text-sm opacity-95">
          가입 축하 5,000P가 적립되었어요. 관심사를 선택하면 매칭 점수가 올라가
          캠페인 선정 확률이 높아집니다.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="가입 축하" value="+5,000P" highlight />
        <Stat label="다음 단계" value="관심사 등록" />
        <Stat label="추천" value="블로그 인증" />
      </div>

      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20">
          ✓ 저장되었습니다. 이제 캠페인을 둘러볼까요?
        </div>
      )}

      {/* STEP 1: 관심사 선택 */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
            STEP 1
          </span>
          <h2 className="text-base font-bold">관심 카테고리 선택 (최대 5개)</h2>
        </div>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          내 활동 주제와 일치하는 카테고리를 선택하세요. 매칭 점수에 자동 반영됩니다.
        </p>
        <form action="/api/auth/welcome" method="post" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 dark:border-ink-700 dark:has-[:checked]:bg-brand-900/30 dark:has-[:checked]:text-brand-300"
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={c}
                  defaultChecked={interests.includes(c)}
                  className="sr-only"
                />
                {c}
              </label>
            ))}
          </div>

          {/* STEP 2: 활동 지역 */}
          <div className="border-t border-ink-100 pt-4 dark:border-ink-700">
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                STEP 2
              </span>
              <h2 className="text-base font-bold">활동 지역</h2>
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              방문형 캠페인은 지역과 일치할 때 매칭 점수가 +25점 올라갑니다.
            </p>
            <select
              name="region"
              className="input mt-3"
              defaultValue={me.region ?? ""}
            >
              <option value="">선택 안 함</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 3: SNS 빠른 등록 */}
          <div className="border-t border-ink-100 pt-4 dark:border-ink-700">
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                STEP 3
              </span>
              <h2 className="text-base font-bold">SNS 채널 (선택)</h2>
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              하나라도 등록하면 광고주 신뢰도와 매칭 점수가 크게 올라갑니다.
              가입 후 마이페이지에서 인증샷도 업로드할 수 있어요.
            </p>
            <div className="mt-3 space-y-2">
              <input
                className="input"
                name="blogUrl"
                type="url"
                defaultValue={me.blogUrl ?? ""}
                placeholder="블로그 URL"
              />
              <input
                className="input"
                name="instaUrl"
                type="url"
                defaultValue={me.instaUrl ?? ""}
                placeholder="인스타그램 URL"
              />
              <input
                className="input"
                name="youtubeUrl"
                type="url"
                defaultValue={me.youtubeUrl ?? ""}
                placeholder="유튜브 채널 URL (자동 인증 가능)"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/campaigns" className="btn-outline flex-1 py-2.5 text-center">
              나중에 하기
            </Link>
            <button className="btn-primary flex-[2] py-2.5">저장하고 캠페인 보기</button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-ink-50 p-4 text-xs text-ink-600 dark:bg-ink-900 dark:text-ink-300">
        💡 <b>다음에 해보면 좋아요</b>
        <ul className="mt-2 space-y-1">
          <li>① 마이페이지에서 SNS 인증샷 업로드 (✓ 인증 배지)</li>
          <li>② 친구 초대 코드로 양쪽 1,000P 즉시 적립</li>
          <li>③ 매일 출석체크로 최대 +500P</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-3 ${highlight ? "border-brand-300 bg-brand-50 dark:bg-brand-900/30" : ""}`}>
      <div className="text-[10px] text-ink-500 dark:text-ink-400">{label}</div>
      <div className={`mt-0.5 text-sm font-black ${highlight ? "text-brand-700 dark:text-brand-300" : ""}`}>
        {value}
      </div>
    </div>
  );
}
