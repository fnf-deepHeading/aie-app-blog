/**
 * 내부 링크에 사이트 base 경로를 붙인다.
 * GitHub Pages(프로젝트 페이지)는 `/aie-app-blog/` 하위에 서빙되므로
 * 모든 절대경로 링크는 이 헬퍼를 통과해야 한다. dcsai(base '/')에선 그대로.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : '/' + path);
}

/**
 * 제목을 " — "(엠대시) 기준으로 메인/부제로 나눈다 (표시용).
 * frontmatter의 title 전체 문자열은 그대로 두고(메타·SEO용), 화면에선 두 줄로.
 * 구분자가 없으면 sub=null.
 */
export function splitTitle(title: string): { main: string; sub: string | null } {
  const sep = ' — ';
  const i = title.indexOf(sep);
  if (i === -1) return { main: title, sub: null };
  return { main: title.slice(0, i), sub: title.slice(i + sep.length) };
}

/** 한글/영문 혼용 본문의 대략적 읽는 시간(분). */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  // 코드/기호 제외하고 한글 글자수 + 영단어수로 추정
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/[#>*`_\-]/g, ' ');
  const hangul = (text.match(/[가-힣]/g) || []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) || []).length;
  // 한글 ~500자/분, 영단어 ~200/분
  const minutes = Math.ceil(hangul / 500 + words / 200);
  return Math.max(1, minutes);
}
