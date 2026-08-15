/**
 * Inspector — right-hand floating panel showing selected component/wire
 * properties, topology connections, simulation telemetry, waveforms, safety validation, and logs.
 */

import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Flame,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Loader2,
  Lock,
  MousePointerClick,
  OctagonAlert,
  RotateCcw,
  RotateCw,
  Route,
  Scissors,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Tag,
  Terminal,
  Thermometer,
  Trash2,
  Unlock,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  COMPONENT_DEFS,
  type ComponentInstance,
  type SimulationResult,
  type ValidationReport,
  type WireInstance,
  getComponentHelp,
} from '../../domain';
import { setMomentarySwitchState, useCircuitStore, useUiStore } from '../../store';
import { useSettingsStore } from '../../store/settingsStore';
import {
  requestDeleteComponent,
  requestDeleteSelection,
  requestDeleteWire,
} from '../canvas-actions';
import { PillField } from './PillField';
import { ValidationDetailsModal } from './ValidationDetailsModal';
import { ValidationReportView } from './ValidationReportView';
import { getComponentImage } from './componentImages';
import { AnimatedNumber } from './AnimatedNumber';
import { ComponentVoltageSparkline } from './ComponentVoltageSparkline';

/** Map of component types to their valid variant family members */
const VALID_VARIANT_FAMILIES: Record<string, string[]> = {
  // Lighting
  bulb: [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],
  'bulb-incandescent': [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],
  'bulb-halogen': [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],
  'bulb-cfl': [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],
  'bulb-smart-rgb': [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],
  'led-downlight': [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],
  'tube-light': [
    'bulb',
    'bulb-incandescent',
    'bulb-halogen',
    'bulb-cfl',
    'bulb-smart-rgb',
    'led-downlight',
    'tube-light',
  ],

  // Protection Breakers & Isolators
  mcb: ['mcb', 'mcb-type-c', 'mcb-type-d', 'mccb', 'rcd', 'rcbo', 'fuse', 'spd', 'isolator-switch'],
  'mcb-type-c': [
    'mcb',
    'mcb-type-c',
    'mcb-type-d',
    'mccb',
    'rcd',
    'rcbo',
    'fuse',
    'spd',
    'isolator-switch',
  ],
  'mcb-type-d': [
    'mcb',
    'mcb-type-c',
    'mcb-type-d',
    'mccb',
    'rcd',
    'rcbo',
    'fuse',
    'spd',
    'isolator-switch',
  ],
  mccb: [
    'mcb',
    'mcb-type-c',
    'mcb-type-d',
    'mccb',
    'rcd',
    'rcbo',
    'fuse',
    'spd',
    'isolator-switch',
  ],
  rcd: ['mcb', 'mcb-type-c', 'mcb-type-d', 'mccb', 'rcd', 'rcbo', 'fuse', 'spd', 'isolator-switch'],
  rcbo: [
    'mcb',
    'mcb-type-c',
    'mcb-type-d',
    'mccb',
    'rcd',
    'rcbo',
    'fuse',
    'spd',
    'isolator-switch',
  ],
  fuse: [
    'mcb',
    'mcb-type-c',
    'mcb-type-d',
    'mccb',
    'rcd',
    'rcbo',
    'fuse',
    'spd',
    'isolator-switch',
  ],
  spd: ['mcb', 'mcb-type-c', 'mcb-type-d', 'mccb', 'rcd', 'rcbo', 'fuse', 'spd', 'isolator-switch'],
  'isolator-switch': [
    'mcb',
    'mcb-type-c',
    'mcb-type-d',
    'mccb',
    'rcd',
    'rcbo',
    'fuse',
    'spd',
    'isolator-switch',
  ],

  // Outlets
  'socket-2pin': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],
  'socket-3pin': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],
  'double-socket': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],
  'switched-socket': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],
  'socket-usb': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],
  'socket-gfci': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],
  'socket-industrial': [
    'socket-2pin',
    'socket-3pin',
    'double-socket',
    'switched-socket',
    'socket-usb',
    'socket-gfci',
    'socket-industrial',
  ],

  // Switches
  'single-way-switch': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'two-way-switch': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'intermediate-switch': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'double-pole-switch': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'double-gang-switch': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'push-button': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'rotary-selector-switch': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'cooker-unit': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],
  'fused-spur': [
    'single-way-switch',
    'two-way-switch',
    'intermediate-switch',
    'double-pole-switch',
    'double-gang-switch',
    'push-button',
    'rotary-selector-switch',
    'cooker-unit',
    'fused-spur',
  ],

  // Transformers
  'transformer-8v': [
    'transformer-8v',
    'transformer-12v',
    'transformer-24v',
    'step-up-down-transformer',
  ],
  'transformer-12v': [
    'transformer-8v',
    'transformer-12v',
    'transformer-24v',
    'step-up-down-transformer',
  ],
  'transformer-24v': [
    'transformer-8v',
    'transformer-12v',
    'transformer-24v',
    'step-up-down-transformer',
  ],
  'step-up-down-transformer': [
    'transformer-8v',
    'transformer-12v',
    'transformer-24v',
    'step-up-down-transformer',
  ],

  // Relays
  'relay-spst': ['relay-spst', 'relay-spdt', 'relay-dpdt', 'control-relay', 'smart-relay'],
  'relay-spdt': ['relay-spst', 'relay-spdt', 'relay-dpdt', 'control-relay', 'smart-relay'],
  'relay-dpdt': ['relay-spst', 'relay-spdt', 'relay-dpdt', 'control-relay', 'smart-relay'],
  'control-relay': ['relay-spst', 'relay-spdt', 'relay-dpdt', 'control-relay', 'smart-relay'],
  'smart-relay': ['relay-spst', 'relay-spdt', 'relay-dpdt', 'control-relay', 'smart-relay'],

  // Contactors
  contactor: ['contactor-1p', 'contactor-2p', 'contactor-3p', 'contactor-4p'],
  'contactor-1p': ['contactor-1p', 'contactor-2p', 'contactor-3p', 'contactor-4p'],
  'contactor-2p': ['contactor-1p', 'contactor-2p', 'contactor-3p', 'contactor-4p'],
  'contactor-3p': ['contactor-1p', 'contactor-2p', 'contactor-3p', 'contactor-4p'],
  'contactor-4p': ['contactor-1p', 'contactor-2p', 'contactor-3p', 'contactor-4p'],

  // Fans
  'ceiling-fan': ['ceiling-fan', 'extractor-fan', 'industrial-exhaust-fan', 'table-fan'],
  'extractor-fan': ['ceiling-fan', 'extractor-fan', 'industrial-exhaust-fan', 'table-fan'],
  'industrial-exhaust-fan': ['ceiling-fan', 'extractor-fan', 'industrial-exhaust-fan', 'table-fan'],
  'table-fan': ['ceiling-fan', 'extractor-fan', 'industrial-exhaust-fan', 'table-fan'],

  // Timers
  'timer-switch': [
    'timer-switch',
    'digital-weekly-timer',
    'staircase-timer',
    'countdown-timer',
    'delay-timer',
  ],
  'digital-weekly-timer': [
    'timer-switch',
    'digital-weekly-timer',
    'staircase-timer',
    'countdown-timer',
    'delay-timer',
  ],
  'staircase-timer': [
    'timer-switch',
    'digital-weekly-timer',
    'staircase-timer',
    'countdown-timer',
    'delay-timer',
  ],
  'countdown-timer': [
    'timer-switch',
    'digital-weekly-timer',
    'staircase-timer',
    'countdown-timer',
    'delay-timer',
  ],
  'delay-timer': [
    'timer-switch',
    'digital-weekly-timer',
    'staircase-timer',
    'countdown-timer',
    'delay-timer',
  ],

  // Thermostats
  thermostat: ['thermostat', 'room-thermostat', 'heating-thermostat'],
  'room-thermostat': ['thermostat', 'room-thermostat', 'heating-thermostat'],
  'heating-thermostat': ['thermostat', 'room-thermostat', 'heating-thermostat'],

  // Sensors
  'pir-sensor': ['pir-sensor', 'photocell-sensor', 'temperature-sensor', 'door-sensor'],
  'photocell-sensor': ['pir-sensor', 'photocell-sensor', 'temperature-sensor', 'door-sensor'],
  'temperature-sensor': ['pir-sensor', 'photocell-sensor', 'temperature-sensor', 'door-sensor'],
  'door-sensor': ['pir-sensor', 'photocell-sensor', 'temperature-sensor', 'door-sensor'],

  // Sounders
  bell: ['bell', 'electric-buzzer', 'wireless-doorbell', 'alarm-siren'],
  'electric-buzzer': ['bell', 'electric-buzzer', 'wireless-doorbell', 'alarm-siren'],
  'wireless-doorbell': ['bell', 'electric-buzzer', 'wireless-doorbell', 'alarm-siren'],
  'alarm-siren': ['bell', 'electric-buzzer', 'wireless-doorbell', 'alarm-siren'],

  // Motors
  motor: ['motor', 'motor-3phase', 'water-pump'],
  'motor-3phase': ['motor', 'motor-3phase', 'water-pump'],
  'water-pump': ['motor', 'motor-3phase', 'water-pump'],

  // Heaters
  'space-heater': ['space-heater', 'water-heater', 'heating-element'],
  'water-heater': ['space-heater', 'water-heater', 'heating-element'],
  'heating-element': ['space-heater', 'water-heater', 'heating-element'],

  // Distribution Boards
  'distribution-board': ['distribution-board', 'distribution-box', 'distribution-board-3phase'],
  'distribution-box': ['distribution-board', 'distribution-box', 'distribution-board-3phase'],
  'distribution-board-3phase': [
    'distribution-board',
    'distribution-box',
    'distribution-board-3phase',
  ],
};

