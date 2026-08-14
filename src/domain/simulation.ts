/**
 * Simulation engine — pure function that takes a `Circuit` and returns a
 * `SimulationResult`. No React, no DOM, no side effects.
 *
 * Algorithmic outline (faithful to the legacy `runSimulation` in
 * `App.legacy.tsx:363-501`, but indexed for O(1) lookups instead of the
 * legacy O(n²) `array.find()` calls):
 *
 *   1. Index components by id and wires by their port endpoints.
 *   2. Locate Live and Neutral source terminals.
 *   3. Run two BFS traversals (one from Live, one from Neutral). Each visits
 *      `(componentId, portIndex)` pairs. Wires are physical conductors, so a
 *      rail crosses them even when a malformed/imported circuit joins unlike
 *      port types; component bodies keep their declared channels separate.
 *   4. A *load* is "energised" iff it was reached by BOTH the Live and Neutral
 *      traversals (loads break the chain — no further propagation past them).
 *   5. A *switch* with `state.on === false` blocks propagation past its body
 *      (the entry port is still visited, but no exit ports are queued).
 *   6. Short-circuit detection: any physical wire or terminal reached by both
 *      traversals belongs to a zero-impedance Live-to-Neutral path.
 *
 * Performance:
 *   - Indexed lookups → main loop is O(V + E) on the port-graph.
 *   - Targets the Phase-4 SLO of < 8 ms for 200 components / 400 wires
 *     when offloaded to a Web Worker (PLAN.md §2 / §5).
 *
 * This file MUST stay free of React / DOM imports so it can ship into
 * `simulation.worker.ts` (Phase 5) unchanged.
 */

import { COMPONENT_DEFS } from './components';
import { calculateElectricalValues } from './electricalCalculations';
import { FAULT_REGISTRY, normalizeCircuitFaults } from './faults';
import type {
  Circuit,
  ComponentDef,
  ComponentInstance,
  FaultDiagnostic,
  InjectedFault,
  PortType,
  SimulationResult,
  WireInstance,
} from './types';

// ─── Indexed views over a Circuit (rebuilt each tick — cheap) ──────────────

interface CircuitIndex {
  /** componentId → component */
  byId: Map<string, ComponentInstance>;
  /** "compId:portIdx" → wires touching that port (both directions). */
  byPort: Map<string, WireInstance[]>;
  /** wireId → wire */
  wireById: Map<string, WireInstance>;
  /** Normalized active injected faults */
  activeFaults: InjectedFault[];
  faultsByComponent: Map<string, InjectedFault[]>;
  faultsByWire: Map<string, InjectedFault[]>;
  faultsByPort: Map<string, InjectedFault[]>;
}

const portKey = (compId: string, portIdx: number) => `${compId}:${portIdx}`;

function indexCircuit(circuit: Circuit): CircuitIndex {
  const byId = new Map<string, ComponentInstance>();
  for (const c of circuit.components) byId.set(c.id, c);

  const byPort = new Map<string, WireInstance[]>();
  const wireById = new Map<string, WireInstance>();
  const pushAt = (key: string, w: WireInstance) => {
    const list = byPort.get(key);
    if (list) {
      list.push(w);
    } else {
      byPort.set(key, [w]);
    }
  };

  const activeFaults = normalizeCircuitFaults(circuit);
  const faultsByComponent = new Map<string, InjectedFault[]>();
  const faultsByWire = new Map<string, InjectedFault[]>();
  const faultsByPort = new Map<string, InjectedFault[]>();

  for (const f of activeFaults) {
    if (f.target.type === 'component') {
      const list = faultsByComponent.get(f.target.id) ?? [];
      list.push(f);
      faultsByComponent.set(f.target.id, list);
    } else if (f.target.type === 'wire') {
      const list = faultsByWire.get(f.target.id) ?? [];
      list.push(f);
      faultsByWire.set(f.target.id, list);
    } else if (f.target.type === 'port') {
      const key = portKey(f.target.componentId, f.target.portIndex);
      const list = faultsByPort.get(key) ?? [];
      list.push(f);
      faultsByPort.set(key, list);
    }
  }

  for (const w of circuit.wires) {
    wireById.set(w.id, w);
    pushAt(portKey(w.fromComponentId, w.fromPortIndex), w);
    pushAt(portKey(w.toComponentId, w.toPortIndex), w);
  }

  return {
    byId,
    byPort,
    wireById,
    activeFaults,
    faultsByComponent,
    faultsByWire,
    faultsByPort,
  };
}

// ─── BFS traversal of one rail (live OR neutral OR earth) ────────────────────

interface TraversalResult {
  /** Loads (and pass-through components carrying the rail) that were reached. */
  reachedComponents: Set<string>;
  /** Wires that participated in propagation. */
  energisedWires: Set<string>;
  /** "compId:portIdx" of every visited port — used for short-circuit detection. */
  visitedPorts: Set<string>;
}

