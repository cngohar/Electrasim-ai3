/**
 * uiStore — ephemeral UI state: simulation on/off, latest sim result, log
 * stream, interaction mode, panel open/close flags.
 *
 * Not undoable. Not persisted (yet — Phase 6 will persist the parts the user
 * cares about, like panel layout, into IndexedDB).
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  ComponentInstance,
  FaultType,
  InteractionMode,
  LogEntry,
  LogLevel,
  Point2D,
  PortRef,
  SimulationResult,
  WireInstance,
} from '../domain';
import {
  type QuickFixAction,
  type ValidationIssue,
  type ValidationReport,
  validateCircuit,
} from '../domain/circuitValidation';
import { COMPONENT_DEFS } from '../domain/components';
import { useCircuitStore } from './circuitStore';

/**
 * Phase 6.1: in-flight wire reroute. The user is dragging (or has armed,
 * via select-then-click mode) one endpoint of an existing wire to a new
 * port. Renderers read this to draw a rubber-band from the *other* end of
 * the wire to the cursor.
 */
export interface RerouteState {
  wireId: string;
  end: 'from' | 'to';
  /** `'drag'` = pointer is held; `'armed'` = waiting for next port click. */
  source: 'drag' | 'armed';
}

/**
 * Phase 6.1: unified pending-deletion request. The destination behaviour
 * depends on `useSettingsStore.confirmDelete`:
 *   - true  → render a ConfirmDialog that calls the matching remover
 *             when accepted;
 *   - false → the action runs immediately and `pendingDeletion` is never
 *             set (helpers in `canvas-actions.ts` handle the branching).
 */
export type PendingDeletion =
  | { kind: 'component'; id: string }
  | { kind: 'components'; ids: string[] }
  | { kind: 'wire'; id: string }
  | { kind: 'clear-wires' }
  | { kind: 'clear-all' }
  | { kind: 'reset' };

/**
 * Phase 7: in-flight custom-path wire being drawn.
 * `from` is the origin port; `checkpoints` are the user-placed corners
 * that will become the wire's stored `controlPoints` on commit.
 */
export interface PendingCustomPath {
  from: PortRef;
  checkpoints: Point2D[];
}

/**
 * Phase 6.5.2: Right-click context menu state.
 * `target` describes what was right-clicked so the menu can show
 * context-sensitive items.
 */
export interface ContextMenuState {
  /** Screen-space position for the popup. */
  x: number;
  y: number;
  target: { kind: 'canvas' } | { kind: 'component'; id: string } | { kind: 'wire'; id: string };
}

export interface ElectricalFaultAlert {
  title: string;
  kind: 'trip' | 'melt' | 'short' | 'blow';
  deviceName?: string;
  deviceId?: string;
  wireId?: string;
  reason: string;
  currentAmps: number;
  limitAmps: number;
  cableMm2?: number;
  resolutionHint: string;
  /** Timestamp when the fault occurred */
  timestamp?: number;
}

/** Event history entry for tracking electrical events over time */
export interface EventHistoryEntry {
  id: string;
  timestamp: number;
  eventType:
    | 'fault_detected'
    | 'fault_injected'
    | 'component_tripped'
    | 'wire_overheated'
    | 'component_blown'
    | 'wire_melted'
    | 'fault_cleared'
    | 'component_repaired';
  componentName?: string;
  componentType?: string;
  componentId?: string;
  wireId?: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  details?: {
    currentAmps?: number;
    voltage?: number;
    cableMm2?: number;
    reason?: string;
    faultType?: string;
  };
}

interface UiState {
  simRunning: boolean;
  simResult: SimulationResult | null;
  faultAlert: ElectricalFaultAlert | null;
  lastFaultAlert: ElectricalFaultAlert | null;
  whatHappenedOpen: boolean;
  logs: LogEntry[];
  /** Event history for tracking electrical events over time */
  eventHistory: EventHistoryEntry[];
  mode: InteractionMode;

  /**
   * When the user has clicked the first port of a new wire but not yet the
   * second, this holds the origin. The canvas reads it to render a
   * rubber-band preview from the origin port to the cursor.
   */
  pendingWireFrom: PortRef | null;

  /**
   * Component type the user picked from the palette but has not yet placed
   * on the canvas. While set, the canvas shows a ghost preview at the
   * cursor and a click drops the component there.
   */
  placingType: string | null;

