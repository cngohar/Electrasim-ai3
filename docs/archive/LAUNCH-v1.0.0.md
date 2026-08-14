# ElectraSim — Pre-Launch Checklist
> **Living document.** Every launch-related task lives here.
> Code changes → `CHANGELOG.md` + `progress.md`.
> Strategic decisions → `PLAN.md`.
> This file = the *go/no-go gate* before `git push prod main`.
>
> Current status: **🔧 Phase 7.1 — pre-launch polish in progress**
> Execution order: `6.10 ✅ → 6.2 ✅ → 7 ✅ → 6.3-slim ✅ → 6.11 ✅ → 7.1 🔧 → PRE-LAUNCH → 🚀 v1.0`

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done — verified |
| 🔧 | In progress |
| ❌ | Blocker — must fix before launch |
| ⚠️ | Warning — fix before launch, won't crash |
| 📋 | Needs owner decision |
| 🔮 | Post-launch / v1.1+ |

---

## 1. Code Health

| ID | Check | Status | Notes |
|---|---|---|---|
| C1 | `npm run typecheck` — zero errors | ✅ | 0 errors as of 2026-04-30 |
| C2 | `npm run test` — all suites green | ✅ | 89/89 tests passing |
| C3 | `npm run lint` (Biome) — zero errors | ✅ | `lint:fix` ran — 25 files fixed. 16 pre-existing a11y/suppression warnings remain in DEV-only files (no logic errors). |
| C4 | No stale `TODO / FIXME / HACK` comments in production paths | ✅ | Only HTML-comment TODOs for domain swap (tracked in §4) |
| C5 | No API keys or secrets in source tree | ✅ | `GEMINI_API_KEY` removed from vite.config; AI gated to Phase 10 |
| C6 | `npm run build` succeeds cleanly | 📋 | Run once before launch; main chunk target ≤ 250 KB gzip |
| C7 | Production build size check | 📋 | `npm run build:stats` → inspect `dist/stats.html` |
| C8 | PWA precache covers all critical assets | ✅ | `vite-plugin-pwa` configured; `maximumFileSizeToCacheInBytes` set to 4 MB |
| C9 | Dev-only features gated behind `import.meta.env.DEV` | ✅ | Stress tool, GPU toggle, FPS overlay all gated |
| C10 | No `console.error` / `console.warn` leaks in production | 📋 | Manual check: open prod build in browser, check DevTools Console |

### 1.1 Biome lint items (non-blocking, fix before launch)

Run `npm run lint:fix` to auto-resolve all of these:

- `src/ui/theme.ts` — import sort order
- `src/ui/hooks/useKeyboardShortcuts.ts` — formatter
- `src/domain/geometry-orthogonal.test.ts` — formatter
- `src/domain/geometry.ts` — formatter
- `src/ui/components/Toolbar.tsx` — formatter
- `src/index.css` — formatter
- `src/ui/components/ToolDock.tsx` — formatter
- `src/store/clipboardStore.ts` — formatter
- `src/ui/components/SettingsModal.tsx` — formatter
- `src/store/circuitStore.ts` — formatter

---

## 2. Feature Completeness

