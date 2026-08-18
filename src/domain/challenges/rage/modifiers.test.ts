/**
 * Ohmageddon modifier tests (plan §42, §57 "Ohmageddon" gate).
 *
 * §42 names the cases directly:
 *
 *   - test every modifier independently
 *   - rage OFF  => no Ohmageddon scenarios
 *   - rage ON   => Ohmageddon scenarios may be selected
 *   - normal mode never receives Ohmageddon modifiers
 *   - Ohmageddon modifiers preserve valid electrical simulation
 *
 * The last one is the load-bearing test in this file. Everything else is
 * bookkeeping; that one is the difference between "hard" and "broken", and it
 * is asserted against the *real* simulator rather than a stub, because a
 * mocked simulator cannot tell you your red herring silently killed a lamp.
 */

import { describe, expect, it } from 'vitest';
import { validateCircuit } from '../../circuitValidation';
import { validateCircuitRules } from '../../electrical/validation';
import { simulate } from '../../simulation';
import { buildDiagnosisScenario } from '../diagnosis/scenario';
import { getDifficultyProfile } from '../difficulty/profiles';
import { collectFaultCandidates } from '../faults/eligibility';
import { generateChallenge } from '../generator/generator';
import { createSeededRng } from '../generator/seed';
import { RAGE_MODIFIERS, getRageModifier, implementedRageModifiers } from './modifiers';
import { applyCandidateStage, applyCircuitStage, applyPresentationStage } from './runner';
import { RAGE_TIERS, RAGE_TIER_IDS, getRageTier, isRageTierId, rageProfileKey } from './tiers';
import { RAGE_MODIFIER_IDS, type RageContext, type RagePresentation } from './types';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

function ctxFor(
  tier: (typeof RAGE_TIER_IDS)[number],
  difficulty: 'beginner' | 'intermediate' | 'advanced',
): RageContext {
  return {
    difficulty,
    profile: getDifficultyProfile(difficulty),
    tier,
    rng: createSeededRng({ generatorVersion: 1, seed: 99, difficulty, mode: 'rage' }),
  };
}

// ---------------------------------------------------------------------------
// Registry / vocabulary
// ---------------------------------------------------------------------------

describe('rage modifier registry (plan §25)', () => {
  it('declares every modifier named in §25', () => {
    for (const id of RAGE_MODIFIER_IDS) {
      expect(RAGE_MODIFIERS[id], `missing modifier ${id}`).toBeDefined();
      expect(RAGE_MODIFIERS[id].id).toBe(id);
    }
  });

  it('ships exactly the three modifiers §52 nominates first', () => {
    expect(
      implementedRageModifiers()
        .map((m) => m.id)
        .sort(),
    ).toEqual(['limitedHints', 'redHerring', 'remoteFault']);
  });

  it('never marks an unimplemented modifier as having hooks', () => {
    // A stub with a live hook would be applied by the runner and ship half-done.
    for (const modifier of Object.values(RAGE_MODIFIERS)) {
      if (modifier.implemented) continue;
      expect(modifier.transformCircuit).toBeUndefined();
      expect(modifier.rankCandidates).toBeUndefined();
      expect(modifier.adjustPresentation).toBeUndefined();
    }
  });

  it('throws on an unknown modifier id', () => {
    // biome-ignore lint/suspicious/noExplicitAny: deliberate invalid input.
    expect(() => getRageModifier('nope' as any)).toThrow(/Unknown rage modifier/);
  });
});

