#!/usr/bin/env python3
"""
v8.1 · DUAL MODE 모식도 — 브로슈어 비주얼 언어 매칭 리메이크
- 오렌지 와이어프레임 메시 에너지(브로슈어 핸드피스 전극 메시 스타일)
- 광택 화이트 어플리케이터 + 시안 냉각 링
- 얇은 웨이브 라인 번들 배경(브로슈어 코너 장식 스타일)
- 1920px 렌더(레티나) · 텍스트 없음
"""
import math, os
import cairosvg

OUT = os.path.join(os.path.dirname(__file__), "..", "output", "production", "images")
os.makedirs(OUT, exist_ok=True)
W, H = 960, 720

CYAN = "#53efff"
STEEL = "#3b5f95"
ORANGE = "#ff8a2b"
HOT = "#ffd9a8"


def pts(fn, n=60):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in (fn(i / n) for i in range(n + 1)))


# ── 배경 웨이브 번들 (브로슈어 코너 장식풍) ─────────────────────────
def wave_bundle(cx, cy, rot, spread=120, n=13, length=680, color=STEEL, op=.16):
    out = [f'<g transform="rotate({rot} {cx} {cy})">']
    for k in range(n):
        off = (k / (n - 1) - .5) * spread
        amp = 26 + 14 * math.sin(k * .8)
        def f(t, off=off, amp=amp):
            x = cx - length / 2 + t * length
            y = cy + off + amp * math.sin(t * math.tau * 1.15 + k * .55)
            return x, y
        o = op * (1 - abs(k / (n - 1) - .5))
        out.append(f'<polyline points="{pts(f)}" fill="none" stroke="{color}" stroke-opacity="{o + .05:.2f}" stroke-width="1"/>')
    out.append("</g>")
    return "\n".join(out)


# ── 와이어프레임 콘(메시) : 팁(y0, r0) → 깊이(y1, r1) ────────────────
def mesh_cone(cx, y0, r0, y1, r1, meridians=9, rings=5, focus_bulge=0.0):
    def rx(t): return r0 + (r1 - r0) * t
    def ry(t): return rx(t) * .30
    def yy(t): return y0 + (y1 - y0) * t
    el = []
    # 링(단면 타원)
    for i in range(rings + 1):
        t = i / rings
        op = .55 - .25 * abs(t - .75)
        el.append(f'<ellipse cx="{cx}" cy="{yy(t):.1f}" rx="{rx(t):.1f}" ry="{ry(t):.1f}" '
                  f'fill="none" stroke="url(#ogr)" stroke-opacity="{op:.2f}" stroke-width="1.1"/>')
    # 메리디언(세로 곡선)
    for m in range(meridians):
        a = math.tau * m / meridians
        def f(t, a=a):
            return cx + rx(t) * math.cos(a), yy(t) + ry(t) * math.sin(a)
        el.append(f'<polyline points="{pts(f, 40)}" fill="none" stroke="url(#ogr)" stroke-opacity=".5" stroke-width="1"/>')
    return "\n".join(el)


# ── 와이어프레임 구/돔 (열 집중부) ──────────────────────────────────
def mesh_blob(cx, cy, R, squash=.62, lats=5, longs=4, dome=False):
    el = []
    for i in range(1, lats + 1):
        phi = (i / (lats + 1) - .5) * math.pi
        if dome and phi < -0.15:  # 돔이면 위쪽 위주
            continue
        r = R * math.cos(phi)
        yo = R * squash * math.sin(phi)
        el.append(f'<ellipse cx="{cx}" cy="{cy + yo:.1f}" rx="{r:.1f}" ry="{r * .30:.1f}" '
                  f'fill="none" stroke="url(#ogr)" stroke-opacity=".55" stroke-width="1.05"/>')
    for m in range(longs):
        rot = 180 / longs * m
        el.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{R * .22:.1f}" ry="{R * squash:.1f}" '
                  f'fill="none" stroke="url(#ogr)" stroke-opacity=".4" stroke-width="1" '
                  f'transform="rotate({rot - 90 + 180 / longs / 2:.0f} {cx} {cy})"/>')
    return "\n".join(el)


# ── 광택 어플리케이터 + 시안 냉각 링 ────────────────────────────────
def applicator(cx, tip_w, y_bottom=250):
    hw = tip_w / 2
    return f'''
  <g filter="url(#soft)">
    <rect x="{cx - hw}" y="{y_bottom - 96}" width="{tip_w}" height="72" rx="20" fill="url(#body)"/>
    <rect x="{cx - hw + 10}" y="{y_bottom - 88}" width="{tip_w * .28:.0f}" height="56" rx="12" fill="#ffffff" fill-opacity=".55"/>
    <rect x="{cx - hw + 4}" y="{y_bottom - 30}" width="{tip_w - 8}" height="18" rx="9" fill="url(#metal)"/>
  </g>
  <ellipse cx="{cx}" cy="{y_bottom - 4}" rx="{hw - 2}" ry="7" fill="none" stroke="{CYAN}" stroke-opacity=".9" stroke-width="2.4" filter="url(#glowC)"/>
'''


