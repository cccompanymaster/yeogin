# FINEWAVE 히어로 시네마틱 영상 제작 브리프

> 레퍼런스(sherean.co.kr) 오프닝 영상 학습 내용을 **FINEWAVE 브랜드에 맞게 번안**한 생성 프롬프트.
> 원본 프롬프트는 쉬리안 기준(백색 장비 · 마젠타/퍼플 · "자신있게, 쉬리안")이므로 그대로 쓰면 안 되고,
> 아래처럼 **블랙 타워 장비 · 시안(청록) 에너지 · "Go Fine. Get Defined."** 로 치환해 사용한다.
>
> 핵심 무드(레퍼런스와 동일): **"강한 에너지"가 아니라 "정밀하고 안정적인 에너지".**
> 완성된 영상은 `output/mockup/index.html` 히어로의 `<video class="fw-hero__film">` 슬롯에 삽입
> (주석으로 위치 표시돼 있음). 영상이 들어가면 CSS 시네마틱 리빌(베일/스윕/펄스)은 제거.

---

## 사양

| 항목 | 값 |
|---|---|
| 색상 | 블랙 `#050505` · 딥 네이비 · **시안 포인트 `#25d3E6`** (빔 연출 시 오렌지 `#ff8a2b` 소량 허용) |
| 길이 | 8~10초, 심리스 루프 권장 |
| 비율 | PC 16:9 (4K, 24fps) · **모바일 세로 9:16 별도 버전** |
| 카메라 | 느린 돌리인 + 제품 중심 부드러운 회전, 흔들림 없음 |
| 에너지 표현 | 번개가 아닌 **얇은 빛의 흐름** + 은은한 열감(heat-wave) |
| 문구·로고 | 생성 단계에는 넣지 않음 → 후반 편집 삽입 |
| 마지막 프레임 | 제품 좌측 배치, **우측에 카피용 네거티브 스페이스** ("Go Fine. Get Defined." 자리) |

---

## 메인 생성 프롬프트 (EN)

```
Create a premium cinematic 3D product film for a professional aesthetic medical device.

A futuristic BLACK tower-type microwave lifting machine slowly emerges from a completely
dark black studio. The device has a sleek matte-black rounded tower body, a compact
touchscreen monitor on top, two elegant WHITE handpieces docked on both sides with
flexible white cables, and subtle glossy medical-grade surfaces.

The camera begins with an extreme close-up of the machine's dark silhouette. A soft
CYAN-BLUE light gradually sweeps across the device, revealing its contours and refined
details. Thin waves of cyan energy flow through the white handpiece cables and gently
illuminate the treatment tips. The energy should feel precise, controlled, safe, and
technologically advanced.

Slow cinematic camera movement, smooth dolly-in, subtle rotation around the device,
macro close-ups of the handpiece tips, realistic reflections on a dark glossy floor,
soft volumetric light, elegant shadows, black background, premium medical beauty
technology mood.

The final shot reveals the complete device positioned slightly left of center,
surrounded by a restrained cyan glow. Leave clean negative space on the RIGHT side
for adding a brand slogan later.

Minimal, sophisticated, high-end, futuristic, clinical, calm, trustworthy, luxurious.
No people, no skin treatment scene, no exaggerated sci-fi effects, no sparks, no smoke,
no clutter, no extra objects, no readable text, no random logo, no watermark.

16:9 widescreen, 8-10 seconds, 4K, 24fps, seamless cinematic motion,
photorealistic 3D product rendering.
```

## 장면 구성 프롬프트 (EN)

```
Shot 1, 0-2 seconds:
Extreme close-up of a mysterious black medical device silhouette in complete darkness.
Only a thin cyan rim light outlines the monitor edge and the white handpieces.

Shot 2, 2-4 seconds:
A soft cyan-blue light beam slowly travels across the matte black tower body,
revealing the glossy surface and rounded premium design.

Shot 3, 4-6 seconds:
Macro close-up of a white handpiece tip. Controlled cyan energy pulses gently through
the tip with subtle heat-wave visualization. The effect is precise and elegant,
not aggressive. (Optional: a faint warm orange glow inside the tip, referencing the
FINECOOL beam.)

Shot 4, 6-8 seconds:
The camera smoothly pulls back and rotates slightly, revealing the full tower and both
docked handpieces. Cyan light flows around the product like a calm energy field,
echoing thin sine-wave lines in the background.

Shot 5, 8-10 seconds:
Hero product shot. The complete device stands slightly left of frame against a black
background with a refined cyan glow and a subtle dark floor reflection.
Leave empty space on the right for the text "Go Fine. Get Defined."
```

## 네거티브 프롬프트 (EN)

```
low quality, cartoon style, cheap plastic, noisy image, excessive neon, purple, magenta,
excessive smoke, sparks, fire, explosions, aggressive energy, distorted medical device,
deformed handpiece, extra buttons, extra screens, white device body, unreadable text,
random letters, random logo, watermark, people, doctor, patient, skin, blood,
laboratory background, cluttered composition, fast camera movement, shaky camera,
overexposure, harsh reflections
```

> ⚠️ 네거티브에 `purple, magenta, white device body` 추가 — 레퍼런스 원본 프롬프트의 쉬리안
> 요소(백색 바디·퍼플 톤)가 생성물에 섞여 나오는 것을 방지. 장비 외형은 실제 FINEWAVE 캡처
> (`assets/device-front.png`, `assets/device-angled.png`)를 이미지 컨디셔닝 입력으로 넣으면 정확도가 크게 올라간다.

---

## 웹 삽입 가이드 (운영자)

1. 완성 영상을 웹 최적화: H.264 MP4 1920×1080 (≤6MB 권장) + 모바일 9:16 버전
2. `index.html` 히어로 주석 위치에 삽입:
   ```html
   <video class="fw-hero__film" autoplay muted loop playsinline
          poster="assets/device-front.png">
     <source src="assets/hero-film.mp4" media="(min-width: 768px)">
     <source src="assets/hero-film-vertical.mp4">
   </video>
   ```
3. `autoplay`는 반드시 `muted playsinline`과 함께(모바일 자동재생 조건)
4. 영상 삽입 시 CSS 시네마틱 리빌 요소(`.fw-hero__veil` `.fw-sweep` `.fw-pulse`) 제거
5. `prefers-reduced-motion: reduce` 사용자는 poster 정지 이미지로 대체:
   ```css
   @media (prefers-reduced-motion: reduce){ .fw-hero__film{ display:none } }
   ```
6. 실사이트(Elementor) 반영 시: 히어로 섹션 배경 → 동영상 배경 기능 사용, 위 4·5항 동일 적용

## 현재 시안의 CSS 대체 구현

영상이 나오기 전까지 `index.html`은 같은 무드를 CSS/JS로 재현한다:
- **0~1.3s 암전 베일** → 서서히 걷힘 (`fw-veil`)
- **장비 실루엣 리빌**: brightness 0.05 → 1.0, 3.2s (`fw-devreveal`)
- **1.5s 라이트 스윕**: 사선 하이라이트 밴드가 장비를 훑음 (`fw-sweep`)
- **에너지 펄스**: 얇은 시안 빛 입자 3개가 장비 주변 곡선 경로를 흐름 (`fw-pulse`, offset-path)
- **2.3s~ 텍스트 순차 등장**: 로고 → 태그라인 → 카피 → CTA → SCROLL
- reduced-motion 시 전부 생략하고 완성 프레임 즉시 표시