function traverse(
  startCompId: string,
  startPortIdx: number,
  rail: PortType,
  index: CircuitIndex,
  defs: Record<string, ComponentDef>,
): TraversalResult {
  const reachedComponents = new Set<string>();
  const energisedWires = new Set<string>();
  const visitedPorts = new Set<string>();

  const queue: { compId: string; portIdx: number }[] = [
    { compId: startCompId, portIdx: startPortIdx },
  ];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const head = queue[queueIndex++];
    if (!head) continue;
    const { compId, portIdx } = head;
    const key = portKey(compId, portIdx);
    if (visitedPorts.has(key)) continue;
    visitedPorts.add(key);

    // If this specific port has a terminal disconnection fault, traversal cannot enter/exit through it
    const portFaults = index.faultsByPort.get(key);
    if (portFaults?.some((f) => f.type === 'terminal-disconnect')) {
      continue;
    }

    const comp = index.byId.get(compId);
    if (!comp) continue;
    const def = defs[comp.type];
    if (!def) continue;

    const compFaults = index.faultsByComponent.get(compId) ?? [];
    const hasSwitchedNeutral = compFaults.some((f) => f.type === 'switched-neutral');

    // Switch state check
    let isOff = false;
    if (def.isSwitch === true && !def.changeover) {
      if (hasSwitchedNeutral) {
        // Switched neutral: switch state ONLY controls Neutral path; Live bypasses switch
        isOff = rail === 'neutral' && comp.state.on !== true;
      } else {
        isOff = comp.state.on !== true;
      }
    }

    if (!def.isSource && (def.isLoad || !isOff)) reachedComponents.add(compId);
    if (!def.isLoad && !isOff) {
      for (const internalPortIndex of connectedPortIndices(def, comp, portIdx, rail, index)) {
        queue.push({ compId, portIdx: internalPortIndex });
      }
    }

    // A wire is a physical conductor.
    const wires = index.byPort.get(key);
    if (!wires) continue;
    for (const wire of wires) {
      if (wire.isBusted) continue;

      // Check wire-level faults
      const wireFaults = index.faultsByWire.get(wire.id) ?? [];
      const hasWireOpenCircuit =
        wire.fault === 'open-circuit' || wireFaults.some((f) => f.type === 'open-circuit');
      const hasWireOpenLive = wireFaults.some((f) => f.type === 'open-live');
      const hasWireOpenNeutral = wireFaults.some((f) => f.type === 'open-neutral');
      const hasWireOpenEarth = wireFaults.some((f) => f.type === 'open-earth');

      if (hasWireOpenCircuit) continue;
      if (rail === 'live' && hasWireOpenLive) continue;
      if (rail === 'neutral' && hasWireOpenNeutral) continue;
      if (rail === 'earth' && hasWireOpenEarth) continue;

      const isFromSide = wire.fromComponentId === compId && wire.fromPortIndex === portIdx;
      const next = isFromSide
        ? { compId: wire.toComponentId, portIdx: wire.toPortIndex }
        : { compId: wire.fromComponentId, portIdx: wire.fromPortIndex };

      const nextPortKey = portKey(next.compId, next.portIdx);
      const nextPortFaults = index.faultsByPort.get(nextPortKey);
      if (nextPortFaults?.some((f) => f.type === 'terminal-disconnect')) {
        continue;
      }

      const nextComp = index.byId.get(next.compId);
      const nextDef = nextComp ? defs[nextComp.type] : undefined;
      if (!nextDef?.ports[next.portIdx]) continue;

      energisedWires.add(wire.id);
      queue.push(next);
    }
  }

  return { reachedComponents, energisedWires, visitedPorts };
}

// ─── Public entry point ────────────────────────────────────────────────────

export interface SimulateOptions {
  /** Override the registry (used in tests). Defaults to COMPONENT_DEFS. */
  defs?: Record<string, ComponentDef>;
  /** App mode — 'pro' enables stress testing for overvoltage, overcurrent, and overload. */
  appMode?: 'basic' | 'pro';
}

/** Get cable current carrying capacity in Amps based on cross-section mm² (BS 7671 Table 4D5). */
export function getCableAmpacity(mm2: number): number {
  if (mm2 <= 1.0) return 11;
  if (mm2 <= 1.5) return 16;
  if (mm2 <= 2.5) return 27;
  if (mm2 <= 4.0) return 37;
  if (mm2 <= 6.0) return 47;
  if (mm2 <= 10.0) return 65;
  return 85;
}

/**
 * MCB/RCBO Trip Curve Simulation - IEC 60898-1 Standard
 *
 * Calculates whether a protection device should trip based on:
 * 1. Thermal trip (overload): Inverse time delay for moderate overcurrents (1.13-3×In)
 * 2. Magnetic trip (short-circuit): Instantaneous trip for high fault currents
 *
 * MCB Types define the magnetic trip threshold multiplier:
 * - Type B: 3-5× rated current (domestic lighting, resistive loads)
 * - Type C: 5-10× rated current (motors, transformers, inductive loads)
 * - Type D: 10-20× rated current (heavy industrial, high inrush)
 *
 * @param currentAmps - Actual current flowing through the breaker
 * @param ratedAmps - Breaker rated current (In)
 * @param mcbType - 'B', 'C', or 'D' curve type
 * @param elapsedSeconds - Time current has been flowing at this level
 * @returns Object with trip decision and timing information
 */