  /**
   * Active 2D renderer. `'svg'` is the simple, accessible, low-overhead
   * default suited to circuits up to ~50 items. `'pixi'` swaps in a WebGL2
   * scene-graph renderer designed to hit 60 fps at 200+ items.
   */
  renderer: 'svg' | 'pixi';

  // Phase 6.1 — wire reroute in flight + dialogs ──────────────────────────
  reroute: RerouteState | null;
  pendingDeletion: PendingDeletion | null;
  settingsOpen: boolean;
  /** Which tab is active when the settings modal opens. */
  settingsTab: string | null;
  /** ID of the component currently hovered (drives tooltips). */
  hoveredComponentId: string | null;
  /** Phase 6.4: Import/Export modal open state. */
  importExportOpen: boolean;
  /** Phase 6.5: Centered menu overlay open state. */
  menuOpen: boolean;
  /** Phase 6.5.1: Documentation page open + optional scroll target. */
  docsOpen: boolean;
  docsScrollTo: string | null;
  /** Phase 6.6: Contact modal open state. */
  contactOpen: boolean;
  /** Guided circuit template chooser open state. */
  templatesOpen: boolean;
  /** Loaded guided circuit whose checklist is currently shown. */
  activeGuideId: string | null;
  /** First-visit welcome modal open state. */
  welcomeOpen: boolean;
  /** One-time phone advisory shown before the first-visit welcome. */
  mobileSuitabilityOpen: boolean;
  /** Phase 6.5.2: Right-click context menu. */
  contextMenu: ContextMenuState | null;
  /** Phase 6.2.3: rubber-band drag-rect for multi-select (world-space coords). */
  dragRect: { x1: number; y1: number; x2: number; y2: number } | null;
  /** Phase 7: custom-path wire being drawn (null when idle). */
  pendingCustomPath: PendingCustomPath | null;

  /** Variant preview mode: hovered variant type to show ghosted on canvas. */
  previewVariantType: string | null;
  /** Component ID associated with the previewed variant. */
  previewComponentId: string | null;

  /** Active component technical specifications modal (type string or null). */
  activeComponentInfoType: string | null;

  /** Event history panel open state. */
  eventHistoryOpen: boolean;

  /** Circuit validation report. */
  validationReport: ValidationReport | null;

  /** Circuit validation loading spinner state. */
  isValidatingCircuit: boolean;

  /** Selected validation issue for the 'View Details' modal. */
  activeValidationIssueModal: ValidationIssue | null;

  /** Active tab in Inspector panel ('properties' | 'connections' | 'simulation' | 'analytics' | 'validation' | 'logs'). */
  activeInspectorTab:
    | 'properties'
    | 'connections'
    | 'simulation'
    | 'analytics'
    | 'validation'
    | 'logs';

  /** Visual feedback mode: when true and a wire/component is selected, dims all unselected parts and highlights the traced path. */
  tracePathMode: boolean;

  /** Thermal overlay visualization for component heat mapping. */
  thermalOverlayEnabled: boolean;

  // Panel layout (Lab Glass · Light shell) ────────────────────────────────
  paletteOpen: boolean;
  logOpen: boolean;
  inspectorOpen: boolean;
  inspectorCollapsed: boolean;

