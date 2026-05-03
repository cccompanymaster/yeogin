import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdvertiserSession } from "@/lib/session";

export default async function AdvertiserLanding() {
  const session = await getAdvertiserSession();
  if (session) redirect("/advertiser/dashboard");

  return (
    <div className="space-y-12">
      <section className="card overflow-hidden bg-gradient-to-br from-ink-900 to-ink-800 p-10 text-white">
        <div className="text-xs font-semibold text-brand-300">FOR ADVERTISERS</div>
        <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
          매출이 오르는 체험단,<br />여긴 비즈센터
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-300">
          5분 만에 캠페인을 등록하고, 검증된 인플루언서에게 진짜 후기를 받아보세요.
          사업자번호로 간편하게 시작합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/advertiser/signup" className="btn-primary">
            광고주 가입 →
          </Link>
          <Link href="/advertiser/login" className="btn-outline border-ink-700 bg-transparent text-white hover:bg-ink-700">
            로그인
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { t: "5분 캠페인 등록", d: "방문/배송/구매/기자단 4가지 타입 템플릿 제공" },
          { t: "신뢰등급 신청자 매칭", d: "Bronze→Diamond 신뢰등급으로 검증된 인플루언서" },
          { t: "리뷰 자동 검수", d: "필수 키워드·이미지 검수, 미작성 패널티 자동 부과" },
        ].map((f) => (
          <div key={f.t} className="card p-6">
            <div className="text-base font-bold text-ink-900">{f.t}</div>
            <div className="mt-2 text-sm text-ink-600">{f.d}</div>
          </div>
        ))}
      </section>

      <section className="card p-8">
        <h2 className="text-xl font-bold">진행 프로세스</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          {["캠페인 등록", "신청자 모집", "선정", "체험·리뷰", "검수·정산"].map((s, i) => (
            <div key={s} className="flex items-start gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                {i + 1}
              </div>
              <div className="text-sm font-semibold text-ink-800">{s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
