/**
 * Circuit comparison — "compare/validate the user's circuit against the
 * target" (plan §1.2, Phase C step 6).
 *
 * The user never sees the target circuit's component ids: they drag their own
 * components onto the canvas and wire them up. So equality here can NEVER be
 * id equality. Two circuits solve the same challenge when they are the same
 * *labelled graph*:
 *
 *   - the same multiset of component TYPES, and
 *   - a bijection between target and user components that preserves every
 *     wire, including the exact port indices at both ends.
 *
 * That is a graph-isomorphism test restricted by node labels (component type)
 * and edge labels (the port pair). Full graph isomorphism is expensive in
 * general, but generated challenges are tiny (4–16 components, plan §9) and
 * the type labels partition the search space aggressively, so a
 * degree-refined backtracking search settles in microseconds. A hard node
 * budget guarantees termination even on a pathological hand-built circuit.
 *
 * Because "not isomorphic" is useless feedback on its own, the comparison
 * also returns a type-level diff (missing/extra components, missing/extra
 * connections) that the hint and evaluator layers turn into human guidance.
 *
 * This module is pure and UI-free: no simulation, no validation, no store.
 */

import { COMPONENT_DEFS } from '../../components';
import type { Circuit, ComponentInstance, WireInstance } from '../../types';

/** Safety valve for the isomorphism search (plan §45: bounded work). */
export const ISOMORPHISM_NODE_BUDGET = 200_000;

/** A component-type requirement and how well the user's circuit meets it. */
export interface ComponentDiffEntry {
  type: string;
  /** Human label from the component registry, e.g. "Ceiling Rose". */
  label: string;
  /** How many the target circuit uses. */
  required: number;
  /** How many the user's circuit currently has. */
  present: number;
}

/** A wiring requirement, expressed at type level so it survives id changes. */
export interface ConnectionDiffEntry {
  /** Canonical type-level signature, e.g. `mcb:1|lamp:0`. */
  signature: string;
  /** Human description, e.g. "MCB (Load) ↔ Lamp (L)". */
  description: string;
  required: number;
  present: number;
}

export interface CircuitComparison {
  /** True when the user's circuit is an exact labelled-graph match. */
  matches: boolean;
  /** Component-type multisets are identical. */
  componentsMatch: boolean;
  /** Type-level connection multisets are identical. */
  connectionsMatch: boolean;
  /**
   * A type- and port-preserving bijection exists. Implies `componentsMatch`
   * and `connectionsMatch`; the converse is NOT true (two circuits can share
   * every type-level signature yet wire them to the wrong instances).
   */
  isomorphic: boolean;
  /** True when the search hit {@link ISOMORPHISM_NODE_BUDGET} and gave up. */
  searchExhausted: boolean;
  missingComponents: ComponentDiffEntry[];
  extraComponents: ComponentDiffEntry[];
  missingConnections: ConnectionDiffEntry[];
  extraConnections: ConnectionDiffEntry[];
  /** target component id → user component id, only when `isomorphic`. */
  mapping: Record<string, string> | null;
  /** 0..1 progress estimate used for the objective checklist UI. */
  completion: number;
}

// ── Labels ─────────────────────────────────────────────────────────────────

function typeLabel(type: string): string {
  return COMPONENT_DEFS[type]?.label ?? type;
}

function portLabel(type: string, portIndex: number): string {
  return COMPONENT_DEFS[type]?.ports[portIndex]?.label ?? `port ${portIndex}`;
}

// ── Canonical signatures ───────────────────────────────────────────────────

/**
 * Canonical, id-free key for one wire end: the component TYPE plus the port
 * index. Port index (not port label) is used because two ports can share a
 * label but behave differently.
 */
function endKey(type: string, portIndex: number): string {
  return `${type}:${portIndex}`;
}

/**
 * Canonical key for a whole wire. Endpoints are sorted so that a wire drawn
 * lamp→switch is identical to one drawn switch→lamp: direction is a drawing
 * artefact, not electrical meaning.
 */
