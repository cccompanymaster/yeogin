import Link from "next/link";

export default async function AdvertiserLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold">광고주 로그인</h1>
        <form action="/api/advertiser/login" method="post" className="mt-5 space-y-3">
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
          광고주 계정이 없으신가요?{" "}
          <Link href="/advertiser/signup" className="font-semibold text-brand-600">
            가입하기
          </Link>
        </div>
        <div className="mt-3 rounded-md bg-ink-50 p-3 text-[11px] text-ink-500">
          데모 광고주: <b>biz@yeogin.kr</b> / <b>biz1234</b>
        </div>
      </div>
    </div>
  );
}
