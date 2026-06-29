# AIE·App 기술 블로그 — 프로젝트 컨텍스트

AIE·App 파트의 팀 기술 블로그. Astro 기반 정적 사이트.

## 무엇/왜
- App 파트가 일하며 부딪힌 문제·결정·트레이드오프를 기록하는 작업 노트형 블로그.
- 파트 밖 사람도 읽음 — 잘된 사례뿐 아니라 되돌린 결정·틀린 가정도 쓴다는 톤.

## 스택
- **Astro 5** (정적 빌드). 콘텐츠 컬렉션(`glob` 로더)으로 마크다운 글 관리.
- 통합: `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`.
- 코드 하이라이트: Shiki `github-light` 테마.
- 프레임워크(React 등) 미사용 — 순수 Astro 컴포넌트 + 스코프드 CSS.

## 디자인 무드 (의도적으로 정한 것)
레퍼런스는 claude.com/blog 톤 — **따뜻한 아이보리 종이 + 클레이(테라코타) 포인트 + 명조 세리프 헤드라인 + 여백 넉넉한 에디토리얼 레이아웃**. 여기에 우리만의 한 끗:

- **시그니처 = 모노스페이스 메타.** eyebrow(카테고리)·날짜·태그·읽는 시간·네비 라벨을 전부 모노스페이스 대문자로 렌더 → "엔지니어링 보이스"를 따뜻한 종이 위에 얹어 App 파트 정체성을 표현. claude.com 복제가 아니라 우리 색.
- **타이포**: 본문 `Pretendard`(한글), 헤드라인 세리프 `Newsreader`(Latin) + `Gowun Batang`(한글), 메타·코드 `JetBrains Mono`.
- **포인트 컬러**: 테라코타 `#C25B3A` (`--clay`). claude의 #CC785C보다 약간 더 채도 있게.
- 모서리는 거의 직각(`--radius: 4px`), 헤어라인 구분선, 큰 세리프 헤드라인.
- 아카이브 글 목록의 일련번호(01, 02…)는 "시간순 아카이브"라는 실제 순서를 인코딩 — 장식이 아님.

모든 색·타이포·간격은 `src/styles/global.css`의 `:root` CSS 변수(토큰). 톤을 바꾸려면 코드가 아니라 **토큰을 고친다**.

## 홈 화면 동작
- **좌측 카테고리 사이드바**: 글의 `category`에서 빌드 시 자동 집계(글 수 표시). 클릭하면 클라이언트에서 필터링(페이지 리로드 없음). 모바일에선 상단 가로 스크롤 칩으로 변환.
- **그리드/리스트 뷰 토글**: 툴바 우측. 카드 한 벌(`PostCard`)이 조상 컨테이너 클래스(`.posts.is-grid` / `.posts.is-list`)에 따라 두 레이아웃으로 렌더 — 그리드는 2열 카드(최신 글은 전체 폭), 리스트는 번호 매긴 행. 선택한 뷰는 `localStorage`(`aie-view`)에 기억.
- 필터·토글 로직은 `src/pages/index.astro` 하단 `<script>`에 있음(빌드 시 번들됨).

## 이미지 저장 전략 (결정 A, 2026-06-26)
- **텍스트(마크다운)는 git, 이미지·미디어만 S3.** 텍스트는 글 수천 편이어도 수 MB라 git 이 최적(PR 리뷰·이력·content collection 타입검증). 이미지는 repo 비대화 + runtime-fetch 콜드스타트 지연의 주범 → S3 로 분리.
- 저장 위치: `s3://svc-fnf-dcs-ai-s3/aie-app-agent/blog/<하위경로>/<슬러그>-<내용해시8>.<ext>`.
- 업로드 도구: `scripts/upload-image.mjs` (`npm run upload:image -- <파일> [하위경로]`). **AWS CLI + SSO 프로파일 `aws-prcs-sso-dt`** 로 `aws s3 cp`. 별도 API 키 불필요. 의존성 없음. SSO 만료 시 `aws sso login --profile aws-prcs-sso-dt`(쿠키 직접).
- 서빙: `svc-fnf-dcs-ai-s3` 객체는 **public-read** → 직접 URL `https://svc-fnf-dcs-ai-s3.s3.ap-northeast-2.amazonaws.com/<key>` 로 `<img>` 로드(검증 완료 2026-06-26). Astro 는 외부 URL `<img>` 로 그대로 emit(빌드 영향 없음). 콘텐츠 해시 파일명 + `cache-control: immutable`.
- (참고) 같은 목적의 DCS AI Presigned URL API(`svc-fnf-ax-platform-pub-s3`, x-api-key)도 있으나, 정적 사이트엔 view 시점 presign 이 안 맞아 위 SSO+public-read 경로를 채택.

