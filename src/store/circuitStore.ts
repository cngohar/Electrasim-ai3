/**
 * circuitStore — the single source of truth for the live circuit graph and
 * selection state. Everything else (renderer, inspector, console) reads from
 * this store via narrow selectors so unrelated changes don't trigger
 * re-renders (PLAN.md §5).
 *
 * Undo/redo: wrapped in `zundo`'s `temporal` middleware. History is limited to
 * 100 partial graph states; Immer structurally shares unchanged objects across
 * those states instead of deep-cloning the whole store.
 *
 * NOT undoable (kept out of `partialize`): selection, transient drag offsets.
 * Undoing a selection click would be confusing UX.
 */

import { temporal } from 'zundo';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  COMPONENT_DEFS,
  createInjectedFault,
  isWireFaultType,
  validateFaultCoexistence,
  type Circuit,
  type ComponentGroup,
  type ComponentInstance,
  type FaultTarget,
  type FaultType,
  type InjectedFault,
  type WireFaultType,
  type WireInstance,
} from '../domain';
import { buildSeedCircuit } from './seed';
import { useUiStore } from './uiStore';

type EditableWireProperties = Pick<
  WireInstance,
  | 'controlPoints'
  | 'pathKind'
  | 'lengthMeters'
  | 'deratingFactor'
  | 'customCableMm2'
  | 'material'
  | 'gauge'
>;

interface GraphChanges {
  addComponents?: ComponentInstance[];
  addWires?: WireInstance[];
  removeWireIds?: string[];
}

interface CircuitState {
  components: ComponentInstance[];
  wires: WireInstance[];
  globalVoltage: number;
  /** Active user-injected faults */
  faults: InjectedFault[];

  selectedComponentId: string | null;
  selectedWireIds: string[];
  /** Phase 6.2.3 multi-select: all selected component IDs (includes `selectedComponentId`). */
  selectedComponentIds: string[];
  /** Component groups for complex circuit management. */
  componentGroups: ComponentGroup[];