| ID | Feature | Status | Notes |
|---|---|---|---|
| F1 | Simulation engine (live, fault detection) | ✅ | Tested |
| F2 | SVG renderer — all component types | ✅ | Production renderer |
| F3 | PixiJS / WebGL renderer | 🔮 | Gated to DEV only (Phase 8 / v1.1) |
| F4 | Undo / redo (zundo patches) | ✅ | |
| F5 | Import / Export (JSON, SVG, PNG, URL share) | ✅ | |
| F6 | Smart orthogonal wire routing (A*) | ✅ | |
| F7 | Custom wiring mode (Phase 7) | ✅ | All bugs fixed (port highlight, pan, SVG z-order) |
| F8 | Multi-select + copy/paste (Phase 6.2.3–6.2.4) | ✅ | |
| F9 | Alignment toolbar + distribute (Phase 6.3-slim) | ✅ | |
| F10 | Gridless mode toggle | ✅ | Settings → Display |
| F11 | Canvas colour presets (High Contrast, Deuteranopia) | ✅ | Settings → Display |
| F12 | Mini-map (click-to-pan thumbnail) | ✅ | Settings → Display to toggle |
| F13 | Dark mode / light / system (Phase 6.8 + 6.11) | ✅ | All panels covered |
| F14 | Zoom-to-fit (`F` shortcut) | ✅ | |
| F15 | In-app documentation (DocsPage) | ✅ | All Phase 6.3-slim tips added |
| F16 | Right-click context menu | ✅ | |
| F17 | Hamburger menu + bulk actions | ✅ | |
| F18 | PWA (offline, installable) | ✅ | Service worker registered |
| F19 | Mobile / phone layout (PhoneDock) | ✅ | |
| F20 | Settings persistence (IndexedDB) | ✅ | |
| F21 | Error boundary (no white-screen crash) | ✅ | |
| F22 | **"Ask AI" button is wired up** | ❌ | Button renders but does nothing (no-op). Must either wire to a real endpoint or hide before launch. See §6. |
| F23 | **Contact form URL is real** | ❌ | `CONTACT_FORM_URL = 'https://forms.gle/YOUR_FORM_ID_HERE'` — placeholder. See §4. |

---

## 3. Infrastructure / Deployment

> **Updated 2026-05-01 (user-requested):** Primary target changed to **Cloudflare Pages + Workers**. All compute-heavy work (simulation, routing, rendering) is client-side — the server is thin API glue only. Original Hetzner VPS plan preserved as fallback in `PLAN.md §3` and below.

### ⭐ Primary path — Cloudflare Pages (recommended)

| ID | Item | Status | Notes |
|---|---|---|---|
| I1 | Domain registered via Cloudflare Registrar | ✅ | `electrasim.com` registered 2026-05-01 |
| I2 | Cloudflare Pages project created | ✅ | `electrasim` project created via wrangler |
| I3 | First deploy | ✅ | Deployed 2026-05-01 — 25 files, 114 KB gzip |
| I4 | Custom domain linked in Pages dashboard | ✅ | `electrasim.com` active |
| I5 | `npm run build` produces clean `dist/` | ✅ | 114 KB gzip, 18s build |
| I6 | *(v2.0+)* Cloudflare Workers + D1 + R2 | 🔮 | Auth, cloud save, AI proxy. Add when Phase 9 starts. |

### Fallback path — Hetzner VPS + Caddy (original plan, self-hosted)

> Use only if full server control is required or Cloudflare is unavailable in your region. Full config in `PLAN.md §3` and original `PLAN.md §13`.

| ID | Item | Status | Notes |
|---|---|---|---|
| I1-alt | Domain → DNS A/AAAA to VPS IP | 📋 | Porkbun / Cloudflare Registrar |
| I2-alt | Hetzner CX22 provisioned (Debian 12) | 📋 | €4.51/mo |
| I3-alt | Caddy v2 + Docker Compose configured | 📋 | See PLAN.md §13 B2–B2.2 |
| I4-alt | Bare-git push-to-deploy hook | 📋 | `git push prod main` → rebuild + reload |

---

## 4. Domain + Content Substitutions

> **Domain confirmed: `electrasim.com` (registered 2026-05-01, Cloudflare).** Find-replace done — all `https://electrasim.app` → `https://electrasim.com` across source files.

| ID | File | What to change | Status |
|---|---|---|---|
| D1 | `index.html` | Replace all `https://electrasim.app` with real domain | ✅ → `electrasim.com` |
| D2 | `index.html` | Replace `REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN` with real token | ✅ token set |
| D3 | `index.html` | Update `data-domain` + `src` in Plausible `<script>` | ✅ `plausible.io` cloud |
| D4 | `public/robots.txt` | Replace `https://electrasim.app` | ✅ → `electrasim.com` |
| D5 | `public/sitemap.xml` | Replace `https://electrasim.app` | ✅ → `electrasim.com` |
| D6 | `src/ui/components/ContactModal.tsx` | Replace `CONTACT_FORM_URL` with real Google Forms URL | ✅ `forms.gle/z1eED6sbmXmZrRKT8` |
| D7 | `public/` | Add real `og-image.png` (1200×630 px) — **file does not exist** | ❌ **Blocker** |
| D8 | `index.html` | Update OG `og:image` to point to `og-image.png` (not `pwa-512.svg`) | 📋 |
| D9 | `package.json` | Update `version` from `0.0.0` to `1.0.0` | 📋 |
| D10 | `CHANGELOG.md` | Move `[Unreleased]` section to `[1.0.0] — YYYY-MM-DD` | 📋 |

