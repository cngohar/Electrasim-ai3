/**
 * Challenge persistence — active challenge + aggregate stats (plan §20, §21).
 *
 * "Use the existing IndexedDB infrastructure. Do not create another
 * persistence mechanism." — so this module uses the very same `idb-keyval`
 * store that `persistence.ts` already uses for the circuit graph, with its
 * own keys and its own schema version. No new DB, no new library.
 *
 * Two records:
 *   - `activeChallenge` (§21) — enough to resume after a reload. Only the
 *     seed/version/difficulty are stored for the *scenario*, because the
 *     generator is deterministic: the circuit is regenerated, never stored.
 *   - `challengeStats` (§20) — small aggregate counters. Explicitly NOT a
 *     per-event log ("do not store every pointer event").
 *
 * Every function is non-throwing: a storage failure must never break the
 * editor, exactly like the circuit autosave.
 */

import { get, set } from 'idb-keyval';
import type { ChallengeDifficulty } from '../domain/challenges';

const SCHEMA_VERSION = 1 as const;
const ACTIVE_KEY = `electrasim:challenge:active:v${SCHEMA_VERSION}`;
const STATS_KEY = `electrasim:challenge:stats:v${SCHEMA_VERSION}`;

/** Lifecycle of a challenge run (plan §34). */
export type ChallengeStatus =
  | 'idle'
  | 'generating'
  | 'active'
  | 'evaluating'
  | 'completed'
  | 'abandoned';

/** The resumable slice of a challenge run (plan §21). */
export interface ActiveChallengeRecord {
  version: typeof SCHEMA_VERSION;
  seed: number;
  generatorVersion: number;
  difficulty: ChallengeDifficulty;
  mode: 'challenge';
  challengeId: string;
  status: Extract<ChallengeStatus, 'active' | 'evaluating'>;
  attempts: number;
  hintsUsed: number;
  startedAt: number;
  /** Accumulated time, excluding the currently running segment. */
  elapsedMs: number;
  savedAt: number;
}

/** Aggregate performance counters (plan §20). */
export interface ChallengeStatsRecord {
  version: typeof SCHEMA_VERSION;
  totalStarted: number;
  completed: number;
  abandoned: number;
  totalAttempts: number;
  totalHints: number;
  totalTimeMs: number;
  bestTimeMs: number | null;
  totalPoints: number;
  byDifficulty: Record<
    ChallengeDifficulty,
    { started: number; completed: number; bestTimeMs: number | null }
  >;
  /** Per-recipe completion counts — which circuit types the learner knows. */
  byRecipe: Record<string, { started: number; completed: number }>;
  updatedAt: number;
}

export const EMPTY_STATS: ChallengeStatsRecord = {
  version: SCHEMA_VERSION,
  totalStarted: 0,
  completed: 0,
  abandoned: 0,
  totalAttempts: 0,
  totalHints: 0,
  totalTimeMs: 0,
  bestTimeMs: null,
  totalPoints: 0,
  byDifficulty: {
    beginner: { started: 0, completed: 0, bestTimeMs: null },
    intermediate: { started: 0, completed: 0, bestTimeMs: null },
    advanced: { started: 0, completed: 0, bestTimeMs: null },
  },
  byRecipe: {},
  updatedAt: 0,
};

/** Derived view used by the stats panel. */
export interface ChallengeStatsSummary {
  totalStarted: number;
  completed: number;
  abandoned: number;
  completionRate: number;
  averageAttempts: number;
  averageHints: number;
  averageTimeMs: number;
  bestTimeMs: number | null;
  totalPoints: number;
}

// ── Guards ─────────────────────────────────────────────────────────────────

const DIFFICULTIES: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];

function isActiveRecord(value: unknown): value is ActiveChallengeRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<ActiveChallengeRecord>;
  return (
    record.version === SCHEMA_VERSION &&
    typeof record.seed === 'number' &&
    Number.isFinite(record.seed) &&
    typeof record.generatorVersion === 'number' &&
    typeof record.challengeId === 'string' &&
    typeof record.attempts === 'number' &&
    typeof record.hintsUsed === 'number' &&
    typeof record.startedAt === 'number' &&
    typeof record.elapsedMs === 'number' &&
    typeof record.difficulty === 'string' &&
    DIFFICULTIES.includes(record.difficulty as ChallengeDifficulty)
  );
}

function isStatsRecord(value: unknown): value is ChallengeStatsRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<ChallengeStatsRecord>;
  return (
    record.version === SCHEMA_VERSION &&
    typeof record.totalStarted === 'number' &&
    typeof record.completed === 'number' &&
    typeof record.byDifficulty === 'object' &&
    record.byDifficulty !== null
  );
}

// ── Active challenge (§21) ─────────────────────────────────────────────────

export async function loadActiveChallenge(): Promise<ActiveChallengeRecord | null> {
  try {
    const raw = await get(ACTIVE_KEY);
    return isActiveRecord(raw) ? raw : null;
  } catch (err) {
    console.warn('[challenge] load active failed:', err);
    return null;
  }
}

export async function saveActiveChallenge(
  record: Omit<ActiveChallengeRecord, 'version' | 'savedAt'>,
): Promise<boolean> {
  try {
    await set(ACTIVE_KEY, { ...record, version: SCHEMA_VERSION, savedAt: Date.now() });
    return true;
  } catch (err) {
    console.warn('[challenge] save active failed:', err);
    return false;
  }
}

/** Clear the active challenge — on completion or abandonment (plan §21). */
export async function clearActiveChallenge(): Promise<void> {
  try {
    await set(ACTIVE_KEY, undefined);
  } catch (err) {
    console.warn('[challenge] clear active failed:', err);
  }
}

