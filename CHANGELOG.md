# Changelog

All notable changes to **ElectraSim — Interactive Wiring Lab** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Master plan:** [`PLAN.md`](./PLAN.md) · **Session log:** [`progress.md`](./progress.md)

---

## [Unreleased]

### Added
- **Component variant imagery** — generated studio-style product photos for the ten component variants referenced by `componentImages.ts` but never committed: RCBO, MCB Type C / Type D, industrial MCCB, SPD, USB / GFCI sockets, cooker switch, dimmer switch, and PIR sensor. The production build no longer fails on unresolved image imports.
- **`ConnectionValidationResult.warnings`** — the connection validator now exposes non-blocking diagnostics as an optional array, matching what the canvas interaction layer expected when logging wire-creation warnings.
- **`WireFaultType` + `isWireFaultType()`** — the legacy per-wire `fault` field now formally supports `open-neutral` and `live-to-earth` (both already handled by the injected-fault simulation pipeline), so Context Menu / Inspector wire-fault buttons typecheck and persist.

### Fixed
- **29 TypeScript errors from `140ed41`** — broken typecheck is green again: widened `WireInstance.fault` / `setWireFault` to the conductor-level fault kinds the UI already offered, restored the accidentally deleted `role="button"` on canvas port hit circles (keyboard / screen-reader reroute flow), switched the inspector sparkline to `state.customVoltage ?? 230` (the removed `def.defaultVoltage`), fixed `state.blown` → `state.isBlown`, and hoisted `FaultTarget` narrowing out of closures in `faults.ts` / `circuitStore.ts` (TS cannot preserve property narrowing across callback boundaries).
- **Modal close semantics** — `Modal` now invokes the *latest* `onClose` synchronously on Escape / backdrop click; the previous animation-wrapped deferral both delayed the callback by 200 ms and could invoke a stale prop. Also fixed the exit-animation effect cancelling its own unmount timer (`isClosing` was a dependency), which left closed dialogs mounted in the DOM forever.
- **Test suite green again** — `MobileSuitabilityModal` spec now awaits the intentional 200 ms exit animation instead of asserting synchronous unmount; validation test fixtures supply the required `controlPoints` field. 231/231 tests passing, `vite build` succeeds.

- **Pro-mode refactor completed** — the Student / Pro toggle now reaches every surface: the Tripped Breaker reset card (gated until the simulation reports `faultsCleared`), full settings persistence for `appMode` and the new `snapToGrid` flag, and a working Snap/Grid status-bar toggle that gates grid snapping on placement and drag-commit.
- **`SimulationResult.faultsCleared`** — the engine now reports whether the last pass produced no error-level findings, so breaker resets are only enabled once the underlying fault is cleared.
- **Dimmer waveform fidelity** — the pro dashboard's phase-cut waveform now reads the dimmer's actual `speed` state instead of a non-existent `dimmerLevel` field.

### Changed
- **Inspector module split** — the 3,166-line `src/ui/components/Inspector.tsx` monolith is now `src/ui/components/inspector/` with one module per view (properties router, wire view, component view, connections, simulation, analytics, logs), a dedicated selection-state hook module, and a variant-family data module. Bodies are verified byte-identical to the originals; `src/ui/components/Inspector.tsx` is now a thin re-export shim, so existing imports keep working.
- **Student / Pro guidance** — the Inspector's "What Happened?" fault analysis and the Toolbar's mode switch carry the full basic/pro split (Student guidance card vs. BS 7671 Pro Customizer).
- **Event-history state contract** — `eventHistoryOpen` is initialized and lint/formatted with the rest of the pro-mode surface (fault alerts, event history, tripped/blown/melt visual states).

### Fixed
- **13 TypeScript errors** blocking `npm run typecheck` after the pro-mode work landed — dead `appMode === 'basic'` comparison inside the pro branch, stale `dimmerLevel`/`resistance` reset fields, missing `faultsCleared` on `SimulationResult`, missing `eventHistoryOpen` in the UI store initial state, `isDark` absent from `CanvasTheme`, `snapToGrid` referenced but never declared, `appMode` dropped from the settings snapshot, and a component-label lookup that read a non-existent `label` property.
- **Restored `.gitignore`** — its rules had been overwritten with prose, leaving `node_modules/` and `dist/` untracked; standard build/test/editor ignores are back in place.
- **Restored canvas keyboard / screen-reader roles** — the v0 roadmap merge had removed `role="button"` from component and wire hitboxes, breaking the accessibility contract locked in `CircuitCanvas.test.tsx` (3 failing tests); the roles are back and the suite is green again.

### Added (refactor follow-ups)
- **Context-menu item builder extraction** — the 507-line `buildItems` target-aware menu definition moved out of `ContextMenu.tsx` into `contextMenuItems.ts` (pure data builders; the dialog component now reads at ~150 lines).
- **Validation report types module** — `circuitValidation.ts` types now live in `circuitValidationTypes.ts`, re-exported from the original path.

### Fixed (refactor follow-ups)
- **Latent lint failure on `role="button"` SVG hit-targets** — the pre-existing `useSemanticElements` error on port circles (unsupressible via comments in Biome 1.9.4 at that nesting) is now handled with a scoped override in `biome.json` for the canvas component-node files; the two stale (never-binding) inline suppression comments were removed. `biome lint` now exits clean with zero warnings for the first time.

## [1.6.1] — 2026-07-21

### Added
- **Two practical Guided Circuits** — Push-Button Doorbell demonstrates momentary press-and-hold control, while RCBO-Protected Socket demonstrates switched Live and Neutral paths with a protective-earth connection and test load.
- **Phone suitability advisory** — first-time phone visitors receive an accessible, dismissible notice that circuit building is easier on a tablet or computer, without blocking continued phone use.

### Changed
- **Clearer learning boundaries** — Push Button, MCB, RCD, RCBO, Contactor, and Bell descriptions now distinguish the simulated path behavior from real numeric overload, leakage, trip-curve, coil, and auxiliary-contact behavior.
- **Improved Bell feedback** — an energised Bell now provides a visible pulse when active-load effects are enabled, while respecting reduced-motion preferences.
- **Focused welcome experience** — first-time guidance prioritises Guided Circuits, direct canvas use, documentation, local storage, and the simulator's educational scope.
- **Homepage search presentation** — the homepage title, main heading, description, and visible supporting copy now identify ElectraSim as a free online electrical wiring simulator using accurate component and browser-use language.
- **Release identity** — root and Astro workspace versions move to `1.6.1`; in-app labels, structured metadata, and versioned marketing-script cache keys continue to inherit the root version.
- **Repository backup target** — the active Git remote and Sveltia CMS repository reference move to the private `cngohar/electrasimw` backup. The previous Cloudflare-connected repository remains recorded only as a legacy reference, and no Cloudflare integration was created for the backup.

## [1.6.0] — 2026-07-20

### Added
- **RCBO component** — a two-pole protection device with separate Live and Neutral input/output paths joins the simulator palette and component reference.
- **Circuit-simulator comparison** — the new `/compare/` route compares ElectraSim with CircuitLab, Tinkercad Circuits, EveryCircuit, Falstad/CircuitJS, and DCACLab by task using dated official sources, visible methodology, candid limitations, responsive tables, FAQs, and complete canonical/structured metadata.
- **Plain-language v1.6 release article** — `electrasim-v1-6-dark-mode-rcbo-comparison-update.md` explains the day's changes without internal implementation or benchmark terminology.
- **Push Button learning guide** — `how-does-a-push-button-switch-work.md` explains momentary and maintained actions, NO and NC contacts, doorbell circuits, contactor holding logic, emergency-stop boundaries, and the simulator's true press-and-hold behavior. A responsive original illustration is included in AVIF and WebP formats.

### Changed
- **True momentary Push Button** — pointer and keyboard press/release now close the contact only while held; interrupted gestures release safely, transient presses stay out of undo history and saved circuits, and labels describe Pressed/Released state.
- **Dark mode across both surfaces** — the app's remaining documentation, context-menu, and phone surfaces follow Light/Dark/System correctly; the marketing site adds a persistent, CSP-compatible appearance toggle and theme-aware page styles.
- **Blog-index structure** — App Updates and regular learning articles have distinct sections and card treatments after each existing page slice is calculated, preserving page counts, canonical URLs, and previous/next links.
- **Contactor learning accuracy** — existing articles now describe the current Contactor as a manual representation of coil state instead of claiming that ElectraSim exposes coil and auxiliary-contact terminals.
- **Release identity** — root and Astro workspace versions move to `1.6.0`; in-app labels, metadata, and versioned marketing-script cache keys continue to inherit the root version.
- **Patched build tooling** — Wrangler is now `4.112.0` and Astro is `6.4.8`, removing the high- and moderate-severity advisories reported by the previous Astro version. Static-site packages are classified as development dependencies so production audits describe the deployed runtime accurately.

### Fixed
- **Protection placement defaults** — components that declare a closed default, including MCB, fuse, RCD, and RCBO, now start closed when placed from the palette.
- **System theme refresh** — switching the app back to System immediately re-reads the current operating-system preference instead of briefly using a stale value.
- **Momentary-state recovery** — imports, local restoration, copying, pointer cancellation, focus loss, and window blur cannot leave a Push Button permanently pressed.
- **Capability wording** — homepage and comparison copy now name the fault scenarios ElectraSim actually supports instead of claiming overload simulation.
- **Homepage cache recovery** — `/sw.js` now retires the obsolete site-wide worker while the active simulator worker remains scoped to `/app/`, preventing an old cached marketing homepage from hiding the real product screenshot after deployment.

## [1.5.1] — 2026-07-18

### Added
- **Flickering-lights safety guide** — `why-do-my-lights-flicker-common-causes-safe-checks.md` explains single-bulb faults, LED/dimmer compatibility, wider circuit warning signs, safe non-invasive checks, and when to call a registered electrician.
- **Supporting internal links** — the fault-finding, dimmer, and lighting-circuit guides now point readers to the dedicated flickering-lights article.
- **Homepage promotion and social copy** — the new guide is included in the curated homepage collection and has a ready-to-publish Facebook entry.

### Changed
- **Plain-language v1.5 article** — the App Update now focuses on everyday user benefits instead of implementation terminology, benchmark tables, code structure, and test counts.
- **Featured-post state** — Guided Circuits is no longer marked featured, leaving the v1.5 App Update as the only featured blog article.
- **Release identity** — root and Astro workspace versions are now `1.5.1`; README, tracking, and roadmap references were updated, while in-app labels, cache keys, and structured data inherit the root package version.

## [1.5.0] — 2026-07-16

### Added
- **Keyboard-operable SVG canvas** — components, ports, and wires expose focusable controls and accessible state; keyboard users can select, wire, and reroute without a pointer.
- **Release performance gates** — built-asset budgets, dense solver and browser benchmarks, generated-link validation, responsive Playwright workflows, and a separate Wrangler-preview production suite.
- **App Update article** — `electrasim-v1-5-performance-accessibility-privacy-update.md` explains the user-facing canvas, accessibility, saving, sharing, privacy, and website improvements in plain language.
- **Production version metadata** — the root package manifest now feeds in-app version labels and `SoftwareApplication.softwareVersion` structured data.

### Changed
- **Dense-canvas interaction path** — pan and multi-component drag use transient DOM transforms, `requestAnimationFrame` coalescing, one release commit, and interaction-time level of detail instead of writing every raw pointer update through React state.
- **Module ownership** — the SVG canvas, Pixi prototype, import/export code, documentation, settings, and Astro marketing routes/styles were split into focused modules with smaller public boundaries.
- **Simulation and persistence** — worker subscriptions, fallback behavior, autosave lifecycle flushing, hydrated-state validation, and IndexedDB failure handling were tightened.
- **Marketing delivery** — responsive AVIF/WebP assets, system fonts, static blog pagination/tag archives, centralized blog helpers, and the combined Vite/Astro deployment pipeline reduce initial work and repeated route logic.
- **PWA caching** — the initial precache favors the public SVG editor while optional renderer chunks are cached only after use.
- **Release identity** — root and Astro workspace packages are unified at `1.5.0`; stale `v1.0`/`v1.1` UI labels and the hard-coded test count were removed.

### Fixed
- **Share-link privacy and bounds** — current links use URL fragments, legacy query links migrate after decode, and decompression is capped before text materialization.
- **Modal and responsive behavior** — focus entry/return, Escape handling, lazy dialog loading, stable canvas dimensions, and phone/tablet layouts now have focused regression coverage.
- **SEO and navigation integrity** — canonical metadata, sitemap ownership, generated tag links, and internal links are validated against the complete production artifact.
- **Strict-CSP deployment drift** — HTML routes send `Cache-Control: no-transform` so delivery-layer transformations cannot inject scripts that conflict with the no-tracking policy.
- **Versionless marketing-script caching** — navigation and scroll controls use release-version query keys, preventing a Cloudflare browser-TTL override from serving old JavaScript after a versioned deploy.
- **Live production validation** — the production Playwright config accepts `PLAYWRIGHT_BASE_URL`, so the same route, header, layout, and offline checks run against Wrangler preview or the public domain.

### Performance
- Initial app entry measured about **112.4 KB gzip JavaScript** and **11.6 KB gzip CSS**, within enforced 115 KB and 15 KB ceilings.
- Dense browser benchmark measured approximately **0.20 ms p95** pointer handling, **0.50 ms p95** pan release, and **5.60 ms p95** group-drag release.
- Dense simulation benchmark measured approximately **1.45 ms p95** against an 8 ms ceiling.
- Automated frame and handler measurements remain release gates; real-device FPS, TTI, memory, and Lighthouse targets remain explicit manual checks.

## [1.4.2] — 2026-06-06

