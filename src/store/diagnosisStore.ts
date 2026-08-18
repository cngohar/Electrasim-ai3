/**
 * diagnosisStore — Diagnosis Lab session state (plan §34).
 *
 * Mirrors `challengeStore`, with one structural difference forced by §41: a
 * submission has three outcomes, not two, so the store tracks *two* failure
 * counters instead of one `attempts`:
 *
 *   - `misdiagnoses`     — wrong type and/or wrong location (verdict `failure`)
 *   - `incompleteRepairs`— right answer, circuit still broken (`incomplete`)
 *
 * They are scored differently (§17: finding the fault is the hard part) and
 * they mean different things to a learner, so collapsing them would lose the
 * only signal worth keeping.
 *
 * The learner's circuit lives in `circuitStore` exactly as in Challenge Mode —
 * the Diagnosis Lab loads the *faulted* circuit into the ordinary editor and
 * lets them repair it with the ordinary tools. Nothing here duplicates a
 * domain type.
 *
 * Persistence follows §21: seed + version + difficulty + counters only. The
 * faulted circuit is regenerated from the seed on resume, never stored — which
 * also guarantees a resumed exercise cannot drift from the generator.
 */

import { create } from 'zustand';
import {
  type ChallengeDifficulty,
  type DiagnosisAnswer,
  type DiagnosisEvaluation,
  type DiagnosisScenario,
  type DiagnosisScore,
  GENERATOR_VERSION,
  type RageTierId,
  buildDiagnosisScenario,
  evaluateDiagnosis,
  scoreDiagnosis,
} from '../domain/challenges';
import { useCircuitStore } from './circuitStore';
import {
  type DiagnosisStatsRecord,
  type DiagnosisStatus,
  clearActiveDiagnosis,
  loadActiveDiagnosis,
  loadDiagnosisStats,
  recordDiagnosisAbandoned,
  recordDiagnosisCompleted,
  recordDiagnosisStarted,
  saveActiveDiagnosis,
} from './diagnosisPersistence';
import { useSettingsStore } from './settingsStore';

export interface DiagnosisState {
  status: DiagnosisStatus;
  scenario: DiagnosisScenario | null;
  evaluation: DiagnosisEvaluation | null;
  score: DiagnosisScore | null;

  /** Wrong-answer count (§41 `failure`). */
  misdiagnoses: number;
  /** Right answer, unrepaired circuit (§41 `incomplete`). */
  incompleteRepairs: number;
  hintsUsed: number;

  /** Pending selection in the "what is wrong?" question (§15A). */
  selectedFaultType: DiagnosisAnswer['faultType'] | null;
  /** Pending selection in the "where is it?" question (§15B). */
  selectedLocationKey: string | null;

  /** Epoch ms when the current timing segment began. */
  startedAt: number | null;
  /** Time banked from previous segments (survives reload). */
  elapsedMs: number;
  stats: DiagnosisStatsRecord | null;
  /** Set when generation fails (plan §47). */
  error: string | null;
  /** True while a "start a new exercise?" confirmation is pending (§22). */
  confirmingNew: boolean;

  /**
   * Begin an exercise. `rageTier` is only honoured when Ohmageddon Mode is
   * enabled in Settings — see the §24 gate in the implementation.
   */
  start: (difficulty: ChallengeDifficulty, seed?: number, rageTier?: RageTierId) => Promise<void>;
  selectFaultType: (type: DiagnosisAnswer['faultType'] | null) => void;
  selectLocation: (key: string | null) => void;
  submit: () => DiagnosisEvaluation | null;
  revealHint: () => void;
  abandon: () => Promise<void>;
  requestNew: () => boolean;
  cancelNew: () => void;
  exit: () => void;
  resume: () => Promise<boolean>;
  refreshStats: () => Promise<void>;
  /** Total elapsed time including the running segment. */
  totalElapsedMs: () => number;
  /** True once both halves of the answer are chosen (§15). */
  canSubmit: () => boolean;
}

