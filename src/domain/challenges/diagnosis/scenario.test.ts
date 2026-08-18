/**
 * diagnosis/scenario.ts — tests (plan §12 mandatory observability,
 * §14 vague briefing, §15 answer options, §17 progressive hints,
 * §5 determinism, §29 identity).
 */

import { describe, expect, it } from 'vitest';
import { simulate } from '../../simulation';
import { getDifficultyProfile } from '../difficulty/profiles';
import type { ChallengeDifficulty } from '../types';
import { DiagnosisScenarioError, buildDiagnosisScenario, locationKeyFor } from './scenario';

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];

describe('buildDiagnosisScenario', () => {
  it('is deterministic: the same seed yields the same scenario', () => {
    for (const difficulty of DIFFICULTIES) {
      const a = buildDiagnosisScenario({ seed: 4242, difficulty });
      const b = buildDiagnosisScenario({ seed: 4242, difficulty });
      expect(a.challengeId).toBe(b.challengeId);
      expect(a.fault).toEqual(b.fault);
      expect(a.faultLocationKey).toBe(b.faultLocationKey);
      expect(a.faultTypeChoices).toEqual(b.faultTypeChoices);
      expect(JSON.stringify(a.faultedCircuit)).toBe(JSON.stringify(b.faultedCircuit));
    }
  });

  it('mints a diagnosis identity, not a challenge one (plan §29)', () => {
    const scenario = buildDiagnosisScenario({ seed: 7, difficulty: 'beginner' });
    expect(scenario.challengeId).toMatch(/^ES-DIAG-\d{6}$/);
    expect(scenario.identity.displayId).toBe(scenario.challengeId);
  });

  it('always injects exactly one fault, and it is observable (plan §12)', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 0; seed < 25; seed++) {
        const scenario = buildDiagnosisScenario({ seed: seed * 91 + 5, difficulty });
        expect(scenario.faultedCircuit.faults).toHaveLength(1);
        expect(scenario.faultedCircuit.faults?.[0]).toEqual(scenario.fault);
        expect(scenario.symptom.observable).toBe(true);
      }
    }
  });

  it('hands over a healthy circuit that genuinely works', () => {
    for (let seed = 0; seed < 15; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 37 + 2, difficulty: 'intermediate' });
      expect(simulate(scenario.healthyCircuit, { appMode: 'pro' }).errors).toHaveLength(0);
      expect(scenario.healthyCircuit.faults ?? []).toHaveLength(0);
    }
  });

  it('the faulted circuit really does behave differently from the healthy one', () => {
    for (let seed = 0; seed < 15; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 43 + 6, difficulty: 'intermediate' });
      const healthy = simulate(scenario.healthyCircuit, { appMode: 'pro' });
      const faulted = simulate(scenario.faultedCircuit, { appMode: 'pro' });
      const changed =
        healthy.energizedComponents.size !== faulted.energizedComponents.size ||
        healthy.errors.length !== faulted.errors.length ||
        healthy.errorComponents.size !== faulted.errorComponents.size ||
        healthy.errorWires.size !== faulted.errorWires.size ||
        (healthy.trippedComponents?.length ?? 0) !== (faulted.trippedComponents?.length ?? 0);
      expect(changed).toBe(true);
    }
  });

  it('offers the correct answer among the fault-type choices (§15A)', () => {
    for (const difficulty of DIFFICULTIES) {
      const expected = getDifficultyProfile(difficulty).diagnosticChoiceCount;
      for (let seed = 0; seed < 15; seed++) {
        const scenario = buildDiagnosisScenario({ seed: seed * 59 + 8, difficulty });
        const types = scenario.faultTypeChoices.map((c) => c.type);
        expect(types).toContain(scenario.fault.type);
        expect(new Set(types).size).toBe(types.length);
        expect(types.length).toBeLessThanOrEqual(expected);
      }
    }
  });

  it('offers the correct answer among the location choices (§15B)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 67 + 4, difficulty: 'advanced' });
      const keys = scenario.locationChoices.map((c) => c.key);
      expect(keys).toContain(scenario.faultLocationKey);
      expect(new Set(keys).size).toBe(keys.length);
      expect(keys.length).toBeGreaterThan(1);
    }
  });

  it('does not let the choice list shape leak the answer', () => {
    // If only one kind of location were ever offered, the fault's placement
    // would be deducible without any diagnosis at all.
    const scenario = buildDiagnosisScenario({ seed: 1234, difficulty: 'advanced' });
    expect(new Set(scenario.locationChoices.map((c) => c.kind)).size).toBeGreaterThan(1);
  });

  it('keeps the brief vague — it never names the fault type (plan §14)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 71 + 3, difficulty: 'intermediate' });
      const prose = `${scenario.complaint} ${scenario.brief}`.toLowerCase();
      expect(prose).not.toContain(scenario.fault.type.replace(/-/g, ' '));
      expect(prose).not.toContain(scenario.fault.type);
    }
  });

  it('supplies three progressive hints within the difficulty budget (§17)', () => {
    for (const difficulty of DIFFICULTIES) {
      const scenario = buildDiagnosisScenario({ seed: 999, difficulty });
      expect(scenario.hints.map((h) => h.level)).toEqual([1, 2, 3]);
      expect(scenario.hints.map((h) => h.kind)).toEqual(['observation', 'direction', 'location']);
      for (const hint of scenario.hints) expect(hint.text.length).toBeGreaterThan(10);
      expect(scenario.hintBudget).toBe(getDifficultyProfile(difficulty).hintBudget);
      expect(scenario.parTimeSeconds).toBe(getDifficultyProfile(difficulty).parTimeSeconds);
    }
  });

  it('only the final hint pinpoints the location', () => {
    for (let seed = 0; seed < 10; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 13 + 1, difficulty: 'intermediate' });
      const target = scenario.fault.target;
      const id = target.type === 'port' ? target.componentId : target.id;
      const label = scenario.locationChoices.find(
        (c) => c.key === scenario.faultLocationKey,
      )?.label;
      expect(scenario.hints[0].text).not.toContain(id);
      expect(scenario.hints[1].text).not.toContain(id);
      expect(label).toBeTruthy();
    }
  });

  it('does not mutate its returned circuits between calls', () => {
    const a = buildDiagnosisScenario({ seed: 88, difficulty: 'beginner' });
    a.faultedCircuit.wires.pop();
    const b = buildDiagnosisScenario({ seed: 88, difficulty: 'beginner' });
    expect(b.faultedCircuit.wires.length).toBe(a.healthyCircuit.wires.length);
  });

  it('reports the dead loads it describes', () => {
    for (let seed = 0; seed < 20; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 29 + 12, difficulty: 'beginner' });
      expect(scenario.deadLoadLabels).toHaveLength(scenario.symptom.deEnergisedLoadIds.length);
    }
  });

  it('gives up loudly rather than shipping an unobservable scenario (§37)', () => {
    expect(() =>
      buildDiagnosisScenario({ seed: 5, difficulty: 'beginner', maxAttempts: 0 }),
    ).toThrow(DiagnosisScenarioError);
  });
});

describe('locationKeyFor', () => {
  it('matches the key the scenario publishes', () => {
    for (let seed = 0; seed < 10; seed++) {
      const scenario = buildDiagnosisScenario({ seed: seed * 101 + 7, difficulty: 'advanced' });
      const target = scenario.fault.target;
      expect(
        locationKeyFor({
          type: scenario.fault.type,
          target,
          placement: 'wire',
          key: 'ignored',
        }),
      ).toBe(scenario.faultLocationKey);
    }
  });
});