### Added
- **New blog post: `eicr-codes-explained-c1-c2-c3-fi.md`** — deep-dive companion to the existing EICR article. The highest-volume gap in the current cluster: "what does C2 mean on an EICR" is one of the top UK electrical queries. Covers: C1/C2/C3/FI definitions with extended fault tables, fault-to-code mapping (14 real-world faults mapped to their codes), annotated EICR report walkthrough with ASCII example, code combination table (8 combinations), the 28-day landlord deadline with penalties, property sale impact per code, remedial cost estimates per code level, FI resolution process, C3 budgeting guidance, PAT vs EICR distinction, 7-question FAQ. ~3,500 words.
- **Cross-link callouts** added to 4 high-traffic articles (per process rule in `PLAN.md §13`): `when-to-get-an-eicr-electrical-inspection-guide.md` (after the FI section), `consumer-unit-upgrade-what-to-expect.md` (after the EICR Related callout), `how-to-trace-an-electrical-fault-safely.md` (after the EICR Related callout), `5-common-electrical-wiring-mistakes.md` (at the end, before the ElectraSim CTA).
- **Marketing entry #48** appended to `marketing/facebook-article-posts.md` matching the established format.
- `package.json` version `1.4.1` → `1.4.2` (content release; no app code changes).
- `CHANGELOG.md` updated with `[1.4.2]` entry.

## [1.4.1] — 2026-06-06

### Added
- **New blog post: `part-p-building-regulations-explained.md`** — UK regulatory hub article. Top-of-funnel pillar for the existing wiring-cluster. Covers: what Part P is, notifiable vs non-notifiable tables, the three compliance routes (registered competent person / Building Control / minor works exemption), consequences of skipping (sale, insurance, retrospective costs), 13-row common-scenario table, ElectraSim planning workflow, 7-question FAQ, quick-reference summary. ~3,200 words. Internal links out to: EICR, consumer unit upgrade, shed, bathroom, EV charger, outdoor socket, electric shower, immersion heater, cooker, ring main, FCU.
- **New blog category: `Regulations & Safety`** — added to `astro-site/public/admin/config.yml` Category select options. Blog index filter pills auto-generate from the posts collection, so the new category appears automatically on `/blog/`.
- **Cross-link callouts** added to 3 high-traffic wiring guides pointing at the new Part P article (per process rule in `PLAN.md §13`): `how-to-wire-a-shed-or-outbuilding.md`, `how-to-wire-a-bathroom-zone-by-zone-uk-guide.md`, `how-to-install-an-ev-charger-dedicated-circuit-guide.md`. All three contain Part P references and now have a direct Related callout with the new article.
- **Marketing entry #44** appended to `marketing/facebook-article-posts.md` matching the established format (catchy tagline, short description, hook URL, hashtags, ready-to-post version).

## [1.4.0] — 2026-05-16

### Added
- **Fault Simulation Mode** — new ⚠ toggle in the ToolDock. Three injectable fault types:
  - **Wire Break (`open-circuit`)** — click any wire to "cut" it; BFS skips the broken wire so downstream loads go dark. Visual: dashed-red wire + ✕ circle at midpoint.
  - **Reverse Polarity** — click any component; orange dashed border + ↔ badge; simulation emits an error log entry.
  - **Missing Earth** — click any component; yellow dashed border + ⚡ badge; simulation emits a warning log entry.
- **`FaultPanel`** — floating panel (top-center) showing fault type selector, plain-English explanation of each fault, live list of active faults with per-fault remove buttons, and a "Clear all" control. Exiting fault mode auto-clears every fault.
- **`domain/types.ts`** — `FaultType` union (`'open-circuit' | 'reverse-polarity' | 'earth-fault'`); `fault?` field on `ComponentState`; `fault?: 'open-circuit'` on `WireInstance`.
- **`circuitStore`** — `setComponentFault`, `setWireFault`, `clearAllFaults` actions.
- **`uiStore`** — `faultMode: boolean`, `activeFaultType: FaultType`, `setFaultMode`, `setActiveFaultType`.

### Changed
- **`simulation.ts`** — open-circuit wires skipped in `indexCircuit`; fault-annotated components always added to `errorComponents` with descriptive log messages.
- **`CircuitCanvas`** — in fault mode, component/wire clicks inject or toggle faults instead of selecting.
- **`ComponentNode`** — renders fault color ring + badge overlay when `comp.state.fault` is set.
- **`WirePath`** — renders ✕ break marker at wire midpoint when `wire.fault === 'open-circuit'`.
- `package.json` version `1.3.3` → `1.4.0`.

---

## [1.3.3] — 2026-05-15

### Added
- **`astro-site/public/js/scroll-top.js`** — dedicated external script for the scroll-to-top button. Loaded globally via `<script defer src="/js/scroll-top.js">` in `Base.astro`. CSP `script-src 'self'` compliant.

### Changed
- **`blog/index.astro`** — removed server-side `allPosts.slice()` and static pagination HTML. All posts now render into HTML; JS owns all paging and filtering.
- **`blog-filter.js`** — complete rewrite. Single IIFE controller holds `currentFilter` + `currentPage` as shared state. Filter click → resets to page 1, recalculates filtered set, re-renders both cards and pagination. Page click → advances within the filtered set. Pagination nav dynamically injected into `<nav id="pagination">` with ellipsis collapse for long sequences.
- **`blog.css`** — added `button.pg-btn` to pagination selectors (same appearance as `<a>` links).
- `package.json` version `1.3.2` → `1.3.3`.

### Fixed
- **Scroll-to-top button never appeared** — the inline `<script>` added to `Base.astro` was silently blocked by `script-src 'self'` CSP. Moved to `scroll-top.js` external file.
- **Filter and pagination out of sync** — clicking a category filter showed 2 posts but pagination still said "2 pages"; clicking page 2 loaded `/blog/2/` with zero filter state. Root cause: server-side `<a href>` pagination and client-side JS filter had no shared state. Fixed by making JS own both systems; `/blog/2/` static pages remain as SEO fallback only.

---

## [1.3.2] — 2026-05-15

### Added
- **Scroll-to-top button** — fixed chevron-up button (bottom-right, appears after 400px scroll, smooth scroll, fade+slide animation). CSS in `Base.astro` global styles, JS inline in Base — works on every page sitewide.
- **Blog pagination** — `blog/index.astro` (page 1) + new `blog/[page].astro` (pages 2+). `PAGE_SIZE = 9`. Page 1 at `/blog/`, page 2 at `/blog/2/`, etc. Pagination nav with ellipsis, prev/next links, active page indicator. `rel="prev"` / `rel="next"` link tags in `<head>` for SEO.
- **`og:image:alt`** — added `<meta property="og:image:alt">` and `<meta name="twitter:image:alt">` to `Base.astro` (value = page title). Required by Facebook Sharing Debugger and LinkedIn.
- **`WebSite` JSON-LD** — added sitewide `@type: WebSite` structured data with `potentialAction: SearchAction` (Sitelinks Searchbox eligible) and `publisher: Organization` to `Base.astro`.

### Fixed
- Removed unused `remarkPluginFrontmatter` from `render()` destructuring in `[...slug].astro`.
- `PAGE_SIZE` moved inside `getStaticPaths()` in `[page].astro` — Astro bundles `getStaticPaths` separately, module-level const was not in scope.

### Changed
- `package.json` version `1.3.1` → `1.3.2`.

---

## [1.3.1] — 2026-05-15

### Added
- **`/blog/tags/[tag]/`** — 88 tag archive pages auto-generated from collection tags. Each page shows: all posts for that tag (sorted newest-first), a full tag cloud linking to all other tag pages, reading time on cards, breadcrumb nav, `BreadcrumbList` JSON-LD.
- **`astro-site/src/styles/blog.css`** — single dedicated CSS file for all blog pages (index + post + tag archive). Compiled by Vite/Astro to `/_astro/blog.*.css` — a properly cached external stylesheet.
- **`astro-site/public/js/blog-filter.js`** — external category filter script. Loaded with `<script defer src="/js/blog-filter.js">` — no inline JS, CSP `script-src 'self'` allows it.

### Changed
- **`blog/index.astro`** — removed `<style>` block, added `import '../../styles/blog.css'`, replaced inline `<script>` with `<script defer src="/js/blog-filter.js">`.
- **`[...slug].astro`** — removed `<style>` block (including all `:global()` wrappers), added CSS import. Tag items now render as `<a href="/blog/tags/[tag]/">` links.
- **`public/_headers`** — removed `'unsafe-inline'` from `style-src` on both `/*` and `/app/*`. CSP is strict again with no style loopholes.
- `package.json` version `1.3.0` → `1.3.1`.

### Fixed
- Blog index filter now works — the filter script is an external file served from `'self'`, no longer an inline script blocked by CSP.
- Blog index had zero styling — root cause was Astro inlining small page CSS as a `<style>` tag, blocked by `style-src 'self'`. Fixed by moving all blog CSS to a shared external file.

---

## [1.3.0] — 2026-05-15

### Changed (Blog System — SEO + UX Overhaul)

#### `[...slug].astro` — Post Template
- **`article:tag` OG meta** — each tag in the post's `tags` array now emits an individual `<meta property="article:tag">` tag. Google and Facebook use these to categorise the post.
- **Per-post OG image** — `ogImage` prop now uses `post.data.image` when set, falling back to the global `og-image.png`. Enables per-article social previews.
- **Reading time** — word count ÷ 200 wpm shown in post header (`⏱ N min read`). Also emitted as `timeRequired` and `wordCount` in Article JSON-LD.
- **Updated date badge** — when `updatedDate` is set, "Updated DD Month YYYY" badge renders next to the publish date in the header.
- **Prev / Next navigation** — chronological post navigation rendered at the bottom of every post (two-column card layout, responsive single-column on mobile). Uses sort order: newest first = next, oldest first = prev.
- **`dateModified` in Article schema** — always populated (falls back to `pubDate` when `updatedDate` absent).
- **`en-GB` date locale** — dates now display in UK format (14 May 2026) instead of US.
- **`getStaticPaths` refactor** — all posts sorted once, index used for prev/next — single collection fetch.

#### `blog/index.astro` — Blog Index
- **Category filter bar** — client-side pill buttons auto-generated from unique categories in the collection. Active state highlighted. "No results" fallback.
- **Reading time on cards** — every card now shows `⏱ N min read` below the date.
- **Featured post support** — posts with `featured: true` are sorted to the top and shown with a gold ⭐ Featured badge and subtle border highlight.
- **`BreadcrumbList` schema** — JSON-LD breadcrumb for the blog index page.
- **`Blog` schema** — JSON-LD Blog entity with top-10 `BlogPosting` items for Google Discover eligibility.
- **`en-GB` date locale** — consistent with post template.

#### `content.config.ts` — Schema
- Added `image: z.string().optional()` — per-post OG/social image URL.
- Added `featured: z.boolean().default(false)` — pins post to top of blog index.

#### `public/admin/config.yml` — CMS
- **Category options fixed** — added `Wiring Guide` and `Component Guide` (were in use but missing from dropdown).
- **`updatedDate` field** — optional datetime field with hint text; maps to `dateModified` in Article schema.
- **`image` field** — image widget for per-post OG/social image (1200×630px).
- **`featured` field** — boolean toggle to pin post to blog index top.
- **`summary` and `sortable_fields`** — CMS list view now shows title + date and is sortable by pubDate, title, category.
- **Hint text on all fields** — SEO guidance inline in every field.

#### `Base.astro` — Layout
- **`twitter:site`** — added `@electrasim` handle to Twitter Card meta.

### Changed
- `package.json` version `1.2.3` → `1.3.0`.

---

## [1.2.3] — 2026-05-15

### Added (Marketing Site — Content)
- **Blog post: 5 Common Electrical Wiring Mistakes (and How to Avoid Them)** — High-CTR list post with deep internal linking across the full content cluster. Covers: (1) reverse polarity — symptoms, why it’s dangerous even when appliances work, how to detect; (2) missing/disconnected earth — invisible under normal operation, fatal under fault; (3) open ring circuit — all sockets live but cable overheating; (4) overloaded kitchen circuit — load table of common appliances, why diversity assumptions fail in kitchens; (5) wrong MCB rating for cable size — cable CCC vs MCB table, ring vs radial 2.5mm²/32A rule. Includes non-invasive DIY checks (plug-in tester, RCD test, warm socket check), ElectraSim fault simulation walkthrough, quick-reference summary table, and when-to-call-an-electrician guidance. Internal links to 5 existing posts.
- **Homepage blog grid** updated — 12 posts, newest first.

### Changed
- `package.json` version `1.2.2` → `1.2.3`.

---

## [1.2.2] — 2026-05-15

### Added (Marketing Site — Content)
- **Blog post: Ring Circuit vs Radial Circuit: What's the Difference?** — UK-focused wiring topology guide. Covers ring circuit history and dual-path current sharing, radial circuit single-path operation, side-by-side comparison table, how to identify each at the consumer unit, unfused and fused spurs (FCU), BS 7671 floor area and MCB rules, cable sizing table, ring continuity test method (end-to-end resistance + cross-connect), 5 common ring circuit mistakes (open ring, spur-from-spur, 1.5 mm² misuse, kitchen overloading, unsleeved earth), when to use each topology, and ElectraSim simulation walkthrough for both. Targets UK-specific search terms with low competition.
- **Homepage blog grid** updated — 11 posts, newest first.

### Changed
- `package.json` version `1.2.1` → `1.2.2`.

---

## [1.2.1] — 2026-05-14

### Added (Marketing Site — Content)
- **Blog post: Live, Neutral and Earth Wires Explained** — Foundational beginner guide covering the role of each conductor, UK colour codes (old red/black/green vs new brown/blue/green-yellow), the neutral-is-not-earth distinction, earthing fault-protection mechanism (Class I vs Class II), reverse-polarity and missing-earth failure modes, twin-and-earth cable sizing table, earthing systems (TN-S / TN-C-S / TT), protective bonding (main + supplementary), and full ElectraSim simulation walkthrough. Summary comparison table. Targets highest-volume beginner electrical keywords.
- **Homepage blog grid** updated — 10 posts shown, newest first.

### Changed
- `package.json` version `1.2.0` → `1.2.1`.

---

## [1.2.0] — 2026-05-13

