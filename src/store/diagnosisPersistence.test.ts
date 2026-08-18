/**
 * diagnosisPersistence.test.ts — Diagnosis Lab IDB records (plan §20, §21).
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
  EMPTY_DIAGNOSIS_STATS,
  __DIAGNOSIS_ACTIVE_KEY,
  __DIAGNOSIS_STATS_KEY,
  clearActiveDiagnosis,
  loadActiveDiagnosis,
  loadDiagnosisStats,
  recordDiagnosisAbandoned,
  recordDiagnosisCompleted,
  recordDiagnosisStarted,
  saveActiveDiagnosis,
  summariseDiagnosisStats,
} from './diagnosisPersistence';

const activeRecord = {
  seed: 9182,
  generatorVersion: 1,
  difficulty: 'intermediate' as const,
  mode: 'diagnosis' as const,
  challengeId: 'ES-DIAG-654321',
  status: 'active' as const,
  misdiagnoses: 1,
  incompleteRepairs: 2,
  hintsUsed: 1,
  startedAt: 1_700_000_000_000,
  elapsedMs: 61_000,
};

beforeEach(() => {
  mem.clear();
  vi.clearAllMocks();
});

describe('keys', () => {
  it('uses its own namespaced, versioned keys', () => {
    expect(__DIAGNOSIS_ACTIVE_KEY).toBe('electrasim:diagnosis:active:v1');
    expect(__DIAGNOSIS_STATS_KEY).toBe('electrasim:diagnosis:stats:v1');
    // Must not collide with Challenge Mode's records.
    expect(__DIAGNOSIS_ACTIVE_KEY).not.toBe('electrasim:challenge:active:v1');
  });
});

describe('active exercise', () => {
  it('round-trips a saved record', async () => {
    expect(await saveActiveDiagnosis(activeRecord)).toBe(true);
    const loaded = await loadActiveDiagnosis();
    expect(loaded).toMatchObject(activeRecord);
    expect(loaded?.version).toBe(1);
    expect(typeof loaded?.savedAt).toBe('number');
  });

  it('never stores the circuit itself (§21)', async () => {
    await saveActiveDiagnosis(activeRecord);
    const raw = JSON.stringify(mem.get(__DIAGNOSIS_ACTIVE_KEY));
    expect(raw).not.toContain('components');
    expect(raw).not.toContain('wires');
    expect(raw).toContain('9182');
  });

  it('returns null for an empty store', async () => {
    expect(await loadActiveDiagnosis()).toBeNull();
  });

  it('rejects a record from a different schema version', async () => {
    mem.set(__DIAGNOSIS_ACTIVE_KEY, { ...activeRecord, version: 99 });
    expect(await loadActiveDiagnosis()).toBeNull();
  });

  it('rejects a record belonging to another mode', async () => {
    mem.set(__DIAGNOSIS_ACTIVE_KEY, { ...activeRecord, version: 1, mode: 'challenge' });
    expect(await loadActiveDiagnosis()).toBeNull();
  });

  it('rejects malformed records rather than throwing', async () => {
    for (const bad of [null, 42, 'nope', {}, { version: 1 }, { ...activeRecord, seed: 'x' }]) {
      mem.set(__DIAGNOSIS_ACTIVE_KEY, bad);
      expect(await loadActiveDiagnosis()).toBeNull();
    }
  });

  it('clears the active record', async () => {
    await saveActiveDiagnosis(activeRecord);
    await clearActiveDiagnosis();
    expect(await loadActiveDiagnosis()).toBeNull();
  });
});

describe('stats', () => {
  it('starts from an empty record', async () => {
    const stats = await loadDiagnosisStats();
    expect(stats).toMatchObject({ totalStarted: 0, completed: 0, firstTimeRight: 0 });
    expect(stats.byFaultType).toEqual({});
  });

  it('counts starts by difficulty and fault type', async () => {
    await recordDiagnosisStarted({ difficulty: 'beginner', faultType: 'open-circuit' });
    const stats = await recordDiagnosisStarted({
      difficulty: 'beginner',
      faultType: 'earth-fault',
    });
    expect(stats.totalStarted).toBe(2);
    expect(stats.byDifficulty.beginner.started).toBe(2);
    expect(stats.byFaultType['open-circuit'].seen).toBe(1);
    expect(stats.byFaultType['earth-fault'].seen).toBe(1);
  });

  it('records a completion, clears the active record and tracks best time', async () => {
    await saveActiveDiagnosis(activeRecord);
    await recordDiagnosisStarted({ difficulty: 'beginner', faultType: 'open-neutral' });
    const stats = await recordDiagnosisCompleted({
      difficulty: 'beginner',
      faultType: 'open-neutral',
      elapsedMs: 90_000,
      misdiagnoses: 0,
      incompleteRepairs: 1,
      hintsUsed: 2,
      points: 720,
    });
    expect(stats.completed).toBe(1);
    expect(stats.firstTimeRight).toBe(1);
    expect(stats.bestTimeMs).toBe(90_000);
    expect(stats.byDifficulty.beginner.bestTimeMs).toBe(90_000);
    expect(stats.totalIncompleteRepairs).toBe(1);
    expect(stats.totalPoints).toBe(720);
    expect(stats.byFaultType['open-neutral']).toMatchObject({ seen: 1, solved: 1 });
    expect(await loadActiveDiagnosis()).toBeNull();
  });

  it('only credits first-time-right when there were no misdiagnoses', async () => {
    const stats = await recordDiagnosisCompleted({
      difficulty: 'advanced',
      faultType: 'short-circuit',
      elapsedMs: 300_000,
      misdiagnoses: 3,
      incompleteRepairs: 0,
      hintsUsed: 0,
      points: 400,
    });
    expect(stats.completed).toBe(1);
    expect(stats.firstTimeRight).toBe(0);
    expect(stats.byFaultType['short-circuit'].misdiagnoses).toBe(3);
  });

  it('keeps the fastest of several completions', async () => {
    await recordDiagnosisCompleted({
      difficulty: 'beginner',
      faultType: 'open-live',
      elapsedMs: 120_000,
      misdiagnoses: 0,
      incompleteRepairs: 0,
      hintsUsed: 0,
      points: 800,
    });
    const stats = await recordDiagnosisCompleted({
      difficulty: 'beginner',
      faultType: 'open-live',
      elapsedMs: 45_000,
      misdiagnoses: 0,
      incompleteRepairs: 0,
      hintsUsed: 0,
      points: 950,
    });
    expect(stats.bestTimeMs).toBe(45_000);
    expect(stats.byFaultType['open-live'].solved).toBe(2);
  });

  it('records an abandonment and clears the active record (§22)', async () => {
    await saveActiveDiagnosis(activeRecord);
    const stats = await recordDiagnosisAbandoned({
      difficulty: 'intermediate',
      faultType: 'terminal-disconnect',
      misdiagnoses: 2,
      hintsUsed: 1,
    });
    expect(stats.abandoned).toBe(1);
    expect(stats.completed).toBe(0);
    expect(stats.totalMisdiagnoses).toBe(2);
    expect(await loadActiveDiagnosis()).toBeNull();
  });

  it('repairs a partially-written stats record instead of crashing', async () => {
    mem.set(__DIAGNOSIS_STATS_KEY, {
      version: 1,
      totalStarted: 5,
      completed: 2,
      byDifficulty: { beginner: { started: 5, completed: 2, bestTimeMs: 1000 } },
    });
    const stats = await loadDiagnosisStats();
    expect(stats.totalStarted).toBe(5);
    expect(stats.byDifficulty.advanced).toEqual({ started: 0, completed: 0, bestTimeMs: null });
    expect(stats.byFaultType).toEqual({});
  });

  it('falls back to empty stats for junk', async () => {
    mem.set(__DIAGNOSIS_STATS_KEY, 'not-a-record');
    expect(await loadDiagnosisStats()).toEqual(EMPTY_DIAGNOSIS_STATS);
  });
});

describe('summariseDiagnosisStats', () => {
  it('is safe on an empty record (no NaN)', () => {
    const summary = summariseDiagnosisStats(EMPTY_DIAGNOSIS_STATS);
    expect(summary.completionRate).toBe(0);
    expect(summary.firstTimeRightRate).toBe(0);
    expect(summary.averageMisdiagnoses).toBe(0);
    expect(summary.averageTimeMs).toBe(0);
    expect(summary.weakestFaultTypes).toEqual([]);
  });

  it('averages over completions and ranks the weak spots', () => {
    const summary = summariseDiagnosisStats({
      ...EMPTY_DIAGNOSIS_STATS,
      totalStarted: 4,
      completed: 2,
      abandoned: 1,
      firstTimeRight: 1,
      totalMisdiagnoses: 6,
      totalHints: 2,
      totalTimeMs: 200_000,
      byFaultType: {
        'earth-fault': { seen: 3, solved: 2, misdiagnoses: 5 },
        'open-circuit': { seen: 2, solved: 2, misdiagnoses: 1 },
        'open-live': { seen: 1, solved: 1, misdiagnoses: 0 },
      },
    });
    expect(summary.completionRate).toBe(0.5);
    expect(summary.firstTimeRightRate).toBe(0.5);
    expect(summary.averageMisdiagnoses).toBe(3);
    expect(summary.averageTimeMs).toBe(100_000);
    expect(summary.weakestFaultTypes.map((entry) => entry.type)).toEqual([
      'earth-fault',
      'open-circuit',
    ]);
  });
});
