#!/usr/bin/env python3
"""
T2 · 웨이브 패턴 3종 생성기 (SVG 원본 + 1920x1080 PNG)
- 사이트 다크 네이비 배경 위 얇은 라인 웨이브. 라인 불투명도 0.15~0.35(가독성 유지).
- 색상은 플레이스홀더(운영자가 site-audit §7 실측값으로 SVG 내 변수만 교체 가능).
- 외부 라이브러리: cairosvg(렌더링)만 사용. 순수 수학으로 sine path 생성.
"""
import math
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "output", "wave-patterns")
os.makedirs(OUT, exist_ok=True)

W, H = 1920, 1080

# ── 플레이스홀더 색상 (site-audit §7에서 실측 후 교체) ──────────────
NAVY_TOP = "#0a1526"     # 배경 그라디언트 상단 (다크 네이비)
NAVY_BOT = "#060d1a"     # 배경 그라디언트 하단
LINE_MAIN = "#4a6a9a"    # 기본 라인 (차분한 블루)
CYAN = "#35c6e6"         # 시안 글로우 (FINECOOL 톤)


def sine_path(amp, wavelength, phase, baseline, samples=96, tilt=0.0):
    """수평 사인파 path d 문자열. tilt: 좌→우 완만한 기울기(px)."""
    pts = []
    for i in range(samples + 1):
        x = W * i / samples
        y = baseline + amp * math.sin(2 * math.pi * x / wavelength + phase) + tilt * (i / samples)
        pts.append((x, y))
    d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f} " + " ".join(
        f"L {x:.1f} {y:.1f}" for x, y in pts[1:]
    )
    return d


def svg_header(extra_defs=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}"
     viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" role="img"
     aria-label="finewave decorative wave background">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{NAVY_TOP}"/>
      <stop offset="1" stop-color="{NAVY_BOT}"/>
    </linearGradient>
    {extra_defs}
  </defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>'''


# ── (a) 파인라인: 촘촘한 얇은 라인 다수, 현행 유사 ──────────────────
def wave_a():
    lines = []
    n = 22
    for i in range(n):
        baseline = H * (0.12 + 0.76 * i / (n - 1))
        amp = 26 + 10 * math.sin(i * 0.7)
        wl = 620 + 40 * (i % 3)
        phase = i * 0.55
        opacity = 0.15 + 0.12 * (1 - abs(i - n / 2) / (n / 2))  # 중앙이 살짝 진하게
        d = sine_path(amp, wl, phase, baseline, tilt=-30)
        lines.append(
            f'<path d="{d}" fill="none" stroke="{LINE_MAIN}" '
            f'stroke-width="1.1" stroke-opacity="{opacity:.3f}"/>'
        )
    body = "\n  ".join(lines)
    return svg_header() + "\n  " + body + "\n</svg>\n"


# ── (b) 성근 곡률: 큰 진폭, 적은 개수, 여유로운 웨이브 ───────────────
def wave_b():
    lines = []
    n = 7
    for i in range(n):
        baseline = H * (0.18 + 0.64 * i / (n - 1))
        amp = 70 + 26 * math.sin(i * 1.3)
        wl = 1180 + 120 * (i % 2)
        phase = i * 0.9
        opacity = 0.16 + 0.14 * (i / (n - 1))
        d = sine_path(amp, wl, phase, baseline, samples=120, tilt=20)
        lines.append(
            f'<path d="{d}" fill="none" stroke="{LINE_MAIN}" '
            f'stroke-width="1.6" stroke-opacity="{opacity:.3f}" '
            f'stroke-linecap="round"/>'
        )
    body = "\n  ".join(lines)
    return svg_header() + "\n  " + body + "\n</svg>\n"


# ── (c) 시안 글로우: 은은한 cyan 발광 라인 혼합 ─────────────────────
def wave_c():
    glow_def = '''<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="cyanline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="''' + LINE_MAIN + '''" stop-opacity="0.10"/>
      <stop offset="0.5" stop-color="''' + CYAN + '''" stop-opacity="0.9"/>
      <stop offset="1" stop-color="''' + LINE_MAIN + '''" stop-opacity="0.10"/>
    </linearGradient>'''
    lines = []
    n = 14
    for i in range(n):
        baseline = H * (0.14 + 0.72 * i / (n - 1))
        amp = 40 + 18 * math.sin(i * 0.9)
        wl = 780 + 60 * (i % 3)
        phase = i * 0.6
        d = sine_path(amp, wl, phase, baseline, samples=110, tilt=-15)
        # 대부분은 차분한 라인, 3~4개만 시안 글로우 강조
        if i % 4 == 2:
            lines.append(
                f'<path d="{d}" fill="none" stroke="url(#cyanline)" '
                f'stroke-width="1.8" stroke-opacity="0.35" filter="url(#glow)"/>'
            )
        else:
            op = 0.15 + 0.08 * (1 - abs(i - n / 2) / (n / 2))
            lines.append(
                f'<path d="{d}" fill="none" stroke="{LINE_MAIN}" '
                f'stroke-width="1.0" stroke-opacity="{op:.3f}"/>'
            )
    body = "\n  ".join(lines)
    return svg_header(glow_def) + "\n  " + body + "\n</svg>\n"


VARIANTS = {
    "wave-a-fineline": wave_a,
    "wave-b-loose": wave_b,
    "wave-c-cyanglow": wave_c,
}


def main():
    import cairosvg
    for name, fn in VARIANTS.items():
        svg = fn()
        svg_path = os.path.join(OUT, f"{name}.svg")
        png_path = os.path.join(OUT, f"{name}.png")
        with open(svg_path, "w") as f:
            f.write(svg)
        cairosvg.svg2png(
            bytestring=svg.encode(), write_to=png_path,
            output_width=W, output_height=H,
        )
        print(f"  ✓ {name}.svg  +  {name}.png  ({os.path.getsize(png_path)//1024} KB)")


if __name__ == "__main__":
    main()
