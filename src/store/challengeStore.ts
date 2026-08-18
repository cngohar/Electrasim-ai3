/**
 * challengeStore — Challenge Mode session state (plan §34).
 *
 * "Keep challenge state separate from ordinary editor state where
 * appropriate." The learner's circuit stays in `circuitStore` (it IS an
 * ordinary edit session); everything *about* the challenge lives here.
 *
 * Nothing in this slice duplicates a domain type: the scenario, evaluation
 * and score all come from `domain/challenges`, and the circuit itself is read
 * from `circuitStore` at evaluation time.
 *
 * Persistence follows plan §21 — only `(seed, generatorVersion, difficulty,
 * attempts, hintsUsed, startedAt, elapsedMs)` is written to IndexedDB. The
 * scenario is regenerated from the seed on resume, never stored.
 */

import { create } from 'zustand';
import {
  type ChallengeDifficulty,
  type ChallengeEvaluation,
  type ChallengeScenario,
  type ChallengeScore,
  buildChallengeScenario,
  evaluateChallenge,
  scoreChallenge,
} from '../domain/challenges';
import { GENERATOR_VERSION } from '../domain/challenges';
import {
  type ChallengeStatsRecord,
  type ChallengeStatus,
  clearActiveChallenge,
  loadActiveChallenge,
  loadChallengeStats,
  recordChallengeAbandoned,
  recordChallengeCompleted,
  recordChallengeStarted,
  saveActiveChallenge,
} from './challengePersistence';
import { useCircuitStore } from './circuitStore';

export interface ChallengeState {
  status: ChallengeStatus;
  scenario: ChallengeScenario | null;
  evaluation: ChallengeEvaluation | null;
  score: ChallengeScore | null;
  attempts: number;
  hintsUsed: number;
  /** Epoch ms when the current timing segment began. */
  startedAt: number | null;
  /** Time banked from previous segments (survives reload). */
  elapsedMs: number;
  stats: ChallengeStatsRecord | null;
  /** Set when generation fails (plan §47). */
  error: string | null;
  /** True while a "start new challenge?" confirmation is pending (§22). */
  confirmingNew: boolean;

  start: (difficulty: ChallengeDifficulty, seed?: number) => Promise<void>;
  submit: () => ChallengeEvaluation | null;
  revealHint: () => void;
  abandon: () => Promise<void>;
  requestNew: () => boolean;
  cancelNew: () => void;
  exit: () => void;
  resume: () => Promise<boolean>;
  refreshStats: () => Promise<void>;
  /** Total elapsed time including the running segment. */
  totalElapsedMs: () => number;
}

