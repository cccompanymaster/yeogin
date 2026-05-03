import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import {
  getProviderConfig,
  getRedirectUri,
  type OAuthProvider,
} from "@/lib/oauth";

const VALID: Set<OAuthProvider> = new Set(["naver", "kakao"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: raw } = await params;
  const provider = raw as OAuthProvider;
  if (!VALID.has(provider)) {
    return NextResponse.redirect(new URL("/login?error=잘못된+공급자", req.url));
  }

  const cfg = getProviderConfig(provider);
  if (!cfg.isConfigured) {
    const url = new URL("/login", req.url);
    url.searchParams.set(
      "error",
      `${provider === "naver" ? "네이버" : "카카오"} 로그인이 아직 설정되지 않았습니다. 관리자에게 문의해주세요.`
    );
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params2 = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: getRedirectUri(req, provider),
    state,
  });
  if (cfg.scope) params2.set("scope", cfg.scope);

  return NextResponse.redirect(`${cfg.authUrl}?${params2.toString()}`);
}
