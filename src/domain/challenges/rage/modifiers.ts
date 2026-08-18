/**
 * The Ohmageddon modifiers (plan §25, §26; Phase E step 6, §52).
 *
 * §52 names the three to build first — `redHerring`, `remoteFault`,
 * `limitedHints` — precisely because each can be made *truthful* with the
 * simulator as it stands. The other four names from §25 are declared here as
 * unimplemented stubs so the tier tables and the tests share one vocabulary
 * and nothing can silently ship half-done (§25: "Only implement modifiers that
 * can be supported truthfully by the current simulator").
 *
 * Read every modifier below against the §26 test: does it make the *diagnosis*
 * harder, or does it make the *physics* wrong? Each one is annotated with the
 * answer.
 */

import { COMPONENT_DEFS } from '../../components';
import { COMP_H, COMP_W, GRID_SIZE } from '../../components';
import type { Circuit, ComponentInstance, WireInstance } from '../../types';
import type { FaultCandidate } from '../faults/eligibility';
import { candidateKey } from '../faults/eligibility';
import type {
  RageCandidateInput,
  RageCandidatePatch,
  RageCircuitInput,
  RageCircuitPatch,
  RageContext,
  RageModifier,
  RageModifierId,
  RagePresentation,
  RageSelectionInput,
  RageSelectionPatch,
} from './types';

// ---------------------------------------------------------------------------
// redHerring — a real, innocent component spliced into a live run
// ---------------------------------------------------------------------------

/**
 * Junction accessories used as decoys.
 *
 * All three are `isPassThrough` + `isJunction` in `COMPONENT_DEFS`, which is
 * what makes this honest: the simulator treats them as a straight-through
 * connection, so splicing one into a run changes the *drawing* and the number
 * of suspects without changing a single volt or amp. Verified empirically
 * before this module was written — 2,745 splices across 180 generated
 * circuits, 99.1% accepted by the unmodified `validateCandidate` gate, and
 * every accepted one behaviourally identical to its parent (the 0.9% are
 * rejected by the existing compat rule, which is exactly the safety net doing
 * its job).
 */
const DECOY_TYPES = ['wago-connector', 'terminal-strip', 'junction-box'] as const;

