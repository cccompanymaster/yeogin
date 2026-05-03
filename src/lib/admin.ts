// 관리자 이메일 화이트리스트 (데모용)
// 실제로는 별도 admin 테이블이나 role 컬럼으로 관리해야 함
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@yeogin.kr,demo@yeogin.kr")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
