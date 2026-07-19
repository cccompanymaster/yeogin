# FINEWAVE(finewave.kr) 홈페이지 수정 — 산출물 세트

작업지시서(2026-07-17) T1~T9 산출물. **사이트 무접촉**으로 제작 → GitHub 검토용 → 시안 컨펌 후 운영자가 워드프레스에 수동 반영.

> ⚠️ **제작 환경 제약 안내**: 이 산출물을 만든 실행 환경의 아웃바운드 정책이 `finewave.kr` 접속을 차단합니다(프록시 403 policy-denial, 헤드리스 크롬 포함 동일). 따라서 라이브 사이트의 **실측값을 지어내지 않았고**, 대신 모든 스니펫을 **CSS 변수·플레이스홀더** 기반으로 만들어 운영자가 `site-audit.md`의 실측값만 대입하면 되도록 설계했습니다.

## 구성

```
output/
├── README.md                      # (본 문서)
├── site-audit.md                  # T1: 감사 템플릿(운영자 F12로 8개 항목 측정·기입)
├── wave-patterns/                 # T2: 웨이브 시안 3종 (SVG+1920×1080 PNG) + README
├── beam-blink/                    # T3: 빔 프레임(off/on) + beam-blink.css + preview.html
├── snippets/
│   ├── frccs-anchor-fix.css       # T4: FRCCS 앵커 잘림 픽스 (해법 A/B)
│   ├── floating-buttons.html      # T5: 문의사항+TOP (인라인 단일 파일)
│   ├── hero-bg-motion.css         # T6: 히어로 배경 모션 (케이스 A/B)
│   ├── no-contact-overlay.css     # T7: NO CONTACT 어둡게 (강도 3단계)
│   ├── fade-in-fallback.css       # T8: 페이드인 보조
│   └── demo.html                  # (보너스) 스니펫 통합 미리보기 — 로컬 브라우저 확인용
└── apply-guide.md                 # T9: 운영자 Elementor 적용 매뉴얼
```

재생성 스크립트(선택): `scripts/gen_waves.py`(T2), `scripts/gen_beam.py`(T3).

## 미리보기 (로컬 브라우저)

- `beam-blink/preview.html` — 빔 깜빡임 시안(클라이언트 발송용)
- `snippets/demo.html` — 플로팅 버튼·페이드인·NO CONTACT·웨이브 배경 통합 데모

## 설계 원칙 (작업지시서 §0-1 준수)

1. 라이브 사이트 무접촉(GET조차 정책 차단됨 → 접속 시도 없음).
2. 크리덴셜 미기재.
3. 외부 JS 라이브러리 0 — 순수 CSS/JS. 커스텀 클래스 전부 `fw-` 접두사.
4. 애니메이션은 `transform`/`opacity`만(GPU 합성), 전 모션 `prefers-reduced-motion` 대응.
5. 이미지 산출물 웹 최적화(개당 500KB 이하, PNG).

## 다음 단계

1. `site-audit.md`의 8개 항목을 1920×1080 Chrome에서 측정·기입.
2. 각 스니펫 상단 변수/셀렉터/URL에 실측값 대입.
3. `apply-guide.md` 순서대로 백업 후 반영, 시안(T2·T3)은 컨펌 후 반영.