describe('rage tiers (plan §27)', () => {
  it('only references implemented modifiers', () => {
    for (const tierId of RAGE_TIER_IDS) {
      for (const id of RAGE_TIERS[tierId].modifiers) {
        expect(RAGE_MODIFIERS[id].implemented, `${tierId} uses unimplemented ${id}`).toBe(true);
      }
    }
  });

  it('escalates: each tier is at least as harsh as the previous', () => {
    const counts = RAGE_TIER_IDS.map((id) => RAGE_TIERS[id].modifiers.length);
    expect(counts).toEqual([...counts].sort((a, b) => a - b));
  });

  it('derives a distinct rage profile key per tier', () => {
    const keys = RAGE_TIER_IDS.map(rageProfileKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('validates tier ids', () => {
    expect(isRageTierId('rage-1')).toBe(true);
    expect(isRageTierId('rage-9')).toBe(false);
    expect(() => getRageTier('rage-9' as never)).toThrow(/Unknown rage tier/);
  });
});

// ---------------------------------------------------------------------------
// §42: each modifier, independently
// ---------------------------------------------------------------------------

describe('redHerring — independently (plan §42)', () => {
  it('adds exactly one decoy and keeps the circuit electrically identical', () => {
    let applied = 0;
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 8; seed++) {
        const generated = generateChallenge({ seed, difficulty, mode: 'rage' });
        const before = simulate(generated.circuit, { appMode: 'pro' });

        const staged = applyCircuitStage({
          circuit: generated.circuit,
          scenario: generated.scenario,
          difficulty,
          tier: 'rage-1',
          rng: createSeededRng({ generatorVersion: 1, seed, difficulty, mode: 'rage' }),
          expectedEnergisedLoadIds: generated.metadata.baseline.expectedEnergisedLoadIds,
        });

        if (staged.decoyComponentIds.length === 0) continue;
        applied += 1;

        expect(staged.decoyComponentIds).toHaveLength(1);
        expect(staged.circuit.components.length).toBe(generated.circuit.components.length + 1);
        // One wire becomes two.
        expect(staged.circuit.wires.length).toBe(generated.circuit.wires.length + 1);

        // The whole point: same electrical outcome.
        const after = simulate(staged.circuit, { appMode: 'pro' });
        for (const loadId of generated.scenario.loadComponentIds) {
          expect(after.energizedComponents.has(loadId)).toBe(
            before.energizedComponents.has(loadId),
          );
        }
        expect(after.errors).toEqual([]);
        expect(after.errorComponents.size).toBe(0);
        expect(after.errorWires.size).toBe(0);
      }
    }
    expect(applied).toBeGreaterThan(0);
  });

  it('preserves total run length when it splices (voltage drop is unchanged)', () => {
    const generated = generateChallenge({ seed: 3, difficulty: 'intermediate', mode: 'rage' });
    const staged = applyCircuitStage({
      circuit: generated.circuit,
      scenario: generated.scenario,
      difficulty: 'intermediate',
      tier: 'rage-1',
      rng: createSeededRng({
        generatorVersion: 1,
        seed: 3,
        difficulty: 'intermediate',
        mode: 'rage',
      }),
      expectedEnergisedLoadIds: generated.metadata.baseline.expectedEnergisedLoadIds,
    });
    if (staged.decoyComponentIds.length === 0) return;

    const decoyId = staged.decoyComponentIds[0]!;
    const halves = staged.circuit.wires.filter(
      (w) => w.fromComponentId === decoyId || w.toComponentId === decoyId,
    );
    expect(halves).toHaveLength(2);
    // Both halves inherit the parent's cable spec — a splice is not a re-cable.
    expect(new Set(halves.map((w) => w.customCableMm2)).size).toBe(1);
  });

  /**
   * Regression: the decoy must not identify itself.
   *
   * `ComponentNode.tsx` renders `component.id` under every device on the
   * canvas, so an id containing "decoy"/"herring"/"rage" hands the learner the
   * answer in plain text. The first implementation used `<wireId>-decoy` and
   * shipped it straight onto the canvas — found by reading a screenshot, which
   * no unit test was looking for. This locks it.
   */
  it('never names a decoy in a way the canvas would reveal (§14)', () => {
    const forbidden = /decoy|herring|rage|fake|dummy|trap/i;
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 10; seed++) {
        const generated = generateChallenge({ seed, difficulty, mode: 'rage' });
        const staged = applyCircuitStage({
          circuit: generated.circuit,
          scenario: generated.scenario,
          difficulty,
          tier: 'rage-1',
          rng: createSeededRng({ generatorVersion: 1, seed, difficulty, mode: 'rage' }),
          expectedEnergisedLoadIds: generated.metadata.baseline.expectedEnergisedLoadIds,
        });
        for (const component of staged.circuit.components) {
          expect(forbidden.test(component.id), `component id "${component.id}" leaks`).toBe(false);
        }
        for (const wire of staged.circuit.wires) {
          expect(forbidden.test(wire.id), `wire id "${wire.id}" leaks`).toBe(false);
        }
      }
    }
  });

  it('rewrites the fault-candidate wire list so no id dangles', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const generated = generateChallenge({ seed, difficulty: 'intermediate', mode: 'rage' });
      const staged = applyCircuitStage({
        circuit: generated.circuit,
        scenario: generated.scenario,
        difficulty: 'intermediate',
        tier: 'rage-1',
        rng: createSeededRng({
          generatorVersion: 1,
          seed,
          difficulty: 'intermediate',
          mode: 'rage',
        }),
        expectedEnergisedLoadIds: generated.metadata.baseline.expectedEnergisedLoadIds,
      });
      const live = new Set(staged.circuit.wires.map((w) => w.id));
      for (const id of staged.faultCandidateWireIds) {
        expect(live.has(id), `candidate ${id} no longer exists`).toBe(true);
      }
    }
  });
});

