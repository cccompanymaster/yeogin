import { redirect } from "next/navigation";
import { getAdvertiserSession } from "@/lib/session";
import { CATEGORIES, REGIONS } from "@/lib/format";
import { db } from "@/lib/db";
import { CampaignCostPreview } from "@/components/CampaignCostPreview";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const sp = await searchParams;
  const adv = await db.advertiser.findUnique({
    where: { id: session.id },
    select: { point: true },
  });
  const balance = adv?.point ?? 0;

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const plus = (n: number) => fmt(new Date(today.getTime() + n * 86400000));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">캠페인 등록</h1>
      <p className="mt-1 text-sm text-ink-500">
        가이드 템플릿이 자동 적용됩니다. 등록 즉시 노출됩니다.
      </p>

      <form action="/api/advertiser/campaigns" method="post" className="mt-6 space-y-5">
        <Section title="기본 정보">
          <div>
            <label className="label">캠페인 제목 *</label>
            <input className="input" name="title" required placeholder="강남 신상 파스타 맛집 체험단 모집" />
          </div>
          <div>
            <label className="label">썸네일 이미지 URL *</label>
            <input
              className="input"
              name="thumbnail"
              required
              defaultValue="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">캠페인 타입 *</label>
              <select className="input" name="type" required>
                <option value="VISIT">방문형</option>
                <option value="DELIVERY">배송형</option>
                <option value="PURCHASE">구매형</option>
                <option value="REPORTER">기자단</option>
              </select>
            </div>
            <div>
              <label className="label">채널 *</label>
              <select className="input" name="channel" required>
                <option value="BLOG">블로그</option>
                <option value="INSTA">인스타</option>
                <option value="YOUTUBE">유튜브</option>
                <option value="SHORTS">숏폼</option>
                <option value="CLIP">클립</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">카테고리 *</label>
              <select className="input" name="category" required>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">지역 (방문형만)</label>
              <select className="input" name="region">
                <option value="">선택</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">매장 주소</label>
            <input className="input" name="address" placeholder="서울 강남구 테헤란로 123" />
          </div>
        </Section>

        <Section title="제공 내역">
          <div>
            <label className="label">제공 내역 *</label>
            <input
              className="input"
              name="offer"
              required
              placeholder="2인 코스 요리 (10만원 상당)"
            />
          </div>
          <div>
            <label className="label">제공 가치 (원) *</label>
            <input className="input" name="offerValue" type="number" required defaultValue={100000} />
          </div>
        </Section>

        <Section title="모집·일정">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">모집 인원 *</label>
              <input className="input" name="capacity" type="number" required defaultValue={5} min={1} />
            </div>
            <div className="flex items-end gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="fastMatch" value="1" />
                ⚡ 빠른선정 (24시간 내 매칭)
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">신청 시작 *</label>
              <input className="input" name="applyStart" type="date" required defaultValue={fmt(today)} />
            </div>
            <div>
              <label className="label">신청 마감 *</label>
              <input className="input" name="applyEnd" type="date" required defaultValue={plus(7)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">발표일 *</label>
              <input className="input" name="announceAt" type="date" required defaultValue={plus(8)} />
            </div>
            <div>
              <label className="label">리뷰 시작 *</label>
              <input className="input" name="reviewStart" type="date" required defaultValue={plus(9)} />
            </div>
            <div>
              <label className="label">리뷰 마감 *</label>
              <input className="input" name="reviewEnd" type="date" required defaultValue={plus(23)} />
            </div>
          </div>
        </Section>

        <Section title="콘텐츠">
          <div>
            <label className="label">캠페인 소개 *</label>
            <textarea
              className="input min-h-32"
              name="description"
              required
              defaultValue="저희 매장의 시그니처 메뉴를 정성껏 준비해드립니다. 솔직하고 자세한 후기를 남겨주실 분을 모집합니다."
            />
          </div>
          <div>
            <label className="label">미션 가이드 *</label>
            <textarea
              className="input min-h-32"
              name="guide"
              required
              defaultValue={`1. 매장 외관/내부/메뉴 사진을 5장 이상 포함해주세요\n2. 글자 수 1000자 이상 작성\n3. 필수 키워드 모두 포함\n4. 부정적인 표현은 피해주세요`}
            />
          </div>
          <div>
            <label className="label">필수 키워드 (콤마 구분) *</label>
            <input className="input" name="keywords" required defaultValue="강남맛집, 데이트코스, 분위기맛집" />
          </div>
          <div>
            <label className="label">검색·추천 태그 (콤마 구분, 선택)</label>
            <input
              className="input"
              name="tags"
              defaultValue="강남, 데이트, 분위기맛집, 신상"
              placeholder="예: 강남, 데이트, 신상, 가성비"
            />
            <p className="mt-1 text-[11px] text-ink-500">
              태그가 많을수록 검색·인기 태그·추천에 잘 노출됩니다.
            </p>
          </div>
        </Section>

        {sp.error && <div className="text-xs text-red-500">{decodeURIComponent(sp.error)}</div>}
        <CampaignCostPreview balance={balance} />
        <button className="btn-primary w-full py-3">캠페인 등록하기</button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3 p-5">
      <div className="text-sm font-bold text-ink-800">{title}</div>
      {children}
    </div>
  );
}
