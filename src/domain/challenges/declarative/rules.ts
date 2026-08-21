/**
 * Challenge rules (plan §6, §8).
 *
 * Each rule answers ONE concrete question about the learner's circuit, in
 * plain English, judged against the real circuit model. Connection rules use
 * the wiring graph; functional rules run the REAL simulator with evidence
 * states (plan §8 "Interaction Evidence": static topology alone is not
 * sufficient to prove momentary behaviour).
 *
 * Verdicts: pass / incomplete (build it) / fail (contradictory or unsafe).
 */

import { COMPONENT_DEFS } from '../../components';
import { simulate } from '../../simulation';
import type { Circuit, FaultType } from '../../types';
import {
  type CircuitGraph,
  componentsOfType,
  hasDirectConnection,
  hasRailPath,
  hasRailPathExclusivelyThrough,
} from './graph';

export type RuleVerdict = 'pass' | 'incomplete' | 'fail';

export interface RuleResult {
  /** Stable rule key — never a raw component id (plan §9). */
  id: string;
  /** The concrete question, answered in plain English. */
  label: string;
  verdict: RuleVerdict;
  /** Human reason when not passing. */
  reason?: string;
}

export interface RuleContext {
  graph: CircuitGraph;
  circuit: Circuit;
  starter: Circuit;
}

export interface Rule {
  id: string;
  label: string;
  evaluate: (ctx: RuleContext) => RuleResult;
}

function rule(
  id: string,
  label: string,
  evaluate: (ctx: RuleContext) => { verdict: RuleVerdict; reason?: string },
): Rule {
  return { id, label, evaluate: (ctx) => ({ id, label, ...evaluate(ctx) }) };
}

/** Build a circuit variant with the given momentary presses applied. */
function withPresses(circuit: Circuit, pressedTypes: ReadonlySet<string>): Circuit {
  return {
    ...circuit,
    components: circuit.components.map((component) => {
      if (!pressedTypes.has(component.type)) return component;
      if (!COMPONENT_DEFS[component.type]?.isMomentary) return component;
      return { ...component, state: { ...component.state, on: true } };
    }),
  };
}

/** Energised count of `loadType` under the given presses, via the real engine. */
function energisedCount(
  circuit: Circuit,
  loadType: string,
  pressedTypes: ReadonlySet<string>,
): number {
  const evidence = withPresses(circuit, pressedTypes);
  const result = simulate(evidence, { appMode: 'pro' });
  const energised = result.energizedComponents;
  return circuit.components.filter(
    (component) => component.type === loadType && energised.has(component.id),
  ).length;
}

// ── Component rules ────────────────────────────────────────────────────────

/** `count` instances of a type must exist (plan §8 requiredComponent). */
export function requiredComponent(type: string, name: string, count = 1): Rule {
  return rule(
    `required-${type}`,
    `Place ${count === 1 ? 'a' : count} ${name}${count === 1 ? '' : 's'}`,
    (ctx) => {
      const present = componentsOfType(ctx.graph, type).length;
      if (present >= count) return { verdict: 'pass' };
      return {
        verdict: 'incomplete',
        reason:
          present === 0
            ? `No ${name} on the canvas yet.`
            : `Need ${count} ${name}s — you have ${present}.`,
      };
    },
  );
}

/** A component type that must NOT appear (plan §20 extra components). */
export function forbiddenComponent(type: string, name: string): Rule {
  return rule(`forbidden-${type}`, `No ${name} in the circuit`, (ctx) => {
    const present = componentsOfType(ctx.graph, type).length;
    if (present === 0) return { verdict: 'pass' };
    return {
      verdict: 'fail',
      reason: `Remove ${present} ${name}${present === 1 ? '' : 's'} — they are not part of this circuit.`,
    };
  });
}

/** Every instance of a type must carry the given state (plan §8 componentState). */
export function componentState(
  type: string,
  state: Record<string, unknown>,
  name: string,
  stateDescription: string,
): Rule {
  const key = Object.entries(state)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&');
  return rule(`state-${type}-${key}`, `${name} is ${stateDescription}`, (ctx) => {
    const instances = componentsOfType(ctx.graph, type);
    if (instances.length === 0) {
      return { verdict: 'incomplete', reason: `No ${name} on the canvas yet.` };
    }
    const ok = instances.every((instance) =>
      Object.entries(state).every(
        ([stateKey, value]) => instance.state[stateKey as keyof typeof instance.state] === value,
      ),
    );
    if (ok) return { verdict: 'pass' };
    return { verdict: 'incomplete', reason: `Set the ${name} to ${stateDescription}.` };
  });
}

