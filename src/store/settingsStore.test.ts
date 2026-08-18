/**
 * settingsStore.test.ts — Phase 6.1.
 *
 * Mirrors the in-memory `idb-keyval` mock used by `persistence.test.ts`
 * so we can exercise hydrate + autosave without touching real IndexedDB.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mem = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => mem.get(key)),
  set: vi.fn(async (key: string, value: unknown) => {
    if (value === undefined) mem.delete(key);
    else mem.set(key, value);
  }),
}));

import {
  __SETTINGS_DEFAULTS,
  __SETTINGS_STORAGE_KEY,
  __parsePersistedSettings,
  clearPersistedSettings,
  startSettingsPersistence,
  useSettingsStore,
} from './settingsStore';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('settingsStore — Phase 6.1', () => {
  beforeEach(async () => {
    mem.clear();
    await clearPersistedSettings();
    // Reset internal `started` flag by re-importing? We can't, so the
    // first test sets up the subscription and subsequent tests reuse it
    // — that's fine because subscriptions are idempotent for our purpose.
    await startSettingsPersistence();
  });

  it('starts with documented defaults', () => {
    const s = useSettingsStore.getState();
    expect(s.confirmDelete).toBe(__SETTINGS_DEFAULTS.confirmDelete);
    expect(s.showTooltips).toBe(__SETTINGS_DEFAULTS.showTooltips);
    expect(s.currentFlowAnimation).toBe(__SETTINGS_DEFAULTS.currentFlowAnimation);
    expect(s.activeLoadEffects).toBe(__SETTINGS_DEFAULTS.activeLoadEffects);
  });

  it('hydrates only whitelisted settings with valid primitive and enum values', () => {
    const parsed = __parsePersistedSettings({
      version: 1,
      settings: {
        confirmDelete: false,
        showTooltips: false,
        currentFlowAnimation: false,
        activeLoadEffects: false,
        colorScheme: 'dark',
        routingStyle: 'bezier',
        reducedEffects: true,
        customWiringMode: true,
        showGrid: false,
        showMiniMap: false,
        canvasPreset: 'high-contrast',
        injected: 'must not survive',
      },
    });

    expect(parsed).toEqual({
      confirmDelete: false,
      showTooltips: false,
      currentFlowAnimation: false,
      activeLoadEffects: false,
      colorScheme: 'dark',
      routingStyle: 'bezier',
      reducedEffects: true,
      customWiringMode: true,
      showGrid: false,
      snapToGrid: true,
      showMiniMap: false,
      appMode: 'basic',
      canvasPreset: 'high-contrast',
      wireColorStandard: 'uk_eu',
      automaticComponentLabels: true,
      thermalOverlayEnabled: false,
      regulationStandard: 'uk',
      manualFaultInjection: true,
      stressZonesEnabled: false,
      autoWireJoints: false,
      plugSystem: 'bs1363',
      paletteOpen: true,
      inspectorCollapsed: true,
      logOpen: false,
      recentComponents: [],
    });

    expect(parsed).not.toHaveProperty('injected');
  });

  it('falls back field-by-field for missing or invalid stored settings', () => {
    const parsed = __parsePersistedSettings({
      version: 1,
      settings: {
        confirmDelete: 'no',
        colorScheme: 'sepia',
        routingStyle: 42,
        reducedEffects: null,
        showGrid: false,
        canvasPreset: 'unknown',
      },
    });

    expect(parsed).toEqual({ ...__SETTINGS_DEFAULTS, showGrid: false });
    // v1 blobs still hydrate (forward-compat onto v2 defaults); unknown
    // versions are rejected; malformed payloads are rejected.
    expect(__parsePersistedSettings({ version: 1, settings: {} })).toEqual(__SETTINGS_DEFAULTS);
    expect(__parsePersistedSettings({ version: 99, settings: {} })).toBeNull();
    expect(__parsePersistedSettings({ version: 2, settings: [] })).toBeNull();
  });

  it('debounce-saves toggled values to IDB', async () => {
    useSettingsStore.getState().setSetting('confirmDelete', false);
    useSettingsStore.getState().setSetting('showTooltips', false);

    await wait(220);

    const saved = mem.get(__SETTINGS_STORAGE_KEY) as
      | { version: number; settings: Record<string, boolean> }
      | undefined;
    expect(saved).toBeDefined();
    expect(saved?.version).toBe(2);
    expect(saved?.settings.confirmDelete).toBe(false);
    expect(saved?.settings.showTooltips).toBe(false);
    expect(saved?.settings.currentFlowAnimation).toBe(true);
  });

  it('flushes pending settings on pagehide', async () => {
    useSettingsStore.getState().setSetting('showMiniMap', false);

    window.dispatchEvent(new Event('pagehide'));
    await wait(0);

    const saved = mem.get(__SETTINGS_STORAGE_KEY) as
      | { settings: Record<string, boolean> }
      | undefined;
    expect(saved?.settings.showMiniMap).toBe(false);
  });

  it('resetSettings restores defaults', () => {
    useSettingsStore.getState().setSetting('confirmDelete', false);
    useSettingsStore.getState().setSetting('activeLoadEffects', false);
    useSettingsStore.getState().resetSettings();
    expect(useSettingsStore.getState().confirmDelete).toBe(true);
    expect(useSettingsStore.getState().activeLoadEffects).toBe(true);
  });

  it('records recent components, de-duplicating and capping at 6', () => {
    useSettingsStore.getState().recordRecentComponent('bulb');
    useSettingsStore.getState().recordRecentComponent('mcb');
    useSettingsStore.getState().recordRecentComponent('bulb'); // move to front
    useSettingsStore.getState().recordRecentComponent('socket-3pin');
    useSettingsStore.getState().recordRecentComponent('motor');
    useSettingsStore.getState().recordRecentComponent('rcd');
    useSettingsStore.getState().recordRecentComponent('fan');
    useSettingsStore.getState().recordRecentComponent('fuse'); // 7th

    const recents = useSettingsStore.getState().recentComponents;
    expect(recents).toHaveLength(6);
    expect(recents[0]).toBe('fuse');
    expect(recents.filter((t) => t === 'bulb')).toHaveLength(1); // de-duped
  });
});
