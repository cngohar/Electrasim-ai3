/**
 * challengeStore.test.ts — session lifecycle (plan §18, §21, §22, §34).
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

import type { Circuit } from '../domain';
import { useChallengeStore } from './challengeStore';
import { useCircuitStore } from './circuitStore';

/** Rebuild the answer under fresh ids, as a learner would. */
function rebuild(circuit: Circuit): Circuit {
  const map = new Map<string, string>();
  circuit.components.forEach((c, i) => map.set(c.id, `u${i}`));
  return {
    components: circuit.components.map((c) => ({
      ...c,
      id: map.get(c.id) as string,
      state: { ...c.state },
    })),
    wires: circuit.wires.map((w, i) => ({
      ...w,
      id: `uw${i}`,
      fromComponentId: map.get(w.fromComponentId) as string,
      toComponentId: map.get(w.toComponentId) as string,
    })),
    globalVoltage: circuit.globalVoltage,
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  mem.clear();
  useChallengeStore.getState().exit();
  useCircuitStore.getState().setCircuit({ components: [], wires: [], globalVoltage: 230 });
  await flush();
});

describe('start', () => {
  it('activates a challenge and seeds the editor with supply terminals', async () => {
    await useChallengeStore.getState().start('beginner', 777);
    const state = useChallengeStore.getState();
    expect(state.status).toBe('active');
    expect(state.scenario?.seed).toBe(777);
    expect(state.attempts).toBe(0);
    expect(state.hintsUsed).toBe(0);

    const editor = useCircuitStore.getState();
    expect(editor.components.length).toBeGreaterThan(0);
    expect(editor.wires).toHaveLength(0);
    expect(editor.components.length).toBe(state.scenario?.startingCircuit.components.length);
  });

  it('is deterministic for a pinned seed', async () => {
    await useChallengeStore.getState().start('intermediate', 31);
    const first = useChallengeStore.getState().scenario?.challengeId;
    useChallengeStore.getState().exit();
    await useChallengeStore.getState().start('intermediate', 31);
    expect(useChallengeStore.getState().scenario?.challengeId).toBe(first);
  });

  it('persists a resumable record', async () => {
    await useChallengeStore.getState().start('beginner', 88);
    await flush();
    const stored = [...mem.values()].find(
      (value) => typeof value === 'object' && value !== null && 'seed' in (value as object),
    ) as { seed: number } | undefined;
    expect(stored?.seed).toBe(88);
  });
});

describe('submit (plan §18)', () => {
  it('does not end the challenge on a wrong answer', async () => {
    await useChallengeStore.getState().start('beginner', 5);
    const evaluation = useChallengeStore.getState().submit();
    expect(evaluation?.success).toBe(false);
    const state = useChallengeStore.getState();
    expect(state.status).toBe('active');
    expect(state.attempts).toBe(1);
    expect(state.scenario).not.toBeNull();
  });

  it('allows unlimited attempts', async () => {
    await useChallengeStore.getState().start('beginner', 5);
    for (let i = 0; i < 6; i += 1) useChallengeStore.getState().submit();
    const state = useChallengeStore.getState();
    expect(state.attempts).toBe(6);
    expect(state.status).toBe('active');
  });

  it('completes and scores a correct submission', async () => {
    await useChallengeStore.getState().start('beginner', 9);
    const scenario = useChallengeStore.getState().scenario;
    expect(scenario).not.toBeNull();
    useCircuitStore
      .getState()
      .setCircuit(rebuild((scenario as NonNullable<typeof scenario>).targetCircuit));

    const evaluation = useChallengeStore.getState().submit();
    expect(evaluation?.success).toBe(true);
    const state = useChallengeStore.getState();
    expect(state.status).toBe('completed');
    expect(state.score).not.toBeNull();
    expect((state.score?.points ?? 0) > 0).toBe(true);
  });

  it('ignores submissions once completed', async () => {
    await useChallengeStore.getState().start('beginner', 9);
    const scenario = useChallengeStore.getState().scenario;
    useCircuitStore
      .getState()
      .setCircuit(rebuild((scenario as NonNullable<typeof scenario>).targetCircuit));
    useChallengeStore.getState().submit();
    const attemptsAfterWin = useChallengeStore.getState().attempts;
    expect(useChallengeStore.getState().submit()).toBeNull();
    expect(useChallengeStore.getState().attempts).toBe(attemptsAfterWin);
  });

  it('returns null when no challenge is active', () => {
    expect(useChallengeStore.getState().submit()).toBeNull();
  });
});

