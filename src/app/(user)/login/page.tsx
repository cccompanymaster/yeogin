import Link from "next/link";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { isOAuthEnabled } from "@/lib/oauth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const enabled = isOAuthEnabled();
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold">로그인</h1>
        <SocialLoginButtons enabled={enabled} />
        <form action="/api/auth/login" method="post" className="mt-5 space-y-3">
          <div>
            <label className="label">이메일</label>
            <input className="input" name="email" type="email" required />
          </div>
          <div>
            <label className="label">비밀번호</label>
            <input className="input" name="password" type="password" required />
          </div>
          {sp.error && (
            <div className="text-xs text-red-500">{decodeURIComponent(sp.error)}</div>
          )}
          <button className="btn-primary w-full py-2.5">로그인</button>
        </form>
        <div className="mt-4 text-center text-xs text-ink-500">
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="font-semibold text-brand-600">
            회원가입
          </Link>
        </div>
        <div className="mt-3 rounded-md bg-ink-50 p-3 text-[11px] text-ink-500">
          데모 계정: <b>demo@yeogin.kr</b> / <b>demo1234</b>
        </div>
      </div>
    </div>
  );
}
