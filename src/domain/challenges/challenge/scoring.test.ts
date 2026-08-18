/**
 * scoring.ts — tests (plan §17 "do not punish hints", §18 "a wrong answer
 * must not destroy the challenge").
 */

import { describe, expect, it } from 'vitest';
import { getDifficultyProfile } from '../difficulty/profiles';
import { formatElapsed, scoreChallenge } from './scoring';

const perfect = {
  difficulty: 'beginner' as const,
  elapsedMs: 10_000,
  attempts: 1,
  hintsUsed: 0,
};

describe('scoreChallenge', () => {
  it('awards a top score for a fast, first-try, hint-free run', () => {
    const score = scoreChallenge(perfect);
    expect(score.points).toBe(1000);
    expect(score.grade).toBe('gold');
    expect(score.underPar).toBe(true);
  });

  it('never returns zero for a completed challenge (plan §17/§18)', () => {
    const score = scoreChallenge({
      difficulty: 'advanced',
      elapsedMs: 60 * 60 * 1000,
      attempts: 50,
      hintsUsed: 99,
    });
    expect(score.points).toBeGreaterThan(0);
    expect(score.points).toBeGreaterThanOrEqual(400); // the completion floor
  });

  it('keeps points within 0..1000 across a wide input sweep', () => {
    for (const difficulty of ['beginner', 'intermediate', 'advanced'] as const) {
      for (const elapsedMs of [0, 1000, 200_000, 5_000_000]) {
        for (const attempts of [1, 2, 10]) {
          for (const hintsUsed of [0, 1, 3, 10]) {
            const score = scoreChallenge({ difficulty, elapsedMs, attempts, hintsUsed });
            expect(score.points).toBeGreaterThanOrEqual(0);
            expect(score.points).toBeLessThanOrEqual(1000);
            expect(Number.isInteger(score.points)).toBe(true);
          }
        }
      }
    }
  });

  it('penalises hints only mildly (plan §17)', () => {
    const none = scoreChallenge(perfect);
    const oneHint = scoreChallenge({ ...perfect, hintsUsed: 1 });
    const drop = none.points - oneHint.points;
    expect(drop).toBeGreaterThan(0);
    // a single hint must cost less than 10% of the total
    expect(drop).toBeLessThan(100);
  });

  it('decreases monotonically as hints increase', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let hintsUsed = 0; hintsUsed <= 6; hintsUsed += 1) {
      const score = scoreChallenge({ ...perfect, hintsUsed });
      expect(score.points).toBeLessThanOrEqual(previous);
      previous = score.points;
    }
  });

  it('decreases monotonically as attempts increase', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let attempts = 1; attempts <= 8; attempts += 1) {
      const score = scoreChallenge({ ...perfect, attempts });
      expect(score.points).toBeLessThanOrEqual(previous);
      previous = score.points;
    }
  });

  it('decreases monotonically as time increases', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const elapsedMs of [1000, 60_000, 120_000, 600_000, 3_600_000]) {
      const score = scoreChallenge({ ...perfect, elapsedMs });
      expect(score.points).toBeLessThanOrEqual(previous);
      previous = score.points;
    }
  });

  it('treats anything at or under par as full speed marks', () => {
    const par = getDifficultyProfile('intermediate').parTimeSeconds * 1000;
    const atPar = scoreChallenge({ ...perfect, difficulty: 'intermediate', elapsedMs: par });
    const wellUnder = scoreChallenge({
      ...perfect,
      difficulty: 'intermediate',
      elapsedMs: par / 4,
    });
    expect(atPar.breakdown.speed).toBe(1);
    expect(wellUnder.breakdown.speed).toBe(1);
    expect(atPar.underPar).toBe(true);
  });

  it('flags overrunning par', () => {
    const par = getDifficultyProfile('beginner').parTimeSeconds * 1000;
    const score = scoreChallenge({ ...perfect, elapsedMs: par + 1000 });
    expect(score.underPar).toBe(false);
    expect(score.breakdown.speed).toBeLessThan(1);
  });

  it('reserves gold for a flawless first attempt inside par', () => {
    expect(scoreChallenge({ ...perfect, attempts: 2 }).grade).not.toBe('gold');
    const par = getDifficultyProfile('beginner').parTimeSeconds * 1000;
    expect(scoreChallenge({ ...perfect, elapsedMs: par * 3 }).grade).not.toBe('gold');
  });

  it('handles degenerate inputs without producing NaN', () => {
    for (const input of [
      { ...perfect, elapsedMs: -5 },
      { ...perfect, attempts: 0 },
      { ...perfect, attempts: -3 },
      { ...perfect, hintsUsed: -1 },
      { ...perfect, elapsedMs: Number.NaN },
    ]) {
      const score = scoreChallenge(input);
      expect(Number.isFinite(score.points)).toBe(true);
      expect(score.points).toBeGreaterThanOrEqual(0);
    }
  });

  it('reports the difficulty par time', () => {
    for (const difficulty of ['beginner', 'intermediate', 'advanced'] as const) {
      expect(scoreChallenge({ ...perfect, difficulty }).parTimeSeconds).toBe(
        getDifficultyProfile(difficulty).parTimeSeconds,
      );
    }
  });
});

describe('formatElapsed', () => {
  it('formats mm:ss', () => {
    expect(formatElapsed(0)).toBe('00:00');
    expect(formatElapsed(9000)).toBe('00:09');
    expect(formatElapsed(65_000)).toBe('01:05');
    expect(formatElapsed(3_600_000)).toBe('60:00');
  });

  it('clamps negatives', () => {
    expect(formatElapsed(-1000)).toBe('00:00');
  });
});
