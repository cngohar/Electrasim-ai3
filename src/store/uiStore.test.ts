import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateCircuitJSON } from '../lib/exportImport';
import { clearHistory, useCircuitStore } from './circuitStore';
import { MOBILE_SUITABILITY_STORAGE_KEY, shouldShowMobileSuitability, useUiStore } from './uiStore';

const resetInteractionState = () => {
  useUiStore.setState({
    mode: 'idle',
    pendingWireFrom: null,
    pendingCustomPath: null,
    placingType: null,
    reroute: null,
    mobileSuitabilityOpen: false,
    welcomeOpen: false,
  });
};

beforeEach(() => {
  window.localStorage.clear();
  resetInteractionState();
});
afterEach(() => {
  window.localStorage.clear();
  resetInteractionState();
});

describe('uiStore interaction modes', () => {
  it('cancels transient wiring and placement state when returning to Select mode', () => {
    useUiStore.setState({
      mode: 'wiring',
      pendingWireFrom: { componentId: 'live', portIndex: 0 },
      pendingCustomPath: {
        from: { componentId: 'live', portIndex: 0 },
        checkpoints: [{ x: 10, y: 20 }],
      },
      placingType: 'bulb',
      reroute: { wireId: 'wire', end: 'to', source: 'armed' },
    });

    useUiStore.getState().setMode('idle');

    const state = useUiStore.getState();
    expect(state.pendingWireFrom).toBeNull();
    expect(state.pendingCustomPath).toBeNull();
    expect(state.placingType).toBeNull();
    expect(state.reroute).toBeNull();
  });
});

describe('simulation safety guards', () => {
  it('does not restart while a protection device remains tripped', () => {
    useCircuitStore.setState({
      components: [
        { id: 'breaker', type: 'mcb', x: 0, y: 0, state: { on: true, isTripped: true } },
      ],
      wires: [],
    });
    useUiStore.setState({ simRunning: false, faultAlert: null });

    useUiStore.getState().setSimRunning(true);

    expect(useUiStore.getState().simRunning).toBe(false);
    expect(useUiStore.getState().faultAlert?.title).toContain('UNRESOLVED');
  });
});

describe('circuit validation quick fixes', () => {
  it('creates valid component instances through one graph edit per fix', () => {
    vi.useFakeTimers();
    try {
      useCircuitStore.setState({
        components: [],
        wires: [],
        globalVoltage: 230,
        selectedComponentId: null,
        selectedComponentIds: [],
        selectedWireIds: [],
      });
      useUiStore.setState({ simRunning: false, logs: [] });
      clearHistory();

      useUiStore.getState().applyQuickFix({ type: 'add_power_supply', label: 'Add supply' });
      useUiStore.getState().applyQuickFix({ type: 'add_rcd', label: 'Add RCD' });

      const circuit = useCircuitStore.getState();
      expect(circuit.components.map((component) => component.type)).toEqual([
        'ac-mains-supply',
        'rcd',
      ]);
      expect(circuit.components.every((component) => typeof component.id === 'string')).toBe(true);
      expect(
        validateCircuitJSON({
          version: 1,
          circuit: {
            components: circuit.components,
            wires: circuit.wires,
            globalVoltage: circuit.globalVoltage,
          },
        }),
      ).toBeNull();
      expect(useCircuitStore.temporal.getState().pastStates).toHaveLength(2);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});

describe('mobile suitability onboarding', () => {
  it('only opens for an unacknowledged phone-sized viewport', () => {
    expect(shouldShowMobileSuitability(390, false)).toBe(true);
    expect(shouldShowMobileSuitability(390, true)).toBe(false);
    expect(shouldShowMobileSuitability(640, false)).toBe(false);
    expect(shouldShowMobileSuitability(1024, false)).toBe(false);
  });

  it('persists acknowledgement and then opens Welcome for a new user', () => {
    useUiStore.setState({ mobileSuitabilityOpen: true, welcomeOpen: false });

    useUiStore.getState().dismissMobileSuitability();

    expect(useUiStore.getState().mobileSuitabilityOpen).toBe(false);
    expect(useUiStore.getState().welcomeOpen).toBe(true);
    expect(window.localStorage.getItem(MOBILE_SUITABILITY_STORAGE_KEY)).toBe('1');
  });

  it('does not reopen Welcome for a returning user', () => {
    window.localStorage.setItem('electrasim:welcomed', '1');
    useUiStore.setState({ mobileSuitabilityOpen: true, welcomeOpen: false });

    useUiStore.getState().dismissMobileSuitability();

    expect(useUiStore.getState().mobileSuitabilityOpen).toBe(false);
    expect(useUiStore.getState().welcomeOpen).toBe(false);
  });
});
