/**
 * scenario.ts — Challenge Mode briefing tests (plan §38–44).
 */

import { describe, expect, it } from 'vitest';
import { COMPONENT_DEFS } from '../../components';
import type { ChallengeDifficulty } from '../types';
import { buildChallengeScenario } from './scenario';

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];

describe('buildChallengeScenario', () => {
  it('is deterministic for the same seed and difficulty', () => {
    const a = buildChallengeScenario({ seed: 4242, difficulty: 'intermediate' });
    const b = buildChallengeScenario({ seed: 4242, difficulty: 'intermediate' });
    expect(a.challengeId).toBe(b.challengeId);
    expect(a.recipeId).toBe(b.recipeId);
    expect(JSON.stringify(a.targetCircuit)).toBe(JSON.stringify(b.targetCircuit));
  });

  it('produces different challenges for different seeds', () => {
    const ids = new Set(
      Array.from(
        { length: 25 },
        (_, i) => buildChallengeScenario({ seed: i + 1, difficulty: 'beginner' }).identity.hash,
      ),
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it.each(DIFFICULTIES)('builds a complete scenario for %s', (difficulty) => {
    const scenario = buildChallengeScenario({ seed: 99, difficulty });
    expect(scenario.title.length).toBeGreaterThan(0);
    expect(scenario.objective.length).toBeGreaterThan(0);
    expect(scenario.brief.length).toBeGreaterThan(0);
    expect(scenario.difficulty).toBe(difficulty);
    expect(scenario.targetCircuit.components.length).toBeGreaterThan(0);
    expect(scenario.targetWireCount).toBe(scenario.targetCircuit.wires.length);
    expect(scenario.targetComponentCount).toBe(scenario.targetCircuit.components.length);
  });

  it('seeds the editor with supply terminals only, and no wires', () => {
    for (const difficulty of DIFFICULTIES) {
      const scenario = buildChallengeScenario({ seed: 7, difficulty });
      expect(scenario.startingCircuit.wires).toHaveLength(0);
      expect(scenario.startingCircuit.components.length).toBeGreaterThan(0);
      for (const component of scenario.startingCircuit.components) {
        expect(COMPONENT_DEFS[component.type]?.isSource).toBe(true);
      }
      // the starting set is strictly smaller than the answer
      expect(scenario.startingCircuit.components.length).toBeLessThan(
        scenario.targetCircuit.components.length,
      );
    }
  });

  it('does not mutate the target when building the starting circuit', () => {
    const scenario = buildChallengeScenario({ seed: 11, difficulty: 'beginner' });
    const before = JSON.stringify(scenario.targetCircuit);
    scenario.startingCircuit.components[0].state.on = false;
    expect(JSON.stringify(scenario.targetCircuit)).toBe(before);
  });

  it('lists every component type in the requirements with correct counts', () => {
    const scenario = buildChallengeScenario({ seed: 21, difficulty: 'advanced' });
    const actual = new Map<string, number>();
    for (const component of scenario.targetCircuit.components) {
      actual.set(component.type, (actual.get(component.type) ?? 0) + 1);
    }
    expect(scenario.componentRequirements).toHaveLength(actual.size);
    for (const requirement of scenario.componentRequirements) {
      expect(requirement.count).toBe(actual.get(requirement.type));
    }
    const summed = scenario.componentRequirements.reduce((n, r) => n + r.count, 0);
    expect(summed).toBe(scenario.targetComponentCount);
  });

  it('labels protective devices with the instance rating, not the catalogue default', () => {
    // Regression: the registry label embeds a default (e.g. "MCB Type B (16A)")
    // which contradicted a generated 6 A device in the brief.
    for (let seed = 1; seed <= 40; seed += 1) {
      const scenario = buildChallengeScenario({ seed, difficulty: 'intermediate' });
      for (const requirement of scenario.componentRequirements) {
        const instances = scenario.targetCircuit.components.filter(
          (component) => component.type === requirement.type,
        );
        const ratings = [
          ...new Set(
            instances
              .map((instance) => instance.state.customMaxAmps)
              .filter((amps): amps is number => typeof amps === 'number'),
          ),
        ];
        for (const rating of ratings) {
          expect(requirement.label).toContain(`${rating} A`);
        }
        // never two amp parentheticals
        expect(requirement.label.match(/\(/g)?.length ?? 0).toBeLessThanOrEqual(1);
      }
    }
  });

  it('provides exactly three escalating hints within the difficulty budget', () => {
    for (const difficulty of DIFFICULTIES) {
      const scenario = buildChallengeScenario({ seed: 33, difficulty });
      expect(scenario.hints).toHaveLength(3);
      expect(scenario.hints.map((h) => h.level)).toEqual([1, 2, 3]);
      expect(scenario.hints.map((h) => h.kind)).toEqual(['observation', 'direction', 'location']);
      for (const hint of scenario.hints) expect(hint.text.length).toBeGreaterThan(10);
      expect(scenario.hintBudget).toBeGreaterThan(0);
      expect(scenario.parTimeSeconds).toBeGreaterThan(0);
    }
  });

  it('never leaks target component ids into learner-visible text', () => {
    const scenario = buildChallengeScenario({ seed: 5, difficulty: 'advanced' });
    const visible = [
      scenario.objective,
      scenario.brief,
      ...scenario.hints.map((h) => h.text),
      ...scenario.componentRequirements.map((r) => r.label),
    ].join(' ');
    for (const component of scenario.targetCircuit.components) {
      expect(visible).not.toContain(component.id);
    }
  });

  it('honours a pinned recipe id', () => {
    const scenario = buildChallengeScenario({
      seed: 3,
      difficulty: 'beginner',
      recipeId: 'beginner-switched-light',
    });
    expect(scenario.recipeId).toBe('beginner-switched-light');
  });

  it('expects at least one energised load', () => {
    for (const difficulty of DIFFICULTIES) {
      const scenario = buildChallengeScenario({ seed: 64, difficulty });
      expect(scenario.expectedEnergisedLoadIds.length).toBeGreaterThan(0);
    }
  });
});
