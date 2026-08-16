/**
 * UI-store state & shape definitions.
 *
 * Split verbatim from the former monolithic `uiStore.ts`.
 */

import type {
  InteractionMode,
  LogEntry,
  LogLevel,
  Point2D,
  PortRef,
  SimulationResult,
} from '../domain';
import type {
  QuickFixAction,
  ValidationIssue,
  ValidationReport,
} from '../domain/circuitValidation';

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
    | 'component_repaired'
    | 'regulatory_violation'
    | 'manual_intervention';
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
    /** Validation issue id (regulatory violations in the audit history). */
    issueId?: string;
    /** Regulation standard under which a violation was detected. */
    standard?: string;
  };
}

export interface UiState {
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
  /**
   * The active guide's checklist is temporarily hidden so the canvas it
   * overlays becomes reachable again. Distinct from `activeGuideId: null`
   * (which ENDS the guide): hidden guides keep tracking progress and offer a
   * floating "Show guide steps" pill to return.
   */
  guideHidden: boolean;
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

  /** Active tab in Inspector panel ('properties' | 'connections' | 'simulation' | 'analytics' | 'validation' | 'logs' | 'history'). */
  activeInspectorTab:
    | 'properties'
    | 'connections'
    | 'simulation'
    | 'analytics'
    | 'validation'
    | 'logs'
    | 'history';

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
    tab:
      | 'properties'
      | 'connections'
      | 'simulation'
      | 'analytics'
      | 'validation'
      | 'logs'
      | 'history',
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
  setGuideHidden: (hidden: boolean) => void;
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
