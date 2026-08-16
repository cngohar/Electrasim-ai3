# Pro Mode & Dual-Standard Compliance — Implementation Notes

This document summarises the work delivered in this branch, maps each
requirement to the files that implement it, and lists known follow-ups.

## 1. Sub-header "? Specs" button removed

The quick "? Specs" button that used to appear next to a selected component
in the floating SubHeaderBar has been removed. The full "Specs" control
still lives inside the component image card (top-right) and in the variant
gallery, so no functionality is lost.

- `src/ui/components/SubHeaderBar.tsx` — button deleted.

## 2. Manual fault-injection master toggle (Pro-only)

A new `manualFaultInjection` boolean setting (default **on**) controls whether
manual fault-injection UI is rendered. It is exposed as a compact
Faults on/off pill in the SubHeaderBar, **only in Pro mode**.

Student Mode never renders the toggle or any fault-injection surface. When
the toggle is off in Pro mode, all of the following are hidden:

- Manual Fault Simulation panel (Component Properties tab)
- Fault Injection Testing panel (Simulation tab, wires)
- Manual breaker trip control (Simulation tab, protection components)
- Fault injection / clear-fault items in the right-click context menu

In addition, when Student Mode is active any previously injected faults
remain in the circuit model but no UI exposes them.

- `src/store/settingsStore.ts` — `manualFaultInjection` flag (persisted,
  schema v1 → v2 forward-compatible).
- `src/ui/components/SubHeaderBar.tsx` — Faults toggle.
- `src/ui/components/inspector/ComponentPropertiesView.tsx` — panel gated.
- `src/ui/components/inspector/InspectorSimulationContent.tsx` — wire fault
  grid + manual breaker trip gated.
- `src/ui/components/contextMenuItems.ts` — component & wire fault menu
  items gated.

## 3. UK / US / EU regulation templates

A new pure module `src/domain/standards.ts` defines three presets:

| Code | Standard | Nominal | Freq | RCD | MCB default | Motor MCB | V-drop L/P |
|------|----------|---------|------|-----|-------------|-----------|------------|
| `uk` | BS 7671 18th Ed. Amd 3/4 | 230 V | 50 Hz | 30 mA | B | C | 3 % / 5 % |
| `us` | NFPA 70 (NEC) | 120 V | 60 Hz | 6 mA GFCI | C | D | 3 % / 5 % |
| `eu` | IEC 60364 | 230 V | 50 Hz | 30 mA | B | C | 3 % / 5 % |

A segmented `StandardSelector` popover lives in the SubHeaderBar (Pro-only).
Selecting a template:

1. persists `regulationStandard`,
2. updates the global supply voltage,
3. applies the standard's conductor colour palette,
4. re-runs validation immediately.

- `src/domain/standards.ts`
- `src/ui/components/StandardSelector.tsx`
- `src/ui/theme.ts` — wire colours now derive from `regulationStandard`
  (legacy `wireColorStandard` still acts as a regional override).
- `src/ui/Editor.tsx` — passes the standard into the theme builder.
- `src/store/settingsStore.ts` — `regulationStandard` persisted.

## 4. Standard-aware compliance validation

`src/domain/compliance.ts` adds three blocking rules keyed to the active
standard:

- **Voltage drop** — per-load BFS to the nearest source using the BS 7671
  Appendix 4 mV/A/m method. Flags any load whose drop exceeds the 3 %
  (lighting) / 5 % (power) ceiling for the selected standard.
- **Unswitched socket without RCD/GFCI** — upstream graph search for an
  RCD/RCBO/GFCI/AFDD. Missing protection is a blocking error under all
  three standards (BS 7671 411.3.3, NEC 210.8, IEC 60364-4-41).
- **Wrong MCB curve for motor loads** — motors / compressors / EV chargers
  require a C- or D-curve breaker; a B-curve upstream is a blocking error
  (nuisance tripping on inrush).

The existing `validateCircuit` runner now accepts the active standard and
merges these issues into the same report. Each blocking issue carries
`blocking: true`; the report also exposes `blockingErrorsCount` and the
`standard` it was generated against.

- `src/domain/compliance.ts`
- `src/domain/circuitValidation.ts`
- `src/domain/circuitValidationTypes.ts`

## 5. Simulation blocked until compliance errors are fixed

`setSimRunning(true)` / `toggleSim()` now validate the current graph
against the active standard **before** starting. If any blocking error is
open:

- simulation stays paused,
- the Validation inspector tab auto-opens,
- a `COMPLIANCE CHECK FAILED` fault alert explains the first violation,
- the user must fix the issue and re-run.

This is the "simulation does not run until fixed" gate requested in the
brief. Tripped / blown / busted components continue to block as before.

