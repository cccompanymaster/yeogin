#!/usr/bin/env python3
"""
클라이언트 PPTX 캡처(실사이트 화면)에서 시안용 자산 추출.
- 출처: 클라이언트 제공 요청사항 PPTX 내 finewave.kr 캡처 5장
- 산출: output/mockup/assets/*.png (웹 최적화), output/beam-blink/beam-off|on.png (실이미지 기반)
"""
import os
from PIL import Image, ImageFilter, ImageEnhance, ImageChops

SRC = "/tmp/claude-0/-home-user-yeogin/40fed48e-72ae-5bf7-819c-a16a5dd01021/scratchpad/pptx_unpack/ppt/media"
ASSETS = os.path.join(os.path.dirname(__file__), "..", "output", "mockup", "assets")
BEAM = os.path.join(os.path.dirname(__file__), "..", "output", "beam-blink")
os.makedirs(ASSETS, exist_ok=True)
os.makedirs(BEAM, exist_ok=True)


def save_opt(img, path, max_w=1400):
    if img.width > max_w:
        img = img.resize((max_w, int(img.height * max_w / img.width)), Image.LANCZOS)
    img.save(path, optimize=True)
    print(f"  ✓ {os.path.relpath(path)}  {img.size}  {os.path.getsize(path)//1024} KB")
    return img


# ── 1) 히어로 장비 (image1: 정면 타워 + 핸드피스 거치) ──────────────
im1 = Image.open(f"{SRC}/image1.png").convert("RGB")
hero_device = im1.crop((730, 255, 1245, 765))         # 장비만 (베이크드 텍스트 제외)
save_opt(hero_device, f"{ASSETS}/device-front.png", 900)

# ── 2) 2.45GHz 장비 (image2: 사선 각도 전신) ───────────────────────
im2 = Image.open(f"{SRC}/image2.png").convert("RGB")
device_angled = im2.crop((880, 120, 1420, 870))
save_opt(device_angled, f"{ASSETS}/device-angled.png", 800)

# ── 3) 빔 핸드피스 (image3: FINECOOL 오렌지 빔) → T3 실프레임 ───────
im3 = Image.open(f"{SRC}/image3.png").convert("RGB")
beam_crop = im3.crop((40, 110, 872, 768))             # 핸드피스+빔 전체 (우측 텍스트 제외)
save_opt(beam_crop, f"{ASSETS}/handpiece-beam.png", 900)

# T3: 캡처는 빔이 '켜진' 상태 → OFF = 웜톤 감쇠, ON = 원본+글로우 강화
import numpy as np
arr = np.asarray(beam_crop).astype(np.int16)
R, G, B = arr[..., 0], arr[..., 1], arr[..., 2]
warm = (R > 110) & (R - B > 25)                        # 오렌지 빔 영역
mask = Image.fromarray((warm * 255).astype("uint8"), "L").filter(ImageFilter.GaussianBlur(6))

# OFF 프레임: 빔 영역만 어둡고 채도 낮게
dim = ImageEnhance.Color(beam_crop).enhance(0.35)
dim = ImageEnhance.Brightness(dim).enhance(0.55)
off = Image.composite(dim, beam_crop, mask)

# ON 프레임: 빔 영역 밝기·채도·글로우 강화
boost = ImageEnhance.Color(beam_crop).enhance(1.45)
boost = ImageEnhance.Brightness(boost).enhance(1.22)
glow = boost.filter(ImageFilter.GaussianBlur(10))
boost = ImageChops.screen(boost, glow)
on = Image.composite(boost, beam_crop, mask)

save_opt(off, f"{BEAM}/beam-off.png", 900)
save_opt(on, f"{BEAM}/beam-on.png", 900)

# ── 4) NO CONTACT / CONTACT 카드 (image4) ──────────────────────────
im4 = Image.open(f"{SRC}/image4.png").convert("RGB")
save_opt(im4.crop((50, 240, 568, 618)), f"{ASSETS}/card-nocontact.png", 600)
save_opt(im4.crop((588, 240, 1106, 618)), f"{ASSETS}/card-contact.png", 600)

# ── 5) 현행 문의사항 버튼 (image5) — 톤 참조용 ─────────────────────
im5 = Image.open(f"{SRC}/image5.png").convert("RGB")
save_opt(im5, f"{ASSETS}/ref-inquiry-button.png", 200)

print("done")
