import Link from "next/link";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { isOAuthEnabled } from "@/lib/oauth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const sp = await searchParams;
  const enabled = isOAuthEnabled();
  const ref = sp.ref || "";
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
          <div>
            <label className="label">친구 초대 코드 (선택, 양쪽 +1,000P)</label>
            <input
              className="input"
              name="referralCode"
              defaultValue={ref}
              placeholder="추천인 코드"
            />
            {ref && (
              <p className="mt-1 text-[11px] text-emerald-600">
                ✓ 초대 코드가 자동 입력되었습니다.
              </p>
            )}
          </div>
          <div className="space-y-1.5 rounded-lg bg-ink-50 p-3 dark:bg-ink-900">
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" name="agreeTerms" value="1" required className="mt-0.5" />
              <span>
                <b>(필수)</b>{" "}
                <Link href="/terms" target="_blank" className="text-brand-600 underline-offset-2 hover:underline">
                  이용약관
                </Link>
                에 동의합니다.
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" name="agreePrivacy" value="1" required className="mt-0.5" />
              <span>
                <b>(필수)</b>{" "}
                <Link href="/privacy" target="_blank" className="text-brand-600 underline-offset-2 hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다.
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" name="agreeMarketing" value="1" className="mt-0.5" />
              <span>(선택) 마케팅 정보 수신 (쿠폰·이벤트 알림)</span>
            </label>
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
