# Performance Guardrails

Performance work is measured against the production build. Splitting a source file is a
maintainability change unless it also creates a dynamic import boundary or reduces runtime work.

## Automated budgets

Run:

```bash
npm run build
npm run check:perf
npm run benchmark:simulation
npm run benchmark:browser
```

The budget check covers the default app JavaScript and CSS, generated HTML volume, tag archive
count, and the homepage's high-priority image. Hashed build assets are served with immutable cache
headers; HTML, the service worker, and the manifest must revalidate.

Tag archives are intentionally generated only for normalized tags used by at least three published
posts. Long-tail tag URLs are not retained as empty or one-post pages; all generated on-site tag links
use the same threshold. This keeps the static output bounded as the article corpus grows.

## Interaction baseline

Use the development stress control to inspect the production SVG renderer at 50, 100, and roughly
200 components. `npm run benchmark:browser` adds the largest stress fixture (currently 202
components and 300 wires), runs the simulation, dispatches frame-paced pan and component-drag
gestures, measures pointer-handler and release-commit CPU time, and records
`requestAnimationFrame` intervals in headless Chromium. The strict gate covers application-owned
CPU work and the static-scene frame baseline. Gesture paint intervals remain attached telemetry:
software-rasterized headless SVG throughput varies substantially by runner and is not a substitute
for profiling trusted pointer input on target devices.
The development-only Pixi prototype is an exploratory comparison until v1.1 and is not part of the
current parity or production gate. A benchmark improvement that breaks wire routing, selection, or
fault injection is not acceptable.

Target behavior:

- Default app JavaScript: at most 115 KB gzip.
- Dense-editor headless gate: pointer handlers average below 1 ms and stay below 2 ms p95;
  pointer-up commits stay below 16 ms; the static dense scene stays below 30 ms average, 50 ms p95,
  and 10% long frames. Pan/drag paint intervals are recorded for manual cross-run comparison.
- Simulation fallback: below 8 ms for a 200-component circuit.
- Marketing pages: no hydration JavaScript unless a feature requires it.
- Homepage priority image: at most 200 KB in its largest delivered format.
