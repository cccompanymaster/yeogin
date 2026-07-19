# T9 · 운영자 적용 가이드 (apply-guide.md)

> finewave.kr(WordPress 7.0 · Astra · Elementor 4.1.2 · Sticky Header Effects · WPForms Lite)에
> 이 산출물 세트를 반영하기 위한 **운영자용 매뉴얼**입니다.
> Claude Code는 사이트에 접속/반영하지 않았습니다. **실반영은 전부 운영자가 수동으로** 합니다.

## ⛳ 반영 전 공통 조건 (필수)

1. **평일 09:00–18:00** 시간대에만 작업 (클라이언트 확정).
2. **전체 백업 완료** — 반영 전 반드시. (WP 관리자 > 백업 플러그인 또는 호스팅 백업)
3. 스테이징 없음 → **한 번에 하나씩 반영 후 즉시 확인**, 문제 시 즉시 롤백.
4. `site-audit.md`의 8개 항목을 **먼저 채움** → 각 스니펫 상단 변수/셀렉터/URL에 대입.
   (미채움 상태에서도 스니펫은 플레이스홀더 기본값으로 동작하지만, 톤·오프셋이 사이트와 정확히 일치하려면 실측값 필요.)
5. 커스텀 CSS는 모두 `fw-` 접두사 → 기존 Elementor/Astra 클래스와 충돌 없음.

## 📍 CSS/HTML 삽입 위치 3곳 (용어 정리)

| 약칭 | 실제 경로 | 용도 |
|---|---|---|
| **[전역 CSS]** | Elementor 좌측 상단 햄버거 > 사이트 설정 > 사용자 정의 CSS | 전 페이지 공통 CSS (T4·T6·T7·T8) |
| **[Astra CSS]** | 관리자 > 외모 > 사용자 정의하기 > 추가 CSS | [전역 CSS] 대안(동일 효과). Elementor Pro 미보유 시 사용 |
| **[HTML 위젯]** | 편집할 페이지 > Elementor 편집 > HTML 위젯 추가 > 코드 붙여넣기 | 페이지 국소 HTML+CSS+JS (T5) |

> ℹ️ Elementor 무료판은 "사이트 설정 > 사용자 정의 CSS"가 없을 수 있습니다. 그 경우 **[Astra CSS]** 를 사용하세요(효과 동일).

---

## 1. 산출물별 적용표

### T1 · `site-audit.md` — 감사값 채우기 (코드 아님)
| 항목 | 내용 |
|---|---|
| 적용 위치 | 해당 없음(작업 준비 문서) |
| 절차 | 1920×1080 Chrome에서 F12로 8개 섹션 값 측정 → 각 표의 "채우기" 칸 기입 |
| 선행 조건 | 없음 |
| QA | 8개 항목 모두 채워졌는지 |
| 롤백 | 해당 없음 |

### T2 · `wave-patterns/` — 2.45GHz 배경 웨이브 교체
| 항목 | 내용 |
|---|---|
| 적용 위치 | 2.45GHz 페이지 > 해당 섹션 배경 (Elementor 섹션 > 스타일 > 배경 > 이미지) |
| 절차 | ① 3종(a/b/c) 시안 중 **클라이언트 컨펌본 1종** 결정 → ② `site-audit §7` 바탕색으로 SVG 색 교체 후 `python3 scripts/gen_waves.py` 재생성(선택) → ③ 컨펌 PNG를 미디어 업로드 → ④ 섹션 배경 이미지 교체, **반복=없음, 크기=Cover, 위치=Center** → ⑤ 기존 깨진 이미지 제거 |
| 선행 조건 | 시안 컨펌(7/21 발송 예정), 바탕색 실측 |
| QA | 1920×1080/모바일에서 이음새·픽셀 깨짐 없는지, 텍스트 가독성 유지되는지 |
| 롤백 | 배경 이미지를 원래 파일로 되돌림 |

### T3 · `beam-blink/` — FINECOOL 빔 깜빡임
| 항목 | 내용 |
|---|---|
| 적용 위치 | 빔 이미지가 있는 페이지/섹션 > **HTML 위젯**(기존 이미지 위젯 대체) + `beam-blink.css`는 [전역 CSS] |
| 절차 | ① `site-audit §4` 원본 빔 이미지를 `beam-off.png`로 저장 → ② `python3 scripts/gen_beam.py --from output/beam-blink/beam-off.png` 로 `beam-on.png` 생성 → ③ 두 PNG 미디어 업로드 → ④ `beam-blink.css` 내용을 [전역 CSS]에 붙여넣기 → ⑤ 이미지 위치에 HTML 위젯 추가 후 아래 마크업(preview.html 참고) 삽입, `src` 를 업로드 URL로 교체 |
| 마크업 | `<div class="fw-beam"><img class="fw-beam__off" src="…off.png" alt="FINECOOL 핸드피스"><img class="fw-beam__on" src="…on.png" alt="" aria-hidden="true"></div>` |
| 선행 조건 | 빔 이미지 URL 확보, **시안 컨펌**(preview.html 발송), 빔 보정 승인(이미 승인됨) |
| QA | 빔이 2.8s 주기로 자연스럽게 맥동, 두 프레임 위치 정확히 겹침, reduced-motion 시 정지 |
| 롤백 | HTML 위젯 삭제 + [전역 CSS]에서 T3 블록 제거 → 원래 이미지 위젯 복구 |

