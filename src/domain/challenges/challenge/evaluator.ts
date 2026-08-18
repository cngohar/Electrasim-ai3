/**
 * Challenge evaluation (plan §1.2, Phase C steps 6–8).
 *
 * "Compare/validate the user's circuit against the target" and "reuse
 * existing electrical rules and simulator".
 *
 * A submission passes four gates, cheapest first — the same discipline the
 * generator's own validator uses, so a learner can never "win" with a circuit
 * the generator itself would have rejected:
 *
 *   1. structure  — every wire lands on a real component + port.
 *   2. rules      — `validateCircuitRules()` reports no errors.
 *   3. simulation — `simulate()` runs clean and the expected loads light up.
 *   4. match      — the labelled graph matches the target (comparison.ts).
 *
 * Gates 1–3 are the *electrical* verdict: they are what makes a circuit
 * genuinely correct. Gate 4 is the *exercise* verdict: it is what makes it
 * the circuit that was asked for. Both must hold to complete a challenge.
 *
 * Pure: no store access, no persistence, no timers.
 */

import { COMPONENT_DEFS } from '../../components';
import { validateCircuitRules } from '../../electrical/validation';
import { simulate } from '../../simulation';
import type { Circuit, SimulationResult } from '../../types';
import { type CircuitComparison, compareCircuits } from './comparison';
import type { ChallengeScenario } from './scenario';

/** Which gate a submission stopped at. */
export type EvaluationStage = 'structure' | 'rules' | 'simulation' | 'match' | 'complete';

export interface EvaluationIssue {
  stage: Exclude<EvaluationStage, 'complete'>;
  message: string;
  /** Component/wire ids the UI can highlight. */
  targetIds?: string[];
}

export interface ChallengeEvaluation {
  /** True only when every gate passed. */
  success: boolean;
  /** The first gate that failed, or `'complete'`. */
  stage: EvaluationStage;
  issues: EvaluationIssue[];
  /** Structural diff — always computed, drives the checklist + hints. */
  comparison: CircuitComparison;
  /** Simulation of the user's circuit, when gate 3 was reached. */
  simulation: SimulationResult | null;
  /** Loads the scenario expects to be live that currently are not. */
  unenergisedLoadTypes: string[];
  /** 0..1 progress for the objective meter. */
  completion: number;
  /** Short, human summary for the status line. */
  summary: string;
}

export interface EvaluateOptions {
  /** App mode for the simulator. Defaults to `'pro'` (strictest). */
  appMode?: 'basic' | 'pro';
}

// ── Gate 1: structure ──────────────────────────────────────────────────────

function evaluateStructure(circuit: Circuit): EvaluationIssue[] {
  const issues: EvaluationIssue[] = [];
  const byId = new Map(circuit.components.map((c) => [c.id, c]));

  for (const wire of circuit.wires) {
    const from = byId.get(wire.fromComponentId);
    const to = byId.get(wire.toComponentId);
    if (!from || !to) {
      issues.push({
        stage: 'structure',
        message: 'A wire is not connected at both ends.',
        targetIds: [wire.id],
      });
      continue;
    }
    const fromPorts = COMPONENT_DEFS[from.type]?.ports.length ?? 0;
    const toPorts = COMPONENT_DEFS[to.type]?.ports.length ?? 0;
    if (wire.fromPortIndex >= fromPorts || wire.toPortIndex >= toPorts) {
      issues.push({
        stage: 'structure',
        message: 'A wire references a terminal that does not exist.',
        targetIds: [wire.id],
      });
    }
    if (wire.fromComponentId === wire.toComponentId) {
      issues.push({
        stage: 'structure',
        message: 'A wire loops back into the same component.',
        targetIds: [wire.id],
      });
    }
  }
  return issues;
}

// ── Gate 2: existing electrical rules ──────────────────────────────────────

function evaluateRules(circuit: Circuit): EvaluationIssue[] {
  return validateCircuitRules(circuit, 'basic')
    .filter((diagnostic) => diagnostic.severity === 'error')
    .map((diagnostic) => ({
      stage: 'rules' as const,
      message: diagnostic.message,
      targetIds: [diagnostic.sourceComponentId, diagnostic.targetComponentId].filter(Boolean),
    }));
}

// ── Gate 3: the existing simulator ─────────────────────────────────────────

interface SimulationVerdict {
  issues: EvaluationIssue[];
  result: SimulationResult;
  unenergisedLoadTypes: string[];
}

/**
 * Which component types the scenario expects to be energised. Expressed as
 * types because the learner's component ids differ from the target's.
 */
function expectedLoadTypes(scenario: ChallengeScenario): string[] {
  const typeById = new Map(scenario.targetCircuit.components.map((c) => [c.id, c.type]));
  return scenario.expectedEnergisedLoadIds
    .map((id) => typeById.get(id))
    .filter((type): type is string => Boolean(type));
}

