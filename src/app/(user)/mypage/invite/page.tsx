import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "친구 초대 - 여긴" };

export default async function InvitePage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");

  const referrals = await db.user.findMany({
    where: { referredById: me.id },
    select: { id: true, nickname: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const earned = referrals.length * 1000;
  const baseUrl = process.env.SITE_URL || "https://yeogin.vercel.app";
  const inviteUrl = `${baseUrl}/signup?ref=${me.referralCode}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
        <h1 className="mt-1 text-2xl font-bold">친구 초대</h1>
        <p className="mt-1 text-sm text-ink-500">
          내 추천 코드로 친구가 가입하면 <b className="text-brand-600">양쪽 모두 1,000P</b>
          가 지급됩니다.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 to-pink-500 p-6 text-white">
          <div className="text-xs font-bold opacity-90">내 추천 코드</div>
          <div className="mt-1 font-mono text-2xl font-black tracking-wider">
            {me.referralCode}
          </div>
          <CopyInviteButton url={inviteUrl} code={me.referralCode} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="초대한 친구" value={`${referrals.length}명`} />
        <Stat label="누적 적립" value={`+${earned.toLocaleString()}P`} highlight />
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold">초대 내역</h2>
        {referrals.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            아직 초대한 친구가 없습니다. 위 코드를 친구에게 공유해보세요!
          </div>
        ) : (
          <div className="card divide-y divide-ink-100">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-bold">{r.nickname}</div>
                  <div className="text-[11px] text-ink-500">{fmtDate(r.createdAt)} 가입</div>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700">+1,000P</span>
              </div>
            ))}
          </div>
        )}
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
