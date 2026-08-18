/**
 * diagnosis/evaluator.ts — tests for the plan §41 truth table.
 *
 *   | diagnosis        | repair            | verdict    |
 *   |------------------|-------------------|------------|
 *   | correct type+loc | circuit recovered | success    |
 *   | correct type+loc | fault still live  | incomplete |
 *   | anything else    | —                 | failure    |
 *
 * Plus §16: never complete on a correct guess alone.
 */

import { describe, expect, it } from 'vitest';
import type { Circuit } from '../../types';
import { withoutFault } from '../faults/injection';
import { evaluateDiagnosis } from './evaluator';
import { buildDiagnosisScenario } from './scenario';

function scenarioFor(
  seed: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
) {
  const scenario = buildDiagnosisScenario({ seed, difficulty });
  const correct = { faultType: scenario.fault.type, locationKey: scenario.faultLocationKey };
  const repaired = withoutFault(scenario.faultedCircuit, scenario.fault.id);
  return { scenario, correct, repaired };
}

describe('evaluateDiagnosis — §41 truth table', () => {
  it('correct diagnosis + repaired circuit = success', () => {
    for (const difficulty of ['beginner', 'intermediate', 'advanced'] as const) {
      for (let seed = 0; seed < 12; seed++) {
        const { scenario, correct, repaired } = scenarioFor(seed * 83 + 5, difficulty);
        const result = evaluateDiagnosis(scenario, repaired, correct);
        expect(result.verdict).toBe('success');
        expect(result.success).toBe(true);
        expect(result.diagnosisCorrect).toBe(true);
        expect(result.recovered).toBe(true);
        expect(result.recoveryGap).toBeNull();
      }
    }
  });

  it('correct diagnosis + unrepaired circuit = incomplete, never success (§16)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const { scenario, correct } = scenarioFor(seed * 97 + 11);
      const result = evaluateDiagnosis(scenario, scenario.faultedCircuit, correct);
      expect(result.verdict).toBe('incomplete');
      expect(result.success).toBe(false);
      expect(result.diagnosisCorrect).toBe(true);
      expect(result.faultCleared).toBe(false);
      expect(result.recoveryGap).toBeTruthy();
    }
  });

  it('wrong fault type = failure, even on a repaired circuit', () => {
    for (let seed = 0; seed < 15; seed++) {
      const { scenario, repaired } = scenarioFor(seed * 53 + 7);
      const wrong = scenario.faultTypeChoices.find((c) => c.type !== scenario.fault.type);
      if (!wrong) continue;
      const result = evaluateDiagnosis(scenario, repaired, {
        faultType: wrong.type,
        locationKey: scenario.faultLocationKey,
      });
      expect(result.verdict).toBe('failure');
      expect(result.typeCorrect).toBe(false);
      expect(result.locationCorrect).toBe(true);
    }
  });

  it('wrong location = failure, even with the right fault type', () => {
    for (let seed = 0; seed < 15; seed++) {
      const { scenario, repaired } = scenarioFor(seed * 61 + 13);
      const wrong = scenario.locationChoices.find((c) => c.key !== scenario.faultLocationKey);
      if (!wrong) continue;
      const result = evaluateDiagnosis(scenario, repaired, {
        faultType: scenario.fault.type,
        locationKey: wrong.key,
      });
      expect(result.verdict).toBe('failure');
      expect(result.typeCorrect).toBe(true);
      expect(result.locationCorrect).toBe(false);
    }
  });
});