describe('remoteFault — independently (plan §42)', () => {
  it('narrows candidates and never returns an empty set', () => {
    let narrowed = 0;
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 8; seed++) {
        const generated = generateChallenge({ seed, difficulty, mode: 'rage' });
        const candidates = collectFaultCandidates(generated.circuit, generated.scenario);
        if (candidates.length < 2) continue;

        const staged = applyCandidateStage({
          circuit: generated.circuit,
          candidates,
          loadComponentIds: generated.scenario.loadComponentIds,
          difficulty,
          tier: 'rage-2',
          rng: createSeededRng({ generatorVersion: 1, seed, difficulty, mode: 'rage' }),
          decoyComponentIds: [],
        });

        expect(staged.candidates.length).toBeGreaterThan(0);
        expect(staged.candidates.length).toBeLessThanOrEqual(candidates.length);
        if (staged.candidates.length < candidates.length) narrowed += 1;
        // Every surviving candidate must be one of the originals.
        const keys = new Set(candidates.map((c) => c.key));
        for (const c of staged.candidates) expect(keys.has(c.key)).toBe(true);
      }
    }
    expect(narrowed).toBeGreaterThan(0);
  });

  it('respects the difficulty ceiling on fault distance', () => {
    // Beginner allows 1 hop; the modifier must not exceed the profile's cap.
    const modifier = getRageModifier('remoteFault');
    expect(modifier.rankCandidates).toBeDefined();
    const generated = generateChallenge({ seed: 5, difficulty: 'beginner', mode: 'rage' });
    const candidates = collectFaultCandidates(generated.circuit, generated.scenario);
    const patch = modifier.rankCandidates?.(
      {
        circuit: generated.circuit,
        candidates,
        loadComponentIds: generated.scenario.loadComponentIds,
      },
      ctxFor('rage-2', 'beginner'),
    );
    if (patch) expect(patch.candidates.length).toBeGreaterThan(0);
  });

  it('declines when there is nothing to choose between', () => {
    const generated = generateChallenge({ seed: 11, difficulty: 'beginner', mode: 'rage' });
    const candidates = collectFaultCandidates(generated.circuit, generated.scenario);
    const patch = getRageModifier('remoteFault').rankCandidates?.(
      { circuit: generated.circuit, candidates: candidates.slice(0, 1), loadComponentIds: [] },
      ctxFor('rage-2', 'beginner'),
    );
    expect(patch).toBeNull();
  });
});