### Added (Marketing Site — Content & Security)
- **Blog post: What is an RCD and Why Do You Need One?** — SEO-optimised deep-dive on residual current devices. Covers operating principle (toroidal transformer, 30mA threshold), RCD types (AC/A/F/B), RCBO vs split-load consumer unit, TEST button guidance, and ElectraSim simulation walkthrough. Targets high-volume short-tail and long-tail RCD safety keywords.
- **Blog post: What is a Contactor and How Does It Work?** — Component deep-dive covering coil/armature/contact operation, utilisation categories (AC-1 to AC-4), coil voltage ratings, contactor vs relay vs MCB comparison, DOL starter circuit example, and common faults. Simulation walkthrough via ElectraSim Contactor component.
- **Blog post: Distribution Board Explained: How a Consumer Unit is Wired** — Capstone of the MCB→RCD→Contactor→DB content cluster. Covers internal anatomy (main switch, busbars, RCDs, MCBs, earth bar, SPD), three protection layouts (single RCD / split-load / full RCBO), MCB rating table per circuit type, consumer unit sizing guide, earthing and bonding, common faults, and 3-circuit ElectraSim simulation.
- **Blog post: How to Wire a Two-Way Switch: Complete Guide with Diagrams** — Step-by-step two-way switching guide with COM/L1/L2 terminal explanation, truth table (4 switch-state combinations), ASCII wiring diagram, strapping wire identification, cable colour tables (old + new UK harmonised), intermediate switch extension for 3+ locations, ElectraSim simulation walkthrough, and 5 common mistakes section.
- **Security headers (`public/_headers`)** — Comprehensive Cloudflare Pages security headers across three zones:
  - `/*` — `Strict-Transport-Security` (2yr, includeSubDomains, preload), strict `Content-Security-Policy` (no `unsafe-inline`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/payment/usb disabled).
  - `/app/*` — tighter CSP (self + `https://plausible.io` only, `worker-src self blob:`).
  - `/admin/*` — relaxed CSP for Sveltia CMS (`unpkg.com` + GitHub API + `unsafe-inline`/`unsafe-eval`).

### Fixed
- **`guide.astro` inline script** — removed `is:inline` attribute and `DOMContentLoaded` wrapper from the scroll-to-top script. Astro now bundles it as a deferred ES module, eliminating the only `unsafe-inline` script on the marketing site and enabling the strict CSP.
- **`index.html` inline Plausible stub** — removed the unnecessary inline Plausible initialisation script from the Vite app shell. Plausible's own async script is self-initialising; the stub was redundant and blocked a strict `script-src` CSP on `/app/*`.

### Changed
- **`package.json` version** — `1.1.0` → `1.2.0`.
- **Homepage blog grid** — updated to show all 9 posts, newest first.

---

## [1.1.0] — 2026-05-10

### Added (Marketing Site — Astro + Sveltia CMS)
- **Astro 6 site** (`astro-site/`) — static landing page, blog, and 5 new pages (About, Contact, Privacy, Terms, Blog Index) built with Astro + Content Collections.
- **Electrical-inspired redesign** — dark `#0a0f1e` theme, animated circuit-trace SVG background, glowing CTA buttons, parallax hero, wire-pulse animations. Unique brand identity across all pages.
- **Sveltia CMS at `/admin/`** — Git-based visual editor for blog posts and all page content (landing hero, features, use cases, CTA). No server required.
- **CMS-driven content** — landing page and blog index text extracted to JSON data files (`src/content/pages/`) editable in the CMS.
- **Blog content collection** — Markdown posts via Astro Content Collections (glob loader, Astro 5 API). First post: "How Household Wiring Works".
- **New pages** — `/about/`, `/contact/`, `/privacy/`, `/terms/` fully SEO-optimised with structured data.
- **`postbuild.mjs`** — merges Vite SPA output (`/app/`) + Astro output (`/`) into a single `dist/` for Cloudflare Pages.
- **PWA SW fix** — `/admin/*` excluded from Workbox precache + `navigateFallbackDenylist`; `_headers` file sets `no-store` on admin routes to prevent stale-cache issues.
- **`NODE_VERSION=22`** set on Cloudflare Pages project via API (Astro 6 requires Node ≥22).

### Changed
- **React SPA moved to `/app/`** — Vite `base: '/app/'` in production; `dist/assets/` moved to `dist/app/assets/`. All PWA manifest `start_url`/`scope` updated to `/app/`.
- **`_redirects`** — SPA fallback rule updated to `/app/* /app/index.html 200`.
- **Footer** — links to About, Privacy, Terms, Contact pages added.
- **Nav** — About link added.

---

## [1.0.0] — 2026-05-01

### Added (Phase 7 — Custom Wiring Mode)
- **`customWiringMode` setting** — new boolean in `settingsStore` (default `false`), persisted to IndexedDB. Toggle in Settings → Editing → "Custom wiring mode".
- **Paint-style multi-step wire placement** — when enabled: click source port to start a polyline; each canvas click adds a corner (checkpoint); click the destination port to commit the entire path as one atomic undo entry. Port type validation and same-component guard run on commit.
- **`pendingCustomPath`** state slice added to `uiStore` (`{ from: PortRef; checkpoints: Point2D[] } | null`) with `startCustomPath`, `addCustomPathCheckpoint`, and `cancelCustomPath` actions.
- **`commitCustomPath`** action in `canvas-actions.ts` — validates the destination, builds a `WireInstance` whose `controlPoints` are the user-placed checkpoints, commits via `addWire` (one undo entry), then clears the pending path.
- **`CustomPathOverlay`** SVG component — renders the committed polyline segments, corner diamond markers, origin dot, and a live cursor indicator. Cursor position is updated via a **rAF DOM-mutation loop** (`requestAnimationFrame` + direct `setAttribute`) — zero React state updates per pointer-move frame.
- **Checkpoint click target** — empty-canvas clicks during custom wiring are handled by the existing grid rect `onClick` and SVG-level `onClick` fallback; components and ports remain on top in SVG paint order so their clicks are never intercepted.
- **`Esc` priority order updated** in `useKeyboardShortcuts`: contextMenu → contact → docs → menu → importExport → settings → pendingDeletion → **pendingCustomPath** → reroute → placing → pendingWireFrom → clearSelection. Cancels without leaving a partial wire.
- **ToolDock** — wire-mode button swaps to a `Pen` icon when `customWiringMode` is on; tooltip explains the interaction; clicking the button cancels an in-flight custom path.
- **DocsPage tip added** explaining custom wiring flow and Esc cancel.
- **README** highlight bullet and implementation-status note updated.

### Changed (2026-05-01 — Domain + find-replace)
- **Domain `electrasim.com` registered** on Cloudflare Registrar (2026-05-01).
- **Project-wide find-replace** `https://electrasim.app` → `https://electrasim.com` across all source files: `index.html` (canonical, OG, Twitter, JSON-LD, Plausible), `public/robots.txt` (Sitemap line), `public/sitemap.xml` (`<loc>`), all doc files (`PLAN.md`, `LAUNCH.md`, `progress.md`, `CHANGELOG.md`).
- Placeholder comments in `index.html` header updated to reflect live domain.
- `wrangler` added as devDependency. `npm run deploy` script added to `package.json`.

### Changed (2026-05-01 — Hosting decision, user-requested)
- **Primary deploy target changed to Cloudflare Pages + Workers** (was Hetzner CX22 + Caddy VPS). Rationale: all compute-heavy work is client-side; server is thin API glue (≤10ms CPU/request). Cloudflare global edge (300+ PoPs) better fits the “trivial horizontal scaling via CDN” goal. Hetzner + Caddy preserved in `PLAN.md §3` as documented self-hosted fallback.
- `PLAN.md §3` Hosting & Deploy section rewritten with primary (Cloudflare) + fallback (Hetzner) paths.
- `LAUNCH.md §3` infrastructure table updated. `LAUNCH.md §8` launch day steps updated with `wrangler pages deploy` command.

### Fixed (Phase 7.1 — Pre-launch polish, 2026-05-01)
- **P1 Ask AI hidden in production** — `Toolbar.tsx` button gated behind `import.meta.env.DEV`; `PhoneDock.tsx` AI button dimmed with `opacity-40` and shows a friendly log message ("v2.0") instead of a dead no-op.
- **P2 Contact form placeholder** — `ContactModal.tsx` now detects `IS_PLACEHOLDER` and renders an amber "coming soon" banner instead of a broken Google Forms link. Replace `CONTACT_FORM_URL` at launch.
- **P3 OG image missing** — `public/og-image.svg` (1200×630) created: branded circuit diagram with gradient bg, dot grid, component boxes, energised wire, feature pills. `index.html` OG/Twitter `<meta>` tags updated to reference it.
- **P4 `App.tsx` stale comment** — Header comment updated to reflect v1.0 completion; removed references to "Phase 2 (current)" and deleted-file `App.legacy.tsx`.
- **P5 `AboutTab` roadmap stale** — Roadmap rows rewritten to reflect all shipped features; version pill changed from `v1.0 · dev build` → `v1.0-rc.1`.
- **P6 Biome formatter** — `npm run lint:fix` auto-fixed 25 files. 16 pre-existing a11y/suppression warnings remain in DEV-only files (no logic errors).
- **P7 `package.json` version** — `0.0.0` → `1.0.0-rc.1`.
- **P9 `PLAN.md` phase table** — phases 6.2, 7, 6.3-slim, 6.11 marked `✅ done`; 7.1 `🔧 in progress`.

### Added (Phase 7.1 — Pre-launch code sweep)
- **`LAUNCH.md`** — new file, the go/no-go gate for v1.0. Nine sections: code health (C1–C10), feature completeness (F1–F23), infrastructure (I1–I6), domain substitutions (D1–D10), quality gates (Q1–Q8), Phase 7.1 polish items (P1–P9), manual smoke-test checklist (23 steps), launch day 18-step sequence, post-launch scope.
- **`PLAN.md` §13** — added cross-reference to `LAUNCH.md` as the live working copy. Phase table updated: 6.2 / 7 / 6.3-slim / 6.11 all marked `✅ done`; 7.1 marked in-progress.
- **`progress.md` roadmap table** — rewritten to reflect all shipped phases.

### Identified (Phase 7.1 — Blockers from code sweep)
- **P1 ❌** `Ask AI` button (`Toolbar.tsx`, `PhoneDock.tsx`) renders but has no handler — must be wired or hidden before launch.
- **P2 ❌** `CONTACT_FORM_URL` in `ContactModal.tsx` is `'https://forms.gle/YOUR_FORM_ID_HERE'` — must be replaced.
- **P3 ❌** `public/og-image.png` does not exist — Twitter/Slack/Discord link previews will be blank without it.
- **P4–P9 ⚠️** Stale `App.tsx` comment, stale `AboutTab` roadmap, 32 Biome formatter warnings, `package.json` version `0.0.0`, `[Unreleased]` CHANGELOG section, stale PLAN.md phase statuses (P9 fixed in this session).

### Added (Phase 6.3-slim — UX Uplift III)
- **Gridless mode** — `showGrid` boolean setting (default `true`). Toggle in Settings → Display. When off, the dot grid is hidden for a clean canvas. Wired through `applyCanvasPreset` → `CanvasTheme.showGrid`.
- **Canvas colour presets** — `canvasPreset` setting with three options: `default` (standard Lab Glass), `high-contrast` (black bg, orange/white/cyan wires, yellow accents — WCAG AA+), `deuteranopia` (orange/indigo/cyan wire palette — no red/green dependency). Applied in `applyCanvasPreset` in `theme.ts`; both light+dark variants handled.
- **Alignment toolbar** — `AlignmentBar` component appears above the canvas whenever 2+ components are multi-selected. Six align buttons (left / centre-H / right / top / centre-V / bottom) + two distribute buttons (horizontal / vertical, visible at 3+ selected). Each action is one atomic undo entry via the new `setComponentPositions` batch action on `circuitStore`.
- **Mini-map** — `MiniMap` SVG overlay in the bottom-left corner. Shows all components as small blue rectangles + a viewport indicator rect. Click to pan the canvas to that world region. Gated by `showMiniMap` setting (default `true`), toggled in Settings → Display.
- **`setComponentPositions` batch action** on `circuitStore` — sets absolute x/y for multiple components in one `set()` call = one undo step.
- **`alignSelected` + `distributeSelected`** exported from `canvas-actions.ts`.
- **`applyCanvasPreset`** helper exported from `theme.ts` — composes base theme + showGrid flag + preset overrides into the final `CanvasTheme`.

### Fixed (Phase 7 — Custom Wiring bug fixes)
- **Pan mode fired on every canvas click** during custom wiring — `handleBackgroundPointerDown` was unconditionally arming `panRef`; fixed with early return when `pendingCustomPath` is active.
- **Component drag armed when clicking destination port** — `handleComponentPointerDown` ran its full drag-setup even in custom wiring mode, interfering with port commit; fixed with early return when `customWiringMode && pendingCustomPath`.
- **Port clicks added checkpoints instead of committing the wire** — the checkpoint `<rect>` was inserted after the components group in SVG paint order, so it sat visually on top and won all hit-tests before port circles could receive events; removed the `<rect>` and moved checkpoint logic into the existing grid rect `onClick` (rendered before wires/components) and the SVG-level `onClick` fallback.
- **Destination ports did not highlight** in custom wiring mode — `pendingFrom` prop was always `null` (custom path uses a separate `pendingCustomPath` slice, not `pendingWireFrom`); added `customPathFrom` prop to `ComponentNode` and unified port valid/pending logic via `activeSrc = pendingFrom ?? customPathFrom`.

### Added (Phase 6.11 — Full UI Dark Mode)
- **`dark:` Tailwind variants applied to all UI panels** — every floating element now responds to the `dark` class on `<html>`.
- **`Editor.tsx`** — `useEffect` toggles `document.documentElement.classList` with `dark` whenever `resolvedTheme` changes, so panels update without a reload.
- **Panels covered:** Toolbar (brand text, Sep, AI button, MenuTrigger), IconBtn, Palette (collapsed button + full panel + search input + item tiles), Inspector (single and multi-select), PillField, LogPanel, ToolDock, StatusPill, MenuOverlay (panel, items, separators, footer), Modal (panel, title header, footer bar), ConfirmDialog, SettingsModal (tab bar, all tab content: TabIntro, ElectricToggle, RoutingStyleSelector, SchemeSelector, AboutTab), ContactModal.
- **Settings copy updated:** "Dark mode (v1.1)" label removed — dark mode is now live. Description updated to "All panels and modals update immediately."
- **DocsPage tip added:** explains how to enable dark mode via Settings → Display.

