/**
 * Phase C stress harness — Challenge Mode scenario + evaluation (plan §56).
 *
 * The generator has its own harness (`stress-challenge-generator.ts`). This
 * one stresses the layer above it: does a *correct rebuild* always pass, and
 * does every meaningful corruption always fail?
 *
 * Sweeps, per difficulty:
 *   1. correct rebuild under fresh ids + reordered arrays  → must PASS
 *   2. drop one wire                                        → must FAIL
 *   3. move one wire endpoint to another component          → must FAIL
 *   4. duplicate one component                              → must FAIL
 *   5. delete one non-supply component                      → must FAIL
 *   6. the scenario's own starting circuit                  → must FAIL
 *   7. scenario determinism for a repeated seed             → must MATCH
 *   8. no target ids leak into learner-visible text
 *
 * Plus an independent Weisfeiler-Leman colour-refinement oracle: for every
 * "wrong instance, right signatures" permutation we can construct, the
 * isomorphism verdict must agree with the oracle. That guards against both
 * false accepts (a genuinely different circuit passing) and false rejects
 * (a symmetric-but-equivalent circuit failing).
 *
 * Budgets: evaluation p95 ≤ 60 ms, max ≤ 250 ms.
 *
 *   node --import tsx scripts/stress-challenge-mode.ts [--seeds=N]
 */

import {
  type ChallengeDifficulty,
  buildChallengeScenario,
  compareCircuits,
  evaluateChallenge,
} from '../src/domain/challenges';
import type { Circuit } from '../src/domain/types';

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];
const DEFAULT_SEEDS = 250;
const EVAL_P95_BUDGET_MS = 60;
const EVAL_MAX_BUDGET_MS = 250;

const seedArg = process.argv.find((arg) => arg.startsWith('--seeds='));
const SEEDS = seedArg ? Number.parseInt(seedArg.split('=')[1] ?? '', 10) : DEFAULT_SEEDS;

const failures: string[] = [];
const durations: number[] = [];

function fail(message: string): void {
  if (failures.length < 25) failures.push(message);
}

const clone = (circuit: Circuit): Circuit => JSON.parse(JSON.stringify(circuit));

/** Deterministic shuffle so runs are reproducible. */
function shuffle<T>(items: T[], key: number): T[] {
  return items
    .map((value, index) => [value, (index * 2_654_435_761 + key) >>> 0] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([value]) => value);
}

/** What a learner produces: same graph, entirely different ids and order. */
function rebuild(circuit: Circuit, salt: number): Circuit {
  const map = new Map<string, string>();
  circuit.components.forEach((component, index) => map.set(component.id, `u-${salt}-${index}`));
  const components = circuit.components.map((component) => ({
    ...component,
    id: map.get(component.id) as string,
    state: { ...component.state },
  }));
  const wires = circuit.wires.map((wire, index) => ({
    ...wire,
    id: `uw-${salt}-${index}`,
    fromComponentId: map.get(wire.fromComponentId) as string,
    toComponentId: map.get(wire.toComponentId) as string,
  }));
  return {
    components: shuffle(components, salt),
    wires: shuffle(wires, salt + 7),
    globalVoltage: circuit.globalVoltage,
  };
}

/**
 * Independent equivalence oracle — 1-WL colour refinement. Not used by the
 * product code, so agreement is real cross-validation rather than a tautology.
 */