describe('limitedHints — independently (plan §42)', () => {
  const base: RagePresentation = {
    hints: [
      { level: 1, kind: 'observation', text: 'a' },
      { level: 2, kind: 'direction', text: 'b' },
      { level: 3, kind: 'location', text: 'c' },
    ],
    hintBudget: 3,
    parTimeSeconds: 200,
    timeLimitSeconds: null,
  };

  it('drops the location hint first at rage-2', () => {
    const next = getRageModifier('limitedHints').adjustPresentation?.(
      base,
      ctxFor('rage-2', 'intermediate'),
    );
    expect(next?.hints).toHaveLength(2);
    // The level-3 hint is the one that names the target — it must be the first to go.
    expect(next?.hints.some((h) => h.kind === 'location')).toBe(false);
    expect(next?.hintBudget).toBeLessThanOrEqual(2);
  });

  it('keeps only the observation at rage-3', () => {
    const next = getRageModifier('limitedHints').adjustPresentation?.(
      base,
      ctxFor('rage-3', 'advanced'),
    );
    expect(next?.hints).toHaveLength(1);
    expect(next?.hints[0]?.kind).toBe('observation');
  });

  it('never removes the last hint', () => {
    const single: RagePresentation = { ...base, hints: [base.hints[0]!], hintBudget: 1 };
    expect(
      getRageModifier('limitedHints').adjustPresentation?.(single, ctxFor('rage-3', 'advanced')),
    ).toBeNull();
  });

  it('is applied through the runner without emptying the hint list', () => {
    for (const tier of RAGE_TIER_IDS) {
      const staged = applyPresentationStage({
        ...base,
        difficulty: 'advanced',
        tier,
        rng: createSeededRng({
          generatorVersion: 1,
          seed: 1,
          difficulty: 'advanced',
          mode: 'rage',
        }),
      });
      expect(staged.presentation.hints.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// §26 / §42: electrical validity is preserved
// ---------------------------------------------------------------------------

describe('Ohmageddon preserves valid electrical simulation (plan §26, §42)', () => {
  it('every rage scenario has a clean healthy baseline and an observable fault', () => {
    for (const tier of RAGE_TIER_IDS) {
      for (const difficulty of DIFFICULTIES) {
        for (let seed = 1; seed <= 6; seed++) {
          const scenario = buildDiagnosisScenario({ seed, difficulty, rageTier: tier });

          const healthy = simulate(scenario.healthyCircuit, { appMode: 'pro' });
          expect(healthy.errors, `${tier}/${difficulty}/${seed}`).toEqual([]);
          expect(healthy.errorComponents.size).toBe(0);
          expect(healthy.errorWires.size).toBe(0);
          expect(healthy.trippedComponents ?? []).toHaveLength(0);

          // §12 still applies in rage: an invisible fault is not a puzzle.
          expect(scenario.symptom.observable).toBe(true);

          // The rage circuit must satisfy the same production validators the
          // generator uses — not a relaxed rage-only variant.
          expect(
            validateCircuitRules(scenario.healthyCircuit, 'basic').filter(
              (d) => d.severity === 'error',
            ),
          ).toEqual([]);
          expect(
            validateCircuit(scenario.healthyCircuit, healthy, 'uk').issues.filter(
              (i) => i.severity === 'error',
            ),
          ).toEqual([]);
        }
      }
    }
  });

  /**
   * Direct test of the decoy exclusion.
   *
   * An earlier version of this suite only checked the *selected* fault across
   * a sample of scenarios. That was far too weak: measurement showed ~14 of
   * ~31 candidates touch the decoy, but weighted selection lands on one rarely
   * enough that deleting the filter entirely still passed. This asserts the
   * filter itself, over the whole candidate list, so removing it fails
   * immediately.
   */
  it('excludes every decoy-touching candidate from the fault pool', () => {
    let checked = 0;
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 8; seed++) {
        const generated = generateChallenge({ seed, difficulty, mode: 'rage' });
        const rng = createSeededRng({ generatorVersion: 1, seed, difficulty, mode: 'rage' });
        const staged = applyCircuitStage({
          circuit: generated.circuit,
          scenario: generated.scenario,
          difficulty,
          tier: 'rage-1',
          rng,
          expectedEnergisedLoadIds: generated.metadata.baseline.expectedEnergisedLoadIds,
        });
        if (staged.decoyComponentIds.length === 0) continue;

        const candidates = collectFaultCandidates(staged.circuit, {
          ...generated.scenario,
          faultCandidateWireIds: staged.faultCandidateWireIds,
        });
        const decoys = new Set(staged.decoyComponentIds);
        const touchesDecoy = (target: (typeof candidates)[number]['target']): boolean => {
          if (target.type === 'component') return decoys.has(target.id);
          if (target.type === 'port') return decoys.has(target.componentId);
          const wire = staged.circuit.wires.find((w) => w.id === target.id);
          return wire ? decoys.has(wire.fromComponentId) || decoys.has(wire.toComponentId) : false;
        };

        // The decoy must genuinely be a plausible suspect, or it is not a
        // herring — this guards the test itself against becoming vacuous.
        const tainted = candidates.filter((c) => touchesDecoy(c.target));
        expect(tainted.length).toBeGreaterThan(0);

        const ranked = applyCandidateStage({
          circuit: staged.circuit,
          candidates,
          loadComponentIds: generated.scenario.loadComponentIds,
          difficulty,
          tier: 'rage-1',
          rng,
          decoyComponentIds: staged.decoyComponentIds,
        });

        expect(ranked.candidates.length).toBeGreaterThan(0);
        for (const candidate of ranked.candidates) {
          expect(touchesDecoy(candidate.target), `${candidate.key} sits on a decoy`).toBe(false);
        }
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  /**
   * Direct test of the §26 honesty gate.
   *
   * Feeds the circuit stage a modifier whose transform genuinely breaks the
   * installation (it deletes a wire). The runner must throw the result away
   * and keep the original circuit. Without this, disabling the
   * `validateCandidate` call in the runner passed the whole suite — because
   * the shipped modifiers happen to be honest, nothing was exercising the gate
   * that catches a dishonest one.
   */
  it('discards a modifier whose transform breaks the circuit (§26 honesty gate)', () => {
    const generated = generateChallenge({ seed: 2, difficulty: 'intermediate', mode: 'rage' });

    const saboteur = RAGE_MODIFIERS.redHerring;
    const original = saboteur.transformCircuit;

    const runWith = (
      transform: NonNullable<typeof saboteur.transformCircuit>,
    ): ReturnType<typeof applyCircuitStage> => {
      saboteur.transformCircuit = transform;
      try {
        return applyCircuitStage({
          circuit: generated.circuit,
          scenario: generated.scenario,
          difficulty: 'intermediate',
          tier: 'rage-1',
          rng: createSeededRng({
            generatorVersion: 1,
            seed: 2,
            difficulty: 'intermediate',
            mode: 'rage',
          }),
          expectedEnergisedLoadIds: generated.metadata.baseline.expectedEnergisedLoadIds,
        });
      } finally {
        saboteur.transformCircuit = original;
      }
    };

    const expectRejected = (staged: ReturnType<typeof applyCircuitStage>) => {
      expect(staged.circuit.wires.length).toBe(generated.circuit.wires.length);
      expect(staged.circuit.components.length).toBe(generated.circuit.components.length);
      expect(staged.decoyComponentIds).toEqual([]);
      const record = staged.applications.find((a) => a.id === 'redHerring');
      expect(record?.applied).toBe(false);
      expect(record?.note).toMatch(/discarded/);
    };

    // Limb 1 — the `validateCandidate` gate, isolated.
    // A stray unwired component is structurally invalid but electrically
    // inert, so ONLY the validator can catch it. Severing a conductor would
    // trip the behavioural limb too and would not prove this one runs.
    expectRejected(
      runWith((input) => ({
        circuit: {
          ...input.circuit,
          components: [
            ...input.circuit.components,
            { id: 'stray-decoy', type: 'bulb', x: 900, y: 600, state: {} },
          ],
        },
        decoyComponentIds: [],
        faultCandidateWireIds: input.scenario.faultCandidateWireIds,
        note: 'stray component',
      })),
    );

    // Limb 2 — the behavioural check: a severed conductor kills a load.
    expectRejected(
      runWith((input) => ({
        circuit: { ...input.circuit, wires: input.circuit.wires.slice(1) },
        decoyComponentIds: [],
        faultCandidateWireIds: input.scenario.faultCandidateWireIds,
        note: 'severed conductor',
      })),
    );
  });

  it('never places the fault on a decoy — a red herring is always innocent', () => {
    for (const tier of ['rage-1', 'rage-3'] as const) {
      for (let seed = 1; seed <= 12; seed++) {
        const scenario = buildDiagnosisScenario({
          seed,
          difficulty: 'intermediate',
          rageTier: tier,
        });
        const decoys = new Set(scenario.rage?.decoyComponentIds ?? []);
        if (decoys.size === 0) continue;

        // Every fault, not just the first: a tier that grows a second fault
        // must not be able to smuggle one onto a decoy.
        for (const entry of scenario.faults) {
          const target = entry.fault.target;
          if (target.type === 'component') expect(decoys.has(target.id)).toBe(false);
          else if (target.type === 'port') expect(decoys.has(target.componentId)).toBe(false);
          else {
            const wire = scenario.healthyCircuit.wires.find((w) => w.id === target.id);
            expect(decoys.has(wire?.fromComponentId ?? '')).toBe(false);
            expect(decoys.has(wire?.toComponentId ?? '')).toBe(false);
          }
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// §24 / §42: the safety rule
// ---------------------------------------------------------------------------

describe('normal mode never receives Ohmageddon modifiers (plan §24, §42)', () => {
  it('produces rage === null for every normal scenario', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 10; seed++) {
        expect(buildDiagnosisScenario({ seed, difficulty }).rage).toBeNull();
      }
    }
  });

  it('produces a rage summary only when a tier is explicitly requested', () => {
    const normal = buildDiagnosisScenario({ seed: 4, difficulty: 'intermediate' });
    const rage = buildDiagnosisScenario({
      seed: 4,
      difficulty: 'intermediate',
      rageTier: 'rage-1',
    });
    expect(normal.rage).toBeNull();
    expect(rage.rage).not.toBeNull();
    expect(rage.rage?.tier).toBe('rage-1');
  });

  it('gives a normal scenario the full hint ladder', () => {
    const normal = buildDiagnosisScenario({ seed: 8, difficulty: 'advanced' });
    expect(normal.hints).toHaveLength(3);
    expect(normal.hints.some((h) => h.kind === 'location')).toBe(true);
  });

  it('keeps a normal scenario free of decoy components', () => {
    // Same seed, with and without rage: the rage one may be larger, the normal
    // one must match the raw generator exactly.
    const generated = generateChallenge({ seed: 6, difficulty: 'intermediate', mode: 'diagnosis' });
    const normal = buildDiagnosisScenario({ seed: 6, difficulty: 'intermediate' });
    expect(normal.healthyCircuit.components.length).toBe(generated.circuit.components.length);
    expect(normal.healthyCircuit.wires.length).toBe(generated.circuit.wires.length);
  });
});

// ---------------------------------------------------------------------------
// §57: determinism
// ---------------------------------------------------------------------------

describe('Ohmageddon modifiers are deterministic (plan §57)', () => {
  it('same seed + tier => byte-identical scenario', () => {
    for (const tier of RAGE_TIER_IDS) {
      for (let seed = 1; seed <= 5; seed++) {
        const a = buildDiagnosisScenario({ seed, difficulty: 'intermediate', rageTier: tier });
        const b = buildDiagnosisScenario({ seed, difficulty: 'intermediate', rageTier: tier });
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      }
    }
  });

  it('different tiers produce different challenge identities (§29)', () => {
    const ids = RAGE_TIER_IDS.map(
      (tier) =>
        buildDiagnosisScenario({ seed: 21, difficulty: 'intermediate', rageTier: tier })
          .challengeId,
    );
    ids.push(buildDiagnosisScenario({ seed: 21, difficulty: 'intermediate' }).challengeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tags rage scenarios with the ES-RAGE identity prefix', () => {
    const scenario = buildDiagnosisScenario({
      seed: 33,
      difficulty: 'beginner',
      rageTier: 'rage-1',
    });
    expect(scenario.challengeId.startsWith('ES-RAGE-')).toBe(true);
    expect(
      buildDiagnosisScenario({ seed: 33, difficulty: 'beginner' }).challengeId.startsWith(
        'ES-DIAG-',
      ),
    ).toBe(true);
  });
});