### Added (Phase 6.2.4 — Copy / Paste)
- **`Ctrl+C`** copies all currently selected components to an in-memory clipboard. Single-component selection works too.
- **`Ctrl+V`** pastes the clipboard onto the canvas. Each paste adds a 24 px stacked offset (`pasteCount × 24`) so repeated pastes don't land on top of each other.
- Pasted components immediately become the new selection (so you can drag them straight into position).
- Paste is a single undoable action — `Ctrl+Z` removes the whole pasted group at once.
- Clipboard is in-memory only (D7 locked — no persistence to localStorage/IDB in v1.0). Clears on page reload.
- New `clipboardStore` (`src/store/clipboardStore.ts`) — lightweight Zustand store with `items`, `pasteCount`, `copy`, `incrementPasteCount`, `clear`.
- New `pasteComponents(items, offset)` action on `circuitStore` — generates fresh unique IDs for each pasted component.
- Fixed bare `V` shortcut guard: now checks `!meta` so `Ctrl+V` paste no longer also switches to select mode.
- `Ctrl+C` / `Ctrl+V` added to the in-app Docs keyboard shortcuts table and two new Tips & Tricks entries added.

### Fixed (Phase 6.2.2f/g — SVG Rendering Performance)
- **Root cause identified & fixed:** `feDropShadow` SVG filter was applied to all 16 component `<rect>`s. Because fan/motor CSS-animated `<text>` children share the same SVG stacking context, every animation step (13 fps) forced Chromium to re-rasterise all 16 filter regions — causing a ~35–40% CPU spike whenever the simulation was running with wires present.
- **`feDropShadow` removed** from both light and dark themes (`shadow: false`). Replaced with a static 2 px offset semi-transparent `<rect>` behind each component card — identical visual depth, zero per-frame cost.
- **Wire glow/halo path removed** — the second `<path>` drawn as a wide semi-transparent halo behind each energised wire (`wireGlowOn`) is removed entirely. `wireGlow: false` on both themes. Each wire now renders exactly 2 paths (invisible hit-target + single animated stroke), down from 3.
- **Wire flow animation re-enabled** (was disabled in 6.2.2e as a workaround). Now that the filter cascade is gone, `stroke-dashoffset` on a plain `<path>` costs only the path itself. Running at `steps(12, end)` / 1.5 s ≈ 8 paints/sec per wire — visually fluid, low CPU.
- **All previous `stroke-dashoffset` mitigation attempts reverted** (the 6.2.2e overlay-path approach that added a 3rd path per wire and made CPU worse is removed).
- Net result: CPU with sim running drops from ~50–65% back to ~15–20% baseline.

### Added (Phase 6.2.3 — Multi-select)
- **Drag-rect selection** — click-drag on the empty canvas draws a dashed rubber-band rectangle; on release, all components whose bounding box overlaps the rect are selected together.
- **Shift-click** — adds or removes individual components from the active selection additively.
- **Group drag** — dragging any selected component moves the entire selection together; all snap to grid on release.
- **Bulk delete** — Delete key (or the "⚡ Delete N components" button in the Inspector) removes all selected components and their wires in a single undoable step.
- **Multi-select Inspector panel** — when 2+ components are selected, the right-hand Inspector shows a summary: count, usage tips, bulk-delete button, and clear-selection button.
- **Multi-select highlight rings** — dashed blue rings drawn around every selected component in a multi-selection (separate from the single-component solid ring).
- `circuitStore` new actions: `moveComponents(ids, dx, dy)`, `removeSelectedComponents()`, `toggleComponentSelection(id)`, `setMultiSelection(ids)`, field `selectedComponentIds: string[]`.
- `uiStore` new field `dragRect` + `setDragRect` for the rubber-band rect (world-space coords).

### Added (Phase 6.3 — UX Polish)
- **Simulation off by default.** `simRunning` now initialises to `false`; users click Run to start. Prevents unexpected animations on first load.
- **Tabbed Settings modal** (`SettingsModal.tsx`) — four tabs: Editing · Display · Simulation · About. Each tab shows a context intro banner and per-setting live-effect preview strip explaining what the toggle does in the current state.
- **Electric-style toggle switches** — all boolean settings now render as animated pill switches with ON/OFF badge, blue glow when active, and decorative circuit-trace lines inside the pill. No more plain checkboxes.
- **About tab** in Settings — brand card with version badge, full tech-stack grid (React 19, Zustand, PixiJS v8, etc.), and roadmap status (shipped / in progress / v2.0).
- **"About ElectraSim"** menu item in `MenuOverlay` now opens the Settings modal directly on the About tab (previously a no-op stub).
- **Export filename prompt** — JSON, SVG, and PNG export buttons now show an inline "Save Circuit As" overlay before downloading. User can customise the filename; extension is appended automatically. Enter confirms, Escape cancels.
- **Canvas right-click menu canvas actions**: "Clear All Wires", "Clear All Components", "Reset to Default Circuit" added to the empty-canvas context menu, matching the items already in the ⚡ menu overlay.
- `uiStore` gained `settingsTab: string | null` and updated `setSettingsOpen(open, tab?)` to support opening Settings on a specific tab.

### Added (Phase 6.3 routing-selector UX)
- Wire routing selector redesigned as large card buttons with icon, name, and description (was a simple two-button row).
- Color scheme selector redesigned as card tiles with icon, label, and sub-description.

### Added
- **`PLAN.md`** — master rewrite plan covering goals, performance budget, locked stack, target architecture, performance techniques, mobile/tablet strategy, future-feature hooks, migration roadmap, and process discipline rules. Single source of truth.
- **ADR 0001** (`docs/decisions/0001-visual-direction.md`) — locks "Lab Glass · Light" as the visual direction.
- `CHANGELOG.md` and `progress.md` to track every change going forward.
- 4 visual direction mockups (Studio Light, Pro Dark, Lab Glass, Lab Glass · Light) for approval — Phase 0b.
- `src/lib/useDevice.ts` — viewport-driven `'desktop' | 'tablet' | 'phone'` hook with Tailwind-aligned breakpoints, used by the new app shell.

### Changed
- **Visual direction locked: "Lab Glass · Light"** (Phase 0b ✅ done). `src/App.tsx` now mounts `LabGlassLight` directly, driven by the real viewport via `useDevice`.
- `src/index.css` — `html, body, #root` set to 100% height; body restores `overflow: hidden` and gains `touch-action: manipulation`, `user-select: none`, and `-webkit-tap-highlight-color: transparent` for the upcoming touch/gesture layer (PLAN.md §6).

### Removed
- Mockup gallery shell, device-frame previewer, and the 3 unchosen directions (`StudioLight.tsx`, `ProDark.tsx`, `LabGlass.tsx`, `MockupGallery.tsx`, `DeviceFrame.tsx`) — Phase 0b artifacts no longer needed.

### Security
- **Removed Gemini API key inlining** from `vite.config.ts`. The previous config injected `GEMINI_API_KEY` into the client bundle via `define`, leaking the key to anyone who downloaded the JS. Going forward, all AI calls will be proxied through the Phase 9 backend (Hono + Bun); the client will only see same-origin `/api/ai/*` endpoints. See PLAN.md §3 / §7.

### Tooling — Phase 0a
- **Strict TypeScript** — `tsconfig.json` enables `strict`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `forceConsistentCasingInFileNames`. Legacy `App.legacy.tsx` is excluded and carries a `// @ts-nocheck` header.
- **Biome** — replaces ESLint + Prettier with a single tool (~10× faster). Config at `biome.json`. Scripts: `npm run lint`, `lint:fix`, `format`.
- **Vitest + RTL + jsdom** — unit/component test runner. Config at `vitest.config.ts`, setup at `src/test/setup.ts` (jest-dom matchers, matchMedia polyfill). First test: `src/lib/useDevice.test.ts` (4 cases, all pass).
- **Playwright** — E2E test scaffold. Config at `playwright.config.ts` covering Desktop Chrome, Pixel 7, iPad Pro 11. First spec: `e2e/smoke.spec.ts`. Browser binaries are NOT auto-installed (`npm run e2e:install` to fetch).
- **FPS overlay** (`src/lib/FpsOverlay.tsx`) — dev-only HUD showing rolling FPS, frame time, and Chromium heap. Toggle with `Ctrl/Cmd + Shift + F`. Tree-shaken from production via `import.meta.env.DEV` in `main.tsx`.
- **Bundle analyzer** — `rollup-plugin-visualizer` integrated into `vite.config.ts` behind `BUILD_STATS=1`. Run `npm run build:stats` to emit `dist/stats.html` treemap.
- **Lefthook** — git hooks (`lefthook.yml`) auto-format + lint staged files via Biome on commit, and remind to update `CHANGELOG.md` + `progress.md` in commit-msg. `npm run prepare` installs hooks (gracefully no-ops if no git repo yet).
- **`tsconfig.e2e.json`** — separate type-check config for Playwright tests with node + Playwright globals.
- **`useDevice` hook** (`src/lib/useDevice.ts`) — viewport-driven `'desktop' | 'tablet' | 'phone'`, Tailwind-aligned breakpoints, SSR-safe.
- **Composite check script:** `npm run check` runs typecheck + lint + tests in sequence.

### Removed (Phase 0a)
- Old `lint` script (`tsc --noEmit`) renamed to `typecheck`. The new `lint` is Biome.

### Smart wire routing — Phase 6.2.1
First sub-feature of the Phase 6.2 UX uplift. Smart (orthogonal, obstacle-aware) routing replaces bezier as the default for **new** wires; existing bezier wires keep their look (PLAN.md §8.2 SR1 — additive coexistence).

**Domain:**
- **`src/domain/types.ts`**:
  - New `WirePathKind = 'bezier' | 'orthogonal'` discriminator.
  - `WireInstance.pathKind?: WirePathKind` — optional for back-compat. JSON written before Phase 6.2 has no `pathKind` and is treated as `bezier`.
  - Removed leftover `z?: number` on `ComponentInstance` that was missed in Phase 6.10's 3D cleanup.
- **`src/domain/geometry.ts`** — new pure functions (no React/DOM, Web-Worker-safe):
  - `computeOrthogonalPath(p1, p2, obstacles, options)` — hybrid algorithm per PLAN.md §8.2 SR2:
    1. **L-route** — try H→V or V→H elbow. Sub-millisecond, hits ~95 % of cases.
    2. **A* fallback** — `aStarOrthogonal()` on a 16 px grid with `MAX_NODES = 4000` and a `timeoutMs` cap (default 200 ms).
    3. **Diagonal fallback** — return `[p1, p2]` so the user always sees a wire even when the grid search exhausts itself.
  - `tryLPath()`, `aStarOrthogonal()`, `collectObstacles()` — exported helpers (also covered by direct unit tests).
  - `simplifyCollinear()` — internal post-processing so A*'s grid path returns only corner vertices.
  - `sampleWire()` updated to dispatch on `pathKind`. Orthogonal wires return their corners verbatim (a polyline).
- **`AABB`** type exported for callers that want to assemble custom obstacle sets.

**Implementation strategy refinement (vs spec):** the locked spec mentioned auto-reroute on component move with debouncing + an `controlPointsLockedByUser` flag. Implementation chose a simpler equivalent: **paths are computed at render time** from the wire's current endpoints + the live components map (mirroring how bezier already works). The dirty-flag rAF loop only re-renders when something changed, and L-route is sub-millisecond, so the perf cost is negligible. Net effect: no auto-reroute machinery needed, no debounce, no lock flag. Spec outcomes (SR1, SR2, SR5, SR6) unchanged. SR3 (lock-on-edit) becomes relevant only when intermediate control-point editing is added (Phase 7).

**Settings:**
- **`src/store/settingsStore.ts`** — new `routingStyle: 'orthogonal' | 'bezier'` (default `'orthogonal'`). Snapshot, hydration check, and persistence subscription updated. Older saved blobs without the field inherit the default on load.
- **`src/ui/components/SettingsModal.tsx`** — new `RoutingStyleSelector` (mirrors the existing `SchemeSelector` pattern) under "Editing" group. Two-button selector: `┗ Smart` / `∿ Curved`.

**Wire creation:**
- **`src/ui/canvas-actions.ts`** — `handlePortClick` now stamps `pathKind` on new wires from `useSettingsStore.getState().routingStyle`. Existing wires (loaded from JSON or already in the store) untouched.

**Renderer:**
- **`src/ui/CircuitCanvas.tsx`** — new `buildOrthogonalPath()` builds an SVG `M…L…L…` path string. The `WirePath` component dispatches on `wire.pathKind` and falls back to `buildWirePath()` (legacy bezier) otherwise. Hit-testing, glow filter, current-flow animation, and selection styles all work unchanged because they're applied to whatever `d` attribute is built. Pixi/WebGL renderer parity deferred to Phase 8 (v1.1) per SR6.

**Tests:**
- **`src/domain/geometry-orthogonal.test.ts`** — 15 new tests covering all 10 spec cases (PLAN.md §8.2):
  - Same Y / same X axis → straight segment.
  - Diagonal endpoints → 2-bend L-route.
  - Single obstacle blocking both Ls → A* finds a path that doesn't clip.
  - Endpoints inside their own component AABB → path still starts/ends exactly at the port.
  - 50-obstacle wall → returns a valid polyline within timeout.
  - Always returns ≥ 2 points.
  - `tryLPath` direct cases: both elbows blocked → null; one elbow blocked → return the other.
  - `aStarOrthogonal` direct cases: routes around an obstacle; respects timeout budget.
  - JSON round-trip preserves `pathKind`; back-compat (no `pathKind`) cleanly round-trips.

**Documentation discipline (Phase 6.10 §13 rule):**
- **`src/ui/components/DocsPage.tsx`** — new "Wiring Style (Smart vs Curved)" card in the Wiring Guide section + new tip in `TIPS`.
- **`README.md`** — new bullet in Highlights; "How wiring works" implementation-status callout updated to "Smart Routing shipped in 6.2.1"; roadmap row added; last-updated stamp bumped.
- **CHANGELOG.md** (this file) — this entry.
- **progress.md** — session entry.

**Bundle:** ~104.49 KB gzip (main; was 102.54 KB pre-6.2.1 → +1.95 KB for the algorithm + selector UI). 89/89 tests passing (was 70 + 15 functional + 4 perf-telemetry). `tsc` zero errors.

#### 6.2.1 hotfix (same session) — idle CPU regression