function canonicalForm(circuit: Circuit): string {
  const incidence = new Map<string, { port: number; other: string; otherPort: number }[]>();
  for (const component of circuit.components) incidence.set(component.id, []);
  for (const wire of circuit.wires) {
    incidence.get(wire.fromComponentId)?.push({
      port: wire.fromPortIndex,
      other: wire.toComponentId,
      otherPort: wire.toPortIndex,
    });
    incidence.get(wire.toComponentId)?.push({
      port: wire.toPortIndex,
      other: wire.fromComponentId,
      otherPort: wire.fromPortIndex,
    });
  }

  let colour = new Map(circuit.components.map((component) => [component.id, component.type]));
  for (let round = 0; round < circuit.components.length + 2; round += 1) {
    const next = new Map<string, string>();
    for (const component of circuit.components) {
      const neighbours = (incidence.get(component.id) ?? [])
        .map((edge) => `${edge.port}>${colour.get(edge.other)}:${edge.otherPort}`)
        .sort()
        .join(',');
      next.set(component.id, `${colour.get(component.id)}[${neighbours}]`);
    }
    const unique = [...new Set(next.values())].sort();
    const index = new Map(unique.map((value, i) => [value, `c${i}`]));
    colour = new Map([...next].map(([id, value]) => [id, index.get(value) as string]));
  }

  const nodes = [...colour.values()].sort().join('|');
  const edges = circuit.wires
    .map((wire) =>
      [
        `${colour.get(wire.fromComponentId)}:${wire.fromPortIndex}`,
        `${colour.get(wire.toComponentId)}:${wire.toPortIndex}`,
      ]
        .sort()
        .join('-'),
    )
    .sort()
    .join(',');
  return `${nodes}#${edges}`;
}