function evaluateSimulation(
  circuit: Circuit,
  scenario: ChallengeScenario,
  comparison: CircuitComparison,
  appMode: 'basic' | 'pro',
): SimulationVerdict {
  const result = simulate(circuit, { appMode });
  const issues: EvaluationIssue[] = [];

  for (const error of result.errors) {
    issues.push({ stage: 'simulation', message: error });
  }
  const blown = result.blownComponents ?? [];
  if (blown.length > 0) {
    issues.push({
      stage: 'simulation',
      message: 'A component has been damaged by the way it is wired.',
      targetIds: blown.map((entry) => entry.id),
    });
  }
  const tripped = result.trippedComponents ?? [];
  if (tripped.length > 0) {
    issues.push({
      stage: 'simulation',
      message: 'A protective device has tripped — the circuit is not stable.',
      targetIds: tripped.map((entry) => entry.id),
    });
  }
  const busted = [...(result.bustedWires ?? [])];
  const overloaded = [...(result.overloadedWires ?? [])];
  if (busted.length > 0 || overloaded.length > 0) {
    issues.push({
      stage: 'simulation',
      message: 'A cable is overloaded for its size.',
      targetIds: [...busted, ...overloaded],
    });
  }

  // Expected loads must actually be live. When the graph already matches the
  // target we can check the exact mapped ids; otherwise fall back to "at
  // least this many of each load type are energised", which is the strongest
  // statement available without a bijection.
  const energised = new Set(result.energizedComponents);
  const unenergisedLoadTypes: string[] = [];

  if (comparison.mapping) {
    for (const targetId of scenario.expectedEnergisedLoadIds) {
      const userId = comparison.mapping[targetId];
      if (!userId || !energised.has(userId)) {
        const type = scenario.targetCircuit.components.find((c) => c.id === targetId)?.type;
        if (type) unenergisedLoadTypes.push(type);
      }
    }
  } else {
    const wanted = new Map<string, number>();
    for (const type of expectedLoadTypes(scenario)) {
      wanted.set(type, (wanted.get(type) ?? 0) + 1);
    }
    for (const [type, count] of wanted) {
      const live = circuit.components.filter(
        (component) => component.type === type && energised.has(component.id),
      ).length;
      for (let i = live; i < count; i += 1) unenergisedLoadTypes.push(type);
    }
  }

  if (unenergisedLoadTypes.length > 0) {
    const labels = [
      ...new Set(unenergisedLoadTypes.map((type) => COMPONENT_DEFS[type]?.label ?? type)),
    ];
    issues.push({
      stage: 'simulation',
      message: `Not powered: ${labels.join(', ')}. Check the live and neutral paths.`,
    });
  }

  return { issues, result, unenergisedLoadTypes };
}

// ── Gate 4: match against the target ───────────────────────────────────────

function matchIssues(comparison: CircuitComparison): EvaluationIssue[] {
  const issues: EvaluationIssue[] = [];

  for (const entry of comparison.missingComponents) {
    issues.push({
      stage: 'match',
      message: `Add ${entry.required - entry.present} more ${entry.label}.`,
    });
  }
  for (const entry of comparison.extraComponents) {
    issues.push({
      stage: 'match',
      message: `Remove ${entry.present - entry.required} ${entry.label} — the target circuit does not use ${entry.required === 0 ? 'one' : 'that many'}.`,
    });
  }
  for (const entry of comparison.missingConnections) {
    issues.push({
      stage: 'match',
      message: `Missing connection: ${entry.description}.`,
    });
  }
  for (const entry of comparison.extraConnections) {
    issues.push({
      stage: 'match',
      message: `Unexpected connection: ${entry.description}.`,
    });
  }
  if (issues.length === 0 && !comparison.isomorphic) {
    // Same parts, same connection types, wired to the wrong instances.
    issues.push({
      stage: 'match',
      message: comparison.searchExhausted
        ? 'This circuit is too tangled to check automatically — simplify the wiring.'
        : 'All the right parts and joins are present, but they are wired to the wrong ones. Trace each branch from the supply.',
    });
  }
  return issues;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Evaluate a learner's circuit against a scenario.
 *
 * Gates run in order; the first failing gate sets `stage`, but issues from
 * that gate are all reported so the learner sees the whole picture at that
 * level rather than one error at a time.
 */
export function evaluateChallenge(
  scenario: ChallengeScenario,
  userCircuit: Circuit,
  options: EvaluateOptions = {},
): ChallengeEvaluation {
  const appMode = options.appMode ?? 'pro';
  const comparison = compareCircuits(scenario.targetCircuit, userCircuit);

  const base = {
    comparison,
    completion: comparison.completion,
  };

  if (userCircuit.components.length === 0) {
    return {
      ...base,
      success: false,
      stage: 'structure',
      issues: [{ stage: 'structure', message: 'The canvas is empty — start building.' }],
      simulation: null,
      unenergisedLoadTypes: [],
      completion: 0,
      summary: 'Nothing built yet.',
    };
  }

  const structureIssues = evaluateStructure(userCircuit);
  if (structureIssues.length > 0) {
    return {
      ...base,
      success: false,
      stage: 'structure',
      issues: structureIssues,
      simulation: null,
      unenergisedLoadTypes: [],
      summary: 'Some wires are not properly connected.',
    };
  }

  const ruleIssues = evaluateRules(userCircuit);
  if (ruleIssues.length > 0) {
    return {
      ...base,
      success: false,
      stage: 'rules',
      issues: ruleIssues,
      simulation: null,
      unenergisedLoadTypes: [],
      summary: 'The wiring breaks an electrical rule.',
    };
  }

  const simulation = evaluateSimulation(userCircuit, scenario, comparison, appMode);
  if (simulation.issues.length > 0) {
    return {
      ...base,
      success: false,
      stage: 'simulation',
      issues: simulation.issues,
      simulation: simulation.result,
      unenergisedLoadTypes: simulation.unenergisedLoadTypes,
      summary: 'The circuit is safe but it does not work correctly yet.',
    };
  }

  const mismatch = matchIssues(comparison);
  if (mismatch.length > 0) {
    return {
      ...base,
      success: false,
      stage: 'match',
      issues: mismatch,
      simulation: simulation.result,
      unenergisedLoadTypes: [],
      summary: 'It works, but it is not the circuit the brief asked for.',
    };
  }

  return {
    ...base,
    success: true,
    stage: 'complete',
    issues: [],
    simulation: simulation.result,
    unenergisedLoadTypes: [],
    completion: 1,
    summary: 'Circuit complete and working correctly.',
  };
}