  // Actions ───────────────────────────────────────────────────────────────
  setSimRunning: (v: boolean) => void;
  toggleSim: () => void;
  setSimResult: (r: SimulationResult | null) => void;
  setFaultAlert: (alert: ElectricalFaultAlert | null) => void;
  setWhatHappenedOpen: (open: boolean) => void;
  clearFaultAlert: () => void;
  addLog: (message: string, type: LogLevel) => void;
  clearLogs: () => void;
  /** Add an event to the event history */
  addEventHistory: (entry: Omit<EventHistoryEntry, 'id' | 'timestamp'>) => void;
  /** Clear the event history */
  clearEventHistory: () => void;
  setEventHistoryOpen: (open: boolean) => void;
  setValidationReport: (report: ValidationReport | null) => void;
  runCircuitValidation: () => void;
  setActiveValidationIssueModal: (issue: ValidationIssue | null) => void;
  setActiveInspectorTab: (
    tab: 'properties' | 'connections' | 'simulation' | 'analytics' | 'validation' | 'logs',
  ) => void;
  setTracePathMode: (active: boolean) => void;
  toggleTracePathMode: () => void;
  setThermalOverlayEnabled: (enabled: boolean) => void;
  applyQuickFix: (action: QuickFixAction) => void;
  setMode: (m: InteractionMode) => void;
  togglePalette: () => void;
  toggleLog: () => void;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  setPendingWireFrom: (p: PortRef | null) => void;
  setPlacingType: (type: string | null) => void;
  setRenderer: (r: 'svg' | 'pixi') => void;
  setReroute: (r: RerouteState | null) => void;
  setPendingDeletion: (d: PendingDeletion | null) => void;
  setSettingsOpen: (open: boolean, tab?: string | null) => void;
  setHoveredComponentId: (id: string | null) => void;
  setImportExportOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setDocsOpen: (open: boolean, scrollTo?: string | null) => void;
  setContactOpen: (open: boolean) => void;
  setTemplatesOpen: (open: boolean) => void;
  setActiveGuideId: (id: string | null) => void;
  setWelcomeOpen: (open: boolean) => void;
  dismissMobileSuitability: () => void;
  setContextMenu: (menu: ContextMenuState | null) => void;
  setDragRect: (rect: { x1: number; y1: number; x2: number; y2: number } | null) => void;
  /** Phase 7: start a new custom path from the given port. */
  startCustomPath: (from: PortRef) => void;
  /** Phase 7: append a canvas-space checkpoint to the in-flight path. */
  addCustomPathCheckpoint: (pt: Point2D) => void;
  /** Phase 7: cancel (Esc) — discard the in-flight custom path. */
  cancelCustomPath: () => void;
  setPreviewVariant: (type: string | null, componentId?: string | null) => void;
  setActiveComponentInfoType: (type: string | null) => void;
}

const MAX_LOGS = 100;
let nextLogId = 0;
let nextEntityId = 0;
let validationTimer: ReturnType<typeof setTimeout> | null = null;
let validationRevision = 0;

function uniqueEntityId(prefix: string, existingIds: Iterable<string>): string {
  const existing = new Set(existingIds);
  let id = '';
  do {
    id = `${prefix}-${Date.now().toString(36)}-${(++nextEntityId).toString(36)}`;
  } while (existing.has(id));
  return id;
}

function createComponent(type: string, x: number, y: number, existingIds: Iterable<string>) {
  const def = COMPONENT_DEFS[type];
  if (!def) return null;
  return {
    id: uniqueEntityId(type.split('-')[0] ?? 'component', existingIds),
    type,
    x,
    y,
    state: def.defaultOn ? { on: true } : {},
  } satisfies ComponentInstance;
}

function createWire(
  endpoints: Omit<WireInstance, 'id' | 'controlPoints' | 'pathKind'>,
  existingIds: Iterable<string>,
): WireInstance {
  return {
    id: uniqueEntityId('wire', existingIds),
    ...endpoints,
    controlPoints: [],
    pathKind: 'orthogonal',
  };
}

export const MOBILE_SUITABILITY_STORAGE_KEY = 'electrasim:mobile-suitability:v1';
const PHONE_BREAKPOINT = 640;

export function shouldShowMobileSuitability(width: number, acknowledged: boolean): boolean {
  return width < PHONE_BREAKPOINT && !acknowledged;
}

function hasWelcomed(): boolean {
  try {
    return (
      typeof window !== 'undefined' && window.localStorage.getItem('electrasim:welcomed') === '1'
    );
  } catch {
    return false;
  }
}

function markWelcomed(): void {
  try {
    window.localStorage.setItem('electrasim:welcomed', '1');
  } catch {
    // The editor remains usable when storage is disabled or unavailable.
  }
}

function hasAcknowledgedMobileSuitability(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage.getItem(MOBILE_SUITABILITY_STORAGE_KEY) === '1'
    );
  } catch {
    return false;
  }
}

function markMobileSuitabilityAcknowledged(): void {
  try {
    window.localStorage.setItem(MOBILE_SUITABILITY_STORAGE_KEY, '1');
  } catch {
    // The advisory can still be dismissed for this session when storage is unavailable.
  }
}

