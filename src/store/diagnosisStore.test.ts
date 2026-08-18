/**
 * diagnosisStore.test.ts — Diagnosis Lab session lifecycle
 * (plan §16, §17, §18, §21, §22, §34, §41).
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

import { useCircuitStore } from './circuitStore';
import { useDiagnosisStore } from './diagnosisStore';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Answer the two questions correctly for the active scenario. */
function answerCorrectly() {
  const { scenario, selectFaultType, selectLocation } = useDiagnosisStore.getState();
  if (!scenario) throw new Error('no scenario');
  selectFaultType(scenario.fault.type);
  selectLocation(scenario.faultLocationKey);
}

/** Clear the injected fault in the editor, as the "repair" button would. */
function repairInEditor() {
  const { scenario } = useDiagnosisStore.getState();
  if (!scenario) throw new Error('no scenario');
  useCircuitStore.getState().removeFault(scenario.fault.id);
}

beforeEach(async () => {
  mem.clear();
  useDiagnosisStore.getState().exit();
  useCircuitStore.getState().setCircuit({ components: [], wires: [], globalVoltage: 230 });
  await flush();
});

describe('start', () => {
  it('activates an exercise and loads the faulted circuit into the editor', async () => {
    await useDiagnosisStore.getState().start('beginner', 555);
    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('active');
    expect(state.scenario?.seed).toBe(555);
    expect(state.scenario?.challengeId).toMatch(/^ES-DIAG-\d{6}$/);
    expect(state.misdiagnoses).toBe(0);
    expect(state.incompleteRepairs).toBe(0);
    expect(state.hintsUsed).toBe(0);

    const editor = useCircuitStore.getState();
    expect(editor.components.length).toBeGreaterThan(0);
    // The learner must receive the *broken* installation (§14).
    expect(editor.faults?.length ?? 0).toBe(1);
    expect(editor.faults?.[0].id).toBe(state.scenario?.fault.id);
  });

  it('is deterministic for a given seed (§5)', async () => {
    await useDiagnosisStore.getState().start('intermediate', 4242);
    const first = useDiagnosisStore.getState().scenario;
    useDiagnosisStore.getState().exit();
    await useDiagnosisStore.getState().start('intermediate', 4242);
    const second = useDiagnosisStore.getState().scenario;
    expect(second?.challengeId).toBe(first?.challengeId);
    expect(second?.fault.type).toBe(first?.fault.type);
    expect(second?.faultLocationKey).toBe(first?.faultLocationKey);
  });

  it('never leaks the answer into the visible brief (§14)', async () => {
    await useDiagnosisStore.getState().start('beginner', 31);
    const { scenario } = useDiagnosisStore.getState();
    if (!scenario) throw new Error('no scenario');
    const visible = `${scenario.complaint} ${scenario.brief}`.toLowerCase();
    expect(visible).not.toContain(scenario.fault.type);
  });

  it('persists a resumable record without the circuit (§21)', async () => {
    await useDiagnosisStore.getState().start('beginner', 99);
    await flush();
    const raw = JSON.stringify(mem.get('electrasim:diagnosis:active:v1'));
    expect(raw).toContain('ES-DIAG-');
    expect(raw).not.toContain('components');
  });
});

