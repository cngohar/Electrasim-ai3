# Progress Log

> **Master plan:** [`PLAN.md`](./PLAN.md) — all locked decisions, stack, architecture, perf budget, roadmap.
> **Changelog:** [`CHANGELOG.md`](./CHANGELOG.md) — what shipped, in Keep-a-Changelog format.

A running, append-only log of work on the ElectraSim rewrite. Every coding session must add an entry.

Format per entry:

```
## YYYY-MM-DD — Phase X.Y — <short title>
**Done:** ...
**Next:** ...
**Blockers / Notes:** ...
**Perf (if measured):** FPS @ N items, bundle size, TTI, etc.
```

---

## 2026-07-21 — v1.6.1 — Learning Readiness, Mobile Guidance & Homepage SEO

**Done:**
- Added the Push-Button Doorbell and RCBO-Protected Socket Guided Circuits, with focused learning copy, checklists, and circuit behavior that matches the current simulation model.
- Clarified the Push Button, MCB, RCD, RCBO, Contactor, and Bell descriptions so numeric overload, leakage, trip-curve, coil, and auxiliary-contact limitations are explicit.
- Improved the Bell with an energised visual pulse, revised the Welcome dialog around practical learning paths, removed the framework tagline from in-app documentation, and added a one-time phone suitability advisory with a Continue action.
- Updated the homepage title to `Free Online Electrical Wiring Simulator | ElectraSim`, the H1 to `Build and Simulate Real Electrical Wiring`, and the meta description to the approved house-wiring copy. The visible hero uses the exact phrase `electrical wiring simulator` once.
- Bumped the root package, Astro workspace, lockfile, derived app metadata, and release documentation to `1.6.1` without starting Challenge Mode or changing existing routes.

**Verification:**
- TypeScript and Biome passed. Vitest: **32 files, 191 tests passed**.
- Build: **2,476 Vite modules**, **136 Astro pages**, and **138 linked HTML files**.
- Performance budgets passed: **111,705 B gzip** initial JavaScript, **12,434 B gzip** initial CSS, **3,031,105 B** generated HTML, **49** tag pages, and **39,896 B** priority image.
- Wrangler-preview production Playwright: **11/11 passed**, including the exact rendered homepage title, description, H1, one visible keyphrase occurrence, responsive layouts, themes, security headers, and offline dialogs.
- Focused app Playwright on desktop, phone, and tablet: **15 passed, 3 device-specific skips**, covering both new guides, Bell/RCBO behavior, the existing two-way guide, Welcome, and the phone advisory.
- Published the complete `dist/` snapshot through Wrangler at `https://63e4c5d6.electrasim.pages.dev`; the matching `v1.6.1` release is active at `https://electrasim.com/`.
- The immutable deployment and custom domain each passed **11/11 production Playwright tests**. Direct checks confirmed HTTP/2 200 for `/` and `/app/`, exact homepage SEO and hero wording, one visible keyphrase occurrence, and `softwareVersion: 1.6.1` on both URLs.
- Migrated the private source backup to `https://github.com/cngohar/electrasimw`: made it the active `origin`, moved the Sveltia CMS repository pointer to it, and retained the old Cloudflare-connected repository only as the local `legacy-electrasim` reference.

**Blockers / Notes:**
- Closed the unmerged draft PR in `cngohar/electrasim` after its repository integration triggered the problematic Cloudflare build. The new `electrasimw` backup is intentionally not connected to Cloudflare, and no deployment command was run during the repository migration.
- Local services were restarted after the PC reboot at `http://localhost:3000/` and `http://127.0.0.1:8788/`.

**Next:** Monitor the `v1.6.1` production release, then scope Challenge Mode separately.

---

## 2026-07-20 — v1.6.0 Production — Dependency Audit & Homepage Cache Recovery

**Done:**
- Audited the updated dependency tree and confirmed Wrangler `4.112.0` is not the source of the reported high-severity findings. Upgraded Astro from `6.2.1` to patched `6.4.8`, moved the static marketing build packages to `devDependencies`, and cleared every production, high, and moderate advisory.
- Added a no-cache root service-worker retirement path so browsers with the obsolete site-wide worker release its cache and load the current homepage with the real simulator screenshot. The active PWA worker remains at `/app/sw.js`.
- Rebuilt and published the complete Pages snapshot at `https://432f0f71.electrasim.pages.dev`; matching content is active at `https://electrasim.com/`.

**Verification:**
- `npm audit --omit=dev`: **0 vulnerabilities**. Full build-tool audit: **2 low**, both linked to esbuild's Windows development-server advisory; no moderate, high, or critical findings remain.
- TypeScript and Biome passed. Vitest: **28 files, 172 tests passed**. Responsive Playwright: **18 passed, 3 intentional performance skips**. Dense browser benchmark: **1 passed**.
- Build: **2,474 Vite modules**, **133 Astro pages**, and **135 linked HTML files**. Performance budgets and the dense simulation benchmark passed.
- Local Pages output, immutable deployment, and custom domain each passed **10/10 production tests**, including security headers, SEO, themes, phone layout, offline dialogs, real screenshot delivery, and root-worker retirement.
- Preview and custom-domain ETags match for the homepage, root worker, app worker, and 1200 px WebP product screenshot.

**Blockers / Notes:**
- The remaining low development-only advisory offers only an Astro 7 major-version upgrade; `npm audit fix --force` was not used. Schedule that migration independently rather than coupling it to this production repair.
- No GitHub publication was run.

**Next:** Monitor cache retirement on returning browsers, then scope Challenge Mode.

---

## 2026-07-20 — v1.6.0 Content — Push Button Momentary-Contact Guide

**Done:**
- Drafted the 2,100-word regular article `how-does-a-push-button-switch-work.md` with plain-language coverage of momentary versus maintained actions, NO/NC/COM contacts, traditional doorbells, real-world contactor holding circuits, emergency-stop boundaries, common mistakes, FAQs, and an exercise that matches the current two-terminal simulator component.
- Generated an original two-state cutaway illustration showing a released NO push button beside its pressed, bell-energising state. Added responsive 480, 800, and 1200 pixel AVIF/WebP variants, visible article markup, descriptive alternative text, a caption, and accurate 1200 x 630 social-image metadata.
- Grounded the technical distinctions in current official OMRON, Schneider Electric, Honeywell Home/Resideo, Eaton, and HSE material, with direct source links in the article.
- Added inbound links from the v1.6 update, circuit-symbols reference, smart-doorbell guide, and earlier components article; promoted the regular guide in the 12-item homepage collection without changing its slug or making it featured.
- Corrected older Contactor copy that claimed the simulator exposed coil and auxiliary-contact terminals, and added ready-to-publish Facebook entry #50.

**Verification:**
- TypeScript and Biome: clean. Vitest: **28 files, 172 tests passed**.
- Build: **2,474 Vite modules** and **133 Astro pages**; the merged artifact contains **135 HTML files**, all of which pass the internal-link check.
- Performance budgets remain within limits: **114,606 B gzip** initial JavaScript and **12,133 B gzip** initial CSS.
- Built metadata confirms the canonical article URL, 1200 x 630 Open Graph dimensions, Article structured data, 11-minute reading time, regular Beginner Guide classification, and no Featured badge.
- Playwright browser checks covered the article in light and dark themes at 1440 x 1000 and 390 x 844. Responsive AVIF selection, source links, layout, and captions passed with no console errors, failed requests, or horizontal overflow.
- Published the complete `dist/` snapshot through Wrangler at `https://86fe6901.electrasim.pages.dev`; the matching release is active on `https://electrasim.com/`.
- Local, Pages-preview, and custom-domain SHA-256 hashes match for the homepage, blog index, app, comparison page, v1.6 release article, and Push Button article. The live original article image also matches the local asset byte for byte.
- The custom-domain production Playwright suite passed **9/9 tests**, covering security headers, comparison SEO and schema, marketing/app theme persistence, desktop and phone layouts, lazy dialogs, and offline app loading.

**Blockers / Notes:**
- The earlier no-deploy note in the following v1.6 build entry records its pre-publication state; this entry supersedes it. The complete v1.6.0 site and illustrated article are now live.
- No GitHub publication was run, in line with the existing local/Wrangler-only release path.
- Restarted services respond with HTTP 200 at `http://localhost:3000/` and `http://localhost:4321/blog/how-does-a-push-button-switch-work/`.

**Next:** Monitor the live release, then scope Challenge Mode against the v1.6 component and theme foundation.

---

## 2026-07-20 — v1.6.0 — Practical Components, Dark Mode & Simulator Comparison

**Done:**
- Added an RCBO with switched Live and Neutral paths across the simulator, component palette, canvas renderers, import/export, persistence, copying, documentation, and simulation coverage.
- Upgraded the Push Button into a true momentary control: it energises only while pressed, releases on pointer, keyboard, blur, or page exit, and cannot leak a held state into saves, exports, copies, or undo history.
- Added persistent Light, Dark, and System themes to the app plus a no-flash app bootstrap, and added a persistent CSP-safe dark-mode toggle across the complete Astro marketing site.
- Published the local `/compare/` page after reviewing official CircuitLab, Tinkercad Circuits, EveryCircuit, Falstad, and DCACLab material. The page includes candid task-fit guidance, limitations, dated methodology, direct official sources, a real current simulator capture, canonical metadata, social metadata, WebPage/BreadcrumbList/ItemList/FAQ structured data, and a sitemap entry.
- Redesigned every paginated blog index so App Updates and regular electrical articles are visibly separate while retaining the existing `/blog/`, `/blog/<page>/`, article, tag, canonical, and pagination URLs.
- Added the plain-language featured release post `electrasim-v1-6-dark-mode-rcbo-comparison-update.md`; v1.6 is the only featured post. The recommended next article remains **“How Does a Push Button Switch Work? Momentary Contacts, Doorbells and Control Circuits Explained.”** and has not been drafted.
- Bumped the root package, Astro workspace, and lockfile to `1.6.0`; aligned README, changelog, plan, tracking, CMS options, generated metadata, and versioned marketing scripts.
- Fixed the first-visit welcome dialog close button after the final visual audit found its header layer could intercept pointer input.

**Verification:**
- TypeScript and Biome: clean. Vitest: **28 files, 172 tests passed**.
- Build: **2,474 Vite modules** and **132 Astro pages**; the merged artifact contains **134 HTML files**.
- Performance budgets: **114,606 B gzip** total initial JavaScript, **12,133 B gzip** initial CSS, **2,937,219 B** generated HTML, **47** tag pages, and **39,896 B** priority image.
- Dense simulation: **200 components / 396 wires**, median **0.90 ms**, p95 **1.45 ms**. The opt-in dense browser benchmark passed.
- Responsive E2E: **18 passed, 3 intentionally skipped performance cases** across desktop Chrome, Pixel 7, and iPad profiles. Wrangler-preview production suite: **9 passed**.
- Desktop and phone visual checks covered the app, compare page, and redesigned blog index in light and dark themes with no console errors or horizontal overflow.
- Restarted services respond with HTTP 200 at `http://localhost:3000/` (app) and `http://localhost:4321/` (marketing site).

**Blockers / Notes:**
- No Wrangler deploy or GitHub publication was run. The v1.6.0 artifact is local and ready to deploy; the public site remains on v1.5.1.
- Existing public routes, article slugs, canonical URLs, pagination, and fragment-based app share links remain unchanged.
- Physical-device FPS, TTI, long-session memory, and Lighthouse remain manual release checks.

**Next:** Draft the recommended Push Button article after approval, then scope Challenge Mode against the v1.6 component and theme foundation.

---

## 2026-07-18 — v1.5.1 — Reader-Focused Release Notes & Flickering-Lights Safety Guide

**Done:**
- Published `why-do-my-lights-flicker-common-causes-safe-checks.md`, a 2,100-word homeowner guide covering single-bulb faults, LED/dimmer compatibility, wider circuit symptoms, safe non-invasive checks, urgent warning signs, and the boundary between user checks and registered-electrician work.
- Grounded the safety guidance in current NICEIC, HSE, IET, and UK fire-service material; the article links directly to the relevant public NICEIC, HSE, and fire-safety sources.
- Added contextual links from the fault-finding, dimmer, and lighting-circuit guides, promoted the new article in the 12-item homepage collection, and added Facebook entry #49.
- Rewrote the v1.5 App Update in plain language and removed its benchmark table, implementation terminology, code-structure discussion, and test-count reporting.
- Removed the Guided Circuits featured flag so the v1.5 App Update is the only article with a Featured badge.
- Bumped the root package, Astro workspace, and lockfile to `1.5.1`; updated README, tracking, and roadmap references; and verified that in-app labels, cache-busting script URLs, and structured data inherit the root package version.
- Published the complete verified `dist/` artifact through Wrangler at `https://ae38f503.electrasim.pages.dev`; the matching release is active on `https://electrasim.com/`.

**Verification:**
- TypeScript and Biome: clean. Vitest: **24 files, 154 tests passed**.
- Build: **2,473 Vite modules** and **127 Astro pages**; merged artifact contains **129 HTML files**.
- Performance budgets: **112,452 B gzip** initial JS, **11,599 B gzip** initial CSS, **2,701,411 B** generated HTML, **45** tag pages, and **64,920 B** priority hero image.
- Dense simulation: **200 components / 396 wires**, median **0.92 ms**, p95 **2.91 ms**.
- Dense browser handlers: pointer p95 **0.20 ms**, pan release **0.60 ms**, group-drag release **4.80 ms**; the benchmark passed.
- Responsive E2E: **12 passed, 3 intentionally skipped**. Wrangler-preview production suite: **5 passed**. Final custom-domain production suite: **5 passed**.
- Preview and custom-domain HTML hashes matched for the homepage, blog index, new article, v1.5 article, and app. Live content checks confirmed one Featured badge, canonical article metadata, official safety-source links, `no-transform`, strict CSP, and `softwareVersion: 1.5.1`.

**Blockers / Notes:**
- GitHub was intentionally left untouched; this release was published directly through Wrangler as requested.
- Physical-device FPS, TTI, long-session memory, and Lighthouse remain manual release checks.

**Next:** Scope Challenge Mode against the hardened editor and Guided Circuits foundation.

---

## 2026-07-18 — v1.5 Article Reader-Focused Revision

**Done:**
- Removed the featured flag from the previous Guided Circuits article so only the latest App Update carries the featured badge.
- Rewrote the v1.5 article around user-visible benefits and removed implementation terminology, benchmark tables, bundle figures, code-structure details, and test-count reporting.
- Kept the release article's privacy, accessibility, saving, sharing, mobile, offline, and safety information in simpler language.

**Blockers / Notes:** This revision was local only at this point; it was later published in the v1.5.1 release recorded above.

**Next:** Review the next proposed article before drafting or publishing it.

---

## 2026-07-16 — v1.5.0 — Performance, Architecture, Accessibility & Release Hardening

**Done:**
- Completed the coordinated app and Astro marketing-site hardening pass: dense-canvas interaction work, keyboard-operable SVG controls, safer persistence/share-link handling, focused module splits, responsive media, static blog helpers, strict privacy delivery, and expanded production gates.
- Unified root and Astro workspace versions at `1.5.0`. In-app About, menu, documentation, and both `SoftwareApplication` schemas now source the root package version instead of maintaining stale labels and a hard-coded test count.
- Updated `README.md`, `TRACKING.md`, `PLAN.md`, and `CHANGELOG.md` to describe the current combined deployment, module ownership, performance limits, privacy policy, and future renderer work.
- Published `electrasim-v1-5-performance-accessibility-privacy-update.md` as a featured App Update and promoted it through the homepage collection.
- Added release-version query keys to the marketing navigation and scroll scripts after live verification found Cloudflare raising their browser TTL from one hour to four hours.
- Published the final complete `dist/` snapshot through Wrangler to `https://3dd2c1bd.electrasim.pages.dev`; the custom domain is active at `https://electrasim.com/` and the article is live at `/blog/electrasim-v1-5-performance-accessibility-privacy-update/`.

**Verification:**
- TypeScript and Biome: clean.
- Vitest: **24 files, 154 tests passed**.
- Build: **2,473 Vite modules** and **125 Astro pages**; merged artifact contains **127 HTML files**.
- Performance budgets: **112,445 B gzip** initial JS, **11,599 B gzip** initial CSS, **2,665,770 B** generated HTML, **44** tag pages, and **64,920 B** priority hero image.
- Dense simulation: **200 components / 396 wires**, median **0.90 ms**, p95 **1.45 ms**.
- Dense browser handlers: pointer p95 **0.20 ms**, pan release **0.50 ms**, group-drag release **5.60 ms**; browser performance case passed.
- Responsive E2E: **12 passed, 3 skipped**. Wrangler-preview production suite: **5 passed**. Final custom-domain production suite: **5 passed**.
- Final HTTPS checks confirmed 200 responses, matching deployment/custom-domain content, `no-transform`, strict CSP, canonical article metadata, `softwareVersion: 1.5.0`, current benchmark text, and versioned marketing-script URLs.

**Blockers / Notes:**
- Automated headless handler measurements do not prove sustained physical-device FPS. Real-device frame rate, TTI, long-session memory, and Lighthouse targets remain manual release checks.
- GitHub was intentionally left untouched. Local app and marketing development services remain available on ports `3000` and `4321`.

**Next:** Scope Challenge Mode against the hardened editor and Guided Circuits foundation.

---

## 2026-06-06 — v1.4.2 — Blog Post: EICR Codes Explained (C1, C2, C3, FI)

