import Link from "next/link";

export default async function AdvertiserSignup({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold">광고주 가입</h1>
        <p className="mt-1 text-sm text-ink-500">
          사업자번호로 간편하게 가입하세요. (데모 - 실제 검증은 생략됩니다)
        </p>
        <form action="/api/advertiser/signup" method="post" className="mt-5 space-y-3">
          <div>
            <label className="label">이메일</label>
            <input className="input" name="email" type="email" required />
          </div>
          <div>
            <label className="label">비밀번호</label>
            <input className="input" name="password" type="password" minLength={6} required />
          </div>
          <div>
            <label className="label">상호명</label>
            <input className="input" name="companyName" required placeholder="(주)여긴" />
          </div>
          <div>
            <label className="label">사업자번호</label>
            <input className="input" name="bizNumber" required placeholder="000-00-00000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">담당자명</label>
              <input className="input" name="contactName" required />
            </div>
            <div>
              <label className="label">연락처</label>
              <input className="input" name="phone" required placeholder="010-0000-0000" />
            </div>
          </div>
          {sp.error && (
            <div className="text-xs text-red-500">{decodeURIComponent(sp.error)}</div>
          )}
          <button className="btn-primary w-full py-2.5">가입 완료</button>
        </form>
        <div className="mt-4 text-center text-xs text-ink-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/advertiser/login" className="font-semibold text-brand-600">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
