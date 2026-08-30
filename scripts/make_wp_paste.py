#!/usr/bin/env python3
"""
index.html(시안 v7) → 워드프레스/Elementor HTML 위젯 붙여넣기용 단일 프래그먼트 생성.
- <head> 래퍼 제거, <style>+본문+<script>만 남긴 프래그먼트
- assets/ 이미지 경로 → {{ASSETS_URL}}/ 플레이스홀더 (업로드 후 일괄 치환 1회)
- Pretendard @font-face 제거(사이트 전역 폰트 상속 — 폰트 통일 방침), 폰트 스택은 유지
- '시안 DRAFT' 배지 제거 (실사이트 반영용)
"""
import re, os

SRC = os.path.join(os.path.dirname(__file__), "..", "output", "mockup", "index.html")
DST = os.path.join(os.path.dirname(__file__), "..", "output", "mockup", "wordpress-paste.html")

html = open(SRC, encoding="utf-8").read()

# 1) style 블록 추출
styles = re.findall(r"<style>(.*?)</style>", html, re.S)
css = "\n".join(styles)

# 2) @font-face 블록 제거 (로컬 폰트 파일 의존 제거 → 사이트 전역 폰트 상속)
css = re.sub(r"/\* ── Pretendard Variable.*?\}\s*", "", css, flags=re.S, count=1)
css = re.sub(r"@font-face\{[^}]*\}\s*", "", css, flags=re.S)

# 3) body 내용 추출
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)

# 4) DRAFT 배지 제거 (마크업 + CSS는 무해하니 마크업만)
body = re.sub(r'<div class="fw-draft">.*?</div>\s*', "", body, count=1)

# 5) 이미지 경로 플레이스홀더화
body = body.replace('src="assets/', 'src="{{ASSETS_URL}}/')
css = css.replace("url(\"assets/", "url(\"{{ASSETS_URL}}/").replace("url(assets/", "url({{ASSETS_URL}}/")

header_comment = """<!-- ================================================================
  FINEWAVE 리뉴얼 v7 — 워드프레스/Elementor 붙여넣기용 전체 코드 (단일 블록)

  [사용법]
  1. output/mockup/assets/ 의 이미지 8종을 WP 미디어 라이브러리에 업로드
     (device-front.png, device-angled.png, handpiece-beam.png, beam-off.png,
      beam-on.png, card-nocontact.png, card-contact.png + 추후 교체 이미지)
  2. 업로드 폴더 URL 확인 (예: https://finewave.kr/wp-content/uploads/2026/08)
  3. 이 파일에서 {{ASSETS_URL}} 을 그 URL로 전체 치환 (편집기 찾아바꾸기 1회)
  4. Elementor 템플릿/페이지에 HTML 위젯 1개 추가 → 전체 붙여넣기
  5. 주의:
     - 이 코드는 자체 헤더/플로팅 버튼 포함 → 테마 헤더·기존 플로팅과
       중복되면 테마 쪽을 숨기거나 이 코드의 해당 블록(<header class="fw-header">,
       <div class="fw-float">)을 삭제
     - 폰트는 사이트 전역 폰트를 상속(폰트 통일 방침). Pretendard를 쓰려면
       사이트 설정에서 전역 폰트로 지정
     - 반영 전 전체 백업 · 평일 09-18시 · 반영 후 1920×1080 QA
  [버전] v7 (Dual Performance Microwave 문구 · DUAL MODE 섹션 · Fine Mode 교정 포함)
================================================================= -->
"""

frag = header_comment + "<style>\n" + css.strip() + "\n</style>\n" + body.strip() + "\n"
open(DST, "w", encoding="utf-8").write(frag)
print(f"written {DST} ({len(frag)//1024} KB)")
print("placeholders:", frag.count("{{ASSETS_URL}}"))