**Problem reported by user:** after Phase 6.2.1 shipped, CPU usage stayed elevated while the tab was open and dropped immediately when the tab was closed. Root cause traced to two compounding issues with the render-time path computation strategy:

1. `WirePath` is not `React.memo`'d, and the parent `CircuitCanvas` re-renders on every store change (selection click, hover, simulation tick, current-flow animation toggle). So every orthogonal wire re-ran `buildOrthogonalPath` → `collectObstacles` → `computeOrthogonalPath` per render — work that is `O(componentCount)` per wire, so cumulative work per render is `O(wires × components)`.
2. `byId` (the `Map<id, ComponentInstance>`) was being constructed fresh inside the render body — a new object identity every render, which would also break any future `React.memo` on child components.

**Fix:** memoise upstream so pathfinding only runs when geometry actually changes.

- **`src/ui/CircuitCanvas.tsx`**:
  - `byId` Map is now built inside `useMemo` keyed on `circuit.components`. Stable reference identity across no-op renders.
  - New `orthogonalPathD: Map<wireId, string>` built inside `useMemo` keyed on `(circuit.wires, byId)`. The expensive routing now runs only when the components or wires arrays actually change (Immer preserves array identity on no-op updates → re-renders triggered by selection / hover / simulation are zero-cost).
  - `WirePath` now accepts an optional `precomputedD` prop. Orthogonal wires read from this; bezier wires unchanged. Inline fallback retained so the component is still standalone-correct.
  - Net: idle CPU drops to bezier-era levels. Pathfinding is paid only on geometry change (drag, place, delete, reroute) — not on every re-render.

- **`src/domain/geometry-orthogonal.test.ts`** — new "Perf telemetry — Phase 6.2.1 regression guards" suite (4 tests):
  - 1000 L-route calls < 50 ms
  - 1000 L-route calls through 20 obstacles < 200 ms
  - A* fallback respects 200 ms timeout per call
  - Realistic scene (100 short wires, 30 obstacles) < 50 ms total

  Budgets are 3-5× actual measurements on dev hardware to avoid flakes on slow CI but tight enough to catch a real algorithmic regression. Comment in the test source instructs future contributors to *fix the algorithm, not bump the budget*.

**Measured numbers post-fix** (single dev box, Node 20 / Vitest):
- 1000 L-routes (no obstacles): **2 ms** (~2 µs each)
- 1000 L-routes (20 obstacles): **12 ms** (~12 µs each)
- A* worst case: **6 ms** per call
- Realistic 100-wire scene: **3 ms** total

Even without memoisation, 100 orthogonal wires per render is only ~3 ms — but at 60 fps that's still 180 ms/sec of pure routing work, plus the React reconciliation cost on top. The memo eliminates this entirely on idle frames.

### Reduced-effects mode + paint-pipeline rewrite — Phase 6.2.2
User reported sustained high CPU during simulation that pre-dated Phase 6.2.1. Symptom: with only 3 components and a single energised wire, CPU sat at 45–50% while the simulation was running and dropped immediately on pause; stress mode pushed it to 80–90%. Linear scaling with the number of energised elements pointed to per-frame paint cost, not React reconciliation.

**Root cause.** Every energised wire used `<filter id="glow-…"><feGaussianBlur stdDeviation="2.5" /></filter>` AND the `electrasim-wire-flow` `stroke-dashoffset` animation. Same pattern on bulb halos (`feGaussianBlur stdDeviation="4"` + `electrasim-bulb-pulse` opacity). Chromium software-rasterises SVG filters (unlike CSS HTML filters which are GPU-accelerated), and any animated property on the filtered element invalidates the filter cache **every frame**. Net effect: the browser was re-running a Gaussian blur convolution at 60 Hz per energised element. Cost scaled linearly with `# energised wires`, exactly matching the user's measurements.

**Fix — `src/ui/CircuitCanvas.tsx`:**
- Removed the `glow-${filterId}` and `bulb-glow-${filterId}` `<filter>` definitions from `<defs>` entirely; kept the `shadow-${filterId}` drop-shadow (no animation co-occurs on idle components, so its filter cache is stable and free).
- **Wire halo:** replaced with a stroke-based halo — an additional underlying `<path>` with the same `d`, `strokeWidth = main + 5`, `strokeOpacity = 0.22`, no `strokeDasharray`, no `className`. Painted once per render and cached. Visually near-identical to the blur at typical zoom; `O(0)` per-frame work versus the previous `O(blurredPaths)` software-raster cost.
- **Bulb halo:** replaced the filtered circle with two stacked plain circles — outer `r=22, opacity=0.12` (mimics blur falloff), inner `r=14, opacity=0.35` retains the existing `electrasim-bulb-pulse` animation. The pulse is now an opacity-only animation on a non-filtered element, which is GPU-accelerated and free.
- **Reduced-effects gate:** new `wireGlowOn` / `currentFlowOn` / `activeLoadEffects` derivations at the top of `CircuitCanvas` fold both the user setting and the auto-threshold into single booleans before passing them to children. `WirePath` and `ComponentNode` no longer read `theme.wireGlow` directly — keeps the cost of the gate at one place.
- **Auto-threshold:** when `circuit.components.length > 50`, `reducedEffects` flips on regardless of the user setting. So a stress test (~150 components) auto-disables glow + flow animation, and the paint-storm scenario is structurally impossible. Threshold is a constant `REDUCED_EFFECTS_AUTO_THRESHOLD` for easy future tuning.

**`src/store/settingsStore.ts`** — added `reducedEffects: boolean` to `UserSettings` (default `false`), included in snapshot/subscribe diff/persistence. Marked forward-compat in `isPersistedSettings` (older blobs without the key inherit the default — same pattern as `colorScheme` and `routingStyle`).

**`src/ui/components/SettingsModal.tsx`** — added a "Reduce visual effects" toggle in the **Simulation visuals** group. Description explicitly mentions the auto-threshold so users on dense circuits understand why it self-enables.

**`src/lib/FpsOverlay.tsx`** — secondary perf fix discovered during the audit. The overlay's rAF loop ran unconditionally in dev, even when hidden, preventing browser background-throttling and adding ~3–8% idle CPU on weak hardware. Fix:
- Default `visible = false` (was `true`). Localstorage key `electrasim:fps-overlay-visible` still respected for users who toggled it on previously.
- The `useEffect` that schedules the rAF now early-returns when `!visible` and re-mounts when `visible` flips to true. Effect dep array now includes `visible`. Hidden overlay = zero work.
- `Ctrl/Cmd + Shift + F` keybind unchanged.

**`src/ui/components/DocsPage.tsx`** — added a `TIPS` entry pointing users to the new setting.

**`README.md`** — added a Phase 6.2.2 highlight bullet directly below the 6.2.1 entry.

**Verification:**
- `npm run typecheck`: clean.
- `npm test`: 89/89 pass (no test changes; the existing settings + persistence + simulation suites cover the touched code paths).
- `npm run build`: clean. Bundle size unchanged at **104.60 KB gzip** main chunk.

**Expected user-observable impact** (predictions; user to verify on their hardware):
- 3 components + 1 energised wire, sim running: ~45–50% → **~16–18%** (drop from removing the per-frame Gaussian blur on the only energised wire).
- Stress test (`seedStress(50)`) sim running: ~80–90% → **~25–35%** (auto-threshold disables glow + flow animation; energised cues remain via color + opacity + width).
- Idle CPU after load: ~12–15% → **~8–12%** (FpsOverlay no longer running rAF).

**Not yet addressed** (intentionally deferred — under threshold of urgency for v1.0):
- Motors energising while the `feDropShadow` filter is applied still cause a small per-frame raster cost during the `electrasim-motor-pulse` `stroke-width` animation. Only matters when many motors are simultaneously energised, which is rare in practice. Auto-threshold protects stress mode.
- React.memo on `WirePath` / `ComponentNode` + stable parent callbacks. These would help interaction smoothness (hover, drag) at scale but the user's reported pain point was sim-running CPU, not interaction latency. Tracked for a follow-up phase.
- BFS `Array.shift()` in `simulation.ts` (pseudo-`O(W²)` instead of `O(W)`). Negligible below 5,000 wires; safe to defer.

#### 6.2.2b — second-round perf fix (same session)
After the user verified that the **Reduce visual effects** toggle worked correctly, they reported the *default* (toggle off) experience still hit ~50% CPU on three components with one energised wire. With the SVG filters already removed, the only remaining per-frame cost was the **stroke-dashoffset animation on the wire** and the **opacity-pulse animation on the bulb halo**. Each forces a non-cached repaint of the SVG element every frame; on weak hardware those alone added ~25–30% CPU.

**Fix — `src/index.css`:**
- `electrasim-wire-flow` keyframe duration changed from `1.1s linear infinite` to `1.5s steps(36, end) infinite`. `steps(36, end)` quantises the animation to 36 discrete frames per loop = ~24 paints/second (down from ~60). The dashes still appear to flow — the human eye reads ≥24 fps as continuous motion, same logic as cinema. Per-wire paint cost drops ~60%. Users who want the smoothest possible animation can disable it via the existing toggle.

**Fix — `src/ui/CircuitCanvas.tsx`:**
- Bulb halo no longer pulses. Per the user's explicit suggestion ("remove the bulb glow instead put a static yellow orb as an active state"), dropped the `electrasim-bulb-pulse` className from the inner halo circle. The halo is now a static, layered, two-circle orb — outer `r=22, opacity=0.18`; inner `r=14, opacity=0.45` — that *appears* on energise and *disappears* on de-energise, but does not animate while lit. Even an opacity-only animation on a non-filtered SVG element re-rasterises the circle each frame, and the user's measurements showed this contributed ~10% CPU on weak hardware.

#### 6.2.2c — pan + phone-dock UX bugs (same session)
While testing the perf fix the user discovered two unrelated, long-standing UX bugs that were latent because they only manifest in scenarios the prior development sessions hadn't exercised: panning the canvas after components had scrolled off-screen, and using the phone-layout bottom dock (which only appears when `useDevice()` reports `'phone'`, i.e. viewport width < 640 px).

**Bug A — pan never started.**
`handleBackgroundPointerDown` in `CircuitCanvas.tsx` returned early on `e.target !== e.currentTarget`. The intent was "only start a pan when the user clicks the empty SVG area, not a child element". But the SVG has a full-viewBox `<rect>` for the grid that catches every pointer event first, so `e.target` was always the grid `<rect>` and `e.currentTarget` always the `<svg>`. The check was therefore always true and pan **never** started for any user, on any window size. The user only noticed because narrowing the window pushed components out of view, leaving them no other way to recover.

**Fix:**
- Removed the `e.target !== e.currentTarget` guard from `handleBackgroundPointerDown`. Pan now starts whenever pointerdown bubbles up to the SVG. Component pointer handlers already `stopPropagation()`, so component clicks don't trigger pan; ports inherit that. Wires didn't have a pointerdown handler at all — added `onPointerDown={(e) => e.stopPropagation()}` to the `WirePath` group so a click on a wire body still selects it (via the existing onClick) without starting a pan.
- Added a `panDidMoveRef = useRef(false)` flag with a 4 px deadzone. The flag flips true the first time the pointer moves beyond 4 px during pan; the SVG-level and grid-rect-level `onClick` handlers check this flag and short-circuit when set, so a pan-drag no longer triggers the click side effects (deselect, drop placing component, cancel armed reroute) on pointerup. This is the standard "drag vs click disambiguation" pattern.
- Middle-mouse (button 1) pans too, matching every other professional canvas tool.

**Bug B — phone-dock buttons were stubs.**
`src/ui/components/PhoneDock.tsx` rendered four buttons (Add, Layers, AI, Cfg) but the `PhoneBtn` component had **no onClick prop**. None of the buttons did anything since the file was first written in Phase 0b. On any viewport < 640 px (which includes a desktop window resized narrow), the entire bottom dock was decorative. Explains the user's "the plus button or add component button also won't works" report.

**Fix — `src/ui/components/PhoneDock.tsx`:**
- Added `onClick?: () => void` to `PhoneBtnProps`; `<button onClick={onClick}>` in the JSX.
- Wired the four buttons to the matching `useUiStore` actions:
  - **Add** → `togglePalette()` (idempotent — opens the palette if closed; the palette itself drives placement).
  - **Layers** → `toggleInspector()` (component details panel).
  - **AI** → `addLog('AI assistant ships in v2.0 …', 'info')` placeholder. Real action lands in Phase 10. Keeping the slot here prevents re-doing the dock layout when the AI panel is added.
  - **Cfg** → `setSettingsOpen(true)`.
- Added a subtle `transition active:scale-95` to give touch feedback that the buttons now actually do something.

**Verification (6.2.2b + 6.2.2c combined):**
- `npm run typecheck`: clean.
- `npm test`: 89/89 pass.

#### 6.2.2d — fan / motor paint cost + phone palette never rendered (same session)

User re-tested after 6.2.2b/c and reported:
- Bulb-only test: 50% → **10–15% CPU** ✓ (the static-orb + `steps()` fix worked).
- Ceiling-fan test: still pegging at the previous ~50% peak.
- Phone-dock "+ Add" button: still appears to do nothing.

**Bug C — fan / motor rotations re-rasterise the glyph every frame.**
The fan icon is rendered as an SVG `<text>` element with the `electrasim-fan-spin` class applied. CSS `transform: rotate()` on a `<text>` glyph forces the browser to re-rasterise the glyph path at the new angle every frame — same software-paint problem as the wire-flow `stroke-dashoffset`, just with rotation. The motor wheel uses the same pattern (`electrasim-motor-spin`), and the motor stroke-width pulse (`electrasim-motor-pulse`) re-rasterises a path each frame too.

**Fix — `src/index.css`:**
- `electrasim-fan-spin` → `1.4s steps(28, end) infinite` (was `linear infinite`). 20 paints/sec instead of 60. ~67% paint-cost reduction. At 20 fps a rotating disc still reads as smooth motion to the eye; the cost is a barely-perceptible tick-tick quantisation only visible if you stare at it.
- `electrasim-motor-spin` → `2.5s steps(50, end) infinite`. 20 paints/sec, ~7.2°/step (same per-step angular jump as the fan).
- `electrasim-motor-pulse` → `0.9s steps(18, end) infinite`. Eased keyframes become discrete here but for a ±0.5 px stroke-width swing the eye still reads it as a soft breathing pulse.