export interface TripCurveResult {
  /** Whether the breaker should trip */
  shouldTrip: boolean;
  /** Reason for trip: 'thermal' (overload) or 'magnetic' (short-circuit) */
  tripReason?: 'thermal' | 'magnetic';
  /** Minimum time to trip at this current level (seconds), undefined if no trip */
  timeToTrip?: number;
  /** Multiple of rated current */
  currentMultiple: number;
}

export function calculateMCBTrip(
  currentAmps: number,
  ratedAmps: number,
  mcbType: 'B' | 'C' | 'D' = 'B',
  elapsedSeconds = 0,
): TripCurveResult {
  if (ratedAmps <= 0) {
    return { shouldTrip: false, currentMultiple: 0 };
  }

  const currentMultiple = currentAmps / ratedAmps;

  // No trip below 1.13×In per IEC 60898-1 (conventional non-tripping current)
  if (currentMultiple < 1.13) {
    return { shouldTrip: false, currentMultiple };
  }

  // Determine magnetic trip threshold based on MCB type
  let magneticThreshold: number;
  switch (mcbType) {
    case 'B':
      magneticThreshold = 3; // Trips instantaneously at 3-5×In
      break;
    case 'C':
      magneticThreshold = 5; // Trips instantaneously at 5-10×In
      break;
    case 'D':
      magneticThreshold = 10; // Trips instantaneously at 10-20×In
      break;
    default:
      magneticThreshold = 3;
  }

  // Magnetic trip (instantaneous) for severe overcurrent/short-circuit
  // Upper bound of magnetic range: 5× for B, 10× for C, 20× for D
  let magneticUpper: number;
  switch (mcbType) {
    case 'B':
      magneticUpper = 5;
      break;
    case 'C':
      magneticUpper = 10;
      break;
    case 'D':
      magneticUpper = 20;
      break;
    default:
      magneticUpper = 5;
  }

  if (currentMultiple >= magneticThreshold) {
    // Instantaneous magnetic trip (typically < 100ms)
    // For simplicity, we consider it immediate in simulation ticks
    return {
      shouldTrip: true,
      tripReason: 'magnetic',
      timeToTrip: 0.1, // 100ms typical magnetic trip time
      currentMultiple,
    };
  }

  // Thermal trip (inverse time characteristic) for overloads
  // IEC 60898-1 specifies:
  // - Must NOT trip at 1.13×In within 1 hour (for In ≤ 63A)
  // - Must trip at 1.45×In within 1 hour
  // - Must trip at 2.55×In between 1s and 60s

  // Simplified inverse-time formula: t = k / (I/In)^α - 1
  // Where k and α are calibrated to meet IEC requirements

  // At 1.45×In: must trip within 3600s (1 hour)
  // At 2.55×In: must trip within 1-60s
  // At 3×In: approaching magnetic trip zone

  // Using simplified formula: t = 3600 / ((I/In)^2 - 1) for 1.13× to 3× range
  // This gives approximately correct timing per IEC 60898-1

  const thermalMultiplier = Math.max(0.01, currentMultiple * currentMultiple - 1);
  const timeToTripSeconds = 3600 / thermalMultiplier;

  // Clamp to realistic bounds
  const clampedTimeToTrip = Math.max(0.1, Math.min(3600, timeToTripSeconds));

  // Trip if elapsed time exceeds the required trip time
  const shouldTrip = elapsedSeconds >= clampedTimeToTrip;

  return {
    shouldTrip,
    tripReason: 'thermal',
    timeToTrip: clampedTimeToTrip,
    currentMultiple,
  };
}

/**
 * Calculate RCD/RCBO earth leakage trip based on residual current.
 * Per IEC 61008/61009:
 * - 30mA RCD must trip at 30mA within 300ms
 * - Must trip at 150mA (5×In) within 40ms
 *
 * @param leakageCurrent_mA - Earth leakage current in milliamps
 * @param ratedLeakage_mA - RCD rated residual current (e.g., 30mA)
 * @param elapsedSeconds - Time leakage has been present
 * @returns Whether the RCD should trip
 */
export interface RCDTripResult {
  shouldTrip: boolean;
  leakageMultiple: number;
  timeToTrip?: number;
}

