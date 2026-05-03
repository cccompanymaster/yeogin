import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export type SessionRole = "user" | "advertiser";
export type SessionData = { id: string; role: SessionRole; email: string; name: string };

const COOKIE_NAME = "yeogin_session";
const ADV_COOKIE = "yeogin_adv_session";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "yeogin-fallback-secret-please-change"
);

export async function createSession(data: SessionData) {
  return await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function setSessionCookie(data: SessionData) {
  const token = await createSession(data);
  const name = data.role === "advertiser" ? ADV_COOKIE : COOKIE_NAME;
  const jar = await cookies();
  jar.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(role: SessionRole) {
  const name = role === "advertiser" ? ADV_COOKIE : COOKIE_NAME;
  const jar = await cookies();
  jar.delete(name);
}

export async function getSession(role: SessionRole): Promise<SessionData | null> {
  const name = role === "advertiser" ? ADV_COOKIE : COOKIE_NAME;
  const jar = await cookies();
  const token = jar.get(name)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function getUserSession() {
  return getSession("user");
}
export async function getAdvertiserSession() {
  return getSession("advertiser");
}
