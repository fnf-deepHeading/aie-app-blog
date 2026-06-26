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