describe('submit', () => {
  it('does nothing until both halves of the answer are chosen (§15)', async () => {
    await useDiagnosisStore.getState().start('beginner', 12);
    expect(useDiagnosisStore.getState().canSubmit()).toBe(false);
    expect(useDiagnosisStore.getState().submit()).toBeNull();

    const { scenario } = useDiagnosisStore.getState();
    useDiagnosisStore.getState().selectFaultType(scenario?.fault.type ?? 'open-circuit');
    expect(useDiagnosisStore.getState().canSubmit()).toBe(false);
    useDiagnosisStore.getState().selectLocation(scenario?.faultLocationKey ?? '');
    expect(useDiagnosisStore.getState().canSubmit()).toBe(true);
  });

  it('records a misdiagnosis without ending the exercise (§18)', async () => {
    await useDiagnosisStore.getState().start('beginner', 21);
    const { scenario } = useDiagnosisStore.getState();
    if (!scenario) throw new Error('no scenario');
    const wrongLocation = scenario.locationChoices.find(
      (choice) => choice.key !== scenario.faultLocationKey,
    );
    useDiagnosisStore.getState().selectFaultType(scenario.fault.type);
    useDiagnosisStore.getState().selectLocation(wrongLocation?.key ?? 'nope');

    const evaluation = useDiagnosisStore.getState().submit();
    expect(evaluation?.verdict).toBe('failure');
    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('active');
    expect(state.misdiagnoses).toBe(1);
    expect(state.incompleteRepairs).toBe(0);
    expect(state.score).toBeNull();
    // The scenario survives — same fault, same circuit.
    expect(state.scenario?.challengeId).toBe(scenario.challengeId);
  });

  it('returns "incomplete" for a correct guess on a still-broken circuit (§16)', async () => {
    await useDiagnosisStore.getState().start('beginner', 33);
    answerCorrectly();
    const evaluation = useDiagnosisStore.getState().submit();
    expect(evaluation?.verdict).toBe('incomplete');
    expect(evaluation?.diagnosisCorrect).toBe(true);
    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('active');
    expect(state.incompleteRepairs).toBe(1);
    expect(state.misdiagnoses).toBe(0);
    expect(state.score).toBeNull();
    // The selection is kept — the diagnosis was right, only the repair is missing.
    expect(state.selectedFaultType).toBe(state.scenario?.fault.type);
  });

  it('completes when the fault is diagnosed AND repaired (§41)', async () => {
    await useDiagnosisStore.getState().start('beginner', 33);
    repairInEditor();
    answerCorrectly();
    const evaluation = useDiagnosisStore.getState().submit();
    expect(evaluation?.verdict).toBe('success');
    await flush();

    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('completed');
    expect(state.score).not.toBeNull();
    expect(state.score?.points).toBeGreaterThan(0);
    expect(state.stats?.completed).toBe(1);
    // §21: a finished run leaves nothing to resume.
    expect(mem.get('electrasim:diagnosis:active:v1')).toBeUndefined();
  });

  it('ignores further submissions once completed', async () => {
    await useDiagnosisStore.getState().start('beginner', 33);
    repairInEditor();
    answerCorrectly();
    useDiagnosisStore.getState().submit();
    expect(useDiagnosisStore.getState().submit()).toBeNull();
  });

  it('scores a run with earlier mistakes below a clean run', async () => {
    await useDiagnosisStore.getState().start('beginner', 101);
    answerCorrectly();
    useDiagnosisStore.getState().submit(); // incomplete
    repairInEditor();
    useDiagnosisStore.getState().submit();
    await flush();
    const messy = useDiagnosisStore.getState().score?.points ?? 0;

    useDiagnosisStore.getState().exit();
    await useDiagnosisStore.getState().start('beginner', 101);
    repairInEditor();
    answerCorrectly();
    useDiagnosisStore.getState().submit();
    await flush();
    const clean = useDiagnosisStore.getState().score?.points ?? 0;

    expect(messy).toBeGreaterThan(0);
    expect(clean).toBeGreaterThan(messy);
  });
});

describe('hints (§17)', () => {
  it('reveals hints one at a time and stops at the end of the list', async () => {
    await useDiagnosisStore.getState().start('beginner', 7);
    const total = useDiagnosisStore.getState().scenario?.hints.length ?? 0;
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total + 3; i++) useDiagnosisStore.getState().revealHint();
    expect(useDiagnosisStore.getState().hintsUsed).toBe(total);
  });

  it('does not block completion after every hint is used', async () => {
    await useDiagnosisStore.getState().start('beginner', 7);
    const total = useDiagnosisStore.getState().scenario?.hints.length ?? 0;
    for (let i = 0; i < total; i++) useDiagnosisStore.getState().revealHint();
    repairInEditor();
    answerCorrectly();
    expect(useDiagnosisStore.getState().submit()?.verdict).toBe('success');
    expect(useDiagnosisStore.getState().score?.points).toBeGreaterThan(0);
  });

  it('refuses to reveal hints when no exercise is running', () => {
    useDiagnosisStore.getState().revealHint();
    expect(useDiagnosisStore.getState().hintsUsed).toBe(0);
  });
});