interface Props {
  selectedComp: ComponentInstance | null;
  selectedWire?: WireInstance | null;
  simResult: SimulationResult | null;
  isPhone: boolean;
  dashboardOpen?: boolean;
}

export function useInspectorSelectionState({
  selectedComp,
  selectedWire,
}: {
  selectedComp: ComponentInstance | null;
  selectedWire?: WireInstance | null;
}) {
  const selectedComponentIds = useCircuitStore((s) => s.selectedComponentIds);
  const selectedWireIds = useCircuitStore((s) => s.selectedWireIds);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const components = useCircuitStore((s) => s.components);
  const wires = useCircuitStore((s) => s.wires);
  const validationReport = useUiStore((s) => s.validationReport);

  // 1. Multi-component selection
  if (selectedComponentIds.length > 1) {
    return {
      kind: 'multi-component' as const,
      count: selectedComponentIds.length,
      componentIds: selectedComponentIds,
    };
  }

  // 2. Single Component
  const singleCompId =
    selectedId ?? (selectedComponentIds.length === 1 ? selectedComponentIds[0] : null);
  const activeComp =
    selectedComp ?? (singleCompId ? (components.find((c) => c.id === singleCompId) ?? null) : null);

  if (activeComp) {
    return {
      kind: 'component' as const,
      component: activeComp,
    };
  }

  // 3. Single Wire
  const activeWire =
    selectedWire ??
    (selectedWireIds.length === 1
      ? (wires.find((w) => w.id === selectedWireIds[0]) ?? null)
      : null);

  if (activeWire) {
    return {
      kind: 'wire' as const,
      wire: activeWire,
    };
  }

  // 4. Default empty selection
  return {
    kind: 'empty' as const,
    validationReport,
  };
}

/* =========================================================================
   INSPECTOR MAIN COMPONENT (Vertical Tab Sidebar Drawer)
   ========================================================================= */

