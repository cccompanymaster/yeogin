import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "팀 관리 - 여긴 비즈센터" };

const ROLE_LABEL: Record<string, string> = {
  OWNER: "운영자",
  MANAGER: "매니저",
  MEMBER: "멤버",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const sp = await searchParams;

  const members = await db.advertiserMember.findMany({
    where: { advertiserId: session.id },
    orderBy: [{ status: "asc" }, { invitedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">팀 관리</h1>
        <p className="mt-1 text-sm text-ink-500">
          여러 담당자가 같은 광고주 계정의 캠페인을 공동 관리할 수 있도록 멤버를
          초대하세요.
        </p>
      </div>

      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          ✓ 초대 메일이 발송되었습니다. 멤버가 가입하면 자동으로 활성화됩니다.
        </div>
      )}
      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="card p-5">
        <h2 className="text-base font-bold">멤버 초대</h2>
        <form
          action="/api/advertiser/team"
          method="post"
          className="mt-3 flex flex-col gap-2 md:flex-row"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="이메일 주소"
            className="input flex-1"
          />
          <select name="role" className="input md:w-32" defaultValue="MEMBER">
            <option value="MANAGER">매니저</option>
            <option value="MEMBER">멤버</option>
          </select>
          <button className="btn-primary">초대 보내기</button>
        </form>
        <p className="mt-2 text-[11px] text-ink-500">
          매니저: 캠페인 등록·수정·검수 가능 / 멤버: 캠페인 조회 + 신청자 관리만
          가능
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold">팀 멤버 ({members.length + 1}명)</h2>
        <div className="card divide-y divide-ink-100 dark:divide-ink-700">
          {/* 본인 */}
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                {session.name}
                <span className="badge bg-amber-100 text-amber-800">운영자 (나)</span>
              </div>
              <div className="text-[11px] text-ink-500">{session.email}</div>
            </div>
          </div>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {m.email}
                  <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
                    {ROLE_LABEL[m.role] || m.role}
                  </span>
                </div>
                <div className="text-[11px] text-ink-500">
                  {m.status === "INVITED"
                    ? `초대 보냄 · ${fmtDate(m.invitedAt)}`
                    : m.status === "ACTIVE"
                      ? `활성 · 가입 ${m.joinedAt ? fmtDate(m.joinedAt) : ""}`
                      : "철회됨"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.status === "INVITED" && (
                  <span className="badge bg-amber-100 text-amber-800">대기중</span>
                )}
                {m.status === "ACTIVE" && (
                  <span className="badge bg-emerald-500 text-white">활성</span>
                )}
                <form action={`/api/advertiser/team/${m.id}/revoke`} method="post">
                  <button className="badge bg-red-50 text-red-700 hover:bg-red-100">
                    제거
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-ink-50 p-4 text-xs text-ink-500 dark:bg-ink-800">
        ⚠️ 본 화면은 데모입니다. 실제 멤버 권한 분리는 추후 자동화될 예정이며,
        현재 초대 메일은 콘솔 로그로만 출력됩니다 (이메일 발송 서비스 연동 필요).
      </div>
    </div>
  );
}
