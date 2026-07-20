# 힉스필드 연결 Claude용 실행 프롬프트

> 아래 블록 전체를 힉스필드(Higgsfield)가 연결된 Claude 세션에 붙여넣어 실행.
> ⚠️ 붙여넣기 전에 **실장비 사진 3장을 그 세션에 먼저 업로드**할 것:
> `device-front.png`(정면), `device-angled.png`(사선), `handpiece-beam.png`(핸드피스).
> (이 레포 `output/mockup/assets/` 폴더에 있음)

---

```
너는 지금부터 의료기기 브랜드 "FINEWAVE"의 웹사이트 리뉴얼용 이미지를 힉스필드로 생성하는 작업을 한다.

## 브랜드 컨텍스트 (반드시 준수)
- 제품: 2.45GHz 마이크로웨이브 리프팅 의료기기. 블랙 타워형 본체 + 상단 터치스크린 + 양옆에 거치된 백색 핸드피스 2개
- 컬러 시스템: 배경 딥 네이비/블랙 · 마이크로웨이브 에너지 = 일렉트릭 블루(#3b8dff) · 냉각 = 시안/아이스 블루(#25d3e6) · 열 에너지 = 오렌지/앰버(#ff8a2b)
- 무드: "강한 에너지"가 아니라 "정밀하고 안정적인 에너지". 미니멀, 공학적 신뢰감, 프리미엄 의료기기
- 절대 금지: 퍼플/마젠타/핑크 톤, 백색 본체(본체는 반드시 블랙), 글자/로고 삽입, 사람/피부 시술 장면, 스파크/번개/연기 같은 과격한 효과

## 작업 방법
1. 내가 업로드한 실장비 사진 3장을 이미지 레퍼런스(img2img / start frame)로 사용한다. strength는 0.5~0.7에서 시작한다.
2. 아래 6종을 순서대로 생성한다. 각 항목당 2~4개 변형을 뽑고 가장 좋은 1개를 고른다.
3. 선별 기준(모두 충족해야 채택):
   - 장비 외형이 업로드 사진과 일치 (버튼/스크린/핸드피스 개수·위치 왜곡 시 폐기 — 의료기기 오인 방지)
   - 지정 컬러 시스템 준수 (퍼플 계열 유입 시 폐기)
   - 글자·로고·워터마크 없음
   - 배경이 어둡고 미니멀함
4. 각 결과물을 지정 파일명으로 저장해 나에게 전달한다.

## 공통 네거티브 프롬프트 (모든 생성에 적용)
low quality, cartoon, illustration style, cheap plastic, noisy, purple, magenta, pink,
white device body, deformed device, distorted handpiece, extra buttons, extra screens,
readable text, letters, logo, watermark, people, hands, doctor, patient, skin treatment scene,
blood, sparks, fire, smoke, explosion, aggressive energy, lightning bolts, sci-fi hologram,
cluttered background, bright background, overexposure, harsh reflections

## 생성 목록

### 1. hero-key.png — 히어로 키비주얼 (16:9) [레퍼런스: device-front.png]
Cinematic product photography of a sleek black tower-type medical aesthetic device with
a compact touchscreen monitor on top and two white handpieces docked on both sides,
standing in a completely dark navy-black studio. Thin electric-blue sine wave lines flow
horizontally through the darkness behind the device. A restrained cyan rim light traces
the left edge of the tower; a subtle warm orange glow emanates from one handpiece tip.
Dark glossy floor with a faint reflection. Volumetric soft light from above.
Premium medical technology brand mood: minimal, precise, trustworthy, luxurious.
Device positioned slightly left of center, clean negative space on the right side.
Photorealistic, 8K product render quality, 16:9.

### 2. hero-key-vertical.png — 모바일 히어로 (9:16) [레퍼런스: device-front.png]
1번과 동일 프롬프트, 마지막 줄만 교체:
Device centered in lower two-thirds of frame, clean negative space at the top for copy.
Photorealistic, 8K product render quality, 9:16 vertical.

### 3. finecool-macro.png — 핸드피스 매크로, Heat & Cool 대비 (16:9) [레퍼런스: handpiece-beam.png]
Extreme macro close-up of a white ergonomic medical handpiece tip in a dark navy studio.
The metallic treatment ring at the tip glows with two layered energies: a thin ice-cyan
cooling ring on the outer surface, and a soft controlled amber-orange thermal glow deep
inside the tip. Subtle heat-haze shimmer, no sparks. The contrast reads as
"cool surface, warm core". Elegant shallow depth of field, dark background,
premium medical device photography, photorealistic, 16:9.

### 4. skin-3d.png — 피부 단면 3D 렌더 (16:9) [레퍼런스 없음]
Clean 3D medical visualization of a skin cross-section in dark navy scientific style.
Three horizontal layers with subtle depth: epidermis (thin, protected by a glowing
ice-cyan shield line on top), dermis, and a deeper target layer. From a small white
handpiece above, a controlled cone of soft orange energy passes through the layers and
concentrates as a warm glow inside the target layer only. Thin electric-blue microwave
sine waves in the dark background. No text, no labels, no arrows. Minimal, precise,
medical-grade infographic aesthetic, soft studio lighting, photorealistic 3D render, 16:9.

### 5. frccs-3d.png — 접촉 제어 컨셉 (16:9) [레퍼런스: handpiece-beam.png, strength 0.4]
Two-panel style 3D medical concept in one frame, dark navy background. Left: a white
handpiece hovering above a smooth abstract dark surface, completely inactive, no glow.
Right: the same handpiece touching the surface, a precise thin ring of cyan light
activating only at the exact contact point. The idea: energy activates only on contact.
Minimal, controlled, safe, intelligent. No skin texture, abstract dark surface instead.
Photorealistic 3D render, soft lighting, 16:9.

### 6. wave-d-higgsfield.png — 웨이브 배경 텍스처 (1920x1080) [레퍼런스 없음]
Abstract dark navy background texture with thin flowing sine wave lines in electric blue,
a few lines subtly glowing cyan, very low contrast, elegant and calm, evenly distributed,
suitable as a website section background behind white text. No objects, no text,
seamless composition, minimal digital art, 16:9.

## (선택) 7. hero-film.mp4 — 히어로 시네마틱 영상 8~10초
힉스필드 video 모드 사용 가능 시: 1번 결과물(hero-key.png)을 start frame으로 넣고 아래로 생성.
A cinematic slow reveal of the black medical device from complete darkness: a soft
cyan-blue light sweeps across the body, thin waves of cyan energy flow through the white
handpiece cables, a subtle warm orange glow appears at one handpiece tip while an
ice-cyan cooling ring protects the surface. Slow dolly-in, subtle rotation, black
background, premium medical technology mood, seamless motion, 16:9, 24fps, 8-10 seconds.
(네거티브는 공통 네거티브 + fast camera movement, shaky camera)

## 완료 후
- 채택본 6장(+영상)을 파일명 그대로 정리해 다운로드 링크 또는 첨부로 전달
- 각 이미지가 위 선별 기준을 통과했는지 항목별로 짧게 보고
- 장비 왜곡으로 폐기한 컷 수도 알려줄 것
```
