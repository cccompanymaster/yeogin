import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import {
  getProviderConfig,
  getRedirectUri,
  type OAuthProvider,
} from "@/lib/oauth";

const VALID: Set<OAuthProvider> = new Set(["naver", "kakao"]);

type Profile = { email: string; nickname: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: raw } = await params;
  const provider = raw as OAuthProvider;
  if (!VALID.has(provider)) {
    return NextResponse.redirect(new URL("/login?error=잘못된+공급자", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get(`oauth_state_${provider}`)?.value;
  jar.delete(`oauth_state_${provider}`);

  if (!code || !state || state !== expected) {
    const u = new URL("/login", req.url);
    u.searchParams.set("error", "OAuth 검증에 실패했습니다.");
    return NextResponse.redirect(u);
  }

  const cfg = getProviderConfig(provider);
  if (!cfg.isConfigured) {
    return NextResponse.redirect(new URL("/login?error=설정+누락", req.url));
  }

  // 1) 토큰 교환
  let tokenJson: { access_token?: string; error?: string };
  try {
    const tokenForm = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      state,
      redirect_uri: getRedirectUri(req, provider),
    });
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenForm.toString(),
    });
    tokenJson = await tokenRes.json();
  } catch {
    return redirectErr(req, "토큰 교환 실패");
  }
  if (!tokenJson.access_token) return redirectErr(req, "토큰을 받지 못했습니다.");

  // 2) 프로필 조회
  let profile: Profile | null = null;
  try {
    const r = await fetch(cfg.profileUrl, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const data = await r.json();
    profile = parseProfile(provider, data);
  } catch {
    return redirectErr(req, "프로필 조회 실패");
  }
  if (!profile?.email)
    return redirectErr(
      req,
      "이메일을 가져올 수 없습니다. 동의 항목에서 이메일을 허용해주세요."
    );

  // 3) upsert + 세션
  const email = profile.email.toLowerCase();
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    const randomPw = randomBytes(20).toString("hex");
    user = await db.user.create({
      data: {
        email,
        nickname: profile.nickname || email.split("@")[0],
        passwordHash: await bcrypt.hash(randomPw, 10),
      },
    });
  }

  await setSessionCookie({
    id: user.id,
    role: "user",
    email: user.email,
    name: user.nickname,
  });

  return NextResponse.redirect(new URL("/", req.url));
}

function redirectErr(req: NextRequest, msg: string) {
  const u = new URL("/login", req.url);
  u.searchParams.set("error", msg);
  return NextResponse.redirect(u);
}

function parseProfile(provider: OAuthProvider, raw: unknown): Profile | null {
  const r = raw as Record<string, unknown>;
  if (provider === "naver") {
    const resp = r.response as Record<string, string> | undefined;
    if (!resp) return null;
    return {
      email: resp.email,
      nickname: resp.nickname || resp.name || "",
    };
  }
  // kakao
  const account = r.kakao_account as Record<string, unknown> | undefined;
  const profile = account?.profile as Record<string, string> | undefined;
  return {
    email: (account?.email as string) || "",
    nickname: profile?.nickname || "",
  };
}