- `src/store/uiStore.ts` — `setSimRunning`, `toggleSim`, `runCircuitValidation`.

## 6. Pro "Simulation History" audit log

A new **History** tab (clock icon) is appended to the Pro inspector rail.
It surfaces the event-history stream grouped into three counters:

- **Violations** (`regulatory_violation`)
- **Faults** (injected / detected / tripped / blown / melted)
- **Interventions** (cleared / repaired)

Every blocking compliance violation produced by a validation run is
automatically recorded (de-duplicated within 5 seconds) with timestamp,
affected component/wire, standard and issue id. The log holds the last
100 events and supports a Clear action. The existing floating
`EventHistoryPanel` keeps working and now also renders the new event
types.

- `src/ui/components/inspector/InspectorHistoryView.tsx` (new)
- `src/ui/components/inspector/Inspector.tsx` — History tab (Pro only).
- `src/store/uiStore.types.ts` — new event types + details fields.
- `src/store/uiStore.ts` — auto-records blocking violations.
- `src/ui/components/EventHistoryPanel.tsx` — icon for new event types.

## 7. "Show Stress Zones" canvas heatmap

A Pro-mode toolbar toggle arms a new SVG overlay
(`StressZoneOverlay`) that colour-codes components and wires by the
higher of:

- thermal ratio (live component temperature / 90 °C or wire
  `wireHeatRatios`),
- voltage-drop ratio (actual % / standard ceiling for the load).

The colour ramp runs green → amber → orange → red. Elements above 80 %
get a pulsing dashed outline and a small percentage badge. Wires show
their ΔU percentage. The overlay is non-interactive
(`pointer-events: none`) so selection and wiring keep working.

- `src/ui/canvas/StressZoneOverlay.tsx` (new)
- `src/ui/CircuitCanvas.tsx` — mounts overlay inside the world transform.
- `src/ui/components/Toolbar.tsx` — Stress Zones toggle (Pro-only).
- `src/store/settingsStore.ts` — `stressZonesEnabled` persisted.

## 8. "Recommended Protection" badge

For any selected load in Pro mode, the Properties tab now shows a green
badge with the standard-recommended:

- MCB rating (smallest preferred size ≥ 1.25 × design current)
- Trip curve (B for resistive/electronic, C/D for inductive motor loads)
- Design current Ib (P / V)

The figures recompute when the load's power/voltage or the selected
regulation standard changes. Badge is suppressed for sources, junctions,
breakers and distribution gear.

- `src/domain/standards.ts` — `recommendMcbrating`, `recommendCurveForLoad`.
- `src/ui/components/inspector/ComponentPropertiesView.tsx` — badge.
- Test hook: `[data-recommended-protection]` attribute.

## Tests

- Unit / integration: `npm test` → **317 / 317 passing** (includes the
  updated settings-store migration test for schema v2).
- End-to-end: `e2e/pro-features.spec.ts` covers every new surface with
  8 Playwright tests, **all passing** on Chromium.
- TypeScript: `tsc --noEmit` clean.
- Production build: `vite build` succeeds (chunk-size warning pre-existing).

## Review suggestions for the actual app

While implementing the features I walked the whole editor; a few
independent improvements stand out as worth doing next:

1. **Demystify the compliance gate for new users.** The Run button now
   refuses to start on a blocking violation, but the fault-alert modal is
   the same component used for trips/melts. A dedicated inline banner
   inside the Validation tab ("Fix 3 issues to enable Run") with a direct
   "Run anyway" override for teachers/demos would reduce friction.
2. **Surface the standard selector in Student mode as read-only.**
   Students currently can't see which regulation they're working under;
   showing the flag + citation (disabled) keeps the UI honest without
   exposing the switch.
3. **Make Stress Zones reflect the actual geometry.** The current overlay
   places a dot at the midpoint of a wire's endpoints rather than along
   the routed path. Reusing `precomputedPath` from `WireLayer` would let
   the heat band follow bends and corners for a much more convincing
   heatmap.
4. **Persist the audit log.** Today the Simulation History is in-memory
   and resets on reload. Appending it to the existing IndexedDB
   persistence layer (alongside circuits/settings) would turn it into a
   genuine traceable record for classrooms.
5. **Combine the two thermal toggles.** `thermalOverlayEnabled`
   (Analytics tab, per-component temperature) and the new
   `stressZonesEnabled` overlap visually. Merging them into one
   three-state control (Off / Heat only / Heat + V-drop) would remove
   redundancy.
6. **Standard-aware palette defaults.** When the user switches to US,
   socket/breaker components still show BS-pattern parts by default.
   Filtering or re-labelling the palette (e.g. promoting GFCI receptacles
   and NEMA sockets) under NEC would make the dual-standard experience
   feel complete end-to-end.
