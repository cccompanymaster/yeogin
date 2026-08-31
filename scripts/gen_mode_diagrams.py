#!/usr/bin/env python3
"""
v8 · DUAL MODE 모식도 2종 생성 (실사이트 팔레트 매칭)
- fine-mode : 국소 부위/핀포인트 열 집중 모식도 (좁은 빔 → 소형 고강도 핫스팟)
- wave-mode : 심부 전체/입체 열 분포·확산 모식도 (넓은 조사 → 부드러운 볼륨 히팅)
텍스트 없음(라벨은 HTML로) · 960x720 · 웹 최적화
"""
import os
import cairosvg

OUT = os.path.join(os.path.dirname(__file__), "..", "output", "production", "images")
os.makedirs(OUT, exist_ok=True)
W, H = 960, 720

NAVY = "#040d19"
NAVY2 = "#0b1423"
CYAN = "#53efff"
ORANGE = "#ff8a2b"
HOT = "#ffd9a8"

# 공통: 배경 + 피부 레이어 밴드(헤어라인 3층) + 팁 + 표면 시안 라인
def base(tip_w):
    tx = W / 2
    return f'''
  <rect width="{W}" height="{H}" fill="url(#bgg)"/>
  <!-- 피부 레이어 헤어라인 -->
  <line x1="70" y1="300" x2="{W-70}" y2="300" stroke="#ffffff" stroke-opacity=".10"/>
  <line x1="70" y1="420" x2="{W-70}" y2="420" stroke="#ffffff" stroke-opacity=".08"/>
  <line x1="70" y1="560" x2="{W-70}" y2="560" stroke="#ffffff" stroke-opacity=".06"/>
  <rect x="70" y="300" width="{W-140}" height="120" fill="#ffffff" fill-opacity=".015"/>
  <rect x="70" y="420" width="{W-140}" height="140" fill="#ffffff" fill-opacity=".03"/>
  <!-- 핸드피스 팁 -->
  <rect x="{tx-tip_w/2}" y="180" width="{tip_w}" height="66" rx="18" fill="#e9eef4"/>
  <rect x="{tx-tip_w/2+8}" y="226" width="{tip_w-16}" height="22" rx="10" fill="#8b9099"/>
  <!-- FINECOOL 표면 냉각 라인 -->
  <rect x="90" y="292" width="{W-180}" height="7" rx="3.5" fill="{CYAN}" fill-opacity=".45"/>
'''

defs = f'''<defs>
  <radialGradient id="bgg" cx="50%" cy="30%" r="90%">
    <stop offset="0" stop-color="{NAVY2}"/><stop offset="1" stop-color="{NAVY}"/>
  </radialGradient>
  <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="{HOT}" stop-opacity=".95"/>
    <stop offset=".35" stop-color="{ORANGE}" stop-opacity=".8"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="volume" cx="50%" cy="42%" r="60%">
    <stop offset="0" stop-color="{ORANGE}" stop-opacity=".55"/>
    <stop offset=".55" stop-color="{ORANGE}" stop-opacity=".28"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="beamN" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{HOT}" stop-opacity=".85"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity=".25"/>
  </linearGradient>
  <linearGradient id="beamW" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{ORANGE}" stop-opacity=".5"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity=".12"/>
  </linearGradient>
</defs>'''

# ── FINE: 좁은 빔 → 특정 깊이 핀포인트 핫스팟 + 타이트한 동심원 ──
fine = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
{defs}{base(120)}
  <!-- 좁은 집중 빔 -->
  <path d="M {W/2-26} 248 L {W/2+26} 248 L {W/2+13} 470 L {W/2-13} 470 Z" fill="url(#beamN)"/>
  <!-- 핀포인트 핫스팟 (진피-심부 경계 국소) -->
  <ellipse cx="{W/2}" cy="480" rx="86" ry="52" fill="url(#hotspot)"/>
  <ellipse cx="{W/2}" cy="480" rx="30" ry="19" fill="{HOT}" fill-opacity=".9"/>
  <!-- 타이트 동심원(정밀 조준) -->
  <ellipse cx="{W/2}" cy="480" rx="120" ry="70" fill="none" stroke="{ORANGE}" stroke-opacity=".45" stroke-width="1.6"/>
  <ellipse cx="{W/2}" cy="480" rx="170" ry="98" fill="none" stroke="{ORANGE}" stroke-opacity=".22" stroke-width="1.2"/>
  <!-- 조준 크로스헤어 -->
  <line x1="{W/2-210}" y1="480" x2="{W/2-140}" y2="480" stroke="{CYAN}" stroke-opacity=".5" stroke-width="1.4"/>
  <line x1="{W/2+140}" y1="480" x2="{W/2+210}" y2="480" stroke="{CYAN}" stroke-opacity=".5" stroke-width="1.4"/>
</svg>'''

# ── WAVE: 넓은 조사 → 심부 전반 볼륨 히팅 + 확산 아크 ──
wave = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
{defs}{base(230)}
  <!-- 넓은 조사면 -->
  <path d="M {W/2-108} 248 L {W/2+108} 248 L {W/2+190} 460 L {W/2-190} 460 Z" fill="url(#beamW)"/>
  <!-- 심부 볼륨 히팅 (넓고 균일) -->
  <ellipse cx="{W/2}" cy="495" rx="330" ry="130" fill="url(#volume)"/>
  <ellipse cx="{W/2}" cy="495" rx="200" ry="82" fill="{ORANGE}" fill-opacity=".30"/>
  <!-- 확산 아크(입체 전파) -->
  <path d="M {W/2-300} 560 Q {W/2} 470 {W/2+300} 560" fill="none" stroke="{ORANGE}" stroke-opacity=".4" stroke-width="1.6"/>
  <path d="M {W/2-350} 610 Q {W/2} 512 {W/2+350} 610" fill="none" stroke="{ORANGE}" stroke-opacity=".22" stroke-width="1.3"/>
  <path d="M {W/2-390} 658 Q {W/2} 556 {W/2+390} 658" fill="none" stroke="{ORANGE}" stroke-opacity=".12" stroke-width="1.1"/>
</svg>'''

for name, svg in (("mode-fine-960w", fine), ("mode-wave-960w", wave)):
    p = os.path.join(OUT, f"{name}.png")
    cairosvg.svg2png(bytestring=svg.encode(), write_to=p, output_width=W, output_height=H)
    open(os.path.join(OUT, f"{name}.svg"), "w").write(svg)
    print(f"  ✓ {name}.png ({os.path.getsize(p)//1024} KB)")
