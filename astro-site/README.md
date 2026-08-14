# ElectraSim Marketing Site

This npm workspace contains the static Astro marketing, guide, comparison, legal, and blog routes. The root build merges its output with the Vite simulator under one Cloudflare Pages `dist/` directory.

Run commands from the repository root so the shared lockfile remains authoritative:

```bash
npm install
npm run dev:marketing
npm run build:astro
npm run build
npm run preview
```

Content lives in `src/content/`, route components in `src/pages/`, shared view components in `src/components/`, and external stylesheets in `src/styles/`. Blog pagination and tag generation are centralized in `src/lib/blog.ts`; official-source comparison data and its review date live in `src/lib/compare.ts`.

Marketing colours are shared CSS variables in `src/styles/global.css`. The same-origin `public/js/theme.js` bootstrap applies and persists the Light, Dark, or System-resolved appearance before paint. Keep page-specific styles on those variables so every route remains usable in both themes.

The site is fully static. Do not add inline executable scripts or styles: production uses a strict self-only Content Security Policy from the root `public/_headers` file. JSON-LD data blocks are the only inline script exception. Competitor claims on `/compare/` must stay dated, task-based, and linked to official first-party sources.