describe('hints (plan §17)', () => {
  it('reveals hints one at a time up to the available count', async () => {
    await useChallengeStore.getState().start('beginner', 12);
    const total = useChallengeStore.getState().scenario?.hints.length ?? 0;
    for (let i = 0; i < total + 3; i += 1) useChallengeStore.getState().revealHint();
    expect(useChallengeStore.getState().hintsUsed).toBe(total);
  });

  it('does nothing when idle', () => {
    useChallengeStore.getState().revealHint();
    expect(useChallengeStore.getState().hintsUsed).toBe(0);
  });
});

describe('abandon / new challenge (plan §22)', () => {
  it('asks for confirmation when meaningful progress exists', async () => {
    await useChallengeStore.getState().start('beginner', 3);
    useChallengeStore.getState().submit(); // one attempt = progress
    expect(useChallengeStore.getState().requestNew()).toBe(true);
    expect(useChallengeStore.getState().confirmingNew).toBe(true);
  });

  it('does not ask when nothing has been done yet', async () => {
    await useChallengeStore.getState().start('beginner', 3);
    expect(useChallengeStore.getState().requestNew()).toBe(false);
    expect(useChallengeStore.getState().confirmingNew).toBe(false);
  });

  it('cancels the confirmation', async () => {
    await useChallengeStore.getState().start('beginner', 3);
    useChallengeStore.getState().submit();
    useChallengeStore.getState().requestNew();
    useChallengeStore.getState().cancelNew();
    expect(useChallengeStore.getState().confirmingNew).toBe(false);
    expect(useChallengeStore.getState().status).toBe('active');
  });

  it('clears session state on abandon', async () => {
    await useChallengeStore.getState().start('beginner', 3);
    await useChallengeStore.getState().abandon();
    const state = useChallengeStore.getState();
    expect(state.status).toBe('abandoned');
    expect(state.scenario).toBeNull();
    expect(state.attempts).toBe(0);
  });
});

describe('resume (plan §21)', () => {
  it('restores an in-flight challenge from the seed', async () => {
    await useChallengeStore.getState().start('intermediate', 654);
    await flush();
    const original = useChallengeStore.getState().scenario?.challengeId;

    // Simulate a page reload: wipe in-memory state, keep IDB.
    useChallengeStore.setState({
      status: 'idle',
      scenario: null,
      attempts: 0,
      hintsUsed: 0,
      elapsedMs: 0,
      startedAt: null,
    });

    expect(await useChallengeStore.getState().resume()).toBe(true);
    const state = useChallengeStore.getState();
    expect(state.status).toBe('active');
    expect(state.scenario?.challengeId).toBe(original);
  });

  it('returns false when there is nothing to resume', async () => {
    expect(await useChallengeStore.getState().resume()).toBe(false);
  });

  it('preserves attempts and hints across a resume', async () => {
    await useChallengeStore.getState().start('beginner', 21);
    useChallengeStore.getState().revealHint();
    useChallengeStore.getState().submit();
    await flush();

    useChallengeStore.setState({ status: 'idle', scenario: null, attempts: 0, hintsUsed: 0 });
    await useChallengeStore.getState().resume();
    const state = useChallengeStore.getState();
    expect(state.attempts).toBe(1);
    expect(state.hintsUsed).toBe(1);
  });
});

describe('timing', () => {
  it('reports non-negative elapsed time that stops after completion', async () => {
    await useChallengeStore.getState().start('beginner', 15);
    expect(useChallengeStore.getState().totalElapsedMs()).toBeGreaterThanOrEqual(0);

    const scenario = useChallengeStore.getState().scenario;
    useCircuitStore
      .getState()
      .setCircuit(rebuild((scenario as NonNullable<typeof scenario>).targetCircuit));
    useChallengeStore.getState().submit();

    const first = useChallengeStore.getState().totalElapsedMs();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(useChallengeStore.getState().totalElapsedMs()).toBe(first);
  });
});