function randomSeed(): number {
  // Session seed only. Generation itself stays deterministic given this value.
  return Math.floor(Math.random() * 1_000_000);
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  status: 'idle',
  scenario: null,
  evaluation: null,
  score: null,
  misdiagnoses: 0,
  incompleteRepairs: 0,
  hintsUsed: 0,
  selectedFaultType: null,
  selectedLocationKey: null,
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

  canSubmit: () => {
    const { status, selectedFaultType, selectedLocationKey } = get();
    return status === 'active' && selectedFaultType !== null && selectedLocationKey !== null;
  },

  start: async (difficulty, seed, rageTier) => {
    set({ status: 'generating', error: null, confirmingNew: false });
    const chosenSeed = seed ?? randomSeed();
    /**
     * Plan §24, the safety rule: "Normal users must never accidentally enter
     * Ohmageddon Mode."
     *
     * This single line is the enforcement point. The domain has no idea the
     * settings store exists — `buildDiagnosisScenario` applies modifiers if and
     * only if it is handed a tier — so gating here means a stale UI, a resumed
     * record or a future caller cannot conjure a rage exercise while the
     * setting is off. Turning the setting off mid-session downgrades the next
     * exercise to a normal one rather than erroring.
     */
    const effectiveTier = useSettingsStore.getState().ohmageddonMode ? rageTier : undefined;
    try {
      const scenario = buildDiagnosisScenario({
        seed: chosenSeed,
        difficulty,
        ...(effectiveTier ? { rageTier: effectiveTier } : {}),
      });
      // The learner works on the *faulted* installation in the normal editor.
      useCircuitStore.getState().setCircuit(scenario.faultedCircuit);
      const startedAt = Date.now();
      set({
        status: 'active',
        scenario,
        evaluation: null,
        score: null,
        misdiagnoses: 0,
        incompleteRepairs: 0,
        hintsUsed: 0,
        selectedFaultType: null,
        selectedLocationKey: null,
        startedAt,
        elapsedMs: 0,
      });
      await saveActiveDiagnosis({
        seed: scenario.seed,
        generatorVersion: scenario.generatorVersion,
        difficulty: scenario.difficulty,
        mode: 'diagnosis',
        ...(effectiveTier ? { rageTier: effectiveTier } : {}),
        challengeId: scenario.challengeId,
        status: 'active',
        misdiagnoses: 0,
        incompleteRepairs: 0,
        hintsUsed: 0,
        startedAt,
        elapsedMs: 0,
      });
      const stats = await recordDiagnosisStarted({
        difficulty: scenario.difficulty,
        faultType: scenario.fault.type,
      });
      set({ stats });
    } catch (err) {
      // Plan §47: never leave the user on a blank screen.
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[diagnosis] generation failed:', message);
      set({
        status: 'idle',
        scenario: null,
        error: 'Could not build a diagnosis exercise. Please try again.',
      });
    }
  },

  selectFaultType: (type) => {
    if (get().status !== 'active') return;
    set({ selectedFaultType: type });
  },

  selectLocation: (key) => {
    if (get().status !== 'active') return;
    set({ selectedLocationKey: key });
  },

  submit: () => {
    const state = get();
    const scenario = state.scenario;
    if (!scenario || state.status === 'completed') return null;
    if (state.selectedFaultType === null || state.selectedLocationKey === null) return null;

    const { components, wires, globalVoltage, faults } = useCircuitStore.getState();
    const evaluation = evaluateDiagnosis(
      scenario,
      { components, wires, globalVoltage, faults },
      { faultType: state.selectedFaultType, locationKey: state.selectedLocationKey },
    );

    if (evaluation.verdict === 'failure') {
      // Plan §18: a wrong diagnosis never ends the exercise.
      const misdiagnoses = state.misdiagnoses + 1;
      set({ evaluation, misdiagnoses, status: 'active' });
      void persistProgress(scenario, {
        misdiagnoses,
        incompleteRepairs: state.incompleteRepairs,
        hintsUsed: state.hintsUsed,
        startedAt: state.startedAt,
        elapsedMs: state.elapsedMs,
      });
      return evaluation;
    }

    if (evaluation.verdict === 'incomplete') {
      // §16: correct answer, circuit still broken — stay on this scenario and
      // keep the selection, because the diagnosis was right.
      const incompleteRepairs = state.incompleteRepairs + 1;
      set({ evaluation, incompleteRepairs, status: 'active' });
      void persistProgress(scenario, {
        misdiagnoses: state.misdiagnoses,
        incompleteRepairs,
        hintsUsed: state.hintsUsed,
        startedAt: state.startedAt,
        elapsedMs: state.elapsedMs,
      });
      return evaluation;
    }

    const elapsedMs = state.totalElapsedMs();
    const score = scoreDiagnosis({
      difficulty: scenario.difficulty,
      elapsedMs,
      misdiagnoses: state.misdiagnoses,
      incompleteRepairs: state.incompleteRepairs,
      hintsUsed: state.hintsUsed,
    });
    set({ evaluation, score, status: 'completed', elapsedMs, startedAt: null });
    void recordDiagnosisCompleted({
      difficulty: scenario.difficulty,
      faultType: scenario.fault.type,
      elapsedMs,
      misdiagnoses: state.misdiagnoses,
      incompleteRepairs: state.incompleteRepairs,
      hintsUsed: state.hintsUsed,
      points: score.points,
    }).then((stats) => set({ stats }));
    return evaluation;
  },

  revealHint: () => {
    const { scenario, hintsUsed, status } = get();
    if (!scenario || status !== 'active') return;
    if (hintsUsed >= scenario.hints.length) return;
    // §17: hints are always available. The budget only affects the score.
    set({ hintsUsed: hintsUsed + 1 });
  },

  abandon: async () => {
    const { scenario, misdiagnoses, hintsUsed } = get();
    if (scenario) {
      const stats = await recordDiagnosisAbandoned({
        difficulty: scenario.difficulty,
        faultType: scenario.fault.type,
        misdiagnoses,
        hintsUsed,
      });
      set({ stats });
    }
    set({
      status: 'abandoned',
      scenario: null,
      evaluation: null,
      score: null,
      misdiagnoses: 0,
      incompleteRepairs: 0,
      hintsUsed: 0,
      selectedFaultType: null,
      selectedLocationKey: null,
      startedAt: null,
      elapsedMs: 0,
      confirmingNew: false,
    });
  },

  /**
   * Plan §22: never silently discard an exercise in progress. Returns true
   * when a confirmation is required.
   */
  requestNew: () => {
    const { status, misdiagnoses, incompleteRepairs, hintsUsed, scenario } = get();
    if (status !== 'active' || !scenario) return false;
    // Any edit to the faulted circuit counts as work in progress — the learner
    // may have already lifted a conductor while testing.
    const edited =
      useCircuitStore.getState().wires.length !== scenario.faultedCircuit.wires.length ||
      useCircuitStore.getState().components.length !== scenario.faultedCircuit.components.length;
    const meaningful = misdiagnoses > 0 || incompleteRepairs > 0 || hintsUsed > 0 || edited;
    if (meaningful) {
      set({ confirmingNew: true });
      return true;
    }
    return false;
  },

  cancelNew: () => set({ confirmingNew: false }),

  exit: () => {
    void clearActiveDiagnosis();
    set({
      status: 'idle',
      scenario: null,
      evaluation: null,
      score: null,
      misdiagnoses: 0,
      incompleteRepairs: 0,
      hintsUsed: 0,
      selectedFaultType: null,
      selectedLocationKey: null,
      startedAt: null,
      elapsedMs: 0,
      confirmingNew: false,
      error: null,
    });
  },

  /**
   * Plan §21: rebuild an in-flight exercise after a page reload.
   *
   * Note this deliberately reloads the *pristine* faulted circuit: any repair
   * work the learner had done is not persisted (§21 forbids storing the
   * circuit), so resuming mid-repair would otherwise show a circuit whose
   * state disagreed with the stored counters.
   */
  resume: async () => {
    const record = await loadActiveDiagnosis();
    if (!record) return false;
    try {
      // §24 again: a saved rage run is only resumable while the mode is still
      // enabled. If the user turned it off, the stored run is discarded rather
      // than silently downgraded — a downgrade would change the puzzle under
      // them, and `challengeId` would no longer match anyway.
      if (record.rageTier && !useSettingsStore.getState().ohmageddonMode) {
        await clearActiveDiagnosis();
        return false;
      }
      const scenario = buildDiagnosisScenario({
        seed: record.seed,
        difficulty: record.difficulty,
        generatorVersion: record.generatorVersion,
        ...(record.rageTier ? { rageTier: record.rageTier } : {}),
      });
      // A generator-version bump invalidates the saved run rather than
      // silently resuming a different fault (plan §31).
      if (scenario.challengeId !== record.challengeId) {
        await clearActiveDiagnosis();
        return false;
      }
      useCircuitStore.getState().setCircuit(scenario.faultedCircuit);
      set({
        status: 'active',
        scenario,
        evaluation: null,
        score: null,
        misdiagnoses: record.misdiagnoses,
        incompleteRepairs: record.incompleteRepairs,
        hintsUsed: record.hintsUsed,
        selectedFaultType: null,
        selectedLocationKey: null,
        startedAt: Date.now(),
        elapsedMs: record.elapsedMs,
        error: null,
      });
      return true;
    } catch (err) {
      console.warn('[diagnosis] resume failed:', err);
      await clearActiveDiagnosis();
      return false;
    }
  },

  refreshStats: async () => {
    const stats = await loadDiagnosisStats();
    set({ stats });
  },
}));

/** Shared write-back for the two non-terminal verdicts. */
function persistProgress(
  scenario: DiagnosisScenario,
  progress: {
    misdiagnoses: number;
    incompleteRepairs: number;
    hintsUsed: number;
    startedAt: number | null;
    elapsedMs: number;
  },
): Promise<boolean> {
  return saveActiveDiagnosis({
    seed: scenario.seed,
    generatorVersion: scenario.generatorVersion,
    difficulty: scenario.difficulty,
    mode: 'diagnosis',
    // Derived from the scenario itself, so progress writes can never disagree
    // with what was actually generated.
    ...(scenario.rage ? { rageTier: scenario.rage.tier } : {}),
    challengeId: scenario.challengeId,
    status: 'active',
    misdiagnoses: progress.misdiagnoses,
    incompleteRepairs: progress.incompleteRepairs,
    hintsUsed: progress.hintsUsed,
    startedAt: progress.startedAt ?? Date.now(),
    elapsedMs: progress.elapsedMs,
  });
}

/** Non-hook accessor mirroring the other stores' convention. */
export const diagnosisState = () => useDiagnosisStore.getState();

export { GENERATOR_VERSION };
