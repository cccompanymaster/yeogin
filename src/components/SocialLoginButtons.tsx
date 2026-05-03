type Props = {
  enabled: { naver: boolean; kakao: boolean };
};

export function SocialLoginButtons({ enabled }: Props) {
  return (
    <div className="space-y-2">
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-200" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-semibold text-ink-500">
          간편하게 시작하기
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SocialButton
          provider="kakao"
          enabled={enabled.kakao}
          label="카카오"
          bg="#FEE500"
          color="#191919"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5C4.86 1.5 1.5 4.13 1.5 7.38c0 2.1 1.41 3.94 3.53 5l-.9 3.3c-.08.27.22.49.46.34l3.96-2.6c.15.01.3.02.45.02 4.14 0 7.5-2.63 7.5-5.88S13.14 1.5 9 1.5Z"
                fill="currentColor"
              />
            </svg>
          }
        />
        <SocialButton
          provider="naver"
          enabled={enabled.naver}
          label="네이버"
          bg="#03C75A"
          color="#ffffff"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11.04 9.52 6.78 3.5H3v11h3.96V8.46l4.26 6.04H15v-11h-3.96v6.02Z"
                fill="currentColor"
              />
            </svg>
          }
        />
      </div>
      {(!enabled.naver || !enabled.kakao) && (
        <p className="mt-2 text-center text-[10px] text-ink-400">
          소셜 로그인 키 미설정 시 버튼이 비활성화됩니다 (DEPLOY.md 참고)
        </p>
      )}
    </div>
  );
}

function SocialButton({
  provider,
  enabled,
  label,
  bg,
  color,
  icon,
}: {
  provider: "naver" | "kakao";
  enabled: boolean;
  label: string;
  bg: string;
  color: string;
  icon: React.ReactNode;
}) {
  const className =
    "flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90";

  if (!enabled) {
    return (
      <button
        disabled
        className={className}
        style={{ background: bg, color }}
        title="키가 설정되지 않았습니다"
      >
        {icon}
        <span>{label} (준비 중)</span>
      </button>
    );
  }
  return (
    <a
      href={`/api/auth/oauth/${provider}/start`}
      className={className}
      style={{ background: bg, color }}
    >
      {icon}
      <span>{label}로 시작</span>
    </a>
  );
}
