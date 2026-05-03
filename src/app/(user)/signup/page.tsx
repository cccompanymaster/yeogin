import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold">회원가입</h1>
        <p className="mt-1 text-sm text-ink-500">
          무료로 가입하고 매일 새로 열리는 체험단에 신청하세요.
        </p>
        <form action="/api/auth/signup" method="post" className="mt-5 space-y-3">
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
