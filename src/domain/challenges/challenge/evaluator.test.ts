/**
 * evaluator.ts — four-gate submission tests (plan §38–44).
 *
 * The decisive property (plan §51 step 6/7): a *correct rebuild under
 * different ids* must pass, and every meaningful corruption must fail.
 */

import { describe, expect, it } from 'vitest';
import type { Circuit } from '../../types';
import type { ChallengeDifficulty } from '../types';
import { evaluateChallenge } from './evaluator';
import { type ChallengeScenario, buildChallengeScenario } from './scenario';

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];

/** Rebuild a circuit with fresh ids and shuffled order — what a learner makes. */
function rebuild(circuit: Circuit, salt = 1): Circuit {
  const map = new Map<string, string>();
  circuit.components.forEach((component, index) => map.set(component.id, `user-${salt}-${index}`));
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
    components: components.reverse(),
    wires: wires.reverse(),
    globalVoltage: circuit.globalVoltage,
  };
}

const clone = (circuit: Circuit): Circuit => JSON.parse(JSON.stringify(circuit));

function scenarioFor(difficulty: ChallengeDifficulty, seed = 12): ChallengeScenario {
  return buildChallengeScenario({ seed, difficulty });
}

describe('evaluateChallenge — success path', () => {
  it.each(DIFFICULTIES)('accepts a correct rebuild for %s', (difficulty) => {
    const scenario = scenarioFor(difficulty);
    const result = evaluateChallenge(scenario, rebuild(scenario.targetCircuit));
    expect(result.success).toBe(true);
    expect(result.stage).toBe('complete');
    expect(result.issues).toHaveLength(0);
    expect(result.completion).toBe(1);
  });

  it('accepts the target circuit verbatim', () => {
    const scenario = scenarioFor('beginner');
    expect(evaluateChallenge(scenario, scenario.targetCircuit).success).toBe(true);
  });

  it('accepts correct rebuilds across many seeds', () => {
    let passed = 0;
    const total = 30;
    for (let seed = 1; seed <= total; seed += 1) {
      const scenario = scenarioFor('intermediate', seed);
      if (evaluateChallenge(scenario, rebuild(scenario.targetCircuit, seed)).success) passed += 1;
    }
    expect(passed).toBe(total);
  });
});

describe('evaluateChallenge — rejection paths', () => {
  it('rejects the starting circuit', () => {
    const scenario = scenarioFor('beginner');
    const result = evaluateChallenge(scenario, scenario.startingCircuit);
    expect(result.success).toBe(false);
  });

  it('rejects an empty canvas at the structure gate', () => {
    const scenario = scenarioFor('beginner');
    const result = evaluateChallenge(scenario, {
      components: [],
      wires: [],
      globalVoltage: 230,
    });
    expect(result.success).toBe(false);
    expect(result.stage).toBe('structure');
    expect(result.completion).toBe(0);
  });

  it('fails the structure gate on a dangling wire', () => {
    const scenario = scenarioFor('beginner');
    const user = rebuild(scenario.targetCircuit);
    user.wires.push({
      ...user.wires[0],
      id: 'dangling',
      toComponentId: 'does-not-exist',
    });
    const result = evaluateChallenge(scenario, user);
    expect(result.success).toBe(false);
    expect(result.stage).toBe('structure');
  });

  it('fails when a required wire is missing', () => {
    for (const difficulty of DIFFICULTIES) {
      const scenario = scenarioFor(difficulty);
      const user = rebuild(scenario.targetCircuit);
      user.wires.pop();
      expect(evaluateChallenge(scenario, user).success).toBe(false);
    }
  });

  it('fails when an extra component is added', () => {
    const scenario = scenarioFor('beginner');
    const user = rebuild(scenario.targetCircuit);
    const first = user.components[0];
    user.components.push({ ...first, id: 'extra-1', x: first.x + 400 });
    const result = evaluateChallenge(scenario, user);
    expect(result.success).toBe(false);
  });

  it('fails when a wire endpoint is moved to the wrong component', () => {
    let rejected = 0;
    const total = 20;
    for (let seed = 1; seed <= total; seed += 1) {
      const scenario = scenarioFor('intermediate', seed);
      const user = clone(scenario.targetCircuit);
      const target = user.wires[seed % user.wires.length];
      const other = user.components.find(
        (component) =>
          component.id !== target.toComponentId && component.id !== target.fromComponentId,
      );
      if (!other) continue;
      target.toComponentId = other.id;
      target.toPortIndex = 0;
      if (!evaluateChallenge(scenario, user).success) rejected += 1;
    }
    expect(rejected).toBe(total);
  });

  it('reports unenergised loads when the return path is cut', () => {
    const scenario = scenarioFor('beginner');
    const user = rebuild(scenario.targetCircuit);
    // remove the wire that reaches a neutral terminal
    const neutralIndex = user.wires.findIndex((wire) => {
      const to = user.components.find((c) => c.id === wire.toComponentId);
      const from = user.components.find((c) => c.id === wire.fromComponentId);
      return to?.type === 'neutral-terminal' || from?.type === 'neutral-terminal';
    });
    if (neutralIndex >= 0) user.wires.splice(neutralIndex, 1);
    const result = evaluateChallenge(scenario, user);
    expect(result.success).toBe(false);
    // Either the graph diff or the simulation catches it; both are valid,
    // but the learner must always get an actionable message.
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('evaluateChallenge — reporting quality', () => {
  it('always supplies a non-empty summary and human-readable issues', () => {
    const scenario = scenarioFor('advanced');
    const user = rebuild(scenario.targetCircuit);
    user.wires.splice(0, 2);
    const result = evaluateChallenge(scenario, user);
    expect(result.summary.length).toBeGreaterThan(0);
    for (const issue of result.issues) {
      expect(issue.message.length).toBeGreaterThan(0);
      expect(issue.message).not.toMatch(/undefined|NaN|\[object/);
    }
  });

  it('keeps completion between 0 and 1', () => {
    for (const difficulty of DIFFICULTIES) {
      const scenario = scenarioFor(difficulty);
      const partial = rebuild(scenario.targetCircuit);
      partial.wires = partial.wires.slice(0, 1);
      const result = evaluateChallenge(scenario, partial);
      expect(result.completion).toBeGreaterThanOrEqual(0);
      expect(result.completion).toBeLessThanOrEqual(1);
    }
  });

  it('does not mutate the submitted circuit', () => {
    const scenario = scenarioFor('intermediate');
    const user = rebuild(scenario.targetCircuit);
    const before = JSON.stringify(user);
    evaluateChallenge(scenario, user);
    expect(JSON.stringify(user)).toBe(before);
  });

  it('does not mutate the scenario target', () => {
    const scenario = scenarioFor('intermediate');
    const before = JSON.stringify(scenario.targetCircuit);
    evaluateChallenge(scenario, rebuild(scenario.targetCircuit));
    expect(JSON.stringify(scenario.targetCircuit)).toBe(before);
  });

  it('is deterministic — repeated evaluation gives the same verdict', () => {
    const scenario = scenarioFor('advanced');
    const user = rebuild(scenario.targetCircuit);
    user.wires.pop();
    const a = evaluateChallenge(scenario, user);
    const b = evaluateChallenge(scenario, user);
    expect(a.success).toBe(b.success);
    expect(a.stage).toBe(b.stage);
    expect(a.completion).toBe(b.completion);
  });
});