  // Mutators ──────────────────────────────────────────────────────────────
  setCircuit: (circuit: Circuit) => void;
  setGlobalSupplyVoltage: (voltage: number) => void;
  addComponent: (comp: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  toggleSwitch: (id: string) => void;
  setSwitchState: (id: string, on: boolean) => void;

  addWire: (wire: WireInstance) => void;
  /** Apply related component/wire additions and removals as one undoable graph edit. */
  applyGraphChanges: (changes: GraphChanges) => void;
  removeWire: (id: string) => void;
  /** Phase 6.9: remove every wire, keep components. Single undo step. */
  clearAllWires: () => void;
  /** Phase 6.9: remove every component AND every wire. Single undo step. */
  clearAllComponents: () => void;
  /**
   * Reroute one end of an existing wire to a different component+port.
   * `end` selects which side. Returns true if the reroute was applied.
   */
  rerouteWire: (
    id: string,
    end: 'from' | 'to',
    target: { componentId: string; portIndex: number },
  ) => boolean;

  /** Phase 6.2.3: move multiple components by the same delta (no snap — snap on drag-end). */
  moveComponents: (ids: string[], dx: number, dy: number) => void;
  /** Phase 6.3-slim: set absolute positions for multiple components in one undo entry (alignment). */
  setComponentPositions: (updates: { id: string; x: number; y: number }[]) => void;
  /** Remove the specified components and their connected wires in one undo step. */
  removeComponents: (ids: string[]) => void;
  /** Phase 6.2.3: remove all currently selected components + their wires in one undo step. */
  removeSelectedComponents: () => void;
  /**
   * Phase 6.2.4: paste an array of clipboard components onto the canvas.
   * Fresh IDs are generated for each pasted component; the pasted group
   * becomes the new selection. `offset` is applied to every position so
   * repeated pastes stack visually instead of landing on top.
   */
  pasteComponents: (items: ComponentInstance[], offset: { x: number; y: number }) => void;

  /** Rotate a component by delta degrees (defaults to 90 degrees). */
  rotateComponent: (id: string, deltaDegrees?: number) => void;
  /** Rotate all currently selected components by delta degrees (defaults to 90 degrees). */
  rotateSelected: (deltaDegrees?: number) => void;
  /** Remove all currently selected components and wires in one single transaction. */
  removeSelected: () => void;
  /** Auto-assign standard engineering labels (e.g. S1, L1, CB1, etc.) to components. */
  autoLabelAllComponents: () => void;
  /** Fault simulation: inject a structured fault into the circuit. */
  injectFault: (
    faultOrParams:
      | import('../domain').InjectedFault
      | { type: FaultType; target: import('../domain').FaultTarget; parameters?: Record<string, unknown> },
  ) => string;
  /** Fault simulation: remove a specific injected fault by ID. */
  removeFault: (faultId: string) => void;
  /** Fault simulation: toggle a specific fault type on a target. */
  toggleFault: (type: FaultType, target: import('../domain').FaultTarget) => void;
  /** Fault simulation: inject or clear a fault on one wire. */
  setWireFault: (id: string, fault: WireFaultType | undefined) => void;
  /** Fault simulation: inject or clear a fault on one component. */
  setComponentFault: (id: string, fault: FaultType | undefined) => void;
  /** Fault simulation: remove all faults from every component, wire, and port. */
  clearAllFaults: () => void;

  /** Pro Mode Customizations: update custom voltage, power, cable size or threshold parameters. */
  updateComponentState: (id: string, updates: Partial<import('../domain').ComponentState>) => void;
  /** Change component variant type and reset/sync relevant component parameters. */
  updateComponentType: (id: string, newType: string) => void;
  /** Repair a blown component after overvoltage/overcurrent overload. */
  repairBlownComponent: (id: string) => void;
  /** Repair all blown components across the circuit. */
  repairAllBlownComponents: () => void;
  /** Repair all blown components and melted/busted wires across the circuit. */
  repairAllFaults: () => void;
  /** Mark a wire as melted/busted or restored. */
  setWireBusted: (id: string, isBusted: boolean, reason?: string) => void;
  /** Update editable wire metadata without exposing identity or endpoint mutation. */
  updateWireProperties: (id: string, updates: Partial<EditableWireProperties>) => void;
  /** Swap origin and destination terminals of a wire. */
  swapWireEndpoints: (id: string) => void;
  /** Reset a tripped breaker/fuse after fault is cleared. */
  resetTrippedComponent: (id: string) => void;
  /** Reset all tripped protection devices across the circuit. */
  resetAllTrippedComponents: () => void;

  // Selection (transient — excluded from undo history) ────────────────────
  selectComponent: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  toggleWireSelection: (id: string) => void;
  clearSelection: () => void;
  /** Phase 6.2.3: Shift-click — toggle a single component in/out of multi-selection. */
  toggleComponentSelection: (id: string) => void;
  /** Phase 6.2.3: set exact multi-selection (used by drag-rect commit). */
  setMultiSelection: (ids: string[]) => void;

  // Component Grouping ──────────────────────────────────────────────────────
  /** Create a group from selected components. */
  createGroup: (name: string, componentIds: string[]) => void;
  /** Ungroup a specific group, releasing its components. */
  ungroup: (groupId: string) => void;
  /** Move all components in a group by delta. */
  moveGroup: (groupId: string, dx: number, dy: number) => void;
  /** Delete a group and optionally its components. */
  deleteGroup: (groupId: string, deleteComponents: boolean) => void;
}

const historyComponentCache = new WeakMap<ComponentInstance[], ComponentInstance[]>();

/** Undo snapshots must never turn a transient held contact into saved circuit state. */
function componentsForHistory(components: ComponentInstance[]): ComponentInstance[] {
  const cached = historyComponentCache.get(components);
  if (cached) return cached;
  if (
    !components.some(
      (component) =>
        component.state.on === true && COMPONENT_DEFS[component.type]?.isMomentary === true,
    )
  ) {
    return components;
  }

  const sanitized = components.map((component) =>
    component.state.on && COMPONENT_DEFS[component.type]?.isMomentary
      ? { ...component, state: { ...component.state, on: false } }
      : component,
  );
  historyComponentCache.set(components, sanitized);
  return sanitized;
}

const seed = buildSeedCircuit();

export const useCircuitStore = create<CircuitState>()(
  temporal(
    immer<CircuitState>((set) => ({
      components: seed.components,
      wires: seed.wires,
      globalVoltage: 230,
      faults: [],
      selectedComponentId: null,
      selectedWireIds: [],
      selectedComponentIds: [],
      componentGroups: [],

      setCircuit: (circuit) =>
        set((s) => {
          s.components = circuit.components;
          s.wires = circuit.wires;
          s.faults = circuit.faults ? [...circuit.faults] : [];
          const nextVoltage = circuit.globalVoltage ?? 230;
          s.globalVoltage = Number.isFinite(nextVoltage) && nextVoltage > 0 ? nextVoltage : 230;
          s.selectedComponentId = null;
          s.selectedComponentIds = [];
          s.selectedWireIds = [];
        }),

      setGlobalSupplyVoltage: (voltage) =>
        set((s) => {
          if (!Number.isFinite(voltage) || voltage <= 0) return;
          s.globalVoltage = voltage;
          let updatedAny = false;
          for (const comp of s.components) {
            const def = COMPONENT_DEFS[comp.type];
            if (
              def?.isSource ||
              comp.type.includes('terminal') ||
              comp.type.includes('supply') ||
              comp.type.includes('battery') ||
              comp.type.includes('generator') ||
              comp.type.includes('solar')
            ) {
              comp.state.customVoltage = voltage;
              updatedAny = true;
            }
          }
          if (!updatedAny && s.components.length > 0) {
            s.components[0].state.customVoltage = voltage;
          }
        }),

      addComponent: (comp) =>
        set((s) => {
          s.components.push(comp);
        }),

      removeComponent: (id) =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          s.components = s.components.filter((c) => c.id !== id);
          const removedWireIds = new Set<string>();
          s.wires = s.wires.filter((w) => {
            if (w.fromComponentId === id || w.toComponentId === id) {
              removedWireIds.add(w.id);
              return false;
            }
            return true;
          });
          s.faults = s.faults.filter(
            (f) =>
              !(f.target.type === 'component' && f.target.id === id) &&
              !(f.target.type === 'port' && f.target.componentId === id) &&
              !(f.target.type === 'wire' && removedWireIds.has(f.target.id)),
          );
          s.selectedComponentIds = s.selectedComponentIds.filter((selectedId) => selectedId !== id);
          if (s.selectedComponentId === id) {
            s.selectedComponentId = s.selectedComponentIds[0] ?? null;
          }
        }),

      moveComponent: (id, x, y) =>
        set((s) => {
          const c = s.components.find((c) => c.id === id);
          if (c) {
            c.x = x;
            c.y = y;
          }
        }),

      toggleSwitch: (id) =>
        set((s) => {
          const c = s.components.find((c) => c.id === id);
          if (!c) return;
          const def = COMPONENT_DEFS[c.type];
          if (!def?.isSwitch || def.isMomentary) return;
          c.state.on = !c.state.on;
        }),

      setSwitchState: (id, on) =>
        set((s) => {
          const c = s.components.find((component) => component.id === id);
          if (!c || !COMPONENT_DEFS[c.type]?.isSwitch || c.state.on === on) return;
          c.state.on = on;
        }),

      addWire: (wire) =>
        set((s) => {
          s.wires.push(wire);
        }),

      applyGraphChanges: ({ addComponents = [], addWires = [], removeWireIds = [] }) =>
        set((s) => {
          const removedWireIds = new Set(removeWireIds);
          if (removedWireIds.size > 0) {
            s.wires = s.wires.filter((wire) => !removedWireIds.has(wire.id));
            s.selectedWireIds = s.selectedWireIds.filter((id) => !removedWireIds.has(id));
          }

          const componentIds = new Set(s.components.map((component) => component.id));
          for (const component of addComponents) {
            if (componentIds.has(component.id) || !COMPONENT_DEFS[component.type]) continue;
            s.components.push(component);
            componentIds.add(component.id);
          }

          const wireIds = new Set(s.wires.map((wire) => wire.id));
          for (const wire of addWires) {
            if (wireIds.has(wire.id)) continue;
            const fromComponent = s.components.find(
              (component) => component.id === wire.fromComponentId,
            );
            const toComponent = s.components.find(
              (component) => component.id === wire.toComponentId,
            );
            const fromPort = fromComponent
              ? COMPONENT_DEFS[fromComponent.type]?.ports[wire.fromPortIndex]
              : undefined;
            const toPort = toComponent
              ? COMPONENT_DEFS[toComponent.type]?.ports[wire.toPortIndex]
              : undefined;
            if (!fromPort || !toPort || fromPort.type !== toPort.type) continue;
            s.wires.push(wire);
            wireIds.add(wire.id);
          }
        }),

      removeWire: (id) =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          s.wires = s.wires.filter((w) => w.id !== id);
          s.faults = s.faults.filter((f) => !(f.target.type === 'wire' && f.target.id === id));
          s.selectedWireIds = s.selectedWireIds.filter((wid) => wid !== id);
        }),

      clearAllWires: () =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          s.wires = [];
          s.faults = s.faults.filter((f) => f.target.type !== 'wire');
          s.selectedWireIds = [];
        }),

      clearAllComponents: () =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          s.components = [];
          s.wires = [];
          s.faults = [];
          s.selectedComponentId = null;
          s.selectedWireIds = [];
          s.selectedComponentIds = [];
        }),

      setComponentPositions: (updates) =>
        set((s) => {
          for (const { id, x, y } of updates) {
            const c = s.components.find((c) => c.id === id);
            if (c) {
              c.x = x;
              c.y = y;
            }
          }
        }),

      moveComponents: (ids, dx, dy) =>
        set((s) => {
          for (const id of ids) {
            const c = s.components.find((c) => c.id === id);
            if (c) {
              c.x += dx;
              c.y += dy;
            }
          }
        }),

      removeComponents: (componentIds) =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          const ids = new Set(componentIds);
          if (ids.size === 0) return;
          s.components = s.components.filter((component) => !ids.has(component.id));
          const removedWireIds = new Set<string>();
          s.wires = s.wires.filter((wire) => {
            if (ids.has(wire.fromComponentId) || ids.has(wire.toComponentId)) {
              removedWireIds.add(wire.id);
              return false;
            }
            return true;
          });
          s.faults = s.faults.filter(
            (f) =>
              !(f.target.type === 'component' && ids.has(f.target.id)) &&
              !(f.target.type === 'port' && ids.has(f.target.componentId)) &&
              !(f.target.type === 'wire' && removedWireIds.has(f.target.id)),
          );
          const remainingWireIds = new Set(s.wires.map((wire) => wire.id));
          s.selectedWireIds = s.selectedWireIds.filter((id) => remainingWireIds.has(id));
          s.selectedComponentIds = s.selectedComponentIds.filter((id) => !ids.has(id));
          if (s.selectedComponentId && ids.has(s.selectedComponentId)) {
            s.selectedComponentId = s.selectedComponentIds[0] ?? null;
          }
        }),

      removeSelectedComponents: () =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          const ids = new Set(s.selectedComponentIds);
          if (s.selectedComponentId) ids.add(s.selectedComponentId);
          if (ids.size === 0) return;
          s.components = s.components.filter((c) => !ids.has(c.id));
          const removedWireIds = new Set<string>();
          s.wires = s.wires.filter((w) => {
            if (ids.has(w.fromComponentId) || ids.has(w.toComponentId)) {
              removedWireIds.add(w.id);
              return false;
            }
            return true;
          });
          s.faults = s.faults.filter(
            (f) =>
              !(f.target.type === 'component' && ids.has(f.target.id)) &&
              !(f.target.type === 'port' && ids.has(f.target.componentId)) &&
              !(f.target.type === 'wire' && removedWireIds.has(f.target.id)),
          );
          s.selectedComponentId = null;
          s.selectedComponentIds = [];
          s.selectedWireIds = [];
        }),

      removeSelected: () =>
        set((s) => {
          if (useUiStore.getState().simRunning) return;
          const compIds = new Set(s.selectedComponentIds);
          if (s.selectedComponentId) compIds.add(s.selectedComponentId);
          const wireIds = new Set(s.selectedWireIds);

          if (compIds.size === 0 && wireIds.size === 0) return;

          s.components = s.components.filter((c) => !compIds.has(c.id));
          const removedWireIds = new Set<string>(wireIds);
          s.wires = s.wires.filter((w) => {
            if (wireIds.has(w.id) || compIds.has(w.fromComponentId) || compIds.has(w.toComponentId)) {
              removedWireIds.add(w.id);
              return false;
            }
            return true;
          });
          s.faults = s.faults.filter(
            (f) =>
              !(f.target.type === 'component' && compIds.has(f.target.id)) &&
              !(f.target.type === 'port' && compIds.has(f.target.componentId)) &&
              !(f.target.type === 'wire' && removedWireIds.has(f.target.id)),
          );
          s.selectedComponentId = null;
          s.selectedComponentIds = [];
          s.selectedWireIds = [];
        }),

      rotateComponent: (id, deltaDegrees = 90) =>
        set((s) => {
          const comp = s.components.find((c) => c.id === id);
          if (comp) {
            comp.rotation = ((comp.rotation ?? 0) + deltaDegrees + 360) % 360;
          }
        }),

      rotateSelected: (deltaDegrees = 90) =>
        set((s) => {
          const targetIds =
            s.selectedComponentIds.length > 0
              ? s.selectedComponentIds
              : s.selectedComponentId
                ? [s.selectedComponentId]
                : [];
          for (const id of targetIds) {
            const comp = s.components.find((c) => c.id === id);
            if (comp) {
              comp.rotation = ((comp.rotation ?? 0) + deltaDegrees + 360) % 360;
            }
          }
        }),

      autoLabelAllComponents: () =>
        set((s) => {
          const prefixCounts: Record<string, number> = {};
          const getPrefix = (type: string): string => {
            if (type.includes('switch') || type.includes('button')) return 'S';
            if (
              type.includes('bulb') ||
              type.includes('light') ||
              type.includes('lamp') ||
              type.includes('led') ||
              type.includes('cfl') ||
              type.includes('halogen')
            )
              return 'L';
            if (
              type.includes('mcb') ||
              type.includes('breaker') ||
              type.includes('fuse') ||
              type.includes('rcbo') ||
              type.includes('rcd')
            )
              return 'CB';
            if (type.includes('socket')) return 'SK';
            if (type.includes('motor') || type.includes('fan')) return 'M';
            if (type.includes('battery') || type.includes('source') || type.includes('terminal'))
              return 'PWR';
            if (type.includes('junction') || type.includes('wago') || type.includes('strip'))
              return 'J';
            if (type.includes('meter') || type.includes('gauge')) return 'MTR';
            return 'U';
          };

          for (const comp of s.components) {
            const prefix = getPrefix(comp.type);
            prefixCounts[prefix] = (prefixCounts[prefix] ?? 0) + 1;
            comp.state.autoLabel = `${prefix}${prefixCounts[prefix]}`;
          }
        }),

      // Reroute returns false when validation fails (unknown wire, unknown
      // component/port, or a port-type mismatch). The store only mutates on
      // success so the UI can keep the in-progress drag visually intact and
      // surface a log entry from the caller.
      rerouteWire: (id, end, target) => {
        let ok = false;
        set((s) => {
          const wire = s.wires.find((w) => w.id === id);
          if (!wire) return;
          const otherEnd = end === 'from' ? wire.toComponentId : wire.fromComponentId;
          const otherPortIdx = end === 'from' ? wire.toPortIndex : wire.fromPortIndex;
          if (target.componentId === otherEnd && target.portIndex === otherPortIdx) {
            return; // would create a zero-length wire
          }
          if (target.componentId === otherEnd) {
            return; // self-loop; both ends on the same component
          }
          const targetComp = s.components.find((c) => c.id === target.componentId);
          if (!targetComp) return;
          const targetDef = COMPONENT_DEFS[targetComp.type];
          const targetPort = targetDef?.ports[target.portIndex];
          const otherComp = s.components.find((c) => c.id === otherEnd);
          const otherDef = otherComp ? COMPONENT_DEFS[otherComp.type] : undefined;
          const otherPort = otherDef?.ports[otherPortIdx];
          if (!targetPort || !otherPort) return;
          if (targetPort.type !== otherPort.type) return;

          if (end === 'from') {
            wire.fromComponentId = target.componentId;
            wire.fromPortIndex = target.portIndex;
          } else {
            wire.toComponentId = target.componentId;
            wire.toPortIndex = target.portIndex;
          }
          // Clear any stale control points; reroute invalidates the curve.
          wire.controlPoints = [];
          ok = true;
        });
        return ok;
      },

      selectComponent: (id) =>
        set((s) => {
          s.selectedComponentId = id;
          s.selectedComponentIds = id ? [id] : [];
          s.selectedWireIds = [];
        }),

      selectWire: (id) =>
        set((s) => {
          s.selectedWireIds = id ? [id] : [];
          s.selectedComponentId = null;
          s.selectedComponentIds = [];
        }),

      toggleWireSelection: (id) =>
        set((s) => {
          const i = s.selectedWireIds.indexOf(id);
          if (i >= 0) s.selectedWireIds.splice(i, 1);
          else s.selectedWireIds.push(id);
          s.selectedComponentId = null;
          s.selectedComponentIds = [];
        }),

      clearSelection: () =>
        set((s) => {
          s.selectedComponentId = null;
          s.selectedComponentIds = [];
          s.selectedWireIds = [];
        }),

      toggleComponentSelection: (id) =>
        set((s) => {
          const i = s.selectedComponentIds.indexOf(id);
          if (i >= 0) {
            s.selectedComponentIds.splice(i, 1);
            if (s.selectedComponentId === id) {
              s.selectedComponentId = s.selectedComponentIds[0] ?? null;
            }
          } else {
            s.selectedComponentIds.push(id);
            s.selectedComponentId = id; // last clicked = primary
          }
          s.selectedWireIds = [];
        }),

      setMultiSelection: (ids) =>
        set((s) => {
          s.selectedComponentIds = ids;
          s.selectedComponentId = ids[ids.length - 1] ?? null;
          s.selectedWireIds = [];
        }),

      injectFault: (faultOrParams) => {
        let faultId = '';
        set((s) => {
          const fault =
            'category' in faultOrParams
              ? faultOrParams
              : createInjectedFault(
                  faultOrParams.type,
                  faultOrParams.target,
                  faultOrParams.parameters,
                );

          // Check coexistence
          const validation = validateFaultCoexistence(s.faults, fault);
          if (!validation.valid) {
            console.warn(`Cannot inject fault: ${validation.reason}`);
            return;
          }
          s.faults.push(fault);
          faultId = fault.id;

          // Sync legacy properties for backwards compatibility.
          // NOTE: TypeScript does not preserve property-access narrowing
          // inside `.find` closures — hoist the narrowed id into a local.
          if (fault.target.type === 'component') {
            const targetId = fault.target.id;
            const c = s.components.find((comp) => comp.id === targetId);
            if (c && !c.state.fault) c.state.fault = fault.type;
          } else if (fault.target.type === 'wire') {
            const targetId = fault.target.id;
            const w = s.wires.find((wire) => wire.id === targetId);
            if (w && !w.fault && isWireFaultType(fault.type)) {
              w.fault = fault.type;
            }
          }
          useUiStore.getState().setSimRunning(false);
        });
        return faultId;
      },

      removeFault: (faultId) =>
        set((s) => {
          const faultToRemove = s.faults.find((f) => f.id === faultId);
          s.faults = s.faults.filter((f) => f.id !== faultId);
          if (faultToRemove) {
            const target = faultToRemove.target;
            if (target.type === 'component') {
              const targetId = target.id;
              const c = s.components.find((comp) => comp.id === targetId);
              if (c && c.state.fault === faultToRemove.type) {
                c.state.fault = undefined;
              }
            } else if (target.type === 'wire') {
              const targetId = target.id;
              const w = s.wires.find((wire) => wire.id === targetId);
              if (w && w.fault === faultToRemove.type) {
                w.fault = undefined;
              }
            }
          }
        }),

      toggleFault: (type, target) =>
        set((s) => {
          const existingIndex = s.faults.findIndex(
            (f) =>
              f.type === type &&
              f.target.type === target.type &&
              ((f.target.type === 'component' &&
                target.type === 'component' &&
                f.target.id === target.id) ||
                (f.target.type === 'wire' &&
                  target.type === 'wire' &&
                  f.target.id === target.id) ||
                (f.target.type === 'port' &&
                  target.type === 'port' &&
                  f.target.componentId === target.componentId &&
                  f.target.portIndex === target.portIndex)),
          );

          if (existingIndex >= 0) {
            const removed = s.faults[existingIndex];
            s.faults.splice(existingIndex, 1);
            const removedTarget = removed.target;
            if (removedTarget.type === 'component') {
              const targetId = removedTarget.id;
              const c = s.components.find((comp) => comp.id === targetId);
              if (c && c.state.fault === removed.type) c.state.fault = undefined;
            } else if (removedTarget.type === 'wire') {
              const targetId = removedTarget.id;
              const w = s.wires.find((wire) => wire.id === targetId);
              if (w && w.fault === removed.type) w.fault = undefined;
            }
          } else {
            const fault = createInjectedFault(type, target);
            const validation = validateFaultCoexistence(s.faults, fault);
            if (validation.valid) {
              s.faults.push(fault);
              if (target.type === 'component') {
                const targetId = target.id;
                const c = s.components.find((comp) => comp.id === targetId);
                if (c) c.state.fault = type;
              } else if (target.type === 'wire') {
                const targetId = target.id;
                const w = s.wires.find((wire) => wire.id === targetId);
                if (w && isWireFaultType(type)) {
                  w.fault = type;
                }
              }
              useUiStore.getState().setSimRunning(false);
            }
          }
        }),

      setComponentFault: (id, fault) =>
        set((s) => {
          const c = s.components.find((c) => c.id === id);
          if (c) {
            c.state.fault = fault;
            s.faults = s.faults.filter(
              (f) => !(f.target.type === 'component' && f.target.id === id),
            );
            if (fault) {
              s.faults.push(createInjectedFault(fault, { type: 'component', id }));
              useUiStore.getState().setSimRunning(false);
            }
          }
        }),

      setWireFault: (id, fault) =>
        set((s) => {
          const w = s.wires.find((w) => w.id === id);
          if (w) {
            w.fault = fault;
            s.faults = s.faults.filter((f) => !(f.target.type === 'wire' && f.target.id === id));
            if (fault) {
              s.faults.push(createInjectedFault(fault, { type: 'wire', id }));
              useUiStore.getState().setSimRunning(false);
            }
          }
        }),

      clearAllFaults: () =>
        set((s) => {
          s.faults = [];
          for (const c of s.components) c.state.fault = undefined;
          for (const w of s.wires) w.fault = undefined;
        }),

      updateComponentState: (id, updates) =>
        set((s) => {
          const c = s.components.find((comp) => comp.id === id);
          if (c) {
            c.state = { ...c.state, ...updates };
          }
        }),

      updateComponentType: (id, newType) =>
        set((s) => {
          const c = s.components.find((comp) => comp.id === id);
          if (c && COMPONENT_DEFS[newType]) {
            c.type = newType;
            const newDef = COMPONENT_DEFS[newType];
            // Synchronize/reset state according to the new variant's specifications
            c.state = {
              ...c.state,
              customPowerWatts: newDef.powerWatts,
              customMaxAmps: newDef.maxAmps,
              customCableMm2: newDef.recommendedCableMm2,
              isBlown: false,
              blownReason: undefined,
            };
          }
        }),

      repairBlownComponent: (id) =>
        set((s) => {
          const c = s.components.find((comp) => comp.id === id);
          if (c) {
            c.state.isBlown = false;
            c.state.blownReason = undefined;
          }
        }),

      repairAllBlownComponents: () =>
        set((s) => {
          for (const c of s.components) {
            c.state.isBlown = false;
            c.state.blownReason = undefined;
          }
        }),

      repairAllFaults: () =>
        set((s) => {
          for (const c of s.components) {
            c.state.isBlown = false;
            c.state.blownReason = undefined;
          }
          for (const w of s.wires) {
            w.isBusted = false;
            w.bustedReason = undefined;
            if (w.fault === 'open-circuit') w.fault = undefined;
          }
        }),

      setWireBusted: (id, isBusted, reason) =>
        set((s) => {
          const w = s.wires.find((item) => item.id === id);
          if (w) {
            w.isBusted = isBusted;
            w.bustedReason = reason;
          }
        }),

      updateWireProperties: (id, updates) =>
        set((s) => {
          const w = s.wires.find((item) => item.id === id);
          if (!w) return;

          if ('controlPoints' in updates && Array.isArray(updates.controlPoints)) {
            const validPoints = updates.controlPoints.filter(
              (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
            );
            if (validPoints.length === updates.controlPoints.length) {
              w.controlPoints = validPoints.map((point) => ({ ...point }));
            }
          }
          if (updates.pathKind === 'bezier' || updates.pathKind === 'orthogonal') {
            w.pathKind = updates.pathKind;
          }
          if (
            'lengthMeters' in updates &&
            (updates.lengthMeters === undefined ||
              (Number.isFinite(updates.lengthMeters) && updates.lengthMeters > 0))
          ) {
            w.lengthMeters = updates.lengthMeters;
          }
          if (
            'deratingFactor' in updates &&
            (updates.deratingFactor === undefined ||
              (Number.isFinite(updates.deratingFactor) &&
                updates.deratingFactor >= 0.1 &&
                updates.deratingFactor <= 1))
          ) {
            w.deratingFactor = updates.deratingFactor;
          }
          if (
            'customCableMm2' in updates &&
            (updates.customCableMm2 === undefined ||
              (Number.isFinite(updates.customCableMm2) && updates.customCableMm2 > 0))
          ) {
            w.customCableMm2 = updates.customCableMm2;
          }
          if (updates.material === 'copper' || updates.material === 'aluminum') {
            w.material = updates.material;
          }
          if (
            'gauge' in updates &&
            (updates.gauge === undefined || (Number.isFinite(updates.gauge) && updates.gauge > 0))
          ) {
            w.gauge = updates.gauge;
          }
        }),

      swapWireEndpoints: (id) =>
        set((s) => {
          const w = s.wires.find((item) => item.id === id);
          if (w) {
            const tempComp = w.fromComponentId;
            const tempPort = w.fromPortIndex;
            w.fromComponentId = w.toComponentId;
            w.fromPortIndex = w.toPortIndex;
            w.toComponentId = tempComp;
            w.toPortIndex = tempPort;
            if (w.controlPoints && w.controlPoints.length > 0) {
              w.controlPoints = [...w.controlPoints].reverse();
            }
          }
        }),

      resetTrippedComponent: (id) =>
        set((s) => {
          const c = s.components.find((comp) => comp.id === id);
          if (c) {
            c.state.isTripped = false;
            c.state.tripReason = undefined;
          }
        }),

      resetAllTrippedComponents: () =>
        set((s) => {
          for (const c of s.components) {
            c.state.isTripped = false;
            c.state.tripReason = undefined;
          }
        }),

      pasteComponents: (items, offset) =>
        set((s) => {
          const newIds: string[] = [];
          for (const src of items) {
            const newId = `${src.type.split('-')[0]}-paste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            s.components.push({
              ...src,
              id: newId,
              x: src.x + offset.x,
              y: src.y + offset.y,
              state: COMPONENT_DEFS[src.type]?.isMomentary
                ? { ...src.state, on: false }
                : { ...src.state },
            });
            newIds.push(newId);
          }
          // Select pasted group so the user can immediately drag/delete them.
          s.selectedComponentIds = newIds;
          s.selectedComponentId = newIds[newIds.length - 1] ?? null;
          s.selectedWireIds = [];
        }),

      // Component Grouping Implementation
      createGroup: (name, componentIds) =>
        set((s) => {
          if (componentIds.length === 0) return;
          const components = s.components.filter((c) => componentIds.includes(c.id));
          if (components.length === 0) return;

          const avgX = components.reduce((sum, c) => sum + c.x, 0) / components.length;
          const avgY = components.reduce((sum, c) => sum + c.y, 0) / components.length;

          const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          s.componentGroups.push({
            id: groupId,
            name: name || `Group ${s.componentGroups.length + 1}`,
            componentIds: [...componentIds],
            position: { x: avgX, y: avgY },
          });
        }),

      ungroup: (groupId) =>
        set((s) => {
          const index = s.componentGroups.findIndex((g) => g.id === groupId);
          if (index >= 0) {
            s.componentGroups.splice(index, 1);
          }
        }),

      moveGroup: (groupId, dx, dy) =>
        set((s) => {
          const group = s.componentGroups.find((g) => g.id === groupId);
          if (!group) return;

          group.position.x += dx;
          group.position.y += dy;

          for (const compId of group.componentIds) {
            const comp = s.components.find((c) => c.id === compId);
            if (comp) {
              comp.x += dx;
              comp.y += dy;
            }
          }
        }),

      deleteGroup: (groupId, deleteComponents) =>
        set((s) => {
          const groupIndex = s.componentGroups.findIndex((g) => g.id === groupId);
          if (groupIndex < 0) return;

          const group = s.componentGroups[groupIndex];
          s.componentGroups.splice(groupIndex, 1);

          if (deleteComponents) {
            const idsToDelete = new Set(group.componentIds);
            s.components = s.components.filter((c) => !idsToDelete.has(c.id));
            s.wires = s.wires.filter(
              (w) => !idsToDelete.has(w.fromComponentId) && !idsToDelete.has(w.toComponentId),
            );
            s.selectedComponentIds = s.selectedComponentIds.filter((id) => !idsToDelete.has(id));
            s.selectedComponentId =
              s.selectedComponentId && idsToDelete.has(s.selectedComponentId)
                ? (s.selectedComponentIds[0] ?? null)
                : s.selectedComponentId;
          }
        }),
    })),
    {
      // Only the *graph* is undoable. Selection clicks are not.
      partialize: (state) => ({
        components: componentsForHistory(state.components),
        wires: state.wires,
        globalVoltage: state.globalVoltage,
      }),
      // Immer preserves array identity when no element changed, so a simple
      // reference equality on the tracked slices is enough to skip the entry
      // — selection-only updates won't grow the history.
      equality: (a, b) =>
        a.components === b.components && a.wires === b.wires && a.globalVoltage === b.globalVoltage,
      limit: 100,
    },
  ),
);

// ── Imperative undo/redo helpers (wired to toolbar buttons) ────────────────
function reconcileSelection(): void {
  const state = useCircuitStore.getState();
  const componentIds = new Set(state.components.map((component) => component.id));
  const wireIds = new Set(state.wires.map((wire) => wire.id));
  const selectedComponentIds = state.selectedComponentIds.filter((id) => componentIds.has(id));
  const selectedComponentId =
    state.selectedComponentId && componentIds.has(state.selectedComponentId)
      ? state.selectedComponentId
      : (selectedComponentIds[0] ?? null);
  const selectedWireIds = state.selectedWireIds.filter((id) => wireIds.has(id));

  if (
    selectedComponentId !== state.selectedComponentId ||
    selectedComponentIds.length !== state.selectedComponentIds.length ||
    selectedWireIds.length !== state.selectedWireIds.length
  ) {
    useCircuitStore.setState({ selectedComponentId, selectedComponentIds, selectedWireIds });
  }
}

export const undo = () => {
  useCircuitStore.temporal.getState().undo();
  reconcileSelection();
};
export const redo = () => {
  useCircuitStore.temporal.getState().redo();
  reconcileSelection();
};
export const clearHistory = () => useCircuitStore.temporal.getState().clear();

/**
 * Momentary contacts are live interaction state, not an edit to the circuit.
 * Keep press/release out of undo history while still publishing the component
 * update to the renderer and simulation worker.
 */
export function setMomentarySwitchState(id: string, on: boolean): boolean {
  const component = useCircuitStore.getState().components.find((item) => item.id === id);
  if (!component || !COMPONENT_DEFS[component.type]?.isMomentary) return false;
  if (component.state.on === on) return true;

  const temporal = useCircuitStore.temporal.getState();
  const shouldResume = temporal.isTracking;
  if (shouldResume) temporal.pause();
  try {
    useCircuitStore.getState().setSwitchState(id, on);
  } finally {
    if (shouldResume) temporal.resume();
  }
  return true;
}

/** Release any contacts left down by an interrupted pointer or keyboard gesture. */
export function releaseMomentarySwitches(): void {
  for (const component of useCircuitStore.getState().components) {
    if (component.state.on && COMPONENT_DEFS[component.type]?.isMomentary) {
      setMomentarySwitchState(component.id, false);
    }
  }
}

// ── Convenient derived selector: the full Circuit shape ───────────────────
export const selectCircuit = (s: CircuitState): Circuit => ({
  components: s.components,
  wires: s.wires,
  globalVoltage: s.globalVoltage,
  faults: s.faults,
});