function connectionSignature(aType: string, aPort: number, bType: string, bPort: number): string {
  const a = endKey(aType, aPort);
  const b = endKey(bType, bPort);
  return a <= b ? `${a}|${b}` : `${b}|${a}`;
}

function describeSignature(signature: string): string {
  const [left, right] = signature.split('|');
  const render = (end: string): string => {
    const separator = end.lastIndexOf(':');
    const type = end.slice(0, separator);
    const portIndex = Number(end.slice(separator + 1));
    return `${typeLabel(type)} (${portLabel(type, portIndex)})`;
  };
  return `${render(left)} ↔ ${render(right)}`;
}

function countBy<T>(items: readonly T[], key: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

/** Type-level connection signatures for every wire in a circuit. */
export function connectionSignatures(circuit: Circuit): string[] {
  const typeById = new Map(circuit.components.map((c) => [c.id, c.type]));
  const signatures: string[] = [];
  for (const wire of circuit.wires) {
    const fromType = typeById.get(wire.fromComponentId);
    const toType = typeById.get(wire.toComponentId);
    // Dangling wires cannot describe a connection requirement; the structural
    // gate in the evaluator reports them separately.
    if (!fromType || !toType) continue;
    signatures.push(connectionSignature(fromType, wire.fromPortIndex, toType, wire.toPortIndex));
  }
  return signatures;
}

// ── Adjacency model for the isomorphism search ─────────────────────────────

interface Incidence {
  /** Port index on the component this incidence belongs to. */
  port: number;
  /** The component at the far end. */
  otherId: string;
  /** Port index on the far component. */
  otherPort: number;
}

interface GraphModel {
  ids: string[];
  typeById: Map<string, string>;
  incidences: Map<string, Incidence[]>;
  /**
   * Multiset key per component capturing its type and the sorted list of
   * (port, neighbour type, neighbour port) triples. Two components can only
   * map onto each other if these agree — a cheap, very effective filter.
   */
  refinement: Map<string, string>;
}

function buildGraph(circuit: Circuit): GraphModel {
  const typeById = new Map(circuit.components.map((c) => [c.id, c.type]));
  const incidences = new Map<string, Incidence[]>();
  for (const component of circuit.components) incidences.set(component.id, []);

  for (const wire of circuit.wires) {
    const from = incidences.get(wire.fromComponentId);
    const to = incidences.get(wire.toComponentId);
    if (!from || !to) continue; // dangling — ignored here
    from.push({
      port: wire.fromPortIndex,
      otherId: wire.toComponentId,
      otherPort: wire.toPortIndex,
    });
    to.push({
      port: wire.toPortIndex,
      otherId: wire.fromComponentId,
      otherPort: wire.fromPortIndex,
    });
  }

  const refinement = new Map<string, string>();
  for (const id of incidences.keys()) {
    const type = typeById.get(id) ?? '';
    const neighbours = (incidences.get(id) ?? [])
      .map((inc) => `${inc.port}>${typeById.get(inc.otherId) ?? '?'}:${inc.otherPort}`)
      .sort()
      .join(',');
    refinement.set(id, `${type}#${neighbours}`);
  }

  return {
    ids: circuit.components.map((c) => c.id),
    typeById,
    incidences,
    refinement,
  };
}

/**
 * Multiset of wires between two *mapped* components, keyed by port pair, so
 * parallel wires (two links between the same pair on different ports) are
 * compared exactly rather than collapsed.
 */
function incidentPortKeys(graph: GraphModel, id: string, otherId: string): string[] {
  return (graph.incidences.get(id) ?? [])
    .filter((inc) => inc.otherId === otherId)
    .map((inc) => `${inc.port}>${inc.otherPort}`)
    .sort();
}

function sameMultiset(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

interface SearchResult {
  mapping: Record<string, string> | null;
  exhausted: boolean;
}

/**
 * Backtracking search for a type- and port-preserving bijection from the
 * target graph onto the user graph.
 *
 * Ordering heuristic: always extend from the most constrained unmapped target
 * node (fewest surviving candidates), preferring nodes adjacent to something
 * already mapped so partial assignments get rejected as early as possible.
 */
function findIsomorphism(target: GraphModel, user: GraphModel): SearchResult {
  if (target.ids.length !== user.ids.length) return { mapping: null, exhausted: false };

  // Candidate sets from the refinement filter.
  const candidates = new Map<string, string[]>();
  for (const targetId of target.ids) {
    const signature = target.refinement.get(targetId);
    const pool = user.ids.filter((userId) => user.refinement.get(userId) === signature);
    if (pool.length === 0) return { mapping: null, exhausted: false };
    candidates.set(targetId, pool);
  }

  const mapping = new Map<string, string>();
  const usedUserIds = new Set<string>();
  let budget = ISOMORPHISM_NODE_BUDGET;
  let exhausted = false;

  const consistent = (targetId: string, userId: string): boolean => {
    // Every already-mapped neighbour must be wired identically, and the
    // number of edges into the mapped region must agree exactly (this is what
    // rules out "extra" wiring hiding in an otherwise valid partial map).
    let targetMappedEdges = 0;
    for (const inc of target.incidences.get(targetId) ?? []) {
      const mate = mapping.get(inc.otherId);
      if (mate === undefined) continue;
      targetMappedEdges += 1;
      void mate;
    }
    let userMappedEdges = 0;
    for (const inc of user.incidences.get(userId) ?? []) {
      if (usedUserIds.has(inc.otherId)) userMappedEdges += 1;
    }
    if (targetMappedEdges !== userMappedEdges) return false;

    const seen = new Set<string>();
    for (const inc of target.incidences.get(targetId) ?? []) {
      const mate = mapping.get(inc.otherId);
      if (mate === undefined || seen.has(inc.otherId)) continue;
      seen.add(inc.otherId);
      const wanted = incidentPortKeys(target, targetId, inc.otherId);
      const actual = incidentPortKeys(user, userId, mate);
      if (!sameMultiset(wanted, actual)) return false;
    }
    return true;
  };

  const pickNext = (): string | null => {
    let best: string | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const targetId of target.ids) {
      if (mapping.has(targetId)) continue;
      const pool = candidates.get(targetId) ?? [];
      const free = pool.filter((id) => !usedUserIds.has(id)).length;
      // Prefer nodes touching the mapped region: they prune hardest.
      const adjacent = (target.incidences.get(targetId) ?? []).some((inc) =>
        mapping.has(inc.otherId),
      );
      const score = free - (adjacent ? 1_000 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = targetId;
      }
    }
    return best;
  };

  const recurse = (): boolean => {
    if (mapping.size === target.ids.length) return true;
    if (budget-- <= 0) {
      exhausted = true;
      return false;
    }
    const targetId = pickNext();
    if (targetId === null) return false;

    for (const userId of candidates.get(targetId) ?? []) {
      if (usedUserIds.has(userId)) continue;
      if (!consistent(targetId, userId)) continue;
      mapping.set(targetId, userId);
      usedUserIds.add(userId);
      if (recurse()) return true;
      mapping.delete(targetId);
      usedUserIds.delete(userId);
      if (exhausted) return false;
    }
    return false;
  };

  const found = recurse();
  if (!found) return { mapping: null, exhausted };
  return { mapping: Object.fromEntries(mapping), exhausted: false };
}

// ── Public API ─────────────────────────────────────────────────────────────

function diffCounts(
  required: Map<string, number>,
  present: Map<string, number>,
): { missing: [string, number, number][]; extra: [string, number, number][] } {
  const missing: [string, number, number][] = [];
  const extra: [string, number, number][] = [];
  const keys = new Set([...required.keys(), ...present.keys()]);
  for (const key of keys) {
    const need = required.get(key) ?? 0;
    const have = present.get(key) ?? 0;
    if (have < need) missing.push([key, need, have]);
    else if (have > need) extra.push([key, need, have]);
  }
  missing.sort((a, b) => a[0].localeCompare(b[0]));
  extra.sort((a, b) => a[0].localeCompare(b[0]));
  return { missing, extra };
}

/**
 * Compare a user-built circuit against the generated target.
 *
 * Pure: neither circuit is mutated, and nothing is simulated here. The
 * evaluator layer adds the electrical gates on top.
 */
export function compareCircuits(target: Circuit, user: Circuit): CircuitComparison {
  const requiredTypes = countBy(target.components, (c: ComponentInstance) => c.type);
  const presentTypes = countBy(user.components, (c: ComponentInstance) => c.type);
  const typeDiff = diffCounts(requiredTypes, presentTypes);

  const requiredConnections = countBy(connectionSignatures(target), (s) => s);
  const presentConnections = countBy(connectionSignatures(user), (s) => s);
  const connectionDiff = diffCounts(requiredConnections, presentConnections);

  const componentsMatch = typeDiff.missing.length === 0 && typeDiff.extra.length === 0;
  const connectionsMatch = connectionDiff.missing.length === 0 && connectionDiff.extra.length === 0;

  // Only attempt the (more expensive) isomorphism search once the cheap
  // multiset gates agree — if they disagree no bijection can exist anyway.
  let mapping: Record<string, string> | null = null;
  let searchExhausted = false;
  if (componentsMatch && connectionsMatch) {
    const result = findIsomorphism(buildGraph(target), buildGraph(user));
    mapping = result.mapping;
    searchExhausted = result.exhausted;
  }

  const isomorphic = mapping !== null;

  // Completion: half the credit for having the right parts on the canvas,
  // half for wiring them correctly. Used only for the progress meter.
  const totalRequiredComponents = target.components.length || 1;
  const totalRequiredConnections = target.wires.length || 1;
  const missingComponentCount = typeDiff.missing.reduce(
    (sum, [, need, have]) => sum + (need - have),
    0,
  );
  const missingConnectionCount = connectionDiff.missing.reduce(
    (sum, [, need, have]) => sum + (need - have),
    0,
  );
  const componentProgress = Math.max(
    0,
    (totalRequiredComponents - missingComponentCount) / totalRequiredComponents,
  );
  const connectionProgress = Math.max(
    0,
    (totalRequiredConnections - missingConnectionCount) / totalRequiredConnections,
  );
  const rawCompletion = componentProgress * 0.5 + connectionProgress * 0.5;
  const completion = isomorphic ? 1 : Math.min(0.99, Math.round(rawCompletion * 100) / 100);

  return {
    matches: isomorphic,
    componentsMatch,
    connectionsMatch,
    isomorphic,
    searchExhausted,
    missingComponents: typeDiff.missing.map(([type, required, present]) => ({
      type,
      label: typeLabel(type),
      required,
      present,
    })),
    extraComponents: typeDiff.extra.map(([type, required, present]) => ({
      type,
      label: typeLabel(type),
      required,
      present,
    })),
    missingConnections: connectionDiff.missing.map(([signature, required, present]) => ({
      signature,
      description: describeSignature(signature),
      required,
      present,
    })),
    extraConnections: connectionDiff.extra.map(([signature, required, present]) => ({
      signature,
      description: describeSignature(signature),
      required,
      present,
    })),
    mapping,
    completion,
  };
}

/** Exposed for the scenario layer's requirement list and for tests. */
export function describeConnectionSignature(signature: string): string {
  return describeSignature(signature);
}

/** Exposed for tests: the canonical key a single wire contributes. */
export function wireSignature(circuit: Circuit, wire: WireInstance): string | null {
  const typeById = new Map(circuit.components.map((c) => [c.id, c.type]));
  const fromType = typeById.get(wire.fromComponentId);
  const toType = typeById.get(wire.toComponentId);
  if (!fromType || !toType) return null;
  return connectionSignature(fromType, wire.fromPortIndex, toType, wire.toPortIndex);
}
