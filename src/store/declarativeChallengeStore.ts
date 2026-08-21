/**
 * declarativeChallengeStore — Challenge Mode session state (plan §5, §11).
 *
 * Owns the safe practice workspace:
 *   - starting snapshots the normal circuit (§12),
 *   - the editor is loaded with the challenge's STARTER circuit,
 *   - exiting restores the snapshot EXACTLY (§13),
 *   - a reload offers Continue vs Return-to-My-Circuit (§14),
 *   - Reset restores this challenge's starter (§15), never the global default.
 *
 * The circuit itself stays in `circuitStore` (it IS an ordinary edit session);
 * everything *about* the challenge lives here. Validation is delegated to the
 * declarative domain; persistence is isolated in
 * `declarativeChallengePersistence.ts`.
 */

import { create } from 'zustand';
import type { Circuit } from '../domain';
import {
  CHALLENGE_DEFINITIONS,
  type ChallengeDefinition,
  type ChallengeId,
  type ChallengeVerdict,
  cloneStarter,
  getChallengeDefinition,
  validateChallenge,
} from '../domain/challenges/declarative';
import { downloadText, exportJSON } from '../lib/exportImport';
import { useCircuitStore } from './circuitStore';
import {
  type ChallengeProgressMap,
  type DeclarativeChallengeStatus,
  clearActiveDeclarativeChallenge,
  clearChallengeCircuit,
  clearReturnWorkspace,
  loadActiveDeclarativeChallenge,
  loadChallengeCircuit,
  loadChallengeProgress,
  loadReturnWorkspace,
  recordChallengeProgress,
  saveActiveDeclarativeChallenge,
  saveChallengeCircuit,
  saveReturnWorkspace,
} from './declarativeChallengePersistence';
import { useUiStore } from './uiStore';

/** Create a fresh attempt id (plan §12). Not security-sensitive. */
function newAttemptId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface DeclarativeChallengeState {
  status: DeclarativeChallengeStatus;
  definition: ChallengeDefinition | null;
  verdict: ChallengeVerdict | null;
  /** The learner's normal circuit, snapshotted on start (§11). */
  returnCircuit: Circuit | null;
  progress: ChallengeProgressMap;
  attemptId: string | null;
  attempts: number;
  hintsUsed: number;
  startedAt: number | null;
  elapsedMs: number;
  /** True while the exit confirmation is open (§13). */
  confirmingExit: boolean;
  /** True while the reload choice is offered (§14). */
  resumePrompt: { active: boolean; record: { challengeId: ChallengeId } } | null;

  start: (challengeId: ChallengeId) => Promise<void>;
  check: () => ChallengeVerdict | null;
  revealHint: () => void;
  resetChallenge: () => void;
  requestExit: () => void;
  cancelExit: () => void;
  exitToMyCircuit: () => Promise<void>;
  keepCopy: () => void;
  resumeActive: () => Promise<boolean>;
  returnFromReload: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  totalElapsedMs: () => number;
  dismissResumePrompt: () => void;
}