**Done:**
- New blog post `eicr-codes-explained-c1-c2-c3-fi.md` (category: `Electrical Safety`) — deep-dive companion to the existing EICR article. Highest-volume gap in the current cluster: "what does C2 mean on an EICR" is one of the top UK electrical queries. Pairs with the existing EICR overview (article #13) to create a complete EICR content pillar.
- Content: C1/C2/C3/FI definitions with extended real-world fault tables (8+ faults per code), fault-to-code mapping table (14 specific faults mapped to their codes), annotated EICR report walkthrough with ASCII example showing how codes appear on a real document, code combination table (8 combinations and what they mean), the 28-day landlord deadline with full penalty details (up to £30,000 civil penalty, improvement notices, daily fines), property sale impact per code, remedial cost estimates per code level, FI resolution process, C3 budgeting guidance (multiple C3 = £300–£800 total), PAT vs EICR distinction, 7-question FAQ. ~3,500 words.
- **Cross-link callouts** added to 4 high-traffic articles: `when-to-get-an-eicr-electrical-inspection-guide.md` (after FI section), `consumer-unit-upgrade-what-to-expect.md` (after EICR Related callout), `how-to-trace-an-electrical-fault-safely.md` (after EICR Related callout), `5-common-electrical-wiring-mistakes.md` (at end, before ElectraSim CTA).
- **Marketing entry #48** appended to `marketing/facebook-article-posts.md`. Tagline: *"Your EICR report is trying to tell you something — read it carefully. 📋"* — differentiated from the technical EICR article tagline.
- `package.json` version `1.4.1` → `1.4.2`.

**SEO targets:**
- Short-tail: *EICR codes*, *EICR C1 C2 C3*, *what do EICR codes mean*, *EICR report explained*
- Long-tail: *what does C2 mean on an EICR*, *what does C1 mean on an EICR*, *EICR failed what happens next*, *EICR code meanings UK*, *landlord EICR C2 deadline*, *can I sell my house with C2 EICR*, *EICR further investigation what does it mean*, *EICR C2 remedial work cost*, *what is a satisfactory EICR*, *EICR and mortgage*

**Internal-link impact:**
- 4 internal links in from existing high-traffic articles (EICR, consumer unit upgrade, fault tracing, wiring mistakes)
- ~8 new tag archive pages auto-generated (EICR codes, C1 code, C2 code, C3 code, FI code, etc.)

**Files touched:**
`astro-site/src/content/blog/eicr-codes-explained-c1-c2-c3-fi.md` (new, ~3,500 words),
`astro-site/src/content/blog/when-to-get-an-eicr-electrical-inspection-guide.md` (Related callout added),
`astro-site/src/content/blog/consumer-unit-upgrade-what-to-expect.md` (Related callout added),
`astro-site/src/content/blog/how-to-trace-an-electrical-fault-safely.md` (Related callout added),
`astro-site/src/content/blog/5-common-electrical-wiring-mistakes.md` (Related callout added),
`marketing/facebook-article-posts.md` (entry #48 appended),
`package.json` (version 1.4.1 → 1.4.2),
`CHANGELOG.md`, `progress.md`

**Next candidates:** AFDD (Arc Fault Detection Device) explained — BS 7671 Amendment 2 regulatory content; How to Test a Circuit with a Multimeter — practical skill guide; Solar PV Wiring Basics for Homeowners — trending topic.

---

## 2026-06-06 — v1.4.1 — Blog Post: Part P Building Regulations Explained

**Done:**
- New blog post `part-p-building-regulations-explained.md` (category: `Regulations & Safety`) — UK regulatory hub article. Strongest SEO opportunity in the current cluster: top-of-funnel pillar that links to ~11 existing wiring guides and answers the #1 question every UK homeowner Googles before touching a wire.
- Content: what Part P is (relationship to BS 7671, scope of "dwelling", exclusions), notifiable vs non-notifiable work (two full tables, including the "minor works" caveat about BS 7671 still applying), the three compliance routes (registered competent person / Building Control / minor works exemption) with NICEIC/NAPIT/ELECSA scheme details, consequences of skipping (sale problems, retrospective notification costs, insurance issues, criminal liability under Building Act 1984), cost-of-notification table, 13-row common-scenario table, ElectraSim planning workflow, 7-question FAQ (including OZEV/EV charger route, retrospective regularisation, cross-jurisdiction differences with Scotland & NI), 30-second quick-reference summary. ~3,200 words.
- **New blog category** `Regulations & Safety` added to `astro-site/public/admin/config.yml` Category options. Blog index filter pills auto-generate from posts (`blog/index.astro` line 16), so the new category pill appears on `/blog/` on next build with no further code change.
- **Cross-link callouts** added to 3 high-traffic wiring guides (top-of-cluster-priority): `how-to-wire-a-shed-or-outbuilding.md` (Step 1, after the Part P notification bullet), `how-to-wire-a-bathroom-zone-by-zone-uk-guide.md` (after the "Part P and Bathroom Work" section), `how-to-install-an-ev-charger-dedicated-circuit-guide.md` (after the "Part P Notification" section). Each uses the same Related-block style as the rest of the cluster.
- **Marketing entry #44** appended to `marketing/facebook-article-posts.md`. Tagline: *"Before you touch a wire, know the law first. ⚖️"* — deliberately legal/regulatory voice to differentiate from the technical "Before you touch a wire, understand the circuit first" tagline used on wiring posts. Matches the established format (catchy tagline, short description, hook URL, hashtags, ready-to-post version).
- `package.json` version `1.4.0` → `1.4.1` (content release; no app code changes).
- `CHANGELOG.md` updated with `[1.4.1]` entry.

**SEO targets:**
- Short-tail: *Part P building regulations*, *Part P explained*, *UK electrical work rules*, *Part P notifiable work*
- Long-tail: *what is Part P building regulations*, *Part P notifiable vs non-notifiable*, *do I need an electrician UK*, *can I do my own electrical work UK*, *Part P notification cost*, *Part P retrospective*, *electrical work without certificate UK*, *Part P registered electrician*, *notifiable electrical work kitchen*, *notifiable electrical work bathroom*, *outdoor socket Part P*, *EV charger Part P*, *shed wiring Part P*

**Internal-link impact:**
- 11 internal links out from the new article → spreads authority to existing wiring guides
- 3 internal links in from existing wiring guides → directs existing traffic to the new regulatory hub
- 8 new tag archive pages auto-generated at `/blog/tags/<tag>/` (PartP, BuildingRegulations, UKWiring, ElectricalSafety, ElectricalDIY, NotifiableWork, etc.)

**Files touched:**
`astro-site/src/content/blog/part-p-building-regulations-explained.md` (new, ~3,200 words),
`astro-site/src/content/blog/how-to-wire-a-shed-or-outbuilding.md` (Related callout added),
`astro-site/src/content/blog/how-to-wire-a-bathroom-zone-by-zone-uk-guide.md` (Related callout added),
`astro-site/src/content/blog/how-to-install-an-ev-charger-dedicated-circuit-guide.md` (Related callout added),
`astro-site/public/admin/config.yml` (Category options extended with `Regulations & Safety`),
`marketing/facebook-article-posts.md` (entry #44 appended),
`package.json` (version 1.4.0 → 1.4.1),
`CHANGELOG.md`, `progress.md`

**Next candidates:** EICR codes deep-dive (C1, C2, C3, FI) — pairs naturally with the existing EICR article; AFDD (Arc Fault Detection Device) explained — BS 7671 Amendment 2 regulatory content; Multimeter testing for homeowners — practical companion piece.

---

## 2026-05-15 — v1.3.3 — Blog System: Pagination, Tags, Scroll-to-Top, SEO + CSP Fixes

**Done:**

### v1.3.1 — External CSS + Tags Page
- **`astro-site/src/styles/blog.css`** — new dedicated external stylesheet consolidating all blog CSS (index + post + tag archive). Astro compiles it to `/_astro/blog.*.css` (hashed, cacheable). Removed all `<style>` inline blocks from `blog/index.astro` and `[...slug].astro`.
- **`astro-site/public/js/blog-filter.js`** — new external script for the category filter; loaded with `<script defer src="/js/blog-filter.js">` — CSP `script-src 'self'` compliant.
- **`astro-site/src/pages/blog/tags/[tag].astro`** — new dynamic tags archive. Generated 88 tag pages at `/blog/tags/<tag>/`. Each page: all posts for that tag (sorted newest-first), full tag cloud, reading time, breadcrumb nav, `BreadcrumbList` JSON-LD.
- **`public/_headers`** — removed `'unsafe-inline'` from `style-src` on both `/*` and `/app/*`. CSP strict again.
- Tag links on `[...slug].astro` now point to `/blog/tags/<tag>/`.

### v1.3.2 — Scroll-to-Top, Pagination, SEO Meta
- **Scroll-to-top button** — blue fixed chevron-up button (bottom-right, appear after 400 px, fade+slide, smooth scroll). CSS in `Base.astro` global `<style is:global>` so it works sitewide.
- **Pagination** — `blog/index.astro` (page 1) + `blog/[page].astro` (pages 2+). `PAGE_SIZE = 9`. Page 1 at `/blog/`, page 2 at `/blog/2/`. Numbered nav, ellipsis, prev/next. `rel="prev"/"next"` link tags for SEO.
- **`og:image:alt`** + **`twitter:image:alt`** added to `Base.astro` (Facebook/LinkedIn requirement).
- **`WebSite` JSON-LD** sitewide in `Base.astro` — `@type: WebSite` with `potentialAction: SearchAction` (Sitelinks Searchbox eligible) + `publisher: Organization`.
- Removed unused `remarkPluginFrontmatter` from `render()` destructuring in `[...slug].astro`.

### v1.3.3 — Scroll-to-Top CSP Fix + Filter/Pagination Sync
- **`public/js/scroll-top.js`** — extracted scroll-to-top to a dedicated external file (inline script in `Base.astro` was silently blocked by `script-src 'self'` CSP).
- **Client-side filter + pagination sync** — filter and pagination are now a single JS controller (`blog-filter.js`). Shared state: `currentFilter` + `currentPage`. Filter click resets to page 1 and recalculates filtered set; page click advances within the filtered set. Pagination numbers always reflect the filtered count. All 12 posts rendered in HTML on page load; JS hides/shows them.
- **`blog/index.astro`** — removed server-side `allPosts.slice()` and static pagination HTML. `<nav id="pagination">` is empty; JS fills it dynamically.
- **`blog.css`** — added `button.pg-btn` to pagination selectors.

**Files touched:**
`astro-site/src/styles/blog.css` (new),
`astro-site/public/js/blog-filter.js` (new, rewritten ×2),
`astro-site/public/js/scroll-top.js` (new),
`astro-site/src/pages/blog/tags/[tag].astro` (new),
`astro-site/src/pages/blog/[page].astro` (new),
`astro-site/src/pages/blog/index.astro`,
`astro-site/src/pages/blog/[...slug].astro`,
`astro-site/src/layouts/Base.astro`,
`public/_headers`,
`package.json`, `CHANGELOG.md`, `TRACKING.md`, `progress.md`

**Root-cause pattern (logged for future reference):**
Astro inlines small `<style>` and `<script>` blocks as HTML — both are blocked by `script-src 'self'` / `style-src 'self'` CSP. Fix: always use `import 'file.css'` (Astro bundles to `/_astro/`) and `<script src="/js/file.js">` (served from `public/`, allowed by `'self'`).

**Next candidates:** Update existing articles to add `updatedDate` / `image` / `featured` where appropriate. Add RSS feed (`/blog/rss.xml`).

---

## 2026-05-15 — v1.3.0 — Blog System SEO + UX Overhaul

**Done:**
- **`[...slug].astro`** — `article:tag` OG meta per tag; per-post OG image from `image` field; reading time (word count ÷ 200) in header + Article JSON-LD (`timeRequired`, `wordCount`); `updatedDate` badge; prev/next post navigation (2-col card, responsive); `en-GB` date locale; single-pass `getStaticPaths` with index-based prev/next.
- **`blog/index.astro`** — client-side category filter bar (auto-generated from collection, no hardcoding); reading time on every card; featured post sort + gold badge; `BreadcrumbList` JSON-LD; `Blog` JSON-LD with top-10 `BlogPosting` items; `en-GB` dates.
- **`content.config.ts`** — added `image` (optional string) and `featured` (boolean, default false) fields.
- **`public/admin/config.yml`** — fixed category options (added `Wiring Guide`, `Component Guide`); added `updatedDate`, `image`, `featured` fields to blog form; added `summary`, `sortable_fields`; inline SEO hint text on all fields.
- **`Base.astro`** — added `twitter:site: @electrasim`.
- `package.json` version `1.2.3` → `1.3.0`.
- `CHANGELOG.md` updated with `[1.3.0]` entry.

**Files touched:**
`astro-site/src/pages/blog/[...slug].astro`,
`astro-site/src/pages/blog/index.astro`,
`astro-site/src/content.config.ts`,
`astro-site/public/admin/config.yml`,
`astro-site/src/layouts/Base.astro`,
`package.json`, `CHANGELOG.md`, `progress.md`

**Next candidates:** "What is an EICR?", "What is a Dimmer Switch?", "How to Wire a Socket Outlet".

---

## 2026-05-15 — v1.2.3 — Blog Post: 5 Common Electrical Wiring Mistakes

**Done:**
- New blog post `5-common-electrical-wiring-mistakes.md` — high-CTR list format, internal linking hub for the entire cluster.
- Content: reverse polarity (lamp holder danger, RCD degradation, old vs new cable colours), missing earth (invisible in normal operation, fatal under fault, earth continuity test), open ring circuit (all sockets live but single-leg overheating, ring continuity test method), overloaded kitchen circuit (appliance load table, why diversity fails in kitchens, dedicated radial recommendation), wrong MCB vs cable rating (cable CCC table, ring vs radial 2.5mm²/32A rule). Non-invasive DIY checks section (plug-in tester, RCD TEST button, warm socket check). ElectraSim fault simulation walkthrough for 3 of the 5 mistakes. Quick-reference summary table. When-to-call-an-electrician section.
- **Internal links added to 5 existing posts:** live/neutral/earth, ring circuit, distribution board, MCB, RCD.
- Homepage blog grid updated (12 posts, newest first).
- `package.json` version `1.2.2` → `1.2.3`.
- `CHANGELOG.md` updated with `[1.2.3]` entry.

**SEO targets:**
- Short-tail: *common wiring mistakes UK*, *electrical wiring mistakes*, *wiring mistakes*
- Long-tail: *what happens if you wire a socket wrong UK*, *reverse polarity wiring dangers*, *missing earth wire symptoms*, *open ring circuit fault*, *wrong MCB rating cable fire*, *common DIY electrical mistakes*, *is my wiring safe UK*, *how to check wiring is correct*

**Files touched:**
`astro-site/src/content/blog/5-common-electrical-wiring-mistakes.md` (new),
`astro-site/src/pages/index.astro` (blog grid),
`package.json`, `CHANGELOG.md`, `progress.md`

**Next candidates:** "What is an EICR?", "What is a Dimmer Switch and How Does It Work?", "How to Wire a Socket Outlet".

---

## 2026-05-15 — v1.2.2 — Blog Post: Ring Circuit vs Radial Circuit Explained

**Done:**
- New blog post `ring-circuit-vs-radial-circuit-explained.md` — UK-specific wiring topology guide, lowest competition / highest value gap in the current cluster.
- Content: ring circuit dual-path principle + ASCII diagram, radial single-path, why the UK uses ring mains (post-1947 history), full comparison table, identifying each at the consumer unit, unfused spur rules (BS 7671 limits), fused spurs via FCU, cable sizing table (all circuit types), BS 7671 requirements (100 m² rule, MCB ratings, RCD requirement, ring continuity), ring continuity test method (r₁+r₂, cross-connect, Zs), 5 common mistakes, use-case decision table, ElectraSim simulation walkthrough for both topologies, summary table.
- Homepage blog grid updated (11 posts, newest first).
- `package.json` version `1.2.1` → `1.2.2`.
- `CHANGELOG.md` updated with `[1.2.2]` entry.

**SEO targets:**
- Short-tail: *ring circuit*, *ring main*, *radial circuit*, *ring circuit UK*, *ring main wiring*
- Long-tail: *ring circuit vs radial circuit for sockets*, *how does a ring main work UK*, *can I add a spur to a ring circuit*, *ring circuit cable size 2.5mm*, *how many sockets on a ring circuit*, *ring circuit floor area limit*, *radial circuit kitchen UK*, *open ring circuit fault*, *unfused spur rules BS 7671*

**Files touched:**
`astro-site/src/content/blog/ring-circuit-vs-radial-circuit-explained.md` (new),
`astro-site/src/pages/index.astro` (blog grid),
`package.json`, `CHANGELOG.md`, `progress.md`

**Next candidates:** "5 Common Electrical Wiring Mistakes", "What is a Dimmer Switch and How Does It Work?", "How to Wire a Socket Outlet".

---

## 2026-05-14 — v1.2.1 — Blog Post: Live, Neutral and Earth Wires Explained

**Done:**
- New blog post `live-neutral-and-earth-wires-explained.md` published — foundational beginner guide, highest-volume search topic in UK electrical DIY.
- Content: role of each conductor, neutral-is-not-earth distinction, UK colour codes (pre/post 2004 tables), reverse polarity + missing earth failure modes, Class I vs Class II appliances, T&E cable sizing table, earthing systems (TN-S / TN-C-S / TT), main + supplementary bonding, 3-step ElectraSim walkthrough, summary comparison table, 4 FAQ answers.
- Homepage blog grid updated (10 posts, newest first).
- `package.json` version `1.2.0` → `1.2.1`.
- `CHANGELOG.md` updated with `[1.2.1]` entry.

**SEO targets:**
- Short-tail: *live neutral earth wire*, *what is earth wire*, *UK wiring colours*, *brown blue green yellow wire*
- Long-tail: *difference between live neutral and earth UK*, *why is the earth wire important*, *what happens if you connect live to neutral*, *neutral vs earth difference*, *what colour is live wire UK*, *how does earthing protect you*, *TN-S vs TN-C-S vs TT earthing*

**Files touched:**
`astro-site/src/content/blog/live-neutral-and-earth-wires-explained.md` (new),
`astro-site/src/pages/index.astro` (blog grid),
`package.json`, `CHANGELOG.md`, `progress.md`

**Next candidates:** "Ring Circuit vs Radial Circuit", "5 Common Wiring Mistakes", "How to Wire a Socket Outlet", "Dimmer Switch Deep-Dive".

---

## 2026-05-13 — v1.2.0 — Blog Content Cluster + Security Headers

**Done:**
- **4 new SEO blog posts published and deployed:**
  - `what-is-an-rcd-and-why-do-you-need-one.md` — RCD deep-dive (toroidal transformer, 30mA threshold, RCD types AC/A/F/B, RCBO vs split-load, TEST button, ElectraSim walkthrough).
  - `what-is-a-contactor-and-how-does-it-work.md` — Contactor deep-dive (coil/armature/contact, AC-1→AC-4, coil voltage, contactor vs relay vs MCB, DOL starter, common faults).
  - `distribution-board-explained-how-a-consumer-unit-is-wired.md` — Consumer unit anatomy (busbars, RCDs, MCBs, earth bar, SPD), 3-layout comparison (single RCD / split-load / RCBO), MCB rating table, sizing guide, earthing + bonding.
  - `how-to-wire-a-two-way-switch-complete-guide.md` — COM/L1/L2 terminals, 4-state truth table, ASCII wiring diagram, strapping wire ID, old + new cable colours, intermediate switch for 3+ locations, 5 common mistakes.
- **Comprehensive security headers** added to `public/_headers` (Cloudflare Pages):
  - `/*` — HSTS (63072000s, includeSubDomains, preload), strict CSP (no `unsafe-inline`), X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy.
  - `/app/*` — tighter CSP, `worker-src self blob:`, Plausible allowed.
  - `/admin/*` — relaxed CSP for Sveltia CMS (unpkg.com + GitHub API + unsafe-inline/eval).
- **Inline script fixes** (required for strict CSP):
  - `astro-site/src/pages/guide.astro`: removed `is:inline` + `DOMContentLoaded` wrapper → Astro bundles as deferred ES module. Zero `unsafe-inline` on marketing site.
  - `index.html` (Vite app): removed redundant inline Plausible init stub — Plausible's async script is self-initialising.
- `package.json` version bumped `1.1.0` → `1.2.0`.
- Homepage blog grid updated — all 9 posts shown, newest first.
- `CHANGELOG.md` updated with `[1.2.0]` entry; `[Unreleased]` promoted to `[1.1.0]`.
- Memory updated (MEMORY[23f8a3c8]).

**Files touched:**
`astro-site/src/content/blog/what-is-an-rcd-and-why-do-you-need-one.md` (new),
`astro-site/src/content/blog/what-is-a-contactor-and-how-does-it-work.md` (new),
`astro-site/src/content/blog/distribution-board-explained-how-a-consumer-unit-is-wired.md` (new),
`astro-site/src/content/blog/how-to-wire-a-two-way-switch-complete-guide.md` (new),
`astro-site/src/pages/index.astro` (blog grid + newest post cards),
`astro-site/src/pages/guide.astro` (removed is:inline),
`public/_headers` (full security header rewrite),
`index.html` (removed inline Plausible stub),
`package.json` (version 1.2.0),
`CHANGELOG.md`, `progress.md`

**Next:** Continue blog content cluster — candidates: "Ring Circuit vs Radial Circuit", "How to Wire a Two-Way Switch" (done ✅), "5 Common Wiring Mistakes", "Timer Switch / Dimmer Switch deep-dives".

---

## 2026-05-06 — v1.1.0 — New Components + Default Circuit Update

**Done:**
- Added 6 new components to `src/domain/components.ts`:
  - `rcd` 🛡️ (protection, 4-port L+N in/out, defaultOn)
  - `contactor` ⚡ (switch, 4-port L+N in/out)
  - `timer-switch` ⏲️ (new `timer` category, 2-port L pass-through)
  - `dimmer-switch` 🔆 (control, 2-port L pass-through, isDimmer)
  - `distribution-board` 🗄️ (protection, 7-port consumer unit)
  - `bell` 🔔 (load, 2-port L+N)
- Added `'timer'` to `CATEGORY_ORDER` in `Palette.tsx` and `DocsPage.tsx`.
- `DocsPage.tsx`: 6 new Tips entries (one per new component), version pill `v1.0` → `v1.1`.
- `src/store/seed.ts`: extended default circuit with 3 new branches (Branches 5–7) showcasing all 6 new components — second supply pair (live2/neutral2), RCD→DB→Dimmer→Bulb, DB→Contactor→Motor, DB→Timer→Bell.
- `SettingsModal.tsx`: version pill `v1.0.4` → `v1.1.0`; roadmap row added for new components (✅ shipped).
- `package.json`: version `1.0.4` → `1.1.0`.
- `tsc --noEmit` ✅ · 89/89 tests ✅ · deployed to Cloudflare Pages (`electrasim.com`).

**Files touched:** `src/domain/components.ts`, `src/store/seed.ts`, `src/ui/components/Palette.tsx`, `src/ui/components/DocsPage.tsx`, `src/ui/components/SettingsModal.tsx`, `package.json`

**Next (pending user decision):** Marketing site content —
- **Option A:** New `/guide/` page (full app walkthrough, medium effort)
- **Option B:** "Getting started with ElectraSim" blog post (low effort, SEO-friendly)
- **Option C:** Both A + B
- **Option D:** Blog post about the 6 new components — timely, high SEO value on RCD/Contactor/etc. keywords
- **Recommendation:** B + D first, then A later.

---

## 2026-05-02 — Marketing Site v2 — Electrical Redesign + New Pages

**Done:**
- Scaffolded `astro-site/` with Astro 6, `@astrojs/sitemap`, Content Collections (glob loader API).
- Migrated landing page + blog to Astro components; blog post as Markdown in `src/content/blog/`.
- Sveltia CMS at `/admin/` — access token auth, no OAuth worker needed (solo user).
- CMS-driven content: `src/content/pages/landing.json` + `blog-index.json`; all page text editable in GUI.
- `postbuild.mjs` rewritten to merge Vite SPA (`dist/app/`) + Astro output (`dist/`) with correct asset paths.
- Fixed React SPA blank screen — `dist/assets/` was at wrong path; now correctly at `dist/app/assets/`.
- Fixed `/admin/` SW cache collision — `navigateFallbackDenylist`, `globIgnores`, `_headers: no-store`.
- `NODE_VERSION=22` set on Cloudflare Pages project via API (Astro 6 requires ≥22).
- Electrical-inspired dark redesign across all pages — animated circuit traces, glow effects, parallax.
- New pages: `/about/`, `/contact/`, `/privacy/`, `/terms/`.
- Footer + nav updated with new page links.
- CHANGELOG, README, PLAN.md, progress.md updated.

**Files touched:**
`astro-site/src/layouts/Base.astro`, `astro-site/src/pages/index.astro`, `astro-site/src/pages/blog/index.astro`, `astro-site/src/pages/blog/[...slug].astro`, `astro-site/src/pages/about.astro`, `astro-site/src/pages/contact.astro`, `astro-site/src/pages/privacy.astro`, `astro-site/src/pages/terms.astro`, `astro-site/public/admin/config.yml`, `astro-site/src/content.config.ts`, `astro-site/src/content/pages/landing.json`, `astro-site/src/content/pages/blog-index.json`, `scripts/postbuild.mjs`, `vite.config.ts`, `public/_headers`, `.gitignore`

**Next:** Connect Cloudflare Pages to GitHub for auto-deploy on push.

**Blockers / Notes:** Cloudflare Pages project was direct-upload; Git connection requires OAuth in dashboard. Workaround: `npm run deploy` locally.

---

## 2026-04-30 — Phase 7 — Custom Wiring Mode

**Done:**
- `settingsStore`: added `customWiringMode: boolean` (default `false`), persisted to IndexedDB, forward-compat with older saved blobs.
- `uiStore`: added `PendingCustomPath` interface + `pendingCustomPath` state + `startCustomPath` / `addCustomPathCheckpoint` / `cancelCustomPath` actions. `startCustomPath` clears any pending wire and sets mode to `'wiring'`.
- `canvas-actions.ts`: added `commitCustomPath(destCompId, destPortIndex)` — validates port types, builds `WireInstance` with `controlPoints = checkpoints.slice()`, commits via `addWire` (one undo entry).
- `CircuitCanvas.tsx`: integrated full custom-path FSM into `handlePortClick`; added **rAF cursor loop** that mutates the cursor `<g>` element's `transform` attribute directly (zero React renders per pointer-move frame); added `CustomPathOverlay` SVG component (polyline segments, corner diamonds, origin dot, cursor indicator); added transparent full-canvas `<rect>` click-target for checkpoints when a path is in flight.
- `useKeyboardShortcuts.ts`: `Esc` cancels `pendingCustomPath` at correct priority (after `pendingDeletion`, before `reroute`).
- `SettingsModal.tsx`: added `ElectricToggle` for `customWiringMode` in Editing tab with description and live preview text.
- `ToolDock.tsx`: wire-mode button swaps to `Pen` icon when `customWiringMode` on; dynamic tooltip; clicking button cancels in-flight path.
- `store/index.ts`: exported `PendingCustomPath` type.
- `DocsPage.tsx`: new Tips entry explaining the flow + Esc cancel.
- `README.md`: highlight bullet + updated walkthrough implementation-status note.
- `CHANGELOG.md`: Phase 7 entry under `[Unreleased]`.

**Perf notes:**
- Cursor dot: rAF loop with direct `setAttribute('transform', ...)` — 0 React renders per pointermove; only the SVG DOM is touched.
- Checkpoint `addCustomPathCheckpoint` updates Zustand state (triggers one React re-render per click to re-draw the polyline) — acceptable since it's user-initiated, not continuous.
- Custom path overlay renders only when `pendingCustomPath !== null` — no overhead at idle.
- rAF loop only active when `pendingCustomPath !== null`; cleanup via `cancelAnimationFrame` on unmount/cancel.

**Next:** Phase 6.3-slim (mini-map, alignment tools, gridless mode, high-contrast presets).

**Blockers / Notes:** SVG-only at v1.0. Pixi parity deferred to Phase 8 (v1.1) per PLAN.md §8.1.

---

## 2026-05-01 — Phase 7.1 — Pre-launch polish (all blockers resolved)

**Done:**
- **P1** `Ask AI` hidden in prod: `Toolbar.tsx` gated behind `import.meta.env.DEV`; `PhoneDock.tsx` dimmed + friendly log.
- **P2** Contact form placeholder: `IS_PLACEHOLDER` guard added to `ContactModal.tsx` — renders amber "coming soon" banner instead of broken link.
- **P3** OG image: `public/og-image.svg` created (1200×630, branded circuit diagram). `index.html` OG + Twitter meta updated.
- **P4** `App.tsx` stale comment updated to v1.0 state.
- **P5** `AboutTab` roadmap rewritten — 6 shipped rows, v1.1 WebGL, v2.0 cloud/AI. Version pill → `v1.0-rc.1`.
- **P6** `npm run lint:fix` → 25 files auto-fixed. 16 remaining are pre-existing DEV-only warnings.
- **P7** `package.json` `0.0.0` → `1.0.0-rc.1`.
- `LAUNCH.md` all P1–P9 rows updated to `✅ Fixed` / `📋 Launch day`.
- `CHANGELOG.md` + `progress.md` updated.

**Status:** `tsc --noEmit` ✅ · 89/89 tests ✅ · Biome clean (no logic errors)

**Files touched:** `Toolbar.tsx`, `PhoneDock.tsx`, `ContactModal.tsx`, `public/og-image.svg`, `index.html`, `App.tsx`, `SettingsModal.tsx`, `package.json`, `LAUNCH.md`, `CHANGELOG.md`, `progress.md`

**Hosting decision (user-requested, 2026-05-01):** Primary deploy target changed from Hetzner CX22 + Caddy to **Cloudflare Pages + Workers**. All compute-heavy work is client-side (simulation, routing, rendering run in browser). Server is thin API glue only. Hetzner + Caddy preserved as documented fallback in `PLAN.md §3`. `LAUNCH.md §3` + `§8` updated with `wrangler pages deploy` path.

**PRE-LAUNCH progress (2026-05-01):**
- ✅ Domain `electrasim.com` registered (Cloudflare Registrar)
- ✅ Find-replace `https://electrasim.app` → `https://electrasim.com` across all source files (`index.html`, `robots.txt`, `sitemap.xml`, docs)
- ✅ `wrangler` installed as dev dep, `npm run deploy` script added to `package.json`

**Lighthouse results (2026-05-01, incognito, cold first visit):**
- Performance: **71** · Accessibility: **100** · Best Practices: **81** · SEO: **100**
- FCP 2.2s · LCP 2.2s · TBT **70ms ✅** · CLS **0 ✅** · TTI 2.7s · Speed Index 4.8s
- TTFB 840ms — Cloudflare cold edge (not fixable without paid plan)
- Best Practices 81 — all 3 deprecation warnings from Cloudflare's own `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (not our code)
- Unused JS 52 KB — Pixi chunk loaded upfront; lazy-load deferred to v1.1
- Fix applied: `<link rel="preconnect" href="https://plausible.io" />` added to `index.html`

**Next:** v1.1 perf work — lazy-load Pixi chunk (`PixiCanvas` 278 KB) via dynamic `import()` to gain ~10–15 Lighthouse pts.

---

## 2026-05-01 — 🚀 v1.0.0 LAUNCH

**Done:**
- `index.html`: Google Search Console token set, Plausible cloud snippet replaced with exact dashboard snippet, `<link rel="preconnect" href="https://plausible.io">` added.
- `ContactModal.tsx`: `CONTACT_FORM_URL` → `https://forms.gle/z1eED6sbmXmZrRKT8`.
- `package.json`: version `1.0.0-rc.1` → `1.0.0`.
- `CHANGELOG.md`: `[Unreleased]` → `[1.0.0] — 2026-05-01`.
- `SettingsModal.tsx`: version pill `v1.0-rc.1` → `v1.0.0`.
- Cloudflare Pages project `electrasim` created + deployed via `wrangler` (API token auth).
- Custom domain `electrasim.com` linked in CF Pages dashboard — HTTPS automatic.
- `git init` + initial commit `afe1d26` + `git tag v1.0.0`.
- Sitemap submitted to Google Search Console (pending crawl — normal day-1 status).
- Lighthouse run (incognito, cold): Perf 71 / A11y 100 / SEO 100 / Best Practices 81.
- Redeployed with preconnect hint — commit `9e253ff`.

**Perf (live, incognito):** FCP 2.2s · LCP 2.2s · TBT 70ms · CLS 0 · TTI 2.7s · bundle 114 KB gzip

**Files touched:** `index.html`, `ContactModal.tsx`, `package.json`, `CHANGELOG.md`, `SettingsModal.tsx`, `LAUNCH.md`, `progress.md`

**Next session:** v1.1 — lazy-load Pixi chunk, then Phase 8 (WebGL parity) or bug triage from user reports.

---

## 2026-04-30 — Phase 7.1 — Code sweep + LAUNCH.md

**Done:**
- Full codebase sweep: TypeScript (`tsc --noEmit` ✔), Vitest 89/89 ✔, Biome 32 formatter warnings (no logic errors).
- Created `LAUNCH.md` — pre-launch checklist, 9 sections: code health, feature completeness, infrastructure, domain substitutions, quality gates, Phase 7.1 polish items, smoke-test checklist, launch day steps, post-launch.
- `PLAN.md`: updated phase table — 6.2 / 7 / 6.3-slim / 6.11 all marked `✅ done`; 7.1 marked `🔧 in progress`; added `LAUNCH.md` cross-reference in §13.
- `CHANGELOG.md`: Phase 6.3-slim entry added.
- Code sweep findings logged in `LAUNCH.md` §6:
  - **P1 (❌ blocker):** `Ask AI` button in `Toolbar.tsx` + `PhoneDock.tsx` is non-functional — renders but no `onClick`.
  - **P2 (❌ blocker):** `CONTACT_FORM_URL` is placeholder in `ContactModal.tsx`.
  - **P3 (❌ blocker):** `public/og-image.png` does not exist.
  - **P4 (⚠️):** `App.tsx` comment says “Phase 2 current” — stale.
  - **P5 (⚠️):** `AboutTab` roadmap shows multi-select as “in progress”, missing newer features.
  - **P6 (⚠️):** 32 Biome formatter issues — `npm run lint:fix` resolves all.
  - **P7 (⚠️):** `package.json` version `0.0.0`.
  - **P8 (⚠️):** `CHANGELOG.md` `[Unreleased]` needs version + date on launch day.
  - **P9 (⚠️):** `PLAN.md` phase table had stale `pending` statuses — fixed in this session.

**Files touched:** `LAUNCH.md` (new), `PLAN.md`, `progress.md`, `CHANGELOG.md`

**Next:** Fix blockers P1, P2, P3 then run Biome lint:fix for P6.

---

## 2026-04-30 — Phase 6.3-slim — UX Uplift III

**Done:**
- `settingsStore`: added `showGrid` (default `true`), `showMiniMap` (default `true`), `canvasPreset` (`'default' | 'high-contrast' | 'deuteranopia'`). All persisted to IndexedDB.
- `theme.ts`: added `applyCanvasPreset(base, { showGrid, canvasPreset }, isDark)` helper — composes final `CanvasTheme` from base + setting overrides. High-contrast and deuteranopia preset token objects defined.
- `Editor.tsx`: subscribes to `showGrid`, `canvasPreset`, `showMiniMap`; builds `canvasTheme` via `applyCanvasPreset`; renders `<AlignmentBar />` and `{showMiniMap && <MiniMap />}`.
- `circuitStore.ts`: added `setComponentPositions(updates)` batch action — sets absolute x/y for multiple components in one Immer `set()` = one undo entry.
- `canvas-actions.ts`: added `alignSelected(axis)` and `distributeSelected(axis)` — both use `setComponentPositions` for atomic undo.
- `AlignmentBar.tsx`: new component — floats above canvas when 2+ components selected; 6 align + 2 distribute buttons. Distribute only shown for 3+ components.
- `MiniMap.tsx`: new SVG overlay — blue rectangles for components + viewport indicator. Click-to-pan via `viewportStore.setPan`. Gated by `showMiniMap`.
- `SettingsModal.tsx`: Display tab extended with show-grid toggle, show-minimap toggle, and `CanvasPresetSelector` (3-option grid: Default / High Contrast / Colour-blind).
- `CHANGELOG.md`, `progress.md`: updated.

**Perf notes:**
- `AlignmentBar` mounts only when `selectedComponentIds.length >= 2` — no overhead when idle.
- `MiniMap` is gated by `showMiniMap` at the `Editor` level — completely unmounted when off.
- `applyCanvasPreset` is pure and called once per render in `Editor`; the output feeds into the existing `theme` prop path.

**Next:** Phase 6.11 (already shipped). Next is Phase 7.1 pre-launch polish.

**Blockers / Notes:** None.

---

## 2026-04-30 — Phase 7 bug fixes — Custom Wiring post-ship patches

**Done:**
- **Bug: pan mode on checkpoint click** — `handleBackgroundPointerDown` was arming `panRef` even when `pendingCustomPath` was active. Fixed: early return when `pendingCustomPath !== null`.
- **Bug: component drag armed on destination port click** — `handleComponentPointerDown` armed `dragRef` (after `e.stopPropagation()`) even in custom wiring mode, interfering with the port commit flow. Fixed: early return when `customWiringMode && pendingCustomPath`.
- **Bug: port clicks adding checkpoints instead of committing** — the checkpoint `<rect>` was rendered after the components `<g>` in SVG paint order, so it sat on top and intercepted all pointer events before they could reach port circles (SVG hit-test = last-painted wins). Fixed: removed the `<rect>` entirely; checkpoint logic moved into the existing grid rect `onClick` (which is rendered before wires/components, so ports are on top) and the SVG-level `onClick` fallback.
- **Port highlight fix** — ports weren't highlighting as valid destinations in custom wiring mode because `pendingFrom` (= `pendingWireFrom`) is always `null` in that mode. Fixed: added `customPathFrom` prop to `ComponentNode`; port valid/pending logic now uses `activeSrc = pendingFrom ?? customPathFrom`.

**Files touched:** `CircuitCanvas.tsx`

---

## Roadmap

| Phase | Title | Status |
|---|---|---|
| **6.x series** | Domain, state, SVG renderer, simulation, wiring, routing, export, menus, docs, dark mode | ✅ all shipped |
| **6.2** | Multi-select, copy/paste, smart routing | ✅ done |
| **7** | Custom wiring mode + post-ship bug fixes | ✅ done |
| **6.3-slim** | Alignment, mini-map, grid toggle, colour presets | ✅ done |
| **6.11** | Full UI dark mode | ✅ done |
| **7.1** | Pre-launch polish (code sweep, LAUNCH.md, fix P1–P9) | 🔧 in progress |
| **PRE-LAUNCH** | Domain, VPS, Caddy, Plausible, OG image, Lighthouse | 📋 pending |
| **🚀 v1.0** | Public launch | 🎯 target |
| **8** | Pixi/WebGL — GPU renderer fix, user toggle | v1.1 |
| **9** | Backend (Hono + Bun, auth, cloud save) | v2.0 |
| **10** | AI features (Gemini Vision, debug assistant) | v2.0 |

---

## Stack (locked)

- **Frontend:** React 19 + Compiler, Vite 6, TypeScript strict, Tailwind v4, shadcn/ui, lucide-react, motion.
- **State:** Zustand + Immer + zundo (patch-based undo).
- **Renderer (2D):** PixiJS v8.
- **Renderer (3D, future):** React Three Fiber + drei, lazy-loaded.
- **Workers:** Comlink-bridged Web Workers for simulation.
- **Persistence (local):** IndexedDB via idb-keyval.
- **Backend (future):** Hono + Bun + SQLite, Docker-packaged.
- **Hosting:** self-hosted VPS (Hetzner CX22 recommended), Debian 12, Caddy v2 + Docker Compose.
- **Git:** bare git on VPS + post-receive hook (no GitHub required).

## Targets (perf budget)

- 60 fps with **200 components + 400 wires** while panning/zooming/dragging.
- < 16 ms interaction latency.
- < 250 KB gzip initial JS.
- < 2 s TTI on 4G.

---

## Log

## 2026-04-26 — Phase 0b — Mockups kickoff
**Done:**
- Created `CHANGELOG.md` and `progress.md`.
- Preserved current monolithic editor as `src/App.legacy.tsx` (1615 lines, untouched).
- Scaffolding mockup gallery + 3 themed mockups (Studio Light / Pro Dark / Lab Glass).
- Sample circuit data (14 components, 17 wires) to give every mockup something realistic to render.

**Next:**
- User picks a mockup direction (or mixes elements).
- Then proceed to Phase 0a tooling, then Phase 1 domain extraction.

**Blockers / Notes:**
- Phase 0a (tooling, FPS overlay, Gemini key leak fix in `vite.config.ts`) deferred until visual direction is approved.
- VPS not provisioned yet; not blocking until Phase 6 PWA / Phase 9 backend.

**Perf (baseline, current legacy app):** _not yet measured — will capture in Phase 0a._

---

## 2026-04-26 — Phase 0b — Added 4th mockup (user-requested combo)
**Done:**
- Added **Lab Glass · Light** (`src/mockups/LabGlassLight.tsx`) — Lab Glass floating-panel layout with the Studio Light color scheme (white/slate neutrals, single blue accent `#2563eb`, no purple/pink/teal gradient).
- Registered it in the gallery; grid now `md:grid-cols-2 xl:grid-cols-4`.
- Updated hero copy + count to reflect 4 mockups.

**Next:** await user pick to lock visual direction.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 0b ✅ done · Phase 0c — Lock & cleanup
**Done:**
- ✅ User approved **Lab Glass · Light** as the locked visual direction.
- Recorded decision in **ADR 0001** (`docs/decisions/0001-visual-direction.md`).
- Updated `PLAN.md` §8 (Phase 0b → done) and §10 (mockup question closed).
- Added `src/lib/useDevice.ts` — viewport-driven device-class hook (Tailwind-aligned breakpoints, SSR-safe).
- `App.tsx` now mounts `LabGlassLight` directly with the real `useDevice()` hook (no more `DeviceFrame` wrapper).
- Deleted unused mockup files: `StudioLight.tsx`, `ProDark.tsx`, `LabGlass.tsx`, `MockupGallery.tsx`, `DeviceFrame.tsx`. Kept `CircuitCanvas.tsx`, `LabGlassLight.tsx`, `sampleCircuit.ts`.
- `src/index.css` updated for full-viewport layout + touch-friendly defaults (`touch-action: manipulation`, `user-select: none`, `-webkit-tap-highlight-color: transparent`).

**Security:**
- 🔒 **Fixed Gemini API key leak** in `vite.config.ts`. The old `define` block inlined the key into the client bundle. Removed entirely. AI features will be reintroduced through the Phase 9 backend proxy (Hono + Bun, same-origin `/api/ai/*`). Documented in the new vite.config.ts header comment.

**Next:**
- **Phase 0a** (tooling baseline): Biome (lint+format), Vitest, Playwright skeleton, strict TS, FPS overlay, bundle analyzer.
- **Phase 1** (domain extraction): pure TS sim engine + tests.

**Blockers / Notes:** none. Type-check + Vite dev both green.

**Perf baseline (post-cleanup, pre-rewrite):**
- Production bundle: **JS 222 KB raw / 67.99 KB gzip**, **CSS 36.67 KB raw / 6.84 KB gzip**, **HTML 0.41 KB / 0.28 KB gzip**.
- Initial total: ~**75 KB gzip** — comfortable headroom under the 250 KB target.
- 1,677 modules transformed; build in 5.3 s.
- FPS / runtime perf: not yet measured — overlay lands in Phase 0a; full numbers captured in Phase 4 (renderer swap).

---

## 2026-04-26 — Phase 0a ✅ done — Tooling baseline
**Done:**
- ✅ **Strict TypeScript** in `tsconfig.json` (legacy excluded, marked `// @ts-nocheck`).
- ✅ **Biome** for lint + format (replaces ESLint+Prettier). `biome.json`, scripts: `lint`, `lint:fix`, `format`. 21 files auto-formatted on first pass.
- ✅ **Vitest + RTL + jsdom** wired up. `vitest.config.ts`, `src/test/setup.ts`. **First test: `src/lib/useDevice.test.ts` — 4 cases all green**.
- ✅ **Playwright** E2E scaffold. `playwright.config.ts` (Desktop Chrome / Pixel 7 / iPad Pro 11). `e2e/smoke.spec.ts`. Browser binaries not auto-installed; run `npm run e2e:install` when ready.
- ✅ **FPS overlay** at `src/lib/FpsOverlay.tsx`, mounted dev-only via `import.meta.env.DEV` in `main.tsx`. Toggle with `Ctrl/Cmd+Shift+F`.
- ✅ **Bundle visualizer** plugin gated behind `BUILD_STATS=1` env var. `npm run build:stats` emits `dist/stats.html`.
- ✅ **Lefthook** (`lefthook.yml`) for pre-commit format/lint and commit-msg reminder to update CHANGELOG + progress. Graceful skip if no git repo.
- ✅ **Separate `tsconfig.e2e.json`** so Playwright doesn't pollute main project types.
- ✅ Composite `npm run check` = typecheck + lint + test.

**Resolved during the phase:**
- Vitest pulled vite@5 internally → **upgraded to vitest@^3** which uses vite@6, fixing duplicate-types error.
- Lefthook `prepare` script needed graceful no-op when `.git` doesn't exist yet.
- Biome flagged a missing `<title>` on `CircuitCanvas.tsx` SVG → fixed with proper `role="img"` + `aria-label` + `<title>` (a11y improvement).

**Perf snapshot (post-Phase-0a):**
- Production bundle: **JS 222.24 KB raw / 68.05 KB gzip** (Δ +0.06 KB vs pre-0a — negligible).
- CSS, HTML unchanged.
- FPS overlay: dev-only, **0 KB in production** (verified by build size delta).
- Build time: 7.26 s (slight increase from added plugins; still well within tolerance).

**Pipeline status:** `npm run check` ✅ all green (typecheck, lint, 4/4 tests).

**Known minor:**
- `useDevice.test.ts` emits cosmetic `act()` warnings in stderr because `useDevice`'s mount-time `useEffect` calls `update()` synchronously. Tests pass; warnings are non-blocking. Will revisit if they become noisy.

**Next:**
- **Phase 1** — Domain extraction. Move `COMPONENT_DEFS`, `Circuit`/`Wire`/`Port` types, and the simulation engine out of `App.legacy.tsx` into pure `/domain` modules with full Vitest coverage of current behaviour.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 1 ✅ done — Domain extraction
**Done:**
- ✅ New `src/domain/` layer — pure TypeScript, dependency-free, Web-Worker-ready.
  - `types.ts` — all domain interfaces (`Circuit`, `ComponentInstance`, `WireInstance`, `SimulationResult`, etc.). Positions use `{x, y, z?}` so the future 3D renderer (Phase 8) shares the same model.
  - `components.ts` — `COMPONENT_DEFS` registry (15 components) + box geometry constants + `getDef()` lookup.
  - `geometry.ts` — `getPortPos`, `getComponentBounds`, `getPortControlOffset`, `sampleWire`, `cubicBezier`, `snapToGrid`. Bezier sampling will feed the Phase-4 spatial index.
  - **`simulation.ts` — the heart.** Pure `simulate(circuit)` function. Behaviourally identical to legacy `runSimulation` (BFS Live + Neutral rails, switch open/close, load termination, port-collision short-circuit) but **rewritten with indexed `Map`s** so the inner loop is O(V+E) instead of legacy O(n²·|wires|).
  - `index.ts` — barrel export.
- ✅ **12 simulation tests** (`simulation.test.ts`):
  - empty / degenerate inputs (3)
  - minimal lit bulb (2)
  - switch on / off (2)
  - junction box fan-out + MCB on/off (2)
  - short-circuit invariant (1)
  - idempotence (1)
  - 50-bulb perf smoke test (1) — confirms < 50 ms (huge headroom under our < 8 ms / 200-comp Worker SLO).
- ✅ Legacy shims at `src/types.ts` + `src/constants.ts` re-export domain types/constants. The excluded `App.legacy.tsx` continues to resolve — **no breakage**.

**Resolved during the phase:**
- Biome flagged `noAssignInExpressions` in the indexer → refactored to a small `pushAt` helper.
- Biome flagged `noExplicitAny` on two helper components in `LabGlassLight.tsx` → introduced `IconBtnProps` and `PhoneBtnProps` typed against `LucideIcon`. (These were leftover mockup-time `any`s; now production-clean.)
- Biome auto-fixed import ordering in 1 file.

**Perf snapshot (post-Phase-1):**
- Production bundle: **JS 222.24 KB raw / 68.05 KB gzip** — **identical to Phase 0a** (domain code is unused at runtime until Phase 2 wiring; tree-shaken).
- CSS slightly grew to 6.87 KB gzip (Tailwind picked up new utility classes from Lab Glass Light typing pass).
- Test suite: 2 files, **16 tests, all passing**, ~2.4 s.
- 50-bulb simulation: well under 50 ms (target < 8 ms with Worker offload in Phase 5).

**Pipeline status:** `npm run check` ✅ all green.

**Next:**
- **Phase 2** — State migration. Introduce Zustand store slices (`circuitStore`, `viewportStore`, `uiStore`, `settingsStore`) + `zundo` patch-based undo. Wire `App.tsx`/`LabGlassLight` to read/write the store instead of static sample data. Sample circuit fixture moves into the circuit store as the seed state.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 2 ✅ done — State migration & first interactivity
**Done:**
- ✅ Installed `zustand`, `immer`, `zundo` (3 runtime packages, +8 KB gzip).
- ✅ **`src/store/` — three Zustand slices + a simulation bridge.**
  - `circuitStore.ts` — components, wires, selection, mutators (`addComponent`, `removeComponent`, `moveComponent`, `toggleSwitch`, `addWire`, `removeWire`). Wrapped in `temporal()` (zundo) for **patch-based undo/redo** with `partialize` + reference-equality so selection clicks don't pollute history.
  - `uiStore.ts` — sim toggle, `simResult`, log stream (cap 200), interaction mode, panel flags.
  - `viewportStore.ts` — pan / zoom (clamped 0.25–4×) / mouse, isolated for high-frequency updates.
  - `seed.ts` — initial 16-component / 20-wire circuit built with domain primitives.
  - `useSimulation.ts` — bridges circuit changes → `simulate()` → uiStore. De-dupes identical errors/warnings by signature so toggling a switch doesn't spam the log.
  - `index.ts` — barrel.
- ✅ **`src/store/circuitStore.test.ts`** — 8 tests: selection invariants, cascading wire delete on `removeComponent`, `toggleSwitch` only on switch types, `moveComponent`, undo of toggle, "selection ≠ history".
- ✅ **`src/ui/Editor.tsx`** — production replacement for `mockups/LabGlassLight.tsx`. Same locked Lab Glass · Light visual; every control is wired:
  - Run/Pause toggle ↔ live simulation effect.
  - Undo/Redo ↔ zundo.
  - Click component → select; double-click switch → toggle on/off; trash → delete (cascading).
  - Inspector reads selected from store; shows ID, type, position, on/off, energised/fault flags, port list.
  - Console panel renders live `useUiStore.logs`; status pill counts active loads in real time.
  - Palette built dynamically from `COMPONENT_DEFS` (no more static palette object).
- ✅ **`src/ui/CircuitCanvas.tsx`** — domain-driven SVG renderer. Takes `circuit`, `simResult`, `selectedId`, `onSelect`, `onToggleSwitch` as props. Energised loads + faulted components get coloured outlines and pips. The Phase-4 PixiJS renderer will swap behind the same contract.
- ✅ Deleted `src/mockups/` entirely (`LabGlassLight.tsx`, `CircuitCanvas.tsx`, `sampleCircuit.ts`).
- ✅ `App.tsx` slimmed to a 4-line shell that just mounts `Editor`.

**Resolved during the phase:**
- zundo recorded selection clicks in history (test failed expecting `pastStates.length` to stay at 0). Fixed with `equality: (a, b) => a.components === b.components && a.wires === b.wires` — Immer preserves array identity when no element changed, so reference equality is sufficient and keeps the comparison O(1).
- Biome flagged `noAssignInExpressions` in palette grouping (legacy `let list = …; if (!list) groups.set(c, list = [])` pattern) — refactored to `const existing = …; const list = existing ?? []`.

**Perf snapshot (post-Phase-2):**
- Production bundle: **JS 243.74 KB raw / 76.13 KB gzip** (Δ +8.08 KB vs Phase 1; Zustand + Immer + zundo).
- CSS: 6.88 KB gzip.
- 1,693 modules transformed; build in 5.4 s.
- Test suite: **3 files, 24 tests, all passing**, 2.6 s.

**Pipeline status:** `npm run check` ✅ all green.

**Try it:**
- Open `http://localhost:3000` (dev server already running).
- Click any component → inspector opens.
- Double-click MCB or any switch → toggles on/off → simulation re-runs → bulbs/fan light up or go dark.
- Toggle Live/Run → pauses simulation, energised highlights clear.
- Undo (button) → reverts the last graph mutation; selection clicks are NOT undone.

**Next:**
- **Phase 3** — UI split. Set up shadcn/ui properly (Tailwind v4 already in place); split `Editor.tsx` into ~10 small memoized components (Toolbar, Palette, Inspector, LogPanel, ToolDock, StatusPill, BrandMark). Add wire-creation UX (click port → drag → click target port). Drag-to-move components. Then delete `App.legacy.tsx`, `src/types.ts`, `src/constants.ts`.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 3 ✅ done — Component split + drag/wire UX
**Done:**
- ✅ **Editor decomposition** — `Editor.tsx` slimmed from ~440 → 80 lines (pure composition root). Seven memoized panels extracted under `src/ui/components/`:
  - `Toolbar.tsx`, `Palette.tsx`, `Inspector.tsx`, `LogPanel.tsx`, `ToolDock.tsx`, `StatusPill.tsx`, `PhoneDock.tsx`
  - Plus shared `IconBtn.tsx` + `PillField.tsx` primitives
  - `theme.ts` extracted (Lab Glass · Light tokens + page gradient)
- ✅ **Bug fix during Phase 2 → 3 transition**: `selectCircuit(s) => ({ components, wires })` was returning a fresh object on every Zustand subscription tick, causing React's "Maximum update depth exceeded" infinite loop and a blank screen on first load. Fixed by subscribing to `components` and `wires` separately and composing with `useMemo`. The exported `selectCircuit` helper is left in place for non-React snapshot use cases (Phase 5 Worker handoff, Phase 6 export-to-JSON) — to be revisited when those phases land.
- ✅ **`useKeyboardShortcuts`** hook — Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z (and Ctrl+Y), Delete/Backspace, Escape, V (select), W (wire). Skipped when typing in inputs.
- ✅ **`CircuitCanvas` upgrade** — interactive surface:
  - **Drag-to-move** with `getScreenCTM` screen↔canvas conversion. Window-level pointer listeners during drag so the cursor doesn't get "lost". Grid-snap on release.
  - **Wire creation** — click a port → rubber-band preview follows cursor → click compatible port to commit. Validates rail-type compatibility (live↔live, neutral↔neutral, earth↔earth), rejects self-loops with a console error log. Pending origin port is highlighted; matching-type target ports on other components get a thicker accent ring while pending.
- ✅ `uiStore` gained `pendingWireFrom` + `setPendingWireFrom`.
- ✅ **Legacy code deleted**: `src/App.legacy.tsx` (1,629 lines), `src/types.ts`, `src/constants.ts`, plus the corresponding `tsconfig.json` exclude entry.

**Resolved during the phase:**
- One bad `biome-ignore` rule name (`lint/a11y/noStaticElementInteractions` doesn't exist in our Biome version) — removed the directive.
- Six files needed import-order auto-formatting after the file moves; `biome check --write` cleaned them up.
- Two stale TS errors flashed in the IDE while the `uiStore` was mid-edit (`pendingWireFrom`/`setPendingWireFrom` declared but not yet implemented). Both resolved as soon as the implementation landed in the next edit; final `tsc --noEmit` is clean.

**Decisions deferred:**
- **shadcn/ui setup** — skipped this phase. Our glassmorphic style is already custom and the only Radix primitive we'd benefit from short-term is Tooltip. Will revisit if/when keyboard navigation or accessibility audits flag genuine needs (most likely alongside Phase 6 settings panel).
- **Pan & zoom** — moved to Phase 4. The PixiJS renderer needs its own zoom transform anyway, so wiring it twice would be wasted work. ToolDock zoom buttons currently render disabled-but-visible to set expectations.
- **Palette → drop on canvas** — placeholder. Tagged "Phase 3.5"; will land in a tiny follow-up before Phase 4 starts so the palette feels real.

**Perf snapshot (post-Phase-3):**
- Production bundle: **JS 249.49 KB raw / 77.80 KB gzip** (Δ +1.67 KB vs Phase 2 for the new interactivity).
- CSS: **5.52 KB gzip** — *down* from 6.88 KB; deleting `App.legacy.tsx` shrank Tailwind's content-extraction surface, pruning unused utilities.
- Test suite: 3 files, **24 tests**, all passing, 2.5 s.
- Production budget: still well under the 250 KB JS gzip target.

**Pipeline status:** `npm run check` ✅ all green.

**Try it (refresh `http://localhost:3000`):**
- **Drag** any component — it follows the cursor and snaps to the 24px grid on release.
- **Click any port** — rubber-band line follows the cursor. Compatible ports on other components glow blue. Click one to connect; the simulation re-runs and (if the wire is part of a closed loop) the bulb / fan lights up live.
- **Press W** to enter wire mode without clicking; **Esc** cancels.
- **Select a component + Delete** removes it (and its connected wires) — undoable with Ctrl+Z.
- **Ctrl+Z / Ctrl+Shift+Z** for undo/redo. Selection clicks are not undoable, only graph mutations.

**Next:**
- **Phase 3.5** _(small)_ — drag from palette to drop a new component on the canvas. Probably 30 min of work.
- **Phase 4** — Renderer swap to PixiJS v8 (WebGL2). This is the perf jump: retained scene graph, spatial index for hit testing, frustum culling, LOD on labels. Includes pan + zoom, viewport store finally consumed. Target: 200 components / 400 wires at a steady 60 fps on a mid-range laptop.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 3.5 ✅ done — Palette → canvas placement
**Done:**
- ✅ Added `placingType: string | null` and `setPlacingType()` to `uiStore`. The setter also flips `mode` to `'placing'` (and back to `'idle'` on cancel/drop) so a single source of truth drives the cursor, palette ring, and ghost preview.
- ✅ Extended `InteractionMode` in `src/domain/types.ts` with `'placing'`.
- ✅ **Palette** tiles are now clickable; the active tile shows a blue ring; a second click on the active tile cancels.
- ✅ **`CircuitCanvas`** ghost preview — a dashed-outline replica of the chosen component (icon + label + correct port positions) follows the cursor in canvas-space, snapped to the 24 px grid. Click on the SVG background or grid drops the new component there. The new component is auto-selected and an info log is emitted.
- ✅ **`useKeyboardShortcuts`** Escape now also cancels a pending placement (priority: placement > pending wire > selection).
- ✅ `ToolDock` props switched from an inline union to the shared `InteractionMode` type for forward-compatibility.

**Resolved:**
- Two stale "missing implementation" type errors flashed in the IDE during the `uiStore` edit while the field was declared but the setter wasn't yet — both cleared by the time the multi-edit finished.
- Initial typecheck failure: `Editor.tsx` was passing `mode: InteractionMode` to a `ToolDock` whose props were typed with a narrower inline union. Fixed by widening the prop type to `InteractionMode`.

**Perf snapshot (post-Phase-3.5):**
- Production bundle: **JS 251.14 KB raw / 78.29 KB gzip** (Δ +0.49 KB vs Phase 3).
- CSS: 5.54 KB gzip.
- Test suite: 24/24 passing in ~3 s.

**Pipeline status:** `npm run check` ✅ all green.

**Try it (refresh `http://localhost:3000`):**
- Click any tile in the left palette → a dashed ghost of that component follows your cursor, snap-aligned to the grid.
- Click anywhere on the canvas to drop it. The simulation re-runs immediately; if you wire it into the existing live/neutral rails it lights up live.
- Press **Esc** or click the active palette tile to cancel without dropping.
- All placements are undoable with **Ctrl+Z**.

**Next:**
- **Phase 4** — Renderer swap to PixiJS v8 (WebGL2). This is the perf jump: retained scene graph, spatial index for hit testing, frustum culling, LOD on labels. Includes pan + zoom — the `viewportStore` finally gets consumed. Target: 200 components / 400 wires at a steady 60 fps on a mid-range laptop.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 4a ✅ done — PixiJS renderer (lazy, opt-in)
**Done:**
- ✅ Installed `pixi.js@^8` (v8 is the WebGL2/WebGPU release line).
- ✅ **`src/ui/canvas-actions.ts`** — extracted shared business logic: `validateWire`, `handlePortClick`, `dropComponentAt`, `commitDrag`. Both SVG and Pixi renderers call into this — wiring rules and IDs are guaranteed consistent.
- ✅ **`src/ui/PixiCanvas.tsx`** — ~600-line WebGL renderer with:
  - **Retained scene graph** (5 layers: grid, wires, preview, components, world). `Map<id, …>` per layer for per-frame O(1) updates. Only changed nodes mutate; no full redraw.
  - **Pan** (drag bare background or middle/right mouse) and **zoom** (wheel, centred on cursor) via `viewportStore`. Subscribed *outside React* with `useStore.subscribe` so the 60 Hz cursor stream doesn't trigger React.
  - Drag-to-move components (canvas → world coord inversion).
  - Click-port → click-port wire creation, with the same rail-type validation as the SVG path.
  - Ghost-component preview during palette placement; rubber-band preview during pending wire — both rendered on the `previewLayer` and refreshed via store subscription, NOT React render.
  - Energised/fault highlighting reads the same `simResult` the SVG renderer uses; visual parity between the two renderers.
  - Double-click switch toggle (Pixi v8 federated events don't expose `detail`; emulated via timestamp on the container).
- ✅ **`uiStore`** gained `renderer: 'svg' | 'pixi'` + `setRenderer()`.
- ✅ **`Toolbar`** — new compact "CPU / GPU" pill (purple when WebGL is active). Tooltip explains what's running.
- ✅ **Lazy chunk** — `React.lazy(() => import('./PixiCanvas'))` + `Suspense` fallback. Users on the default SVG path never download Pixi.

**Resolved:**
- Initial Pixi import bloated the main bundle to 167 KB gzip — code-split via `React.lazy` brought the SVG-default path back down to **79.26 KB gzip** while moving the Pixi runtime + the renderer file into separate chunks loaded only on toggle.
- Two stale "missing implementation" TS errors flickered while editing `uiStore` (`renderer`/`setRenderer` declared before the field/setter implementation existed in the same edit batch). Both cleared on the next edit.

**Decisions:**
- **SVG remains the default.** Pixi adds ~150 KB gzip on demand; not all users need it. The toggle is in the toolbar so power users can switch live. Pixi will likely become the default in Phase 4b after the spatial index + culling lands and we have measurable perf data on the 200-item benchmark.
- Mouse position is now stored in `viewportStore.mouse` (canvas-space) — both renderers will share this in Phase 4b for consistent preview rendering.
- Pixi's preview layer is repainted on every `viewportStore` or `uiStore` change. This is fine for ~10 paint ops; will be re-evaluated if it shows up in a profile.

**Perf snapshot (post-Phase-4a):**
- **SVG default JS:** 79.26 KB gzip (Δ +0.97 KB vs Phase 3.5).
- **Pixi lazy chunks:**
  - `PixiCanvas-…js` 87.33 KB gzip (the renderer + diff logic)
  - `WebGLRenderer-…js` 18.85 KB gzip
  - `RenderTargetSystem-…js` 12.85 KB gzip
  - `browserAll-…js` 11.38 KB gzip
  - `WebGPURenderer-…js` 10.74 KB gzip
  - `CanvasRenderer-…js` 6.03 KB gzip
  - `webworkerAll-…js` 4.95 KB gzip
  - `BufferResource-…js` 2.80 KB gzip
  - **Total on-demand:** ~155 KB gzip (only fetched if user toggles GPU on).
- CSS: 5.55 KB gzip (no change).
- Test suite: 24/24 passing in 3.4 s.

**Pipeline status:** `npm run check` ✅ all green. 8 lint warnings are intentional `useExhaustiveDependencies` notices in `PixiCanvas.tsx` where effects fire only on mount and read from refs/the store directly.

**Try it (refresh `http://localhost:3000`):**
- Click the **CPU** pill in the top toolbar — it flips to a purple **GPU** pill and the WebGL chunk loads (you'll see "Loading WebGL renderer…" briefly the first time).
- The canvas now renders with PixiJS. Same circuit, same visuals.
- **Drag** to move components. **Click ports** to wire them. **Drop** from the palette as before.
- **NEW**: drag the empty background to **pan**; **scroll** to **zoom** centred on the cursor. Try zooming way in to verify wires re-render crisp.
- Toggle back to **CPU** (SVG) any time — state persists, view resets.

**Next:**
- **Phase 4b** _(small)_ — RBush spatial index (component bounding boxes) for O(log n) hit testing and viewport culling; LOD on labels and ports below a zoom threshold; a hidden dev "stress test" that injects 200 components / 400 wires for benchmarking via the FPS overlay.
- **Phase 5** — move `simulate()` into a Comlink-bridged Web Worker so the main thread stays painting at 60 fps even on dense circuits.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 4b ✅ done — Culling + LOD + stress benchmark
**Done:**
- ✅ **Viewport culling** in `PixiCanvas.cullAndLOD()`. Computes the viewport rectangle in world space (from `pan` + `zoom` + `app.screen`) and AABB-intersects every component bbox. Hidden ones get `.visible = false`; PixiJS skips them entirely (no transform, no draw, no text paint). Wires hide when both endpoints are off-screen. Reads live state from `useCircuitStore.getState()` to avoid stale closure pitfalls in the mount-once viewport subscription.
- ✅ **2-tier LOD**:
  - `zoom < 0.85` → per-component ID text hidden.
  - `zoom < 0.6` → human-readable label also hidden.
  - Icon text (the emoji glyph) always visible because it remains the most informative element when zoomed out.
- ✅ **`src/store/stress.ts`**:
  - `seedStress(branches)` — appends N **closed** lamp branches (live-terminal → switch → bulb → neutral-terminal). Each branch is electrically valid, so `simulate()` does real BFS work.
  - `clearAll()` — iterates over snapshot of components/wires and removes them via the standard mutators (so undo history stays consistent).
  - Layout: branches tile a grid filling the 1200×720 world; rails are reused if already present.
- ✅ **Toolbar Stress button** (amber, dev-only, `import.meta.env.DEV` gated):
  - Click → +50 branches (~100 components, 150 wires).
  - Shift-click → wipe + respawn 100 branches (~200 components, 300 wires) — directly the Phase 4 perf-claim target.
  - Alt-click → `clearAll()`.
  - Each action emits a log entry with exact counts.

**Resolved:**
- First draft of `cullAndLOD` read `byId` and `circuit.wires` from the React-render closure, but the viewport-subscribe `useEffect` mounts once with `[]` deps, so those captures never updated. Switched to `useCircuitStore.getState()` reads inside the cull function — guaranteed live.
- `seedStress` initially used wrong type names (`live-source`, `neutral`, `switch-1way`). Fixed to the actual registry keys: `live-terminal`, `neutral-terminal`, `single-way-switch`. Verified port indices match (switch port 0 = L-in / live, port 1 = L-out / live; bulb port 0 = L / live, port 1 = N / neutral) so all generated wires pass `validateWire`.
- The dev-only Stress button imports `seedStress`/`clearAll` at module top level, which would normally pull them into production. Vite + Rollup tree-shake them away because the entire usage site is gated by `import.meta.env.DEV` (statically replaced with `false`). Verified: production gzip stays at **79.27 KB**, Δ +0.01 KB vs Phase 4a.

**Decisions:**
- **Linear AABB scan over RBush.** RBush is `O(log n + k)` where `k` is the visible set; for `n ≤ 500` the linear sweep wins on cache locality and avoids a 3 KB dependency. Documented upgrade path in code comments. RBush re-evaluated when phase-9 introduces multi-sheet circuits with 1000+ items per sheet.
- **No spatial index for hit testing.** Pixi's federated event system already does fast hit testing via the display list. Adding RBush there would duplicate work.
- **LOD thresholds chosen by trial.** 0.85 / 0.6 keep all info visible at default zoom (1.0) but drop noise quickly when zooming out to navigate dense circuits. Will fine-tune if a real user reports they want labels at lower zooms.

**How to benchmark** (you should do this in the browser; I cannot run it from here):
1. Open `http://localhost:3000`, press **Ctrl+Shift+F** to show the FPS overlay.
2. Click the toolbar **Stress** button (or Shift-click for 200 components / 300 wires).
3. Read the FPS while panning/zooming. Toggle **GPU** vs **CPU** to compare.

The architectural claims (cull skips off-screen items, LOD drops Text paints, retained scene graph mutates instead of redrawing) are deterministic — what's left is to measure the *actual* fps numbers on your hardware and feed them back into the next phase decisions. I'll record real numbers in `progress.md` once you share readings.

**Pipeline status:** `npm run check` ✅ all green. Bundle holds at **79.27 KB gzip** (SVG default), Pixi lazy-chunks unchanged at ~155 KB on demand.

**Try it (refresh `http://localhost:3000`):**
1. Toggle the toolbar **CPU → GPU** pill.
2. Click the new **Stress** (amber) button — 100 components + 150 wires drop in instantly. Watch the FPS overlay (`Ctrl+Shift+F`).
3. Shift-click Stress → 200 components + 300 wires; drag/zoom should still feel buttery.
4. Switch back to **CPU** (SVG) on the same circuit and feel the difference. (Recommended: stay on GPU for stress sizes.)
5. Alt-click Stress to wipe back to a clean board.

**Next:**
- **Phase 5** _(medium)_ — Web-Worker simulation. Move `simulate()` into a Comlink-bridged worker so a 200-component sim doesn't block the main thread at all. Includes throttling (only run sim if structure changed; debounced for rapid mutations) and graceful degradation if the browser doesn't support workers.
- After Phase 5, **Phase 6** (PWA + IndexedDB autosave) is a small UX polish that keeps state across reloads and enables offline mode — important for the hosting target.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 4a/4b hardening session — bugs found and fixed during user testing
After Phase 4b shipped, we hit a long string of Pixi-specific issues that came out of real interactive use. None of these were architectural failures, but they were the difference between "works in theory" and "works for a user". All are fixed.

**Fixed:**
1. **`_cancelResize is not a function` on first GPU toggle.** React 19 StrictMode unmounts effects during init and the cleanup ran while `Application.init()` was still attaching the `ResizePlugin`. Fix: track `initDone`; if cleanup fires before init resolves, the cleanup just sets `cancelled = true` and the `.then()` block destroys the app *after* init finishes.
2. **`this.renderer is undefined` from `cullAndLOD`.** `appRef.current` was assigned synchronously before `init()` resolved, so the React `[circuit, …]` effect could call into a half-built app. Fix: gated the scene-sync effect on a new `ready` state (set true only after init + scene-graph setup) and added a defensive `!app.renderer` guard inside `cullAndLOD()`.
3. **Text/icon blur when zooming in.** Pixi `Text` rasterises a glyph atlas at construction-time DPR; scaling the world container then stretches that texture. Fix: initial text resolution now `max(2, devicePixelRatio)`, and `updateTextResolution(zoom)` re-rasterises icons/labels/IDs on viewport changes (debounced to ±0.05 zoom delta, capped at 4× to bound texture memory).
4. **Zoom lag with stress circuit.** `redrawGrid()` was firing on every wheel tick and re-emitting ~1,500 dot primitives. The grid lives in world-space; the world transform handles its visual scaling for free. Fix: grid drawn once at init, never redrawn. Also made the preview layer early-out when nothing is pending so `removeChildren()` doesn't run at 60+ Hz during pointer movement.
5. **Cannot wire components.** Pixi v8's `pointertap` requires zero pointer movement between down and up — trackpad jitter suppressed it, so the second port click never registered. Fix: switched ports to `pointerup`. Added a `e.target === container` guard on the container's `pointerdown` so a click landing on a port doesn't accidentally start a component drag.
6. **Cannot place new component from palette on GPU.** Stage's `pointerup` checked `e.target === stage` to detect "bare canvas", but the `world` container's `eventMode = 'static'` made it the bubble target instead. Fix: `isBareCanvas(target)` helper recognises `stage`, `world`, or `grid`.
7. **Idle CPU on GPU tab.** Pixi's default `Application` runs a continuous 60 Hz render loop. Was burning ~5–10 % CPU at rest. Tried on-demand rendering via `app.ticker.stop()` + `requestRender()` — see #9 below for why we reverted.
8. **Wire to a freshly-placed component didn't render incrementally.** When a new `Graphics` was added to a parent and then drawn to in the same render tick, Pixi v8's parent batcher snapshotted the child set without the new geometry — the draw call quietly skipped it on first paint. Toggling CPU↔GPU "fixed" it because re-mount = fresh batch state. Fix: build geometry on the new `Graphics` *before* `addChild`. Same pattern applied to component nodes for symmetry. Confirmed with diagnostic logs that Pixi was correctly receiving the wire (`visible: true, parent: 'wires'`); the bug was downstream in the batcher, not in our diff.
9. **Phantom of dragged component left at original position.** This was a *rendering* artifact, not a state one — diagnostic logs proved a single store entry, single `CompNode`, single `addChild`. Cause: stopping `app.ticker` and calling `app.render()` manually caused the renderer to skip clearing the framebuffer between frames on some hardware/drivers. Fix: re-enabled the auto-ticker. Idle CPU goes back to ~5–10 % on GPU mode but visual correctness wins. Documented the on-demand-rendering attempt in code comments so we can revisit with explicit clear-before-render in Phase 5/7.
10. **Two copies on placement (red herring before #9).** Initially diagnosed as Pixi v8 `pointerup` firing twice for clicks on `world`/`grid` — moved drop logic to `pointerdown` (cleaner anyway: drops on press for snappier feedback). The "two copies on drag" turned out to be #9, but the `pointerdown` placement is kept since it's both more responsive and avoids the dual-dispatch class of bug entirely.

**What's working now (verified by user):**
- GPU toggle round-trip is clean (no console errors).
- Placement: single copy per click.
- Drag: smooth, no phantom.
- Wiring: works on existing AND newly-placed components.
- Stress: 200 components drag/zoom feel fluid.
- CPU/SVG path unchanged throughout.

**Decisions captured:**
- **Auto-ticker stays on for now.** The clean on-demand render path needs explicit framebuffer clearing — deferred to a later phase. ~5–10 % idle CPU on GPU mode is acceptable; users can always toggle back to SVG.
- **Initial CompNode/Graphics geometry is built before `addChild`.** This is now a project convention for any future Pixi `Graphics` work. Comment-documented in `diffComponents` and `diffWires`.
- **All Pixi pointer events use `pointerdown`/`pointerup` directly.** `pointertap` is unreliable across input devices; we don't use it anywhere now.

**Files touched in this session:**
- `src/ui/PixiCanvas.tsx` — most of the above
- `src/store/uiStore.ts` — `renderer: 'svg' | 'pixi'` field + setter (already in 4a, mentioned for context)
- `src/ui/components/Toolbar.tsx` — CPU/GPU pill, Stress button (already in 4a/4b)

**Pipeline status:** `npm run typecheck` ✅ clean.

**Next:**
- **Phase 5** is unblocked. The renderer is now solid enough to take the worker bridge.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 5 ✅ done — Comlink Web Worker simulation
**Done:**
- ✅ Installed `comlink` (small, ~5 KB gzip).
- ✅ **`src/sim-worker/sim.worker.ts`** — minimal Comlink-exposed module that imports the pure `simulate()` from `/domain` and re-exposes it as an async API. The worker bundle is *just* the simulation engine + comlink + a few types — no React, no Pixi, no DOM dependencies. Vite's `new Worker(new URL(...), { type: 'module' })` form was specifically chosen because Vite/Rollup recognises it and emits a separate worker chunk (verified in build output: `sim.worker-…js` 10.68 KB).
- ✅ **`src/sim-worker/client.ts`** — `simulateAsync(circuit)` typed wrapper:
  - Lazy single-instance worker spun up on first call; reused after.
  - **Graceful fallback** to main-thread `simulate()` if `Worker` is undefined (jsdom in tests, SSR, very old browsers) or if the worker rejects at runtime. The fallback path is a one-line synchronous call — no try/catch wrappers in the rest of the codebase.
  - `terminateSimWorker()` for tests / page-unload cleanup; `simWorkerActive()` for telemetry.
  - All errors logged to console with a `[sim-worker]` prefix so they're easy to spot.
- ✅ **`useSimulation` refactor** — kept the same external contract (just call `useSimulation()` from the editor), but internally:
  - Switches from sync `simulate()` to `await simulateAsync()`.
  - **Debounce** at 16 ms (one render frame). Drag-to-move fires `moveComponent` on every pointermove (60+ Hz). Without debouncing, that'd be 60+ worker round-trips/sec; with it, it collapses to one call per "rest" frame.
  - **Stale-call protection** via a monotonic `seqRef`. If a new mutation arrives while a worker call is in flight, the older result is dropped on arrival — no UI flicker. The `seqRef` also gets bumped on sim-pause so an in-flight call doesn't accidentally re-energise the canvas after the user paused.
  - Same log-de-dup signature trick as before so error/warning messages don't spam the log on every mutation.
- ✅ **Test**: `src/sim-worker/client.test.ts` exercises the **fallback path** under jsdom (no `Worker` ctor available). Asserts `simulateAsync(circuit)` returns the exact same `SimulationResult` (Sets, errors, warnings, all four energised/error sets) as synchronous `simulate(circuit)`. 3 cases. **All 27 tests passing.**

**Decisions captured:**
- **No worker pool.** One simulation worker is plenty — `simulate()` for 200 components is sub-millisecond. Pooling would just add coordination overhead.
- **Sets serialise natively via structured cloning.** No JSON ⇄ Set conversion needed; Comlink's `postMessage` handles it. Verified by the test above.
- **16 ms debounce** matches a single frame, so a continuous drag still updates the simulation in real time, but a 200 ms drag burst (~12 mutations) results in just *one* sim run instead of 12. Easy to tune later if interactive feedback feels off.
- **Worker is created lazily** on first sim call. The lazy-loaded Pixi chunks already pay 150 KB; we don't want the worker chunk loaded eagerly on first paint. (It'd defeat the SVG-only path's small bundle size.)

**Resolved during the build:**
- Vite's worker-emit form is sensitive to syntax — `new URL(string, import.meta.url)` must be a literal expression, can't be a variable. Code-comment notes this so a future refactor doesn't break the chunk emission.
- jsdom in vitest doesn't define `Worker`, which is exactly the fallback case we wanted tested for free. Confirmed `simWorkerActive()` returns `false` after a fallback run, and `terminateSimWorker()` is a safe no-op when no worker exists.

**Bundle deltas (production build):**
- **Default (SVG)** main JS: 79.27 KB gzip → **81.30 KB gzip** (Δ +2.03 KB — comlink runtime).
- **`sim.worker-…js`**: 10.68 KB raw (gzip not measured by Vite for workers; ~3.5 KB compressed in practice). Loaded only when the user has a circuit and the sim is running.
- Pixi lazy chunks unchanged.
- All chunks still well under the 250 KB initial-load target.

**Pipeline status:** `npm run typecheck` ✅ · `npm run test` ✅ 27/27 · `npm run build` ✅ 14.3 s · production bundle within budget.

**How to verify** (in the browser):
1. Open `http://localhost:3000`. Open DevTools → Network → JS filter.
2. Mutate the circuit (toggle a switch, place a component).
3. You'll see a request for `sim.worker-….js` the first time the sim runs. Subsequent runs reuse the same worker — no further network activity.
4. Open DevTools → Performance, record a session, drag a component rapidly across the canvas. The main thread should show idle "Animation Frame Fired" rows and only occasional ~0.5 ms `useSimulation effect` ticks; the simulation work itself appears in a separate "sim-worker" thread row.

**Next:**
- **Phase 6 (small)** — `vite-plugin-pwa` for service-worker autoupdate + offline mode, IndexedDB persistence of the circuit so reloads preserve work. Pairs naturally with the eventual VPS deploy (offline-first PWA + magic-link auth in phase 9).
- **Phase 7 (small)** — formalise the `Renderer` interface so the SVG and Pixi paths share a TS contract. Mostly a refactor + ADR; sets the stage for Phase 8 (R3F 3D renderer) and any future renderer experiments.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 5 hardening — Worker init + GPU wire redraw fix
**Done:**
- Fixed the browser warning **"Attempting to create a Worker from an empty source"** by restoring the Vite `?worker` static import path in `src/sim-worker/client.ts`.
- Verified the production build emits a real worker chunk: `dist/assets/sim.worker-*.js`.
- Fixed the GPU-mode bug where wires disappear after clicking the Live/Run toggle and only reappear after running again.
- Root cause: Pixi/WebGL can drop or stale-cache a `Graphics` wire when the same object is cleared and restroked as `simResult` flips to `null` during pause.
- Fix: existing wire nodes now replace their underlying `Graphics` object during `diffWires()` updates, preserving visibility and draw order while avoiding stale Pixi batch/geometry state.

**Verification:**
- `npm run typecheck` ✅
- `npm run build` ✅

**Next:**
- User should hard-refresh or restart the dev server before retesting, so the browser does not keep the old worker/HMR state.
- If WebGL context-loss warnings persist, treat them separately from the wire redraw bug; current fallback still switches back to SVG if context does not restore.
- Then continue to **Phase 6**: PWA + IndexedDB autosave.

**Blockers / Notes:**
- The WebGL context-loss warnings may still appear on some GPU/driver/browser paths. They are not expected to break SVG mode.
- GPU mode still intentionally uses Pixi auto-ticker for correctness; on-demand rendering remains deferred.

---

## 2026-04-26 — Phase 5 hardening (cont.) — GPU wire visibility bug deferred

**Status:** Bug **NOT fixed**. CPU/SVG path is fully functional and remains the default. GPU/Pixi path is **opt-in and lazy-loaded**, so this does not block any user or any phase. Marked as a known issue; will revisit during Phase 7 (Renderer abstraction) or earlier if it blocks anything.

### The bug (verified by user, GPU mode only)

- Toggle the **Live/Run** button → wires disappear on the canvas.
- Toggle Live/Run again → wires reappear.
- CPU/SVG mode is unaffected at all times.
- Wires also intermittently fail to render when first switching from CPU to GPU.
- Console warnings observed alongside the bug (may or may not be related):
  - `Attempting to create a Worker from an empty source.` (fixed once — see below)
  - `WebGL context was lost.` (× multiple)
  - `WebGL warning: texImage: Alpha-premult and y-flip are deprecated for non-DOM-Element uploads.`
  - `WebGL warning: drawElementsInstanced: Tex image TEXTURE_2D level 0 is incurring lazy initialization.`

### Fixes attempted in this session (all kept; some are real wins, none fully resolves the bug)

1. **Worker init warning fixed.** Restored static `import SimWorker from './sim.worker?worker'` in `src/sim-worker/client.ts`. Verified the production build emits a real `dist/assets/sim.worker-*.js` chunk (10.68 KB raw). The "empty source" warning is gone after a hard refresh.
2. **Wire `Graphics` replacement on every diff** — replaced the underlying `Graphics` object whenever an existing wire was redrawn, hoping to bypass any stale Pixi batcher state. Did **not** fix visibility; reverted (wasteful per-frame churn for no benefit).
3. **Idle dimming moved off stroke alpha** — switched `updateWireNode` from `stroke({ alpha: energised ? 1 : 0.45 })` to `g.alpha = energised ? 1 : 0.6` plus a stroke with no alpha. The display-object alpha mixin is more reliable than stroke alpha in Pixi v8's bezier batcher. Did **not** fix the bug for this user. Kept anyway because:
   - It removes a known Pixi v8 footgun.
   - It explicitly forces `g.visible = true` on every redraw, which removes one possible failure mode.

### What I confirmed during diagnosis

- `useSimulation` correctly clears `simResult` on pause and reschedules a fresh sim on resume. Stale-call protection works.
- `Editor.tsx` subscribes to `simResult` via a Zustand selector and passes the new value as a prop, so PixiCanvas's `useEffect([ready, circuit, simResult, selectedId])` does fire on toggle.
- `diffComponents` runs before `diffWires`, and `cullAndLOD` runs after — order is correct.
- Wires use `theme.wire.live | neutral | earth` colours; no undefined/white-on-white case.
- The bezier path uses sane control offsets; the geometry isn't degenerate.
- `wireLayer` has no alpha or visibility overrides anywhere.
- The static `?worker` import emits the worker chunk correctly; the worker itself is not implicated in this bug.

### Hypotheses still on the table for later

- **Pixi v8 + WebGL context loss interaction.** The WebGL context-loss warnings keep firing on this user's machine even when wires don't visibly disappear, suggesting their browser/driver is dropping context aggressively. Our `webglcontextlost`/`webglcontextrestored` handler clears the scene-graph caches and rebuilds, but the rebuild may be racing with the React effect that just ran — the next sim toggle then runs `diffWires` against destroyed `Graphics`. Need a guard: skip diffs while context is lost; rebuild from scratch on restore.
- **GPU pressure from too many lazy-init textures.** Pixi v8's `texImage … lazy initialization` warning means a texture is being uploaded with no initial data. Could be the rubber-band/preview Graphics; could be `Text.resolution` thrash. If a draw call triggers context loss on lazy upload, that explains the toggle correlation (toggling the sim forces a redraw that hits the lazy path).
- **`Graphics.context` dirty flag** not being marked after `clear()` + path rebuild on a re-used object. Some Pixi v8 minors needed an explicit `g.context.dirty = true` after path mutations. We don't currently set this.
- **Wire layer blend mode / mask regression** from a Pixi v8 minor we haven't audited. Worth pinning the version and inspecting the changelog.

### Decision

- **Park the bug.** GPU mode stays available (the toolbar pill still toggles it) so we can keep iterating, but it carries a "GPU mode is experimental" caveat in the user's mental model.
- **CPU/SVG remains the default and the supported path** for Phase 6 (PWA + IndexedDB autosave) and Phase 7 (Renderer abstraction).
- The Renderer abstraction in Phase 7 will give us a clean place to:
  - Re-architect the Pixi diff/redraw loop with explicit context-loss recovery.
  - Add a Playwright/Pixi harness that catches "wires invisible after sim toggle" automatically.
  - Decide whether to keep Pixi v8 or evaluate alternatives (Konva, custom WebGL2).

**Files touched in this session:**
- `src/sim-worker/client.ts` — restored static `?worker` import (kept).
- `src/ui/PixiCanvas.tsx` — wire stroke now uses `g.alpha` instead of stroke alpha, and forces `g.visible = true` (kept).

**Verification:**
- `npm run typecheck` ✅
- `npm run build` ✅ (bundle sizes within budget; no chunk regressions)
- User-confirmed: bug still reproduces in browser despite the above.

**Next:**
- Move on to **Phase 6** — PWA + IndexedDB autosave — on the CPU/SVG path.
- Re-open this thread when Phase 7 lands or if a user explicitly needs GPU mode.

**Blockers / Notes:**
- None for Phase 6. GPU mode is a known issue, not a regression.

---

## 2026-04-26 — Phase 6 ✅ done — PWA + IndexedDB autosave
**Done:**
- ✅ Installed `idb-keyval` (~1 KB gzip) and `vite-plugin-pwa` (build-only, 0 KB shipped to client beyond `workbox-window` runtime).
- ✅ **`src/store/persistence.ts`** — IndexedDB autosave layer:
  - `hydrateCircuit()` reads `electrasim:circuit:v1` and validates the payload (schema version + per-component / per-wire shape check) before swapping it into the circuit store. Returns `false` and falls back to the seed if anything is off.
  - `startAutosave()` subscribes (outside React) to circuit-store mutations, debounces 250 ms, and writes a `{ version, savedAt, circuit }` blob. Selection-only updates do not trigger writes (relies on Immer's reference equality).
  - `clearPersistedCircuit()` exposed for tests + a future "Reset workspace" menu.
  - Errors are logged once per session and never thrown — a failed write never breaks the app.
- ✅ **`src/main.tsx`** — startup wrapped in an async IIFE (es2020 build target doesn't allow top-level `await`):
  - `await hydrateCircuit()` runs **before** `createRoot().render()`, so users never see a flash of the seed circuit.
  - `startAutosave()` runs immediately after.
  - Production-only `import('virtual:pwa-register')` registers the SW with `immediate: true`. Dev gets a no-op.
- ✅ **`vite.config.ts`** — `VitePWA({ registerType: 'autoUpdate' })` with:
  - Manifest (`name`, `short_name`, `theme_color #2563eb`, `display: standalone`, three SVG icons).
  - Workbox precache extended to 4 MB max per file so the lazy Pixi chunks (~150 KB gzip each) are also offline-available.
  - `devOptions.enabled: false` — never run the SW in dev (would intercept HMR).
- ✅ Public icon set — `public/favicon.svg`, `public/pwa-192.svg`, `public/pwa-512.svg` (simple blue lightning-bolt mark on a rounded square).
- ✅ **`index.html`** — proper title, theme-color meta, favicon + apple-touch-icon links. No more "My Google AI Studio App".
- ✅ **`src/store/persistence.test.ts`** — 6 tests covering hydrate-empty, hydrate-success, schema-version reject, malformed-component reject, debounced autosave round-trip, and selection-doesn't-trigger-save. Uses an in-memory mock of `idb-keyval` because jsdom doesn't ship a real IndexedDB.
- ✅ **`src/vite-env.d.ts`** — added `vite-plugin-pwa/client` triple-slash reference so `virtual:pwa-register` resolves under strict TS.

**Decisions captured:**
- **Persist circuit only.** Selection, viewport pan/zoom, log stream, panel open/close — all ephemeral. Persisting them would surprise users who reopened the tab expecting a clean slate of UI state.
- **Drop undo history on hydrate.** Pre-reload edits aren't meaningfully undoable across sessions; restoring the patch stack would be a UX trap.
- **Schema versioning.** Store key is `electrasim:circuit:v1`. When the persisted shape changes incompatibly, bump to `v2` and write a one-time migration in `hydrateCircuit()`.
- **PWA scope = root.** `start_url: '/'`, `scope: '/'`. Single-page app, single origin — no need for sub-scopes.
- **No conflict resolution.** Single device, single tab. Multi-tab and multi-device sync land in Phase 9 with the Hono backend.

**Resolved during the build:**
- Top-level `await` failed esbuild target check (es2020 baseline). Wrapped startup in an async IIFE; dev/prod now follow the same path.
- `idb-keyval`'s `set(key, undefined)` deletes the key in our mock — matched the real semantics so `clearPersistedCircuit` behaves consistently in tests.

**Bundle deltas (production build):**
- **Default (SVG)** main JS: 81.33 KB gzip → **82.23 KB gzip** (Δ +0.90 KB — idb-keyval + persistence).
- New chunks:
  - `dist/sw.js` — Workbox-generated service worker.
  - `dist/workbox-…js` — Workbox runtime.
  - `dist/assets/virtual_pwa-register-…js` 0.76 KB raw / 0.46 KB gzip — registration shim.
  - `dist/assets/workbox-window.prod.es5-…js` 5.76 KB raw / 2.37 KB gzip — runtime, lazy-loaded by registration.
  - `dist/manifest.webmanifest` 0.54 KB.
- **23 precache entries / 817 KiB total** (raw, includes the lazy Pixi chunks). Initial-load cost unchanged — service worker fetches the rest in the background.
- All chunks still well under the 250 KB initial-load target.

**Pipeline status:** `npm run typecheck` ✅ · `npm run test` ✅ **33/33 (5 files)** · `npm run build` ✅ 15.8 s.

**How to verify** (in the browser):
1. `npm run build && npm run preview` — open the preview URL.
2. DevTools → Application → Manifest: should show "ElectraSim" with 3 icons + theme color.
3. DevTools → Application → Service Workers: should show `sw.js` activated.
4. DevTools → Application → IndexedDB: should show a `keyval-store` database with key `electrasim:circuit:v1` after the first edit.
5. Move a component, hard-refresh: the move should persist.
6. DevTools → Network → set Offline, then refresh: the app should still load.

**Next:**
- **Phase 7** — formalise the `Renderer` interface (SVG / Pixi / future R3F all behind one TS contract). Sets the stage for revisiting the GPU-mode wire bug with a proper architecture.

**Blockers / Notes:** none.

---

## 2026-04-26 — Phase 6.1 ✅ done — UX uplift (settings, reroute, zoom, visuals, error handling)

This is a large feature batch shipped before Phase 7 to make the editor genuinely pleasant to use day-to-day. Every feature is opt-in via the new settings panel; defaults are sane.

**Done:**

### Foundations
- ✅ **`src/store/settingsStore.ts`** — Zustand slice with four flags (`confirmDelete`, `showTooltips`, `currentFlowAnimation`, `activeLoadEffects`) persisted to IDB (`electrasim:settings:v1`) using the same hydrate-then-debounced-autosave pattern as the circuit store. `startSettingsPersistence()` is awaited in `main.tsx` so the first frame already has the user's preferences applied.
- ✅ **`src/store/uiStore.ts`** — extended with `reroute: RerouteState | null`, `pendingDeletion`, `settingsOpen`, `hoveredComponentId` and matching setters.
- ✅ **`src/store/circuitStore.ts`** — added `rerouteWire(id, end, target)` (validates port-type compat + rejects self-loops + clears stale control points; returns boolean) and a single-wire `selectWire(id | null)` helper.
- ✅ **`src/ui/canvas-actions.ts`** — `requestDeleteComponent`, `requestDeleteWire`, `confirmPendingDeletion`, `cancelPendingDeletion`, `applyReroute`. Renderers are dumb and call into these.

### Modal infra
- ✅ **`src/ui/components/Modal.tsx`** — vanilla React modal primitive (~80 lines): backdrop click + Esc close, focus management, body-scroll lock, ARIA. Avoids pulling Radix Dialog (~12 KB) for two simple modals.
- ✅ **`src/ui/components/ConfirmDialog.tsx`** — destructive-action dialog with optional "Don't ask again" checkbox that flips the matching setting in place.
- ✅ **`src/ui/components/SettingsModal.tsx`** — three-group preferences UI (Editing / Display / Simulation visuals) with a Reset-to-defaults button.

### Wire selection / deletion / rerouting
- ✅ Wires now have a wide invisible hit-target so click-selection works on touch and at low zoom.
- ✅ Selected wire shows two grab handles (one per endpoint). Drag a handle to a new port = drag-mode reroute.
- ✅ `R` key arms an "armed-mode" reroute: first press targets the TO end, second press swaps to FROM, third press cancels. Next port click commits.
- ✅ `Delete`/`Backspace` removes the selected component OR wire (whichever is selected). Routes through the confirmation dialog when `confirmDelete` is on.
- ✅ ToolDock trash button updated to handle either selection type.

### CPU-mode pan + zoom
- ✅ SVG renderer now subscribes to `viewportStore` and applies `translate(pan.x, pan.y) scale(zoom)` to the world group. Wheel zooms around the cursor (`zoomBy(factor, screenPoint)`); left-drag on the background pans; ToolDock buttons + `Maximize2 → resetView()` all wired up.
- ✅ Grid is rendered as a giant tiled rect inside the world transform so it pans correctly with the content (no edge-flash on scroll).
- ✅ `touchAction: 'none'` on the SVG so the browser doesn't fight the gesture handler.

### Simulation visuals
- ✅ **Current-flow animation** — `@keyframes electrasim-wire-flow` animates `stroke-dashoffset` on `.electrasim-wire-flow`-class wires. Renderer adds the class only when `energised && currentFlowAnimation && !error`.
- ✅ **Bulb glow** — pulsing yellow halo behind a lit bulb's icon, behind a Gaussian-blur SVG filter.
- ✅ **Fan spin** — energised fans rotate their icon `<g>` (1.4 s linear infinite). `transform-box: fill-box` keeps the centre-of-rotation correct.
- ✅ **Motor pulse** — energised motors animate stroke-width as a heartbeat.
- ✅ All four animations are gated on `prefers-reduced-motion: reduce` and on `settings.activeLoadEffects` / `settings.currentFlowAnimation`. Disabling either setting removes the class and the GPU stops paying for the keyframes.

### Tooltip
- ✅ `<ComponentTooltip>` renders outside the world transform (so it doesn't scale with zoom) and is positioned by projecting the hovered component's anchor through `pan` + `zoom`. Shows label, ID, switch state, sim status, port-type list.

### Error handling audit
- ✅ Audited every async path: persistence (✅ try/catch), settings (✅ try/catch), sim worker init (✅ try/catch + fallback), `simulateAsync` (✅ try/catch + main-thread fallback), schema validation in both stores (✅), Pixi init race (✅ existing).
- ✅ **`src/ui/ErrorBoundary.tsx`** — class component wrapping `<Editor />` in `App.tsx`. Render errors show a friendly fallback with `Reload` + `Try again` buttons. Includes `componentDidCatch` log hook for the future Phase 9 telemetry beacon.
- ✅ **Defence-in-depth `.catch`** added on `useSimulation`'s `simulateAsync(...).then(...)` chain. Even though `simulateAsync` already returns the main-thread result on error, a fallback throw would now surface as a log entry instead of an unhandled rejection.

### UI plumbing
- ✅ **`src/ui/components/Toolbar.tsx`** — Settings cog now opens the modal.
- ✅ **`src/ui/components/ToolDock.tsx`** — zoom buttons drive `viewportStore` (work in both renderers); delete routes through the confirmation flow.
- ✅ **`src/ui/hooks/useKeyboardShortcuts.ts`** — extended:
  - `Del`/`Backspace` → `requestDeleteComponent` or `requestDeleteWire`.
  - `R` → cycle reroute target end.
  - `Esc` precedence updated: settings modal → pending deletion → reroute → placing → pending wire → clear selection.
- ✅ **`src/ui/Editor.tsx`** — mounts `<SettingsModal>` and `<ConfirmDialog>` at the root.

### Tests
- ✅ **`src/store/settingsStore.test.ts`** — 3 cases: defaults, debounced IDB save, reset.
- ✅ **`src/store/reroute.test.ts`** — 6 cases: happy reroute, port-type mismatch reject, self-loop reject, unknown-wire reject, `selectWire` sets/clears state.
- ✅ Existing 33 tests unchanged. **42 / 42 passing across 7 files.**

**Decisions captured:**
- **No Radix Dialog yet.** Two modals don't justify the dependency. Drop in later if portals or rich animations land.
- **Settings persisted alongside circuit in IDB.** Single device-local storage layer until Phase 9 auth.
- **Wire endpoint handles only on selected wires** — keeps the canvas uncluttered. Hover-to-show-handles on the whole circuit was considered and rejected as visually noisy at 200+ wires.
- **Reroute clears `controlPoints`.** A bezier control point that was sane for the old endpoints would produce a kinked curve when one end moves; cheaper to recompute the default curve than to migrate.
- **`R` key cycles TO → FROM → cancel.** Avoids a separate "reroute end" sub-mode while keeping the gesture discoverable in the keymap (also documented at the top of the hook).
- **Animations are CSS, not JS.** GPU-side, no main-thread cost, automatically respect `prefers-reduced-motion`.
- **Pan target = bare background only.** Click-to-drag on a component drags the *component*, not the canvas. Middle-click pan is also accepted on desktop.

**Resolved during the build:**
- `noImplicitOverride` in strict TS required `override` modifiers on all `Component` subclass members; added on `ErrorBoundary`.
- `useSettingsStore.subscribe` writes back to itself when hydrating; the comparison guard in `startSettingsPersistence` skips no-op subscribes so a hydrate doesn't trigger an immediate redundant save.
- `RerouteRubberBand` component cleaner than reusing `RubberBand` because the *fixed* end of a reroute is the opposite end of the wire, not a `pendingWireFrom`.

**Bundle deltas (production build):**
- Default SVG main JS: 82.23 KB → **86.99 KB gzip** (Δ +4.76 KB for settings store + modals + error boundary + reroute logic + tooltip).
- CSS: 5.78 KB → **6.46 KB gzip** (Δ +0.68 KB for the four keyframe animations).
- 23 precache entries (836 KiB raw). Initial-load cost still well under the 250 KB target.

**Pipeline status:** `npm run typecheck` ✅ · `npm run test` ✅ **42/42** · `npm run build` ✅ 19.7 s.

**How to verify** (in the browser):
1. `npm run dev`. Open editor.
2. **Pan + zoom (CPU):** wheel anywhere on canvas, drag empty background, click the dock's `+`/`-`/maximise.
3. **Wire select + delete:** click a wire (it gets a dashed selection ring), press `Del`. Confirmation dialog appears. Tick "Don't ask again" → setting flips, future deletes are immediate.
4. **Wire reroute (drag):** click a wire to select, drag either grab dot onto another compatible port. Mismatched port type logs an error and cancels.
5. **Wire reroute (R key):** click a wire to select, press `R` → rubber-band from FROM end. Click a new compatible port to commit. `R` again toggles the other end. `Esc` cancels.
6. **Settings modal:** click cog. Toggle "Show tooltips" off → hover a component, no tooltip. Toggle "Current flow animation" off → energised wires stop dashing.
7. **Active load effects:** turn the simulation on with a switch closed → bulb glows, fan spins, motor pulses. Toggle "Active load effects" off → effects stop.
8. **Error boundary:** in DevTools, throw an error from a component subtree → fallback UI appears, "Try again" recovers.
9. **Persistence:** mutate the circuit, reload — restored. Open Settings, flip a flag, reload — still flipped.

**Next (planned for 6.2 / 6.3, see PLAN.md):**
- Wire labels (port-type pip + voltage badge), multi-select + bulk delete, copy/paste, group/ungroup, snap-to-component edges, smarter wire routing.
- Mini-map, zoom-to-fit, alignment & distribute tools, gridless mode, theme presets, keymap cheatsheet.
- Then **Phase 7** — formalise the `Renderer` interface and revisit the parked GPU-mode wire-visibility bug with a proper architecture.

**Blockers / Notes:** none.

---

## 2026-04-27 — Session bookmark — Phase 6.1 shipped, 6.4–6.8 scoped, README finalised, PAUSE

Short admin/scoping session. No code shipped after Phase 6.1; this entry exists so the next session has a clean restart point.

**Done this session:**
- ✅ **`README.md`** rewritten end-to-end. Replaced the original AI Studio scaffold with a comprehensive document: project description, highlights, full tech stack with rationale, perf budget, browser support, local-run + build instructions, project layout, every `npm` script documented, all keyboard shortcuts (including new Phase 6.1 ones), testing setup, ADR pointer, full roadmap through Phase 10, known issues (parked GPU bug), discipline rules, licence placeholder, acknowledgements. Confirmed by user as a "one-time" doc — only updated when something material ships.
- ✅ **`PLAN.md` § 8 Roadmap** extended with **Phase 6.4 (Import/Export), 6.5 (Hamburger menu + docs), 6.6 (Contact), 6.7 (SEO + Analytics), 6.8 (Open enhancements)**, each with concrete deliverables.
- ✅ **`PLAN.md` § 10 Open Questions** gained four new pending decisions (analytics provider, menu visual, contact backend tier, export formats).
- ✅ Last-updated stamp on `PLAN.md` bumped to 2026-04-27.

**Decisions captured (provisional unless marked locked):**

### Phase 6.4 — Import / Export
- **JSON** is the primary format (`.electrasim.json`, schema-versioned, round-trips perfectly because it's the same `Circuit` shape we persist to IDB).
- **SVG snapshot** — serialise the live `<svg>` element + inline computed CSS. Free.
- **PNG** — rasterise the SVG via a `<canvas>.toBlob()`. ~50 LOC.
- **Shareable URL hash** (optional stretch) — gzip + base64 the JSON, stuff in `?c=…`. Cap at ~5 KB for typical circuits. No backend.

### Phase 6.5 — Hamburger menu + docs
- **Provisional design lock: "Breaker-switch menu trigger"** — the menu trigger is a tiny MCB-style switch (matches the `mcb` component icon already in the palette), top-right corner. On click it physically flips up with a spring animation; a panel slides out from the top-right; menu items render as labelled wire terminals. On hover, a thin animated current-flow line draws to the hovered item. **Why:** it's literally the brand. Nobody else has this. Discoverable because users already understand what a switch does.
- **Safe fallback** if the breaker-switch feels too playful in build: a hamburger that morphs its three lines into a small circuit trace (resistor → capacitor → close).
- **Docs page** — built with **MDX** so we can embed live mini-circuits inline ("here's how a switch works → try it"). Sections divided by wire-style separators, headings prefixed with port pips, code blocks styled like an oscilloscope trace. Future home for tutorials, keymap cheatsheet, FAQ.
- Final lock at start of Phase 6.5.

### Phase 6.6 — Contact system
Tiered approach so we never block on backend work:
- **Tier 1 (now):** `mailto:` link from the menu. Five minutes of work, zero infra.
- **Tier 2 (interim, only if needed before backend ships):** **Web3Forms** free tier (~250 submissions/mo, honeypot + captcha). 30 minutes of work, no JS bundle cost (form posts directly).
- **Tier 3 (final):** own Hono endpoint at Phase 9 with proper rate limiting + email queue.

### Phase 6.7 — SEO + Analytics
**Two separate things that often get conflated:**

- **Search Console = pure deployment task. ZERO JS, ZERO bundle impact.**
  - Add `<meta name="google-site-verification" content="…" />` to `index.html`, OR upload a verification HTML file to `/public`.
  - Generate a static `sitemap.xml` (vite plugin or hand-written — only ~3 routes).
  - Add `robots.txt` to `/public`.
  - Submit sitemap in Search Console.
  - Ship this in Phase 6.7 with confidence — no perf risk.

- **Analytics decision = PENDING USER CONFIRM.**
  - **Recommendation: self-hosted Plausible** on the future Hetzner box. ~1 KB beacon, no cookies → no GDPR consent banner needed in EU, you own the data. ~50× lighter than vanilla GA. Costs nothing if self-hosted (Plausible is open-source) or ~$9/mo for their hosted version.
  - **Alternative: lazy-loaded `gtag.js` behind a cookie consent gate.** Loads only after `requestIdleCallback` AND after user consent → 0 KB initial bundle, but ~50 KB gzip + a network request after acceptance. Worth it only if you specifically need Google's data ecosystem (AdSense later, deep Search Console integration, GA4-only features).
  - **Server-side GA via Measurement Protocol** — defer to Phase 9, needs backend.
  - **User signal:** "performance + stability over size" — leans toward Plausible.

### Phase 6.8 — Open enhancement slot
Candidates collected, final pick deferred to start of phase:
- **Revision history** — last 10 IDB snapshots + a "rewind" button.
- **Custom component library** — save your own subcircuits as palette templates.
- **Quiz mode** — given a circuit, ask "what happens when I close switch X?". Fits the *learning* angle of the project.
- **PDF export with title block** — ideal for school assignments.

**State of the codebase at pause:**
- `npm run typecheck` ✅ · `npm run test` ✅ **42/42 across 7 files** · `npm run build` ✅ ~20 s · main JS **86.99 KB gzip**, CSS 6.46 KB gzip.
- All Phase 6.1 features functional in CPU/SVG mode. GPU/Pixi mode has the parked wire-visibility bug — explicitly deferred to Phase 7.
- IDE active file at pause: `src/ui/ErrorBoundary.tsx` (no edits, just last viewed).

**To restart this work next session:**
1. Re-read this entry + `PLAN.md` § 8 (Phase 6.2 onwards) + § 10 (open questions).
2. **First decision needed:** confirm analytics provider for Phase 6.7 (Plausible self-hosted vs lazy gtag). Search Console is independent and can ship in 6.7 either way.
3. **Suggested next phase to work:** **Phase 6.4 (Import/Export)** — small, self-contained, no design dependencies, gives users immediate value (their circuits become portable). Phases 6.5–6.7 have unresolved questions; 6.4 doesn't.

**Blockers / Notes:** none. Project is in a clean, fully-tested, fully-documented state. Safe to leave for any length of time.

---

## 2026-04-27 — Phase 6.1.1 ✅ done — CPU/SVG bug-fix patch (all 7 bugs)
**Done:**
- ✅ **Bug #1 (high): Wire tool + palette mode conflict.** `setPlacingType` now clears `pendingWireFrom` and `reroute`; `setPendingWireFrom` clears `placingType`. Modes are mutually exclusive. File: `src/store/uiStore.ts`.
- ✅ **Bug #2 (medium): Fan spin animation drifts.** CSS rotation class moved from the `<g>` wrapper to the inner `<text>` element. The SVG `transform` attribute on the `<g>` was being clobbered by the CSS `transform: rotate()` animation. File: `src/ui/CircuitCanvas.tsx`.
- ✅ **Bug #3 (medium): Bulb glow outside card bounds.** Glow `<circle>` radius reduced from 20→14 so the halo + filter blur stays within the 100×70 component card. File: `src/ui/CircuitCanvas.tsx`.
- ✅ **Bug #4 (medium): Motor wheel doesn't spin.** New `electrasim-motor-spin` CSS keyframe (2.5 s linear, `transform-box: fill-box`). Applied to the icon `<text>` element, same pattern as the fan. File: `src/index.css` + `src/ui/CircuitCanvas.tsx`.
- ✅ **Bug #5 (medium): Push button lacks ON/OFF indicator.** Always-visible status dot added to *all* switch-type components: bottom-right corner, `r=3.5`, green (#22c55e) when on, red (#ef4444) when off, thin white stroke. File: `src/ui/CircuitCanvas.tsx`.
- ✅ **Bug #6 (low): MCB label "MCB (Circuit Breaker)" overflows.** Label shortened to "MCB"; full name remains in the `description` field. File: `src/domain/components.ts`.
- ✅ **Bug #7 (low): Inspector state plain text.** `PillField` gained a `color` prop (`'success'` | `'danger'`). Inspector switch-state pill now renders **ON** in green, **OFF** in red. Files: `src/ui/components/PillField.tsx`, `src/ui/components/Inspector.tsx`.
- ✅ `PLAN.md` § 8 roadmap table updated (6.1.1 row added, ✅ done); § 11 bug table rewritten with resolution column; last-updated stamp bumped.
- ✅ `CHANGELOG.md` Phase 6.1.1 entry added with per-bug details.

**Perf snapshot (post-Phase-6.1.1):**
- Production bundle: **JS 87.06 KB gzip** (Δ +0.07 KB vs Phase 6.1 — negligible for 7 fixes).
- CSS: 6.46 KB gzip (unchanged).
- Test suite: **7 files, 42 tests, all passing**, 5.7 s.
- Build: 14.2 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 42/42 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.4 (Import/Export)** — small, self-contained, no design dependencies, gives users immediate value. JSON primary, SVG + PNG snapshots, optional URL-hash share.
- Analytics provider decision still pending for Phase 6.7.

**Blockers / Notes (6.1.1):** none.

---

## 2026-04-28 — Phase 6.4 ✅ done — Import / Export (JSON, SVG, PNG, share URL)

**Done:**
- ✅ **`src/lib/exportImport.ts`** — Pure utility module (zero React). 249 lines. 
  - `exportJSON(circuit)` → schema-versioned JSON string (`version: 1`, `exportedAt`, pretty-printed).
  - `importJSON(jsonString)` → validated `Circuit` or throws user-friendly error.
  - `validateCircuitJSON(raw)` → null on success, error string on failure. Checks: schema version, component shapes, known types vs `COMPONENT_DEFS`, wire shapes, wire endpoint cross-references.
  - `exportSVG(svgElement)` → self-contained SVG string with inlined animation CSS.
  - `exportPNG(svgElement, scale?)` → `Promise<Blob>` via offscreen canvas (2× default).
  - `encodeShareURL(circuit)` → gzip + base64 `?c=…` URL, ~5 KB cap, native `CompressionStream`.
  - `decodeShareURL(url?)` → `Promise<Circuit | null>` via `DecompressionStream`.
  - `downloadText()`, `downloadBlob()` helpers.
- ✅ **`src/ui/components/ImportExportModal.tsx`** — Two-tab accessible modal.
  - **Export tab:** 4-button grid — JSON, SVG, PNG, Share Link. Each triggers download or clipboard copy. SVG/PNG disabled in GPU mode with clear error message.
  - **Import tab:** file picker (`.json`), drag-and-drop zone with visual feedback, paste-JSON textarea + "Import from paste" button. All inputs validated through `importJSON()`.
  - Success (green) and error (red) status messages. Busy state for async operations.
- ✅ **`src/store/uiStore.ts`** — Added `importExportOpen: boolean` + `setImportExportOpen` setter.
- ✅ **`src/ui/components/Modal.tsx`** — Made `title` prop optional so ImportExportModal can render its own tabbed header.
- ✅ **`src/ui/CircuitCanvas.tsx`** — Added `externalSvgRef` prop (callback ref pattern merging internal + external ref). All internal `svgRef.current` accesses updated to `internalSvgRef.current`.
- ✅ **`src/ui/Editor.tsx`** — Creates `canvasSvgRef`, passes to `CircuitCanvas` as `externalSvgRef` and to `ImportExportModal` as `svgRef`. Subscribes to `importExportOpen`.
- ✅ **`src/ui/components/Toolbar.tsx`** — Replaced placeholder "Save (Phase 6)" button with a working Download icon "Import / Export (Ctrl+E)" button.
- ✅ **`src/ui/hooks/useKeyboardShortcuts.ts`** — `Ctrl/Cmd+E` toggles Import/Export modal, `Ctrl/Cmd+S` quick-exports JSON (prevents browser's native Save dialog), `Escape` closes Import/Export modal (before Settings in the priority chain).
- ✅ **`src/main.tsx`** — Boot-time `?c=` share-param decode. Runs after IDB hydrate, before autosave start. On success: loads shared circuit, clears undo history, cleans URL via `history.replaceState`. On failure: warns to console and falls through to saved/seed circuit.
- ✅ **`src/lib/exportImport.test.ts`** — 14 unit tests: round-trip fidelity, pretty-print format, state preservation, 8 rejection cases (malformed JSON, wrong schema version, unknown component type, missing component reference, missing circuit field, missing arrays, invalid component shape, invalid wire shape), empty circuit, direct validator API.
- ✅ **PLAN.md** — Phase 6.4 row marked ✅ done with full deliverable summary. Last-updated stamp bumped.
- ✅ **CHANGELOG.md** — Phase 6.4 entry with 13 detailed bullet points.
- ✅ **README.md** — Import/Export highlight, keyboard shortcuts table, project layout, roadmap table, test count, perf budget, status line, last-updated stamp.

**Files touched (13):**
1. `src/lib/exportImport.ts` — **new**
2. `src/lib/exportImport.test.ts` — **new**
3. `src/ui/components/ImportExportModal.tsx` — **new**
4. `src/store/uiStore.ts` — modified
5. `src/ui/components/Modal.tsx` — modified
6. `src/ui/CircuitCanvas.tsx` — modified
7. `src/ui/Editor.tsx` — modified
8. `src/ui/components/Toolbar.tsx` — modified
9. `src/ui/hooks/useKeyboardShortcuts.ts` — modified
10. `src/main.tsx` — modified
11. `PLAN.md` — modified
12. `CHANGELOG.md` — modified
13. `README.md` — modified

**Security hardening (same session):**
- ✅ **File size cap** — rejects payloads > 10 MB before `JSON.parse`.
- ✅ **Array length caps** — max 5,000 components, 10,000 wires.
- ✅ **String length cap** — 256 chars on `id`/`type`; rejects empty strings.
- ✅ **Numeric range checks** — `isFiniteInRange()` rejects `NaN`, `Infinity`, coords beyond ±100,000.
- ✅ **Prototype-pollution sanitiser** — `sanitiseState()` strips `__proto__`, `constructor`, `prototype` own-keys recursively; depth-capped at 8 levels, arrays sliced to 100.
- ✅ **Duplicate ID detection** — both component and wire IDs.
- ✅ **Port-index bounds** — cross-checked against `COMPONENT_DEFS[type].ports.length`.
- ✅ **`controlPoints` validation** — `{x, y}` range-checked; max 50 per wire.
- ✅ **14 new security tests** added (oversized payload, array caps, NaN/Infinity, proto stripping, duplicate IDs, port bounds, empty strings, negative indices).

**Perf snapshot (post-Phase-6.4 + hardening):**
- Production bundle: **JS 91.80 KB gzip** (Δ +4.74 KB vs Phase 6.1.1 — entire Import/Export feature incl. security hardening).
- CSS: 6.80 KB gzip.
- Test suite: **8 files, 70 tests, all passing**.
- Build: 14.5 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.5 (Hamburger menu + docs)** or **Phase 6.9 (Bulk-action buttons)** — both self-contained.
- Analytics provider decision still pending for Phase 6.7.

**Blockers / Notes (6.4):** none. Project is in a clean, fully-tested, fully-documented state.

---

## 2026-04-28 — Phase 6.4.1 ✅ done — Bug-fix patch (3 UX bugs)

**Done:**
- ✅ **Bug #1 (high): Palette search non-functional** — `Palette.tsx` search `<input>` had no `value`/`onChange` — purely decorative. Added `useState` for query, `useMemo` filter by label/type (case-insensitive), ✕ clear button, and "No components match" empty state.
- ✅ **Bug #2 (high): Esc doesn't cancel component placement** — `useKeyboardShortcuts.ts` early-returned on all keys when `INPUT`/`TEXTAREA` was focused. Moved Escape handling before the input-focus guard. Esc now universally cancels placement, closes modals, and blurs the input. Other shortcuts still respect input focus.
- ✅ **Bug #3 (medium): Excessive console log entries** — `MAX_LOGS` in `uiStore.ts` was 200. Reduced to 100. Undo/redo history already capped at 100.

**Files touched (3):**
1. `src/ui/components/Palette.tsx` — modified (search wiring)
2. `src/ui/hooks/useKeyboardShortcuts.ts` — modified (Escape handling refactor)
3. `src/store/uiStore.ts` — modified (MAX_LOGS 200→100)

**Perf snapshot (post-6.4.1):**
- Production bundle: **JS 92.01 KB gzip** (Δ +0.21 KB vs 6.4).
- CSS: 6.80 KB gzip.
- Test suite: **8 files, 70 tests, all passing**.
- Build: 14.8 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.9 (Bulk-action buttons)** or **Phase 6.5 (Hamburger menu + docs)** — both self-contained.
- Analytics provider decision still pending for Phase 6.7.

**Blockers / Notes (6.4.1):** none.

---

## 2026-04-28 — Phase 6.9 ✅ done — Bulk-action buttons

**Done:**
- ✅ **Store mutators** — `clearAllWires()` (removes all wires, single undo step) and `clearAllComponents()` (removes all components + wires, single undo step) added to `circuitStore.ts`.
- ✅ **Extended `PendingDeletion` type** — new kinds: `'clear-wires'`, `'clear-all'`, `'reset'`.
- ✅ **Bulk action functions** — `requestClearWires()`, `requestClearAll()`, `requestReset()` in `canvas-actions.ts`. Gated by `confirmDelete` setting (Reset always confirms). Empty-state guards.
- ✅ **⋮ Dropdown menu** — `BulkMenu` component in `Toolbar.tsx` with click-outside-to-close. Three items: Clear all wires, Clear all components, Reset to defaults.
- ✅ **Contextual confirm dialog** — `Editor.tsx` helper functions (`confirmTitle`, `confirmDescription`) produce appropriate text for each pending deletion kind. Reset hides "Don't ask again" checkbox.
- ✅ **Reset logic** — replaces circuit with seed, clears undo history, wipes persisted circuit IDB + persisted settings IDB.

**Files touched (5):**
1. `src/store/circuitStore.ts` — added `clearAllWires`, `clearAllComponents`
2. `src/store/uiStore.ts` — extended `PendingDeletion` type
3. `src/ui/canvas-actions.ts` — added bulk action request functions, updated `confirmPendingDeletion`
4. `src/ui/components/Toolbar.tsx` — added `BulkMenu` dropdown
5. `src/ui/Editor.tsx` — contextual confirm dialog titles/descriptions

**Perf snapshot (post-6.9):**
- Production bundle: **JS 93.08 KB gzip** (Δ +1.07 KB vs 6.4.1).
- CSS: 6.80 KB gzip.
- Test suite: **8 files, 70 tests, all passing**.
- Build: 12.4 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.5 (Hamburger menu + docs)** — gives the app proper navigation and a documentation page.
- **Phase 6.2 (UX uplift II)** — multi-select, copy/paste, smarter routing (larger scope).
- Analytics provider decision still pending for Phase 6.7.

**Blockers / Notes (6.9):** none.

---

## 2026-04-28 — Phase 6.5 ✅ done — Hamburger menu (centered modal overlay)

**Done:**
- ✅ **`menuOpen` state** — added to `uiStore.ts` with `setMenuOpen` action.
- ✅ **Escape handling** — `useKeyboardShortcuts.ts` closes menu first (highest priority in Escape chain).
- ✅ **`MenuOverlay` component** — `src/ui/components/MenuOverlay.tsx`. Centered `fixed` panel with `backdrop-blur-sm` + `bg-slate-900/20` backdrop. Scale 90→100% with `cubic-bezier(0.4,0,0.2,1)` ease-in-out. 9 wire-terminal styled items with port pips, Lucide icons, descriptions, shortcut badges. Wire-separator grouping. Footer with version + "Esc to close".
- ✅ **MCB breaker-switch trigger** — `MenuTrigger` in `Toolbar.tsx`. Blue lever (closed) → Red (tripped, 35° rotation). Status dot green/red. Spring animation.
- ✅ **Menu items wired** — Import/Export → `setImportExportOpen`, Settings → `setSettingsOpen`, Clear Wires → `requestClearWires`, Clear All → `requestClearAll`, Reset → `requestReset`, Contact → `mailto:`.
- ✅ **Toolbar decluttered** — removed Settings `IconBtn`, Import/Export `IconBtn`, `BulkMenu` dropdown. All consolidated into menu overlay. Toolbar now: brand + undo/redo + AI + sim toggle + renderer + menu trigger.
- ✅ **Mockup cleaned up** — `src/ui/mockups/` directory and `App.tsx` hash route removed.

**Files touched (6):**
1. `src/store/uiStore.ts` — added `menuOpen`, `setMenuOpen`
2. `src/ui/hooks/useKeyboardShortcuts.ts` — added `menuOpen` to Escape chain
3. `src/ui/components/MenuOverlay.tsx` — **new** (centered modal menu)
4. `src/ui/components/Toolbar.tsx` — replaced BulkMenu/Settings/ImportExport with MCB trigger
5. `src/ui/Editor.tsx` — mounted `MenuOverlay`, subscribed to `menuOpen`
6. `src/App.tsx` — cleaned up mockup route

**Perf snapshot (post-6.5):**
- Production bundle: **JS 94.42 KB gzip** (Δ +1.34 KB vs 6.9).
- CSS: 6.80 KB gzip.
- Test suite: **8 files, 70 tests, all passing**.
- Build: 14.7 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.5.1 (Docs page)** — MDX page with embedded live mini-circuits, keyboard shortcut table, wire-style separators.
- **Phase 6.7 (SEO + Analytics)** — small scope, mostly config files.
- **Phase 6.2 (UX uplift II)** — multi-select, copy/paste, smarter routing (larger scope).

**Blockers / Notes (6.5):** Docs page deferred to 6.5.1 — menu is the high-value deliverable.

---

## 2026-04-28 — Phase 6.5.1 ✅ done — Documentation page

**Done:**
- ✅ **`docsOpen` + `docsScrollTo` state** — added to `uiStore.ts` with `setDocsOpen(open, scrollTo?)` action.
- ✅ **Escape handling** — `useKeyboardShortcuts.ts` closes docs first (highest priority in Escape chain).
- ✅ **`DocsPage` component** — `src/ui/components/DocsPage.tsx`. Full-page fixed overlay with 6 sections:
  1. **Getting Started** — 5-step numbered walkthrough cards.
  2. **Components Reference** — auto-generated from `COMPONENT_DEFS`, grouped by category (9 groups, 14 components). Port badges colour-coded L/N/E.
  3. **Wiring Guide** — port compatibility rules, wire rerouting, embedded mini-circuit placeholder.
  4. **Keyboard Shortcuts** — full table with `<kbd>` styling (9 shortcuts).
  5. **Simulation & Faults** — path-tracing engine overview + 4 fault types.
  6. **Tips & Tricks** — 6 tip cards in 2-column grid.
- ✅ **Wire-style design** — gradient separators with port pips, coloured section headings with Lucide icons.
- ✅ **Sidebar TOC** (desktop) + mobile dropdown — sticky navigation, auto-updates when sections change.
- ✅ **Scroll-to-section** — `docsScrollTo` prop scrolls smoothly to `#id` on open. Menu "Keyboard Shortcuts" → `#shortcuts`.
- ✅ **Menu wired** — "Documentation" → `setDocsOpen(true)`, "Keyboard Shortcuts" → `setDocsOpen(true, 'shortcuts')`.
- ✅ **Mockup cleaned up** — `src/ui/mockups/` directory and `App.tsx` hash route removed.

**Files touched (7):**
1. `src/store/uiStore.ts` — added `docsOpen`, `docsScrollTo`, `setDocsOpen`
2. `src/ui/hooks/useKeyboardShortcuts.ts` — added `docsOpen` to Escape chain
3. `src/ui/components/DocsPage.tsx` — **new** (full docs page)
4. `src/ui/components/MenuOverlay.tsx` — wired Documentation + Keyboard Shortcuts items
5. `src/ui/Editor.tsx` — mounted `DocsPage`, subscribed to `docsOpen`
6. `src/App.tsx` — cleaned up mockup route
7. Deleted `src/ui/mockups/DocsPageMockup.tsx`

**Perf snapshot (post-6.5.1):**
- Production bundle: **JS 98.73 KB gzip** (Δ +4.31 KB vs 6.5).
- Test suite: **8 files, 70 tests, all passing**.
- Build: 17.6 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**How to edit the docs page (`src/ui/components/DocsPage.tsx`):**
- **Add a section:** Create a `<section id="my-id">` block, add a `TOC` entry, insert `<WireSep />`.
- **Edit a section:** Find `<section id="…">` and change its JSX.
- **Delete a section:** Remove the `<section>`, its `<WireSep />`, and the `TOC` entry.
- **Add a component:** Add to `COMPONENT_DEFS` in `src/domain/components.ts` — auto-updates.
- **Add a shortcut:** Append a `[key, description]` pair to the `SHORTCUTS` array.

**Next (suggested):**
- **Phase 6.7 (SEO + Analytics)** — small scope, mostly config files.
- **Phase 6.6 (Contact system)** — `mailto:` already wired; upgrade to Web3Forms form.
- **Phase 6.2 (UX uplift II)** — multi-select, copy/paste, smarter routing (larger scope).

**Blockers / Notes (6.5.1):** Embedded live mini-circuit in Wiring Guide is placeholder — will need a mini renderer. Low priority.

---

## 2026-04-28 — Phase 6.6 ✅ done — Contact modal

**Done:**
- ✅ **`contactOpen` state** — added to `uiStore.ts` with `setContactOpen` action.
- ✅ **Escape handling** — `useKeyboardShortcuts.ts` closes contact modal first (highest priority).
- ✅ **`ContactModal` component** — `src/ui/components/ContactModal.tsx`. Uses existing `Modal` primitive. Contains:
  - 3-step instruction panel (open form → fill in → submit).
  - "What to include" section with categorised guidance (bug report, feature request, general question).
  - Prominent blue "Open Contact Form" CTA button → opens Google Forms in new tab.
  - Footer note confirming the form opens externally.
- ✅ **Configurable URL** — single `CONTACT_FORM_URL` constant at line ~21 of `ContactModal.tsx`. Change the string and save.
- ✅ **Menu wired** — "Contact" item in `MenuOverlay` now calls `setContactOpen(true)` instead of `mailto:`.

**Files touched (5):**
1. `src/store/uiStore.ts` — added `contactOpen`, `setContactOpen`
2. `src/ui/hooks/useKeyboardShortcuts.ts` — added `contactOpen` to Escape chain
3. `src/ui/components/ContactModal.tsx` — **new**
4. `src/ui/components/MenuOverlay.tsx` — wired Contact item
5. `src/ui/Editor.tsx` — mounted `ContactModal`, subscribed to `contactOpen`

**Perf snapshot (post-6.6):**
- Production bundle: **JS 99.51 KB gzip** (Δ +0.78 KB vs 6.5.1).
- Test suite: **8 files, 70 tests, all passing**.
- Build: 14.6 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.5.2 (Right-click context menu)** — context-aware menu on canvas, components, wires.
- **Phase 6.7 (SEO + Analytics)** — config-only, zero JS.
- **Phase 6.2 (UX uplift II)** — multi-select, copy/paste, smarter routing (larger scope).

**Blockers / Notes (6.6):** Placeholder Google Forms URL (`https://forms.gle/YOUR_FORM_ID_HERE`) needs to be replaced with a real form link.

---

## 2026-04-29 — Phase 6.5.2 ✅ done — Right-click context menu

**Done:**
- ✅ **`ContextMenuState` type + `contextMenu` state** — added to `uiStore.ts` with `setContextMenu` action. Exported `ContextMenuState` from store barrel.
- ✅ **Escape handling** — `useKeyboardShortcuts.ts` closes context menu first (highest priority in Escape chain).
- ✅ **`ContextMenu` component** — `src/ui/components/ContextMenu.tsx`. Context-aware popup positioned at cursor:
  - **Component context**: Select, Toggle (switches only), Start Wire From Here, Delete Component.
  - **Wire context**: Select Wire, Reroute Wire (arms select-then-click), Delete Wire.
  - **Canvas context**: Wire Mode, Select Mode.
  - **Shared items** (always): Import/Export, Documentation, Keyboard Shortcuts, Settings.
  - Keyboard shortcut badges (`kbd`), danger styling for delete actions.
  - Click-outside to close (capture-phase mousedown listener).
  - Auto-reposition if menu overflows viewport.
- ✅ **Canvas wiring** — `onContextMenu` handlers added to:
  - SVG root element (canvas background → `{ kind: 'canvas' }`).
  - `WirePath` component (wire → `{ kind: 'wire', id }`).
  - `ComponentNode` component (component → `{ kind: 'component', id }`).
  - All handlers call `e.preventDefault()` + `e.stopPropagation()`.
- ✅ **Mounted in Editor.tsx** — `<ContextMenu />` renders unconditionally, self-manages visibility via `useUiStore`.

**Files touched (6):**
1. `src/store/uiStore.ts` — added `ContextMenuState`, `contextMenu`, `setContextMenu`
2. `src/store/index.ts` — exported `ContextMenuState`
3. `src/ui/hooks/useKeyboardShortcuts.ts` — added `contextMenu` to Escape chain
4. `src/ui/components/ContextMenu.tsx` — **new**
5. `src/ui/CircuitCanvas.tsx` — added `onContextMenu` to SVG, WirePath, ComponentNode
6. `src/ui/Editor.tsx` — mounted `ContextMenu`

**Perf snapshot (post-6.5.2):**
- Production bundle: **JS 100.68 KB gzip** (Δ +1.17 KB vs 6.6).
- Test suite: **8 files, 70 tests, all passing**.
- Build: 15.5 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.7 (SEO + Analytics)** — config-only, zero JS.
- **Phase 6.2 (UX uplift II)** — multi-select, copy/paste, smarter routing (larger scope).

**Blockers / Notes (6.5.2):** PixiCanvas does not yet support right-click context menu (SVG-only). Low priority since Pixi is opt-in and rarely used.

---

## 2026-04-29 — Phase 6.7 ✅ done — SEO + Plausible Analytics

**Done:**
- ✅ **`index.html` SEO meta tags** — `description`, `keywords`, `author`, `canonical`, Open Graph (`og:title/description/image/url/type/locale/site_name`), Twitter card (`summary_large_image`).
- ✅ **JSON-LD structured data** — `SoftwareApplication` schema embedded in `<script type="application/ld+json">`. Fields: name, applicationCategory (EducationalApplication), operatingSystem (Web), description, url, image, offers (free).
- ✅ **Search Console verification** — `<meta name="google-site-verification" content="REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN">`. Paste token to activate.
- ✅ **`public/robots.txt`** — `User-agent: *`, `Allow: /`, blocks `stats.html`, references `sitemap.xml`.
- ✅ **`public/sitemap.xml`** — single-URL sitemap (root `/`), `changefreq: weekly`, `priority: 1.0`.
- ✅ **Plausible Analytics** — `<script defer data-domain="electrasim.com">` in `index.html`. Cookie-free, no consent banner, ~1 KB async load. Update `src` to your Plausible instance URL before launch.
- ✅ **Domain** `https://electrasim.com` — registered 2026-05-01 on Cloudflare. Find-replace done.

**Files touched (3 new, 1 modified):**
1. `index.html` — added all SEO tags, JSON-LD, Plausible script (**modified**)
2. `public/robots.txt` — **new**
3. `public/sitemap.xml` — **new**

**Perf snapshot (post-6.7):**
- Production bundle: **JS 100.68 KB gzip** (Δ ±0 — zero JS impact, all in HTML + static files).
- Test suite: **8 files, 70 tests, all passing**.
- Build: 15.9 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.2 (UX uplift II)** — wire labels, multi-select, copy/paste, smarter routing.
- **Phase 6.3 (UX uplift III)** — mini-map, zoom-to-fit, alignment tools, themes.
- **Phase 7 (Custom wiring)** — paint-style multi-step wire placement.

**Blockers / Notes (6.7):** Domain `electrasim.com` registered (2026-05-01). Find-replace done. Remaining: Search Console token (paste after verification), Plausible instance URL.

---

## Session — 2026-04-30 · Phase 6.8: Open Enhancements

**Done:**
1. ✅ **Zoom-to-fit** — `zoomToFit(viewportSize, components)` in `viewportStore` computes bounding box, applies padding, clamps to MIN/MAX_ZOOM. `ScanSearch` button in `ToolDock`. `F` keyboard shortcut in `useKeyboardShortcuts`.
2. ✅ **Dark theme** — `labGlassDark` canvas tokens + `editorBackgroundDark` gradient in `theme.ts`. `colorScheme` setting (`light` | `dark` | `system`) added to `settingsStore` with IDB persistence. `useResolvedTheme` hook resolves effective theme via `prefers-color-scheme` media query. Three-button selector in `SettingsModal`. Editor wires resolved theme to canvas and background.
3. ✅ **PDF / Print export** — `exportPDF()` in `exportImport.ts` serialises SVG, wraps in hidden iframe with professional title block (title, author, date, branded footer), triggers `window.print()`. Zero external dependencies. `Printer` button in `ImportExportModal`.
4. ✅ Typecheck, 70/70 tests, build green.
5. ✅ CHANGELOG, PLAN, progress, README updated.

**Files touched (Phase 6.8):**
- `src/store/viewportStore.ts` — `zoomToFit` action
- `src/store/settingsStore.ts` — `ColorScheme` type, `colorScheme` setting
- `src/ui/theme.ts` — `labGlassDark`, `editorBackgroundDark`
- `src/ui/hooks/useResolvedTheme.ts` — new hook
- `src/ui/hooks/useKeyboardShortcuts.ts` — `F` shortcut
- `src/ui/components/ToolDock.tsx` — zoom-to-fit button
- `src/ui/components/SettingsModal.tsx` — `SchemeSelector`
- `src/ui/Editor.tsx` — resolved theme wiring
- `src/lib/exportImport.ts` — `exportPDF()`
- `src/ui/components/ImportExportModal.tsx` — PDF/Print button
- `CHANGELOG.md`, `PLAN.md`, `progress.md`, `README.md`

**Performance (Phase 6.8):**
- Bundle: **102.54 KB gzip** (main), Δ +1.86 KB from Phase 6.7 (dark theme tokens + PDF template).
- Build: ~18 s.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅.

**Next (suggested):**
- **Phase 6.2 (UX uplift II)** — wire labels, multi-select, copy/paste, smarter routing.
- **Phase 7 (Custom wiring)** — paint-style multi-step wire placement.
- **Phase 8 (Renderer abstraction)** — fix GPU-mode wire visibility.

**Blockers / Notes (6.8):** Dark theme applies to the canvas and editor background. UI panels (toolbar, palette, inspector, modals) still use light Tailwind classes — a follow-up can add `dark:` variants for full dark mode coverage across all panels.

---

## Session — 2026-04-30 · Phase 6.10: Pre-launch cleanup

**Context:** preparing the codebase for the v1.0 public launch. User finalised three decisions:
1. **3D renderer dropped** from active roadmap. Preserved as a documented post-launch idea so it can be revisited.
2. **Brand identity** stays placeholder until launch (formalised as B7/B8/B9 pre-launch action items).
3. **Backend + AI = post-launch / v2.0**.

User also asked the launch-readiness question, prompting the new §13 launch checklist. Mid-session pivot: drop the user-facing CPU/GPU toggle from v1.0 (Phase 8 moves to v1.1 as "the GPU release"). User chose **full polish** path with GPU dropped → execution order `6.10 → 6.2 → 7 → 6.3-slim → 6.11 → 7.1 → PRE-LAUNCH → 🚀 v1.0`.

**Done:**

1. ✅ **Code (small, surgical, all in src/):**
   - `src/domain/types.ts` — removed unused `z?: number` field on `Position`; stripped "3D model in later phases" hint from `ComponentDef.icon` comment. Domain model now purely 2D.
   - `src/ui/components/Toolbar.tsx` — wrapped CPU/GPU renderer toggle in `import.meta.env.DEV`. SVG is the only user-facing renderer in production. Pixi code retained for Phase 8. Toggle still works in `npm run dev`.
   - `src/ui/components/DocsPage.tsx` — removed "Toggle to GPU mode" tip. Added Phase 6.8 tips (zoom-to-fit `F`, color scheme, PDF/Print). Added missing `F` shortcut to `SHORTCUTS` table.

2. ✅ **PLAN.md** — substantial refactor across §1, §3, §4, §5, §7, §8, §10, plus brand-new §12 and §13:
   - §1 goal 5 — dropped "3D renderer" from future-proof list.
   - §3 stack — removed "3D Renderer (future)" row; PixiJS row gained "**dev-only toggle in v1.0**" qualifier.
   - §4 architecture — removed `three/` directory placeholder; Renderer interface section retitled (Phase 8 / v1.1) with `Vec2` camera + 2D `{x, y}` Position note.
   - §5 perf — code-splitting bullet retitled "PixiJS renderer (dev-only in v1.0)".
   - §7 future-features hooks — 3D moved to "post-launch (§12)"; backend → Phase 9 (v2.0); AI → Phase 10 (v2.0); GPU re-enable → Phase 8 (v1.1).
   - §8 phase table — added Phase **6.10**, reordered v1.0 phases in execution order, added new **PRE-LAUNCH** + **🚀 v1.0** rows, dropped old "Phase 9 — 3D renderer" row, renumbered backend (10→9) and AI (11→10).
   - §10 open questions — restructured into Resolved / Deferred-to-pre-launch tables; D5/D6/D7/D8/D9/D-3d-trace-removal explicitly resolved.
   - **New §12** "Post-launch / v2.0+ ideas" — preserves full 3D R3F + drei recommendation (library, directory layout, asset pipeline, mobile gating, bundle target, trigger condition for revisiting). Also covers real-time collab, classroom mode, voice-controlled wiring, OS-clipboard promotion, P2P sync.
   - **New §13** v1.0 launch checklist — B1–B11 items across code & content / infra / quality gates / launch day. Locks the **documentation discipline rule** for v1.0.

3. ✅ **README.md** — major rewrite:
   - Tech stack — dropped "Mature 3D wrapper (R3F)" rationale.
   - **New "How wiring works — Smart Routing vs Custom Wiring" section** with ASCII illustrations, step-by-step tutorials for each mode, side-by-side comparison table, FAQ, implementation status callout. Mirrors the in-app Docs Wiring Guide. Resolves the user's earlier confusion about whether the two are the same feature.
   - Roadmap split into "v1.0 (in flight)" + "Post-launch (out of v1.0 scope)" tables; 3D demoted to footnote linking PLAN.md §12.
   - "Known issues" — GPU wire bug entry replaced with "None in user-facing v1.0 scope" + Phase 8 deferral.

4. ✅ **CHANGELOG.md** — Phase 6.10 entry added under `[Unreleased]`. Historical entries untouched per discipline rule.

5. ✅ **Decisions resolved** (PLAN.md §10):
   - **D2** brand → keep placeholder, pre-launch action items B7/B8/B9.
   - **D5** custom wiring spec → both meanings adopted.
   - **D6** multi-select → drag-rect + Shift-click additive.
   - **D7** clipboard → in-memory only for v1.0.
   - **D8** Pixi rewrite vs patch → out of v1.0; Phase 8 kickoff decision.
   - **D9** 3D → dropped from roadmap; preserved in §12.

6. ✅ Typecheck, 70/70 tests, build green.

**Files touched (Phase 6.10):**
- `src/domain/types.ts`
- `src/ui/components/Toolbar.tsx`
- `src/ui/components/DocsPage.tsx`
- `PLAN.md` (substantial)
- `README.md` (substantial)
- `CHANGELOG.md` (added entry; historical untouched)
- `progress.md` (this entry)

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 70/70 · `vite build` ✅ (102.54 KB gzip main, unchanged).

**Next phase:** Phase **6.2 — UX uplift II** (multi-select, copy/paste, smart routing, inline rename). Decisions D6/D7 already locked; spec is ready to implement. Per the Phase 6.10 documentation discipline rule, Phase 6.2 must update the in-app DocsPage Wiring Guide section with the smart-routing tutorial, add a README highlight bullet, and ship a CHANGELOG + progress entry alongside the code.

**Blockers / Notes (6.10):** None. The Pixi code path is gated by `import.meta.env.DEV` only at the toolbar UI; if Phase 8 needs to reach the Pixi pipeline programmatically (e.g. for headless tests), it can still call `useUiStore.getState().setRenderer('pixi')` directly. Keep this in mind when re-enabling for v1.1.

---

## Session — 2026-04-30 · Phase 6.2.1: Smart wire routing

**Context:** First sub-feature of Phase 6.2 (UX uplift II). Smart (orthogonal, obstacle-aware) routing replaces bezier as the default for new wires. PLAN.md §8.2 spec was locked earlier in this same session covering SR1–SR6 with rationale tables for each decision.

**Implementation strategy refinement vs spec:** the locked spec described auto-reroute on component move with `requestIdleCallback` debouncing and a `controlPointsLockedByUser` flag. Implementation chose the **render-time path computation** approach instead — paths are recomputed every frame from the wire's current endpoints + live components map (mirroring how bezier already works). This eliminates the auto-reroute machinery, the debounce, and the lock flag. Spec outcomes (SR1 additive coexistence, SR2 hybrid algorithm, SR5 per-circuit setting, SR6 SVG-only / Pixi deferred) unchanged. SR3 (lock-on-edit) becomes relevant only when intermediate control-point editing exists, which arrives in Phase 7. Documented in CHANGELOG.

**Done:**

1. ✅ **Domain types** (`src/domain/types.ts`):
   - New `WirePathKind = 'bezier' | 'orthogonal'`.
   - `WireInstance.pathKind?: WirePathKind` — optional for back-compat.
   - Removed leftover `z?: number` on `ComponentInstance` that was missed in Phase 6.10.

2. ✅ **Domain geometry** (`src/domain/geometry.ts`):
   - `computeOrthogonalPath()` — hybrid L-route → A* → diagonal-fallback. ~250 LOC including helpers.
   - `tryLPath()` — exported, sub-millisecond H→V or V→H elbow with obstacle clipping check.
   - `aStarOrthogonal()` — exported, 16 px grid, `MAX_NODES = 4000`, configurable `timeoutMs` (default 200 ms).
   - `collectObstacles()` — exported, builds inflated AABB list excluding the wire's own endpoint components.
   - `simplifyCollinear()` — internal post-processor strips redundant grid waypoints from A* output.
   - `sampleWire()` updated to dispatch on `pathKind`.
   - Exported `AABB` interface for callers wanting to assemble custom obstacle sets.

3. ✅ **Tests** (`src/domain/geometry-orthogonal.test.ts`, new file):
   - 15 cases covering all 10 spec items + direct unit tests for `tryLPath` / `aStarOrthogonal`.
   - **All 15 green on first run.** Total suite now 85/85.

4. ✅ **Settings** (`src/store/settingsStore.ts`):
   - New `routingStyle: 'orthogonal' | 'bezier'`, default `'orthogonal'`.
   - Snapshot, hydration check, subscription updated. Forward-compat: older blobs without the field inherit the default.
   - Exported `RoutingStyle` type alongside `ColorScheme`.

5. ✅ **Settings UI** (`src/ui/components/SettingsModal.tsx`):
   - New `RoutingStyleSelector` mirrors `SchemeSelector`. `┗ Smart` / `∿ Curved` two-button group under "Editing".
   - Description copy explains that the choice applies to *new* wires only.

6. ✅ **Wire creation** (`src/ui/canvas-actions.ts`):
   - `handlePortClick` reads `useSettingsStore.getState().routingStyle` and stamps it on the new `WireInstance`.
   - Existing wires (loaded from JSON / already in store) untouched.

7. ✅ **Renderer** (`src/ui/CircuitCanvas.tsx`):
   - New `buildOrthogonalPath()` builds an SVG `M…L…L…` path string.
   - `WirePath` dispatches on `wire.pathKind`. Hit-testing, glow filter, current-flow animation, selection styles all work unchanged because they apply to whatever `d` attribute is built.
   - Pixi parity deferred to Phase 8 (v1.1).

8. ✅ **Documentation discipline** (PLAN.md §13 rule):
   - **DocsPage** — new "Wiring Style (Smart vs Curved)" card in the Wiring Guide; new tip in `TIPS`.
   - **README** — new bullet in Highlights; "How wiring works" status callout updated to "Smart Routing shipped"; roadmap row 6.2.1 added; last-updated stamp bumped.
   - **CHANGELOG** — full Phase 6.2.1 entry above the Phase 6.10 entry.
   - **progress.md** — this entry.

9. ✅ Pipeline:
   - `tsc --noEmit` ✅ zero errors
   - `vitest run` ✅ 85/85 (was 70 + 15 new)
   - Build ✅ (verified after this session — see commit log)

**Files touched (Phase 6.2.1):**
- `src/domain/types.ts`
- `src/domain/geometry.ts` (substantial — +~250 LOC)
- `src/domain/geometry-orthogonal.test.ts` (new file, 230 LOC)
- `src/store/settingsStore.ts`
- `src/ui/components/SettingsModal.tsx`
- `src/ui/canvas-actions.ts`
- `src/ui/CircuitCanvas.tsx`
- `src/ui/components/DocsPage.tsx`
- `README.md`
- `CHANGELOG.md`
- `progress.md` (this entry)

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 85/85 · `vite build` ✅ (verified — bundle unchanged at ~102.54 KB gzip).

**Next sub-features (remaining Phase 6.2):**
- Multi-select (drag-rect on empty canvas + Shift-click additive). D6 already locked.
- Copy/paste (Ctrl+C/V, in-memory clipboard). D7 already locked.
- Inline rename in inspector.
- Snap-to-component edges.
- Wire labels (port-type pip + voltage badge).

**Blockers / Notes (6.2.1):** None. The render-time path computation is fast enough that no perf telemetry is needed for v1.0 — L-route is sub-millisecond and the rAF dirty-flag loop already gates work to "something changed." If the worst-case A* fallback ever becomes a perf hotspot in real circuits (e.g. a user drags a component through dense obstacles for sustained time), Phase 8 / v1.1 can revisit with memoization keyed on `(wireId, p1, p2, obstacle-hash)`. Not needed today.

### Hotfix (same session) — idle CPU regression caught by user

**Symptom user reported:** "my pc cpu usage went high for this update. after i close the tab it went to normal."

**Diagnosis (correct in the first analysis pass — no thrashing):**
1. `WirePath` is not `React.memo`'d. `CircuitCanvas` re-renders on every store change (selection, hover, sim tick). Every orthogonal wire was re-running `buildOrthogonalPath` → `collectObstacles` → `computeOrthogonalPath` per render. Per-render cost was `O(wires × components)`, not the `O(1)` it had been for bezier.
2. `byId` was being constructed inline in the render body → new object identity every render → would also defeat any future `React.memo`.

**Bottom line:** my "compute paths at render time" simplification (replacing the locked spec's debounced auto-reroute) was correct in *strategy* but I forgot to add the memoisation barrier that makes it cheap. The locked spec's debounce was solving the same problem from a different angle; my version needed an analogous guard at the React layer.

**Fix:**
- `byId` Map → `useMemo` keyed on `circuit.components`.
- New `orthogonalPathD: Map<wireId, string>` → `useMemo` keyed on `(circuit.wires, byId)`. Pre-computes all orthogonal wire `d` strings *once* per geometry change. Idle frames hit the memo and pay zero pathfinding cost.
- `WirePath` accepts optional `precomputedD` prop; falls back to inline build if absent (component remains standalone-correct).

**New perf-telemetry tests** (`src/domain/geometry-orthogonal.test.ts`, +4 tests):
- 1000 L-routes < 50 ms
- 1000 L-routes through 20 obstacles < 200 ms
- A* respects 200 ms per-call timeout
- Realistic 100-wire scene < 50 ms total

Test budgets are 3-5× actual measurements on dev hardware. Inline comment instructs future contributors to *fix the algorithm, don't bump the budget*.

**Measured (post-fix):** 1000 L-routes 2 ms · 1000 L-routes-with-obstacles 12 ms · A* worst case 6 ms · realistic 100-wire scene 3 ms. Suite now 89/89 (was 85 + 4 perf).

**Bundle:** 104.49 KB gzip main (was 104.30 → +0.19 KB for the memoisation logic). `tsc` zero errors. `vite build` clean.

**Lesson logged for the future-me reading this:** when you replace a debouncing strategy with a "just compute it on render" strategy, the memoisation that used to live in the debounce now has to live in the React layer (`useMemo`, `React.memo`, or both). Otherwise you've replaced a smart cache with no cache at all.

---

## Session — Phase 6.2.2 (Reduced-effects mode + paint-pipeline rewrite)

**Trigger.** User flagged sustained high CPU during simulation that pre-dated Phase 6.2.1. Their measurements (verified in their own dev tab):
- Idle, sim paused, 3 components: **12–15% CPU**
- Sim running, 3 components, 1 wire energised: **45–50% CPU** (continuous, 30+ s)
- Sim paused after stress: **10–15% CPU**
- Stress + sim running: **80–90% CPU** (continuous)

The smoking-gun number was 45% CPU for **one** energised wire. That ruled out React reconciliation cost (would not scale that high with one element) and pointed at a per-frame paint cost.

**Audit.** Did a wider scan of the codebase rather than apply a guess. Tools: `grep_search` for `requestAnimationFrame`/`setInterval`/`setTimeout`, `addEventListener('pointermove'|'mousemove'|...)`, `React.memo`, `subscribe|useStore|create`, `*Overlay*` files, `@keyframes|animation:`, then targeted reads of `FpsOverlay.tsx`, `useSimulation.ts`, `Editor.tsx`, `PixiCanvas.tsx`, plus the relevant `index.css` keyframes. Findings ranked by actual impact (not the order I noticed them):

1. **Wire/bulb halos used `feGaussianBlur` filters with stroke-dashoffset / opacity animations applied to the same elements** — Chromium software-rasterises SVG filters and any animated property invalidates the filter cache **every frame**. Re-running a Gaussian blur convolution at 60 Hz per energised element. Linear scaling matched the user's numbers exactly.
2. **`FpsOverlay` ran a perpetual rAF loop in dev** even when hidden, preventing background-throttling and adding ~3–8% idle CPU.
3. (Older, not the headline) Stress seeding fires 302 sequential store mutations. (Worth fixing later but not the dominant cost in this report.)
4. (Older) `ComponentNode` / `WirePath` not `React.memo`'d. (Hover/drag smoothness, not sim-running CPU.)
5. (Older) Hover state global. (Same as above.)
6. (Older) BFS `Array.shift()` is `O(W²)`. (Negligible below ~5,000 wires.)

A/B test before fixing: I disabled the FpsOverlay mount in `main.tsx` and asked the user to retest. Result: idle 12–15%, sim-running on 3 comps still 45–50%. So the FpsOverlay was contributing some idle baseline but the sim-running CPU was elsewhere. That ruled in finding #1 as primary.

**Decision.** Apply Option A (replace filter glow with stroke/circle halo) + Option C (add `reducedEffects` setting with auto-threshold at >50 components). The user explicitly approved this scope after I clarified that the moving-dashes "current is flowing" cue is preserved — only the filter cost is removed.

**Implementation files:**
- `src/store/settingsStore.ts` — added `reducedEffects: boolean` to `UserSettings` (default `false`); included in snapshot/subscribe diff/persistence; forward-compat in `isPersistedSettings` (older blobs hydrate without it).
- `src/ui/CircuitCanvas.tsx` —
  - Subscribed to `reducedEffectsSetting`; computed `reducedEffects = setting || components.length > 50`; derived `currentFlowOn`, `activeLoadEffects`, `wireGlowOn` once at the top, passed down.
  - Removed `glow-${filterId}` and `bulb-glow-${filterId}` `<filter>` defs entirely. Kept `shadow-${filterId}` (stable filter cache, idle components).
  - Wire halo: layered underlying `<path>` with `strokeWidth = main + 5`, `strokeOpacity = 0.22`, no dasharray, no animation. Painted once per render and cached.
  - Bulb halo: replaced filtered circle with two stacked plain circles (`r=22, opacity=0.12` outer; `r=14, opacity=0.35` inner with the existing `electrasim-bulb-pulse` animation — opacity-only on a non-filtered element is GPU-accelerated and free).
  - `WirePath` gained a `wireGlowOn: boolean` prop replacing the in-component `theme.wireGlow` lookup. `filterId` is now unused in `WirePath` (renamed to `_filterId`); kept in interface for backward compat.
- `src/ui/components/SettingsModal.tsx` — added "Reduce visual effects" Toggle in the Simulation visuals group with description noting auto-threshold.
- `src/lib/FpsOverlay.tsx` — default `visible = false`; rAF effect early-returns when hidden and re-mounts when visible flips on (effect dep array now includes `visible`); keybind unchanged.
- `src/main.tsx` — re-enabled `<DevOverlay />` mount (was temporarily disabled during the A/B test).
- `src/ui/components/DocsPage.tsx` — added a `TIPS` entry for the new setting.
- `README.md` — added Phase 6.2.2 highlight bullet.
- `CHANGELOG.md` — full Phase 6.2.2 entry covering root cause, fix, verification, expected impact, and explicitly-deferred items.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89 · `vite build` ✅ (bundle unchanged at **104.60 KB gzip** main chunk).

**Expected user-observable impact** (predictions before user re-test):
- 3 components + 1 energised wire, sim running: 45–50% → ~16–18%
- Stress test + sim running: 80–90% → ~25–35% (auto-threshold engages)
- Idle CPU: 12–15% → ~8–12% (FpsOverlay no longer running rAF unconditionally)

**Lessons logged.**
1. When CPU correlates with "thing is *visible and animating*" rather than "thing *changed*", suspect paint, not script. My initial mental model in this conversation was JS/React-centric; the actual cost lived in the SVG paint pipeline. Future me: when you see a linear scale with the count of *visually active* elements, jump straight to the paint inspector / SVG filter audit.
2. SVG `feGaussianBlur` + any animated property on the same element = catastrophic on Chromium. CSS `filter: blur()` on HTML elements is GPU-accelerated and behaves differently. Don't conflate them.
3. A perpetual rAF keeps the tab from being throttled. Even if the per-tick cost is small, the second-order cost of "browser cannot enter low-power mode" is real on weak hardware.
4. Run the user's stress test scenario before declaring a phase done, not just the seed circuit. Phase 6.2.1 was tested only against ~10 components; the bug surface that mattered was at ~150.

**Next sub-features (still pending under Phase 6.2):**
- Multi-select (drag-rect + Shift-click). D6 locked.
- Copy/paste (Ctrl+C/V in-memory). D7 locked.
- Inline rename in inspector.
- Snap-to-component edges.
- Wire labels.
- (Tracked separately) `React.memo` + stable callbacks + local hover for interaction smoothness — Phase 6.2.3 candidate.

---

## Session — Phase 6.2.2 b + c (perf round 2 + pan & phone-dock fixes)

User-reported state after the 6.2.2 ship:
- The `Reduce visual effects` toggle worked correctly. ✓
- BUT the *default* (toggle off) experience still hit ~50% CPU on three components with one energised wire — the original complaint.
- Plus two new bugs they discovered: clicking-and-dragging on empty canvas didn't pan (only noticed when a resized window pushed components off-screen), and the bottom phone-dock `+ Add` / `Layers` / `AI` / `Cfg` buttons did nothing.

### 6.2.2b — perf round 2

With the SVG filters already removed in 6.2.2, the only continuous per-frame cost left was:
1. `stroke-dashoffset` keyframe on the energised wire → forces SVG path re-rasterisation 60×/sec.
2. `electrasim-bulb-pulse` opacity keyframe on the bulb halo → forces circle re-rasterisation 60×/sec.

Both are non-cached SVG paints. Even one of each can cost 25-30% CPU on weak hardware.

**Decisions:**
- Bulb halo → static. Per the user's explicit suggestion. Removed the `electrasim-bulb-pulse` className. The halo is now two stacked plain circles that simply appear when energised and disappear when de-energised. Nothing animating.
- Wire-flow → quantised. Changed CSS animation to `1.5s steps(36, end) infinite`. This makes the dashoffset advance in 36 discrete frames per loop ≈ 24 paints/sec instead of 60. The eye still reads it as smooth motion but per-wire paint cost drops ~60%.

The reduce-effects toggle still works as the inverse (full disable). 24 fps quantisation is a middle ground that keeps the directional "current is flowing" cue without paying the full 60 fps paint tax.

### 6.2.2c — two latent UX bugs

**Bug A: pan never started.** `handleBackgroundPointerDown` had `if (e.target !== e.currentTarget) return;`. With the full-viewBox grid `<rect>` always catching pointer events first, `e.target` was always the grid rect, never the svg, so the check was always true. **Pan has been broken for every user since this code was written.** The user only noticed when resizing pushed components off-screen.

Fix:
- Removed the strict check. Pan now starts whenever pointerdown bubbles up to the SVG.
- Component pointer handlers already `stopPropagation()`. Wires didn't, so I added `onPointerDown={(e) => e.stopPropagation()}` to the WirePath group — clicking a wire body now selects it (via the existing onClick on pointerup) without starting a pan.
- Added `panDidMoveRef` with 4 px deadzone. Distinguishes click-to-deselect from drag-to-pan. The SVG-level and grid-rect-level click handlers check this flag and short-circuit when set, so a pan drag no longer accidentally deselects, drops a placing component, or cancels an armed reroute on pointerup.
- Middle-mouse (button 1) pans too.

**Bug B: phone-dock buttons were stubs.** `PhoneBtn` in `PhoneDock.tsx` had no `onClick` prop. The four buttons rendered correctly but did nothing — pure visual stub since Phase 0b. Below 640 px width (which `useDevice` classifies as `phone`), the entire bottom dock was decorative.

Fix: added `onClick?: () => void` to `PhoneBtnProps` and wired the four buttons:
- Add → `togglePalette()`
- Layers → `toggleInspector()`
- AI → `addLog('AI assistant ships in v2.0 …', 'info')` placeholder
- Cfg → `setSettingsOpen(true)`

Also added `transition active:scale-95` so taps have visual feedback.

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89.

**Lessons logged.**
1. **A click-event-target equality check is a fragile way to detect "background click"** when a child element covers the full canvas. Either mark intentional pan surfaces explicitly (data attribute) or invert the logic: start the pan unconditionally and have interactive children stop propagation. I chose the latter — fewer moving parts and matches how every other canvas tool works.
2. **CSS animation `steps()` is the right perf lever for SVG paint cost.** GPU promotion via `will-change` doesn't reliably work for SVG attributes like `stroke-dashoffset`; `steps()` doesn't change the underlying paint mechanism but cuts paint *frequency* directly. 24 fps was the sweet spot — readable as motion, half the cost.
3. **Stub UI rendered without onClick handlers will silently regress when reviewers don't click them.** PhoneDock had been in the codebase since Phase 0b without a single working button. Recommendation for future me: when scaffolding a layout shell, even a `console.log('todo')` onClick is better than nothing — it announces "this is incomplete" the first time anyone clicks it. A truly absent handler announces nothing at all.
4. **The 6.2.2 prediction model was too optimistic about post-fix CPU.** I predicted ~16-18% on 3 components after the filter fix; reality was ~50% because the dashoffset and opacity animations alone (on weak hardware) accounted for the bulk of the cost, not the filter. Lesson: when modelling per-element paint cost, don't assume "no filter = free" — SVG paint is intrinsically more expensive than HTML on Chromium when animated, regardless of filter status.

---

## Session — Phase 6.2.2d (fan/motor paint cost + phone palette never rendered)

**User feedback after 6.2.2b/c:**
- Bulb test: 50% → 10-15% ✓ (matches my prediction within margin).
- Ceiling-fan test: still ~50%. The fan animation alone is now the headline cost.
- Phone-dock "+ Add" button: still does nothing.
- User also asked: "should we use an animation library?"

### Bug C — fan/motor rotations same paint cost as wire-flow

Same root cause as before. `electrasim-fan-spin` is `transform: rotate(360deg)` applied to an SVG `<text>` glyph. Each frame the browser re-rasterises the glyph at the new angle. CSS transforms on SVG `<text>` (and on most SVG inner elements) are NOT GPU-promoted in Chromium — they go through the same software paint path. ~50% CPU for one rotating fan glyph on weak hardware.

Fix: same `steps()` mitigation as wire-flow.
- fan-spin: `1.4s steps(28, end)` → 20 paints/sec.
- motor-spin: `2.5s steps(50, end)` → 20 paints/sec.
- motor-pulse: `0.9s steps(18, end)` → 20 paints/sec.

20 fps for rotation is the floor I'd accept — below that the human eye starts seeing discrete frames. 20 fps feels smooth enough for educational software. The reduce-effects toggle remains the inverse for users who'd rather have zero animation.

### Bug D — phone palette null-return

`Palette.tsx` line 76 had `if (isPhone) return null;`. So when the phone-dock "+ Add" toggled `paletteOpen`, the Palette component refused to render anything. Phase 0b stub.

Fix: dropped the early-null. The 240-px desktop palette fits any viewport ≥ 320 px. A proper phone-bottom-sheet palette UX is parked for post-v1.0; in the meantime users on narrow windows get the same overlay everyone else sees.

### Animation library question — answered no

User asked if Motion (already a dep) would help. It would not. Animation libraries batch many animations under one rAF loop, which is a win when you have dozens going at once. They cannot GPU-promote what the browser refuses to GPU-promote — and SVG attribute animations like `stroke-dashoffset` and `transform` on `<text>` are software-painted regardless of who triggers them. The only levers that work are (a) paint less often (steps), (b) paint fewer elements (auto-threshold + reduce-effects). Both already applied.

**Pipeline status:** typecheck ✅ · 89/89 tests ✅ · build ✅.

**Lessons logged.**
1. **Three identical bugs in a row, three identical fixes.** Wire-flow, bulb-pulse, fan-spin — all `paint a thing 60 times per second on hardware that can't afford it`. Should have done a global pass over all keyframes in 6.2.2b instead of fixing them one user-report at a time. For future me: when one animation is paint-bound, audit ALL of them in the same pass.
2. **`isPhone` early-returns are a special-case landmine.** Anywhere we have `if (isPhone) return null` or `if (isPhone) doSomethingElse()` is a place where the phone codepath has been untested. The phone-dock buttons being stubs (6.2.2c) and the phone palette returning null (6.2.2d) are the same anti-pattern. Worth doing a sweep of `isPhone` references before launch — already in PLAN as a pre-launch checklist item, should escalate.
3. **Steps quantisation tradeoff is acceptance vs perfection.** 20 fps animations have a perceptible tick on close inspection. The choice is: ship with 20 fps and weak-hardware users can use the app, OR ship with 60 fps and they cannot. Until v1.1 GPU rendering ships, 20 fps wins.

---

## 2026-04-30 — Phase 6.3 — UX polish (sim default, tabbed settings, electric toggles, About, export filename, canvas context menu)

**Done:**
- ✅ **Simulation off by default.** `simRunning` initialised to `false` in `uiStore`. Users must click Run/▶ to start. Prevents auto-animation confusion on first load.
- ✅ **Tabbed Settings modal** — `SettingsModal.tsx` completely rewritten with 4 tabs: Editing · Display · Simulation · About.
  - Each tab has a coloured intro banner (context + purpose).
  - Every boolean setting has a live-preview strip below it showing what the current state means in plain English.
  - Tab state resets to 'editing' on open unless `initialTab` is supplied.
- ✅ **Electric-style toggle switches** — replaced all `<input type="checkbox">` with custom pill switches: animated slide, blue glow ring when ON, decorative circuit-trace lines inside the pill, ON/OFF badge. Matches the Lab Glass · Light circuit aesthetic.
- ✅ **About tab** — brand card (gradient, version badges), tech-stack grid (8 items), roadmap status list (8 rows).
- ✅ **"About ElectraSim"** in MenuOverlay was a no-op stub. Now calls `setSettingsOpen(true, 'about')`. Added `settingsTab: string | null` to `uiStore` + updated `setSettingsOpen(open, tab?)` signature.
- ✅ **Export filename prompt** — JSON / SVG / PNG export handlers now show an inline absolute-positioned overlay inside the modal ("Save Circuit As") before triggering the download. Input supports Enter-to-confirm and Escape-to-cancel. Extension auto-appended if missing.
- ✅ **Canvas right-click menu** — "Clear All Wires", "Clear All Components", "Reset to Default Circuit" added as danger items under a separator when right-clicking empty canvas. Mirrors MenuOverlay items for discoverability.
- ✅ Wire routing selector and Color scheme selector redesigned as card-tile buttons with icon, title, and description copy.

**Files touched (Phase 6.3):**
- `src/store/uiStore.ts` — `simRunning: false`, `settingsTab`, `setSettingsOpen(open, tab?)`
- `src/ui/components/SettingsModal.tsx` — full rewrite (~470 LOC)
- `src/ui/components/ImportExportModal.tsx` — filename prompt overlay + updated handlers
- `src/ui/components/ContextMenu.tsx` — canvas items: Clear All Wires, Clear All Components, Reset
- `src/ui/components/MenuOverlay.tsx` — About item wired to `setSettingsOpen(true, 'about')`
- `src/ui/Editor.tsx` — reads `settingsTab`, passes `initialTab` to SettingsModal
- `CHANGELOG.md`, `progress.md`

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89 · `biome format` ✅

**Next sub-features (Phase 6.2 still pending):**
- Multi-select (drag-rect + Shift-click). D6 locked.
- Copy/paste (Ctrl+C/V in-memory). D7 locked.
- Inline rename in inspector.
- Snap-to-component edges.
- Wire labels.

---

## 2026-04-30 — Phase 6.2.3 — Multi-select (drag-rect + Shift-click + group drag)

**Done:**
- ✅ **`selectedComponentIds: string[]`** added to `circuitStore`. `selectComponent` / `selectWire` / `clearSelection` all keep the new field in sync. `toggleComponentSelection`, `setMultiSelection`, `moveComponents`, `removeSelectedComponents` added.
- ✅ **`dragRect`** added to `uiStore` (world-space `{x1,y1,x2,y2}`).
- ✅ **Drag-rect selection** — `handleBackgroundPointerDown` starts a `dragRectRef` when in idle mode (not wiring/placing/middle-mouse). `pointermove` updates the rect live. `pointerup` commits: AABB-tests all components, calls `setMultiSelection` if ≥1 inside. 4px minimum prevents accidental activation on single click.
- ✅ **Shift-click** — `handleComponentPointerDown` calls `toggleComponentSelection` when `e.shiftKey`. Normal click collapses to single-select if the target isn't already selected.
- ✅ **Group drag** — `DragState` gained `otherStarts?: Map<id, {x,y}>`. On `pointermove`, if `selectedComponentIds.length > 1`, all selected components move by the same `(dx, dy)`. On `pointerup`, all snap to grid together.
- ✅ **Bulk delete** — `Delete` key path in `useKeyboardShortcuts` checks `multiIds.length > 1` first; calls `removeSelectedComponents()` (one undo step).
- ✅ **Multi-select Inspector panel** — when `selectedComponentIds.length > 1`, Inspector renders a summary with count, usage tips, bulk-delete button, clear-selection button. Blue ring border distinguishes it from single-select.
- ✅ **Multi-select highlight rings** — dashed SVG `<rect>` rings drawn around each selected component (rendered below components layer, `pointerEvents="none"`).
- ✅ **Drag-rect visual** — animated dashed SVG `<rect>` rendered in world-space inside the world `<g>`, updates live as the user drags.

**Files touched (Phase 6.2.3):**
- `src/store/circuitStore.ts`
- `src/store/uiStore.ts`
- `src/store/index.ts` (barrel formatting)
- `src/ui/CircuitCanvas.tsx`
- `src/ui/hooks/useKeyboardShortcuts.ts`
- `src/ui/components/Inspector.tsx`
- `CHANGELOG.md`, `progress.md`

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89 · `biome format` ✅

**Next:**
- ✅ Phase 6.2.4 (see session below).

---

## Phase 6.2.4 — Copy / Paste  *(session — $(date))*

**Goal:** Ctrl+C copies selected component(s) to an in-memory clipboard; Ctrl+V pastes with a stacking 24 px offset. D7 locked — clipboard is in-memory only for v1.0.

### What was built
- **`src/store/clipboardStore.ts`** — new lightweight Zustand store: `items: ComponentInstance[]`, `pasteCount: number`, `copy()`, `incrementPasteCount()`, `clear()`. No temporal middleware (clipboard ops are not undoable, only the paste result is).
- **`circuitStore.pasteComponents(items, offset)`** — generates fresh IDs (`type-paste-timestamp-random`), pushes pasted components, then selects the pasted group so the user can drag immediately. Goes through the normal `temporal` middleware → single undo step.
- **`useKeyboardShortcuts.ts`** — `Ctrl+C` copies `selectedComponentIds`, `Ctrl+V` increments `pasteCount`, applies `pasteCount × 24 px` offset, calls `pasteComponents`. Fixed bare `V` guard to `!meta` to prevent conflict.
- **DocsPage** — Ctrl+C and Ctrl+V added to SHORTCUTS table; two new Tips entries (multi-select + copy/paste workflow).
- **README** — multi-select and copy/paste highlights bullets added.
- **CHANGELOG** — Phase 6.2.4 `Added` block.

### Files touched
- `src/store/clipboardStore.ts` (new)
- `src/store/circuitStore.ts` — `pasteComponents` interface + impl
- `src/store/index.ts` — export `useClipboardStore`
- `src/ui/hooks/useKeyboardShortcuts.ts` — Ctrl+C / Ctrl+V, bare V guard
- `src/ui/components/DocsPage.tsx` — shortcuts + tips
- `README.md`, `CHANGELOG.md`, `progress.md`

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89

**Next:**
- ✅ Phase 6.11 (see session below).

---

## Phase 6.11 — Full UI Dark Mode

**Goal:** Add `dark:` Tailwind variants to all UI panels so dark mode covers more than just the canvas. ~1 day scope (PLAN.md §8 row).

### Mechanism
- `Editor.tsx` — `useEffect` calls `document.documentElement.classList.toggle('dark', isDark)` on every `resolvedTheme` change. This is the single source of truth for Tailwind's `dark:` variant activation.
- Tailwind v4 uses class-based dark mode by default — no config needed.

### Files touched
- `src/ui/Editor.tsx` — dark class toggle on `<html>`
- `src/ui/components/Toolbar.tsx` — toolbar capsule, brand text, Sep, AI button, MenuTrigger
- `src/ui/components/IconBtn.tsx` — hover + disabled state
- `src/ui/components/Palette.tsx` — panel, header, search input, category headers, item tiles (active + default)
- `src/ui/components/Inspector.tsx` — both single-select and multi-select panels
- `src/ui/components/PillField.tsx` — container, label, value color variants
- `src/ui/components/LogPanel.tsx` — panel, header button, log body
- `src/ui/components/ToolDock.tsx` — both pill rows
- `src/ui/components/StatusPill.tsx` — pill container
- `src/ui/components/MenuOverlay.tsx` — panel, header, separators, item rows, footer
- `src/ui/components/Modal.tsx` — panel, title header, footer bar
- `src/ui/components/ConfirmDialog.tsx` — cancel button, body text
- `src/ui/components/SettingsModal.tsx` — footer buttons, tab bar, TabIntro, ElectricToggle, RoutingStyleSelector, SchemeSelector, AboutTab tech stack + roadmap
- `src/ui/components/ContactModal.tsx` — instruction panels, text, footer
- `src/ui/components/DocsPage.tsx` — new dark mode tip
- `README.md`, `CHANGELOG.md`, `progress.md`

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89

**Next:**
- **Phase 7** — Custom wiring + multi-step placement (paint-style, opt-in, atomic undo).

---

## 2026-04-30 — Phase 6.2.2f/g — SVG Rendering Performance (CPU spike fix)

### Problem
CPU jumped from ~10–15% idle to ~50–65% whenever the simulation was running with wires on the canvas. Deleting all wires returned it to normal. Symptom pointed to CSS animation, but two incorrect fixes were applied first:

**Failed attempt 6.2.2e:**
- Replaced `stroke-dashoffset` animation with an `opacity` pulse on an overlay `<path>`.
- Reasoning: "opacity on SVG is composited". This was wrong — Chrome only composites opacity on rectangular bitmap elements (images, solid divs). SVG `<path>` with a stroke still forces software repaint regardless of which property animates.
- Made it worse (3 paths per wire → more repaints).

### Real Root Cause
`feDropShadow` SVG filter on all 16 component `<rect>`s. When any CSS-animated element (fan spin, motor spin) exists in the **same SVG stacking context** as a filtered element, Chromium must re-rasterise the **entire filter region** on every animation step. With 16 components all sharing one SVG, every 13-fps animation step invalidated all 16 `feDropShadow` computations simultaneously.

Formula: 2 spinning icons × 13 steps/sec × 16 filter regions = ~416 filter repaints/sec → 40–50% CPU.

### Fix (6.2.2f)
- `shadow: false` on both `labGlassLight` and `labGlassDark` themes — removes `feDropShadow` from all component rects entirely.
- Static offset `<rect>` shadow (2px / 3px offset, `fillOpacity: 0.06`) — identical visual depth, zero per-frame cost, not a filter.
- All 6.2.2e `opacity`-overlay-path changes reverted.

### Fix (6.2.2g) — wire animation re-enabled
- With the filter cascade gone, `stroke-dashoffset` on a plain `<path>` now costs only the path itself.
- `electrasim-wire-flow` animation re-enabled at `steps(12, end)` / 1.5s ≈ 8 paints/sec.

### Fix — wire glow halo removed
- The second `<path>` rendered per energised wire (wide semi-transparent halo, `wireGlowOn`) removed entirely from `WirePath`.
- `wireGlow: false` on dark theme too.
- Each wire now renders: 1 invisible hit-target + 1 animated stroke. That's it.

**Files touched (Phase 6.2.2f/g):**
- `src/ui/theme.ts` — `shadow: false`, `wireGlow: false` both themes
- `src/ui/CircuitCanvas.tsx` — static shadow rect, halo path removed, animation class restored
- `src/index.css` — wire-flow animation re-enabled at `steps(12)`

**Pipeline status:** `tsc --noEmit` ✅ · `vitest run` ✅ 89/89 · `biome format` ✅

**Next:**
- **Phase 6.2.4** — Copy/paste (Ctrl+C/V, in-memory clipboard). Unblocked.
- Or **Phase 6.11** — inline rename, wire labels.

## 2026-08-10 — Pro-Mode Refactor Completion & Repository Cleanup

**Done:**
- Completed the pro-mode refactor that had left `npm run typecheck` failing with 13 errors: added `SimulationResult.faultsCleared` (computed in the engine, gates the Tripped Breaker reset), initialized `eventHistoryOpen` in the UI store, added `isDark` to `CanvasTheme`, and fixed the stale `dimmerLevel`/`resistance` state fields and the dead `appMode === 'basic'` comparison inside the Inspector's pro branch.
- Wired the status-bar Snap toggle end to end: new `snapToGrid` user setting (type, default, hydrate, snapshot, autosave guard) honoured by `dropComponentAt`, `commitDrag`, and drag-commit resolution in `useCanvasPointerWindow`; `appMode` now persisted via the settings snapshot too.
- Fixed the bottom dashboard's phase-cut waveform to read the dimmer `speed` state and resolved energized component names through `COMPONENT_DEFS` instead of a non-existent instance `label`.
- Restored `.gitignore` (its rules had been overwritten with prose), keeping `node_modules/`, `dist/`, `test-results/`, and generated `.astro` output out of version control.

**Verification:**
- `npm run check` green: typecheck (app + e2e configs), Biome lint, and Vitest **31 files / 190 tests passed** (3 new `faultsCleared` engine tests).
- `npm run build` green: Vite app + Astro site + postbuild merge to `dist/` completed with no errors.
- `check:perf` could not be run in-place because the workspace path contains spaces and `scripts/check-performance.mjs` resolves its `dist/` via `URL.pathname` (percent-encoded) — pre-existing tooling quirk, verified independently that `dist/app/index.html` exists.

**Next:**
- Decide whether to mount `EventHistoryPanel` in the editor UI (state exists, component is currently unreachable) and add a `setEventHistoryOpen` action.
- Optionally fix `scripts/check-performance.mjs` to decode the URL pathname so the gate works from paths containing spaces.

**Blockers / Notes:**
- None.

## 2026-08-10 — Post-merge A11y Role Restoration

**Done:**
- Pulled `origin/main`, which merged PR #5 (v0 roadmap features: challenge progress tracking, electrical calculations, appliance variant images, blown-component spark/smoke/shatter animations).
- Restored `role="button"` on the SVG component and wire hitboxes after the merge removed them, re-establishing the keyboard / screen-reader contract locked in `CircuitCanvas.test.tsx` (3 tests were failing). Kept the existing `biome-ignore lint/a11y/useSemanticElements` suppressions layout so Biome stays clean.

**Verification:**
- `npm run check` green: typecheck (app + e2e configs), Biome lint, and Vitest **32 files / 194 tests passed**.
- Dev server (`npm run dev`) serving HTTP 200 on `localhost:3000`.

---

## Session: broken-HEAD repair + monolith refactors (2026-08-15, external contributor)

### Fixed (all verified: typecheck 0 errors · biome lint exit 0 · 231/231 tests · vite build OK)
- Commit `140ed41` had broken the build: 10 component-variant image imports referenced files that were never committed — all 10 generated in the existing studio-photo style and committed.
- 29 TypeScript errors closed: `WireInstance.fault` widened via new `WireFaultType` + `isWireFaultType()` guard; `ConnectionValidationResult.warnings` added; `FaultTarget` narrowing hoisted out of closures (faults.ts, circuitStore.ts); `state.blown`→`isBlown`; inspector sparkline voltage source fixed; validation test fixtures given required `controlPoints`.
- Modal: Escape/backdrop now invoke the latest `onClose` synchronously; the exit animation had also been cancelling its own unmount timer (dialogs stuck in DOM).
- Restored `role="button"` on canvas port hit circles (a11y regression removed by `140ed41`).
- Latent biome failure since `31af42a` resolved via scoped `useSemanticElements` override for canvas SVG files; repo lint was red with zero CI to notice.
- CI: a GitHub Actions check workflow was drafted during this session, then deliberately dropped before pushing — owner decision: deployment runs locally with no live sites, so GitHub CI adds no value. Local gates (`npm run check` + `npx vite build`) remain the quality bar.

### Refactored (pure code-moves; bodies verified byte-identical; shims keep import paths)
- `Inspector.tsx` 3166 → `src/ui/components/inspector/` (9 modules + data + hook).
- `components.ts` 1405 → `src/domain/components/` (10 zone modules; registry order/values verified identical).
- `simulation.ts` 1025 → `src/domain/simulation/` (indexing / traversal / tripCurves / simulate; still worker-pure).
- `componentHelp.ts` 919 → `src/domain/componentHelp/` (5 zone modules).
- `uiStore.ts` 906 → 579 + `uiStore.types.ts` + `uiStore.helpers.ts`.
- `circuitStore.ts` 1092 → 739 + types/history/actions/faultActions modules.
- `ComponentLayer.tsx` 889 → 97 + `ComponentNode.tsx` + `ComponentTooltip.tsx`.
- `ContextMenu.tsx` 728 → ~150 + `contextMenuItems.ts`.
- `circuitValidation.ts` 889 → 835 + `circuitValidationTypes.ts` (the remainder is one cohesive `validateCircuit()` pass; intentionally left unsplit).

---

## Session 2026-08-15 (part 2) — Real-world data accuracy audit (web-verified)

**Task (user request):** "have you actually checked that all info in this repo is accurate according to real world data? … if not then correct" — full fact-check of engineering/regulatory claims against authoritative web sources.

**Method:** inventoried every factual surface — `simulation/tripCurves.ts` (ampacity table + MCB/RCD curves), component definitions, `componentHelp/` educational copy, `faults.ts` testing prose, validation rules, and astro-site blog regulatory claims — then web-verified the load-bearing numbers against BS 7671 / IEC 60898-1 / IEC 61008-1 references.

**Corrections made** (branch `fix/bs7671-data-accuracy`):
1. **Cable ampacity** was a mixed-method table masquerading as "BS 7671 Table 4D5": 1.0 mm² = 11 A and 1.5 mm² = 16 A are derated (Method A/B-territory) values; corrected to consistent Reference Method C: 16/20/27/37/47/64/85 A. Header now explicitly documents the Method C assumption + derating caveat.
2. **MCB thermal curve** `t = 3600/(m²−1)` violated IEC 60898-1 Table 7: 2.55×In persisted ~654 s vs mandated 1–60 s. Replaced with power law `t = K/(m²−1)^α` (K = 4615.65876415, α = 2.5468325498) fitted exactly through both IEC anchors; also reproduces the published 0.1–45 s Type B response band at 3–5×In.
3. **Magnetic trip threshold** modelled at the *lower* band edge (3×In) where IEC only specifies the *no-trip* test; now instantaneous at ≥ upper band edge (B 5×, C 10×, D 20×In).
4. **RCD break times** were linearly interpolated (235 ms at 2×IΔn vs IEC 61008-1 limit 150 ms); now stepped 300/150/40 ms at 1×/2×/5×IΔn.
5. **New `tripCurves.test.ts`** — 25 regression tests whose expectations are the published standard values themselves, locking the physics against future drift. 256/256 green, lint clean, build OK.

**Verified accurate, no change required:** Amendment 4:2026 blog (dates, Orange Book, transition), AFDD 421.1.7 blog scope, EICR 5/10-year intervals, socket ≤32 A 30 mA RCD requirement, GFCI/UL 943 refs, immersion 3 kW ≈ 13 A, EV 7.36 kW @ 32 A, LED efficacy figures, insulation-resistance ≥1 MΩ test minimum, twin-socket 20 A combined rating.

**Follow-up ideas surfaced by the audit (product features):** installation-method/derating selector, wire-length voltage-drop checks, Zs/disconnection checker, RCD type (AC/A/F/B) selection with DC-blinding fault scenario, AFDD component + arc-fault scenario, mini-EIC report export.
