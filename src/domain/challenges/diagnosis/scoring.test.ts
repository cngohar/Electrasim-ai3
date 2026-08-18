/**
 * diagnosis/scoring.ts — tests (plan §17 "do not punish hints",
 * §18 "a wrong diagnosis must not destroy the challenge").
 */

import { describe, expect, it } from 'vitest';
import { getDifficultyProfile } from '../difficulty/profiles';
import type { ChallengeDifficulty } from '../types';
import { scoreDiagnosis } from './scoring';

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];

const perfect = {
  difficulty: 'beginner' as const,
  elapsedMs: 5_000,
  misdiagnoses: 0,
  incompleteRepairs: 0,
  hintsUsed: 0,
};

describe('scoreDiagnosis', () => {
  it('awards a top score for a fast, first-time-right, hint-free run', () => {
    const score = scoreDiagnosis(perfect);
    expect(score.points).toBe(1000);
    expect(score.grade).toBe('gold');
    expect(score.underPar).toBe(true);
    expect(score.firstTimeRight).toBe(true);
  });

  it('never returns zero for a completed exercise (§17/§18)', () => {
    const score = scoreDiagnosis({
      difficulty: 'advanced',
      elapsedMs: 60 * 60 * 1000,
      misdiagnoses: 50,
      incompleteRepairs: 50,
      hintsUsed: 99,
    });
    expect(score.points).toBeGreaterThanOrEqual(400);
    expect(score.grade).toBe('complete');
  });

  it('keeps points inside 0..1000 across a wide sweep', () => {
    for (const difficulty of DIFFICULTIES) {
      for (const elapsedMs of [0, 1_000, 200_000, 9_000_000]) {
        for (const misdiagnoses of [0, 1, 5, 20]) {
          for (const hintsUsed of [0, 1, 3, 10]) {
            const score = scoreDiagnosis({
              difficulty,
              elapsedMs,
              misdiagnoses,
              incompleteRepairs: 1,
              hintsUsed,
            });
            expect(score.points).toBeGreaterThanOrEqual(0);
            expect(score.points).toBeLessThanOrEqual(1000);
            for (const value of Object.values(score.breakdown)) {
              expect(value).toBeGreaterThanOrEqual(0);
              expect(value).toBeLessThanOrEqual(1);
            }
          }
        }
      }
    }
  });

  it('penalises a misdiagnosis more than an unfinished repair', () => {
    const misdiagnosed = scoreDiagnosis({ ...perfect, misdiagnoses: 1 });
    const unrepaired = scoreDiagnosis({ ...perfect, incompleteRepairs: 1 });
    expect(misdiagnosed.points).toBeLessThan(unrepaired.points);
    expect(unrepaired.points).toBeLessThan(1000);
  });

  it('treats hints as a mild, monotonic cost that never fails the run (§17)', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const hintsUsed of [0, 1, 2, 3, 5, 10]) {
      const score = scoreDiagnosis({ ...perfect, hintsUsed });
      expect(score.points).toBeLessThanOrEqual(previous);
      expect(score.points).toBeGreaterThan(0);
      previous = score.points;
    }
    // One hint must cost less than one wrong diagnosis.
    expect(scoreDiagnosis({ ...perfect, hintsUsed: 1 }).points).toBeGreaterThan(
      scoreDiagnosis({ ...perfect, misdiagnoses: 1 }).points,
    );
  });

  it('decays with time but stays above the floor', () => {
    const par = getDifficultyProfile('beginner').parTimeSeconds * 1000;
    const fast = scoreDiagnosis({ ...perfect, elapsedMs: par });
    const slow = scoreDiagnosis({ ...perfect, elapsedMs: par * 8 });
    expect(fast.underPar).toBe(true);
    expect(slow.underPar).toBe(false);
    expect(slow.points).toBeLessThan(fast.points);
    expect(slow.points).toBeGreaterThanOrEqual(400);
  });

  it('uses each difficulty\u2019s own par time (§9)', () => {
    for (const difficulty of DIFFICULTIES) {
      expect(scoreDiagnosis({ ...perfect, difficulty }).parTimeSeconds).toBe(
        getDifficultyProfile(difficulty).parTimeSeconds,
      );
    }
  });

  it('withholds gold once the learner has misdiagnosed', () => {
    expect(scoreDiagnosis({ ...perfect, misdiagnoses: 1 }).grade).not.toBe('gold');
    expect(scoreDiagnosis({ ...perfect, elapsedMs: 10 * 60 * 1000 }).grade).not.toBe('gold');
  });

  it('tolerates hostile input without producing NaN', () => {
    const score = scoreDiagnosis({
      difficulty: 'beginner',
      elapsedMs: Number.NaN,
      misdiagnoses: -5,
      incompleteRepairs: Number.NaN,
      hintsUsed: -1,
    });
    expect(Number.isFinite(score.points)).toBe(true);
    expect(score.points).toBeGreaterThanOrEqual(0);
  });
});