export const useDeclarativeChallengeStore = create<DeclarativeChallengeState>((set, get) => ({
  status: 'idle',
  definition: null,
  verdict: null,
  returnCircuit: null,
  progress: {},
  attemptId: null,
  attempts: 0,
  hintsUsed: 0,
  startedAt: null,
  elapsedMs: 0,
  confirmingExit: false,
  resumePrompt: null,

  totalElapsedMs: () => {
    const { startedAt, elapsedMs, status } = get();
    if (startedAt === null || status !== 'active') return elapsedMs;
    return elapsedMs + Math.max(0, Date.now() - startedAt);
  },

  start: async (challengeId) => {
    const definition = getChallengeDefinition(challengeId);
    if (!definition) return;

    // §12: flush the normal autosave (happens via persistCircuit below),
    // snapshot the normal circuit, then load the starter.
    const current = useCircuitStore.getState();
    const snapshot = {
      components: current.components.map((c) => ({ ...c, state: { ...c.state } })),
      wires: current.wires.map((w) => ({ ...w, controlPoints: [...(w.controlPoints ?? [])] })),
      globalVoltage: current.globalVoltage,
      faults: current.faults ? [...current.faults] : [],
    };
    await saveReturnWorkspace(snapshot);

    useCircuitStore.getState().setCircuit(cloneStarter(definition.starter));
    useCircuitStore.temporal.getState().clear();

    const startedAt = Date.now();
    const attemptId = newAttemptId();
    set({
      status: 'active',
      definition,
      verdict: null,
      returnCircuit: snapshot,
      attemptId,
      attempts: 0,
      hintsUsed: 0,
      startedAt,
      elapsedMs: 0,
      confirmingExit: false,
      resumePrompt: null,
    });
    await saveActiveDeclarativeChallenge({
      challengeId,
      attemptId,
      startedAt,
      elapsedMs: 0,
      hintsUsed: 0,
      attempts: 0,
    });
  },

  check: () => {
    const { definition, status } = get();
    if (!definition || status !== 'active') return null;
    const { components, wires, globalVoltage } = useCircuitStore.getState();
    const verdict = validateChallenge(definition, { components, wires, globalVoltage });
    const attempts = get().attempts + 1;
    set({ verdict, attempts });
    void saveActiveDeclarativeChallenge({
      challengeId: definition.id,
      attemptId: get().attemptId ?? newAttemptId(),
      startedAt: get().startedAt ?? Date.now(),
      elapsedMs: get().elapsedMs,
      hintsUsed: get().hintsUsed,
      attempts,
    });
    if (verdict.state === 'complete') {
      const elapsedMs = get().totalElapsedMs();
      set({ status: 'completed', elapsedMs, startedAt: null });
      void clearActiveDeclarativeChallenge();
      const attemptId = get().attemptId;
      if (attemptId) void clearChallengeCircuit(attemptId);
      void recordChallengeProgress(definition.id, {
        elapsedMs,
        attempts,
        hintsUsed: get().hintsUsed,
      }).then((progress) => set({ progress }));
    }
    return verdict;
  },

  revealHint: () => {
    const { definition, hintsUsed, status } = get();
    if (!definition || status !== 'active') return;
    if (hintsUsed >= definition.hints.length) return;
    set({ hintsUsed: hintsUsed + 1 });
  },

  /** §15: restore THIS challenge's starter, keeping the learner inside. */
  resetChallenge: () => {
    const { definition, status } = get();
    if (!definition || status !== 'active') return;
    useCircuitStore.getState().setCircuit(cloneStarter(definition.starter));
    useCircuitStore.temporal.getState().clear();
    set({ verdict: null, attempts: 0, hintsUsed: 0 });
    const attemptId = get().attemptId;
    if (attemptId) void clearChallengeCircuit(attemptId);
  },

  /** §13: show the leave dialog, never silently overwrite. */
  requestExit: () => {
    const { status } = get();
    if (status !== 'active') return;
    set({ confirmingExit: true });
  },
  cancelExit: () => set({ confirmingExit: false }),

  /** §13 "Return to My Circuit": restore the snapshot EXACTLY. */
  exitToMyCircuit: async () => {
    const { returnCircuit, attemptId } = get();
    if (returnCircuit) {
      useCircuitStore.getState().setCircuit(returnCircuit);
      useCircuitStore.temporal.getState().clear();
    }
    await clearReturnWorkspace();
    await clearActiveDeclarativeChallenge();
    if (attemptId) await clearChallengeCircuit(attemptId);
    // Plan §13: leaving a challenge lands the learner back in the normal
    // editor — the panel closes with the workspace.
    useUiStore.getState().setChallengeOpen(false);
    set({
      status: 'exited',
      definition: null,
      verdict: null,
      returnCircuit: null,
      attemptId: null,
      attempts: 0,
      hintsUsed: 0,
      startedAt: null,
      elapsedMs: 0,
      confirmingExit: false,
    });
  },

  /** §13 "Keep a Copy": export the challenge circuit as normal JSON. */
  keepCopy: () => {
    const { components, wires, globalVoltage } = useCircuitStore.getState();
    downloadText(
      exportJSON({ components, wires, globalVoltage }),
      'challenge-circuit.electrasim.json',
      'application/json',
    );
  },

  /** §14: rebuild an in-flight challenge after a page reload. */
  resumeActive: async () => {
    const record = await loadActiveDeclarativeChallenge();
    if (!record) return false;
    const definition = getChallengeDefinition(record.challengeId);
    if (!definition) {
      await clearActiveDeclarativeChallenge();
      return false;
    }
    const returnWorkspace = await loadReturnWorkspace();
    // The learner's in-progress build (if autosaved) beats the starter.
    const savedCircuit = await loadChallengeCircuit(record.attemptId);
    useCircuitStore.getState().setCircuit(savedCircuit ?? cloneStarter(definition.starter));
    useCircuitStore.temporal.getState().clear();
    set({
      status: 'active',
      definition,
      verdict: null,
      returnCircuit: returnWorkspace?.circuit ?? null,
      attemptId: record.attemptId,
      attempts: record.attempts,
      hintsUsed: record.hintsUsed,
      startedAt: Date.now(),
      elapsedMs: record.elapsedMs,
      confirmingExit: false,
      resumePrompt: null,
    });
    return true;
  },

  /** §14 "Return to My Circuit" from the reload prompt. */
  returnFromReload: async () => {
    const returnWorkspace = await loadReturnWorkspace();
    if (returnWorkspace) {
      useCircuitStore.getState().setCircuit(returnWorkspace.circuit);
      useCircuitStore.temporal.getState().clear();
    }
    await clearReturnWorkspace();
    await clearActiveDeclarativeChallenge();
    useUiStore.getState().setChallengeOpen(false);
    set({
      status: 'idle',
      definition: null,
      verdict: null,
      returnCircuit: null,
      resumePrompt: null,
      confirmingExit: false,
    });
  },

  refreshProgress: async () => {
    set({ progress: await loadChallengeProgress() });
  },

  dismissResumePrompt: () => set({ resumePrompt: null }),
}));

/** Non-hook accessor mirroring the other stores' convention. */
export const declarativeChallengeState = () => useDeclarativeChallengeStore.getState();

/** Every shipped challenge, in recommended order (plan §17). */
export { CHALLENGE_DEFINITIONS };
