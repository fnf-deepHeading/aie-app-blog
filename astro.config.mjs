// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// 배포 타깃을 환경변수로 분기한다.
//  - 기본(dcsai K8s embedded): 전용 서브도메인 루트에서 서빙 → base '/'
//  - GitHub Pages(프로젝트 페이지): GITHUB_PAGES=true → '/aie-app-blog/' 하위 서빙
// 내부 링크는 모두 withBase()(src/utils.ts)를 거쳐 두 환경 모두에서 정상 동작.
const PAGES = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site: PAGES
    ? 'https://fnf-deepheading.github.io'
    : 'https://aie-app-blog.apps.dcsai.fnf.co.kr',
  base: PAGES ? '/aie-app-blog' : '/',
  integrations: [
    mdx(),
    // /admin 은 관리자 전용 — 검색 색인/사이트맵에서 제외
    sitemap({ filter: (page) => !/\/admin\/?$/.test(page) }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
