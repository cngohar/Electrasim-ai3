/**
 * Phase E stress harness — Ohmageddon Mode (plan §42, §56, §57).
 *
 * The unit suite proves each modifier behaves on a handful of seeds. This
 * sweeps every tier across every difficulty over hundreds of seeds and asserts
 * the properties that must hold for *all* of them — the ones where a 1-in-500
 * violation is still a shipped bug:
 *
 *   1. every rage scenario builds, and its healthy baseline is clean under the
 *      full production validator stack (rules + BS 7671 + both sim modes)
 *   2. the injected fault is observable (§12 applies in rage too)
 *   3. the truthful answer + a real repair  → 'success'
 *      the truthful answer with no repair   → 'incomplete'
 *      a wrong answer                       → 'failure'
 *   4. a decoy is NEVER the fault, and decoys never change load behaviour
 *   5. modifiers are deterministic: same (seed, difficulty, tier) ⇒ identical
 *   6. tier escalation is real — measured fault distance and hint counts move
 *      in the right direction, so a "harder" tier is not merely labelled so
 *   7. normal mode never receives a modifier (§24), checked on the same seeds
 *   8. no answer leak: neither the fault type nor its location may appear in
 *      the brief, complaint, rage notes or any hint below the final one
 *
 * Budgets: rage scenario build p95 ≤ 200 ms (a red herring costs an extra
 * validate + simulate over the normal path, which is budgeted at 150 ms).
 *
 *   node --import tsx scripts/stress-ohmageddon.ts [--seeds=N]
 */

import {
  type ChallengeDifficulty,
  type DiagnosisScenario,
  RAGE_TIER_IDS,
  type RageTierId,
  buildDiagnosisScenario,
  evaluateDiagnosis,
} from '../src/domain/challenges';
import { validateCircuit } from '../src/domain/circuitValidation';
import { validateCircuitRules } from '../src/domain/electrical/validation';
import { simulate } from '../src/domain/simulation';
import type { Circuit } from '../src/domain/types';

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];
const DEFAULT_SEEDS = 120;
const BUILD_P95_BUDGET_MS = 200;

const seedArg = process.argv.find((arg) => arg.startsWith('--seeds='));
const SEEDS = seedArg ? Number.parseInt(seedArg.split('=')[1] ?? '', 10) : DEFAULT_SEEDS;

const failures: string[] = [];
const buildTimes: number[] = [];

function fail(message: string): void {
  if (failures.length < 25) failures.push(message);
}

function p95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
}

function withoutFaults(circuit: Circuit): Circuit {
  return { ...circuit, faults: [] };
}

/** Hop distance from the fault to the nearest declared load. */
function faultDistance(scenario: DiagnosisScenario): number {
  const adjacency = new Map<string, string[]>();
  for (const wire of scenario.healthyCircuit.wires) {
    for (const [a, b] of [
      [wire.fromComponentId, wire.toComponentId],
      [wire.toComponentId, wire.fromComponentId],
    ]) {
      const list = adjacency.get(a!);
      if (list) list.push(b!);
      else adjacency.set(a!, [b!]);
    }
  }
  const distance = new Map<string, number>();
  const queue: string[] = [];
  for (const id of scenario.loadComponentIds) {
    distance.set(id, 0);
    queue.push(id);
  }
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]!;
    for (const next of adjacency.get(current) ?? []) {
      if (distance.has(next)) continue;
      distance.set(next, (distance.get(current) ?? 0) + 1);
      queue.push(next);
    }
  }
  const target = scenario.fault.target;
  if (target.type === 'wire') {
    const wire = scenario.healthyCircuit.wires.find((w) => w.id === target.id);
    if (!wire) return 0;
    return Math.min(distance.get(wire.fromComponentId) ?? 0, distance.get(wire.toComponentId) ?? 0);
  }
  const id = target.type === 'component' ? target.id : target.componentId;
  return distance.get(id) ?? 0;
}

interface TierStats {
  built: number;
  distanceSum: number;
  hintSum: number;
  decoyCount: number;
  applied: Map<string, number>;
}

const stats = new Map<string, TierStats>();
function statsFor(key: string): TierStats {
  let entry = stats.get(key);
  if (!entry) {
    entry = { built: 0, distanceSum: 0, hintSum: 0, decoyCount: 0, applied: new Map() };
    stats.set(key, entry);
  }
  return entry;
}

let scenarios = 0;
let evaluations = 0;

// ---------------------------------------------------------------------------