function randomSeed(): number {
  // Session seed only — never used for anything security-sensitive. The
  // generator itself remains deterministic given this value.
  return Math.floor(Math.random() * 1_000_000);
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  status: 'idle',
  scenario: null,
  evaluation: null,
  score: null,
  attempts: 0,
  hintsUsed: 0,
  startedAt: null,
  elapsedMs: 0,
  stats: null,
  error: null,
  confirmingNew: false,

  totalElapsedMs: () => {
    const { startedAt, elapsedMs, status } = get();
    if (startedAt === null || status === 'completed' || status === 'abandoned') return elapsedMs;
    return elapsedMs + Math.max(0, Date.now() - startedAt);
  },

  start: async (difficulty, seed) => {
    set({ status: 'generating', error: null, confirmingNew: false });
    const chosenSeed = seed ?? randomSeed();
    try {
      const scenario = buildChallengeScenario({ seed: chosenSeed, difficulty });
      // Seed the editor with the supply terminals so the learner has an anchor.
      useCircuitStore.getState().setCircuit(scenario.startingCircuit);
      const startedAt = Date.now();
      set({
        status: 'active',
        scenario,
        evaluation: null,
        score: null,
        attempts: 0,
        hintsUsed: 0,
        startedAt,
        elapsedMs: 0,
      });
      await saveActiveChallenge({
        seed: scenario.seed,
        generatorVersion: scenario.generatorVersion,
        difficulty: scenario.difficulty,
        mode: 'challenge',
        challengeId: scenario.challengeId,
        status: 'active',
        attempts: 0,
        hintsUsed: 0,
        startedAt,
        elapsedMs: 0,
      });
      const stats = await recordChallengeStarted({
        difficulty: scenario.difficulty,
        recipeId: scenario.recipeId,
      });
      set({ stats });
    } catch (err) {
      // Plan §47: never leave the user on a blank screen.
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[challenge] generation failed:', message);
      set({
        status: 'idle',
        scenario: null,
        error: 'Could not build a challenge circuit. Please try again.',
      });
    }
  },

  submit: () => {
    const state = get();
    const scenario = state.scenario;
    if (!scenario || state.status === 'completed') return null;

    const { components, wires, globalVoltage } = useCircuitStore.getState();
    const evaluation = evaluateChallenge(scenario, { components, wires, globalVoltage });
    const attempts = state.attempts + 1;

    if (!evaluation.success) {
      // Plan §18: a wrong submission never ends the challenge.
      set({ evaluation, attempts, status: 'active' });
      void saveActiveChallenge({
        seed: scenario.seed,
        generatorVersion: scenario.generatorVersion,
        difficulty: scenario.difficulty,
        mode: 'challenge',
        challengeId: scenario.challengeId,
        status: 'active',
        attempts,
        hintsUsed: state.hintsUsed,
        startedAt: state.startedAt ?? Date.now(),
        elapsedMs: state.elapsedMs,
      });
      return evaluation;
    }

    const elapsedMs = state.totalElapsedMs();
    const score = scoreChallenge({
      difficulty: scenario.difficulty,
      elapsedMs,
      attempts,
      hintsUsed: state.hintsUsed,
    });
    set({
      evaluation,
      score,
      attempts,
      status: 'completed',
      elapsedMs,
      startedAt: null,
    });
    void recordChallengeCompleted({
      difficulty: scenario.difficulty,
      recipeId: scenario.recipeId,
      elapsedMs,
      attempts,
      hintsUsed: state.hintsUsed,
      points: score.points,
    }).then((stats) => set({ stats }));
    return evaluation;
  },

  revealHint: () => {
    const { scenario, hintsUsed, status } = get();
    if (!scenario || status !== 'active') return;
    if (hintsUsed >= scenario.hints.length) return;
    set({ hintsUsed: hintsUsed + 1 });
  },

  abandon: async () => {
    const { scenario, attempts, hintsUsed } = get();
    if (scenario) {
      const stats = await recordChallengeAbandoned({
        difficulty: scenario.difficulty,
        attempts,
        hintsUsed,
      });
      set({ stats });
    }
    set({
      status: 'abandoned',
      scenario: null,
      evaluation: null,
      score: null,
      attempts: 0,
      hintsUsed: 0,
      startedAt: null,
      elapsedMs: 0,
      confirmingNew: false,
    });
  },

  /**
   * Plan §22: never silently overwrite an active challenge. Returns true when
   * a confirmation is required (meaningful progress would be lost).
   */
  requestNew: () => {
    const { status, attempts, hintsUsed, scenario } = get();
    if (status !== 'active' || !scenario) return false;
    const built =
      useCircuitStore.getState().components.length > scenario.startingCircuit.components.length;
    const meaningful = attempts > 0 || hintsUsed > 0 || built;
    if (meaningful) {
      set({ confirmingNew: true });
      return true;
    }
    return false;
  },

  cancelNew: () => set({ confirmingNew: false }),

  exit: () => {
    void clearActiveChallenge();
    set({
      status: 'idle',
      scenario: null,
      evaluation: null,
      score: null,
      attempts: 0,
      hintsUsed: 0,
      startedAt: null,
      elapsedMs: 0,
      confirmingNew: false,
      error: null,
    });
  },

  /** Plan §21: rebuild an in-flight challenge after a page reload. */
  resume: async () => {
    const record = await loadActiveChallenge();
    if (!record) return false;
    try {
      const scenario = buildChallengeScenario({
        seed: record.seed,
        difficulty: record.difficulty,
        generatorVersion: record.generatorVersion,
      });
      // A generator-version bump invalidates the saved run rather than
      // silently resuming a different circuit (plan §31).
      if (scenario.challengeId !== record.challengeId) {
        await clearActiveChallenge();
        return false;
      }
      set({
        status: 'active',
        scenario,
        evaluation: null,
        score: null,
        attempts: record.attempts,
        hintsUsed: record.hintsUsed,
        startedAt: Date.now(),
        elapsedMs: record.elapsedMs,
        error: null,
      });
      return true;
    } catch (err) {
      console.warn('[challenge] resume failed:', err);
      await clearActiveChallenge();
      return false;
    }
  },

  refreshStats: async () => {
    const stats = await loadChallengeStats();
    set({ stats });
  },
}));

/** Non-hook accessor mirroring the other stores' convention. */
export const challengeState = () => useChallengeStore.getState();

// Re-exported so the UI imports one symbol set.
export { GENERATOR_VERSION };