const mobileSuitabilityInitiallyOpen =
  typeof window !== 'undefined' &&
  shouldShowMobileSuitability(window.innerWidth, hasAcknowledgedMobileSuitability());

export const useUiStore = create<UiState>()(
  immer<UiState>((set) => ({
    simRunning: false,
    simResult: null,
    faultAlert: null,
    lastFaultAlert: null,
    whatHappenedOpen: false,
    logs: [],
    eventHistory: [],
    eventHistoryOpen: false,
    mode: 'idle',
    pendingWireFrom: null,
    placingType: null,
    renderer: 'svg',
    reroute: null,
    pendingDeletion: null,
    settingsOpen: false,
    settingsTab: null,
    hoveredComponentId: null,
    importExportOpen: false,
    menuOpen: false,
    docsOpen: false,
    docsScrollTo: null,
    contactOpen: false,
    templatesOpen: false,
    activeGuideId: null,
    welcomeOpen: !hasWelcomed() && !mobileSuitabilityInitiallyOpen,
    mobileSuitabilityOpen: mobileSuitabilityInitiallyOpen,
    contextMenu: null,
    dragRect: null,
    pendingCustomPath: null,
    previewVariantType: null,
    previewComponentId: null,
    activeComponentInfoType: null,
    validationReport: null,
    isValidatingCircuit: false,
    activeValidationIssueModal: null,
    activeInspectorTab: 'properties',
    tracePathMode: true,
    thermalOverlayEnabled: false,

    paletteOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    logOpen: true,
    inspectorOpen: true,
    inspectorCollapsed: true,

    setSimRunning: (v) =>
      set((s) => {
        if (v) {
          const cs = useCircuitStore.getState();
          const hasDamagedOrTripped = cs.components.some(
            (c) => c.state?.isBlown || c.state?.isTripped,
          );
          const hasBusted = cs.wires.some((w) => w.isBusted);
          if (hasDamagedOrTripped || hasBusted) {
            s.simRunning = false;
            s.faultAlert = {
              title: '⚠️ UNRESOLVED ELECTRICAL FAULT',
              kind: 'trip',
              reason:
                'Cannot run simulation while components are tripped/blown or wires are melted. Please fix circuit parameter overload or click Repair.',
              currentAmps: 0,
              limitAmps: 0,
              resolutionHint:
                'Adjust power (W) or current (A) in the Inspector panel or increase cable gauge, then click "Repair & Reset Circuit" to resume.',
            };
            return;
          }
        }
        s.simRunning = v;
      }),
    toggleSim: () =>
      set((s) => {
        const nextState = !s.simRunning;
        if (nextState) {
          const cs = useCircuitStore.getState();
          const hasDamagedOrTripped = cs.components.some(
            (c) => c.state?.isBlown || c.state?.isTripped,
          );
          const hasBusted = cs.wires.some((w) => w.isBusted);
          if (hasDamagedOrTripped || hasBusted) {
            s.simRunning = false;
            s.faultAlert = {
              title: '⚠️ UNRESOLVED ELECTRICAL FAULT',
              kind: 'trip',
              reason:
                'Cannot run simulation while components are tripped/blown or wires are melted. Please fix circuit parameter overload or click Repair.',
              currentAmps: 0,
              limitAmps: 0,
              resolutionHint:
                'Adjust power (W) or current (A) in the Inspector panel or increase cable gauge, then click "Repair & Reset Circuit" to resume.',
            };
            return;
          }
        }
        s.simRunning = nextState;
      }),
    setSimResult: (r) =>
      set((s) => {
        s.simResult = r;
      }),
    setFaultAlert: (alert) =>
      set((s) => {
        s.faultAlert = alert;
        if (alert) s.lastFaultAlert = alert;
      }),
    setWhatHappenedOpen: (open) =>
      set((s) => {
        s.whatHappenedOpen = open;
      }),
    clearFaultAlert: () =>
      set((s) => {
        s.faultAlert = null;
      }),

    addLog: (message, type) =>
      set((s) => {
        s.logs.unshift({ id: `log-${++nextLogId}`, message, type });
        if (s.logs.length > MAX_LOGS) s.logs.length = MAX_LOGS;
      }),
    clearLogs: () =>
      set((s) => {
        s.logs = [];
      }),
    addEventHistory: (entry) =>
      set((s) => {
        const newEntry: EventHistoryEntry = {
          ...entry,
          id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        };
        s.eventHistory.unshift(newEntry);
        // Keep last 100 events
        if (s.eventHistory.length > 100) s.eventHistory.length = 100;
      }),
    clearEventHistory: () =>
      set((s) => {
        s.eventHistory = [];
      }),
    setEventHistoryOpen: (open) =>
      set((s) => {
        s.eventHistoryOpen = open;
      }),

    setValidationReport: (report) =>
      set((s) => {
        s.validationReport = report;
      }),

    setActiveValidationIssueModal: (issue) =>
      set((s) => {
        s.activeValidationIssueModal = issue;
      }),

    setActiveInspectorTab: (tab) =>
      set((s) => {
        s.activeInspectorTab = tab;
      }),

    setTracePathMode: (active) =>
      set((s) => {
        s.tracePathMode = active;
      }),

    toggleTracePathMode: () =>
      set((s) => {
        s.tracePathMode = !s.tracePathMode;
      }),

    setThermalOverlayEnabled: (enabled) =>
      set((s) => {
        s.thermalOverlayEnabled = enabled;
      }),

    runCircuitValidation: () => {
      const revision = ++validationRevision;
      if (validationTimer) clearTimeout(validationTimer);

      useUiStore.setState((s) => {
        s.isValidatingCircuit = true;
        s.inspectorOpen = true;
        s.inspectorCollapsed = false;
        s.activeInspectorTab = 'validation';
      });

      validationTimer = setTimeout(() => {
        validationTimer = null;
        if (revision !== validationRevision) return;

        const cs = useCircuitStore.getState();
        const currentUi = useUiStore.getState();
        const report = validateCircuit(
          { components: cs.components, wires: cs.wires, globalVoltage: cs.globalVoltage },
          currentUi.simResult,
        );
        const summaryText = `Circuit Validation: ${report.summary.errorsCount} error(s), ${report.summary.warningsCount} warning(s), ${report.summary.passedCount} check(s) passed.`;

        useUiStore.setState((s) => {
          if (revision !== validationRevision) return;
          s.validationReport = report;
          s.isValidatingCircuit = false;
          s.logs.unshift({
            id: `log-${++nextLogId}`,
            type:
              report.status === 'fail'
                ? 'error'
                : report.status === 'warning'
                  ? 'warning'
                  : 'success',
            message: summaryText,
          });
          if (s.logs.length > MAX_LOGS) s.logs.length = MAX_LOGS;
        });
      }, 350);
    },

    applyQuickFix: (action) => {
      const cs = useCircuitStore.getState();
      const ui = useUiStore.getState();

      if (action.type === 'add_earth_wire') {
        const component = action.componentId
          ? cs.components.find((item) => item.id === action.componentId)
          : null;
        const definition = component ? COMPONENT_DEFS[component.type] : undefined;
        const earthPortIndex = definition?.ports.findIndex((port) => port.type === 'earth') ?? -1;

        if (!component || earthPortIndex < 0) {
          ui.addLog('Quick Fix skipped: selected component has no Earth terminal.', 'warning');
        } else {
          const earthSource = cs.components.find((candidate) => {
            if (candidate.id === component.id || !COMPONENT_DEFS[candidate.type]?.isSource) {
              return false;
            }
            return COMPONENT_DEFS[candidate.type]?.ports.some((port) => port.type === 'earth');
          });
          const sourceEarthPortIndex = earthSource
            ? (COMPONENT_DEFS[earthSource.type]?.ports.findIndex((port) => port.type === 'earth') ??
              -1)
            : -1;

          if (earthSource && sourceEarthPortIndex >= 0) {
            const wire = createWire(
              {
                fromComponentId: component.id,
                fromPortIndex: earthPortIndex,
                toComponentId: earthSource.id,
                toPortIndex: sourceEarthPortIndex,
              },
              cs.wires.map((item) => item.id),
            );
            cs.applyGraphChanges({ addWires: [wire] });
            ui.addLog(
              `Quick Fix Applied: Connected Earth CPC conductor to ${definition?.label ?? component.type}.`,
              'info',
            );
          } else {
            const earthTerminal = createComponent(
              'earth-terminal',
              component.x + 130,
              component.y + 70,
              cs.components.map((item) => item.id),
            );
            if (earthTerminal) {
              const wire = createWire(
                {
                  fromComponentId: component.id,
                  fromPortIndex: earthPortIndex,
                  toComponentId: earthTerminal.id,
                  toPortIndex: 0,
                },
                cs.wires.map((item) => item.id),
              );
              cs.applyGraphChanges({ addComponents: [earthTerminal], addWires: [wire] });
              ui.addLog(
                'Quick Fix Applied: Created Earth Terminal and connected protective conductor.',
                'info',
              );
            }
          }
        }
      } else if (action.type === 'increase_cable_gauge' || action.type === 'upgrade_mcb') {
        if (action.componentId) {
          const component = cs.components.find((item) => item.id === action.componentId);
          if (component) {
            if (action.targetCableMm2) {
              cs.updateComponentState(component.id, { customCableMm2: action.targetCableMm2 });
              ui.addLog(
                `Quick Fix Applied: Upgraded cable section to ${action.targetCableMm2}mm².`,
                'info',
              );
            }
            if (action.targetMaxAmps) {
              cs.updateComponentState(component.id, { customMaxAmps: action.targetMaxAmps });
              ui.addLog(
                `Quick Fix Applied: Adjusted protection breaker rating to ${action.targetMaxAmps}A.`,
                'info',
              );
            }
          }
        }
      } else if (action.type === 'rewire_switch_live') {
        const switchComponent = action.componentId
          ? cs.components.find((item) => item.id === action.componentId)
          : null;
        const liveSource = cs.components.find((candidate) => {
          const candidateDefinition = COMPONENT_DEFS[candidate.type];
          return (
            candidateDefinition?.isSource === true &&
            candidateDefinition.ports.some((port) => port.type === 'live')
          );
        });
        const liveSourcePort = liveSource
          ? (COMPONENT_DEFS[liveSource.type]?.ports.findIndex((port) => port.type === 'live') ?? -1)
          : -1;
        const switchLivePort = switchComponent
          ? (COMPONENT_DEFS[switchComponent.type]?.ports.findIndex(
              (port) => port.type === 'live',
            ) ?? -1)
          : -1;

        if (switchComponent && liveSource && liveSourcePort >= 0 && switchLivePort >= 0) {
          const connectedWireIds = cs.wires
            .filter(
              (wire) =>
                wire.fromComponentId === switchComponent.id ||
                wire.toComponentId === switchComponent.id,
            )
            .map((wire) => wire.id);
          const replacement = createWire(
            {
              fromComponentId: liveSource.id,
              fromPortIndex: liveSourcePort,
              toComponentId: switchComponent.id,
              toPortIndex: switchLivePort,
            },
            cs.wires.map((item) => item.id),
          );
          cs.applyGraphChanges({ removeWireIds: connectedWireIds, addWires: [replacement] });
          ui.addLog(
            'Quick Fix Applied: Removed Neutral-side conductors and connected the switch input to Live. Reconnect the switched output to the intended load.',
            'warning',
          );
        } else {
          ui.addLog(
            'Quick Fix skipped: no compatible Live source or switch terminal found.',
            'warning',
          );
        }
      } else if (action.type === 'add_rcd') {
        const mainSupply = cs.components.find(
          (component) =>
            component.type.includes('mains') ||
            component.type.includes('supply') ||
            component.type.includes('board'),
        );
        const component = createComponent(
          'rcd',
          mainSupply ? mainSupply.x + 140 : 250,
          mainSupply ? mainSupply.y : 200,
          cs.components.map((item) => item.id),
        );
        if (component) {
          cs.applyGraphChanges({ addComponents: [component] });
          ui.addLog('Quick Fix Applied: Added 30mA RCD protection breaker to canvas.', 'info');
        }
      } else if (action.type === 'add_power_supply') {
        const component = createComponent(
          'ac-mains-supply',
          180,
          200,
          cs.components.map((item) => item.id),
        );
        if (component) {
          cs.applyGraphChanges({ addComponents: [component] });
          ui.addLog('Quick Fix Applied: Placed AC Mains Power Supply module on canvas.', 'info');
        }
      }

      useUiStore.getState().runCircuitValidation();
    },

    setMode: (m) =>
      set((s) => {
        s.mode = m;
        if (m === 'idle') {
          s.pendingWireFrom = null;
          s.pendingCustomPath = null;
          s.reroute = null;
          s.placingType = null;
        } else if (m === 'wiring') {
          s.placingType = null;
          s.reroute = null;
        }
      }),

    togglePalette: () =>
      set((s) => {
        s.paletteOpen = !s.paletteOpen;
      }),
    toggleLog: () =>
      set((s) => {
        s.logOpen = !s.logOpen;
      }),
    toggleInspector: () =>
      set((s) => {
        s.inspectorOpen = !s.inspectorOpen;
      }),
    setInspectorOpen: (open) =>
      set((s) => {
        s.inspectorOpen = open;
      }),
    setInspectorCollapsed: (collapsed) =>
      set((s) => {
        s.inspectorCollapsed = collapsed;
      }),
    setPendingWireFrom: (p) =>
      set((s) => {
        s.pendingWireFrom = p;
        // Phase 6.1.1 — mutual exclusion: entering wire mode cancels
        // any active palette placement.
        if (p) {
          s.placingType = null;
        }
      }),
    setPlacingType: (type) =>
      set((s) => {
        s.placingType = type;
        s.mode = type ? 'placing' : 'idle';
        // Phase 6.1.1 — mutual exclusion: clear pending wire origin when
        // the user picks a palette component, and vice-versa.
        if (type) {
          s.pendingWireFrom = null;
          s.reroute = null;
          // Auto-close palette on mobile so the canvas is fully visible
          // for the tap-to-place interaction.
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            s.paletteOpen = false;
          }
        }
      }),
    setRenderer: (r) =>
      set((s) => {
        s.renderer = r;
      }),
    setReroute: (r) =>
      set((s) => {
        s.reroute = r;
      }),
    setPendingDeletion: (d) =>
      set((s) => {
        s.pendingDeletion = d;
      }),
    setSettingsOpen: (open, tab) =>
      set((s) => {
        s.settingsOpen = open;
        s.settingsTab = tab ?? null;
      }),
    setHoveredComponentId: (id) =>
      set((s) => {
        s.hoveredComponentId = id;
      }),
    setImportExportOpen: (open) =>
      set((s) => {
        s.importExportOpen = open;
      }),
    setMenuOpen: (open) =>
      set((s) => {
        s.menuOpen = open;
      }),
    setDocsOpen: (open, scrollTo) =>
      set((s) => {
        s.docsOpen = open;
        s.docsScrollTo = scrollTo ?? null;
      }),
    setContactOpen: (open) =>
      set((s) => {
        s.contactOpen = open;
      }),
    setTemplatesOpen: (open) =>
      set((s) => {
        s.templatesOpen = open;
      }),
    setActiveGuideId: (id) =>
      set((s) => {
        s.activeGuideId = id;
      }),
    setWelcomeOpen: (open) =>
      set((s) => {
        s.welcomeOpen = open && !s.mobileSuitabilityOpen;
        if (!open) markWelcomed();
      }),
    dismissMobileSuitability: () =>
      set((s) => {
        markMobileSuitabilityAcknowledged();
        s.mobileSuitabilityOpen = false;
        if (!hasWelcomed()) s.welcomeOpen = true;
      }),
    setContextMenu: (menu) =>
      set((s) => {
        s.contextMenu = menu;
      }),
    setDragRect: (rect) =>
      set((s) => {
        s.dragRect = rect;
      }),
    //phase 7 custom wiring function start here
    startCustomPath: (from) =>
      set((s) => {
        s.pendingCustomPath = { from, checkpoints: [] };
        s.mode = 'wiring';
        s.pendingWireFrom = null;
      }),
    addCustomPathCheckpoint: (pt) =>
      set((s) => {
        if (s.pendingCustomPath) s.pendingCustomPath.checkpoints.push(pt);
      }),
    cancelCustomPath: () =>
      set((s) => {
        s.pendingCustomPath = null;
        s.mode = 'idle';
      }),
    setPreviewVariant: (type, componentId = null) =>
      set((s) => {
        s.previewVariantType = type;
        s.previewComponentId = type ? componentId : null;
      }),
    setActiveComponentInfoType: (type) =>
      set((s) => {
        s.activeComponentInfoType = type;
      }),
  })),
);
