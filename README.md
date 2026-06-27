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
title: "글 제목"                  # 필수
description: "한 줄 요약"          # 필수 — 목록·상세·OG·RSS에 쓰임
category: "Mobile"               # 필수 — eyebrow(모노 대문자)로 표시
pubDate: 2026-06-18              # 필수 — YYYY-MM-DD
updatedDate: 2026-06-20          # 선택 — 수정일
author: "App Part"               # 선택 — 기본값 "AIE·App"
tags: ["offline", "sync"]        # 선택
draft: false                     # 선택 — true면 빌드에서 제외
featured: false                  # 선택 — true면 홈 상단 '최신 글' 자리에 고정
---
```

`featured`가 없으면 가장 최근 글이 자동으로 상단에 노출됩니다. 읽는 시간은 본문에서 자동 계산합니다(`src/utils.ts`).

홈 화면에는 **좌측 카테고리 필터**(글의 `category`에서 자동 집계)와 **그리드/리스트 뷰 토글**이 있습니다. 둘 다 클라이언트에서 동작하며, 선택한 뷰는 브라우저에 기억됩니다. 카테고리를 새로 만들고 싶으면 글 프론트매터의 `category` 값만 바꾸면 사이드바에 자동으로 추가됩니다.

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
