// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // DCS AI K8s embedded 앱은 전용 서브도메인 루트에서 서빙됨 → base 는 루트('/')
  site: 'https://aie-app-blog.apps.dcsai.fnf.co.kr',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