DEFS = f'''<defs>
  <radialGradient id="bgg" cx="50%" cy="26%" r="95%">
    <stop offset="0" stop-color="#0c1626"/><stop offset=".6" stop-color="#050b15"/><stop offset="1" stop-color="#03070e"/>
  </radialGradient>
  <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e7ecf2"/><stop offset="1" stop-color="#b9c2cd"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#aeb6c0"/><stop offset="1" stop-color="#6d747e"/>
  </linearGradient>
  <linearGradient id="ogr" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{HOT}"/><stop offset="1" stop-color="{ORANGE}"/>
  </linearGradient>
  <radialGradient id="core" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#fff3df" stop-opacity=".95"/>
    <stop offset=".4" stop-color="{ORANGE}" stop-opacity=".55"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="corewide" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="{ORANGE}" stop-opacity=".38"/>
    <stop offset=".6" stop-color="{ORANGE}" stop-opacity=".16"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity="0"/>
  </radialGradient>
  <filter id="glowO" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glowC" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".5"/>
  </filter>
</defs>'''


def skin(y=260):
    return f'''
  <rect x="0" y="{y}" width="{W}" height="{H - y}" fill="#0a1322" fill-opacity=".55"/>
  <line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{CYAN}" stroke-opacity=".55" stroke-width="1.6" filter="url(#glowC)"/>
  <line x1="40" y1="{y + 130}" x2="{W - 40}" y2="{y + 130}" stroke="#ffffff" stroke-opacity=".07"/>
  <line x1="40" y1="{y + 280}" x2="{W - 40}" y2="{y + 280}" stroke="#ffffff" stroke-opacity=".05"/>
  <rect x="0" y="{y + 130}" width="{W}" height="150" fill="#ffffff" fill-opacity=".02"/>
'''


def frame(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'{DEFS}<rect width="{W}" height="{H}" fill="url(#bgg)"/>{body}</svg>')


# ═════ FINE MODE : 좁은 메시 콘 → 핀포인트 메시 구 ═════
fine = frame(
    wave_bundle(150, 120, -28) + wave_bundle(830, 620, -24, color=STEEL) +
    skin() +
    f'<ellipse cx="480" cy="470" rx="120" ry="60" fill="url(#core)"/>' +
    f'<g filter="url(#glowO)">' +
    mesh_cone(480, 252, 52, 452, 16, meridians=7, rings=4) +
    mesh_blob(480, 470, 54, squash=.66) +
    f'</g>' +
    f'<ellipse cx="480" cy="470" rx="14" ry="9" fill="#fff3df" filter="url(#glowO)"/>' +
    # 조준 헤어라인
    f'<line x1="300" y1="470" x2="392" y2="470" stroke="{CYAN}" stroke-opacity=".5" stroke-width="1.2"/>' +
    f'<line x1="568" y1="470" x2="660" y2="470" stroke="{CYAN}" stroke-opacity=".5" stroke-width="1.2"/>' +
    applicator(480, 116)
)

# ═════ WAVE MODE : 넓은 메시 콘 → 심부 볼륨 메시 돔 ═════
wave = frame(
    wave_bundle(160, 130, -26) + wave_bundle(820, 610, -22) +
    skin() +
    f'<ellipse cx="480" cy="500" rx="330" ry="120" fill="url(#corewide)"/>' +
    f'<g filter="url(#glowO)">' +
    mesh_cone(480, 252, 108, 420, 250, meridians=9, rings=4) +
    mesh_blob(480, 490, 265, squash=.42, lats=4, longs=2) +
    f'</g>' +
    # 확산 아크
    f'<path d="M 130 590 Q 480 508 830 590" fill="none" stroke="{ORANGE}" stroke-opacity=".3" stroke-width="1.2"/>' +
    f'<path d="M 90 646 Q 480 556 870 646" fill="none" stroke="{ORANGE}" stroke-opacity=".16" stroke-width="1"/>' +
    applicator(480, 230)
)

for name, svg in (("mode-fine-960w", fine), ("mode-wave-960w", wave)):
    p = os.path.join(OUT, f"{name}.png")
    cairosvg.svg2png(bytestring=svg.encode(), write_to=p, output_width=1920, output_height=1440)
    open(os.path.join(OUT, f"{name}.svg"), "w").write(svg)
    print(f"  ✓ {name}.png ({os.path.getsize(p)//1024} KB)")
