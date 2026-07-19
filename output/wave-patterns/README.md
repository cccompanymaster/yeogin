# T2 · 웨이브 패턴 시안 3종

2.45GHz 페이지의 깨진 배경 웨이브 교체용. 다크 네이비 바탕 위 얇은 라인 웨이브(라인 불투명도 0.15~0.35, 텍스트 가독성 유지).

| 파일 | 방향성 | 특징 |
|---|---|---|
| `wave-a-fineline.(svg\|png)` | 현행 유사 파인라인 | 촘촘한 얇은 라인 22줄, 차분함 |
| `wave-b-loose.(svg\|png)` | 큰 곡률·성근 웨이브 | 라인 7줄, 진폭 크고 여유로움 |
| `wave-c-cyanglow.(svg\|png)` | 시안 글로우 혼합 | 일부 라인에 FINECOOL 톤 cyan 발광 |

- PNG: 1920×1080, 각 500KB 이하.
- SVG: 벡터 원본. 무한 확대 가능 → 큰 화면/레티나 권장.

## 색상 교체 (site-audit §7 실측 후)

현재 색은 **플레이스홀더**입니다. `.svg` 파일 상단 `<defs>`의 색상값 또는 재생성 스크립트(`scripts/gen_waves.py`)의 상수만 바꾸면 됩니다:

```
NAVY_TOP  = "#0a1526"   # 배경 그라디언트 상단  → 실측 바탕색으로
NAVY_BOT  = "#060d1a"   # 배경 그라디언트 하단
LINE_MAIN = "#4a6a9a"   # 기본 라인색           → 실측 웨이브 라인색으로
CYAN      = "#35c6e6"   # 시안 글로우 (variant c)
```

재생성: `python3 scripts/gen_waves.py` (Pillow 불필요, cairosvg만 필요).

## 적용 (운영자)

배경 이미지 교체 방식은 `../apply-guide.md`의 T2 항목 참조. 요약: 컨펌된 1종 PNG를 미디어 업로드 → 2.45GHz 섹션 배경 이미지 교체(반복 없음/cover). SVG를 직접 배경으로 쓰려면 CSS `background-image:url(...svg)` 도 가능.
