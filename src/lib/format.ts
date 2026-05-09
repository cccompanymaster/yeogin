export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export const dday = (target: Date | string) => {
  const t = typeof target === "string" ? new Date(target) : target;
  const ms = t.getTime() - Date.now();
  const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (d < 0) return "마감";
  if (d === 0) return "D-DAY";
  return `D-${d}`;
};

export const fmtDate = (d: Date | string) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(
    dt.getDate()
  ).padStart(2, "0")}`;
};

export const CHANNEL_LABEL: Record<string, string> = {
  BLOG: "블로그",
  BLOG_CLIP: "블로그+클립",
  INSTA: "인스타그램",
  YOUTUBE: "유튜브",
  REELS: "릴스",
  TIKTOK: "틱톡",
  SHORTS: "쇼츠",
  CLIP: "클립",
};

export const TYPE_LABEL: Record<string, string> = {
  VISIT: "방문형",
  DELIVERY: "배송형",
  PURCHASE: "구매형",
  REPORTER: "기자단",
  PLATFORM_REPORTER: "플랫폼 기자단",
  PAYBACK: "페이백",
  SAME_DAY: "당일지급",
  PACKAGE: "포장",
};

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  SELECTED: "선정",
  REJECTED: "미선정",
  COMPLETED: "완료",
  CANCELED: "취소",
  APPROVED: "승인",
};

export const REVIEW_STATUS_LABEL: Record<string, string> = {
  PENDING: "검수대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

export const TRUST_LABEL: Record<string, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  DIAMOND: "Diamond",
};

export const CATEGORIES = [
  "맛집",
  "카페",
  "식품",
  "뷰티",
  "패션",
  "생활",
  "여행",
  "디지털",
  "반려동물",
  "육아",
  "기타",
];

// 빠른 선택 (재택/기자단/당일지급 + 17개 광역)
export const REGION_QUICK = [
  { key: "재택", label: "재택" },
  { key: "기자단", label: "기자단" },
  { key: "당일지급", label: "당일지급" },
  { key: "서울", label: "서울" },
  { key: "경기", label: "경기" },
  { key: "인천", label: "인천" },
  { key: "강원", label: "강원" },
  { key: "대전", label: "대전" },
  { key: "세종", label: "세종" },
  { key: "충남", label: "충남" },
  { key: "충북", label: "충북" },
  { key: "부산", label: "부산" },
  { key: "울산", label: "울산" },
  { key: "경남", label: "경남" },
  { key: "경북", label: "경북" },
  { key: "대구", label: "대구" },
  { key: "광주", label: "광주" },
  { key: "전남", label: "전남" },
  { key: "전북", label: "전북" },
  { key: "제주", label: "제주" },
] as const;

// 광고주 캠페인 등록용 상세 지역
export const REGIONS = [
  "서울 강남구",
  "서울 강북구",
  "서울 강서구",
  "서울 마포구",
  "서울 서초구",
  "서울 성북구",
  "서울 송파구",
  "서울 영등포구",
  "서울 용산구",
  "서울 종로구",
  "경기 성남시",
  "경기 수원시",
  "경기 고양시",
  "경기 용인시",
  "인천 연수구",
  "부산 해운대구",
  "강원 강릉시",
  "제주 제주시",
];

export const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "ending", label: "마감임박순" },
  { value: "popular", label: "인기순" },
  { value: "point", label: "포인트순" },
];