function timedEvaluate(...args: Parameters<typeof evaluateChallenge>) {
  const start = performance.now();
  const result = evaluateChallenge(...args);
  durations.push(performance.now() - start);
  return result;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

// ── Sweep ──────────────────────────────────────────────────────────────────

let scenarios = 0;
let mutationsChecked = 0;
let oracleChecks = 0;
let oracleAgreements = 0;

for (const difficulty of DIFFICULTIES) {
  for (let seed = 1; seed <= SEEDS; seed += 1) {
    const scenario = buildChallengeScenario({ seed, difficulty });
    scenarios += 1;
    const target = scenario.targetCircuit;
    const label = `${difficulty}/seed=${seed}/${scenario.recipeId}`;

    // 7. determinism
    const twin = buildChallengeScenario({ seed, difficulty });
    if (twin.challengeId !== scenario.challengeId) fail(`${label}: challengeId not deterministic`);
    if (JSON.stringify(twin.targetCircuit) !== JSON.stringify(target)) {
      fail(`${label}: target circuit not deterministic`);
    }

    // 8. no id leakage into anything the learner reads
    const visible = [
      scenario.objective,
      scenario.brief,
      ...scenario.hints.map((hint) => hint.text),
      ...scenario.componentRequirements.map((requirement) => requirement.label),
    ].join(' ');
    for (const component of target.components) {
      if (visible.includes(component.id)) fail(`${label}: leaks component id ${component.id}`);
    }

    // 1. correct rebuild must pass
    const correct = timedEvaluate(scenario, rebuild(target, seed));
    if (!correct.success) {
      fail(
        `${label}: correct rebuild REJECTED at ${correct.stage} :: ${correct.issues
          .slice(0, 2)
          .map((issue) => issue.message)
          .join(' | ')}`,
      );
    }

    // 6. the starting circuit must never pass
    if (timedEvaluate(scenario, scenario.startingCircuit).success) {
      fail(`${label}: starting circuit ACCEPTED`);
    }

    // 2. drop a wire
    if (target.wires.length > 0) {
      const mutated = clone(target);
      mutated.wires.splice(seed % mutated.wires.length, 1);
      mutationsChecked += 1;
      if (timedEvaluate(scenario, mutated).success) fail(`${label}: missing wire ACCEPTED`);
    }

    // 3. move an endpoint
    if (target.wires.length > 0) {
      const mutated = clone(target);
      const wire = mutated.wires[seed % mutated.wires.length];
      const other = mutated.components.find(
        (component) => component.id !== wire.toComponentId && component.id !== wire.fromComponentId,
      );
      if (other) {
        wire.toComponentId = other.id;
        wire.toPortIndex = 0;
        mutationsChecked += 1;
        if (timedEvaluate(scenario, mutated).success) {
          fail(`${label}: rewired endpoint ACCEPTED`);
        }
      }
    }

    // 3b. Move a wire to a *different port of the same component*.
    //
    // The full evaluation rejects this at the simulation gate, so it proves
    // little on its own. What it really tests is the comparison layer: the
    // component multiset and the connected type-pair are unchanged, so only a
    // port-aware signature can tell the graphs apart. Assert against the WL
    // oracle directly, bypassing the electrical gates.
    {
      const mutated = clone(target);
      const candidate = mutated.wires.find((wire) => wire.toPortIndex !== wire.fromPortIndex);
      if (candidate) {
        candidate.toPortIndex = candidate.fromPortIndex;
        oracleChecks += 1;
        const verdict = compareCircuits(target, mutated).isomorphic;
        const oracle = canonicalForm(target) === canonicalForm(mutated);
        if (verdict === oracle) oracleAgreements += 1;
        else fail(`${label}: port-swap isomorphism=${verdict} disagrees with WL oracle=${oracle}`);
      }
    }

    // 4. duplicate a component
    {
      const mutated = clone(target);
      const first = mutated.components[0];
      mutated.components.push({ ...first, id: `${first.id}-dup`, x: first.x + 400 });
      mutationsChecked += 1;
      if (timedEvaluate(scenario, mutated).success) fail(`${label}: extra component ACCEPTED`);
    }

    // 5. delete a non-supply component (and its wires)
    {
      const mutated = clone(target);
      const victim = mutated.components.find(
        (component) => !scenario.startingCircuit.components.some((s) => s.type === component.type),
      );
      if (victim) {
        mutated.components = mutated.components.filter((c) => c.id !== victim.id);
        mutated.wires = mutated.wires.filter(
          (wire) => wire.fromComponentId !== victim.id && wire.toComponentId !== victim.id,
        );
        mutationsChecked += 1;
        if (timedEvaluate(scenario, mutated).success) {
          fail(`${label}: missing component ACCEPTED`);
        }
      }
    }

    // Oracle cross-check on a signature-preserving sibling permutation.
    {
      const mutated = clone(target);
      const typeById = new Map(mutated.components.map((c) => [c.id, c.type]));
      let swapped = false;
      for (let i = 0; i < mutated.wires.length && !swapped; i += 1) {
        for (let j = i + 1; j < mutated.wires.length && !swapped; j += 1) {
          const a = mutated.wires[i];
          const b = mutated.wires[j];
          if (a.fromComponentId === b.fromComponentId) continue;
          if (typeById.get(a.fromComponentId) !== typeById.get(b.fromComponentId)) continue;
          if (typeById.get(a.toComponentId) !== typeById.get(b.toComponentId)) continue;
          if (a.fromPortIndex !== b.fromPortIndex || a.toPortIndex !== b.toPortIndex) continue;
          if (a.toComponentId === b.toComponentId) continue;
          const held = a.toComponentId;
          a.toComponentId = b.toComponentId;
          b.toComponentId = held;
          swapped = true;
        }
      }
      if (swapped) {
        oracleChecks += 1;
        const verdict = compareCircuits(target, mutated).isomorphic;
        const oracle = canonicalForm(target) === canonicalForm(mutated);
        if (verdict === oracle) oracleAgreements += 1;
        else fail(`${label}: isomorphism=${verdict} disagrees with WL oracle=${oracle}`);
      }
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────

const p95 = percentile(durations, 0.95);
const max = Math.max(...durations);

console.log('\nChallenge Mode stress');
console.log('─'.repeat(60));
console.log(`Scenarios generated : ${scenarios} (${SEEDS} seeds × ${DIFFICULTIES.length})`);
console.log(`Evaluations run     : ${durations.length}`);
console.log(`Corruptions checked : ${mutationsChecked} (all must be rejected)`);
console.log(`WL-oracle checks    : ${oracleAgreements}/${oracleChecks} agreement`);
console.log(
  `Evaluation timing   : median ${percentile(durations, 0.5).toFixed(2)} ms, ` +
    `p95 ${p95.toFixed(2)} ms, max ${max.toFixed(2)} ms`,
);

if (p95 > EVAL_P95_BUDGET_MS)
  fail(`evaluation p95 ${p95.toFixed(1)} ms exceeds ${EVAL_P95_BUDGET_MS} ms`);
if (max > EVAL_MAX_BUDGET_MS)
  fail(`evaluation max ${max.toFixed(1)} ms exceeds ${EVAL_MAX_BUDGET_MS} ms`);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\n✓ Challenge Mode stress test passed.');
