# 파인웨이브 프로젝트 핸드오프 (새 세션 인계용)

> 아래 코드블록 전체를 새 Claude Code 세션 첫 메시지로 붙여넣으면 됩니다.

```
파인웨이브(finewave.kr) 홈페이지 리뉴얼 프로젝트를 이어서 진행해줘. 이전 세션 인계 내용:

## 프로젝트 개요
- 대상: https://finewave.kr/ — 마이크로웨이브 리프팅 의료기기(2.45GHz) 홍보 사이트, 운영 중
- 스택: WordPress 7.0 · Astra · Elementor 4.1.2 · Sticky Header Effects · WPForms Lite
- 워크플로우: 산출물을 GitHub 브랜치에 커밋·푸시 → 클라이언트 시안 컨펌 → 운영자가 워드프레스에 수동 반영
- 레퍼런스: sherean.co.kr(톤·모션), xerf.kr(장비고정+배경모션), inmode.co.kr(투명헤더)

## 저장소 상태 (여기서부터 이어서)
- 레포: cccompanymaster/yeogin · 브랜치: claude/finewave-homepage-redesign-33wdsi (모든 작업 완료·푸시됨)
- output/ 구조:
  - site-audit.md — T1 감사(캡처 기반 확인값 §0-A + 운영자 F12 측정 템플릿)
  - wave-patterns/ — T2 웨이브 시안 3종 SVG+PNG (재생성: scripts/gen_waves.py)
  - beam-blink/ — T3 빔 깜빡임: 실사이트 핸드피스 이미지 기반 off/on 프레임 + beam-blink.css + preview.html (재생성: scripts/gen_beam.py --from)
  - snippets/ — T4 frccs-anchor-fix.css(해법A 오프셋 우선/B 병행), T5 floating-buttons.html(글래스 서클, {{INQUIRY_URL}} 플레이스홀더), T6 hero-bg-motion.css(케이스A 누끼분리/B 오버레이), T7 no-contact-overlay.css(70/60/50% 3단계), T8 fade-in-fallback.css, demo.html
  - apply-guide.md — T9 운영자 Elementor 적용 매뉴얼(위치/절차/QA/롤백)
  - mockup/ — 풀 홈페이지 시안 v6 (핵심 산출물):
    - index.html — 자체완결 단일 파일. Pretendard Variable 내장(assets/fonts/), 시네마틱 히어로 리빌(암전→실루엣→라이트스윕→에너지펄스→텍스트 순차), 3D 마우스 틸트+리플렉션, 8섹션 스토리 구조(히어로→핵심가치→2.45GHz+피부단면 다이어그램→FINECOOL→스테이트먼트→FRCCS+5단계→HANDPIECE→WHY→FOR CLINICS→FAQ→문의폼), 전부 fw- 접두사·transform/opacity만·prefers-reduced-motion 대응
    - PREVIEW.md — GitHub에서 바로 보이는 스크린샷 미리보기 (클라이언트 확인용 링크)
    - assets/ — 실사이트 캡처에서 추출한 실장비 사진(device-front/angled, handpiece-beam, card-contact/nocontact) — 클라이언트 제공 PPTX의 사이트 캡처 5장에서 크롭한 것 (scripts/extract_assets.py)
    - video-brief.md — 히어로 시네마틱 영상(8~10s) 생성 프롬프트(FINEWAVE 번안: 블랙타워·시안·Go Fine. Get Defined.), <video> 슬롯 삽입 가이드
    - higgsfield-prompts.md / claude-higgsfield-brief.md — 이미지 6종+영상 생성용 힉스필드 프롬프트 팩(장비 왜곡 폐기 원칙 포함)

## 디자인 시스템 (확정)
- 컬러: 딥네이비/블랙 배경 + Blue Energy #3b8dff(마이크로웨이브) + Orange Heat #ff8a2b(열) + Cyan Cooling #25d3e6(냉각) — 쉬리안 퍼플 미채택(브랜드 정체성 유지 결정)
- 폰트: Pretendard Variable(내장), 제목 자간 -0.03em, 태그라인 와이드 레터스페이싱
- 무드: "강한 에너지"가 아닌 "정밀·안정적인 에너지", 시네마틱·프리미엄 의료기기
- 실카피 사용 중: "Go Fine. Get Defined." / "Rubbing의 한계를 넘어서다" / 히어로 후보 카피 "2.45GHz, 정밀함을 정의하다"+"Power Beneath. Comfort Above."(택일 컨펌 대기)

## 절대 규칙 (위반 금지)
1. 라이브 사이트 쓰기 금지(GET만) — 어차피 이 환경은 finewave.kr/sherean.co.kr/힉스필드 전부 프록시 403 차단이라 접속 자체가 안 됨. 우회 시도 금지
2. WP 크리덴셜을 레포·문서·코드 어디에도 기재 금지 (이전 세션에서 클라이언트가 채팅으로 ID/PW를 보냈으나 사용·기록하지 않았음. 작업 완료 후 비번 변경 권고 상태)
3. 외부 JS 라이브러리 금지, 커스텀 클래스 fw- 접두사
4. 애니메이션 transform/opacity만 + prefers-reduced-motion 대응
5. 이미지 500KB 이하
6. 시안에는 "시안 DRAFT · 실사이트 아님" 배지 유지, 의료 표현은 "인허가 검수 후 확정" 주석 유지

## 클라이언트 확정사항
- 폰트: 메인 페이지 기준 전 페이지 통일 / 빔 깜빡임: 기존 이미지 보정 방식 승인됨
- 우측 플로팅: 문의사항+TOP 2개 확정 / FRCCS 잘림: 1920×1080, 캡처 수령 완료(오프셋 해법 A 우선 확정)
- 작업시간대: 평일 09-18시, 스테이징 없음, 반영 전 전체 백업 필수
- 일정: 시안 컨펌 오면 수정 반영 → 7/24(금) 완료 목표

## 미해결·대기 항목 (다음 작업 후보)
1. 클라이언트 시안 컨펌 대기 — 컨펌 오면: 히어로 카피 택일, 웨이브 3종 택1, NO CONTACT 강도(70/60/50) 확정, 카피 전체 실문구 교체
2. 힉스필드 이미지 6종 생성 결과 대기 — 오면 assets/ 파일명 그대로 교체(hero-key.png 등, index.html에 매핑 완료), 빔 프레임 재생성
3. 드라이브 장비사진(누끼/PSD) 폴더가 cccompanymaster@gmail.com에 미공유 — 공유되면 히어로 T6 케이스 A(진짜 레이어 분리) 업그레이드. 접근 가능한 폴더엔 임상사진(개인정보)뿐이라 사용 금지
4. 360° 제품 회전 — 회전 촬영컷 24~36장 수급 시 순수 JS 드래그 회전 구현
5. 정확한 폰트명·색상값 — 운영자가 site-audit.md 템플릿을 F12로 채우면 스니펫 변수 대입
6. sherean 캡처 수급 시 톤 1:1 정밀 매칭

## 작업 방식
- 수정 후 Playwright(chromium, /opt/pw-browsers/chromium-1194/chrome-linux/chrome, --no-sandbox, file:// 로드)로 스크린샷 찍어 preview-images/ 갱신 → PREVIEW.md 반영 → 커밋·푸시(git push -u origin claude/finewave-homepage-redesign-33wdsi)
- 클라이언트에게는 PREVIEW.md GitHub 링크로 전달:
  https://github.com/cccompanymaster/yeogin/blob/claude/finewave-homepage-redesign-33wdsi/output/mockup/PREVIEW.md
- PPTX 등 클라이언트 첨부가 오면 unzip해서 ppt/media/ 이미지 추출해 실측 근거로 사용

지금 할 일: [여기에 이번 세션에서 시킬 작업을 쓰세요]
```
