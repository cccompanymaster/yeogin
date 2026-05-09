import Link from "next/link";

export const metadata = {
  title: "자주 묻는 질문 - 여긴",
  description: "캠페인 신청, 선정, 리뷰 작성 등 자주 묻는 질문 모음",
};

const FAQS: Array<{ category: string; items: Array<{ q: string; a: string }> }> = [
  {
    category: "회원가입 / 계정",
    items: [
      { q: "가입은 무료인가요?", a: "네, 가입과 캠페인 신청 모두 무료입니다. 가입 시 5,000P가 즉시 지급됩니다." },
      { q: "여러 계정을 만들어도 되나요?", a: "한 사람당 하나의 계정만 허용됩니다. 부정 가입이 확인되면 모든 계정이 정지됩니다." },
      { q: "탈퇴는 어떻게 하나요?", a: "마이페이지 → 프로필 수정 → 탈퇴 절차를 진행하실 수 있습니다. (개발 중 — 운영팀 문의)" },
    ],
  },
  {
    category: "캠페인 신청 / 선정",
    items: [
      { q: "선정 확률을 높이려면 어떻게 하나요?", a: "① SNS 채널을 인증하세요 (인증 시 매칭 점수 +13점) ② 자기소개에 매장의 어떤 점이 마음에 들었는지 구체적으로 적어주세요 ③ 활동지역을 정확히 등록하면 방문형에서 우대됩니다." },
      { q: "선정된 후 취소할 수 있나요?", a: "선정 발표 후 24시간 내 1회는 패널티 없이 취소 가능합니다. 그 이후 취소 시 -500P가 차감됩니다." },
      { q: "여러 캠페인 동시 신청 가능한가요?", a: "동시 5건까지 신청 가능합니다. 단, 진행 중인 리뷰가 있으면 새 캠페인 선정이 보류될 수 있습니다." },
    ],
  },
  {
    category: "리뷰 작성",
    items: [
      { q: "리뷰는 언제까지 작성해야 하나요?", a: "캠페인 페이지의 '리뷰 기간' 안에 작성해야 합니다. 미작성 시 -1,000P 차감 + 신뢰등급 강등이 적용됩니다." },
      { q: "키워드는 꼭 포함해야 하나요?", a: "필수 키워드는 모두 포함해야 합니다. 본문 발췌 입력 시 자동 검사되며, 누락 키워드가 있으면 광고주 검수 단계에서 반려될 수 있습니다." },
      { q: "리뷰가 반려되면?", a: "반려 사유가 표시되며, 마이페이지에서 수정 후 재등록할 수 있습니다." },
    ],
  },
  {
    category: "포인트 / 환급",
    items: [
      { q: "포인트는 어디에 쓰나요?", a: "포인트샵에서 기프티콘·우선매칭권 등으로 교환할 수 있습니다. 신뢰등급 즉시 승급권도 구매 가능합니다." },
      { q: "포인트는 현금으로 환급되나요?", a: "현재는 포인트샵 교환만 지원합니다. 운영팀 검토를 거쳐 향후 추가될 예정입니다." },
      { q: "친구 초대 보상은 언제 들어오나요?", a: "친구가 추천 코드로 가입을 완료하면 즉시 양쪽에 1,000P가 지급됩니다." },
    ],
  },
  {
    category: "광고주 / 캠페인 등록",
    items: [
      { q: "광고주 가입 비용은?", a: "가입은 무료입니다. 캠페인을 등록하는 시점에 포인트가 차감됩니다 (모집 인원 × 3,000P 기준)." },
      { q: "캠페인 등록 비용은 어떻게 산정되나요?", a: "기본 = 모집 인원 × 3,000P. 타입에 따라 ×0.5~×1.2 가중치, 빠른선정 옵션 +10,000P가 추가됩니다." },
    ],
  },
];

export default function FAQPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">자주 묻는 질문</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          답변에서 답을 찾지 못했다면 운영팀에 문의해주세요.
        </p>
      </div>

      {FAQS.map((g) => (
        <section key={g.category} className="space-y-3">
          <h2 className="text-base font-bold">{g.category}</h2>
          <div className="card divide-y divide-ink-100 dark:divide-ink-700">
            {g.items.map((it) => (
              <details key={it.q} className="group p-4">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold">
                  <span>Q. {it.q}</span>
                  <span className="text-ink-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                  {it.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="card p-5 text-sm text-ink-600 dark:text-ink-300">
        💡 답을 찾지 못하셨다면{" "}
        <Link href="/community" className="font-bold text-brand-600">
          커뮤니티
        </Link>
        에 문의를 남겨주세요. 보통 24시간 내 운영팀이 답변드립니다.
      </div>
    </article>
  );
}
