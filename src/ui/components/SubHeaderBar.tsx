import {
  Bug,
  ChevronDown,
  ChevronRight,
  Edit2,
  Layers,
  Route,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COMPONENT_DEFS } from '../../domain/components';
import { getStandard } from '../../domain/standards';
import { useCircuitStore, useSettingsStore, useUiStore } from '../../store';
import { StandardSelector } from './StandardSelector';

const VOLTAGE_PRESETS = [
  { label: '12V DC', val: 12 },
  { label: '24V DC', val: 24 },
  { label: '110V AC', val: 110 },
  { label: '230V AC', val: 230 },
  { label: '240V AC', val: 240 },
  { label: '400V 3Ph', val: 400 },
];

export function SubHeaderBar() {
  const simRunning = useUiStore((s) => s.simRunning);
  const globalVoltage = useCircuitStore((s) => s.globalVoltage);
  const setGlobalSupplyVoltage = useCircuitStore((s) => s.setGlobalSupplyVoltage);
  const simResult = useUiStore((s) => s.simResult);

  // Pro-mode feature flags: manual fault injection and the regulatory standard
  // selector only surface when the user is in Pro Electrician Mode. In Student
  // Mode all manual fault controls are hidden regardless of the toggle.
  const appMode = useSettingsStore((s) => s.appMode);
  const manualFaultInjection = useSettingsStore((s) => s.manualFaultInjection);
  const regulationStandard = useSettingsStore((s) => s.regulationStandard);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const isPro = appMode === 'pro';
  const faultsArmed = isPro && manualFaultInjection;
  const standard = getStandard(regulationStandard);

  const selectedComponentIds = useCircuitStore((s) => s.selectedComponentIds);
  const selectedWireIds = useCircuitStore((s) => s.selectedWireIds);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const components = useCircuitStore((s) => s.components);
  const wires = useCircuitStore((s) => s.wires);

  const [projectName, setProjectName] = useState('Kitchen Lighting & Sockets');
  const [isEditing, setIsEditing] = useState(false);
  const [showVoltagePicker, setShowVoltagePicker] = useState(false);
  const [customVoltInput, setCustomVoltInput] = useState(globalVoltage.toString());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomVoltInput(globalVoltage.toString());
  }, [globalVoltage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowVoltagePicker(false);
      }
    };
    if (showVoltagePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVoltagePicker]);

  const handleApplyCustomVoltage = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number.parseFloat(customVoltInput);
    if (!Number.isNaN(num) && num > 0) {
      setGlobalSupplyVoltage(num);
      setShowVoltagePicker(false);
    }
  };

  const effectiveVoltage = simResult?.supplyVoltage ?? globalVoltage;
  const isAc = effectiveVoltage > 48;

  // Selected item calculations
  const totalSelectedCount =
    (selectedComponentIds.length > 0 ? selectedComponentIds.length : selectedId ? 1 : 0) +
    selectedWireIds.length;

  const singleCompId =
    selectedId ?? (selectedComponentIds.length === 1 ? selectedComponentIds[0] : null);
  const selectedComponent = singleCompId ? components.find((c) => c.id === singleCompId) : null;

  const singleWireId = selectedWireIds.length === 1 ? selectedWireIds[0] : null;
  const selectedWire = singleWireId ? wires.find((w) => w.id === singleWireId) : null;

  const clearSelection = () => {
    useCircuitStore.getState().clearSelection();
  };

  const openInspector = (tab: 'properties' | 'connections' | 'simulation' = 'properties') => {
    useUiStore.getState().setInspectorCollapsed(false);
    useUiStore.getState().setActiveInspectorTab(tab);
  };

  return (
    <div className="absolute inset-x-0 top-12 z-20 flex items-center gap-2.5 border-b border-slate-200/80 bg-white/95 px-3 py-1.5 text-xs text-slate-700 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl transition-all duration-200 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-300 dark:ring-slate-700/50 whitespace-nowrap overflow-x-auto">
      {/* Global Voltage Dropdown Picker */}
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowVoltagePicker(!showVoltagePicker)}
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Click to change Global Supply Voltage"
        >
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400" />
          <span className="text-slate-500 dark:text-slate-400">Supply:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {effectiveVoltage} V {isAc ? `${standard.frequencyHz} Hz` : 'DC'}
          </span>
          <ChevronDown
            className={`size-3 text-slate-400 transition-transform ${showVoltagePicker ? 'rotate-180' : ''}`}
          />
        </button>

        {showVoltagePicker && (
          <div className="absolute left-0 top-8 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-800 dark:border-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-1.5 text-xs">
                <Sliders className="size-3.5 text-amber-500" /> Global Supply Voltage
              </span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                {effectiveVoltage} V
              </span>
            </div>

            <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400">
              Select global supply voltage level. Synchronizes with real-time checks and load
              calculations.
            </div>

            {/* Voltage presets */}
            <div className="mb-3 grid grid-cols-3 gap-1">
              {VOLTAGE_PRESETS.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => {
                    setGlobalSupplyVoltage(preset.val);
                    setShowVoltagePicker(false);
                  }}
                  className={`rounded border px-2 py-1 font-mono text-[10px] font-bold transition ${
                    globalVoltage === preset.val
                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <form onSubmit={handleApplyCustomVoltage} className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="1000"
                value={customVoltInput}
                onChange={(e) => setCustomVoltInput(e.target.value)}
                placeholder="Custom Volts..."
                className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-500"
              >
                Apply
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      {/* COMBINED SELECTED ITEM SECTION */}
      {totalSelectedCount > 1 ? (
        <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-400/30 text-blue-700 dark:text-blue-300">
          <Layers className="size-3 text-blue-600 dark:text-blue-400" />
          <span className="font-bold">{totalSelectedCount} Selected</span>
          <span className="font-mono text-[10px] text-blue-600 dark:text-blue-300">
            ({selectedComponentIds.length} comps, {selectedWireIds.length} wires)
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-full p-0.5 hover:bg-blue-200/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 transition"
            title="Deselect"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : selectedComponent ? (
        (() => {
          const def = COMPONENT_DEFS[selectedComponent.type];
          const label = def?.label ?? selectedComponent.type;
          const isOn = selectedComponent.state.on === true;
          const isEnergized = simResult?.energizedComponents.has(selectedComponent.id) ?? false;
          return (
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-400/30 text-purple-700 dark:text-purple-300">
              <Sliders className="size-3 text-purple-600 dark:text-purple-400" />
              <span className="font-bold truncate max-w-[130px]">{label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono ${
                  isOn || isEnergized
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {isOn ? 'ON' : isEnergized ? 'ACTIVE' : 'IDLE'}
              </span>
              <button
                type="button"
                onClick={() => openInspector('properties')}
                className="flex items-center gap-0.5 text-[10px] font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                title="Inspect in side panel"
              >
                <span>Inspect</span>
                <ChevronRight className="size-3" />
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-full p-0.5 hover:bg-purple-200/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 transition"
                title="Deselect"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })()
      ) : selectedWire ? (
        (() => {
          const isEnergized = simResult?.energizedWires.has(selectedWire.id) ?? false;
          const length = selectedWire.lengthMeters ?? 10;
          const gauge = selectedWire.customCableMm2 ?? 2.5;
          return (
            <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-400/30 text-blue-700 dark:text-blue-300">
              <Route className="size-3 text-blue-600 dark:text-blue-400" />
              <span className="font-bold font-mono">Wire #{selectedWire.id.slice(0, 5)}</span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {length}m • {gauge}mm²
              </span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono ${
                  isEnergized
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : selectedWire.fault
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                      : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {isEnergized ? 'LIVE' : selectedWire.fault ? 'FAULT' : 'IDLE'}
              </span>
              <button
                type="button"
                onClick={() => openInspector('properties')}
                className="flex items-center gap-0.5 text-[10px] font-bold text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                title="Inspect in side panel"
              >
                <span>Inspect</span>
                <ChevronRight className="size-3" />
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-full p-0.5 hover:bg-blue-200/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 transition"
                title="Deselect"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })()
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400" />
            <span className="font-medium text-slate-500 dark:text-slate-400">System:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">TN-S</span>
          </div>

          <div className="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="font-medium text-slate-500 dark:text-slate-400">Project:</span>
            {isEditing ? (
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditing(false);
                }}
                className="rounded border border-blue-400 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-100"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="group flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>{projectName}</span>
                <Edit2 className="size-3 text-slate-400 opacity-60 group-hover:opacity-100" />
              </button>
            )}
          </div>
        </>
      )}

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      {isPro && (
        <>
          {/* Regulation template quick-switch (UK / US / EU) */}
          <StandardSelector />

          {/* Manual fault injection master toggle.
              Fault controls in the Inspector / right-click menu only render
              while this is armed. Student mode never shows it at all. */}
          <button
            type="button"
            onClick={() => setSetting('manualFaultInjection', !manualFaultInjection)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition ${
              faultsArmed
                ? 'border-red-300 bg-red-600 text-white hover:bg-red-500'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title={
              faultsArmed
                ? 'Manual fault injection ON — fault controls visible in Inspector & context menu'
                : 'Manual fault injection OFF — fault controls hidden in Inspector & context menu'
            }
            aria-pressed={faultsArmed}
          >
            <Bug className="size-3.5" />
            <span className="hidden sm:inline">Faults</span>
            <span
              className={`flex h-3.5 w-6 items-center rounded-full p-0.5 transition ${
                faultsArmed ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`size-2.5 rounded-full bg-white transition-transform ${
                  faultsArmed ? 'translate-x-2.5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
        </>
      )}

      {/* Simulation Running status indicator */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-slate-500 dark:text-slate-400">Sim:</span>
        <span
          className={`flex items-center gap-1 font-semibold ${
            simRunning
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {simRunning ? 'Running' : 'Paused'}
          <span
            className={`size-2 rounded-full ${
              simRunning ? 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400' : 'bg-slate-400'
            }`}
          />
        </span>
      </div>
    </div>
  );
}
