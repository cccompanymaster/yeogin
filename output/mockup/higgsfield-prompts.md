# FINEWAVE 이미지 생성 프롬프트 팩 (Higgsfield용)

> 힉스필드(higgsfield.ai)에서 시안용 이미지를 생성하기 위한 프롬프트 세트.
> 이 작업 환경에서는 힉스필드 접속이 차단되어 **운영자가 직접 실행**한다.
>
> **공통 원칙**
> - 컬러 시스템: 딥 네이비/블랙 배경 · Blue Energy `#3b8dff` · Orange Heat `#ff8a2b` · Cyan Cooling `#25d3e6`
> - 무드: "강한 에너지"가 아닌 **정밀·안정·공학적 신뢰감**
> - **장비 외형 정확도**: 반드시 실장비 사진(`assets/device-front.png`, `assets/device-angled.png`,
>   `assets/handpiece-beam.png`)을 **이미지 레퍼런스(img2img/start frame)**로 첨부하고 강도(strength) 0.5~0.7로 시작
> - 텍스트/로고는 생성 단계에 넣지 않음(후반 합성)
> - 생성 후 웹 최적화(PNG/WebP, 500KB 이하) → 아래 "저장 위치"에 배치

## 공통 네거티브 프롬프트 (전체 공용)

```
low quality, cartoon, illustration style, cheap plastic, noisy, purple, magenta, pink,
white device body, deformed device, distorted handpiece, extra buttons, extra screens,
readable text, letters, logo, watermark, people, hands, doctor, patient, skin treatment scene,
blood, sparks, fire, smoke, explosion, aggressive energy, lightning bolts, sci-fi hologram,
cluttered background, bright background, overexposure, harsh reflections
```

---

## 1) 히어로 키비주얼 (PC 16:9) → `assets/hero-key.png`

```
Cinematic product photography of a sleek black tower-type medical aesthetic device with
a compact touchscreen monitor on top and two white handpieces docked on both sides,
standing in a completely dark navy-black studio. Thin electric-blue sine wave lines flow
horizontally through the darkness behind the device. A restrained cyan rim light traces
the left edge of the tower; a subtle warm orange glow emanates from one handpiece tip.
Dark glossy floor with a faint reflection. Volumetric soft light from above.
Premium medical technology brand mood: minimal, precise, trustworthy, luxurious.
Device positioned slightly left of center, clean negative space on the right side.
Photorealistic, 8K product render quality, 16:9.
```

- 이미지 레퍼런스: `device-front.png` (strength 0.6)
- 용도: 히어로 배경/키비주얼 (우측 여백에 "Go Fine. Get Defined." 카피 후반 합성)

## 2) 모바일 히어로 (9:16) → `assets/hero-key-vertical.png`

프롬프트 1)과 동일하되 마지막 줄만 교체:

```
Device centered in lower two-thirds of frame, clean negative space at the top for copy.
Photorealistic, 8K product render quality, 9:16 vertical.
```

## 3) 핸드피스 매크로 — Heat & Cool 대비 (FINECOOL) → `assets/finecool-macro.png`

```
Extreme macro close-up of a white ergonomic medical handpiece tip in a dark navy studio.
The metallic treatment ring at the tip glows with two layered energies: a thin ice-cyan
cooling ring on the outer surface, and a soft controlled amber-orange thermal glow deep
inside the tip. Subtle heat-haze shimmer, no sparks. The contrast reads as
"cool surface, warm core". Elegant shallow depth of field, dark background,
premium medical device photography, photorealistic, 16:9.
```

- 이미지 레퍼런스: `handpiece-beam.png` (strength 0.65)
- 용도: FINECOOL™ 섹션 비주얼 교체(현 캡처 크롭 대체), 빔 깜빡임 T3 프레임 재생성 원본

## 4) 피부 단면 3D 렌더 (2.45GHz) → `assets/skin-3d.png`

```
Clean 3D medical visualization of a skin cross-section in dark navy scientific style.
Three horizontal layers with subtle depth: epidermis (thin, protected by a glowing
ice-cyan shield line on top), dermis, and a deeper target layer. From a small white
handpiece above, a controlled cone of soft orange energy passes through the layers and
concentrates as a warm glow inside the target layer only. Thin electric-blue microwave
sine waves in the dark background. No text, no labels, no arrows. Minimal, precise,
medical-grade infographic aesthetic, soft studio lighting, photorealistic 3D render, 16:9.
```

- 용도: 2.45GHz 섹션의 SVG 다이어그램을 실사급 3D로 교체 (레이어 라벨은 HTML 텍스트로 오버레이)
- ⚠️ 시술 효과 암시 아님 — 개념 시각화. 문구·표현은 인허가 검수 대상

## 5) FRCCS 컨셉 — 접촉 제어 (선택) → `assets/frccs-3d.png`

```
Two-panel style 3D medical concept in one frame, dark navy background. Left: a white
handpiece hovering above a smooth abstract surface, completely inactive, no glow.
Right: the same handpiece touching the surface, a precise thin ring of cyan light
activating only at the exact contact point. The idea: energy activates only on contact.
Minimal, controlled, safe, intelligent. No skin texture, abstract dark surface instead.
Photorealistic 3D render, soft lighting, 16:9.
```

- 용도: FRCCS 섹션 NO CONTACT/CONTACT 실카드 업그레이드용 (피부 일러스트 없이 추상 표면 → 심의 부담↓)

## 6) 웨이브 배경 텍스처 (T2 대체 후보) → `wave-patterns/wave-d-higgsfield.png`

```
Abstract dark navy background texture with thin flowing sine wave lines in electric blue,
a few lines subtly glowing cyan, very low contrast, elegant and calm, evenly distributed,
suitable as a website section background behind white text. No objects, no text,
seamless composition, 1920x1080, minimal digital art.
```

- 용도: 2.45GHz 페이지 배경 웨이브 교체 4안 (기존 SVG 3종과 함께 클라이언트 택1)

## 7) 히어로 시네마틱 영상 (모션)

영상 생성은 `video-brief.md`의 메인/장면/네거티브 프롬프트를 그대로 사용 (힉스필드 video 모드 공용).
시작 프레임(start frame)으로 위 1) 히어로 키비주얼 결과물을 넣으면 일관성이 높아진다.

---

## 생성 → 적용 절차 (운영자)

1. 힉스필드에서 각 프롬프트 실행 (이미지 레퍼런스 첨부 필수 항목 확인)
2. 결과물 중 장비 외형이 실제와 다른 컷은 폐기 — **장비 왜곡은 절대 사용 금지** (의료기기 오인 방지)
3. 선택본을 지정 파일명으로 `output/mockup/assets/`에 저장 → `index.html`의 해당 `src` 교체
4. 웹 최적화: 1920px 이하, 500KB 이하 (PNG 또는 WebP)
5. 클라이언트 시안 컨펌 후 실사이트 반영은 apply-guide.md 절차대로
