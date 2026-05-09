"use client";

import { useState } from "react";

type Template = {
  key: string;
  emoji: string;
  name: string;
  desc: string;
  fields: {
    type: string;
    channel: string;
    category: string;
    capacity: number;
    offer: string;
    offerValue: number;
    description: string;
    guide: string;
    keywords: string;
    tags: string;
    missionPhotos: number;
    missionWords: number;
    missionMap: boolean;
    missionVideo: boolean;
    visitDays: string;
    visitTime: string;
    storeRequest: string;
  };
};

const TEMPLATES: Template[] = [
  {
    key: "restaurant-blog",
    emoji: "🍝",
    name: "맛집 블로그 방문형",
    desc: "방문 코스/플레이팅 사진과 함께 블로그 후기",
    fields: {
      type: "VISIT",
      channel: "BLOG",
      category: "맛집",
      capacity: 5,
      offer: "2인 코스 요리 (10만원 상당)",
      offerValue: 100000,
      description:
        "저희 매장의 시그니처 메뉴를 정성껏 준비해드립니다. 분위기·맛·서비스 모두 만족스러운 후기를 남겨주실 분을 모집합니다.",
      guide:
        "체험 후 솔직한 후기를 작성해주세요. 매장 외관/내부/메뉴 사진을 골고루 담아주시면 좋아요.",
      keywords: "강남맛집, 데이트코스, 분위기맛집",
      tags: "강남, 데이트, 분위기맛집, 신상",
      missionPhotos: 15,
      missionWords: 1000,
      missionMap: true,
      missionVideo: false,
      visitDays: "월,화,수,목,금,토",
      visitTime: "12:00~21:00",
      storeRequest:
        "✅ 실제 하객 느낌으로 자연스럽게 촬영해주세요\n✅ 단체샷보다 메뉴별 클로즈업 추천\n✅ 마지막 단락에 매장 위치/예약 안내 포함",
    },
  },
  {
    key: "cafe-insta",
    emoji: "☕",
    name: "카페 인스타 릴스",
    desc: "감성 사진과 함께 인스타 피드+릴스",
    fields: {
      type: "VISIT",
      channel: "INSTA",
      category: "카페",
      capacity: 7,
      offer: "음료 2잔 + 디저트 2개",
      offerValue: 35000,
      description:
        "포토존 가득한 감성 카페에 모십니다. 사진 잘 찍는 분 환영해요.",
      guide: "피드 3장 + 릴스 1개. 매장 분위기와 메뉴를 담아주세요.",
      keywords: "감성카페, 디저트맛집, 데일리",
      tags: "카페, 감성, 디저트, 포토존",
      missionPhotos: 5,
      missionWords: 200,
      missionMap: false,
      missionVideo: true,
      visitDays: "수,목,금,토,일",
      visitTime: "11:00~20:00",
      storeRequest:
        "✅ 매장 자연광 활용, 실내 노이즈 적은 시간대 추천\n✅ 릴스 BGM은 카페에 어울리는 것으로",
    },
  },
  {
    key: "beauty-delivery",
    emoji: "💄",
    name: "뷰티 배송형",
    desc: "제품 배송 후 사용감 비포/애프터 인스타",
    fields: {
      type: "DELIVERY",
      channel: "INSTA",
      category: "뷰티",
      capacity: 15,
      offer: "스킨케어 풀세트 (89,000원 상당)",
      offerValue: 89000,
      description: "민감성 피부도 안심하고 사용할 수 있는 비건 인증 스킨케어.",
      guide: "사용 전후 비교 사진과 텍스처 사진을 포함해주세요.",
      keywords: "비건화장품, 민감성스킨케어, 비건뷰티",
      tags: "뷰티, 비건, 민감성, 스킨케어",
      missionPhotos: 6,
      missionWords: 400,
      missionMap: false,
      missionVideo: false,
      visitDays: "",
      visitTime: "",
      storeRequest:
        "✅ 1주일 이상 사용 후 후기\n✅ 텍스처 클로즈업 1장 필수",
    },
  },
  {
    key: "reporter-blog",
    emoji: "📰",
    name: "기자단 블로그",
    desc: "정보 정리 위주, 방문 없이 자료 기반 작성",
    fields: {
      type: "REPORTER",
      channel: "BLOG",
      category: "디지털",
      capacity: 20,
      offer: "원고료 30,000원 + 자료 제공",
      offerValue: 30000,
      description: "신제품 정보를 정리해 작성해주실 분을 모집합니다.",
      guide: "보도자료 기반 1500자 이상 작성. 사진은 자료에서 활용하세요.",
      keywords: "신제품, IT, 가성비",
      tags: "기자단, 정보, 신제품",
      missionPhotos: 0,
      missionWords: 1500,
      missionMap: false,
      missionVideo: false,
      visitDays: "",
      visitTime: "",
      storeRequest: "✅ 출처 표기 필수\n✅ 광고 게시물 표기 명확히",
    },
  },
];

export function CampaignTemplatePicker() {
  const [picked, setPicked] = useState<string | null>(null);

  const apply = (t: Template) => {
    const form = document.querySelector("form[action*='campaigns']") as HTMLFormElement | null;
    if (!form) return;
    const setField = (name: string, value: string | boolean | number) => {
      const el = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null;
      if (!el) return;
      if ((el as HTMLInputElement).type === "checkbox") {
        (el as HTMLInputElement).checked = !!value;
      } else {
        el.value = String(value);
      }
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    Object.entries(t.fields).forEach(([k, v]) => setField(k, v));
    setPicked(t.key);
  };

  return (
    <div className="card border-brand-200 bg-brand-50 p-4 dark:border-brand-700 dark:bg-brand-900/20">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-bold">⚡ 템플릿으로 빠르게 시작</h2>
        <span className="text-[11px] text-ink-500 dark:text-ink-400">
          클릭 한 번에 30+ 항목 자동 채움
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => apply(t)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
              picked === t.key
                ? "border-brand-500 bg-white shadow-sm dark:bg-ink-900"
                : "border-transparent bg-white/60 hover:bg-white dark:bg-ink-800/60 dark:hover:bg-ink-800"
            }`}
          >
            <div className="text-2xl">{t.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{t.name}</div>
              <div className="line-clamp-1 text-[11px] text-ink-500 dark:text-ink-400">
                {t.desc}
              </div>
            </div>
            {picked === t.key && (
              <span className="text-xs font-bold text-brand-600">적용됨</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
