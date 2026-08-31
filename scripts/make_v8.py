#!/usr/bin/env python3
"""현행 라이브 템플릿 → v8: DUAL MODE 메뉴 1개 + 섹션 삽입 (그 외 무변경)"""
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "output", "production")
src = open(os.path.join(BASE, "finewave-template-current.html"), encoding="utf-8").read()

# 1) 상단 메뉴: 2.45GHz와 FINECOOL™ 사이에 DUAL MODE 추가 (데스크톱/모바일 공용 nav 1곳)
src = src.replace(
    '<a href="#technology">2.45GHz</a><a href="#finecool">FINECOOL™</a>',
    '<a href="#technology">2.45GHz</a><a href="#dualmode">DUAL MODE</a><a href="#finecool">FINECOOL™</a>',
)

# 2) DUAL MODE 섹션 CSS (기존 스타일 컨벤션 준수 · 스크립트 0줄 유지)
css = """
/* ── dual mode (v8 추가) ── */
#fwv #dualmode{background:var(--navy2)}
#fwv .mcards{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px; max-width:1040px; margin:54px auto 0}
#fwv .mcard{border:1px solid var(--hair); background:rgba(4,13,25,.55); display:flex; flex-direction:column; padding-bottom:34px}
#fwv .mcard>img{display:block; width:100%; height:auto}
#fwv .mcard .mbody{padding:28px 32px 0; text-align:left}
#fwv .mcard h3{font-weight:400; font-size:22px; letter-spacing:.08em; text-transform:uppercase;
  font-family:Jost,Pretendard,sans-serif; color:var(--cyan2) !important}
#fwv .mcard .men{color:var(--dim) !important; font-size:14px; margin-top:2px; letter-spacing:.05em; font-family:Jost,sans-serif}
#fwv .mcard .mrow{margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,.08)}
#fwv .mcard .mrow b{display:block; color:var(--cyan2) !important; font-weight:400; font-size:13.5px;
  letter-spacing:.08em; text-transform:uppercase; font-family:Jost,Pretendard,sans-serif}
#fwv .mcard .mrow span{color:var(--text); font-size:16.5px}
#fwv .mcard .msum{margin-top:24px; color:#eef3f9 !important; font-weight:500; font-size:17.5px}
#fwv .mcard .mdesc{margin-top:8px; color:var(--dim) !important; font-size:15.5px}
@media(max-width:760px){#fwv .mcards{grid-template-columns:1fr; gap:16px}
#fwv .mcard .mbody{padding:22px 22px 0}}
</style>"""
src = src.replace("</style>", css, 1)

# 3) 섹션 마크업: #technology 종료 직후(= #finecool 시작 직전)에 삽입
section = """
<section class="sec" id="dualmode">
  <div class="sec-in">
    <p class="tagline rv">깊이와 면적에 맞춘 두 가지 에너지</p>
    <h2 class="big rv">DUAL MODE</h2>
    <p class="t-cyan rv">- FINE MODE &amp; WAVE MODE</p>
    <p class="lead rv">Finewave의 두 가지 모드는 목적 부위의 깊이와 면적에 따라<br>최적화된 에너지를 전달하는 효과적인 솔루션입니다.</p>
    <div class="mcards">
      <div class="mcard rv">
        <!-- 업로드 후 실제 미디어 URL 확인·교체 -->
        <img src="https://finewave.kr/wp-content/uploads/2026/08/mode-fine-960w.png" alt="FINE MODE — 국소 부위 핀포인트 열 집중 모식도">
        <div class="mbody">
          <h3>Fine Mode</h3>
          <p class="men">Targeted High-Peak Delivery</p>
          <div class="mrow"><b>Target Area</b><span>특정 국소 부위 · 정밀 타깃층</span></div>
          <div class="mrow"><b>Energy Delivery</b><span>핀포인트 집중 조사</span></div>
          <p class="msum">국소 부위에 집중되는 정밀한 열 자극</p>
          <p class="mdesc">짧고 집중적인 에너지 전달 방식으로 통증을 유발하는 특정 타깃층에 열 에너지를 정밀하게 도달시킵니다.</p>
        </div>
      </div>
      <div class="mcard rv">
        <img src="https://finewave.kr/wp-content/uploads/2026/08/mode-wave-960w.png" alt="WAVE MODE — 심부 전체 입체 열 확산 모식도">
        <div class="mbody">
          <h3>Wave Mode</h3>
          <p class="men">Gradual Volumetric Heating</p>
          <div class="mrow"><b>Target Area</b><span>넓은 심부 조직 · 입체적 타깃층</span></div>
          <div class="mrow"><b>Energy Delivery</b><span>연속 입체 조사</span></div>
          <p class="msum">심부 조직 전반에 전달되는 균일한 열 자극</p>
          <p class="mdesc">연속적이고 입체적인 열 전달 방식으로 넓은 심부 근육 및 조직 층에 부드럽고 균일하게 열감을 확산시킵니다.</p>
        </div>
      </div>
    </div>
  </div>
</section>
"""
anchor = '<section class="sec" id="finecool">'
src = src.replace(anchor, section + "\n" + anchor, 1)

# 헤더 주석 갱신
src = src.replace(
    "  포함: 헤더(모바일 햄버거) + 히어로 + 360° + 2.45GHz + FINECOOL",
    "  포함: 헤더(모바일 햄버거) + 히어로 + 360° + 2.45GHz + DUAL MODE + FINECOOL",
)
src = src.replace(
    "═══════════════════════════════════════════════════════════ -->",
    "  v8: DUAL MODE 메뉴+섹션 추가 (mode-fine/wave-960w.png 업로드 필요)\n═══════════════════════════════════════════════════════════ -->",
    1,
)

dst = os.path.join(BASE, "finewave-template-v8.html")
open(dst, "w", encoding="utf-8").write(src)
print("written", dst, len(src) // 1024, "KB")
for k in ('href="#dualmode"', 'id="dualmode"', "mode-fine-960w", "mode-wave-960w"):
    print(f"  {k}: {src.count(k)}")
