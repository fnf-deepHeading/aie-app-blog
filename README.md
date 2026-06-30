# AIE·App 기술 블로그

AIE·App 파트의 기술 블로그. 우리가 부딪힌 문제, 내린 결정, 그리고 그 뒤에 남은 것들을 기록합니다.

[Astro](https://astro.build) 기반 정적 사이트입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 로 정적 빌드
npm run preview  # 빌드 결과 미리보기
```

Node 18+ 권장 (개발 환경 검증: Node 25 / npm 11).

## 글 쓰기

`src/content/posts/` 아래에 `.md` 또는 `.mdx` 파일을 추가하면 됩니다. 파일명이 곧 URL slug가 됩니다 (`my-post.md` → `/posts/my-post/`).

프론트매터 스키마 (`src/content.config.ts`에서 검증):

```yaml
---
title: "메인 제목 — 부제"          # 필수 — ' — '(공백+엠대시+공백) 뒤는 부제로 분리돼 다음 줄에 작게 표시 (아래 '작성 규칙' 참고)
description: "한 줄 요약"          # 필수 — 목록·상세·OG·RSS에 쓰임
category: "Agents"               # 필수 — eyebrow(모노 대문자)로 표시 + 사이드바 자동 집계
pubDate: 2026-06-18              # 필수 — YYYY-MM-DD
updatedDate: 2026-06-20          # 선택 — 수정일
author: "쿠키"                    # 선택 — 본인 닉네임. 기본값 "AIE·App"
tags: ["offline", "sync"]        # 선택
draft: false                     # 선택 — true면 빌드에서 제외
featured: false                  # 선택 — 폴백 핀(상단 고정은 보통 /admin 으로, 아래 참고)
---
```

읽는 시간은 본문에서 자동 계산합니다(`src/utils.ts`).

홈 화면에는 **좌측 카테고리 필터**(글의 `category`에서 자동 집계)와 **그리드/리스트 뷰 토글**이 있습니다. 둘 다 클라이언트에서 동작하며, 선택한 뷰는 브라우저에 기억됩니다. 카테고리를 새로 만들고 싶으면 글 프론트매터의 `category` 값만 바꾸면 사이드바에 자동으로 추가됩니다.

## ⚠️ 작성 규칙 (모르면 깨지는 특수 동작)

블로그에는 "그냥 텍스트"처럼 보여도 **자동으로 동작하는 규칙**이 몇 가지 있습니다. 모르고 쓰면 의도와 다르게 나옵니다.

### 1. 제목 — 메인/부제 자동 분리
제목에 **` — `(공백 + 엠대시 `—`(U+2014) + 공백)** 가 있으면, 그 **뒤가 부제**가 되어 카드·글 상세에서 **다음 줄에 작게·연하게** 렌더됩니다. 메타·브라우저 탭·OG에는 *전체 제목*이 그대로 쓰입니다.

- ✅ `title: "흩어진 맥락을 한 곳에서 엮기 — 다대다 업무를 주간보고로 합성하기"`
  → 1줄 "흩어진 맥락을 한 곳에서 엮기" / 2줄(작게) "다대다 업무를 주간보고로 합성하기"
- ❌ 일반 하이픈 `-` 이나 붙임표(공백 없는 `—`)는 **분리 안 됨.** 반드시 양옆 공백 + 엠대시(`—`).
- 부제가 필요 없으면 ` — ` 를 안 쓰면 됩니다(제목 한 줄).
- 엠대시 입력: macOS `⌥⇧-`, 또는 다른 제목에서 복사. (구현: `splitTitle()` in `src/utils.ts`)

### 2. 상단 고정(featured) 글
홈 최상단 '최신 글' 자리의 **단일 진실원천은 `src/featured.json`**(`{"slug":"..."}`). 보통 **`/admin` 페이지**에서 클릭으로 바꿉니다(자세히는 아래 '관리자' 절). 프론트매터 `featured: true` 는 폴백, 둘 다 없으면 가장 최근 글이 자동 노출.

### 3. 이미지는 git 에 넣지 말 것 → S3
본문 이미지는 **절대 레포에 커밋하지 말고** `npm run upload:image` 로 S3 에 올린 뒤 나온 URL 을 `![설명](URL)` 로 붙입니다(아래 '이미지' 절). 본문 이미지는 **클릭하면 자동 확대(라이트박스)** 됩니다 — 따로 설정할 것 없음.

### 4. mermaid 다이어그램
` ```mermaid ` 코드블록은 빌드 후 **실제 다이어그램(SVG)으로 자동 렌더**됩니다(테마는 사이트 무드에 맞춘 바이올렛). 일반 `text`/`js` 코드블록은 그냥 코드로 보입니다.

### 5. 디자인 톤은 토큰만 건드린다
색·글꼴·크기·간격은 전부 `src/styles/global.css` 의 `:root` CSS 변수(토큰). 톤을 바꾸려면 컴포넌트 CSS 가 아니라 **토큰**을 고칩니다. (표·목차(TOC, `##`·`###` 3개 이상 시)·읽는시간은 자동.)

## GitHub에서 수정·발행 (터미널 없이)

글은 **GitHub에서 바로 고치고**, 발행은 **대시보드 버튼 한 번**이면 됩니다. 로컬 개발환경 없이 가능합니다.

**1) 기존 글 수정**
- 레포 [`fnf-deepHeading/aie-app-blog`](https://github.com/fnf-deepHeading/aie-app-blog) 에서 `src/content/posts/<글>.md` 열기 → ✏️ 연필(Edit) → 고치고 **Commit changes**.
- 여러 파일을 한 번에 편하게 고치려면 레포 화면에서 `.`(마침표) 키 → 브라우저 VS Code(github.dev)가 열립니다.
- GitHub Desktop 앱으로 클론해서 고쳐도 됩니다.

**2) 새 글 추가**
- `src/content/posts/` 에서 **Add file → Create new file** → 이름 `my-post.md` (이 이름이 URL이 됨).
- 맨 위에 프론트매터(위 "글 쓰기" 템플릿) 붙이고 본문 작성 → Commit.