// ── Aggregate stats (§20) ──────────────────────────────────────────────────

export async function loadChallengeStats(): Promise<ChallengeStatsRecord> {
  try {
    const raw = await get(STATS_KEY);
    if (!isStatsRecord(raw)) return { ...EMPTY_STATS };
    // Defensive merge — a partially-written record must not crash the panel.
    return {
      ...EMPTY_STATS,
      ...raw,
      byDifficulty: { ...EMPTY_STATS.byDifficulty, ...raw.byDifficulty },
      byRecipe: { ...raw.byRecipe },
    };
  } catch (err) {
    console.warn('[challenge] load stats failed:', err);
    return { ...EMPTY_STATS };
  }
}

async function writeStats(stats: ChallengeStatsRecord): Promise<boolean> {
  try {
    await set(STATS_KEY, { ...stats, version: SCHEMA_VERSION, updatedAt: Date.now() });
    return true;
  } catch (err) {
    console.warn('[challenge] save stats failed:', err);
    return false;
  }
}

function bumpDifficulty(
  stats: ChallengeStatsRecord,
  difficulty: ChallengeDifficulty,
  patch: Partial<{ started: number; completed: number; bestTimeMs: number | null }>,
): ChallengeStatsRecord['byDifficulty'] {
  const current = stats.byDifficulty[difficulty] ?? { started: 0, completed: 0, bestTimeMs: null };
  return {
    ...stats.byDifficulty,
    [difficulty]: {
      started: current.started + (patch.started ?? 0),
      completed: current.completed + (patch.completed ?? 0),
      bestTimeMs:
        patch.bestTimeMs === undefined || patch.bestTimeMs === null
          ? current.bestTimeMs
          : current.bestTimeMs === null
            ? patch.bestTimeMs
            : Math.min(current.bestTimeMs, patch.bestTimeMs),
    },
  };
}

function bumpRecipe(
  stats: ChallengeStatsRecord,
  recipeId: string,
  patch: { started?: number; completed?: number },
): ChallengeStatsRecord['byRecipe'] {
  const current = stats.byRecipe[recipeId] ?? { started: 0, completed: 0 };
  return {
    ...stats.byRecipe,
    [recipeId]: {
      started: current.started + (patch.started ?? 0),
      completed: current.completed + (patch.completed ?? 0),
    },
  };
}

/** Record that a challenge was started. */
export async function recordChallengeStarted(input: {
  difficulty: ChallengeDifficulty;
  recipeId: string;
}): Promise<ChallengeStatsRecord> {
  const stats = await loadChallengeStats();
  const next: ChallengeStatsRecord = {
    ...stats,
    totalStarted: stats.totalStarted + 1,
    byDifficulty: bumpDifficulty(stats, input.difficulty, { started: 1 }),
    byRecipe: bumpRecipe(stats, input.recipeId, { started: 1 }),
    updatedAt: Date.now(),
  };
  await writeStats(next);
  return next;
}

/** Record a successful completion (plan §20/§21: also clears the active run). */
export async function recordChallengeCompleted(input: {
  difficulty: ChallengeDifficulty;
  recipeId: string;
  elapsedMs: number;
  attempts: number;
  hintsUsed: number;
  points: number;
}): Promise<ChallengeStatsRecord> {
  const stats = await loadChallengeStats();
  const next: ChallengeStatsRecord = {
    ...stats,
    completed: stats.completed + 1,
    totalAttempts: stats.totalAttempts + Math.max(1, input.attempts),
    totalHints: stats.totalHints + Math.max(0, input.hintsUsed),
    totalTimeMs: stats.totalTimeMs + Math.max(0, input.elapsedMs),
    totalPoints: stats.totalPoints + Math.max(0, input.points),
    bestTimeMs:
      stats.bestTimeMs === null ? input.elapsedMs : Math.min(stats.bestTimeMs, input.elapsedMs),
    byDifficulty: bumpDifficulty(stats, input.difficulty, {
      completed: 1,
      bestTimeMs: input.elapsedMs,
    }),
    byRecipe: bumpRecipe(stats, input.recipeId, { completed: 1 }),
    updatedAt: Date.now(),
  };
  await writeStats(next);
  await clearActiveChallenge();
  return next;
}

/** Record an abandoned challenge (plan §22). */
export async function recordChallengeAbandoned(input: {
  difficulty: ChallengeDifficulty;
  attempts: number;
  hintsUsed: number;
}): Promise<ChallengeStatsRecord> {
  const stats = await loadChallengeStats();
  const next: ChallengeStatsRecord = {
    ...stats,
    abandoned: stats.abandoned + 1,
    totalAttempts: stats.totalAttempts + Math.max(0, input.attempts),
    totalHints: stats.totalHints + Math.max(0, input.hintsUsed),
    updatedAt: Date.now(),
  };
  await writeStats(next);
  await clearActiveChallenge();
  return next;
}

/** Derived averages for the stats panel. */
export function summariseStats(stats: ChallengeStatsRecord): ChallengeStatsSummary {
  const completed = stats.completed;
  return {
    totalStarted: stats.totalStarted,
    completed,
    abandoned: stats.abandoned,
    completionRate: stats.totalStarted === 0 ? 0 : completed / stats.totalStarted,
    averageAttempts: completed === 0 ? 0 : stats.totalAttempts / completed,
    averageHints: completed === 0 ? 0 : stats.totalHints / completed,
    averageTimeMs: completed === 0 ? 0 : stats.totalTimeMs / completed,
    bestTimeMs: stats.bestTimeMs,
    totalPoints: stats.totalPoints,
  };
}

/** Test-only handles on the IDB keys in use. */
export const __ACTIVE_KEY = ACTIVE_KEY;
export const __STATS_KEY = STATS_KEY;
