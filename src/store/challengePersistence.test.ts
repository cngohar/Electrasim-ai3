/**
 * challengePersistence.test.ts — Challenge Mode IDB records (plan §20, §21).
 *
 * Mirrors the in-memory `idb-keyval` mock used by `persistence.test.ts`.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mem = new Map<IDBValidKey, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => mem.get(key)),
  set: vi.fn(async (key: string, value: unknown) => {
    if (value === undefined) mem.delete(key);
    else mem.set(key, value);
  }),
}));

import {
  EMPTY_STATS,
  __ACTIVE_KEY,
  __STATS_KEY,
  clearActiveChallenge,
  loadActiveChallenge,
  loadChallengeStats,
  recordChallengeAbandoned,
  recordChallengeCompleted,
  recordChallengeStarted,
  saveActiveChallenge,
  summariseStats,
} from './challengePersistence';

const activeRecord = {
  seed: 4242,
  generatorVersion: 1,
  difficulty: 'beginner' as const,
  mode: 'challenge' as const,
  challengeId: 'ES-CHAL-123456',
  status: 'active' as const,
  attempts: 2,
  hintsUsed: 1,
  startedAt: 1_700_000_000_000,
  elapsedMs: 45_000,
};

beforeEach(() => {
  mem.clear();
  vi.clearAllMocks();
});

describe('active challenge record (plan §21)', () => {
  it('round-trips a saved run', async () => {
    expect(await saveActiveChallenge(activeRecord)).toBe(true);
    const loaded = await loadActiveChallenge();
    expect(loaded).not.toBeNull();
    expect(loaded?.seed).toBe(4242);
    expect(loaded?.difficulty).toBe('beginner');
    expect(loaded?.attempts).toBe(2);
    expect(loaded?.hintsUsed).toBe(1);
    expect(loaded?.elapsedMs).toBe(45_000);
    expect(loaded?.version).toBe(1);
  });

  it('stores the seed, not the generated circuit', async () => {
    await saveActiveChallenge(activeRecord);
    const blob = JSON.stringify(mem.get(__ACTIVE_KEY));
    expect(blob).toContain('4242');
    expect(blob).not.toContain('components');
    expect(blob).not.toContain('wires');
  });

  it('returns null when nothing is stored', async () => {
    expect(await loadActiveChallenge()).toBeNull();
  });

  it('rejects a corrupt record instead of throwing', async () => {
    mem.set(__ACTIVE_KEY, { version: 1, seed: 'not-a-number' });
    expect(await loadActiveChallenge()).toBeNull();
  });

  it('rejects a record from a future schema version', async () => {
    mem.set(__ACTIVE_KEY, { ...activeRecord, version: 99 });
    expect(await loadActiveChallenge()).toBeNull();
  });

  it('rejects an unknown difficulty', async () => {
    mem.set(__ACTIVE_KEY, { ...activeRecord, version: 1, difficulty: 'impossible' });
    expect(await loadActiveChallenge()).toBeNull();
  });

  it('clears the active run', async () => {
    await saveActiveChallenge(activeRecord);
    await clearActiveChallenge();
    expect(await loadActiveChallenge()).toBeNull();
  });
});

describe('aggregate stats (plan §20)', () => {
  it('starts empty', async () => {
    const stats = await loadChallengeStats();
    expect(stats.totalStarted).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.bestTimeMs).toBeNull();
  });

  it('counts a started challenge by difficulty and recipe', async () => {
    await recordChallengeStarted({ difficulty: 'beginner', recipeId: 'beginner-switched-light' });
    const stats = await loadChallengeStats();
    expect(stats.totalStarted).toBe(1);
    expect(stats.byDifficulty.beginner.started).toBe(1);
    expect(stats.byRecipe['beginner-switched-light'].started).toBe(1);
  });

  it('accumulates completions and tracks the best time', async () => {
    await recordChallengeStarted({ difficulty: 'beginner', recipeId: 'r1' });
    await recordChallengeCompleted({
      difficulty: 'beginner',
      recipeId: 'r1',
      elapsedMs: 90_000,
      attempts: 2,
      hintsUsed: 1,
      points: 700,
    });
    await recordChallengeCompleted({
      difficulty: 'beginner',
      recipeId: 'r1',
      elapsedMs: 40_000,
      attempts: 1,
      hintsUsed: 0,
      points: 950,
    });
    const stats = await loadChallengeStats();
    expect(stats.completed).toBe(2);
    expect(stats.bestTimeMs).toBe(40_000);
    expect(stats.byDifficulty.beginner.bestTimeMs).toBe(40_000);
    expect(stats.totalPoints).toBe(1650);
    expect(stats.totalAttempts).toBe(3);
    expect(stats.totalHints).toBe(1);
    expect(stats.byRecipe.r1.completed).toBe(2);
  });

  it('clears the active run on completion', async () => {
    await saveActiveChallenge(activeRecord);
    await recordChallengeCompleted({
      difficulty: 'beginner',
      recipeId: 'r1',
      elapsedMs: 1000,
      attempts: 1,
      hintsUsed: 0,
      points: 900,
    });
    expect(await loadActiveChallenge()).toBeNull();
  });

  it('records an abandonment and clears the active run', async () => {
    await saveActiveChallenge(activeRecord);
    await recordChallengeAbandoned({ difficulty: 'advanced', attempts: 3, hintsUsed: 2 });
    const stats = await loadChallengeStats();
    expect(stats.abandoned).toBe(1);
    expect(stats.completed).toBe(0);
    expect(await loadActiveChallenge()).toBeNull();
  });

  it('keeps a stats record small — no per-event log (plan §20)', async () => {
    for (let i = 0; i < 50; i += 1) {
      await recordChallengeStarted({ difficulty: 'beginner', recipeId: 'r1' });
      await recordChallengeCompleted({
        difficulty: 'beginner',
        recipeId: 'r1',
        elapsedMs: 1000 + i,
        attempts: 1,
        hintsUsed: 0,
        points: 800,
      });
    }
    const size = JSON.stringify(mem.get(__STATS_KEY)).length;
    expect(size).toBeLessThan(1500);
  });

  it('repairs a partially-written stats blob', async () => {
    mem.set(__STATS_KEY, { version: 1, totalStarted: 5, completed: 2, byDifficulty: {} });
    const stats = await loadChallengeStats();
    expect(stats.totalStarted).toBe(5);
    expect(stats.byDifficulty.advanced).toEqual(EMPTY_STATS.byDifficulty.advanced);
  });
});

describe('summariseStats', () => {
  it('derives averages safely with no completions', () => {
    const summary = summariseStats(EMPTY_STATS);
    expect(summary.completionRate).toBe(0);
    expect(summary.averageAttempts).toBe(0);
    expect(summary.averageTimeMs).toBe(0);
    expect(Number.isNaN(summary.completionRate)).toBe(false);
  });

  it('computes averages over completed runs', () => {
    const summary = summariseStats({
      ...EMPTY_STATS,
      totalStarted: 4,
      completed: 2,
      totalAttempts: 6,
      totalHints: 2,
      totalTimeMs: 100_000,
    });
    expect(summary.completionRate).toBe(0.5);
    expect(summary.averageAttempts).toBe(3);
    expect(summary.averageHints).toBe(1);
    expect(summary.averageTimeMs).toBe(50_000);
  });
});