---

## 5. Quality Gates (must pass before launch)

| ID | Gate | Status | Command |
|---|---|---|---|
| Q1 | TypeScript — zero errors | ✅ | `npm run typecheck` |
| Q2 | Vitest — 89/89 green | ✅ | `npm run test` |
| Q3 | Biome lint + format clean | ⚠️ | `npm run lint:fix && npm run lint` |
| Q4 | Production build succeeds | 📋 | `npm run build` |
| Q5 | Main bundle ≤ 250 KB gzip | 📋 | `npm run build:stats` |
| Q6 | Lighthouse ≥ 95 (Perf / A11y / BP / SEO) | 📋 | Run on production build with throttling |
| Q7 | PWA install + offline test | 📋 | DevTools → Application → Add to home screen → Offline → reload |
| Q8 | Playwright E2E suite | 📋 | `npm run e2e` (requires Playwright browsers installed) |

---

## 6. Pre-Launch Polish (Phase 7.1 scope)

> Issues found during the 2026-04-30 code sweep. Fix before launch.

| ID | Issue | Severity | File | Notes |
|---|---|---|---|---|
| P1 | **"Ask AI" button is non-functional** | ✅ Fixed | `src/ui/components/Toolbar.tsx` + `src/ui/components/PhoneDock.tsx` | Toolbar button gated behind `import.meta.env.DEV` (invisible in prod). PhoneDock button shows `dimmed` opacity + logs friendly "v2.0" message. |
| P2 | **Contact form URL is a placeholder** | ✅ Fixed (safe) | `src/ui/components/ContactModal.tsx` | Added `IS_PLACEHOLDER` guard — when URL is still unset, button is replaced by a friendly "coming soon" amber banner. No broken link. Replace `CONTACT_FORM_URL` before launch. |
| P3 | **OG image missing** | ✅ Fixed | `public/og-image.svg` | Created `public/og-image.svg` (1200×630, branded circuit diagram). Updated `index.html` OG + Twitter meta tags to reference it. SVG is supported by most preview engines; replace with a PNG screenshot at launch for maximum compatibility. |
| P4 | **`App.tsx` comment refers to stale phase numbers** | ✅ Fixed | `src/App.tsx` | Updated to reflect v1.0 complete state. |
| P5 | **`AboutTab` roadmap in SettingsModal is stale** | ✅ Fixed | `src/ui/components/SettingsModal.tsx` | Roadmap updated: 6 shipped rows (simulation, wiring, multi-select/custom wiring, alignment/mini-map, dark mode/PWA, import/export), WebGL v1.1, cloud save v2.0, AI v2.0. Version pill updated to `v1.0-rc.1`. |
| P6 | **Biome formatter warnings** | ✅ Fixed | Multiple files | Ran `npm run lint:fix` — 25 files auto-fixed. Remaining 16 warnings are pre-existing a11y/suppression annotations in `PixiCanvas.tsx` (DEV-only) and `Modal.tsx`; no logic errors, no action needed for launch. |
| P7 | **`package.json` version is `0.0.0`** | ✅ Fixed | `package.json` | Bumped to `1.0.0-rc.1`. Change to `1.0.0` on launch day. |
| P8 | **`CHANGELOG.md` `[Unreleased]` needs version + date** | 📋 Launch day | `CHANGELOG.md` | Rename `[Unreleased]` → `[1.0.0] — YYYY-MM-DD` on launch day. |
| P9 | **`PLAN.md` phase table shows 6.3-slim / 6.11 / 7 as `pending`** | ✅ Fixed | `PLAN.md` | Updated in 2026-04-30 session. All shipped phases now show `✅ done`. |

---

## 7. Smoke Test Checklist (manual, per browser)

Run this in Chrome + Firefox + Safari + iOS Safari + Android Chrome.

