// OAuth 공급자 설정
// 키가 없으면 isConfigured=false → 버튼 비활성 + 안내

export type OAuthProvider = "naver" | "kakao";

export type ProviderConfig = {
  isConfigured: boolean;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
  scope?: string;
};

export function getProviderConfig(p: OAuthProvider): ProviderConfig {
  if (p === "naver") {
    const clientId = process.env.NAVER_CLIENT_ID || "";
    const clientSecret = process.env.NAVER_CLIENT_SECRET || "";
    return {
      isConfigured: !!(clientId && clientSecret),
      clientId,
      clientSecret,
      authUrl: "https://nid.naver.com/oauth2.0/authorize",
      tokenUrl: "https://nid.naver.com/oauth2.0/token",
      profileUrl: "https://openapi.naver.com/v1/nid/me",
    };
  }
  // kakao
  const clientId = process.env.KAKAO_CLIENT_ID || "";
  const clientSecret = process.env.KAKAO_CLIENT_SECRET || "";
  return {
    isConfigured: !!clientId,
    clientId,
    clientSecret,
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    profileUrl: "https://kapi.kakao.com/v2/user/me",
    scope: "profile_nickname account_email",
  };
}

export function getRedirectUri(req: Request, provider: OAuthProvider) {
  const base =
    process.env.OAUTH_REDIRECT_BASE ||
    new URL(req.url).origin;
  return `${base.replace(/\/$/, "")}/api/auth/oauth/${provider}/callback`;
}

export function isOAuthEnabled() {
  return {
    naver: getProviderConfig("naver").isConfigured,
    kakao: getProviderConfig("kakao").isConfigured,
  };
}