export function Inspector({
  selectedComp: initialSelectedComp,
  selectedWire: initialSelectedWire,
  simResult,
  isPhone,
}: Props) {
  const selectionState = useInspectorSelectionState({
    selectedComp: initialSelectedComp,
    selectedWire: initialSelectedWire,
  });

  const activeInspectorTab = useUiStore((s) => s.activeInspectorTab);
  const setActiveInspectorTab = useUiStore((s) => s.setActiveInspectorTab);

  const validationReport = useUiStore((s) => s.validationReport);
  const runCircuitValidation = useUiStore((s) => s.runCircuitValidation);

  const isCollapsed = useUiStore((s) => s.inspectorCollapsed);
  const setIsCollapsed = (c: boolean) => useUiStore.getState().setInspectorCollapsed(c);

  if (isPhone) return null;

  // Collapsed State View
  if (isCollapsed) {
    return (
      <aside
        className="fixed right-0 top-0 bottom-0 z-20 flex h-screen w-12 flex-col items-center justify-between border-l border-slate-200/80 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 select-none"
        title="Inspector (Collapsed)"
      >
        <div className="flex flex-col items-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs hover:bg-blue-100 dark:bg-blue-950/80 dark:text-blue-400 dark:hover:bg-blue-900 transition"
            title="Expand Inspector Panel"
            aria-label="Expand Inspector Panel"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex flex-col items-center gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setActiveInspectorTab('properties');
              }}
              className={`p-2 rounded-xl transition ${
                activeInspectorTab === 'properties'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Properties & Settings"
            >
              <Sliders className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setActiveInspectorTab('connections');
              }}
              className={`p-2 rounded-xl transition ${
                activeInspectorTab === 'connections'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Connections & Topology"
            >
              <Route className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setActiveInspectorTab('simulation');
              }}
              className={`p-2 rounded-xl transition ${
                activeInspectorTab === 'simulation'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Simulation Telemetry & Faults"
            >
              <Zap className="size-4" />
            </button>

            <div className="my-1 h-px w-6 bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setActiveInspectorTab('analytics');
              }}
              className={`p-2 rounded-xl transition ${
                activeInspectorTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Waveform Scope"
            >
              <Sparkles className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setActiveInspectorTab('validation');
              }}
              className={`p-2 rounded-xl transition relative ${
                activeInspectorTab === 'validation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Circuit Safety & Validation"
            >
              <ShieldCheck className="size-4" />
              {(validationReport?.summary.errorsCount ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {validationReport?.summary.errorsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setActiveInspectorTab('logs');
              }}
              className={`p-2 rounded-xl transition ${
                activeInspectorTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Console Logs & CLI"
            >
              <Terminal className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Expanded Inspector Layout with Vertical Navigation Tab Bar on Right
  return (
    <aside className="fixed right-0 top-0 bottom-0 z-20 flex h-screen shadow-2xl border-l border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
      {/* Main Drawer Body Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-64 md:w-72 lg:w-80">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 select-none dark:border-slate-800 dark:bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {selectionState.kind === 'wire' ? (
              <Route className="size-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            ) : selectionState.kind === 'component' ? (
              <Sliders className="size-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
            ) : (
              <Layers className="size-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            )}
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {activeInspectorTab.toUpperCase()} PANEL
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {selectionState.kind === 'wire'
                  ? `Wire #${selectionState.wire.id.slice(0, 8)}`
                  : selectionState.kind === 'component'
                    ? (COMPONENT_DEFS[selectionState.component.type]?.label ??
                      selectionState.component.type)
                    : selectionState.kind === 'multi-component'
                      ? `${selectionState.count} Items Selected`
                      : 'Circuit Canvas'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Collapse Inspector"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Dynamic Tab Body View */}
        <div className="flex-1 overflow-y-auto">
          {activeInspectorTab === 'properties' && (
            <InspectorPropertiesContent
              selectionState={selectionState}
              simResult={simResult}
              setIsCollapsed={setIsCollapsed}
              runCircuitValidation={runCircuitValidation}
            />
          )}

          {activeInspectorTab === 'connections' && (
            <InspectorConnectionsContent selectionState={selectionState} />
          )}

          {activeInspectorTab === 'simulation' && (
            <InspectorSimulationContent selectionState={selectionState} simResult={simResult} />
          )}

          {activeInspectorTab === 'analytics' && <InspectorAnalyticsView simResult={simResult} />}

          {activeInspectorTab === 'validation' && (
            <div className="h-full overflow-y-auto">
              {validationReport ? (
                <ValidationReportView
                  report={validationReport}
                  onRunValidation={runCircuitValidation}
                />
              ) : (
                <div className="p-5 text-center flex flex-col items-center justify-center h-full">
                  <ShieldCheck className="size-10 text-emerald-500 mb-2" />
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                    Circuit Safety Check
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Run automated safety and code compliance checks.
                  </p>
                  <button
                    type="button"
                    onClick={runCircuitValidation}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-xs"
                  >
                    Run Validation Check
                  </button>
                </div>
              )}
            </div>
          )}

          {activeInspectorTab === 'logs' && <InspectorLogsView />}
        </div>
      </div>

      {/* Vertical Navigation Tab Bar (Right side edge) */}
      <div className="w-12 border-l border-slate-200/80 bg-slate-50/90 py-3 flex flex-col items-center justify-between dark:border-slate-800 dark:bg-slate-950/80 flex-shrink-0 select-none">
        <div className="flex flex-col items-center gap-2">
          {/* Properties Tab */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab('properties')}
            className={`p-2 rounded-xl transition relative ${
              activeInspectorTab === 'properties'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Properties & Specs"
          >
            <Sliders className="size-4" />
            {activeInspectorTab === 'properties' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-600 rounded-r" />
            )}
          </button>

          {/* Connections Tab */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab('connections')}
            className={`p-2 rounded-xl transition relative ${
              activeInspectorTab === 'connections'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Connections & Topology"
          >
            <Route className="size-4" />
            {activeInspectorTab === 'connections' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-600 rounded-r" />
            )}
          </button>

          {/* Simulation Tab */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab('simulation')}
            className={`p-2 rounded-xl transition relative ${
              activeInspectorTab === 'simulation'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Simulation Telemetry & Faults"
          >
            <Zap className="size-4" />
            {activeInspectorTab === 'simulation' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-amber-500 rounded-r" />
            )}
          </button>

          <div className="my-1.5 h-px w-6 bg-slate-200 dark:bg-slate-800" />

          {/* Scope Tab */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab('analytics')}
            className={`p-2 rounded-xl transition relative ${
              activeInspectorTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Waveform Oscilloscope"
          >
            <Sparkles className="size-4" />
            {activeInspectorTab === 'analytics' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-purple-600 rounded-r" />
            )}
          </button>

          {/* Validation Tab */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab('validation')}
            className={`p-2 rounded-xl transition relative ${
              activeInspectorTab === 'validation'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Circuit Safety & Compliance"
          >
            <ShieldCheck className="size-4" />
            {activeInspectorTab === 'validation' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-emerald-600 rounded-r" />
            )}
            {(validationReport?.summary.errorsCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                {validationReport?.summary.errorsCount}
              </span>
            )}
          </button>

          {/* Console Tab */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab('logs')}
            className={`p-2 rounded-xl transition relative ${
              activeInspectorTab === 'logs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Console Logs & CLI"
          >
            <Terminal className="size-4" />
            {activeInspectorTab === 'logs' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-600 rounded-r" />
            )}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          title="Collapse Inspector"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </aside>
  );
}

/* =========================================================================
   PROPERTIES TAB CONTENT
   ========================================================================= */

type InspectorSelectionState = ReturnType<typeof useInspectorSelectionState>;

interface InspectorPropertiesContentProps {
  selectionState: InspectorSelectionState;
  simResult: SimulationResult | null;
  setIsCollapsed: (c: boolean) => void;
  runCircuitValidation: () => void;
}

function InspectorPropertiesContent({
  selectionState,
  simResult,
  setIsCollapsed,
  runCircuitValidation,
}: InspectorPropertiesContentProps) {
  if (selectionState.kind === 'multi-component') {
    const multiCount = selectionState.count;
    const selectedIds = useCircuitStore.getState().selectedComponentIds;
    return (
      <div className="p-4 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-relaxed text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
          <strong>Multi-Selection Active:</strong> {multiCount} items selected.
          <br />• Drag any item to move the entire group.
          <br />• Group items together into a movable block.
          <br />• Delete removes all selected items simultaneously.
        </div>

        <button
          type="button"
          onClick={() => {
            useCircuitStore
              .getState()
              .createGroup(
                `Group ${useCircuitStore.getState().componentGroups.length + 1}`,
                selectedIds,
              );
            useUiStore.getState().addLog(`Grouped ${multiCount} components`, 'success');
          }}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
        >
          <Copy className="size-3.5" />
          <span>Group Selected ({multiCount} Items)</span>
        </button>

        <button
          type="button"
          disabled={useUiStore.getState().simRunning}
          onClick={() => {
            useCircuitStore.getState().rotateSelected(90);
            useUiStore.getState().addLog(`Rotated ${multiCount} components 90°`, 'info');
          }}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RotateCw className="size-3.5" />
          <span>Rotate All Selected 90° (Shift+R)</span>
        </button>

        <button
          type="button"
          disabled={useUiStore.getState().simRunning}
          onClick={requestDeleteSelection}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Trash2 className="size-3.5" />
          <span>Delete {multiCount} Selected Items</span>
        </button>

        <button
          type="button"
          onClick={() => useCircuitStore.getState().clearSelection()}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Clear Selection
        </button>
      </div>
    );
  }

  if (selectionState.kind === 'wire') {
    return <WireInspectorView wire={selectionState.wire} simResult={simResult} />;
  }

  if (selectionState.kind === 'component') {
    return (
      <ComponentPropertiesView selectedComp={selectionState.component} simResult={simResult} />
    );
  }

  return (
    <div className="p-5 flex flex-col items-center justify-center text-center h-full">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50/80 text-blue-600 border border-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50 shadow-2xs">
        <MousePointerClick className="size-7" />
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
        Select Canvas Item
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed max-w-xs">
        Click any component or wire on the canvas to inspect and edit properties, wire lengths,
        gauges, and switch states.
      </p>

      <div className="w-full text-left rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-700/60 dark:bg-slate-800/50 space-y-2">
        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="size-3.5 text-amber-500" /> Canvas Actions
        </div>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-snug">
          <li>• Click wire to change length, gauge, and routing</li>
          <li>• Click switch to toggle state (ON / OFF)</li>
          <li>• Shift-click items to select multiple</li>
        </ul>
      </div>

      <div className="mt-6 w-full">
        <button
          type="button"
          onClick={runCircuitValidation}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
        >
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Run Circuit Safety Check</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   WIRE PROPERTIES VIEW
   ========================================================================= */

function WireInspectorView({
  wire,
  simResult,
}: {
  wire: WireInstance;
  simResult: SimulationResult | null;
}) {
  const isEnergized = simResult?.energizedWires.has(wire.id) ?? false;
  const currentLength = wire.lengthMeters ?? 10;
  const currentGauge = wire.customCableMm2 ?? 2.5;
  const currentPathKind = wire.pathKind ?? 'orthogonal';
  const currentDerating = wire.deratingFactor ?? 1.0;

  const handleLengthChange = (m: number) => {
    useCircuitStore.getState().updateWireProperties(wire.id, { lengthMeters: m });
  };

  const handleGaugeChange = (mm2: number) => {
    useCircuitStore.getState().updateWireProperties(wire.id, { customCableMm2: mm2 });
  };

  const handlePathKindChange = (kind: 'orthogonal' | 'bezier') => {
    useCircuitStore.getState().updateWireProperties(wire.id, { pathKind: kind });
  };

  const handleDeratingChange = (f: number) => {
    useCircuitStore.getState().updateWireProperties(wire.id, { deratingFactor: f });
  };

  const handleDeleteWire = () => requestDeleteWire(wire.id);

  return (
    <div className="p-3.5 space-y-4 text-xs">
      {/* Wire Status Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200">Wire Status</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${
              isEnergized
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : wire.fault
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isEnergized ? 'ENERGIZED' : wire.fault ? `FAULT: ${wire.fault}` : 'IDLE'}
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
          ID: {wire.id}
        </div>
      </div>

      {/* Length Setting */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="wire-length-slider"
            className="font-bold text-slate-800 dark:text-slate-200"
          >
            Wire Length (Meters)
          </label>
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
            {currentLength} m
          </span>
        </div>

        <input
          id="wire-length-slider"
          type="range"
          min="1"
          max="50"
          step="0.5"
          value={currentLength}
          onChange={(e) => handleLengthChange(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />

        <div className="flex flex-wrap gap-1 pt-1">
          {[1, 2.5, 5, 10, 15, 25, 50].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleLengthChange(m)}
              className={`rounded border px-2 py-0.5 text-[10px] font-semibold transition ${
                currentLength === m
                  ? 'border-blue-500 bg-blue-600 text-white dark:bg-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Cable Gauge Size */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Cable Cross-Section (mm²)
          </span>
          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
            {currentGauge} mm²
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {[1.0, 1.5, 2.5, 4.0, 6.0, 10.0, 16.0].map((mm2) => (
            <button
              key={mm2}
              type="button"
              onClick={() => handleGaugeChange(mm2)}
              className={`rounded border px-2 py-1 text-[10px] font-semibold font-mono transition ${
                currentGauge === mm2
                  ? 'border-purple-500 bg-purple-600 text-white dark:bg-purple-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {mm2}mm²
            </button>
          ))}
        </div>
      </div>

      {/* Routing Style */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
        <span className="font-bold text-slate-800 dark:text-slate-200">Routing Style</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handlePathKindChange('orthogonal')}
            className={`rounded-lg border py-1.5 text-xs font-semibold transition ${
              currentPathKind === 'orthogonal'
                ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            Orthogonal (90°)
          </button>

          <button
            type="button"
            onClick={() => handlePathKindChange('bezier')}
            className={`rounded-lg border py-1.5 text-xs font-semibold transition ${
              currentPathKind === 'bezier'
                ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            Curved (Bezier)
          </button>
        </div>
      </div>

      {/* Derating Factor */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="derating-factor-slider"
            className="font-bold text-slate-800 dark:text-slate-200"
          >
            Derating Factor (Cg)
          </label>
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {currentDerating.toFixed(2)}
          </span>
        </div>

        <input
          id="derating-factor-slider"
          type="range"
          min="0.4"
          max="1.0"
          step="0.05"
          value={currentDerating}
          onChange={(e) => handleDeratingChange(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {[
            { label: 'Direct Air (1.0)', val: 1.0 },
            { label: 'In Conduit (0.8)', val: 0.8 },
            { label: 'Thermal Insulation (0.7)', val: 0.7 },
            { label: 'Grouped Cables (0.5)', val: 0.5 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handleDeratingChange(preset.val)}
              className={`rounded border p-1 text-center font-medium transition ${
                Math.abs(currentDerating - preset.val) < 0.01
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wire Material */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
        <span className="font-bold text-slate-800 dark:text-slate-200">Wire Material</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() =>
              useCircuitStore.getState().updateWireProperties(wire.id, { material: 'copper' })
            }
            className={`rounded-lg border py-1.5 text-xs font-semibold transition ${
              wire.material === 'copper'
                ? 'border-amber-500 bg-amber-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            Copper
          </button>

          <button
            type="button"
            onClick={() =>
              useCircuitStore.getState().updateWireProperties(wire.id, { material: 'aluminum' })
            }
            className={`rounded-lg border py-1.5 text-xs font-semibold transition ${
              wire.material === 'aluminum'
                ? 'border-gray-500 bg-gray-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            Aluminum
          </button>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {wire.material === 'aluminum'
            ? 'Aluminum: Lower conductivity, lighter weight, lower cost'
            : 'Copper: Higher conductivity, better durability'}
        </p>
      </div>

      {/* Wire Gauge (AWG) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200">Wire Gauge (AWG)</span>
          <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
            {wire.gauge ?? 14} AWG
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {[10, 12, 14, 16, 18, 20, 22].map((awg) => (
            <button
              key={awg}
              type="button"
              onClick={() =>
                useCircuitStore.getState().updateWireProperties(wire.id, { gauge: awg })
              }
              className={`rounded border px-2 py-1 text-[10px] font-semibold font-mono transition ${
                wire.gauge === awg
                  ? 'border-cyan-500 bg-cyan-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {awg} AWG
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Lower AWG = thicker wire = higher ampacity
        </p>
      </div>

      {/* Delete Wire Action */}
      <button
        type="button"
        onClick={handleDeleteWire}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40 transition"
      >
        <Trash2 className="size-4" />
        <span>Delete Selected Wire</span>
      </button>
    </div>
  );
}

/* =========================================================================
   COMPONENT PROPERTIES VIEW
   ========================================================================= */

function ComponentPropertiesView({
  selectedComp,
  simResult,
}: {
  selectedComp: ComponentInstance;
  simResult: SimulationResult | null;
}) {
  const def = COMPONENT_DEFS[selectedComp.type];
  if (!def) return null;

  const isOn = selectedComp.state.on === true;
  const setPreviewVariant = useUiStore((s) => s.setPreviewVariant);
  const helpData = getComponentHelp(selectedComp.type, def.category);
  const simRunning = useUiStore((s) => s.simRunning);

  // Get live simulation data for this component
  const isEnergized = simResult?.energizedComponents.has(selectedComp.id) ?? false;
  const compCalc = simResult?.componentCalculations?.[selectedComp.id];
  const liveVoltage = compCalc?.voltage ?? 0;
  const liveCurrent = compCalc?.currentAmps ?? 0;
  const livePower = compCalc?.powerWatts ?? 0;

  // Determine fault state for visual feedback
  const isFaulted =
    selectedComp.state.isBlown || selectedComp.state.isTripped || selectedComp.state.fault;
  const isOvervoltage = liveVoltage > (selectedComp.state.customMaxVolts ?? def.maxVolts ?? 250);
  const isOvercurrent = liveCurrent > (selectedComp.state.customMaxAmps ?? def.maxAmps ?? 16);
  const isOverload = livePower > (selectedComp.state.customPowerWatts ?? def.powerWatts ?? 1000);

  const handleResetToDefault = () => {
    useCircuitStore.getState().updateComponentState(selectedComp.id, {
      customPowerWatts: undefined,
      customMaxAmps: undefined,
      customMaxVolts: undefined,
      customVoltage: undefined,
      customCableMm2: undefined,
      isBlown: false,
      blownReason: undefined,
      on: def.defaultOn ?? false,
      speed: undefined,
    });
  };

  const familyList = VALID_VARIANT_FAMILIES[selectedComp.type] || [];
  const variantEntries = Object.entries(COMPONENT_DEFS).filter(([key]) => familyList.includes(key));

  return (
    <div className="p-3.5 space-y-3.5 text-xs">
      {/* Component Image Card - Fully fitted without clipping */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800 shadow-inner group">
        <div className="relative h-32 w-full overflow-hidden bg-slate-900/90 flex items-center justify-center p-2">
          <img
            src={getComponentImage(selectedComp.type, def.category)}
            alt={def.label}
            referrerPolicy="no-referrer"
            className="h-full w-full max-h-28 object-contain drop-shadow-md"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-1.5 pointer-events-none" />
          <span className="absolute bottom-1 left-2 right-2 text-[10px] font-medium text-slate-200 truncate">
            {def.description || def.label}
          </span>
          <button
            type="button"
            title={`View ${def.label} Real-World Technical Specifications`}
            onClick={() => useUiStore.getState().setActiveComponentInfoType(selectedComp.type)}
            className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 hover:bg-sky-600 text-sky-400 hover:text-white rounded-lg border border-slate-700/80 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold shadow-md z-10"
          >
            <HelpCircle className="size-3.5" />
            <span>Specs</span>
          </button>
        </div>
      </div>

      {/* Variants Selection Gallery (Moved to top above Fault Simulation & Telemetry) */}
      {variantEntries.length > 1 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Family Variants ({variantEntries.length})
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5 custom-scrollbar">
            {variantEntries.map(([vType, vDef]) => {
              const isSelected = selectedComp.type === vType;
              return (
                <div key={vType} className="relative flex items-center group">
                  <button
                    type="button"
                    onClick={() => {
                      useCircuitStore.getState().updateComponentType(selectedComp.id, vType);
                      setPreviewVariant(null);
                    }}
                    onMouseEnter={() => setPreviewVariant(vType, selectedComp.id)}
                    onMouseLeave={() => setPreviewVariant(null)}
                    className={`w-full rounded-lg border py-1.5 pl-2 pr-6 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate block text-[10px]">{vDef.label}</span>
                  </button>
                  <button
                    type="button"
                    title={`View ${vDef.label} Specifications`}
                    onClick={(e) => {
                      e.stopPropagation();
                      useUiStore.getState().setActiveComponentInfoType(vType);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer z-10"
                  >
                    <HelpCircle className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Telemetry with Visual Feedback */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="size-3.5 text-blue-500" />
          Live Telemetry
          {isEnergized && (
            <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              ENERGIZED
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`rounded-lg border p-2 text-center transition ${
              isOvervoltage
                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <div
              className={`text-[9px] ${isOvervoltage ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Voltage
            </div>
            <div
              className={`font-mono text-sm font-bold ${isOvervoltage ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}
            >
              <AnimatedNumber
                value={simRunning ? liveVoltage : 0}
                decimals={1}
                suffix="V"
                duration={250}
              />
            </div>
          </div>
          <div
            className={`rounded-lg border p-2 text-center transition ${
              isOvercurrent
                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <div
              className={`text-[9px] ${isOvercurrent ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Current
            </div>
            <div
              className={`font-mono text-sm font-bold ${isOvercurrent ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}
            >
              <AnimatedNumber
                value={simRunning ? liveCurrent : 0}
                decimals={2}
                suffix="A"
                duration={250}
              />
            </div>
          </div>
          <div
            className={`rounded-lg border p-2 text-center transition ${
              isOverload
                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <div
              className={`text-[9px] ${isOverload ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Power
            </div>
            <div
              className={`font-mono text-sm font-bold ${isOverload ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}
            >
              <AnimatedNumber
                value={simRunning ? livePower : 0}
                decimals={0}
                suffix="W"
                duration={250}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Voltage Fluctuation Sparkline (Last 30 Seconds) */}
      <ComponentVoltageSparkline
        componentId={selectedComp.id}
        componentLabel={def.label}
        liveVoltage={liveVoltage}
        isEnergized={isEnergized}
        simRunning={simRunning}
        nominalVoltage={selectedComp.state.customVoltage ?? 230}
      />

      {/* Manual Fault Simulation Panel */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-800 dark:bg-amber-950/40 space-y-2.5">
        <div className="font-bold text-amber-900 dark:text-amber-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-amber-600" />
          Manual Fault Simulation
        </div>

        {/* Fault Type Injection Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() =>
              useCircuitStore.getState().setComponentFault(selectedComp.id, 'open-circuit')
            }
            className={`rounded border py-1.5 text-[10px] font-bold transition ${
              selectedComp.state.fault === 'open-circuit'
                ? 'border-red-500 bg-red-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Open Circuit
          </button>
          <button
            type="button"
            onClick={() =>
              useCircuitStore.getState().setComponentFault(selectedComp.id, 'short-circuit')
            }
            className={`rounded border py-1.5 text-[10px] font-bold transition ${
              selectedComp.state.fault === 'short-circuit'
                ? 'border-red-500 bg-red-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Short Circuit
          </button>
          <button
            type="button"
            onClick={() =>
              useCircuitStore.getState().setComponentFault(selectedComp.id, 'reverse-polarity')
            }
            className={`rounded border py-1.5 text-[10px] font-bold transition ${
              selectedComp.state.fault === 'reverse-polarity'
                ? 'border-red-500 bg-red-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Reverse Polarity
          </button>
          {def.isSwitch && (
            <button
              type="button"
              onClick={() =>
                useCircuitStore.getState().setComponentFault(selectedComp.id, 'switched-neutral')
              }
              className={`col-span-2 rounded border py-1.5 text-[10px] font-bold transition ${
                selectedComp.state.fault === 'switched-neutral'
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Switched Neutral (Reg 132.14)
            </button>
          )}
          {def.isProtection && (
            <>
              <button
                type="button"
                onClick={() =>
                  useCircuitStore.getState().setComponentFault(selectedComp.id, 'protection-bypass')
                }
                className={`rounded border py-1.5 text-[10px] font-bold transition ${
                  selectedComp.state.fault === 'protection-bypass'
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Bypass Breaker
              </button>
              <button
                type="button"
                onClick={() =>
                  useCircuitStore
                    .getState()
                    .setComponentFault(selectedComp.id, 'protection-forced-open')
                }
                className={`rounded border py-1.5 text-[10px] font-bold transition ${
                  selectedComp.state.fault === 'protection-forced-open'
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Jam Breaker Open
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() =>
              useCircuitStore.getState().setComponentFault(selectedComp.id, 'earth-fault')
            }
            className={`rounded border py-1.5 text-[10px] font-bold transition ${
              selectedComp.state.fault === 'earth-fault'
                ? 'border-red-500 bg-red-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Earth Fault
          </button>
          <button
            type="button"
            onClick={() => useCircuitStore.getState().setComponentFault(selectedComp.id, undefined)}
            className="col-span-3 rounded border border-emerald-300 bg-emerald-50 py-1.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 transition"
          >
            Clear Faults
          </button>
        </div>

        {/* Threshold Adjustment Sliders */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">
            Threshold Overrides
          </div>

          {/* Voltage Threshold */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                className={`text-[10px] ${isOvervoltage ? 'text-red-600 font-semibold' : 'text-amber-700 dark:text-amber-400'}`}
              >
                Max Voltage: {selectedComp.state.customMaxVolts ?? def.maxVolts ?? 250}V
              </label>
              <span
                className={`text-[9px] font-mono ${isOvervoltage ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Live: {simRunning ? liveVoltage.toFixed(1) : '0.0'}V
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="5"
              value={selectedComp.state.customMaxVolts ?? def.maxVolts ?? 250}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customMaxVolts: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>50V</span>
              <span>500V</span>
            </div>
          </div>

          {/* Current Threshold */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                className={`text-[10px] ${isOvercurrent ? 'text-red-600 font-semibold' : 'text-amber-700 dark:text-amber-400'}`}
              >
                Max Current: {selectedComp.state.customMaxAmps ?? def.maxAmps ?? 16}A
              </label>
              <span
                className={`text-[9px] font-mono ${isOvercurrent ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Live: {simRunning ? liveCurrent.toFixed(2) : '0.00'}A
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={selectedComp.state.customMaxAmps ?? def.maxAmps ?? 16}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customMaxAmps: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>0.1A</span>
              <span>100A</span>
            </div>
          </div>

          {/* Power Threshold */}
          {def.powerWatts !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  className={`text-[10px] ${isOverload ? 'text-red-600 font-semibold' : 'text-amber-700 dark:text-amber-400'}`}
                >
                  Max Power: {selectedComp.state.customPowerWatts ?? def.powerWatts}W
                </label>
                <span
                  className={`text-[9px] font-mono ${isOverload ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Live: {simRunning ? livePower.toFixed(0) : '0'}W
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5000"
                step="1"
                value={selectedComp.state.customPowerWatts ?? def.powerWatts}
                onChange={(e) =>
                  useCircuitStore.getState().updateComponentState(selectedComp.id, {
                    customPowerWatts: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-amber-500"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>1W</span>
                <span>5000W</span>
              </div>
            </div>
          )}
        </div>

        {/* Numerical Input Fields */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label
              className={`block text-[9px] mb-0.5 ${isOvervoltage ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Max Voltage (V)
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={selectedComp.state.customMaxVolts ?? def.maxVolts ?? 250}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customMaxVolts: Number(e.target.value),
                })
              }
              className={`w-full rounded border px-2 py-1 font-mono text-xs dark:bg-slate-900 dark:text-slate-100 ${
                isOvervoltage
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
          <div>
            <label
              className={`block text-[9px] mb-0.5 ${isOvercurrent ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Max Current (A)
            </label>
            <input
              type="number"
              min="0.1"
              max="200"
              step="0.1"
              value={selectedComp.state.customMaxAmps ?? def.maxAmps ?? 16}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customMaxAmps: Number(e.target.value),
                })
              }
              className={`w-full rounded border px-2 py-1 font-mono text-xs dark:bg-slate-900 dark:text-slate-100 ${
                isOvercurrent
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Switch Control Toggle */}
      {def.isSwitch && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Switch Contact State</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {def.isMomentary ? 'Hold to close the contact' : 'Toggle contact position'}
            </div>
          </div>
          {def.isMomentary ? (
            <button
              type="button"
              aria-label="Press and hold"
              aria-pressed={isOn}
              onClick={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                if (event.button > 0) return;
                event.currentTarget.setPointerCapture?.(event.pointerId);
                setMomentarySwitchState(selectedComp.id, true);
              }}
              onPointerUp={() => setMomentarySwitchState(selectedComp.id, false)}
              onPointerCancel={() => setMomentarySwitchState(selectedComp.id, false)}
              onLostPointerCapture={() => setMomentarySwitchState(selectedComp.id, false)}
              onKeyDown={(event) => {
                if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat) return;
                event.preventDefault();
                setMomentarySwitchState(selectedComp.id, true);
              }}
              onKeyUp={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                setMomentarySwitchState(selectedComp.id, false);
              }}
              onBlur={() => setMomentarySwitchState(selectedComp.id, false)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition shadow-2xs ${
                isOn
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isOn ? 'PRESSED' : 'RELEASED'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => useCircuitStore.getState().toggleSwitch(selectedComp.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition shadow-2xs ${
                isOn
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isOn ? 'CLOSED (ON)' : 'OPEN (OFF)'}
            </button>
          )}
        </div>
      )}

      {/* Battery Chemistry Selector */}
      {(def.isSource ||
        selectedComp.type.includes('battery') ||
        selectedComp.type.includes('cell') ||
        selectedComp.type.includes('dc')) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">Battery Chemistry</span>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 capitalize">
              {selectedComp.state.batteryChemistry ?? 'alkaline'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['alkaline', 'li-ion', 'lead-acid'] as const).map((chem) => (
              <button
                key={chem}
                type="button"
                onClick={() =>
                  useCircuitStore.getState().updateComponentState(selectedComp.id, {
                    batteryChemistry: chem,
                  })
                }
                className={`rounded-lg border py-1.5 text-[10px] font-bold capitalize transition ${
                  (selectedComp.state.batteryChemistry ?? 'alkaline') === chem
                    ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {chem}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {(selectedComp.state.batteryChemistry ?? 'alkaline') === 'alkaline'
              ? 'Alkaline: Standard Rint = 0.15 Ω, normal discharge curve'
              : (selectedComp.state.batteryChemistry ?? 'alkaline') === 'li-ion'
                ? 'Li-ion: High energy Rint = 0.02 Ω, flat discharge curve'
                : 'Lead-acid: High surge Rint = 0.01 Ω, heavy load capacity'}
          </p>
        </div>
      )}

      {/* Supply Voltage with Active Simulation Lock */}
      {(def.isSource ||
        selectedComp.type.includes('supply') ||
        selectedComp.type.includes('mains') ||
        selectedComp.type.includes('ac') ||
        selectedComp.type.includes('battery')) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">Supply Voltage</span>
            {simRunning && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <Lock className="size-3" /> Locked during simulation
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              disabled={simRunning}
              value={
                selectedComp.state.customVoltage ?? (def.isSource ? 230 : (def.maxVolts ?? 230))
              }
              onChange={(e) => {
                const val = Number(e.target.value);
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customVoltage: val,
                });
                if (def.isSource) {
                  useCircuitStore.getState().setGlobalSupplyVoltage(val);
                }
              }}
              className={`w-full rounded-lg border px-2.5 py-1.5 font-mono text-xs ${
                simRunning
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                  : 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
              }`}
            />
            <span className="font-bold text-slate-600 dark:text-slate-400">V</span>
          </div>
          {simRunning ? (
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Supply voltage cannot be changed while simulation is active.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {[12, 24, 110, 230, 400].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    useCircuitStore.getState().updateComponentState(selectedComp.id, {
                      customVoltage: v,
                    });
                    if (def.isSource) useCircuitStore.getState().setGlobalSupplyVoltage(v);
                  }}
                  className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  {v}V
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Component Parameters & Full Customization */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60 space-y-2.5">
        <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
          Custom Electrical Specifications
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">
              Power (Watts)
            </label>
            <input
              type="number"
              aria-label="Power rating in watts"
              value={selectedComp.state.customPowerWatts ?? def.powerWatts ?? 60}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customPowerWatts: Number(e.target.value),
                })
              }
              className="w-full rounded border border-slate-200 px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">
              Operating Voltage (V)
            </label>
            <input
              type="number"
              aria-label="Operating voltage in volts"
              value={selectedComp.state.customVoltage ?? def.maxVolts ?? 230}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customVoltage: Number(e.target.value),
                })
              }
              className="w-full rounded border border-slate-200 px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">
              Current Rating (A)
            </label>
            <input
              type="number"
              aria-label="Current rating in amps"
              value={selectedComp.state.customMaxAmps ?? def.maxAmps ?? 16}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customMaxAmps: Number(e.target.value),
                })
              }
              className="w-full rounded border border-slate-200 px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">
              Cable Size (mm²)
            </label>
            <input
              type="number"
              step="0.5"
              aria-label="Cable size in mm2"
              value={selectedComp.state.customCableMm2 ?? def.recommendedCableMm2 ?? 2.5}
              onChange={(e) =>
                useCircuitStore.getState().updateComponentState(selectedComp.id, {
                  customCableMm2: Number(e.target.value),
                })
              }
              className="w-full rounded border border-slate-200 px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Rotation & Action Buttons */}
      <div className="pt-1 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={simRunning}
            onClick={() => useCircuitStore.getState().rotateComponent(selectedComp.id, -90)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
          >
            <RotateCcw className="size-3.5" />
            <span>Rotate -90°</span>
          </button>
          <button
            type="button"
            disabled={simRunning}
            onClick={() => useCircuitStore.getState().rotateComponent(selectedComp.id, 90)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
          >
            <RotateCw className="size-3.5" />
            <span>Rotate +90° (R)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset Factory Defaults</span>
        </button>

        <button
          type="button"
          onClick={() => requestDeleteComponent(selectedComp.id)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40 transition"
        >
          <Trash2 className="size-4" />
          <span>Delete Component</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   CONNECTIONS TAB CONTENT
   ========================================================================= */

function InspectorConnectionsContent({
  selectionState,
}: {
  selectionState: InspectorSelectionState;
}) {
  const components = useCircuitStore((s) => s.components);
  const wires = useCircuitStore((s) => s.wires);
  const tracePathMode = useUiStore((s) => s.tracePathMode);
  const toggleTracePathMode = useUiStore((s) => s.toggleTracePathMode);

  if (selectionState.kind === 'wire') {
    const wire: WireInstance = selectionState.wire;
    const fromComp = components.find((c) => c.id === wire.fromComponentId);
    const toComp = components.find((c) => c.id === wire.toComponentId);

    const fromDef = fromComp ? COMPONENT_DEFS[fromComp.type] : null;
    const toDef = toComp ? COMPONENT_DEFS[toComp.type] : null;

    const fromPortLabel = fromDef?.ports[wire.fromPortIndex]?.label ?? `Port ${wire.fromPortIndex}`;
    const toPortLabel = toDef?.ports[wire.toPortIndex]?.label ?? `Port ${wire.toPortIndex}`;

    return (
      <div className="p-3.5 space-y-3.5 text-xs">
        {/* Origin Node Card */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900/50 dark:bg-blue-950/40 space-y-1.5">
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Origin Terminal (From)
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-100">
            {fromDef?.label ?? 'Unknown Component'}
          </div>
          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
            Terminal: {fromPortLabel} (Port #{wire.fromPortIndex})
          </div>
          {fromComp && (
            <button
              type="button"
              onClick={() => useCircuitStore.getState().selectComponent(fromComp.id)}
              className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 underline"
            >
              <span>Inspect Origin Component</span>
              <ChevronRight className="size-3" />
            </button>
          )}
        </div>

        {/* Direction Flow Visualizer */}
        <div className="flex items-center justify-center gap-2 py-1 text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <span>Flow Axis</span>
            <ArrowRightLeft className="size-3 text-blue-500" />
          </div>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Destination Node Card */}
        <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 dark:border-purple-900/50 dark:bg-purple-950/40 space-y-1.5">
          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Destination Terminal (To)
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-100">
            {toDef?.label ?? 'Unknown Component'}
          </div>
          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
            Terminal: {toPortLabel} (Port #{wire.toPortIndex})
          </div>
          {toComp && (
            <button
              type="button"
              onClick={() => useCircuitStore.getState().selectComponent(toComp.id)}
              className="mt-1 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 underline"
            >
              <span>Inspect Destination Component</span>
              <ChevronRight className="size-3" />
            </button>
          )}
        </div>

        {/* Topology Actions */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => useCircuitStore.getState().swapWireEndpoints(wire.id)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
          >
            <ArrowRightLeft className="size-3.5" />
            <span>Swap Terminal Directions</span>
          </button>

          <button
            type="button"
            onClick={toggleTracePathMode}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
              tracePathMode
                ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Eye className="size-3.5" />
            <span>{tracePathMode ? 'Highlight Path: ACTIVE' : 'Highlight Traced Path'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (selectionState.kind === 'component') {
    const comp: ComponentInstance = selectionState.component;
    const def = COMPONENT_DEFS[comp.type];
    const compWires = wires.filter(
      (w) => w.fromComponentId === comp.id || w.toComponentId === comp.id,
    );

    return (
      <div className="p-3.5 space-y-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
            Terminal Ports ({def?.ports.length ?? 0})
          </span>
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            {compWires.length} connected cable(s)
          </span>
        </div>

        <div className="space-y-2">
          {def?.ports.map((port, pIdx) => {
            const portWires = compWires.filter(
              (w) =>
                (w.fromComponentId === comp.id && w.fromPortIndex === pIdx) ||
                (w.toComponentId === comp.id && w.toPortIndex === pIdx),
            );

            return (
              <div
                key={pIdx}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Port #{pIdx}: {port.label}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      portWires.length > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {portWires.length > 0 ? 'CONNECTED' : 'OPEN'}
                  </span>
                </div>

                {portWires.map((w) => {
                  const otherComponentId =
                    w.fromComponentId === comp.id ? w.toComponentId : w.fromComponentId;
                  const otherComp = components.find((c) => c.id === otherComponentId);
                  const otherDef = otherComp ? COMPONENT_DEFS[otherComp.type] : null;

                  return (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {otherDef?.label ?? 'Connected Device'}
                        </span>
                        <div className="font-mono text-[10px] text-slate-400">
                          Wire #{w.id.slice(0, 6)} ({w.lengthMeters ?? 10}m)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => useCircuitStore.getState().selectWire(w.id)}
                        className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400 hover:underline shrink-0"
                      >
                        Inspect Wire
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleTracePathMode}
          className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
            tracePathMode
              ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Eye className="size-3.5" />
          <span>{tracePathMode ? 'Highlight Path: ACTIVE' : 'Highlight Traced Path'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 text-center space-y-3">
      <Route className="size-8 text-blue-500 mx-auto" />
      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
        Circuit Network Topology
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Select any wire or component on the canvas to inspect terminal ports, trace connection
        paths, or swap wire endpoints.
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left font-mono text-[11px] space-y-1 dark:border-slate-800 dark:bg-slate-950">
        <div>• Total Components: {components.length}</div>
        <div>• Total Cable Wires: {wires.length}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   SIMULATION TELEMETRY & FAULTS TAB CONTENT
   ========================================================================= */

function InspectorSimulationContent({
  selectionState,
  simResult,
}: {
  selectionState: InspectorSelectionState;
  simResult: SimulationResult | null;
}) {
  const simRunning = useUiStore((s) => s.simRunning);

  if (selectionState.kind === 'wire') {
    const wire: WireInstance = selectionState.wire;
    const calc = simResult?.wireCalculations?.[wire.id];
    const isEnergized = simResult?.energizedWires.has(wire.id) ?? false;

    const current = calc?.currentAmps ?? 0;
    const voltageDrop = calc?.voltageDropVolts ?? 0;
    const vDropPercent = calc?.voltageDropPercent ?? 0;
    const resistance = calc?.resistanceOhms ?? 0.05;

    return (
      <div className="p-3.5 space-y-3.5 text-xs">
        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Live Current Draw
            </div>
            <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {simRunning ? `${current.toFixed(2)} A` : '0.00 A'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Voltage Drop
            </div>
            <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
              {simRunning ? `${voltageDrop.toFixed(2)} V (${vDropPercent.toFixed(1)}%)` : '0.0 V'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Cable Resistance
            </div>
            <div className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">
              {resistance.toFixed(3)} Ω
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Derated Ampacity
            </div>
            <div className="font-mono text-base font-bold text-purple-600 dark:text-purple-400">
              {calc?.deratedAmpacityAmps ?? 20} A
            </div>
          </div>
        </div>

        {/* Fault Injection Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 text-amber-500" /> Fault Injection Testing
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              type="button"
              onClick={() => useCircuitStore.getState().setWireFault(wire.id, 'open-circuit')}
              className={`rounded border py-1.5 text-[10px] font-bold transition ${
                wire.fault === 'open-circuit'
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Open Circuit
            </button>

            <button
              type="button"
              onClick={() => useCircuitStore.getState().setWireFault(wire.id, 'open-neutral')}
              className={`rounded border py-1.5 text-[10px] font-bold transition ${
                wire.fault === 'open-neutral'
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Broken Neutral
            </button>

            <button
              type="button"
              onClick={() => useCircuitStore.getState().setWireFault(wire.id, 'short-circuit')}
              className={`rounded border py-1.5 text-[10px] font-bold transition ${
                wire.fault === 'short-circuit'
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Short Circuit
            </button>

            <button
              type="button"
              onClick={() => useCircuitStore.getState().setWireFault(wire.id, 'live-to-earth')}
              className={`col-span-2 rounded border py-1.5 text-[10px] font-bold transition ${
                wire.fault === 'live-to-earth'
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Live-to-Earth Breakdown
            </button>

            <button
              type="button"
              onClick={() => useCircuitStore.getState().setWireFault(wire.id, undefined)}
              className="rounded border border-emerald-300 bg-emerald-50 py-1.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 transition"
            >
              Clear Fault
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectionState.kind === 'component') {
    const comp: ComponentInstance = selectionState.component;
    const def = COMPONENT_DEFS[comp.type];
    const isEnergized = simResult?.energizedComponents.has(comp.id) ?? false;

    // Manual MCB trip toggle for protection components
    const isProtectionComponent = def?.isProtection ?? false;
    const isTripped = comp.state.isTripped ?? false;

    return (
      <div className="p-3.5 space-y-3.5 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">{def?.label}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Component Operating Telemetry
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${
              isEnergized
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isEnergized ? 'ENERGIZED' : 'IDLE / OFF'}
          </span>
        </div>

        {/* Manual MCB Trip Toggle for Protection Devices */}
        {isProtectionComponent && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-3 dark:border-orange-800 dark:bg-orange-950/40 space-y-2">
            <div className="font-bold text-orange-900 dark:text-orange-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <OctagonAlert className="size-3.5 text-orange-600" />
              Manual Breaker Control
            </div>
            <p className="text-[10px] text-orange-700 dark:text-orange-300">
              Manually trip or reset the breaker to simulate fault conditions and test circuit
              protection behavior.
            </p>
            <div className="flex gap-2 pt-1">
              {!isTripped ? (
                <button
                  type="button"
                  onClick={() =>
                    useCircuitStore.getState().updateComponentState(comp.id, {
                      isTripped: true,
                      tripReason: 'manual-fault',
                    })
                  }
                  className="flex-1 rounded-lg border border-red-300 bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 transition shadow-xs"
                >
                  ⚡ TRIP Breaker (Manual Fault)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => useCircuitStore.getState().resetTrippedComponent(comp.id)}
                  disabled={!(simResult?.faultsCleared ?? true)}
                  className="flex-1 rounded-lg border border-emerald-300 bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↻ RESET Breaker
                </button>
              )}
            </div>
            {isTripped && (
              <div className="rounded-lg bg-red-100 dark:bg-red-950/60 p-2 text-[10px] text-red-800 dark:text-red-300">
                <strong>Status:</strong> TRIPPED ({comp.state.tripReason ?? 'manual-fault'})
                <br />
                <strong>Action:</strong> Clear faults before resetting
              </div>
            )}
          </div>
        )}

        {/* Faults / Blown Device State */}
        {comp.state.isBlown && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/60 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-300 text-xs">
              <OctagonAlert className="size-4 text-red-600" />
              <span>Device Fault: {comp.state.blownReason ?? 'Overload Melted'}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                useCircuitStore.getState().updateComponentState(comp.id, {
                  isBlown: false,
                  blownReason: undefined,
                })
              }
              className="w-full rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition"
            >
              Reset Fault / Replace Device
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 text-center space-y-3">
      <Zap className="size-8 text-amber-500 mx-auto animate-pulse" />
      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
        Circuit Simulation Telemetry
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Select any wire or component on canvas to inspect live voltage, branch current draw, or
        inject open/short faults for testing.
      </p>
    </div>
  );
}

/* =========================================================================
   WAVEFORM SCOPE, LIVE MEASUREMENTS & LOGS VIEWS
   ========================================================================= */

function InspectorAnalyticsView({ simResult }: { simResult: SimulationResult | null }) {
  const simRunning = useUiStore((s) => s.simRunning);
  const components = useCircuitStore((s) => s.components);
  const globalVoltage = useCircuitStore((s) => s.globalVoltage);
  const wires = useCircuitStore((s) => s.wires);
  const componentGroups = useCircuitStore((s) => s.componentGroups);
  const thermalOverlayEnabled = useUiStore((s) => s.thermalOverlayEnabled);

  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!simRunning) return;
    const interval = setInterval(() => {
      setTime((t) => (t + 0.08) % (Math.PI * 200));
    }, 35);
    return () => clearInterval(interval);
  }, [simRunning]);

  const liveSupplyVoltage = simResult?.supplyVoltage ?? globalVoltage;
  const hasAcSupply =
    components.some(
      (c) =>
        c.type.includes('ac') ||
        c.type.includes('mains') ||
        c.type.includes('generator') ||
        c.type.includes('inverter'),
    ) || liveSupplyVoltage > 48;

  let activePowerW = 0;
  if (simRunning && simResult && simResult.energizedComponents.size > 0) {
    for (const id of simResult.energizedComponents) {
      const comp = components.find((c) => c.id === id);
      if (!comp || comp.state?.isBlown) continue;
      const def = COMPONENT_DEFS[comp.type];
      const pWatts = comp.state?.customPowerWatts ?? def?.powerWatts;
      if (pWatts !== undefined && pWatts > 0) {
        activePowerW += pWatts;
      }
    }
  }

  // Realistic dynamic calculations for Live Measurements
  const voltageLive = simRunning
    ? liveSupplyVoltage - 0.4 + 0.3 * Math.sin(time * 1.8)
    : liveSupplyVoltage;
  
  const currentAmpsCalculated =
    activePowerW > 0 ? activePowerW / Math.max(1, liveSupplyVoltage) : 0;
  const currentLive =
    simRunning && activePowerW > 0
      ? currentAmpsCalculated + 0.05 * Math.sin(time * 2.3)
      : currentAmpsCalculated;

  const powerLive =
    simRunning && activePowerW > 0
      ? activePowerW + 2.5 * Math.sin(time * 2.8)
      : activePowerW;

  const hasInductive = components.some(
    (c) =>
      c.type.includes('motor') ||
      c.type.includes('transformer') ||
      c.type.includes('fan') ||
      c.type.includes('pump'),
  );
  const powerFactorLive = simRunning
    ? hasInductive
      ? 0.94 + 0.02 * Math.sin(time * 1.2)
      : 0.98 + 0.01 * Math.sin(time * 0.9)
    : 0.98;

  const frequencyLive = hasAcSupply
    ? simRunning
      ? (liveSupplyVoltage === 110 || liveSupplyVoltage === 120 ? 60.0 : 50.0) +
        0.012 * Math.sin(time * 1.5) +
        0.008 * Math.cos(time * 3.4)
      : liveSupplyVoltage === 110 || liveSupplyVoltage === 120
        ? 60.0
        : 50.0
    : 0.0;

  // Real-time mini sparklines for Live Measurements cards
  const generateSineSparkline = (
    color: string,
    omega = 0.12,
    speed = 3,
    phase = 0,
    width = 120,
    height = 24,
  ) => {
    const midY = height / 2;
    const points: string[] = [];
    const amplitude = height * 0.38;

    for (let x = 0; x <= width; x += 2) {
      const y = simRunning
        ? midY - Math.sin(x * omega + time * speed + phase) * amplitude
        : midY - Math.sin(x * omega + phase) * (amplitude * 0.4);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generatePowerSparkline = (width = 120, height = 24) => {
    const midY = height / 2;
    const points: string[] = [];
    const amplitude = height * 0.36;

    for (let x = 0; x <= width; x += 2) {
      const y = simRunning
        ? midY -
          (Math.sin(2 * (x * 0.12 + time * 3)) * 0.7 +
            0.15 * Math.sin(x * 0.36 + time * 6)) *
            amplitude
        : midY - Math.sin(2 * (x * 0.12)) * (amplitude * 0.4);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generateFrequencyTransientSparkline = (width = 180, height = 36) => {
    const midY = height / 2;
    const points: string[] = [];
    const amplitude = height * 0.42;

    for (let x = 0; x <= width; x += 1.5) {
      const progress = x / width;
      const t = simRunning ? time * 2.8 : 0;
      // Multi-harmonic envelope packet mimicking the frequency resonance visual
      const burst = Math.exp(-(((progress - 0.6) * 4.2) ** 2));
      const baseWave = 0.22 * Math.sin(x * 0.14 + t);
      const ringing = burst * 0.88 * Math.sin(x * 0.38 + t * 1.9);
      const y = midY - (baseWave + ringing) * amplitude;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generateWaveformPath = (width = 280, height = 80) => {
    const midY = height / 2;
    if (!simRunning) {
      return `M 0,${midY} L ${width},${midY}`;
    }
    const points: string[] = [];
    const amplitude = hasAcSupply
      ? height * 0.36
      : Math.min(height * 0.35, Math.max(10, (liveSupplyVoltage / 240) * (height * 0.35)));

    for (let x = 0; x <= width; x += 1.5) {
      let y = midY;
      if (hasAcSupply) {
        const omega = 0.07;
        const fundamental = Math.sin(x * omega + time * 3);
        const harmonic3 = 0.04 * Math.sin(3 * (x * omega + time * 3));
        y = midY - (fundamental + harmonic3) * amplitude;
      } else {
        const ripple = Math.sin(x * 0.4 + time * 10) * 1.5;
        y = midY - amplitude + ripple;
      }
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generateCurrentWaveformPath = (width = 280, height = 80) => {
    const midY = height / 2;
    if (!simRunning || activePowerW === 0) {
      return `M 0,${midY} L ${width},${midY}`;
    }
    const points: string[] = [];
    const currentAmps = activePowerW / Math.max(1, liveSupplyVoltage);
    const amplitude = Math.min(height * 0.32, Math.max(6, currentAmps * 3));

    for (let x = 0; x <= width; x += 1.5) {
      let y = midY;
      if (hasAcSupply) {
        const omega = 0.07;
        const phaseLag = 0.35;
        const fundamental = Math.sin(x * omega + time * 3 - phaseLag);
        y = midY - fundamental * amplitude;
      } else {
        const ripple = Math.sin(x * 0.4 + time * 10 + 1) * 1.0;
        y = midY - amplitude + ripple;
      }
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  // Statistics data
  const stats = {
    runtime: simRunning ? time : 0,
    activeNodes: simResult?.energizedComponents.size ?? 0,
    tickRate: simRunning ? 60 : 0,
    totalComponents: components.length,
    totalWires: wires.length,
    totalGroups: componentGroups.length,
  };

  return (
    <div className="p-3.5 space-y-3.5 text-xs select-none">
      {/* ─── LIVE MEASUREMENTS PANEL (AS PER REFERENCE IMAGE) ─── */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-3.5 shadow-xl text-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px] shadow-emerald-400 animate-pulse" />
            Live Measurements
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {simRunning ? 'REAL-TIME 60Hz' : 'PAUSED'}
          </span>
        </div>

        {/* 2x2 Grid for Voltage, Current, Power, Power Factor */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Voltage (L-N) */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Voltage (L-N)</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={voltageLive} decimals={1} suffix=" V" duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Voltage Waveform</title>
                <path
                  d={generateSineSparkline('#3b82f6', 0.12, 3, 0, 120, 24)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Current (A) */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Current (A)</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={currentLive} decimals={1} suffix=" A" duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Current Waveform</title>
                <path
                  d={generateSineSparkline('#22c55e', 0.12, 3, -0.35, 120, 24)}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Power (W) */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Power (W)</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={powerLive} decimals={0} suffix=" W" duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Power Waveform</title>
                <path
                  d={generatePowerSparkline(120, 24)}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Power Factor */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Power Factor</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={powerFactorLive} decimals={2} duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Power Factor Waveform</title>
                <path
                  d={generateSineSparkline('#a855f7', 0.14, 2.6, 0.4, 120, 24)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 5: Frequency (Wide Card with Harmonic Transient Waveform) */}
        <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex items-center justify-between gap-3 overflow-hidden shadow-xs hover:border-slate-700/80 transition">
          <div className="flex-shrink-0">
            <div className="text-[11px] font-medium text-slate-300">Frequency</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white mt-1">
              {hasAcSupply ? (
                <AnimatedNumber value={frequencyLive} decimals={2} suffix=" Hz" duration={250} />
              ) : (
                '0.00 Hz (DC)'
              )}
            </div>
          </div>
          <div className="h-9 flex-1 pl-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 180 36">
              <title>Frequency Waveform</title>
              <defs>
                <filter id="glow-freq" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                d={generateFrequencyTransientSparkline(180, 36)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#glow-freq)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Waveform Oscilloscope ─── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-emerald-500" /> DSO Waveform Scope
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[9px]">
            <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5">
              CH1: {liveSupplyVoltage}V
            </span>
            <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5">
              CH2: {activePowerW}W
            </span>
          </div>
        </div>

        <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-950 p-1 border border-slate-800 shadow-inner">
          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <title>Oscilloscope Graticule Grid</title>
            <defs>
              <pattern id="scope-grid" width="28" height="16" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 16" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#scope-grid)" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2,2" />
          </svg>

          <svg
            className="h-full w-full relative z-10"
            viewBox="0 0 280 80"
            preserveAspectRatio="none"
          >
            <title>Waveform Oscilloscope View</title>
            <defs>
              <filter id="glow-ch1" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-ch2" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {simRunning && activePowerW > 0 && (
              <path
                d={generateCurrentWaveformPath(280, 80)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeLinecap="round"
                filter="url(#glow-ch2)"
                opacity="0.85"
              />
            )}

            <path
              d={generateWaveformPath(280, 80)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow-ch1)"
            />
          </svg>

          <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-slate-400 pointer-events-none z-20">
            <span>5.0ms/div • 50V/div</span>
            <span>{hasAcSupply ? '50.0 Hz AC' : 'DC Steady'} • {simRunning ? 'TRIG: AUTO' : 'HOLD'}</span>
          </div>
        </div>
      </div>

      {/* ─── Runtime Statistics ─── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="size-3.5 text-green-500" /> Runtime Statistics
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Active Nodes
            </div>
            <div className="font-mono text-sm font-bold text-green-600 dark:text-green-400">
              {stats.activeNodes}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Tick Rate
            </div>
            <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
              {stats.tickRate} Hz
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Runtime</div>
            <div className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
              {(stats.runtime / 10).toFixed(1)}s
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Components
            </div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              {stats.totalComponents}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Wires</div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              {stats.totalWires}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Groups</div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              {stats.totalGroups}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Thermal Overlay Toggle ─── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer className="size-3.5 text-red-500" /> Thermal Overlay
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={thermalOverlayEnabled}
              onChange={(e) => useUiStore.getState().setThermalOverlayEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[10px] text-slate-600 dark:text-slate-400">Enable</span>
          </label>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#22c55e]"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#eab308]"></div>
            <span>Warm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#f97316]"></div>
            <span>Hot</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#ef4444]"></div>
            <span>Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectorLogsView() {
  const logs = useUiStore((s) => s.logs);
  const addLog = useUiStore((s) => s.addLog);
  const clearLogs = useUiStore((s) => s.clearLogs);

  const [cliInput, setCliInput] = useState('');

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    addLog(`> ${cliInput.trim()}`, 'info');
    setCliInput('');
  };

  return (
    <div className="p-3.5 space-y-3 text-xs flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200">System Logs</span>
        <button
          type="button"
          onClick={clearLogs}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 min-h-[220px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-200">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center">No logs recorded.</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="py-0.5 border-b border-slate-900/60 last:border-0">
              <span className={l.type === 'error' ? 'text-red-400' : 'text-blue-300'}>
                {l.message}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendCommand} className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          placeholder="Command..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
}