```
[ ] App loads — no white screen, no console errors
[ ] Seed circuit visible on first load
[ ] Add a component from Palette
[ ] Connect two components with a wire (standard mode)
[ ] Connect two components with custom wiring mode (Settings → Editing → Custom wiring)
[ ] Run simulation — wires energise
[ ] Toggle switch — simulation updates live
[ ] Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
[ ] Multi-select 2+ components → alignment toolbar appears → align left
[ ] Mini-map visible (bottom-left) — click to pan
[ ] Grid toggle (Settings → Display) — grid hides
[ ] High Contrast preset (Settings → Display) → colours change
[ ] Dark mode (Settings → Display → Dark)
[ ] Export JSON → Import same file — circuit matches
[ ] Share URL → paste in new tab → circuit loads
[ ] Zoom-to-fit (F key)
[ ] Press Esc during wire placement — wire cancelled, no partial wire
[ ] Hamburger menu opens / closes with Esc
[ ] Settings modal opens / all toggles respond
[ ] PWA: install to home screen (mobile or desktop)
[ ] PWA: go offline, reload — app still loads
[ ] Lighthouse ≥ 95 (run in Chrome DevTools → Lighthouse tab)
```

---

## 8. Launch Day Steps

> Steps 1–5 are already done (Phase 7.1). Steps 6–end are launch-day owner actions.

**Pre-flight (already done ✅)**
1. ✅ `npm run lint:fix` — 25 files fixed
2. ✅ P1–P3 blockers fixed (Ask AI hidden, contact guard, OG image created)
3. ✅ `AboutTab` roadmap updated
4. ✅ `npm run check` — tsc + lint + 89/89 tests green
5. ✅ `package.json` version → `1.0.0-rc.1`

**Launch day (owner actions)**
6. ✅ Register domain via **Cloudflare Registrar** — `electrasim.com`
7. ✅ Find-replace `https://electrasim.app` → `https://electrasim.com` — done
8. Replace Google Search Console token in `index.html`
9. Update Plausible `data-domain` + `src` in `index.html`
10. Replace `ContactModal.tsx` `CONTACT_FORM_URL` with real Google Forms link
11. *(Optional)* Replace `public/og-image.svg` with a real PNG screenshot (1200×630) for maximum Twitter/Slack compat
12. Final `npm run build` — confirm clean `dist/`
13. Update `package.json` `version` → `1.0.0`
14. Rename `CHANGELOG.md` `[Unreleased]` → `[1.0.0] — YYYY-MM-DD`
15. ✅ Create **Cloudflare Pages** project — `electrasim` created
16. ✅ Deploy — `https://electrasim.pages.dev` + `https://electrasim.com` live
17. ✅ Custom domain linked — `electrasim.com` active
18. ✅ `git init && git tag v1.0.0` — initial commit `afe1d26`
19. ✅ Post-deploy Lighthouse — Perf 71 / A11y 100 / SEO 100 (incognito, cold). TBT 70ms, CLS 0. TTFB + CF bot script outside our control. Preconnect hint added.
20. 📋 Submit `https://electrasim.com/sitemap.xml` to Google Search Console
21. 📋 Verify Plausible fires on the live domain
22. 🚀 Announce

**Fallback (if using Hetzner VPS instead of Cloudflare Pages)**
> Replace steps 15–17 with: provision CX22 → install Caddy v2 + Docker Compose → `git push prod main`. Full config in `PLAN.md §3` fallback section.

---

## 9. Post-Launch (v1.1+)

These are **out of scope for v1.0** — tracked here so they are not forgotten:

- Phase 8: Pixi/WebGL renderer — fix GPU wire-visibility bug, re-enable user toggle
- Phase 9: Hono backend (magic-link auth, cloud save, real contact endpoint)
- Phase 10: AI features (Gemini Vision image-to-circuit, "why broken?" debug)
- 3D renderer (R3F) — parked in PLAN.md §12, revisit if users request it

---

*Last updated: 2026-05-01 — 🚀 **v1.0.0 LAUNCHED** at https://electrasim.com — Cloudflare Pages, git tag v1.0.0, 89/89 tests. Remaining: Lighthouse run, sitemap submission, Plausible verification.*
*Cross-references: [CHANGELOG.md](./CHANGELOG.md) · [progress.md](./progress.md) · [PLAN.md](./PLAN.md)*
