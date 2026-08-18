/**
 * Challenge scoring (plan §17–§20, Phase C step 9).
 *
 * Rules taken directly from the plan:
 *   - §17 "Do not punish the user for using hints; use them for performance
 *     statistics." Hints therefore cost a *small* amount of the polish score
 *     and are recorded verbatim in the stats, but they can never fail a
 *     challenge or drop it below the passing band.
 *   - §18 "A wrong diagnosis should not destroy the challenge." Attempts are
 *     unlimited; extra submissions taper the score gently and never to zero.
 *   - §9 each difficulty carries a `parTimeSeconds`; beating par is rewarded,
 *     and overrunning it decays smoothly rather than falling off a cliff.
 *
 * Pure arithmetic — no clock reads, no persistence. Callers pass elapsed time.
 */

import { getDifficultyProfile } from '../difficulty/profiles';
import type { ChallengeDifficulty } from '../types';

export type ChallengeGrade = 'gold' | 'silver' | 'bronze' | 'complete';

export interface ScoreInput {
  difficulty: ChallengeDifficulty;
  /** Wall-clock time spent on the challenge. */
  elapsedMs: number;
  /** Submissions made, including the successful one. Minimum 1. */
  attempts: number;
  /** Hints revealed (plan §17). */
  hintsUsed: number;
}

export interface ChallengeScore {
  /** 0..1000, always > 0 for a completed challenge. */
  points: number;
  grade: ChallengeGrade;
  /** Component sub-scores, each 0..1, for the results breakdown. */
  breakdown: {
    speed: number;
    precision: number;
    independence: number;
  };
  parTimeSeconds: number;
  /** True when the learner finished inside par. */
  underPar: boolean;
}

const MAX_POINTS = 1000;

/** Weights sum to 1. Completion itself is the dominant reward. */
const WEIGHT_SPEED = 0.35;
const WEIGHT_PRECISION = 0.4;
const WEIGHT_INDEPENDENCE = 0.25;

/**
 * Floor applied to the weighted score so that *finishing* always beats not
 * finishing, however many attempts or hints it took (plan §17/§18).
 */
const COMPLETION_FLOOR = 0.4;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Speed: full marks at or under par, then a smooth decay. At 2× par the
 * learner still keeps half the speed score; at 4× par, a quarter.
 */
function speedScore(elapsedMs: number, parTimeSeconds: number): number {
  const parMs = parTimeSeconds * 1000;
  if (parMs <= 0) return 1;
  const elapsed = Math.max(0, elapsedMs);
  if (elapsed <= parMs) return 1;
  return clamp01(parMs / elapsed);
}

/** Precision: first-time-right is perfect; each extra attempt tapers. */
function precisionScore(attempts: number): number {
  const tries = Math.max(1, Math.floor(attempts));
  return clamp01(1 / (1 + 0.35 * (tries - 1)));
}

/**
 * Independence: within the difficulty's hint budget the cost is mild; beyond
 * it, steeper — but never zero, because hints are a learning tool, not a
 * penalty (plan §17).
 */
function independenceScore(hintsUsed: number, hintBudget: number): number {
  const hints = Math.max(0, Math.floor(hintsUsed));
  if (hints === 0) return 1;
  const budget = Math.max(1, hintBudget);
  const withinBudget = Math.min(hints, budget);
  const beyondBudget = Math.max(0, hints - budget);
  // 9% per hint inside the budget, 15% per hint beyond it.
  return clamp01(1 - withinBudget * 0.09 - beyondBudget * 0.15);
}

function gradeFor(points: number, underPar: boolean, attempts: number): ChallengeGrade {
  if (points >= 850 && underPar && attempts === 1) return 'gold';
  if (points >= 700) return 'silver';
  if (points >= 550) return 'bronze';
  return 'complete';
}

export function scoreChallenge(input: ScoreInput): ChallengeScore {
  const profile = getDifficultyProfile(input.difficulty);
  const parTimeSeconds = profile.parTimeSeconds;

  const speed = speedScore(input.elapsedMs, parTimeSeconds);
  const precision = precisionScore(input.attempts);
  const independence = independenceScore(input.hintsUsed, profile.hintBudget);

  const weighted =
    speed * WEIGHT_SPEED + precision * WEIGHT_PRECISION + independence * WEIGHT_INDEPENDENCE;
  const floored = COMPLETION_FLOOR + (1 - COMPLETION_FLOOR) * weighted;
  const points = Math.round(clamp01(floored) * MAX_POINTS);
  const underPar = input.elapsedMs <= parTimeSeconds * 1000;

  return {
    points,
    grade: gradeFor(points, underPar, Math.max(1, Math.floor(input.attempts))),
    breakdown: {
      speed: Math.round(speed * 100) / 100,
      precision: Math.round(precision * 100) / 100,
      independence: Math.round(independence * 100) / 100,
    },
    parTimeSeconds,
    underPar,
  };
}

/** `mm:ss` for the celebration panel (plan §19). */
export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