export function calculateRCDTrip(
  leakageCurrent_mA: number,
  ratedLeakage_mA = 30,
  elapsedSeconds = 0,
): RCDTripResult {
  if (ratedLeakage_mA <= 0) {
    return { shouldTrip: false, leakageMultiple: 0 };
  }

  const leakageMultiple = leakageCurrent_mA / ratedLeakage_mA;

  // No trip below 50% of rated leakage (per IEC 61008)
  if (leakageMultiple < 0.5) {
    return { shouldTrip: false, leakageMultiple };
  }

  // At rated current (1.0×In): must trip within 300ms
  // At 5× rated (150mA for 30mA RCD): must trip within 40ms

  let timeToTripSeconds: number;
  if (leakageMultiple >= 5) {
    timeToTripSeconds = 0.04; // 40ms for high leakage
  } else if (leakageMultiple >= 1.0) {
    // Linear interpolation between 1× and 5×
    timeToTripSeconds = 0.3 - (leakageMultiple - 1) * (0.26 / 4);
  } else {
    // Between 0.5× and 1×: longer delay
    timeToTripSeconds = 0.3 + (1 - leakageMultiple) * 0.3;
  }

  const shouldTrip = elapsedSeconds >= timeToTripSeconds;

  return {
    shouldTrip,
    leakageMultiple,
    timeToTrip: timeToTripSeconds,
  };
}

/**
 * Pure simulation: takes a circuit, returns the new world state.
 * Idempotent — calling twice with the same input yields equal output.
 */
