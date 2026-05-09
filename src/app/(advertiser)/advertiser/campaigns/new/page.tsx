import { redirect } from "next/navigation";
import { getAdvertiserSession } from "@/lib/session";
import { CATEGORIES, REGIONS, CHANNEL_LABEL, TYPE_LABEL } from "@/lib/format";
import { db } from "@/lib/db";
import { CampaignCostPreview } from "@/components/CampaignCostPreview";
import { CampaignTemplatePicker } from "@/components/CampaignTemplatePicker";

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
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">캠페인 등록</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        템플릿을 고르면 모든 항목이 자동으로 채워집니다. 필요한 부분만 수정해서 발행하세요.
      </p>

      <form action="/api/advertiser/campaigns" method="post" className="mt-6 space-y-5">
        <CampaignTemplatePicker />

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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="label">유형 *</label>
              <select className="input" name="type" required defaultValue="VISIT">
                {Object.entries(TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">채널 *</label>
              <select className="input" name="channel" required defaultValue="BLOG">
                {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">카테고리 *</label>
              <select className="input" name="category" required defaultValue="맛집">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">지역 (방문형)</label>
              <select className="input" name="region" defaultValue="서울 성북구">
                <option value="">선택 안 함</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">매장 주소</label>
              <input className="input" name="address" placeholder="서울 성북구 ..." />
            </div>
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
            <div className="flex items-end">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">방문 가능 요일 (방문형)</label>
              <input className="input" name="visitDays" placeholder="월,화,수,목,금" />
            </div>
            <div>
              <label className="label">방문 가능 시간</label>
              <input className="input" name="visitTime" placeholder="12:00~21:00" />
            </div>
          </div>
        </Section>

        <Section title="체험단 미션 (체크박스만 선택하면 OK)">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <NumberMission name="missionPhotos" label="📷 사진 매수" defaultValue={5} unit="장 이상" />
            <NumberMission name="missionWords" label="✏️ 글자 수" defaultValue={500} unit="자 이상" />
            <CheckMission name="missionMap" label="📍 지도 첨부" />
            <CheckMission name="missionVideo" label="🎬 동영상/GIF" />
          </div>
          <p className="mt-2 text-[11px] text-ink-500 dark:text-ink-400">
            이 항목들은 캠페인 상세 페이지에 아이콘 그리드로 자동 노출됩니다.
          </p>
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
              className="input min-h-24"
              name="guide"
              required
              defaultValue={`체험 후 솔직한 후기를 작성해주세요. 매장의 분위기와 메뉴를 골고루 담아주시면 좋아요.`}
            />
          </div>
          <div>
            <label className="label">매장 요청 사항 (자유 메모)</label>
            <textarea
              className="input min-h-24"
              name="storeRequest"
              placeholder="✅ 실제 손님처럼 자연스럽게&#10;✅ 사진은 자연광이 좋은 시간대 추천&#10;✅ 마지막에 매장 위치/예약 방법 안내"
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
            />
          </div>
        </Section>

        {sp.error && <div className="text-xs text-red-500">{decodeURIComponent(sp.error)}</div>}

        <Section title="발행 설정">
          <div>
            <label className="label">예약 발행 (선택, 비우면 즉시 발행)</label>
            <input className="input" name="publishAt" type="datetime-local" />
          </div>
        </Section>

        <CampaignCostPreview balance={balance} />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="action"
            value="draft"
            formNoValidate
            className="btn-outline flex-1 py-3"
          >
            💾 임시저장
          </button>
          <button
            type="submit"
            name="action"
            value="schedule"
            className="btn-outline flex-1 py-3"
          >
            ⏰ 예약 발행
          </button>
          <button
            type="submit"
            name="action"
            value="open"
            className="btn-primary flex-[2] py-3"
          >
            즉시 발행
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3 p-5">
      <div className="text-sm font-bold text-ink-800 dark:text-ink-100">{title}</div>
      {children}
    </div>
  );
}

function NumberMission({
  name,
  label,
  defaultValue,
  unit,
}: {
  name: string;
  label: string;
  defaultValue: number;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-ink-200 p-3 dark:border-ink-700">
      <div className="text-xs font-bold">{label}</div>
      <div className="mt-2 flex items-center gap-1">
        <input
          name={name}
          type="number"
          min={0}
          defaultValue={defaultValue}
          className="input h-9 w-full"
        />
      </div>
      <div className="mt-1 text-[10px] text-ink-500">{unit}</div>
    </div>
  );
}

function CheckMission({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 p-3 transition hover:border-brand-300 dark:border-ink-700">
      <input type="checkbox" name={name} value="1" className="h-4 w-4" />
      <span className="text-xs font-bold">{label}</span>
    </label>
  );
}