## 글 추가
`src/content/posts/*.md(x)` 추가. 프론트매터 스키마는 `src/content.config.ts`가 검증(필수: title/description/category/pubDate). `draft: true`는 빌드 제외, `featured: true`는 홈 상단 고정. 자세한 건 `README.md`.

## 주요 파일
- `src/styles/global.css` — 디자인 토큰 + prose(본문) 스타일. **디자인 변경의 1차 진입점.**
- `src/consts.ts` — 사이트 제목/태그라인/네비.
- `src/content.config.ts` — 글 프론트매터 스키마.
- `src/pages/index.astro` — 홈(히어로 thesis + 최신글 + 아카이브).
- `src/pages/posts/[...slug].astro` — 글 상세(이전/다음 네비).
- `src/utils.ts` — 한글/영문 혼용 읽는 시간 추정.

## 실행 / 배포
- 로컬: `npm run dev` (4321) / `npm run build` / `npm run preview`.
- **두 배포 타깃이 공존**한다. `astro.config.mjs` 가 `GITHUB_PAGES` 환경변수로 `site`/`base` 를 분기:
  - **GitHub Pages (공개·정본 공유 URL)** — `https://fnf-deepheading.github.io/aie-app-blog/`. main 에 push 하면 `.github/workflows/pages.yml` 이 리눅스 러너에서 빌드(`GITHUB_PAGES=true` → base `/aie-app-blog`)→ Pages 로 **자동 배포**. 글마다 직접 열리는 개별 URL(`/posts/<슬러그>/`)을 가져 외부 공유·북마크 가능. (레포는 이를 위해 public. org 가 free 플랜이라 private Pages 불가 → public 필수였음.)
  - **DCS AI K8s embedded (사내)** — `https://aie-app-blog.apps.dcsai.fnf.co.kr` (base `/`). main push 후 `npm run deploy`(= `dcs-ai-cli app redeploy aie-app-blog`) 또는 대시보드 ··· → 재배포. **단, DCS AI 대시보드(`/apps/aie-app-blog`)가 앱을 iframe 으로 감싸 서빙해 개별 글의 공유 URL 이 안 잡힌다**(서브도메인 직접 딥링크는 홈으로 리디렉션). → 공유가 필요하면 GitHub Pages URL 을 쓴다.
- **내부 링크는 전부 `withBase()`(`src/utils.ts`) 를 통과**해야 한다 — base 가 `/aie-app-blog` 든 `/` 든 양쪽에서 무404. 새 링크/자산 추가 시 raw `/...` 금지.
- **편집·발행 흐름(비개발자 포함)**: GitHub 웹/Desktop 에서 `src/content/posts/*.md` 수정·추가 → push 하면 Pages 는 자동 반영. 사내(dcsai)도 같이 올리려면 대시보드 재배포 버튼(또는 `npm run deploy`). `deploy.yml` 은 push 시 빌드검증 후 `DCSAI_API_KEY` 시크릿이 있으면 dcsai 재배포까지 트리거(미설정 시 건너뜀).

## 컨벤션
- 컴포넌트 스타일은 해당 `.astro`의 `<style>`에 스코프드로. 토큰·prose·공용 헬퍼(`.mono`/`.eyebrow`/`.wrap`)만 전역.
- 접근성 기본선 유지: skip-link, `:focus-visible` 아웃라인, `prefers-reduced-motion` 존중.