describe('requestNew / abandon / exit (§22)', () => {
  it('does not ask for confirmation before any work is done', async () => {
    await useDiagnosisStore.getState().start('beginner', 15);
    expect(useDiagnosisStore.getState().requestNew()).toBe(false);
    expect(useDiagnosisStore.getState().confirmingNew).toBe(false);
  });

  it('asks for confirmation once progress exists', async () => {
    await useDiagnosisStore.getState().start('beginner', 15);
    useDiagnosisStore.getState().revealHint();
    expect(useDiagnosisStore.getState().requestNew()).toBe(true);
    expect(useDiagnosisStore.getState().confirmingNew).toBe(true);
    useDiagnosisStore.getState().cancelNew();
    expect(useDiagnosisStore.getState().confirmingNew).toBe(false);
  });

  it('asks for confirmation after the circuit has been edited', async () => {
    await useDiagnosisStore.getState().start('beginner', 15);
    const wireId = useCircuitStore.getState().wires[0]?.id;
    if (wireId) useCircuitStore.getState().removeWire(wireId);
    expect(useDiagnosisStore.getState().requestNew()).toBe(true);
  });

  it('abandoning clears the session and counts in stats', async () => {
    await useDiagnosisStore.getState().start('beginner', 15);
    useDiagnosisStore.getState().revealHint();
    await useDiagnosisStore.getState().abandon();
    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('abandoned');
    expect(state.scenario).toBeNull();
    expect(state.stats?.abandoned).toBe(1);
    expect(mem.get('electrasim:diagnosis:active:v1')).toBeUndefined();
  });

  it('exit resets everything to idle', async () => {
    await useDiagnosisStore.getState().start('beginner', 15);
    useDiagnosisStore.getState().exit();
    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('idle');
    expect(state.scenario).toBeNull();
    expect(state.selectedFaultType).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe('resume (§21)', () => {
  it('returns false with nothing saved', async () => {
    expect(await useDiagnosisStore.getState().resume()).toBe(false);
  });

  it('regenerates the exercise from the seed and restores the counters', async () => {
    await useDiagnosisStore.getState().start('intermediate', 6161);
    const original = useDiagnosisStore.getState().scenario;
    answerCorrectly();
    useDiagnosisStore.getState().submit(); // one incomplete repair
    await flush();

    // Simulate a page reload: the store forgets, IndexedDB does not.
    useDiagnosisStore.setState({
      status: 'idle',
      scenario: null,
      misdiagnoses: 0,
      incompleteRepairs: 0,
      hintsUsed: 0,
    });
    useCircuitStore.getState().setCircuit({ components: [], wires: [], globalVoltage: 230 });

    expect(await useDiagnosisStore.getState().resume()).toBe(true);
    const state = useDiagnosisStore.getState();
    expect(state.status).toBe('active');
    expect(state.scenario?.challengeId).toBe(original?.challengeId);
    expect(state.incompleteRepairs).toBe(1);
    // The faulted circuit is back in the editor, ready to be repaired again.
    expect(useCircuitStore.getState().faults?.length).toBe(1);
  });

  it('invalidates a saved run whose challenge id no longer matches (§31)', async () => {
    await useDiagnosisStore.getState().start('beginner', 4321);
    await flush();
    const record = mem.get('electrasim:diagnosis:active:v1') as Record<string, unknown>;
    mem.set('electrasim:diagnosis:active:v1', { ...record, challengeId: 'ES-DIAG-000000' });

    useDiagnosisStore.getState().exit();
    expect(await useDiagnosisStore.getState().resume()).toBe(false);
    expect(mem.get('electrasim:diagnosis:active:v1')).toBeUndefined();
  });
});

describe('timing', () => {
  it('accumulates elapsed time while active and freezes it on completion', async () => {
    await useDiagnosisStore.getState().start('beginner', 33);
    expect(useDiagnosisStore.getState().totalElapsedMs()).toBeGreaterThanOrEqual(0);
    repairInEditor();
    answerCorrectly();
    useDiagnosisStore.getState().submit();
    const frozen = useDiagnosisStore.getState().totalElapsedMs();
    await new Promise((resolve) => setTimeout(resolve, 12));
    expect(useDiagnosisStore.getState().totalElapsedMs()).toBe(frozen);
  });
});
