/**
 * Simulation engine — pure function that takes a `Circuit` and returns a
 * `SimulationResult`. No React, no DOM, no side effects.
 *
 * Split verbatim from the former monolithic `simulation.ts`; the engine
 * body and option contract are unchanged.
 */

import { COMPONENT_DEFS } from '../components';
import { calculateElectricalValues } from '../electricalCalculations';
import { FAULT_REGISTRY } from '../faults';
import type {
  Circuit,
  ComponentDef,
  ComponentInstance,
  FaultDiagnostic,
  SimulationResult,
} from '../types';
import { indexCircuit, portKey } from './indexing';
import { traverseSources } from './traversal';
import { getCableAmpacity } from './tripCurves';

// ─── Public entry point ────────────────────────────────────────────────────

export interface SimulateOptions {
  /** Override the registry (used in tests). Defaults to COMPONENT_DEFS. */
  defs?: Record<string, ComponentDef>;
  /** App mode — 'pro' enables stress testing for overvoltage, overcurrent, and overload. */
  appMode?: 'basic' | 'pro';
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
        '⚠ FLOATING NEUTRAL FAULT: Broken neutral return path — voltage reaches load without return!',
      );
    } else if (fault.type === 'open-earth') {
      warnings.push(`🛡 MISSING CPC / OPEN EARTH: Protective bonding broken on ${def.label}!`);
    } else if (fault.type === 'terminal-disconnect') {
      errors.push(`🔧 TERMINAL DISCONNECT: Loose terminal screw on ${def.label} port!`);
    } else if (fault.type === 'reverse-polarity') {
      errors.push('↔ REVERSED POLARITY: Live and Neutral conductors reversed (BS 7671 Reg 643.6)!');
    } else if (fault.type === 'switched-neutral') {
      errors.push(
        '⛔ SWITCHED NEUTRAL HAZARD: Switch cuts Neutral; appliance remains LIVE at 230V when OFF (BS 7671 Reg 132.14 / 537.1)!',
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
      warnings.push('🔒 BREAKER JAMMED OPEN: Device mechanism locked in open state.');
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