The reduce-effects toggle still cancels all of these (the `!reducedEffects` gate on `activeLoadEffects` removes the className entirely).

**Bug D — Palette returned null on phone, so the "+ Add" button had nothing to open.**
`src/ui/components/Palette.tsx:76` had `if (isPhone) return null;` — a Phase 0b stub assuming a dedicated bottom-sheet phone palette would ship later. That work is parked for post-v1.0, so until then the phone-dock "+ Add" button (added in 6.2.2c) was correctly toggling `paletteOpen`, but the Palette component refused to render anything in response. The user saw the button "do nothing".

**Fix — `src/ui/components/Palette.tsx`:**
- Removed the `isPhone` early-null. The desktop palette (240 px wide, top-left, full height minus 6.5 rem) fits any viewport ≥ 320 px; the rest of the editor surface stays reachable around it. Added a `void isPhone;` line to keep the prop in the signature for the eventual proper phone palette without triggering an unused-arg lint.

**Verification (6.2.2d):**
- `npm run typecheck`: clean.
- `npm test`: 89/89 pass.
- `npm run build`: clean.

**Note on the user's "should we use an animation library?" question.** The honest answer is: no, an animation library (e.g. Motion, already in our deps) would not help this class of problem. Animation libraries are a win when you have *many* coordinated animations — they batch them under a single rAF loop and avoid layout thrashing. They do not magically GPU-promote SVG attribute animations like `stroke-dashoffset` or `transform` on `<text>`; the cost is intrinsic to the browser's SVG paint pipeline. The two real levers are (1) painting less often (`steps()`, our approach) and (2) painting fewer elements (auto-threshold + reduced-effects mode, also our approach). Library swap would be churn for no measurable win.

### Pre-launch cleanup — Phase 6.10
Lock the v1.0 scope: drop 3D, gate GPU mode to dev, formalise the launch checklist.

**Code (small, surgical):**
- **`src/domain/types.ts`** — removed unused `z?: number` field from `Position` (was a 3D-readiness hook that no code path consumed). Stripped "3D model in later phases" hint from `ComponentDef.icon` comment. Net effect: domain model is now purely 2D.
- **`src/ui/components/Toolbar.tsx`** — wrapped the CPU/GPU renderer toggle in `import.meta.env.DEV`. Production builds no longer surface the Pixi pipeline; the parked GPU wire-visibility bug is no longer user-visible. Pixi code stays in the repo for Phase 8 (v1.1) and remains accessible to dev builds.
- **`src/ui/components/DocsPage.tsx`** — removed the "Toggle to GPU mode" tip from `TIPS`. Added three new tips covering Phase 6.8 features (zoom-to-fit `F`, color scheme selector, PDF / Print). Added the missing `F` shortcut to the `SHORTCUTS` table.

**Documentation (large, deliberate):**
- **`PLAN.md`** — substantial refactor:
  - §1 goal 5 — dropped "3D renderer" from the future-proof list (kept cloud auth + AI).
  - §3 frontend stack — removed the "3D Renderer (future)" row; PixiJS row gained a "**dev-only toggle in v1.0**" qualifier.
  - §4 architecture — removed the `three/` directory placeholder; Renderer interface section retitled "(formalised in Phase 8 / v1.1)" with `Vec2`-typed camera and a 2D `{x, y}` Position note.
  - §5 perf — code-splitting bullet retitled "PixiJS renderer (dev-only in v1.0)".
  - §7 future-features hooks — 3D moved from "Phase 8" to "post-launch (§12)"; backend renumbered to Phase 9 (v2.0); AI to Phase 10 (v2.0); GPU re-enable scoped to Phase 8 (v1.1).
  - §8 phase table — added Phase **6.10** (this entry), reordered remaining v1.0 phases in execution order (`6.10 → 6.2 → 7 → 6.3-slim → 6.11 → 7.1 → PRE-LAUNCH → 🚀 v1.0`), added a new **PRE-LAUNCH** row, dropped the "Phase 9 — 3D renderer" row, renumbered backend (10→9) and AI (11→10).
  - §10 open questions — restructured into Resolved + Deferred-to-pre-launch tables; D5/D6/D7/D8/D9/D-3d-trace-removal all explicitly resolved; D1/D2/D3/D4 explicitly tagged for PRE-LAUNCH.
  - **New §12** — "Post-launch / v2.0+ ideas". Preserves the **full 3D R3F + drei recommendation** verbatim (with library, directory layout, asset pipeline, mobile gating, bundle target). Also documents real-time collab, classroom mode, voice-controlled wiring, OS-clipboard, P2P sync.
  - **New §13** — v1.0 launch checklist with B1–B11 items split across "code & content / infra / quality gates / launch day". Documentation discipline rule (DocsPage + README highlight + walkthrough + CHANGELOG + progress entry) locked here as a v1.0-specific rule.
- **`README.md`** — major rewrite:
  - Tech stack — dropped "Mature 3D wrapper (R3F) for Phase 8" rationale.
  - **New "How wiring works" section** between Highlights and Tech stack — canonical user-facing explanation of **Smart Routing (Phase 6.2 default) vs Custom Wiring (Phase 7 opt-in)** with ASCII illustrations, side-by-side comparison table, FAQ, and implementation status callout. Mirrors the in-app Docs Wiring Guide.
  - Roadmap — split into "v1.0 (in flight)" and "Post-launch (out of v1.0 scope)" tables; new execution order; 3D row demoted to a footnote referencing PLAN.md §12; renumbering notes consolidated.
  - "Known issues" section — GPU wire-visibility bug entry replaced with "None in user-facing v1.0 scope" + Phase 8 deferral note.
- **CHANGELOG.md (this file)** — new `Pre-launch cleanup — Phase 6.10` entry. **Historical entries untouched** per discipline rule.
- **`progress.md`** — session entry with files touched, decisions resolved, perf numbers.

**Decisions resolved (locked in PLAN.md §10):**
- **D2** brand identity → keep placeholder `ElectraSim` + `#2563eb` until launch; pre-launch action items B7/B8/B9.
- **D5** custom wiring spec → both meanings adopted (multi-step + atomic undo).
- **D6** multi-select interaction → drag-rect + Shift-click additive.
- **D7** clipboard scope → in-memory only for v1.0; OS clipboard is a v1.1 candidate.
- **D8** Pixi rewrite vs patch → out of v1.0 scope; decide at Phase 8 kickoff.
- **D9** 3D renderer → dropped from active roadmap; preserved in §12.

**Bundle:** unchanged at **102.54 KB gzip** (main). 70/70 tests passing. `tsc` zero errors.

### Open Enhancements — Phase 6.8
Quick-win UX improvements: zoom-to-fit, dark theme, PDF export.
- **Zoom-to-fit** — `zoomToFit` action in `viewportStore` computes bounding box of all components and adjusts pan/zoom to frame them with padding. Button in `ToolDock` (🔍 icon) + `F` keyboard shortcut.
- **Dark theme** — `labGlassDark` canvas theme tokens in `theme.ts` + `editorBackgroundDark` gradient. `colorScheme` setting (`light` | `dark` | `system`) in `settingsStore` with IDB persistence. `useResolvedTheme` hook listens to `prefers-color-scheme` media query when set to `system`. Three-button selector in Settings modal.
- **PDF / Print export** — `exportPDF()` in `exportImport.ts` renders the circuit SVG in a hidden iframe with a professional title block (title, author, date, footer) and triggers the browser's native print dialog. Zero external dependencies. Button added to Import/Export modal.
- **Bundle:** ~102.54 KB gzip (main), no new dependencies.

### SEO + Plausible Analytics — Phase 6.7
Zero-JS-bundle SEO hardening and privacy-friendly analytics.
- **Meta tags** — `description`, `keywords`, `author`, `canonical`, Open Graph (`og:title/description/image/url/type/locale`), Twitter card (`summary_large_image`).
- **JSON-LD structured data** — `SoftwareApplication` schema for Google rich results.
- **Google Search Console** — placeholder `<meta name="google-site-verification">` ready for token paste.
- **`robots.txt`** — allows all crawlers, blocks `stats.html`, references sitemap.
- **`sitemap.xml`** — single-URL sitemap (SPA), `changefreq: weekly`, `priority: 1.0`.
- **Plausible Analytics** — self-hosted, `<script defer>` in `index.html`. Cookie-free, no consent banner, ~1 KB async load. Placeholder domain `electrasim.app` ready for swap.
- **All placeholders** documented in `index.html` header comment + README. One find-replace on `https://electrasim.app` configures everything.
- **Bundle**: unchanged at **100.68 KB gzip** (Δ ±0 — all changes in HTML + static files). **70/70 tests** passing.

### Right-Click Context Menu — Phase 6.5.2
Context-aware right-click menu on the circuit canvas.
- **Component context** — Select, Toggle (switches only), Start Wire From Here, Delete Component.
- **Wire context** — Select Wire, Reroute Wire (arms select-then-click mode), Delete Wire.
- **Canvas context** — Wire Mode, Select Mode.
- **Shared items** (always visible) — Import/Export, Documentation, Keyboard Shortcuts, Settings.
- **Keyboard shortcuts** shown as `kbd` badges beside each item.
- **Auto-reposition** — menu flips if it would overflow the viewport edge.
- **Click-outside + Escape to close** — highest priority in the Escape chain.
- **Bundle**: 99.51 → **100.68 KB gzip** (Δ +1.17 KB). **70/70 tests** passing.

### Contact Modal — Phase 6.6
Contact popup accessible from the hamburger menu "Contact" item.
- **Instruction panel** — 3-step numbered guide: open form → fill in details → submit.
- **What to include** — categorised guidance: bug reports, feature requests, general questions, each with a coloured pip.
- **Google Forms CTA** — prominent blue button opens the form in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
- **Configurable URL** — single `CONTACT_FORM_URL` constant at the top of `ContactModal.tsx`. Change the URL and save — hot-reload picks it up immediately.
- **Escape to close** — highest priority in the Escape chain (above docs + menu).
- **Bundle**: 98.73 → **99.51 KB gzip** (Δ +0.78 KB). **70/70 tests** passing.

### Documentation Page — Phase 6.5.1
Full-page in-app documentation, accessible from the hamburger menu ("Documentation" or "Keyboard Shortcuts").
- **6 sections** — Getting Started (5-step walkthrough), Components Reference (auto-generated from `COMPONENT_DEFS`), Wiring Guide (port compatibility, rerouting, embedded circuit placeholder), Keyboard Shortcuts table, Simulation & Faults (path-tracing engine + 4 fault types), Tips & Tricks.
- **Wire-style design** — gradient separators with port pips, coloured section headings, port badges on component cards.
- **Sidebar TOC** (desktop) + **mobile dropdown toggle** — sticky navigation that updates automatically when sections are added/removed.
- **Scroll-to-section** — menu "Keyboard Shortcuts" item opens docs pre-scrolled to `#shortcuts`.
- **Escape to close** — highest priority in the Escape chain, back arrow button in header.
- **Data-driven** — components auto-update from `COMPONENT_DEFS`, shortcuts from the `SHORTCUTS` array. Single-file edit to add/edit/delete sections.
- **Bundle**: 94.42 → **98.73 KB gzip** (Δ +4.31 KB). **70/70 tests** passing.

### Hamburger Menu — Phase 6.5
Centered modal menu overlay with blurred backdrop, replacing scattered toolbar icons.
- **MCB breaker-switch trigger** — top-right toolbar button styled as a miniature circuit breaker lever. Blue (closed) → Red (tripped) on toggle, 35° rotation with spring animation, status dot (green/red).
- **Centered modal** — `fixed` overlay with `backdrop-blur-sm` + `bg-slate-900/20` tint. Panel scales 90% → 100% with `cubic-bezier(0.4, 0, 0.2, 1)` ease-in-out on open/close.
- **Wire-terminal styled items** — each menu entry has a coloured port pip, Lucide icon, label, description, and shortcut badge where applicable. Hover shows current-flow green indicator.
- **9 menu items** — Documentation, Keyboard Shortcuts, Import/Export (`Ctrl+E`), Settings, Clear All Wires, Clear All Components, Reset to Defaults, Contact (`mailto:`), About.
- **Grouped with wire separators** — gradient lines + center dot separate functional groups.
- **Escape to close** — integrated with the global keyboard shortcut handler (highest priority).
- **Toolbar decluttered** — Settings icon, Import/Export icon, and ⋮ Bulk-action dropdown all moved into the menu. Toolbar now: brand + undo/redo + AI + sim toggle + renderer + menu trigger.
- **Bundle**: 93.08 → **94.42 KB gzip** (Δ +1.34 KB). **70/70 tests** passing.

### Bulk-action buttons — Phase 6.9
Three destructive bulk actions (now accessible via the Phase 6.5 menu):
- **Clear all wires** — removes every wire, keeps components. Single undoable transaction.
- **Clear all components** — removes every component AND every wire. Single undoable transaction.
- **Reset to defaults** — replaces the circuit with the seed demo, clears undo history, wipes persisted IDB state and settings. Always shows confirmation dialog (no "don't ask again" shortcut).
- All three gated by the existing `confirmDelete` setting (except Reset which always confirms).
- Contextual confirm-dialog titles and descriptions per action kind.
- Empty-state guards: "Clear all wires" warns if no wires exist; "Clear all" warns if circuit is already empty.
- Click-outside-to-close dropdown (pointer event listener).
- **Bundle**: 92.01 → **93.08 KB gzip** (Δ +1.07 KB). **70/70 tests** passing.

