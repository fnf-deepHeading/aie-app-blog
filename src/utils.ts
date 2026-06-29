/**
 * 내부 링크에 사이트 base 경로를 붙인다.
 * GitHub Pages(프로젝트 페이지)는 `/aie-app-blog/` 하위에 서빙되므로
 * 모든 절대경로 링크는 이 헬퍼를 통과해야 한다. dcsai(base '/')에선 그대로.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : '/' + path);
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
