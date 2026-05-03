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
  INSTA: "인스타",
  YOUTUBE: "유튜브",
  SHORTS: "숏폼",
  CLIP: "클립",
};

export const TYPE_LABEL: Record<string, string> = {
  VISIT: "방문형",
  DELIVERY: "배송형",
  PURCHASE: "구매형",
  REPORTER: "기자단",
};

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  SELECTED: "선정",
  REJECTED: "미선정",
  COMPLETED: "완료",
  CANCELED: "취소",
  APPROVED: "승인",
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
  "뷰티",
  "패션",
  "식품",
  "생활",
  "디지털",
  "여행",
  "육아",
];

export const REGIONS = [
  "서울 강남구",
  "서울 강북구",
  "서울 강서구",
  "서울 마포구",
  "서울 서초구",
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
];
