import Link from "next/link";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { isOAuthEnabled } from "@/lib/oauth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const enabled = isOAuthEnabled();
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold">회원가입</h1>
        <p className="mt-1 text-sm text-ink-500">
          무료로 가입하고 매일 새로 열리는 체험단에 신청하세요.
        </p>
        <SocialLoginButtons enabled={enabled} />
        <div className="my-3 text-center text-[11px] font-semibold text-ink-500">
          또는 이메일로 가입
        </div>
        <form action="/api/auth/signup" method="post" className="space-y-3">
          <div>
            <label className="label">이메일</label>
            <input className="input" name="email" type="email" required />
          </div>
          <div>
            <label className="label">닉네임</label>
            <input className="input" name="nickname" required />
          </div>
          <div>
            <label className="label">비밀번호</label>
            <input className="input" name="password" type="password" minLength={6} required />
          </div>
          <div>
            <label className="label">블로그 URL (선택)</label>
            <input className="input" name="blogUrl" placeholder="https://blog.naver.com/..." />
          </div>
          <div>
            <label className="label">인스타 URL (선택)</label>
            <input className="input" name="instaUrl" placeholder="https://instagram.com/..." />
          </div>
          {sp.error && (
            <div className="text-xs text-red-500">{decodeURIComponent(sp.error)}</div>
          )}
          <button className="btn-primary w-full py-2.5">가입하기</button>
        </form>
        <div className="mt-4 text-center text-xs text-ink-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-brand-600">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