describe('evaluateDiagnosis — what counts as a repair', () => {
  it('accepts a cable replaced by a new one between the same terminals', () => {
    let checked = 0;
    for (let seed = 0; seed < 30 && checked < 6; seed++) {
      const { scenario, correct } = scenarioFor(seed * 313 + 11);
      if (scenario.fault.target.type !== 'wire') continue;
      const id = scenario.fault.target.id;
      const old = scenario.faultedCircuit.wires.find((w) => w.id === id);
      if (!old) continue;
      const circuit: Circuit = {
        ...scenario.faultedCircuit,
        wires: [
          ...scenario.faultedCircuit.wires.filter((w) => w.id !== id),
          { ...old, id: `wire_replacement_${seed}`, fault: undefined },
        ],
        faults: [],
      };
      expect(evaluateDiagnosis(scenario, circuit, correct).verdict).toBe('success');
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('rejects "repair by deletion" — cutting the faulty wire out is not a fix', () => {
    let checked = 0;
    for (let seed = 0; seed < 40 && checked < 8; seed++) {
      const { scenario, correct } = scenarioFor(seed * 313 + 11);
      if (scenario.fault.target.type !== 'wire') continue;
      const id = scenario.fault.target.id;
      const circuit: Circuit = {
        ...scenario.faultedCircuit,
        wires: scenario.faultedCircuit.wires.filter((w) => w.id !== id),
        faults: [],
      };
      const result = evaluateDiagnosis(scenario, circuit, correct);
      expect(result.verdict).toBe('incomplete');
      expect(result.success).toBe(false);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('rejects deleting the load to silence the symptom', () => {
    for (let seed = 0; seed < 10; seed++) {
      const { scenario, correct } = scenarioFor(seed * 149 + 3);
      const loadId = scenario.loadComponentIds[0];
      if (!loadId) continue;
      const circuit: Circuit = {
        ...scenario.faultedCircuit,
        components: scenario.faultedCircuit.components.filter((c) => c.id !== loadId),
        wires: scenario.faultedCircuit.wires.filter(
          (w) => w.fromComponentId !== loadId && w.toComponentId !== loadId,
        ),
        faults: [],
      };
      expect(evaluateDiagnosis(scenario, circuit, correct).success).toBe(false);
    }
  });
});

describe('evaluateDiagnosis — feedback', () => {
  it('never reveals the fault location while the answer is still wrong (§14/§17)', () => {
    for (let seed = 0; seed < 15; seed++) {
      const { scenario, repaired } = scenarioFor(seed * 71 + 9);
      const wrong = scenario.faultTypeChoices.find((c) => c.type !== scenario.fault.type);
      if (!wrong) continue;
      const result = evaluateDiagnosis(scenario, repaired, {
        faultType: wrong.type,
        locationKey: scenario.faultLocationKey,
      });
      const target = scenario.fault.target;
      const id = target.type === 'port' ? target.componentId : target.id;
      expect(result.guidance).not.toContain(id);
      expect(result.guidance.length).toBeGreaterThan(10);
    }
  });

  it('tells a learner who found it but has not fixed it what to do next', () => {
    const { scenario, correct } = scenarioFor(2024);
    const result = evaluateDiagnosis(scenario, scenario.faultedCircuit, correct);
    expect(result.verdict).toBe('incomplete');
    expect(result.guidance.toLowerCase()).toContain('clear');
  });

  it('distinguishes the two half-right answers in its summary', () => {
    const { scenario, repaired } = scenarioFor(31337);
    const wrongType = scenario.faultTypeChoices.find((c) => c.type !== scenario.fault.type);
    const wrongLoc = scenario.locationChoices.find((c) => c.key !== scenario.faultLocationKey);
    if (wrongType) {
      const r = evaluateDiagnosis(scenario, repaired, {
        faultType: wrongType.type,
        locationKey: scenario.faultLocationKey,
      });
      expect(r.summary.toLowerCase()).toContain('place');
    }
    if (wrongLoc) {
      const r = evaluateDiagnosis(scenario, repaired, {
        faultType: scenario.fault.type,
        locationKey: wrongLoc.key,
      });
      expect(r.summary.toLowerCase()).toContain('kind');
    }
  });

  it('always returns a simulation of the submitted circuit', () => {
    const { scenario, correct, repaired } = scenarioFor(4711);
    expect(evaluateDiagnosis(scenario, repaired, correct).simulation).toBeTruthy();
  });
});