### T4 · `snippets/frccs-anchor-fix.css` — FRCCS 앵커 잘림
| 항목 | 내용 |
|---|---|
| 적용 위치 | [전역 CSS] (또는 [Astra CSS]) |
| 절차 | ① `site-audit §2` 헤더 높이를 `--fw-header-h` 에 대입 → ② `site-audit §3` 판정으로 **해법 A(오프셋)** 또는 **해법 B(섹션 높이)** 선택 → ③ FRCCS 타깃 셀렉터를 `#fw-frccs-target` 자리에 대입(또는 Elementor 섹션 CSS ID를 `frccs`로 지정) → ④ 붙여넣기 |
| 선행 조건 | §2·§3 실측, (권장) FRCCS 잘림 캡처 수령 후 재검증 |
| QA | **1920×1080에서 FRCCS 메뉴 클릭 → 섹션이 헤더에 안 가리고 전체 표시**, 모바일 동일, 관리바 로그인 시에도 정상 |
| 롤백 | [전역 CSS]에서 T4 블록 제거 |

### T5 · `snippets/floating-buttons.html` — 문의사항 + TOP
| 항목 | 내용 |
|---|---|
| 적용 위치 | **[HTML 위젯]** (전 페이지 공통 노출 원하면: Elementor 헤더/푸터 템플릿 또는 Astra 훅에 1회 삽입) |
| 절차 | ① `{{INQUIRY_URL}}` 를 실제 문의 URL로 치환(`site-audit §6`) → ② `.fw-float` 의 `:root` 색/크기 변수를 기존 문의버튼 톤으로 교체 → ③ **기존 '문의사항' 버튼이 이미 있으면 중복되지 않게 제거** → ④ HTML 위젯에 통째 붙여넣기 |
| `{{INQUIRY_URL}}` 예 | 페이지: `/contact` · 폼 앵커: `#wpforms-1234` · 전화: `tel:0212345678` · 이메일: `mailto:info@finewave.kr` |
| 선행 조건 | 문의 URL 확정, 기존 버튼 스타일 실측 |
| QA | 스크롤 300px 후 TOP 페이드인, 클릭 시 최상단 이동, 문의 링크 정상, 모바일 크기 축소, 두 버튼 톤 일치 |
| 롤백 | HTML 위젯 삭제 |

### T6 · `snippets/hero-bg-motion.css` — 히어로 배경 모션
| 항목 | 내용 |
|---|---|
| 적용 위치 | [전역 CSS] + 히어로 섹션에 CSS 클래스 부여 |
| 절차(케이스 A: 누끼 분리 가능) | ① PSD에서 배경/장비 2장 분리 → ② 히어로 섹션에 `fw-hero`, 배경 요소에 `fw-hero__bg`, 장비 이미지에 `fw-hero__device` 클래스 → ③ `--fw-hero-bg: url(배경.png)` 지정 → ④ CSS의 케이스 A 블록 사용 |
| 절차(케이스 B: 단일 합성) | ① 히어로 섹션에 `fw-hero-solid` 클래스 → ② `--fw-wave-url: url(wave-c-cyanglow.svg)`(T2 업로드본) 지정 → ③ CSS의 케이스 B 블록 사용 |
| 선행 조건 | `site-audit §5` 히어로 구조 판정, (케이스 A는) PSD 누끼 확보 |
| QA | 장비는 고정·배경만 미세 이동, 20~30s 루프 부드러움, 배경이 컨테이너 밖 삐져나오지 않음, reduced-motion 시 정지 |
| 롤백 | [전역 CSS]에서 T6 블록 제거 + 클래스 제거 |

### T7 · `snippets/no-contact-overlay.css` — NO CONTACT 카드 어둡게
| 항목 | 내용 |
|---|---|
| 적용 위치 | [전역 CSS] + NO CONTACT 카드 위젯에 CSS 클래스 `fw-nocontact` 부여 |
| 절차 | ① 카드 위젯에 `fw-nocontact` 클래스(또는 `site-audit §8` 셀렉터로 교체) → ② 카드가 이미지형이면 방식1(brightness), 텍스트박스형이면 방식2(오버레이) 선택 → ③ 강도 `--fw-nocontact-dim` 을 70/60/50 중 컨펌본으로 → ④ 붙여넣기 |
| 선행 조건 | `site-audit §8` 셀렉터, 강도 톤 컨펌 |
| QA | NO CONTACT 카드만 어두워지고 인접 카드 영향 없음, 3단계 전환 확인, 텍스트 가독성 |
| 롤백 | [전역 CSS]에서 T7 블록 제거 + 클래스 제거 |