**3) 발행(반영)** — 둘 중 하나
- **대시보드**: [내 대시보드](https://dcsai.fnf.co.kr/agents/my-dashboards) → `aie-app-blog` → ··· 메뉴 → **재배포**. 1~2분 뒤 반영.
- **터미널**: `npm run deploy` (= `dcs-ai-cli app redeploy aie-app-blog`).

> ⚠️ 발행 시 서버가 글을 새로 빌드합니다. 프론트매터(예: `pubDate` 형식)가 깨지면 빌드가 실패할 수 있어요. 큰 수정이면 로컬에서 `npm run build` 로 한 번 확인하거나, 대시보드 **빌드 로그**로 실패 원인을 봅니다. 수정한 글은 `updatedDate` 도 같이 올려두면 좋습니다.

## 이미지 (S3)

**글(마크다운)은 git 에 두고, 이미지·미디어만 S3 에 올린다.** 텍스트는 가벼워서 git 이 가장 좋은 저장소지만(PR 리뷰·이력·타입 검증), 이미지는 repo 를 비대하게 만들고 배포(runtime fetch) 콜드스타트를 느리게 하기 때문이다.

```bash
# AWS SSO 로그인 (토큰 만료 시 1회 — 브라우저 열림)
aws sso login --profile aws-prcs-sso-dt

# 업로드 (별도 API 키 불필요)
npm run upload:image -- ~/Desktop/architecture.png offline-sync
```

출력된 URL 을 마크다운에 그대로 붙인다:

```markdown
![아키텍처 다이어그램](https://svc-fnf-dcs-ai-s3.s3.ap-northeast-2.amazonaws.com/aie-app-agent/blog/offline-sync/architecture-ab12cd34.png)
```

- 저장 위치: `s3://svc-fnf-dcs-ai-s3/aie-app-agent/blog/<하위경로>/<이름>-<해시>.<확장자>` (내용 해시로 캐시 안전·중복 방지, 영구 캐시 헤더).
- 인증: AWS SSO 프로파일 `aws-prcs-sso-dt`(Cookie 보유). **API 키 불필요.**
- 이 버킷 객체는 public-read 라 직접 URL 로 `<img>` 가 로드된다(확인 완료).
- 작은 인라인 다이어그램은 코드블록/SVG 로 글 안에 둬도 된다 — S3 는 사진·스크린샷 등 *바이너리* 용.

## 관리자 — 상단 고정 글 (`/admin`)

홈 최상단에 고정할 글은 **`/admin` 페이지**에서 클릭으로 바꿉니다(검색 비노출·네비 미표시).

- 글 목록에서 라디오로 고를 글 선택 → **저장** → GitHub 의 `src/featured.json` 한 파일만 커밋 → push 자동배포로 **~1분 뒤 반영**.
- **GitHub fine-grained PAT**(이 레포 `Contents: Read and write`)이 필요. 한 번 입력하면 그 브라우저(localStorage)에 보관되어 다음부턴 자동. 공용 PC면 작업 후 *토큰 지우기*.
- 정적 사이트라 "상단 글"은 빌드 시점에 박히므로, 이 선택은 커밋+재빌드를 거쳐 모든 방문자에게 반영됩니다(즉시 아님).

## 디자인

무드 가이드와 디자인 토큰은 [`CLAUDE.md`](./CLAUDE.md)와 `src/styles/global.css` 상단을 참고하세요. 색·타이포·간격은 모두 `:root` CSS 변수로 정의되어 있어, 토큰만 바꾸면 전체 톤이 따라옵니다.

## 구조

```
src/
  content/posts/      # 글 (마크다운)
  content.config.ts   # 콘텐츠 컬렉션 스키마
  consts.ts           # 사이트 제목·태그라인·네비
  styles/global.css   # 디자인 토큰 + 타이포 + prose 스타일
  layouts/Base.astro  # 공통 레이아웃(head/header/footer/skip-link)
  components/          # Header, Footer, PostCard, FormattedDate
  pages/
    index.astro       # 홈 (히어로 + 최신글 + 아카이브)
    about.astro       # 소개
    posts/[...slug].astro  # 글 상세 (이전/다음 네비 포함)
    rss.xml.js        # RSS 피드
public/
  favicon.svg
```

## 배포

`npm run build` 결과물(`dist/`)은 정적 파일이라 어디든 올릴 수 있습니다 — 사내 정적 호스팅(Quick Dashboard), S3, Netlify 등. `astro.config.mjs`의 `site` 값을 실제 배포 도메인으로 바꾼 뒤 빌드하세요 (canonical URL·sitemap·RSS에 반영됨).