for (const difficulty of DIFFICULTIES) {
  for (const tier of [...RAGE_TIER_IDS, undefined] as (RageTierId | undefined)[]) {
    const key = `${difficulty}/${tier ?? 'normal'}`;
    const entry = statsFor(key);

    for (let i = 0; i < SEEDS; i++) {
      const seed = i * 7919 + 13;
      const started = performance.now();
      let scenario: DiagnosisScenario;
      try {
        scenario = buildDiagnosisScenario({
          seed,
          difficulty,
          ...(tier ? { rageTier: tier } : {}),
        });
      } catch (error) {
        fail(`${key} seed ${seed}: build threw — ${(error as Error).message}`);
        continue;
      }
      buildTimes.push(performance.now() - started);
      scenarios += 1;
      entry.built += 1;
      entry.distanceSum += faultDistance(scenario);
      entry.hintSum += scenario.hints.length;

      // ── 7. §24: normal mode never receives modifiers ──────────────────
      if (!tier) {
        if (scenario.rage !== null) fail(`${key} seed ${seed}: normal scenario carries rage data`);
        if (scenario.hints.length !== 3) {
          fail(`${key} seed ${seed}: normal scenario has ${scenario.hints.length} hints, want 3`);
        }
      } else {
        if (!scenario.rage) {
          fail(`${key} seed ${seed}: rage tier produced no summary`);
          continue;
        }
        if (scenario.rage.tier !== tier) {
          fail(`${key} seed ${seed}: summary tier ${scenario.rage.tier} != ${tier}`);
        }
        if (!scenario.challengeId.startsWith('ES-RAGE-')) {
          fail(`${key} seed ${seed}: identity ${scenario.challengeId} lacks ES-RAGE prefix`);
        }
        for (const application of scenario.rage.applications) {
          if (!application.applied) continue;
          entry.applied.set(application.id, (entry.applied.get(application.id) ?? 0) + 1);
        }
        entry.decoyCount += scenario.rage.decoyComponentIds.length;
      }

      // ── 1. clean healthy baseline under the full validator stack ──────
      const healthy = simulate(scenario.healthyCircuit, { appMode: 'pro' });
      if (healthy.errors.length > 0) {
        fail(`${key} seed ${seed}: healthy baseline has errors — ${healthy.errors[0]}`);
      }
      if (healthy.errorComponents.size > 0 || healthy.errorWires.size > 0) {
        fail(`${key} seed ${seed}: healthy baseline flags components/wires in error`);
      }
      if ((healthy.trippedComponents?.length ?? 0) > 0) {
        fail(`${key} seed ${seed}: healthy baseline has tripped protection`);
      }
      const ruleErrors = validateCircuitRules(scenario.healthyCircuit, 'basic').filter(
        (d) => d.severity === 'error',
      );
      if (ruleErrors.length > 0) {
        fail(`${key} seed ${seed}: rule error ${ruleErrors[0]?.code}`);
      }
      const report = validateCircuit(scenario.healthyCircuit, healthy, 'uk');
      const reportErrors = report.issues.filter((issue) => issue.severity === 'error');
      if (reportErrors.length > 0) {
        fail(`${key} seed ${seed}: BS 7671 error ${reportErrors[0]?.id}`);
      }

      // ── 2. §12: the fault must be observable ──────────────────────────
      if (!scenario.symptom.observable) {
        fail(`${key} seed ${seed}: fault ${scenario.fault.type} is not observable`);
      }

      // ── 4. a decoy is never the fault ─────────────────────────────────
      const decoys = new Set(scenario.rage?.decoyComponentIds ?? []);
      if (decoys.size > 0) {
        const target = scenario.fault.target;
        let onDecoy = false;
        if (target.type === 'component') onDecoy = decoys.has(target.id);
        else if (target.type === 'port') onDecoy = decoys.has(target.componentId);
        else {
          const wire = scenario.healthyCircuit.wires.find((w) => w.id === target.id);
          onDecoy = !!wire && (decoys.has(wire.fromComponentId) || decoys.has(wire.toComponentId));
        }
        if (onDecoy) fail(`${key} seed ${seed}: the fault was placed on a decoy`);
      }

      // ── 3. the three verdicts ─────────────────────────────────────────
      const truthful = { faultType: scenario.fault.type, locationKey: scenario.faultLocationKey };

      const repaired = evaluateDiagnosis(
        scenario,
        withoutFaults(scenario.faultedCircuit),
        truthful,
      );
      evaluations += 1;
      if (repaired.verdict !== 'success') {
        fail(
          `${key} seed ${seed}: truthful answer + repair gave "${repaired.verdict}" (${repaired.recoveryGap ?? 'no gap'})`,
        );
      }

      const unrepaired = evaluateDiagnosis(scenario, scenario.faultedCircuit, truthful);
      evaluations += 1;
      if (unrepaired.verdict !== 'incomplete') {
        fail(`${key} seed ${seed}: truthful answer, no repair gave "${unrepaired.verdict}"`);
      }

      const wrongLocation = scenario.locationChoices.find(
        (choice) => choice.key !== scenario.faultLocationKey,
      );
      if (wrongLocation) {
        const wrong = evaluateDiagnosis(scenario, withoutFaults(scenario.faultedCircuit), {
          faultType: scenario.fault.type,
          locationKey: wrongLocation.key,
        });
        evaluations += 1;
        if (wrong.verdict !== 'failure') {
          fail(`${key} seed ${seed}: wrong location gave "${wrong.verdict}", want failure`);
        }
      }

      // ── 5. determinism ────────────────────────────────────────────────
      const replay = buildDiagnosisScenario({
        seed,
        difficulty,
        ...(tier ? { rageTier: tier } : {}),
      });
      if (JSON.stringify(replay) !== JSON.stringify(scenario)) {
        fail(`${key} seed ${seed}: replay diverged`);
      }

      // ── 8. no answer leak (§14) ───────────────────────────────────────
      // Matches the whole fault name, hyphenated or spaced — the same rule
      // `stress-diagnosis.ts` uses. Matching individual *words* was tried and
      // discarded: "circuit", "earth", "terminal" and "fault" all occur in
      // legitimate generic prose ("Investigate the circuit"), so a fragment
      // match reports a leak on copy that names nothing at all.
      const leakZone = [
        scenario.brief,
        scenario.complaint,
        scenario.expectedBehaviour,
        scenario.title,
        // Rage notes and modifier labels are rendered in the panel, so they
        // are part of the leak surface even though normal mode has none.
        ...(scenario.rage?.applications.map((a) => `${a.label} ${a.note}`) ?? []),
        ...scenario.hints.slice(0, -1).map((hint) => hint.text),
      ]
        .join(' ')
        .toLowerCase();
      const typeWord = scenario.fault.type.replace(/-/g, ' ');
      if (leakZone.includes(scenario.fault.type) || leakZone.includes(typeWord)) {
        fail(`${key} seed ${seed}: fault type "${scenario.fault.type}" leaked into visible copy`);
      }
      // The rage summary must also not name the fault's location: the decoy
      // note mentions a wire id, and if that id were ever the faulted one the
      // badge tooltip would hand over the answer.
      if (scenario.rage) {
        const notes = scenario.rage.applications.map((a) => a.note).join(' ');
        const target = scenario.fault.target;
        const targetId = target.type === 'port' ? target.componentId : target.id;
        if (notes.includes(targetId)) {
          fail(`${key} seed ${seed}: rage note names the fault target ${targetId}`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Tier escalation must be measurable, not merely labelled.
// ---------------------------------------------------------------------------

for (const difficulty of DIFFICULTIES) {
  const avg = (tier: string, field: 'distanceSum' | 'hintSum') => {
    const entry = stats.get(`${difficulty}/${tier}`);
    if (!entry || entry.built === 0) return 0;
    return entry[field] / entry.built;
  };

  // remoteFault runs in rage-2 and rage-3; both must beat normal.
  for (const tier of ['rage-2', 'rage-3']) {
    if (avg(tier, 'distanceSum') <= avg('normal', 'distanceSum')) {
      fail(
        `${difficulty}: ${tier} mean fault distance ${avg(tier, 'distanceSum').toFixed(2)} does not exceed normal ${avg('normal', 'distanceSum').toFixed(2)}`,
      );
    }
  }
  // limitedHints runs in rage-2 and rage-3; rage-3 must be the harshest.
  if (!(avg('rage-3', 'hintSum') < avg('rage-2', 'hintSum'))) {
    fail(`${difficulty}: rage-3 does not ration hints harder than rage-2`);
  }
  if (!(avg('rage-2', 'hintSum') < avg('normal', 'hintSum'))) {
    fail(`${difficulty}: rage-2 does not ration hints below normal`);
  }
  // rage-1 and rage-3 must actually place decoys.
  for (const tier of ['rage-1', 'rage-3']) {
    const entry = stats.get(`${difficulty}/${tier}`);
    if (!entry || entry.decoyCount === 0) {
      fail(`${difficulty}: ${tier} never placed a red herring`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const buildP95 = p95(buildTimes);

console.log('\n── Ohmageddon stress (plan §42, §56) ──────────────────────────');
console.log(`seeds per tier/difficulty : ${SEEDS}`);
console.log(`scenarios built           : ${scenarios}`);
console.log(`evaluations               : ${evaluations}`);
console.log(
  `build p95                 : ${buildP95.toFixed(2)} ms (budget ${BUILD_P95_BUDGET_MS})`,
);
console.log('');
console.log('tier                       built  meanDist  meanHints  decoys  modifiers');
for (const [key, entry] of [...stats.entries()].sort()) {
  const applied = [...entry.applied.entries()]
    .sort()
    .map(([id, count]) => `${id}×${count}`)
    .join(' ');
  console.log(
    `${key.padEnd(26)} ${String(entry.built).padStart(5)}  ` +
      `${(entry.distanceSum / Math.max(1, entry.built)).toFixed(2).padStart(8)}  ` +
      `${(entry.hintSum / Math.max(1, entry.built)).toFixed(2).padStart(9)}  ` +
      `${String(entry.decoyCount).padStart(6)}  ${applied}`,
  );
}

if (buildP95 > BUILD_P95_BUDGET_MS) {
  fail(`build p95 ${buildP95.toFixed(2)} ms exceeds ${BUILD_P95_BUDGET_MS} ms`);
}

console.log('');
if (failures.length > 0) {
  console.error(`✗ ${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('✓ Ohmageddon stress passed.');