// ── Connection rules ───────────────────────────────────────────────────────

export interface ConnectionRuleOptions {
  fromType: string;
  toType: string;
  rail: 'live' | 'neutral' | 'earth';
  /** Plain description of the join, e.g. "Live reaches the switch". */
  label: string;
  /** Direct wire (plan §8 directConnection) instead of a rail path. */
  direct?: boolean;
}

/** A rail must connect two component types (plan §8 conductorPath / directConnection). */
export function connectionRule(options: ConnectionRuleOptions): Rule {
  const id = `${options.direct ? 'direct' : 'path'}-${options.rail}-${options.fromType}-${options.toType}`;
  return rule(id, options.label, (ctx) => {
    const found = options.direct
      ? hasDirectConnection(ctx.graph, options.rail, options.fromType, options.toType)
      : hasRailPath(ctx.graph, options.rail, options.fromType, options.toType);
    if (found) return { verdict: 'pass' };
    return {
      verdict: 'incomplete',
      reason: `No ${options.rail} path from ${options.fromType} to ${options.toType} yet.`,
    };
  });
}

/** Every path from `fromType` to `toType` must run through `throughType`. */
export function pathExclusivelyThrough(
  rail: 'live' | 'neutral' | 'earth',
  fromType: string,
  toType: string,
  throughType: string,
  label: string,
): Rule {
  const id = `exclusive-${rail}-${fromType}-${throughType}-${toType}`;
  return rule(id, label, (ctx) => {
    if (hasRailPathExclusivelyThrough(ctx.graph, rail, fromType, toType, throughType)) {
      return { verdict: 'pass' };
    }
    return {
      verdict: 'fail',
      reason: `The ${rail} path to the ${toType} must run through the ${throughType} — a bypass exists.`,
    };
  });
}

// ── Functional rules ───────────────────────────────────────────────────────

/**
 * Behaviour topology cannot prove (plan §8 "Interaction Evidence"). Runs the
 * real simulator with the given momentary types pressed and asserts how many
 * of `loadType` are energised. `count: 0` asserts de-energisation.
 */
export function energisedWhile(
  loadType: string,
  loadName: string,
  options: {
    /** Momentary types held pressed during the evidence simulation. */
    pressedTypes?: readonly string[];
    /** Expected energised count (default: all instances). */
    count?: number;
  } = {},
): Rule {
  const pressed = new Set(options.pressedTypes ?? []);
  const suffix = pressed.size > 0 ? `-${[...pressed].sort().join('+')}` : '-rest';
  const expected = options.count ?? 'all';
  const label =
    options.count === 0
      ? `${loadName} stays off when nothing is pressed`
      : `${loadName} energises while ${[...pressed].join(' + ') || 'the circuit is closed'}`;
  return rule(`energised-${loadType}${suffix}`, label, (ctx) => {
    const total = componentsOfType(ctx.graph, loadType).length;
    if (total === 0) {
      return { verdict: 'incomplete', reason: `No ${loadName} on the canvas yet.` };
    }
    const live = energisedCount(ctx.circuit, loadType, pressed);
    const needed = expected === 'all' ? total : Math.min(expected, total);
    if (options.count === 0) {
      if (live === 0) return { verdict: 'pass' };
      return {
        verdict: 'fail',
        reason: `${loadName} stays on when nothing is pressed — the live path must run through a momentary switch.`,
      };
    }
    if (live >= needed) return { verdict: 'pass' };
    return {
      verdict: 'incomplete',
      reason: `${loadName} is not energised — check the live and neutral paths.`,
    };
  });
}

// ── Fault rules ────────────────────────────────────────────────────────────

/** A specific fault kind must be absent everywhere (plan §8 faultAbsent). */
export function faultAbsent(kind: FaultType, description: string): Rule {
  return rule(`fault-absent-${kind}`, description, (ctx) => {
    if (!activeFaultKinds(ctx.circuit).has(kind)) return { verdict: 'pass' };
    return {
      verdict: 'fail',
      reason: 'The fault is still present — clear it and check again.',
    };
  });
}

function activeFaultKinds(circuit: Circuit): Set<FaultType> {
  const kinds = new Set<FaultType>();
  for (const fault of circuit.faults ?? []) kinds.add(fault.type);
  for (const component of circuit.components) {
    const fault = component.state?.fault as FaultType | undefined;
    if (fault) kinds.add(fault);
  }
  for (const wire of circuit.wires) {
    if (wire.fault) kinds.add(wire.fault as FaultType);
  }
  return kinds;
}
