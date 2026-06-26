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
- 업로드 도구: `scripts/upload-image.mjs` (`npm run upload:image -- <파일> [하위경로]`). DCS AI **Presigned URL API**(`/sign` → PUT) 사용, AWS SDK 직접 사용 금지. 의존성 없음.
- S3 key 규칙: `aie-app-blog/prd/<하위경로>/<슬러그>-<내용해시8>.<ext>` (버킷 `svc-fnf-ax-platform-pub-s3`).
- 마크다운에서는 업로드 후 출력된 공개 URL 을 `![](...)` 로 참조. Astro 는 외부 URL `<img>` 로 그대로 emit(빌드 메모리 영향 없음).
- **미해결 의존(담당자 필요)**: ① `S3_API_KEY` 발급(DCS AI QnA 채널) ② `svc-fnf-ax-platform-pub-s3` 객체가 직접 공개 URL(public-read)로 열리는지 확인. 만약 public-read 가 안 되면(정적 사이트는 view 시점에 presign 불가) 대안은 앱을 경량 Node 서버로 바꿔 S3 presigned GET 프록시를 두는 것(= embedded 풀스택 전환, 더 큰 변경).
- `.env`(S3_API_KEY)는 커밋 금지. `.gitignore` 에 포함됨.

## 글 추가
`src/content/posts/*.md(x)` 추가. 프론트매터 스키마는 `src/content.config.ts`가 검증(필수: title/description/category/pubDate). `draft: true`는 빌드 제외, `featured: true`는 홈 상단 고정. 자세한 건 `README.md`.

## 주요 파일
- `src/styles/global.css` — 디자인 토큰 + prose(본문) 스타일. **디자인 변경의 1차 진입점.**
- `src/consts.ts` — 사이트 제목/태그라인/네비.
- `src/content.config.ts` — 글 프론트매터 스키마.
- `src/pages/index.astro` — 홈(히어로 thesis + 최신글 + 아카이브).
- `src/pages/posts/[...slug].astro` — 글 상세(이전/다음 네비).
- `src/utils.ts` — 한글/영문 혼용 읽는 시간 추정.

## 실행
`npm run dev` (4321) / `npm run build` / `npm run preview`. 배포 전 `astro.config.mjs`의 `site`를 실제 도메인으로.

## 컨벤션
- 컴포넌트 스타일은 해당 `.astro`의 `<style>`에 스코프드로. 토큰·prose·공용 헬퍼(`.mono`/`.eyebrow`/`.wrap`)만 전역.
- 접근성 기본선 유지: skip-link, `:focus-visible` 아웃라인, `prefers-reduced-motion` 존중.