### T8 · `snippets/fade-in-fallback.css` — 페이드인 보조
| 항목 | 내용 |
|---|---|
| 적용 위치 | **1순위:** Elementor 등장 애니메이션 / **보조:** [전역 CSS] |
| Elementor 기본 애니메이션 경로 | 위젯 선택 > **고급 탭 > 모션 효과 > 진입 애니메이션(Entrance Animation)** = Fade In Up 등 선택, Duration/Delay 조절 |
| 이 파일 절차 | ① [전역 CSS]에 붙여넣기 → ② 페이드시킬 위젯 고급 탭 > CSS 클래스에 `fw-fade`(방향 변형: `fw-fade--left/right/up`) 추가 → ③ 순차 등장은 같은 부모 내 형제에 부여(자동 계단 지연) |
| 선행 조건 | 없음(독립 산출물) |
| QA | 초기 로드 시 0.8~1.2s 부드러운 등장, 순차 지연 자연스러움, reduced-motion 시 즉시 표시(깜빡임 없음) |
| 롤백 | [전역 CSS]에서 T8 블록 제거 + 클래스 제거 |

---

## 2. 운영자 실행 순서 (일정 매핑, 작업지시서 §5 반영)

| 날짜 | 내용 |
|---|---|
| 7/20(월) | 백업 → **폰트 통일**(Elementor 글로벌 폰트) · **투명/고정 헤더**(Sticky Header Effects) · **T8 애니메이션** · **T4 FRCCS** · **T5 버튼** 반영 |
| 7/21(화) | **T2·T3 시안 클라이언트 발송** · 이미지 확대/정렬 · **T7 NO CONTACT** 반영 |
| 7/22–23(수·목) | 컨펌 반영: **T2 웨이브 교체** · **T3 빔 적용** · **T6 히어로 모션** |
| 7/24(금) | 전체 QA(1920×1080 포함) · 완료 보고 |

### 폰트 통일(코드 아님, 참고)
Elementor 좌측 상단 햄버거 > 사이트 설정 > **글로벌 폰트(타이포그래피)** 에서 기본/H1~H6 폰트를 `site-audit §1` 메인 기준값으로 통일. 개별 위젯에 인라인 폰트가 박힌 경우(§1-2 이탈 목록) 그 위젯을 "글로벌 참조"로 되돌림.

---

## 3. 전체 QA 체크리스트 (7/24 최종)

- [ ] **1920×1080 데스크톱**: FRCCS 앵커 클릭 시 섹션 전체 표시(잘림 없음)
- [ ] 데스크톱 Chrome / Edge / Safari 렌더 동일
- [ ] 모바일(≤768px): 플로팅 버튼 축소·간격 정상, 웨이브/히어로 깨짐 없음
- [ ] 빔 깜빡임 자연스러움 + 프레임 정합
- [ ] NO CONTACT 카드만 어두워짐(인접 미영향)
- [ ] 폰트: 전 페이지(메인·2.45GHz·FINECOOL·FRCCS·FAQ) 통일 확인
- [ ] 등장 애니메이션 부드러움, 스크롤 성능 저하 없음
- [ ] `prefers-reduced-motion` 켠 환경(OS 설정)에서 모든 모션 정지
- [ ] 우측 플로팅: 문의 링크 정상 이동 + TOP 최상단 이동

## 4. 통합 롤백 원칙

> **모든 CSS/HTML 스니펫은 "제거 = 원복"** 입니다. DB나 기존 콘텐츠를 변형하지 않으므로,
> [전역 CSS]/[HTML 위젯]에서 해당 블록만 지우면 즉시 원래 상태로 돌아갑니다.
> 이미지 교체(T2/T3)만 예외 — 원본 파일을 되돌리면 됩니다(백업본 사용).
> 문제가 생기면 개별 블록 제거 → 그래도 안 되면 7/20 이전 **전체 백업 복원**.

## 5. 산출물 ↔ 적용 위치 한눈에

| 산출물 | 위치 | 선행 |
|---|---|---|
| site-audit.md | (준비 문서) | — |
| wave-patterns/*.png | 2.45GHz 섹션 배경 | 시안 컨펌·바탕색 |
| beam-blink/* | HTML 위젯 + [전역 CSS] | 빔 URL·시안 컨펌 |
| frccs-anchor-fix.css | [전역 CSS] | §2·§3 실측 |
| floating-buttons.html | [HTML 위젯] | 문의 URL·§6 |
| hero-bg-motion.css | [전역 CSS] + 클래스 | §5·(A는 누끼) |
| no-contact-overlay.css | [전역 CSS] + 클래스 | §8·톤 컨펌 |
| fade-in-fallback.css | Elementor 모션 / [전역 CSS] | — |
| apply-guide.md | (본 문서) | — |

---
*본 가이드는 finewave.kr에 무접촉으로 제작된 산출물의 수동 반영 절차입니다. 실제 반영·백업·클라이언트 커뮤니케이션은 운영자가 수행합니다.*