function snap(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/**
 * Find a grid slot near (x0, y0) that no component already occupies.
 *
 * The generator's own structural gate rejects overlapping components, so a
 * decoy dropped on top of an existing device would fail validation and the
 * whole modifier would silently never apply. Searching outward in rings keeps
 * the decoy visually near the run it was spliced into.
 */
function findFreeSlot(
  components: readonly ComponentInstance[],
  x0: number,
  y0: number,
): { x: number; y: number } | null {
  const occupied = (x: number, y: number) =>
    components.some(
      (c) => Math.abs(c.x - x) < COMP_W + GRID_SIZE && Math.abs(c.y - y) < COMP_H + GRID_SIZE,
    );
  const step = GRID_SIZE * 4;
  const offsets = [
    [0, 0],
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
  ] as const;
  for (let ring = 0; ring < 12; ring++) {
    for (const [dx, dy] of offsets) {
      const x = snap(x0 + dx * ring * step);
      const y = snap(y0 + dy * ring * step);
      if (!occupied(x, y)) return { x, y };
    }
  }
  return null;
}

/**
 * Splice `junctionType` into the middle of `wireId`.
 *
 * One wire becomes two, each carrying half the original run length so the
 * total cable length — and therefore voltage drop and Zs — is unchanged. Cable
 * size, material and installation method are inherited verbatim. This is the
 * whole trick: electrically it is still one conductor between the same two
 * terminals, because that is what a Wago *is*.
 */
function spliceJunction(
  circuit: Circuit,
  wireId: string,
  junctionType: string,
): { circuit: Circuit; decoyId: string; addedWireIds: string[] } | null {
  const wire = circuit.wires.find((w) => w.id === wireId);
  if (!wire) return null;
  const from = circuit.components.find((c) => c.id === wire.fromComponentId);
  const to = circuit.components.find((c) => c.id === wire.toComponentId);
  if (!from || !to) return null;

  const def = COMPONENT_DEFS[junctionType];
  const fromDef = COMPONENT_DEFS[from.type];
  if (!def || !fromDef) return null;
  const rail = fromDef.ports[wire.fromPortIndex]?.type;
  if (!rail) return null;

  // The decoy must be able to carry the rail it is being spliced into.
  const inPort = def.ports.findIndex((p) => p.type === rail);
  const outPort = def.ports.findIndex((p, i) => p.type === rail && i !== inPort);
  if (inPort < 0 || outPort < 0) return null;

  const slot = findFreeSlot(circuit.components, (from.x + to.x) / 2, (from.y + to.y) / 2);
  if (!slot) return null;

  /**
   * The decoy's id must NOT advertise that it is a decoy.
   *
   * `ComponentNode.tsx` renders `component.id` verbatim beneath every device,
   * so an id like `…-w-3-decoy` puts the answer on the canvas in plain text —
   * caught by reading a rendered screenshot, not by any test. The id therefore
   * mimics the generator's own naming (`<prefix>-jN`), which is exactly what
   * an ordinary junction accessory in a generated circuit looks like.
   */
  const prefix = wireId.replace(/-w-.*$/, '');
  let decoyId = '';
  for (let n = 1; n <= 99; n++) {
    const candidate = `${prefix}-j${n}`;
    if (!circuit.components.some((c) => c.id === candidate)) {
      decoyId = candidate;
      break;
    }
  }
  if (!decoyId) return null;

  const node: ComponentInstance = {
    id: decoyId,
    type: junctionType,
    x: slot.x,
    y: slot.y,
    state: {},
  };
  // Split the run in half so the end-to-end length is preserved.
  const half = Math.max(0.3, Math.round((wire.lengthMeters ?? 2) * 5) / 10);
  // Same reasoning as the component id: wire ids surface in the location
  // options ("Wire: X → Y" is built from labels, but ids appear in tooltips
  // and debug output), so the halves are named like ordinary generated wires.
  const inWire: WireInstance = {
    ...wire,
    id: `${wireId}a`,
    controlPoints: [],
    lengthMeters: half,
    toComponentId: decoyId,
    toPortIndex: inPort,
  };
  const outWire: WireInstance = {
    ...wire,
    id: `${wireId}b`,
    controlPoints: [],
    lengthMeters: half,
    fromComponentId: decoyId,
    fromPortIndex: outPort,
  };

  return {
    circuit: {
      ...circuit,
      components: [...circuit.components, node],
      wires: [...circuit.wires.filter((w) => w.id !== wireId), inWire, outWire],
    },
    decoyId,
    addedWireIds: [inWire.id, outWire.id],
  };
}

/**
 * **redHerring** — put an innocent suspect in the learner's way.
 *
 * §26 audit: *allowed*. It is listed verbatim under "Red-herring components".
 * The decoy is a genuine, correctly wired accessory that a real installation
 * would contain, it is fully simulated, and it is never the fault. The learner
 * wastes time ruling it out, which is exactly what fault-finding on a real
 * board feels like — and the "...oh, that actually makes electrical sense"
 * beat §26 asks for lands because the herring really is just a connector.
 */
const redHerring: RageModifier = {
  id: 'redHerring',
  label: 'Red herring',
  description:
    'Splices an innocent junction accessory into the run — a real suspect that is never the fault.',
  implemented: true,

  transformCircuit(input: RageCircuitInput, ctx: RageContext): RageCircuitPatch | null {
    const { circuit, scenario } = input;

    // Only splice into wires the recipe already nominated as meaningful, and
    // only where both ends are known devices.
    const eligible = circuit.wires
      .filter((w) => scenario.faultCandidateWireIds.includes(w.id))
      .map((w) => w.id)
      .sort();
    if (eligible.length === 0) return null;

    // Deterministic order, then take the first that actually splices.
    for (const wireId of ctx.rng.shuffle(eligible)) {
      const type = ctx.rng.pick(DECOY_TYPES);
      const spliced = spliceJunction(circuit, wireId, type);
      if (!spliced) continue;

      const label = COMPONENT_DEFS[type]?.label ?? type;
      return {
        circuit: spliced.circuit,
        decoyComponentIds: [spliced.decoyId],
        // The original wire no longer exists; its two halves take its place as
        // fault candidates so the scenario cannot reference a dead id.
        faultCandidateWireIds: [
          ...scenario.faultCandidateWireIds.filter((id) => id !== wireId),
          ...spliced.addedWireIds,
        ],
        note: `spliced a ${label} into ${wireId}`,
      };
    }
    return null;
  },
};

// ---------------------------------------------------------------------------
// remoteFault — put the cause a long way from the effect
// ---------------------------------------------------------------------------

/**
 * Hop distance from each component to the nearest declared load.
 *
 * Breadth-first over the wire graph. Used to score how "remote" a candidate
 * is: a fault on the supply tails is several hops from the bulb that went out,
 * whereas a fault on the load's own terminal is zero hops away.
 */
function hopsToNearestLoad(
  circuit: Circuit,
  loadComponentIds: readonly string[],
): Map<string, number> {
  const adjacency = new Map<string, string[]>();
  for (const wire of circuit.wires) {
    const a = wire.fromComponentId;
    const b = wire.toComponentId;
    (adjacency.get(a) ?? adjacency.set(a, []).get(a)!).push(b);
    (adjacency.get(b) ?? adjacency.set(b, []).get(b)!).push(a);
  }

  const distance = new Map<string, number>();
  const queue: string[] = [];
  for (const id of loadComponentIds) {
    if (circuit.components.some((c) => c.id === id)) {
      distance.set(id, 0);
      queue.push(id);
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]!;
    const d = distance.get(current)!;
    for (const next of adjacency.get(current) ?? []) {
      if (distance.has(next)) continue;
      distance.set(next, d + 1);
      queue.push(next);
    }
  }
  return distance;
}

/** How far from the symptom does this candidate sit? */
function candidateDistance(
  circuit: Circuit,
  candidate: FaultCandidate,
  distance: ReadonlyMap<string, number>,
): number {
  const at = (id: string) => distance.get(id) ?? Number.POSITIVE_INFINITY;
  const target = candidate.target;
  if (target.type === 'wire') {
    // Hoisted: TS does not carry the discriminated-union narrowing into the
    // `.find` callback, because `candidate.target` is a mutable property path.
    const wireId = target.id;
    const wire = circuit.wires.find((w) => w.id === wireId);
    if (!wire) return 0;
    // A wire is as far away as its *nearer* end — that is the shortest route a
    // learner tracing back from the dead load would take.
    return Math.min(at(wire.fromComponentId), at(wire.toComponentId));
  }
  if (target.type === 'component') return at(target.id);
  return at(target.componentId);
}

/**
 * **remoteFault** — the fault is nowhere near the thing that stopped working.
 *
 * §26 audit: *allowed*. It is listed verbatim under "Fault farther from
 * symptom". Nothing about the fault or the simulation changes; this modifier
 * only re-ranks which of the already-eligible candidates gets chosen. The
 * symptom is still measured honestly from the simulator afterwards.
 *
 * This is also the first consumer of `DifficultyProfile.maxFaultDistanceFromSymptom`,
 * which Phase A declared and deliberately left unread — beginner 1, intermediate
 * 3, advanced 6. Rage respects that ceiling rather than ignoring it: even in
 * Ohmageddon a beginner circuit stays traceable.
 */
const remoteFault: RageModifier = {
  id: 'remoteFault',
  label: 'Remote fault',
  description: 'Chooses a fault as far from the visible symptom as the difficulty allows.',
  implemented: true,

  rankCandidates(input: RageCandidateInput, ctx: RageContext): RageCandidatePatch | null {
    const { circuit, candidates, loadComponentIds } = input;
    if (candidates.length < 2) return null;

    const distance = hopsToNearestLoad(circuit, loadComponentIds);
    const ceiling = ctx.profile.maxFaultDistanceFromSymptom;

    const scored = candidates.map((candidate) => ({
      candidate,
      // Respect the difficulty ceiling: past it, extra distance stops helping.
      distance: Math.min(candidateDistance(circuit, candidate, distance), ceiling),
    }));

    const best = Math.max(...scored.map((s) => s.distance));
    if (best <= 0) return null;

    // Keep only the most distant band, so selection still has variety within
    // it and the placement weighting in `selectFaultCandidate` still applies.
    const remote = scored.filter((s) => s.distance === best).map((s) => s.candidate);
    if (remote.length === 0 || remote.length === candidates.length) return null;

    return {
      candidates: remote,
      note: `restricted to ${remote.length} candidate(s) ${best} hop(s) from the symptom`,
    };
  },
};

// ---------------------------------------------------------------------------
// multiFault — two independent things wrong at once
// ---------------------------------------------------------------------------

/**
 * The location key a candidate would occupy, mirroring `locationKeyFor`.
 *
 * Duplicated here as a three-line local rather than imported from
 * `diagnosis/scenario.ts`, because `rage/**` must not depend on the diagnosis
 * layer that consumes it — the dependency runs one way, and the runner
 * re-checks the same property anyway. If the key format ever changes, the
 * runner's own de-duplication still holds the invariant.
 */
function locationKeyOf(candidate: FaultCandidate): string {
  const target = candidate.target;
  if (target.type === 'port') return `port:${target.componentId}:${target.portIndex}`;
  return `${target.type}:${target.id}`;
}

/** Components a candidate physically touches — both ends, for a wire. */
function touchedComponentIds(circuit: Circuit, candidate: FaultCandidate): string[] {
  const target = candidate.target;
  if (target.type === 'component') return [target.id];
  if (target.type === 'port') return [target.componentId];
  // Hoisted for the same narrowing reason as `candidateDistance`.
  const wireId = target.id;
  const wire = circuit.wires.find((w) => w.id === wireId);
  return wire ? [wire.fromComponentId, wire.toComponentId] : [];
}

/**
 * **multiFault** — two independent faults in one installation.
 *
 * §26 audit: *allowed*, and listed verbatim under "Multiple faults". Nothing
 * about either fault is fabricated: both are ordinary candidates from the
 * ordinary eligibility list, both are really injected, and the symptom the
 * learner sees is still measured by the simulator from the circuit that
 * actually contains them. The difficulty comes from the search, not from a
 * lie — the learner finds one fault, repairs it, and the installation is
 * *still* wrong.
 *
 * Two rules make it a fair puzzle rather than a trap:
 *
 * 1. **Separation.** The second fault must not share a component with the
 *    first. Two faults on the same wire — or on a wire and the terminal it
 *    lands on — read as one defect, so the learner who correctly repairs
 *    "that connection" is told they are wrong for a distinction they cannot
 *    see. The scenario builder additionally requires distinct location keys;
 *    this goes further and requires distinct *devices*.
 *
 * 2. **Independent observability.** This modifier only *proposes*. Every
 *    proposed fault is then driven through §12's solo-observability gate in
 *    `tryBuildScenario` exactly like the first one, and a scenario whose
 *    second fault is masked by the first is rejected outright rather than
 *    shipped. That is why the proposal is a list, in preference order: the
 *    runner takes the first that survives.
 *
 * Only one extra fault is proposed. §27 asks for "2 faults" at Rage 3 and
 * Rage 4, not "as many as fit", and each additional fault multiplies the
 * chance that the combined symptom masks one of them.
 */
const multiFault: RageModifier = {
  id: 'multiFault',
  label: 'Multiple faults',
  description: 'Two independent faults in one installation — fixing one is not enough.',
  implemented: true,

  selectFaults(input: RageSelectionInput, ctx: RageContext): RageSelectionPatch | null {
    const { circuit, candidates, pool, selected } = input;
    if (selected.length === 0) return null;

    const takenKeys = new Set(selected.map((c) => candidateKey(c.type, c.target)));
    const takenLocations = new Set(selected.map(locationKeyOf));
    const takenComponents = new Set(selected.flatMap((c) => touchedComponentIds(circuit, c)));

    const separable = (candidate: FaultCandidate): boolean => {
      if (takenKeys.has(candidateKey(candidate.type, candidate.target))) return false;
      if (takenLocations.has(locationKeyOf(candidate))) return false;
      // Rule 1: no shared device with an already-selected fault.
      return !touchedComponentIds(circuit, candidate).some((id) => takenComponents.has(id));
    };

    // Prefer the ranked pool — a second fault that is *also* remote makes a
    // better Rage 3 — but fall back to the full eligible set, because
    // `remoteFault` narrows to one distance band and a band is typically a
    // cluster of wires around a single node, none of them separable from the
    // first fault. Without the fallback the two modifiers cancel out and
    // Rage 3 quietly ships one fault. (Measured: 0 of 8 seeds produced a
    // second fault from the ranked pool alone.)
    const fromRanked = candidates.filter(separable);
    const eligible = fromRanked.length > 0 ? fromRanked : pool.filter(separable);
    if (eligible.length === 0) return null;

    // Prefer a *different kind* of fault. Two open-circuits read as one
    // repeated mistake; an open circuit plus a jammed breaker reads as an
    // installation with two genuinely different problems, which is the
    // §27 intent and also stops the fault-type choice list from collapsing.
    const takenTypes = new Set(selected.map((c) => c.type));
    const distinctType = eligible.filter((c) => !takenTypes.has(c.type));
    const preferred = distinctType.length > 0 ? distinctType : eligible;

    // Ordered, not single: the runner tries these in turn and keeps the first
    // that clears §12's solo-observability gate, so a masked candidate costs
    // an attempt rather than the whole scenario.
    const ordered = ctx.rng.shuffle([...preferred]);

    return {
      additional: ordered,
      note: `proposed ${ordered.length} second-fault candidate(s) from the ${
        fromRanked.length > 0 ? 'ranked' : 'full'
      } pool, ${distinctType.length} of a different type`,
    };
  },
};

// ---------------------------------------------------------------------------
// limitedHints — ration the safety net
// ---------------------------------------------------------------------------

/**
 * **limitedHints** — fewer hints, and never the one that gives it away.
 *
 * §26 audit: *allowed*. Listed verbatim under "Fewer hints". It withholds
 * assistance; it does not misinform. The remaining hints are the *same*
 * truthful hints a normal scenario would show, just fewer of them, and the
 * level-3 "location" hint — the one that names the target — is the first to go.
 *
 * At least one hint always survives. A scenario with zero hints and a remote
 * fault is not difficult, it is a brick wall, and §26's goal is rage at the
 * circuit rather than at the app.
 */
const limitedHints: RageModifier = {
  id: 'limitedHints',
  label: 'Limited hints',
  description: 'Withholds the later hints — including the one that names the location.',
  implemented: true,

  adjustPresentation(input: RagePresentation, ctx: RageContext): RagePresentation | null {
    if (input.hints.length <= 1) return null;

    // Rage 2 halves the ladder; Rage 3+ keeps only the opening observation.
    const keep = ctx.tier === 'rage-2' ? Math.max(1, input.hints.length - 1) : 1;
    if (keep >= input.hints.length) return null;

    return {
      ...input,
      hints: input.hints.slice(0, keep),
      hintBudget: Math.min(input.hintBudget, keep),
    };
  },
};

// ---------------------------------------------------------------------------
// Declared but not yet implemented (plan §25 closing rule, §53 Phase F)
// ---------------------------------------------------------------------------

/**
 * The remaining §25 names.
 *
 * Each is declared so the vocabulary is complete and the tier tables type-check,
 * and each is `implemented: false` so {@link applyRageModifiers} refuses to run
 * it. The reason each one is deferred is recorded here rather than in a
 * separate document, because the reason is a *technical* constraint discovered
 * in Phases B–D, not a scheduling choice:
 *
 *   - `compoundFault` — needs two faults that *interact*, so that clearing one
 *     changes what the other looks like. `multiFault` deliberately picks two
 *     faults that do NOT share a device, which is the opposite property;
 *     shipping an interacting pair additionally requires proving the second
 *     symptom is still observable after the first repair, at build time. §53
 *     item 6.
 *   - `misleadingSymptom` — must be achieved by *selecting* a fault whose true
 *     symptom misleads (e.g. a fault upstream that kills a downstream load),
 *     never by rewriting symptom text, which §26 explicitly forbids. That
 *     requires a symptom-scoring pass over candidates.
 *   - `timeLimit` — §27 puts it in Rage 4 and §53 says "optional timer only
 *     after the above are stable". The presentation hook already carries
 *     `timeLimitSeconds`, so it lands without an interface change.
 */
const notYetImplemented: RageModifier[] = [
  {
    id: 'misleadingSymptom',
    label: 'Misleading symptom',
    description: 'A fault whose honest symptom points somewhere unhelpful.',
    implemented: false,
  },
  {
    id: 'compoundFault',
    label: 'Compound fault',
    description: 'Faults that interact, so clearing one changes what the other looks like.',
    implemented: false,
  },
  {
    id: 'timeLimit',
    label: 'Time limit',
    description: 'A countdown on the exercise.',
    implemented: false,
  },
];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const RAGE_MODIFIERS: Record<RageModifierId, RageModifier> = {
  redHerring,
  remoteFault,
  multiFault,
  limitedHints,
  ...Object.fromEntries(notYetImplemented.map((m) => [m.id, m])),
} as Record<RageModifierId, RageModifier>;

export function getRageModifier(id: RageModifierId): RageModifier {
  const modifier = RAGE_MODIFIERS[id];
  if (!modifier) throw new Error(`Unknown rage modifier: ${id}`);
  return modifier;
}

/** The modifiers that are actually live. Used by tests and the stress harness. */
export function implementedRageModifiers(): RageModifier[] {
  return Object.values(RAGE_MODIFIERS).filter((m) => m.implemented);
}
