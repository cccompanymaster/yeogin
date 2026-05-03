# Vercel 배포 가이드

## 사전 준비
- GitHub 계정으로 Vercel 가입: https://vercel.com (5초)
- 본 저장소(`cccompanymaster/yeogin`) 접근 권한

## 배포 단계

### 1. 프로젝트 가져오기
1. https://vercel.com/new 접속
2. **Import Git Repository** 에서 `cccompanymaster/yeogin` 선택 → **Import**
   - 저장소가 안 보이면 우측 **Adjust GitHub App Permissions**로 권한 부여

### 2. 빌드 설정
대부분 자동으로 잡힙니다. 다음 항목만 확인:
- **Framework Preset**: `Next.js` (자동)
- **Build Command**: `npm run build` (자동)
- **Branch**: `claude/korean-review-site-U9xDM` ← Production Branch에서 변경 가능
  - 또는 Settings → Git → Production Branch에서 나중에 변경

### 3. 환경 변수 (Environment Variables)
**Add** 버튼으로 다음 2개 추가 (Production / Preview / Development 모두 체크):

| Key | Value |
|---|---|
| `DATABASE_URL` | `file:./dev.db` |
| `SESSION_SECRET` | (32자 이상 아무 랜덤 문자열) |

선택사항:
| Key | Value |
|---|---|
| `ADMIN_EMAILS` | `demo@yeogin.kr` (관리자 이메일 화이트리스트) |

### 4. Deploy 클릭
- 빌드 1~2분
- 완료 후 발급되는 URL 예: `https://yeogin-xxxx.vercel.app`

## 데모 계정
- 사용자: `demo@yeogin.kr` / `demo1234`
- 광고주: `biz@yeogin.kr` / `biz1234`
- 관리자: `demo@yeogin.kr` 으로 로그인 후 `/admin` 접근

## 알아둘 점

### 데이터 휘발성
- Vercel 서버리스 함수는 `/tmp` 외 파일시스템이 읽기전용입니다.
- 빌드 시 `prisma/dev.db`를 시드하여 패키지에 포함시키고, 런타임에 `/tmp`로 복사합니다.
- **사용자가 가입하거나 캠페인을 등록한 데이터는 인스턴스가 재시작되면 사라집니다.**
- 영구 보관이 필요하면 **Neon / Vercel Postgres / Turso** 등 외부 DB로 전환하세요.

### 외부 DB로 전환 시
1. Neon(https://neon.tech) 또는 Vercel Postgres에서 DB 생성, `DATABASE_URL` 복사
2. Vercel 환경 변수의 `DATABASE_URL`을 새 값으로 교체
3. `prisma/schema.prisma`의 `provider`를 `"postgresql"`로 변경
4. 재배포