### Import / Export — Phase 6.4
Full-featured circuit import/export system — no backend required.
- **JSON export** (`.electrasim.json`) — schema-versioned (`version: 1`), human-readable (2-space indent), round-trips perfectly. Includes `exportedAt` timestamp.
- **SVG export** — clones the live `<svg>`, inlines animation CSS (wire flow, fan spin, motor spin, bulb pulse, motor pulse), strips interactive attributes. Self-contained static snapshot.
- **PNG export** — rasterises the SVG at 2× scale via offscreen `<canvas>.toBlob()`. Configurable scale factor.
- **Shareable URL** — gzip + base64 the JSON into `?c=…` query param using native `CompressionStream`/`DecompressionStream` (zero deps). ~5 KB cap with user-friendly error if circuit is too large.
- **Boot-time URL decode** — on app start, `main.tsx` checks for `?c=` param, decodes the shared circuit, loads it (overriding IDB save), and cleans the URL via `history.replaceState`.
- **Import/Export modal** (`ImportExportModal.tsx`) — two-tab accessible dialog. Export tab: JSON / SVG / PNG download buttons + share-link copy. Import tab: file picker (`.json`), drag-and-drop zone, paste-JSON textarea with validation. Status messages (success green / error red).
- **Toolbar button** — Download icon replaces the old placeholder Save button. Opens modal.
- **Keyboard shortcuts** — `Ctrl/Cmd+E` toggles Import/Export modal, `Ctrl/Cmd+S` quick-exports JSON, `Escape` closes the modal.
- **Validation & security hardening** — `validateCircuitJSON()` checks schema version, component shapes, known component types (cross-referenced against `COMPONENT_DEFS`), wire shapes, wire endpoint cross-references, and port-index bounds against each component's port count. Additional guards:
  - **File size cap** (10 MB) rejects oversized payloads before `JSON.parse`.
  - **Array length caps** — max 5,000 components, 10,000 wires.
  - **String length cap** (256 chars) on `id` / `type` fields; rejects empty strings.
  - **Numeric range checks** — `isFiniteInRange()` rejects `NaN`, `Infinity`, and coordinates beyond ±100,000.
  - **Prototype-pollution sanitiser** — `sanitiseState()` recursively strips `__proto__`, `constructor`, `prototype` own-keys from component `state`, depth-capped at 8 levels.
  - **Duplicate ID detection** — both component and wire IDs.
  - **Port-index bounds** — cross-checked against `COMPONENT_DEFS[type].ports.length`.
  - **`controlPoints` validation** — each must be `{x, y}` within range; max 50 per wire.
- **SVG ref plumbing** — `CircuitCanvas` gained `externalSvgRef` prop (callback ref pattern) so `Editor` can pass the live SVG element to the modal for SVG/PNG export.
- **Modal shell** — `Modal` component `title` prop made optional so callers can render custom headers (used by ImportExportModal for its tabbed header).
- **Unit tests** — 28 tests in `src/lib/exportImport.test.ts`: round-trip fidelity, pretty-print, state preservation, 8 structural rejection cases, plus 14 security tests (oversized payload, array caps, NaN/Infinity, prototype-pollution stripping, duplicate IDs, port-index bounds, empty strings, negative indices).
- **Bundle**: 87.06 → **91.80 KB gzip** (Δ +4.74 KB for entire feature incl. security hardening). CSS 6.80 KB. **70/70 tests** passing across 8 files.

### Bug fixes — Phase 6.4.1
Three UX bugs surfaced during manual testing, all resolved in a single patch:
- **Bug #1 (high): Palette search non-functional** — the search `<input>` had no `value`/`onChange` bindings — purely decorative. Wired `useState` + `useMemo` filter by label/type (case-insensitive), added an ✕ clear button, and a "No components match" empty state.
- **Bug #2 (high): Esc doesn't cancel component placement** — the global keyboard handler early-returned on *all* keys when any `INPUT`/`TEXTAREA` was focused (e.g. the palette search box). Moved Escape handling *before* the input-focus guard so it universally cancels placement, closes modals, and blurs the input. Other shortcuts still respect input focus.
- **Bug #3 (medium): Excessive console log entries** — `MAX_LOGS` was 200, causing browser hangs on busy circuits. Reduced to **100**. Undo/redo history was already capped at 100.
- **Bundle**: 91.80 → **92.01 KB gzip** (Δ +0.21 KB). **70/70 tests** passing.

### Bug fixes — Phase 6.1.1
All seven CPU/SVG-mode bugs from `PLAN.md § 11` resolved in a single surgical patch:
- **Bug #1 (high): Wire tool + palette conflict** — `setPlacingType` now clears `pendingWireFrom` and `reroute`; `setPendingWireFrom` clears `placingType`. Modes are mutually exclusive.
- **Bug #2 (medium): Fan spin drift** — CSS rotation class moved from the `<g>` wrapper to the inner `<text>` element. The SVG `transform` attribute on the group was being clobbered by the CSS `transform: rotate()`.
- **Bug #3 (medium): Bulb glow outside card** — glow circle radius reduced from 20→14 so the halo stays within the 100×70 component card.
- **Bug #4 (medium): Motor doesn't spin** — new `electrasim-motor-spin` CSS keyframe (2.5 s linear, same `transform-box: fill-box` pattern as fan). Applied to the icon `<text>` element.
- **Bug #5 (medium): Push button lacks ON/OFF indicator** — always-visible status dot added to all switch-type components: bottom-right corner, green (on) / red (off), white stroke.
- **Bug #6 (low): MCB label overflow** — label shortened from "MCB (Circuit Breaker)" to "MCB". Full name remains in the component's `description`.
- **Bug #7 (low): Inspector state plain text** — `PillField` gained a `color` prop (`'success'` | `'danger'`). Inspector switch state now renders **ON** in green, **OFF** in red.
- **Bundle**: 86.99 → **87.06 KB gzip** (Δ +0.07 KB). CSS unchanged. 42/42 tests passing.

### UX uplift — Phase 6.1
- **Settings store** (`src/store/settingsStore.ts`) — Zustand slice + IDB persistence (`electrasim:settings:v1`) with the same hydrate-then-autosave pattern as the circuit store. Four flags: `confirmDelete`, `showTooltips`, `currentFlowAnimation`, `activeLoadEffects`. Defaults are the safest UX. Booted in `main.tsx` via `startSettingsPersistence()`.
- **Settings modal** (`src/ui/components/SettingsModal.tsx`) — accessible dialog (focus trap, Esc, body-scroll lock, ARIA) opened from the toolbar cog. Three groups: Editing, Display, Simulation visuals. Reset-to-defaults button.
- **Confirm-delete dialog** (`src/ui/components/ConfirmDialog.tsx`) — single reusable destructive-action dialog. Component AND wire deletes route through it when `confirmDelete` is on. Includes a "Don't ask again" toggle that flips the setting in place.
- **Wire selection + deletion** — clicking a wire selects it (wide invisible hit-target so it works on touch). `Delete`/`Backspace`, the toolbar trash button, and the dialog all flow through `requestDeleteWire` / `confirmPendingDeletion` in `canvas-actions.ts`.
- **Wire rerouting (both modes)**:
  - **Drag-endpoint handles** — selected wires render two grab dots; drag a dot onto another port to swap that endpoint. Drop on empty space cancels.
  - **Select-then-click (R key)** — `R` arms the selected wire's TO end; press again to swap to FROM; press again to cancel. Next port click commits.
  - Both modes share `applyReroute(wireId, end, target)` and the `circuitStore.rerouteWire` mutator, which validates port-type compatibility, rejects self-loops, and clears stale control points.
- **CPU-mode pan + zoom** — SVG canvas now applies `translate(pan) scale(zoom)` to the world group. Wheel zooms around the cursor; left-drag on background pans; `viewportStore.resetView()` is wired to the Maximize2 button. Toolbar zoom buttons call `zoomBy(1.25)` / `zoomBy(1/1.25)`.
- **Simulation visuals (CSS-only, gated by `useSettingsStore`)**:
  - **Current-flow animation** — energised wires animate `stroke-dashoffset` to suggest current direction.
  - **Bulb glow** — soft pulsing yellow halo behind the icon when energised.
  - **Fan spin** — fan icon rotates while energised (1.4 s linear).
  - **Motor pulse** — energised motors animate stroke-width as a heartbeat.
  - All animations honour `prefers-reduced-motion: reduce`.
- **Component tooltip** (`src/ui/CircuitCanvas.tsx`) — hover a component to see label, ID, switch state, simulation status, port types. Renders outside the world transform so it stays a constant size under zoom. Gated by `settings.showTooltips`.
- **Error boundary** (`src/ui/ErrorBoundary.tsx`) — wraps the editor; render errors show a friendly fallback with reload + retry buttons instead of a blank page. The user's circuit is autosaved so a reload restores their work.
- **Defence-in-depth `.catch`** on `useSimulation`'s `simulateAsync` chain — even though the worker client already falls back to the main thread, an unexpected throw now surfaces as a log entry instead of an unhandled rejection.
- **Tests**: `src/store/settingsStore.test.ts` (3 cases — defaults, debounced save, reset) + `src/store/reroute.test.ts` (6 cases — happy reroute, port-type mismatch, self-loop reject, unknown wire, selectWire semantics). **42/42 passing across 7 files.**
- **Bundle**: default SVG main JS goes 82.23 KB → **86.99 KB gzip** (Δ +4.76 KB for settings store, modals, error boundary, reroute logic, animations, tooltip). CSS 5.78 KB → 6.46 KB gzip (Δ +0.68 KB). Still well under the 250 KB target.

### Persistence + PWA — Phase 6
- **`src/store/persistence.ts`** — IndexedDB autosave layer built on `idb-keyval`:
  - `hydrateCircuit()` validates and restores the saved `Circuit` from `electrasim:circuit:v1` before the first React render. Schema-version mismatch or malformed payloads fall back to the seed.
  - `startAutosave()` subscribes outside React to circuit-store mutations, debounces **250 ms**, and writes a `{ version, savedAt, circuit }` blob. Selection-only updates do not trigger writes (Immer reference equality).
  - `clearPersistedCircuit()` for tests and a future "Reset workspace" affordance.
  - All errors logged once per session; never thrown.
- **`src/main.tsx`** — startup wrapped in an async IIFE (es2020 target). `await hydrateCircuit()` runs **before** `createRoot().render()` so the user never sees a flash of the seed. `startAutosave()` runs immediately after. Service worker registration is production-only (`virtual:pwa-register`).
- **`vite.config.ts`** — `vite-plugin-pwa` with `registerType: 'autoUpdate'`:
  - Manifest: name, short_name, `theme_color #2563eb`, `display: standalone`, three SVG icons.
  - Workbox precache extended to 4 MB per file so the lazy Pixi chunks are also available offline.
  - `devOptions.enabled: false` — SW never runs in dev (would intercept HMR).
- **Icons** — `public/favicon.svg`, `public/pwa-192.svg`, `public/pwa-512.svg` (blue lightning bolt on rounded square).
- **`index.html`** — proper title, theme-color meta, favicon + apple-touch-icon links.
- **`src/vite-env.d.ts`** — added triple-slash reference to `vite-plugin-pwa/client` so `virtual:pwa-register` types resolve under strict TS.
- **Tests**: `src/store/persistence.test.ts` — 6 cases covering empty hydrate, successful hydrate, version mismatch reject, malformed-component reject, debounced save round-trip, and selection-doesn't-save. **33/33 passing across 5 files.**
- **Bundle**: default SVG main JS goes 81.33 KB → **82.23 KB gzip** (Δ +0.90 KB for idb-keyval + persistence). 23 precache entries (817 KiB raw including lazy Pixi). Initial-load cost unchanged.

### Simulation — Phase 5 (Web Worker)
- **`src/sim-worker/sim.worker.ts`** — pure Comlink-exposed `simulate()` running off the main thread. Built as a separate ES-module worker chunk by Vite (`new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' })`).
- **`src/sim-worker/client.ts`** — typed `simulateAsync(circuit)` wrapper:
  - Lazily spins up a single worker on first call; reuses it forever.
  - Falls back to main-thread `simulate()` if the browser lacks `Worker` (jsdom in tests, very old browsers, SSR), or if the worker errors at runtime.
  - Exposes `terminateSimWorker()` and `simWorkerActive()` for tests + telemetry.
- **`useSimulation` refactor**:
  - Calls `simulateAsync` instead of synchronous `simulate`.
  - **Debounce** at 16 ms (one frame) so drag-to-move's per-pointermove `moveComponent` collapses into a single sim run.
  - **Stale-call protection** via a monotonic sequence number — results from older requests are dropped if a newer one is in flight, preventing flicker when the user mutates faster than the worker can return.
  - Pause-mid-flight: if the user toggles sim off while a worker call is pending, the result is discarded.
- **Tests**: `client.test.ts` (3 cases) verifies the fallback path under jsdom — output identical to synchronous `simulate()`. **27/27 passing**.
- **Bundle**: `sim.worker-…js` 10.68 KB (worker chunk, only loaded by browsers that support workers). Main bundle gained ~2 KB gzip from comlink. SVG default total: **81.30 KB gzip**.

### Simulation / Renderer — Phase 5 hardening
- **Worker init warning fixed** — restored the Vite `?worker` static import path in `src/sim-worker/client.ts`, eliminating the browser warning **"Attempting to create a Worker from an empty source"** and preserving a real emitted `sim.worker-*.js` chunk.
- **Wire idle-dim moved off stroke alpha** — `PixiCanvas.updateWireNode()` now sets `Graphics.alpha` (display-object property) for the energised/idle dimming and explicitly forces `g.visible = true` on every redraw. Stroke is drawn with no alpha. The display-object alpha mixin is more reliable than `strokeStyle.alpha` in Pixi v8's bezier batcher.
- Verification: `npm run typecheck` ✅ and `npm run build` ✅.

#### Known issue — GPU mode wire visibility (deferred)
- **Symptom:** in GPU/Pixi mode, toggling the **Live/Run** button hides wires until the next toggle. CPU/SVG mode is unaffected. Wires also intermittently fail to render when first switching from CPU to GPU. Console emits `WebGL context was lost.` and Pixi v8 `texImage` warnings on the affected machine.
- **Tried & reverted:** replacing the underlying `Graphics` object on every diff (no effect, wasteful, removed).
- **Tried & kept:** display-object-alpha dimming + explicit `visible = true` (above). Removes a known Pixi v8 footgun and one failure mode, but does not fully resolve the bug for the reporting user.
- **Decision:** park the bug. GPU mode is opt-in and lazy-loaded; CPU/SVG is the default and stays the supported path. We will revisit the Pixi pipeline (likely with explicit context-loss recovery and a Playwright harness) during Phase 7 (Renderer abstraction).
- See `progress.md` entry **"2026-04-26 — Phase 5 hardening (cont.)"** for the full diagnosis, hypotheses, and remaining theories.

