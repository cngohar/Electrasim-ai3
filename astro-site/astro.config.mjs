// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const SITE = 'https://electrasim.com';

export default defineConfig({
  site: SITE,
  outDir: '../dist-astro',
  build: {
    // The production CSP blocks inline styles, including stylesheets Astro
    // would normally inline below its size threshold.
    inlineStylesheets: 'never',
  },
  // Shiki emits inline color styles that are intentionally blocked by the
  // site's strict CSP. Blog code blocks use the external `.art-inner pre`
  // styles instead, and the current corpus does not use language-tagged fences.
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
  vite: {
    server: {
      // Allow sandboxed/remote dev previews (e.g. *.e2b.app) to reach the dev server.
      allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/admin'),
      customPages: [`${SITE}/app/`],
      serialize(item) {
        const url = item.url;
        if (url === `${SITE}/` || url === `${SITE}/app/`) {
          return { ...item, changefreq: 'weekly', priority: 1.0 };
        }
        if (url.includes('/blog/') && url !== `${SITE}/blog/`) {
          return { ...item, changefreq: 'monthly', priority: 0.7 };
        }
        if (url === `${SITE}/blog/`) {
          return { ...item, changefreq: 'weekly', priority: 0.8 };
        }
        if (url === `${SITE}/compare/`) {
          return { ...item, changefreq: 'monthly', priority: 0.8 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.6 };
      },
    }),
  ],
});
