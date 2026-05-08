import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { CATEGORIES, REGIONS } from "@/lib/format";

const fmtIso = (d: Date) => new Date(d).toISOString().slice(0, 10);

export default async function EditCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const { id } = await params;
  const sp = await searchParams;

  const c = await db.campaign.findUnique({ where: { id } });
  if (!c || c.advertiserId !== session.id) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">캠페인 수정</h1>
      <p className="mt-1 text-sm text-ink-500">{c.title}</p>

      <form
        action={`/api/advertiser/campaigns/${c.id}`}
        method="post"
        className="mt-6 space-y-5"
      >
        <input type="hidden" name="_method" value="patch" />
        <Section title="기본 정보">
          <div>
            <label className="label">제목 *</label>
            <input className="input" name="title" required defaultValue={c.title} />
          </div>
          <div>
            <label className="label">썸네일 URL *</label>
            <input className="input" name="thumbnail" required defaultValue={c.thumbnail} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">타입 *</label>
              <select className="input" name="type" defaultValue={c.type}>
                <option value="VISIT">방문형</option>
                <option value="DELIVERY">배송형</option>
                <option value="PURCHASE">구매형</option>
                <option value="REPORTER">기자단</option>
              </select>
            </div>
            <div>
              <label className="label">채널 *</label>
              <select className="input" name="channel" defaultValue={c.channel}>
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
              <select className="input" name="category" defaultValue={c.category}>
                {CATEGORIES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="label">지역</label>
              <select className="input" name="region" defaultValue={c.region ?? ""}>
                <option value="">선택</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">매장 주소</label>
            <input className="input" name="address" defaultValue={c.address ?? ""} />
          </div>
        </Section>

        <Section title="제공 내역">
          <div>
            <label className="label">제공 내역 *</label>
            <input className="input" name="offer" required defaultValue={c.offer} />
          </div>
          <div>
            <label className="label">제공 가치 (원) *</label>
            <input className="input" name="offerValue" type="number" required defaultValue={c.offerValue} />
          </div>
        </Section>

        <Section title="모집·일정">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">모집 인원 *</label>
              <input className="input" name="capacity" type="number" required defaultValue={c.capacity} min={1} />
            </div>
            <div className="flex items-end gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="fastMatch" value="1" defaultChecked={c.fastMatch} />
                ⚡ 빠른선정
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">신청 시작 *</label>
              <input className="input" name="applyStart" type="date" required defaultValue={fmtIso(c.applyStart)} />
            </div>
            <div>
              <label className="label">신청 마감 *</label>
              <input className="input" name="applyEnd" type="date" required defaultValue={fmtIso(c.applyEnd)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">발표일 *</label>
              <input className="input" name="announceAt" type="date" required defaultValue={fmtIso(c.announceAt)} />
            </div>
            <div>
              <label className="label">리뷰 시작 *</label>
              <input className="input" name="reviewStart" type="date" required defaultValue={fmtIso(c.reviewStart)} />
            </div>
            <div>
              <label className="label">리뷰 마감 *</label>
              <input className="input" name="reviewEnd" type="date" required defaultValue={fmtIso(c.reviewEnd)} />
            </div>
          </div>
        </Section>

        <Section title="콘텐츠">
          <div>
            <label className="label">캠페인 소개 *</label>
            <textarea className="input min-h-32" name="description" required defaultValue={c.description} />
          </div>
          <div>
            <label className="label">미션 가이드 *</label>
            <textarea className="input min-h-32" name="guide" required defaultValue={c.guide} />
          </div>
          <div>
            <label className="label">필수 키워드 *</label>
            <input className="input" name="keywords" required defaultValue={c.keywords} />
          </div>
          <div>
            <label className="label">검색·추천 태그</label>
            <input className="input" name="tags" defaultValue={c.tags ?? ""} />
          </div>
        </Section>

        {sp.error && <div className="text-xs text-red-500">{decodeURIComponent(sp.error)}</div>}
        <button className="btn-primary w-full py-3">수정 완료</button>
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
