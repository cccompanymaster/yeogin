#!/usr/bin/env python3
"""
T3 · 빔 깜빡임 프레임 생성기

두 가지 모드:
  1) --synthetic : 실제 빔 이미지 부재 시, 다크 배경 위 핸드피스+오렌지 빔의
     '합성 데모' off/on 프레임 생성 (클라이언트 시안 발송·미리보기용).
  2) --from <path> : site-audit §4에서 저장한 실제 빔 원본(off 프레임)을 입력받아
     빔 발광부의 밝기·채도·글로우를 강화한 on 프레임을 생성.

핵심 원리(둘 다 공통): OFF = 원본, ON = 빔 영역 강조본.
CSS는 두 프레임을 같은 위치에 겹치고 위 프레임 opacity를 크로스페이드.
"""
import argparse
import os
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance

OUT = os.path.join(os.path.dirname(__file__), "..", "output", "beam-blink")
os.makedirs(OUT, exist_ok=True)

# 빔 오렌지 톤 (플레이스홀더 — 실제 이미지 사용 시 색은 원본에서 옴)
BEAM_CORE = (255, 176, 74)
BEAM_HOT = (255, 232, 190)
BEAM_EDGE = (255, 110, 24)


def make_synthetic_off(w=1000, h=750):
    """다크 그라디언트 배경 위 단순 핸드피스 실루엣 + 은은한(꺼진) 빔."""
    img = Image.new("RGB", (w, h), (10, 18, 34))
    # 세로 그라디언트 배경
    top, bot = (14, 24, 44), (6, 11, 22)
    px = img.load()
    for y in range(h):
        t = y / h
        px_row = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = px_row
    d = ImageDraw.Draw(img, "RGBA")

    # 핸드피스 본체(둥근 사각 막대, 대각선 배치)
    cx, cy = int(w * 0.40), int(h * 0.42)
    body = [(cx - 70, cy - 190), (cx + 70, cy + 150)]
    d.rounded_rectangle(body, radius=60, fill=(38, 46, 60), outline=(90, 104, 126), width=3)
    # 본체 하이라이트
    d.rounded_rectangle([(cx - 52, cy - 175), (cx - 20, cy + 135)], radius=30,
                        fill=(70, 82, 100))
    # 팁(빔 방출부) — 하단
    tip = [(cx - 34, cy + 130), (cx + 34, cy + 190)]
    d.rounded_rectangle(tip, radius=20, fill=(120, 90, 60), outline=(160, 120, 80), width=2)

    # 꺼진 상태의 아주 은은한 빔 잔광 (거의 안 보임)
    beam = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beam)
    bx, by = cx, cy + 190
    bd.polygon([(bx - 28, by), (bx + 28, by), (bx + 90, h), (bx - 90, h)],
               fill=BEAM_CORE + (40,))
    beam = beam.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img.convert("RGBA"), beam).convert("RGB")
    return img, (bx, by)


def synth_beam_layer(w, h, origin, intensity=1.0):
    """빔 발광 레이어(원뿔형 코어+글로우) 생성. intensity로 밝기 조절."""
    bx, by = origin
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    a = int(210 * intensity)
    # 바깥 글로우 (넓은 오렌지)
    d.polygon([(bx - 34, by), (bx + 34, by), (bx + 120, h), (bx - 120, h)],
              fill=BEAM_EDGE + (int(a * 0.55),))
    # 코어 (밝은 오렌지)
    d.polygon([(bx - 20, by), (bx + 20, by), (bx + 66, h), (bx - 66, h)],
              fill=BEAM_CORE + (a,))
    # 핫스팟 (팁 바로 아래 흰빛)
    d.ellipse([(bx - 30, by - 20), (bx + 30, by + 40)], fill=BEAM_HOT + (int(a * 0.9),))
    layer = layer.filter(ImageFilter.GaussianBlur(6 + 6 * intensity))
    return layer


def make_synthetic_on(off_img, origin):
    layer = synth_beam_layer(*off_img.size, origin, intensity=1.0)
    on = Image.alpha_composite(off_img.convert("RGBA"), layer).convert("RGB")
    on = ImageEnhance.Brightness(on).enhance(1.04)
    return on


def enhance_real_on(off_img):
    """
    실제 off 프레임 → on 프레임.
    빔(따뜻한 고휘도) 픽셀만 마스크로 뽑아 밝기·채도·글로우 강화 후 재합성.
    """
    off = off_img.convert("RGB")
    r, g, b = off.split()
    # 따뜻하고 밝은 영역 마스크: R이 높고 R>B (오렌지 성향)
    import numpy as np
    arr = np.asarray(off).astype(np.int16)
    R, G, B = arr[..., 0], arr[..., 1], arr[..., 2]
    warm = (R > 120) & (R - B > 30) & (R + G > 200)
    mask = Image.fromarray((warm * 255).astype("uint8"), "L").filter(
        ImageFilter.GaussianBlur(4))
    # 강화본: 채도·밝기 업 + 글로우
    boosted = ImageEnhance.Color(off).enhance(1.5)
    boosted = ImageEnhance.Brightness(boosted).enhance(1.28)
    boosted = ImageEnhance.Contrast(boosted).enhance(1.06)
    glow = boosted.filter(ImageFilter.GaussianBlur(9))
    boosted = ImageChops.screen(boosted, glow)  # 발광감
    on = Image.composite(boosted, off, mask)
    return on


def save(img, name):
    p = os.path.join(OUT, name)
    img.save(p, optimize=True)
    print(f"  ✓ {name}  ({os.path.getsize(p)//1024} KB, {img.size[0]}x{img.size[1]})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--synthetic", action="store_true",
                    help="합성 데모 프레임 생성")
    ap.add_argument("--from", dest="src", default=None,
                    help="실제 off 원본 경로 → on 프레임 생성")
    args = ap.parse_args()

    if args.src:
        off = Image.open(args.src).convert("RGB")
        save(off, "beam-off.png")
        save(enhance_real_on(off), "beam-on.png")
        print("  실제 이미지 기반 on/off 생성 완료.")
    else:
        # 기본: 합성 데모
        off, origin = make_synthetic_off()
        on = make_synthetic_on(off, origin)
        save(off, "beam-off.png")
        save(on, "beam-on.png")
        print("  합성 데모 프레임 생성 완료. 실제 이미지 준비되면:")
        print("    python3 scripts/gen_beam.py --from output/beam-blink/beam-off.png")


if __name__ == "__main__":
    main()