### Renderer — Phase 4 hardening (post-ship bug fixes)
A round of Pixi-specific fixes from real interactive testing:
- **StrictMode init race** (`Application _cancelResize is not a function`) — track `initDone`; defer destroy until init resolves.
- **`renderer is undefined` on first paint** — gate scene-sync effect on a `ready` state set only after init + layer attach.
- **Text/icon blur when zooming in** — initial `Text.resolution = max(2, DPR)`; `updateTextResolution(zoom)` re-rasterises on viewport changes (capped 4×).
- **Zoom lag with 200+ components** — grid drawn once at init (lives in world space), preview layer early-outs when no ghost/rubber-band is pending.
- **Wiring broken on trackpads** — switched port handlers from `pointertap` (sub-pixel jitter sensitive) to `pointerup`. Added `e.target === container` guard on container drag-start.
- **Palette placement broken on GPU** — `isBareCanvas(target)` helper recognises `stage`, `world`, *and* `grid` as "bare" since `world.eventMode = 'static'` makes it the bubble target.
- **Wire to freshly-placed component invisible on first paint** — Pixi v8 parent batcher snapshots child set; if you `addChild` then build geometry, first paint skips it. Fix: build geometry, *then* `addChild`. Applied to both `diffComponents` and `diffWires`.
- **Duplicate component on placement** — moved drop logic from `pointerup` to `pointerdown` (Pixi v8 dispatches `pointerup` redundantly through forwarder containers; `pointerdown` doesn't have this quirk and gives snappier UX).
- **Phantom of dragged component left at original position** — root cause: `app.ticker.stop()` + manual `app.render()` skipped framebuffer clearing on some hardware. Reverted to auto-ticker; idle CPU on GPU tab is back to ~5–10 % but visual correctness wins. On-demand rendering deferred to a later phase with explicit clear-before-render.

All bug-fixes preserve the Phase 4a/4b feature set (renderer toggle, culling, LOD, stress button) and the SVG path is unchanged.

### Renderer — Phase 4b (culling + LOD + stress test)
- **Viewport culling** in `PixiCanvas.cullAndLOD()` — every component AABB is intersected against the viewport in world space; off-screen components have `.visible = false` so PixiJS skips them entirely. Wires whose both endpoints are culled are also hidden. Linear scan is sub-millisecond up to a few hundred items; documented upgrade path is RBush for n ≥ ~1000.
- **2-tier LOD** — at zoom < 0.85 the per-component ID text is hidden; at zoom < 0.6 the human-readable label is also hidden. Drops Pixi `Text` paints by 50–66 % when zoomed out, which matters because `Text` uploads textures to the GPU.
- **`src/store/stress.ts`** — `seedStress(branches)` adds N closed lamp branches (live → switch → bulb → neutral) so both renderer and simulation are exercised. `clearAll()` wipes the circuit.
- **Dev-only Stress button** in the toolbar (gated by `import.meta.env.DEV`, tree-shaken from production):
  - Click → +50 branches (~100 components / 150 wires).
  - Shift-click → wipe and respawn 100 branches (~200 components / 300 wires).
  - Alt-click → clear circuit.
- Production bundle holds at **79.27 KB gzip** (Δ +0.01 KB vs Phase 4a) — Vite's dead-code elimination drops the stress utilities and the whole stress button branch when `DEV` is false.

### Renderer — Phase 4a (PixiJS WebGL2)
- **`src/ui/PixiCanvas.tsx`** — full WebGL2 renderer for the editor. Drop-in replacement for `CircuitCanvas` with the exact same prop contract; the user toggles between renderers from the toolbar.
  - **Retained scene graph** with five layers (`grid`, `wires`, `preview`, `components`, plus the world container that applies pan/zoom). On every store change the renderer **diffs** the live scene against the new circuit and only mutates affected nodes — no full redraw, no Graphics churn.
  - `Map<id, CompNode>` and `Map<id, WireNode>` keep DisplayObjects long-lived across hundreds of simulation ticks.
  - **Pan** by dragging on bare background (or middle/right mouse). **Zoom** with the wheel — zoom centres on the cursor by reading `viewportStore.zoomBy(factor, centre)`. Mouse position is fed into `viewportStore.mouse` so the rubber-band wire and ghost-component preview follow the cursor without React re-renders.
  - Component nodes are clickable + draggable in WebGL space (drag uses canvas → world coordinate inversion via `pan`/`zoom`); ports are individually hit-testable for wire creation.
  - Energised + faulted highlighting is computed in `updateComponentNode`/`updateWireNode` from the same `simResult` the SVG renderer reads, so visuals stay 1:1.
- **Lazy-loaded** via `React.lazy` + `Suspense`. Users on the default SVG renderer never download Pixi (~150 KB gzip stays in a separate chunk that only fetches when the toolbar toggle flips to `'pixi'`).
- **`src/ui/canvas-actions.ts`** — extracted renderer-agnostic business logic shared by SVG and Pixi (wire validation, port-click state machine, palette drop, drag commit). Single source of truth.
- **`uiStore`** gained `renderer: 'svg' | 'pixi'` + `setRenderer()`.
- **`Toolbar`** — new "CPU/GPU" pill toggles renderer live; purple while WebGL is active.
- **`viewportStore`** — finally consumed (idle since Phase 2). The Pixi renderer subscribes outside React via `useViewportStore.subscribe(...)` so 60 Hz pan/zoom updates don't trigger React re-renders.

### Bundle impact (Phase 4a)
- **Default (SVG)**: 79.26 KB gzip JS — Δ +0.97 KB vs Phase 3.5 (just the toggle pill + lucide icon).
- **WebGL on demand**: lazy chunks total ~150 KB gzip (Pixi core, WebGL/WebGPU/Canvas renderers, worker harness). Loaded only when the user opts in.
- Both still under the 250 KB initial-load target.

### UI — Phase 3.5 (Palette → canvas placement)
- **Click any palette tile** to enter placement mode. A dashed-outline ghost preview of the component follows the cursor (snap-aligned to the 24 px grid). Click the canvas to drop. The placed component is auto-selected, logged to the console, and made undoable via the same `addComponent` mutation that has been there since Phase 2.
- **Cancel** with **Escape** or by clicking the active palette tile again. The active tile shows a blue ring while a placement is pending.
- **`placingType`** added to `uiStore` with a `setPlacingType()` setter that also flips `mode` to `'placing'` (and back to `'idle'` on cancel/drop).
- **`InteractionMode`** in `src/domain/types.ts` extended with `'placing'`.
- `ToolDock` props use the shared `InteractionMode` type instead of an inline union (kept compatible with the new mode).

### UI — Phase 3 (Component split + interactivity)
- **`src/ui/components/`** — 7 small memoized panels extracted from the previously monolithic `Editor.tsx`:
  - `Toolbar.tsx` — top capsule (brand, undo/redo, AI shortcut, run/pause, settings).
  - `Palette.tsx` — left component catalogue, dynamically grouped from `COMPONENT_DEFS`.
  - `Inspector.tsx` — right detail panel for the selected component.
  - `LogPanel.tsx` — bottom collapsible console.
  - `ToolDock.tsx` — bottom-right select / wire / delete + zoom buttons (zoom is wired in Phase 4).
  - `StatusPill.tsx` — bottom-left summary chip.
  - `PhoneDock.tsx` — phone bottom navigation.
  - Plus shared `IconBtn.tsx` + `PillField.tsx` leaves.
- **`src/ui/Editor.tsx`** — slimmed from ~440 to 80 lines; pure composition root that wires stores → panels.
- **`src/ui/theme.ts`** — extracted Lab Glass · Light theme tokens + the panel background gradient.
- **`src/ui/hooks/useKeyboardShortcuts.ts`** — global keybindings: **Ctrl/Cmd+Z** undo, **Ctrl/Cmd+Shift+Z** (or **Ctrl+Y**) redo, **Delete/Backspace** removes the selected component, **Escape** cancels pending wire / clears selection / drops to idle, **V** select tool, **W** wire tool. Skipped while focused in inputs/textareas.
- **`src/ui/CircuitCanvas.tsx`** — major upgrade. Now an interactive surface, not just a renderer:
  - **Drag-to-move components** in canvas-space using `getScreenCTM` for pixel-perfect screen↔canvas conversion. Window-level pointer listeners during a drag prevent the cursor from getting "lost" if it leaves the SVG area. Snaps to grid on release.
  - **Wire creation** — click a port to set the origin (rubber-band line follows the cursor); click another compatible port to commit. **Validates** rail-type compatibility (`live ↔ live`, `neutral ↔ neutral`, `earth ↔ earth`) and rejects self-loops with a console error log.
  - Visual cues: the pending origin port is highlighted (filled colour, larger radius); ports of matching type on other components get a thicker accent ring while a wire is pending.
  - Cursor switches to `crosshair` while wiring; component bodies show `grab`.

### State — Phase 3
- **`uiStore`** gained `pendingWireFrom: PortRef | null` and `setPendingWireFrom()` for the rubber-band wire-creation state.

### Removed — Phase 3
- `src/App.legacy.tsx` (1,629-line monolithic legacy editor) — fully superseded by `src/ui/Editor.tsx` + Zustand stores + domain layer.
- `src/types.ts` and `src/constants.ts` — re-export shims that only existed to keep the legacy file resolving.
- `tsconfig.json` exclude entry for the legacy file (no longer needed).

### State — Phase 2 (Zustand migration)
- **`src/store/`** — three Zustand slices + a simulation bridge:
  - `circuitStore.ts` — components, wires, selection. Wrapped in **`zundo` `temporal` middleware** for **patch-based undo/redo** (Immer patches, not full snapshots — orders of magnitude less memory than the legacy app's full-clone history). `partialize` + reference-equality predicate ensure selection clicks are NOT recorded in history.
  - `uiStore.ts` — simulation toggle, `simResult`, log stream (capped at 200 entries), interaction mode, panel open/close flags.
  - `viewportStore.ts` — pan, zoom (clamped 0.25–4×), live mouse position. Isolated so high-frequency mouse events don't re-render the toolbar.
  - `seed.ts` — builds the initial circuit (16 components, 20 wires) from real domain primitives.
  - `useSimulation.ts` — React effect bridging `circuitStore` → `simulate()` → `uiStore`. Runs on every change when the sim toggle is on; de-duplicates identical error/warning logs by signature. Phase 5 will move the `simulate()` call into a Comlink-bridged Web Worker without changing the hook signature.
  - `index.ts` — barrel export.
- **`src/store/circuitStore.test.ts`** — 8 tests covering selection invariants, mutators (removeComponent + cascading wire delete, toggleSwitch only on switch types, moveComponent), undo of `toggleSwitch`, and "selection changes don't grow the history" invariant.

### UI — Phase 2 (Editor)
- **`src/ui/Editor.tsx`** — production replacement for `mockups/LabGlassLight.tsx`. Same locked Lab Glass · Light visual, but every control is now wired:
  - Run / Pause toggles `useUiStore.simRunning` (pauses live simulation, clears the `simResult`).
  - Undo / Redo call `zundo`'s history.
  - Toggle palette / log via `useUiStore`.
  - Click a component → `selectComponent`; double-click a switch → `toggleSwitch`; trash icon → `removeComponent`.
  - Inspector reads selected component from the store and surfaces ID, type, position, on/off state, energised/fault status, port list with rail-coloured badges, and a Toggle button for switch-like components.
  - Console panel shows live entries from `useUiStore.logs`; status pill counts components/wires/active loads in real time.
- **`src/ui/CircuitCanvas.tsx`** — domain-driven SVG renderer. Takes `circuit`, `simResult`, `selectedId`, `onSelect`, `onToggleSwitch` as props (no static fixture imports). Component nodes accept click + double-click; energised loads + faulted components get coloured outlines and status pips. The Phase-4 PixiJS renderer will swap in behind the same component contract.

### Removed — Phase 2
- `src/mockups/LabGlassLight.tsx`, `src/mockups/CircuitCanvas.tsx`, `src/mockups/sampleCircuit.ts`, and the empty `src/mockups/` directory — superseded by `src/ui/Editor.tsx`, `src/ui/CircuitCanvas.tsx`, and `src/store/seed.ts`.

### Tooling — Phase 1 (Domain extraction)
- **`src/domain/`** — new pure-TS layer, dependency-free, Web-Worker-ready (PLAN.md §4).
  - `types.ts` — all domain types (`Circuit`, `ComponentInstance`, `WireInstance`, `ComponentDef`, `PortType`, `SimulationResult`, `LogEntry`, …). Position is `{x, y, z?}` for future 3D readiness.
  - `components.ts` — `COMPONENT_DEFS` registry (15 component types) + grid/box constants + `getDef()` helper.
  - `geometry.ts` — pure helpers: `getPortPos`, `getComponentBounds`, `getPortControlOffset`, `sampleWire`, `cubicBezier`, `snapToGrid`. Used by renderer (Phase 4) and spatial index.
  - `simulation.ts` — pure `simulate(circuit)` engine. Faithful port of the legacy `runSimulation` algorithm (BFS over Live and Neutral rails, switch open/closed, load termination, short-circuit detection) but **indexed Maps for O(1) lookups** instead of legacy O(n²) `array.find()`.
  - `index.ts` — barrel export.
- **`src/domain/simulation.test.ts`** — 12 behavioural tests covering empty/degenerate inputs, lit-bulb, switch open/closed, junction box fan-out, MCB on/off, idempotence, and a 50-bulb perf smoke test.
- **`src/types.ts`** and **`src/constants.ts`** — converted to thin re-export shims of the domain layer so the excluded-but-preserved `App.legacy.tsx` keeps resolving. Both shims will be deleted alongside `App.legacy.tsx` in Phase 3.

### Notes
- Lockfile updated; `npm install` adds ~70 dev dependencies (Phase 0a) + 3 runtime deps (Phase 2: `zustand`, `immer`, `zundo`). Initial JS bundle is now **76.13 KB gzip** (Δ +8.08 KB for state libs).
- Test count: **24 tests across 3 files, all passing** (`npm run test`).
- No production behaviour change yet; the live editor (`App.legacy.tsx`) is dormant pending the rewrite phases.
- See `progress.md` for the running log of phases, decisions, and perf numbers.
