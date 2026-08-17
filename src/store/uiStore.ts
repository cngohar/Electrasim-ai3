/**
 * uiStore — ephemeral UI state: simulation on/off, latest sim result, log
 * stream, interaction mode, panel open/close flags.
 *
 * Not undoable. Not persisted (yet — Phase 6 will persist the parts the user
 * cares about, like panel layout, into IndexedDB).
 *
 * NOTE: this file was slimmed from the former 906-line monolith. Types live
 * in `./uiStore.types.ts` and entity/onboarding helpers in
 * `./uiStore.helpers.ts`; both are re-exported below so existing imports
 * keep working.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { COMPONENT_DEFS, type ComponentInstance, type WireInstance } from '../domain';
import { validateCircuit } from '../domain/circuitValidation';
import { useCircuitStore } from './circuitStore';
import { useSettingsStore } from './settingsStore';
import {
  createComponent,
  createWire,
  hasWelcomed,
  markMobileSuitabilityAcknowledged,
  markWelcomed,
  mobileSuitabilityInitiallyOpen,
} from './uiStore.helpers';
import type { EventHistoryEntry, UiState } from './uiStore.types';

// Re-export the moved public surface so existing imports keep working.
export type {
  ContextMenuState,
  PendingCustomPath,
  PendingDeletion,
  RerouteState,
} from './uiStore.types';
export type { ElectricalFaultAlert } from './uiStore.types';
export {
  MOBILE_SUITABILITY_STORAGE_KEY,
  shouldShowMobileSuitability,
} from './uiStore.helpers';

const MAX_LOGS = 100;
let nextLogId = 0;
let validationTimer: ReturnType<typeof setTimeout> | null = null;
let validationRevision = 0;

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
    guideHidden: false,
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
    logOpen: false,
    inspectorOpen: true,
    inspectorCollapsed: true,
    commandPaletteOpen: false,

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
          // Compliance gate (Pro mode only): the active regulation standard's
          // blocking errors (voltage drop, missing RCD, wrong MCB curve) must
          // be resolved before simulation can run. In Basic / Student mode the
          // check is advisory — learners are free to run whatever they build.
          const appMode = useSettingsStore.getState().appMode;
          const isPro = appMode === 'pro';
          const standard = useSettingsStore.getState().regulationStandard;
          const report = validateCircuit(
            { components: cs.components, wires: cs.wires, globalVoltage: cs.globalVoltage },
            s.simResult,
            standard,
          );
          if (isPro && (report.blockingErrorsCount ?? 0) > 0) {
            s.simRunning = false;
            s.validationReport = report;
            s.inspectorOpen = true;
            s.inspectorCollapsed = false;
            s.activeInspectorTab = 'validation';
            const firstBlocking = report.issues.find((i) => i.blocking && i.severity === 'error');
            s.faultAlert = {
              title: '⛔ COMPLIANCE CHECK FAILED',
              kind: 'trip',
              reason: firstBlocking
                ? `Simulation blocked: ${firstBlocking.title}`
                : 'Simulation blocked by regulatory compliance violations.',
              currentAmps: 0,
              limitAmps: 0,
              resolutionHint:
                'Open the Validation tab to review and fix the highlighted violations, then run the simulation again.',
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
          const appMode = useSettingsStore.getState().appMode;
          const isPro = appMode === 'pro';
          const standard = useSettingsStore.getState().regulationStandard;
          const report = validateCircuit(
            { components: cs.components, wires: cs.wires, globalVoltage: cs.globalVoltage },
            s.simResult,
            standard,
          );
          if (isPro && (report.blockingErrorsCount ?? 0) > 0) {
            s.simRunning = false;
            s.validationReport = report;
            s.inspectorOpen = true;
            s.inspectorCollapsed = false;
            s.activeInspectorTab = 'validation';
            const firstBlocking = report.issues.find((i) => i.blocking && i.severity === 'error');
            s.faultAlert = {
              title: '⛔ COMPLIANCE CHECK FAILED',
              kind: 'trip',
              reason: firstBlocking
                ? `Simulation blocked: ${firstBlocking.title}`
                : 'Simulation blocked by regulatory compliance violations.',
              currentAmps: 0,
              limitAmps: 0,
              resolutionHint:
                'Open the Validation tab to review and fix the highlighted violations, then run the simulation again.',
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
        // Read the active regulation standard lazily so a template switch
        // immediately re-validates against the new rule set.
        const standard = useSettingsStore.getState().regulationStandard;
        const report = validateCircuit(
          { components: cs.components, wires: cs.wires, globalVoltage: cs.globalVoltage },
          currentUi.simResult,
          standard,
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
          // Audit trail: record every blocking compliance violation in the
          // Pro Simulation History log. We only record errors so the log
          // doesn't fill with duplicate warnings on each edit.
          if (report.issues) {
            const blocking = report.issues.filter((i) => i.blocking && i.severity === 'error');
            const now = Date.now();
            for (const issue of blocking) {
              // Avoid duplicate entries for the same issue within 5 s.
              const recent = s.eventHistory.find(
                (e) =>
                  e.eventType === 'regulatory_violation' &&
                  e.details?.issueId === issue.id &&
                  now - e.timestamp < 5000,
              );
              if (!recent) {
                s.eventHistory.unshift({
                  id: `event-${now}-${Math.random().toString(36).slice(2, 7)}`,
                  timestamp: now,
                  eventType: 'regulatory_violation',
                  description: issue.title,
                  severity: 'critical',
                  componentId: issue.componentId,
                  wireId: issue.wireId,
                  details: {
                    issueId: issue.id,
                    reason: issue.description,
                    standard: report.standard,
                  },
                });
              }
            }
            if (s.eventHistory.length > 100) s.eventHistory.length = 100;
          }
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
    setCommandPaletteOpen: (open) =>
      set((s) => {
        s.commandPaletteOpen = open;
      }),
    toggleCommandPalette: () =>
      set((s) => {
        s.commandPaletteOpen = !s.commandPaletteOpen;
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
        // Switching or loading a guide always reveals its checklist.
        s.guideHidden = false;
      }),
    setGuideHidden: (hidden) =>
      set((s) => {
        s.guideHidden = hidden;
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