export function simulate(circuit: Circuit, options: SimulateOptions = {}): SimulationResult {
  const defs = options.defs ?? COMPONENT_DEFS;

  const energizedComponents = new Set<string>();
  const energizedWires = new Set<string>();
  const errorComponents = new Set<string>();
  const errorWires = new Set<string>();
  const overloadedWires = new Set<string>();
  const bustedWires = new Set<string>();
  const wireHeatRatios: Record<string, number> = {};
  const trippedComponents: {
    id: string;
    label: string;
    reason: string;
    currentAmps: number;
    ratingAmps: number;
  }[] = [];
  const wireMeltEvents: {
    wireId: string;
    currentAmps: number;
    capacityAmps: number;
    cableMm2: number;
  }[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const blownComponents: { id: string; reason: 'overvoltage' | 'overcurrent' | 'overload' }[] = [];
  const wireCalculations: NonNullable<SimulationResult['wireCalculations']> = {};

  // Empty circuit → no-op (legacy returns early).
  if (circuit.components.length === 0) {
    return {
      energizedComponents,
      energizedWires,
      errorComponents,
      errorWires,
      errors,
      warnings,
      blownComponents,
      faultsCleared: true,
    };
  }

  // Pre-check for any blown components
  for (const c of circuit.components) {
    if (c.state.isBlown) {
      errorComponents.add(c.id);
      errors.push(
        `💥 BLOWN COMPONENT: ${defs[c.type]?.label ?? c.type} is damaged (${c.state.blownReason ?? 'overload'}). Repair component to restore flow.`,
      );
    }
  }

  const index = indexCircuit(circuit);

  // Every source terminal is a root.
  const liveSources: ComponentInstance[] = [];
  const neutralSources: ComponentInstance[] = [];
  let supplyVoltage = circuit.globalVoltage ?? 230;

  for (const c of circuit.components) {
    const def = defs[c.type];
    if (!def?.isSource) continue;
    if (def.ports.some((port) => port.type === 'live')) {
      liveSources.push(c);
      if (c.state.customVoltage !== undefined && c.state.customVoltage > 0) {
        supplyVoltage = c.state.customVoltage;
      }
    }
    if (def.ports.some((port) => port.type === 'neutral')) {
      neutralSources.push(c);
    }
  }

  if (liveSources.length === 0) warnings.push('No Live source found.');
  if (neutralSources.length === 0) warnings.push('No Neutral source found.');

  const live = traverseSources(liveSources, 'live', index, defs);
  const neutral = traverseSources(neutralSources, 'neutral', index, defs);

  // A component is marked energised when both rails reach it.
  for (const c of circuit.components) {
    if (live.reachedComponents.has(c.id) && neutral.reachedComponents.has(c.id)) {
      energizedComponents.add(c.id);
    }
  }

  // Wires that carry either rail count as energised for visualisation.
  for (const w of live.energisedWires) energizedWires.add(w);
  for (const w of neutral.energisedWires) energizedWires.add(w);

  const totalLoadAmps = circuit.components.reduce((total, c) => {
    if (!energizedComponents.has(c.id)) return total;
    const def = defs[c.type];
    if (!def?.isLoad) return total;
    const watts = c.state.customPowerWatts ?? def.powerWatts ?? 100;
    return total + watts / Math.max(1, supplyVoltage);
  }, 0);

  // ── Pro Mode Stress Testing: Overvoltage & Overcurrent ──────────────────
  if (options.appMode === 'pro') {
    let totalCircuitAmps = 0;

    // 1. Calculate active load currents & overvoltage checks on energized components
    for (const c of circuit.components) {
      if (!energizedComponents.has(c.id) || c.state.isBlown) continue;
      const def = defs[c.type];
      if (!def) continue;

      // Overvoltage check
      const maxVolts = c.state.customMaxVolts ?? def.maxVolts ?? 250;
      if (supplyVoltage > maxVolts) {
        blownComponents.push({ id: c.id, reason: 'overvoltage' });
        errorComponents.add(c.id);
        errors.push(
          `💥 OVERVOLTAGE EXPLOSION: ${def.label} blew up! Supply (${supplyVoltage}V) exceeds max rating (${maxVolts}V).`,
        );
        continue;
      }

      // Load overcurrent / overload check
      if (def.isLoad) {
        const watts = c.state.customPowerWatts ?? def.powerWatts ?? 100;
        const loadAmps = watts / supplyVoltage;
        totalCircuitAmps += loadAmps;

        const maxAmps = c.state.customMaxAmps ?? def.maxAmps ?? 15;
        if (loadAmps > maxAmps) {
          blownComponents.push({ id: c.id, reason: 'overload' });
          errorComponents.add(c.id);
          errors.push(
            `💥 OVERLOAD BURNOUT: ${def.label} burned out! Load current (${loadAmps.toFixed(1)}A) exceeds max rating (${maxAmps}A).`,
          );
        }
      }
    }

    // 2. Pass-through / protection / wire overcurrent check
    if (totalCircuitAmps > 0) {
      // Determine if active circuit protection devices exist in energized paths
      const activeProtection = circuit.components.filter((c) => {
        if (!energizedComponents.has(c.id) || c.state.isBlown) return false;
        const def = defs[c.type];
        return Boolean(
          def?.isProtection ||
            c.type.includes('mcb') ||
            c.type.includes('rcd') ||
            c.type.includes('rcbo') ||
            c.type.includes('fuse') ||
            c.type.includes('mccb') ||
            c.type.includes('fused-spur'),
        );
      });
      const hasProtection = activeProtection.length > 0;

      for (const c of circuit.components) {
        if (!energizedComponents.has(c.id) || c.state.isBlown) continue;
        const def = defs[c.type];
        if (!def || def.isSource) continue;

        const deviceMaxAmps = c.state.customMaxAmps ?? def.maxAmps ?? 32;
        const cableMm2 = c.state.customCableMm2 ?? def.recommendedCableMm2 ?? 2.5;
        const cableCap = getCableAmpacity(cableMm2);
        const effectiveLimit = Math.min(deviceMaxAmps, cableCap);

        if (
          totalCircuitAmps > effectiveLimit &&
          (def.isProtection || def.isSwitch || def.isPassThrough)
        ) {
          blownComponents.push({ id: c.id, reason: 'overcurrent' });
          errorComponents.add(c.id);
          const reason = `Circuit current (${totalCircuitAmps.toFixed(1)} A) exceeded rated limit (${effectiveLimit} A).`;
          trippedComponents.push({
            id: c.id,
            label: def.label,
            reason,
            currentAmps: totalCircuitAmps,
            ratingAmps: effectiveLimit,
          });
          errors.push(
            `⚡ PROTECTION TRIPPED: ${def.label} tripped! Load current (${totalCircuitAmps.toFixed(1)} A) exceeded capacity (${effectiveLimit} A).`,
          );
        }
      }

      // Check cable current capacity & thermal heating on energised wires
      for (const wire of circuit.wires) {
        if (!energizedWires.has(wire.id)) continue;

        const fromComp = index.byId.get(wire.fromComponentId);
        const toComp = index.byId.get(wire.toComponentId);
        if (!fromComp || !toComp) continue;

        const fromDef = defs[fromComp.type];
        const toDef = defs[toComp.type];

        const fromCable = fromComp.state.customCableMm2 ?? fromDef?.recommendedCableMm2 ?? 2.5;
        const toCable = toComp.state.customCableMm2 ?? toDef?.recommendedCableMm2 ?? 2.5;

        const cableMm2 = Math.min(fromCable, toCable);
        const cableCap = getCableAmpacity(cableMm2);
        const heatRatio = totalCircuitAmps / cableCap;
        wireHeatRatios[wire.id] = heatRatio;

        if (heatRatio > 1.0) {
          overloadedWires.add(wire.id);
          errorWires.add(wire.id);
          errorComponents.add(wire.fromComponentId);
          errorComponents.add(wire.toComponentId);
          warnings.push(
            `⚠️ CABLE OVERLOAD: ${cableMm2} mm² wire carrying ${totalCircuitAmps.toFixed(1)}A exceeds capacity (${cableCap}A max).`,
          );
        }

        // If NO protection device is present in circuit, or current severely exceeds cable ampacity, wire BUSTS & MELTS
        if ((!hasProtection && heatRatio > 1.05) || heatRatio > 1.4) {
          bustedWires.add(wire.id);
          errorWires.add(wire.id);
          wireMeltEvents.push({
            wireId: wire.id,
            currentAmps: totalCircuitAmps,
            capacityAmps: cableCap,
            cableMm2,
          });
          errors.push(
            `🔥 CABLE BUSTED & MELTED: ${cableMm2} mm² wire burned out carrying ${totalCircuitAmps.toFixed(1)} A (Capacity: ${cableCap} A) with NO active circuit protection!`,
          );
        }
      }
    }
  }

  for (const wire of circuit.wires) {
    if (!energizedWires.has(wire.id)) continue;
    const fromComp = index.byId.get(wire.fromComponentId);
    const toComp = index.byId.get(wire.toComponentId);
    if (!fromComp || !toComp) continue;
    const fromDef = defs[fromComp.type];
    const toDef = defs[toComp.type];
    const cableMm2 =
      wire.customCableMm2 ??
      Math.min(
        fromComp.state.customCableMm2 ?? fromDef?.recommendedCableMm2 ?? 2.5,
        toComp.state.customCableMm2 ?? toDef?.recommendedCableMm2 ?? 2.5,
      );
    const calculation = calculateElectricalValues({
      powerWatts: totalLoadAmps * supplyVoltage,
      voltage: supplyVoltage,
      currentAmps: totalLoadAmps,
      cableMm2,
      lengthMeters: wire.lengthMeters,
      deratingFactor: wire.deratingFactor,
    });
    wireCalculations[wire.id] = calculation;
    if (options.appMode === 'pro' && calculation.status === 'warning') {
      warnings.push(`VOLTAGE DROP: Wire ${wire.id} — ${calculation.message}`);
    }
    if (options.appMode === 'pro' && calculation.status === 'fail') {
      overloadedWires.add(wire.id);
      errorWires.add(wire.id);
      warnings.push(`CABLE CAPACITY: Wire ${wire.id} — ${calculation.message}`);
    }
  }

  // ── Short-circuit detection ─────────────────────────────────────────
  // Loads stop each traversal at their terminals, so their normal Live and
  // Neutral feeds remain disjoint. If the traversals overlap on a wire or a
  // terminal, a physical conductor has instead joined the supply rails.
  let hasShortCircuit = false;

  for (const wire of circuit.wires) {
    if (!live.energisedWires.has(wire.id) || !neutral.energisedWires.has(wire.id)) continue;
    hasShortCircuit = true;
    errorWires.add(wire.id);
    errorComponents.add(wire.fromComponentId);
    errorComponents.add(wire.toComponentId);
  }

  for (const c of circuit.components) {
    const def = defs[c.type];
    if (!def) continue;
    for (let portIndex = 0; portIndex < def.ports.length; portIndex++) {
      const key = portKey(c.id, portIndex);
      if (!live.visitedPorts.has(key) || !neutral.visitedPorts.has(key)) continue;
      hasShortCircuit = true;
      errorComponents.add(c.id);
      const wires = index.byPort.get(key);
      if (wires) for (const wire of wires) errorWires.add(wire.id);
    }
  }

  if (hasShortCircuit) {
    errors.push('Short circuit — Live and Neutral are directly connected.');
  }

  // ── Fault Diagnostics & System Simulation ──────────────────────────────────
  const faultDiagnostics: FaultDiagnostic[] = [];
  const activeFaults = index.activeFaults;

  for (const fault of activeFaults) {
    const def = FAULT_REGISTRY[fault.type] ?? {
      id: fault.type,
      label: fault.type,
      category: fault.category,
      severity: 'error',
      description: 'Fault condition detected in circuit.',
      simulationEffect: 'Modifies circuit operation.',
      detectionBehavior: 'Test with electrical meters.',
      repairBehavior: 'Isolate and fix fault condition.',
    };

    const affectedComponents: string[] = [];
    const affectedWires: string[] = [];
    const affectedPorts: { componentId: string; portIndex: number }[] = [];

    if (fault.target.type === 'component') {
      affectedComponents.push(fault.target.id);
      errorComponents.add(fault.target.id);
      const comp = index.byId.get(fault.target.id);
      const cDef = comp ? defs[comp.type] : undefined;
      for (let pi = 0; pi < (cDef?.ports.length ?? 0); pi++) {
        const ws = index.byPort.get(portKey(fault.target.id, pi));
        if (ws) for (const w of ws) errorWires.add(w.id);
      }
    } else if (fault.target.type === 'wire') {
      affectedWires.push(fault.target.id);
      errorWires.add(fault.target.id);
      const wire = index.wireById.get(fault.target.id);
      if (wire) {
        affectedComponents.push(wire.fromComponentId, wire.toComponentId);
        if (fault.type === 'short-circuit') {
          errorComponents.add(wire.fromComponentId);
          errorComponents.add(wire.toComponentId);
        }
      }
    } else if (fault.target.type === 'port') {
      affectedComponents.push(fault.target.componentId);
      affectedPorts.push({
        componentId: fault.target.componentId,
        portIndex: fault.target.portIndex,
      });
      errorComponents.add(fault.target.componentId);
      const ws = index.byPort.get(portKey(fault.target.componentId, fault.target.portIndex));
      if (ws) for (const w of ws) errorWires.add(w.id);
    }

    // Specific category behaviors and messages
    if (fault.type === 'short-circuit') {
      errors.push(`⚡ SHORT CIRCUIT FAULT: Direct short circuit detected on ${def.label}!`);
    } else if (fault.type === 'open-circuit' || fault.type === 'open-live') {
      errors.push(`✂ OPEN CIRCUIT FAULT: Conductor break on ${def.label} — path interrupted.`);
    } else if (fault.type === 'open-neutral') {
      errors.push(
        `⚠ FLOATING NEUTRAL FAULT: Broken neutral return path — voltage reaches load without return!`,
      );
    } else if (fault.type === 'open-earth') {
      warnings.push(`🛡 MISSING CPC / OPEN EARTH: Protective bonding broken on ${def.label}!`);
    } else if (fault.type === 'terminal-disconnect') {
      errors.push(`🔧 TERMINAL DISCONNECT: Loose terminal screw on ${def.label} port!`);
    } else if (fault.type === 'reverse-polarity') {
      errors.push(`↔ REVERSED POLARITY: Live and Neutral conductors reversed (BS 7671 Reg 643.6)!`);
    } else if (fault.type === 'switched-neutral') {
      errors.push(
        `⛔ SWITCHED NEUTRAL HAZARD: Switch cuts Neutral; appliance remains LIVE at 230V when OFF (BS 7671 Reg 132.14 / 537.1)!`,
      );
    } else if (fault.type === 'live-to-earth' || fault.type === 'earth-fault') {
      errors.push(`🔥 EARTH LEAKAGE / FAULT: Insulation breakdown to earth on ${def.label}!`);
      // If RCD or RCBO is present in the circuit, trip it
      for (const c of circuit.components) {
        if (c.type.includes('rcd') || c.type.includes('rcbo')) {
          trippedComponents.push({
            id: c.id,
            label: defs[c.type]?.label ?? c.type,
            reason: 'ground-fault',
            currentAmps: 0.045, // 45mA residual leakage
            ratingAmps: 0.03, // 30mA threshold
          });
          errorComponents.add(c.id);
        }
      }
    } else if (fault.type === 'protection-bypass') {
      warnings.push(`⚡ PROTECTION BYPASS: Overcurrent protection bypassed on ${def.label}!`);
    } else if (fault.type === 'protection-forced-open') {
      warnings.push(`🔒 BREAKER JAMMED OPEN: Device mechanism locked in open state.`);
    }

    faultDiagnostics.push({
      id: `diag_${fault.id}`,
      faultId: fault.id,
      type: fault.type,
      category: def.category,
      severity: def.severity,
      title: def.label,
      description: def.description,
      affectedComponents,
      affectedWires,
      affectedPorts: affectedPorts.length > 0 ? affectedPorts : undefined,
      reason: def.simulationEffect,
      resolutionHint: def.repairBehavior,
      standardReference: def.standardReference,
      isResolved: false,
    });
  }

  // ── Voltage Mismatch Check (110V vs 220-240V mixed system) ──
  const voltagesInUse = new Set<number>();
  for (const c of circuit.components) {
    if (!energizedComponents.has(c.id)) continue;
    const def = defs[c.type];
    if (def?.isLoad) {
      const ratedV = c.state.customMaxVolts ?? def.maxVolts ?? c.state.customVoltage ?? 230;
      if (ratedV <= 130) voltagesInUse.add(110);
      else if (ratedV >= 200) voltagesInUse.add(230);
    }
  }
  if (supplyVoltage >= 200) voltagesInUse.add(230);
  else if (supplyVoltage <= 130) voltagesInUse.add(110);

  if (voltagesInUse.has(110) && voltagesInUse.has(230)) {
    const mismatchMsg = `⚡ VOLTAGE MISMATCH: 110V rated equipment detected on a ${supplyVoltage}V circuit! Incompatible voltage ratings cause severe overvoltage burnout.`;
    errors.push(mismatchMsg);
    for (const c of circuit.components) {
      if (!energizedComponents.has(c.id)) continue;
      const def = defs[c.type];
      const ratedV = c.state.customMaxVolts ?? def?.maxVolts ?? 250;
      if (ratedV <= 130 && supplyVoltage >= 200) {
        errorComponents.add(c.id);
        blownComponents.push({ id: c.id, reason: 'overvoltage' });
      }
    }
  }

  // ── Thermal data computation ──
  const thermalData: Record<
    string,
    {
      powerWatts: number;
      temperature: number;
      maxTemperature: number;
      colorCode: string;
      status: 'normal' | 'warm' | 'hot' | 'critical';
    }
  > = {};

  for (const c of circuit.components) {
    const def = defs[c.type];
    const isEnergized = energizedComponents.has(c.id);
    let pWatts = 0;
    if (isEnergized && !c.state.isBlown && !c.state.isTripped) {
      if (def?.isLoad) {
        pWatts = c.state.customPowerWatts ?? def.powerWatts ?? 60;
      } else if (def?.isSource || c.type.includes('battery')) {
        const chem = c.state.batteryChemistry ?? 'alkaline';
        const rInt = chem === 'lead-acid' ? 0.01 : chem === 'li-ion' ? 0.02 : 0.15;
        pWatts = totalLoadAmps * totalLoadAmps * rInt;
      } else {
        pWatts = totalLoadAmps * totalLoadAmps * 0.02;
      }
    }
    const ambientC = 22;
    const tempC = ambientC + (pWatts > 0 ? Math.min(120, pWatts * 0.5) : 0);
    let colorCode = '#22c55e';
    let status: 'normal' | 'warm' | 'hot' | 'critical' = 'normal';
    if (tempC >= 75 || c.state.isBlown) {
      colorCode = '#ef4444';
      status = 'critical';
    } else if (tempC >= 55) {
      colorCode = '#f97316';
      status = 'hot';
    } else if (tempC >= 38) {
      colorCode = '#eab308';
      status = 'warm';
    }

    thermalData[c.id] = {
      powerWatts: pWatts,
      temperature: tempC,
      maxTemperature: 90,
      colorCode,
      status,
    };
  }

  return {
    energizedComponents,
    energizedWires,
    errorComponents,
    errorWires,
    errors,
    warnings,
    blownComponents: blownComponents.length > 0 ? blownComponents : undefined,
    overloadedWires: overloadedWires.size > 0 ? overloadedWires : undefined,
    supplyVoltage,
    wireHeatRatios: Object.keys(wireHeatRatios).length > 0 ? wireHeatRatios : undefined,
    wireCalculations: Object.keys(wireCalculations).length > 0 ? wireCalculations : undefined,
    bustedWires: bustedWires.size > 0 ? bustedWires : undefined,
    trippedComponents: trippedComponents.length > 0 ? trippedComponents : undefined,
    wireMeltEvents: wireMeltEvents.length > 0 ? wireMeltEvents : undefined,
    faultDiagnostics: faultDiagnostics.length > 0 ? faultDiagnostics : undefined,
    activeInjectedFaults: activeFaults.length > 0 ? activeFaults : undefined,
    faultsCleared: errors.length === 0,
    thermalData,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function emptyTraversal(): TraversalResult {
  return {
    reachedComponents: new Set(),
    energisedWires: new Set(),
    visitedPorts: new Set(),
  };
}

/** Return the ports internally connected to an entry port for this state. */
function connectedPortIndices(
  def: ComponentDef,
  comp: ComponentInstance,
  entryPortIndex: number,
  rail?: PortType,
  index?: CircuitIndex,
): number[] {
  const compFaults = index?.faultsByComponent.get(comp.id) ?? [];
  const hasBypass = compFaults.some((f) => f.type === 'protection-bypass');
  const hasForcedOpen = compFaults.some((f) => f.type === 'protection-forced-open');
  const hasOpenCircuit =
    comp.state.fault === 'open-circuit' || compFaults.some((f) => f.type === 'open-circuit');
  const hasOpenLive = compFaults.some((f) => f.type === 'open-live');
  const hasOpenNeutral = compFaults.some((f) => f.type === 'open-neutral');
  const hasShortCircuit =
    comp.state.fault === 'short-circuit' || compFaults.some((f) => f.type === 'short-circuit');

  if (hasForcedOpen) {
    return [];
  }

  if (hasOpenCircuit) {
    return [];
  }

  if (rail === 'live' && hasOpenLive) {
    return [];
  }

  if (rail === 'neutral' && hasOpenNeutral) {
    return [];
  }

  if ((comp.state.isBlown || comp.state.isTripped) && !hasBypass) {
    return [];
  }

  if (hasShortCircuit) {
    // Injected internal short circuit bridges all terminals together
    return def.ports.map((_, i) => i).filter((i) => i !== entryPortIndex);
  }

  const changeover = def.changeover;
  if (changeover) {
    const selectedPortIndex =
      comp.state.on === true ? changeover.onPortIndex : changeover.offPortIndex;
    if (entryPortIndex === changeover.commonPortIndex) return [selectedPortIndex];
    if (entryPortIndex === selectedPortIndex) return [changeover.commonPortIndex];
    return [];
  }

  const entryPortType = def.ports[entryPortIndex]?.type;
  if (!entryPortType) return [];

  const connected: number[] = [];
  for (let i = 0; i < def.ports.length; i++) {
    if (i === entryPortIndex) continue;
    if (def.ports[i]!.type !== entryPortType) continue;
    connected.push(i);
  }
  return connected;
}

/** Traverse every source for one rail and union the resulting graph sets. */
function traverseSources(
  sources: ComponentInstance[],
  rail: PortType,
  index: CircuitIndex,
  defs: Record<string, ComponentDef>,
): TraversalResult {
  const merged = emptyTraversal();
  for (const source of sources) {
    const def = defs[source.type];
    const startPortIndex = def?.ports.findIndex((port) => port.type === rail) ?? -1;
    if (startPortIndex < 0) continue;
    const result = traverse(source.id, startPortIndex, rail, index, defs);
    for (const id of result.reachedComponents) merged.reachedComponents.add(id);
    for (const id of result.energisedWires) merged.energisedWires.add(id);
    for (const key of result.visitedPorts) merged.visitedPorts.add(key);
  }
  return merged;
}
