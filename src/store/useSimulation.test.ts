import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Circuit, SimulationResult } from '../domain';

const { simulateAsync } = vi.hoisted(() => ({
  simulateAsync: vi.fn(),
}));

vi.mock('../sim-worker/client', () => ({ simulateAsync }));

import { useCircuitStore } from './circuitStore';
import { useUiStore } from './uiStore';
import { useSimulation } from './useSimulation';

const EMPTY_CIRCUIT: Circuit = { components: [], wires: [] };

function resultFor(id: string): SimulationResult {
  return {
    energizedComponents: new Set([id]),
    energizedWires: new Set(),
    errorComponents: new Set(),
    errorWires: new Set(),
    errors: [],
    warnings: [],
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('useSimulation request sequencing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    simulateAsync.mockReset();
    useCircuitStore.getState().setCircuit(EMPTY_CIRCUIT);
    useUiStore.setState({ simRunning: false, simResult: null, logs: [] });
  });

  afterEach(() => {
    act(() => useUiStore.getState().setSimRunning(false));
    vi.useRealTimers();
  });

  it('clears a published result as soon as simulation inputs change', async () => {
    const pending = deferred<SimulationResult>();
    simulateAsync.mockResolvedValueOnce(resultFor('previous')).mockReturnValueOnce(pending.promise);

    renderHook(() => useSimulation());
    act(() => useUiStore.getState().setSimRunning(true));
    await act(async () => vi.advanceTimersByTime(50));
    await act(async () => Promise.resolve());
    expect(useUiStore.getState().simResult?.energizedComponents).toEqual(new Set(['previous']));

    act(() => useCircuitStore.getState().setGlobalSupplyVoltage(120));

    expect(useUiStore.getState().simResult).toBeNull();
    await act(async () => vi.advanceTimersByTime(50));
    expect(simulateAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ globalVoltage: 120 }),
      { appMode: 'basic', standard: 'uk' },
    );
  });

  it('invalidates an in-flight result before the replacement debounce fires', async () => {
    const stale = deferred<SimulationResult>();
    const current = deferred<SimulationResult>();
    simulateAsync.mockReturnValueOnce(stale.promise).mockReturnValueOnce(current.promise);

    renderHook(() => useSimulation());
    act(() => useUiStore.getState().setSimRunning(true));
    await act(async () => vi.advanceTimersByTime(50));
    expect(simulateAsync).toHaveBeenCalledTimes(1);

    act(() => {
      useCircuitStore.getState().setCircuit({
        components: [{ id: 'new-input', type: 'bulb', x: 0, y: 0, state: {} }],
        wires: [],
      });
    });

    await act(async () => {
      stale.resolve(resultFor('stale'));
      await stale.promise;
    });
    expect(useUiStore.getState().simResult).toBeNull();

    await act(async () => vi.advanceTimersByTime(50));
    expect(simulateAsync).toHaveBeenCalledTimes(2);

    await act(async () => {
      current.resolve(resultFor('current'));
      await current.promise;
    });
    expect(useUiStore.getState().simResult?.energizedComponents).toEqual(new Set(['current']));
  });

  it('stops simulation immediately when a manual fault is injected', async () => {
    useCircuitStore.getState().setCircuit({
      components: [{ id: 'bulb-1', type: 'bulb', x: 0, y: 0, state: {} }],
      wires: [],
    });

    renderHook(() => useSimulation());
    act(() => useUiStore.getState().setSimRunning(true));
    expect(useUiStore.getState().simRunning).toBe(true);

    act(() => {
      useCircuitStore.getState().setComponentFault('bulb-1', 'short-circuit');
    });

    expect(useUiStore.getState().simRunning).toBe(false);
  });
});
