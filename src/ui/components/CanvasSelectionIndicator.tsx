import {
  Activity,
  ArrowRightLeft,
  ChevronRight,
  Layers,
  MousePointerClick,
  Route,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import { COMPONENT_DEFS } from '../../domain/components';
import { useCircuitStore, useUiStore } from '../../store';

export function CanvasSelectionIndicator() {
  const selectedComponentIds = useCircuitStore((s) => s.selectedComponentIds);
  const selectedWireIds = useCircuitStore((s) => s.selectedWireIds);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const components = useCircuitStore((s) => s.components);
  const wires = useCircuitStore((s) => s.wires);
  const simResult = useUiStore((s) => s.simResult);
  const paletteOpen = useUiStore((s) => s.paletteOpen);

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

  // Position nicely based on palette open state
  const leftPosition = paletteOpen ? 'left-4 md:left-68' : 'left-4';

  if (totalSelectedCount === 0) {
    return (
      <div
        className={`absolute top-24 ${leftPosition} z-10 hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-md backdrop-blur-md transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-400 select-none pointer-events-auto`}
      >
        <span className="size-2 rounded-full bg-slate-400 animate-pulse" />
        <span className="font-bold text-slate-700 dark:text-slate-300">Canvas Ready</span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          Click item to inspect
        </span>
      </div>
    );
  }

  // Multi-selection state
  if (totalSelectedCount > 1) {
    const compCount = selectedComponentIds.length;
    const wireCount = selectedWireIds.length;

    return (
      <div
        className={`absolute top-24 ${leftPosition} z-10 flex items-center gap-2.5 rounded-full border border-blue-300/80 bg-white/95 px-3.5 py-1.5 text-xs shadow-lg backdrop-blur-xl transition-all duration-200 dark:border-blue-700/60 dark:bg-slate-900/95 select-none pointer-events-auto`}
      >
        <div className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xs">
          <Layers className="size-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-blue-700 dark:text-blue-300">
            Multi-Select Active ({totalSelectedCount})
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 font-mono">
            {compCount > 0 && `${compCount} comp${compCount > 1 ? 's' : ''}`}
            {compCount > 0 && wireCount > 0 && ', '}
            {wireCount > 0 && `${wireCount} wire${wireCount > 1 ? 's' : ''}`}
          </span>
        </div>

        <button
          type="button"
          onClick={clearSelection}
          className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          title="Clear Selection"
          aria-label="Clear Selection"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  // Single Component Selected
  if (selectedComponent) {
    const def = COMPONENT_DEFS[selectedComponent.type];
    const label = def?.label ?? selectedComponent.type;
    const isOn = selectedComponent.state.on === true;

    return (
      <div
        className={`absolute top-24 ${leftPosition} z-10 flex items-center gap-2.5 rounded-full border border-purple-300/80 bg-white/95 px-3.5 py-1.5 text-xs shadow-lg backdrop-blur-xl transition-all duration-200 dark:border-purple-700/60 dark:bg-slate-900/95 select-none pointer-events-auto`}
      >
        <div className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xs">
          <Sliders className="size-3" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="font-bold text-purple-700 dark:text-purple-300">
              Component Selected
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{label}</span>
          </div>

          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase font-mono ${
              isOn
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isOn ? 'ACTIVE' : 'IDLE'}
          </span>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-200/80 pl-2 dark:border-slate-800">
          <button
            type="button"
            onClick={() => openInspector('properties')}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition"
            title="Inspect Component"
          >
            <span>Inspect</span>
            <ChevronRight className="size-3" />
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            title="Clear Selection"
            aria-label="Clear Selection"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Single Wire Selected
  if (selectedWire) {
    const isEnergized = simResult?.energizedWires.has(selectedWire.id) ?? false;
    const length = selectedWire.lengthMeters ?? 10;
    const gauge = selectedWire.customCableMm2 ?? 2.5;
    const pathKind = selectedWire.pathKind ?? 'orthogonal';
    const statusLabel = isEnergized
      ? 'ENERGIZED'
      : selectedWire.fault
        ? `FAULT: ${selectedWire.fault.toUpperCase()}`
        : 'IDLE';

    return (
      <div
        className={`absolute top-24 ${leftPosition} z-10 flex items-center gap-2.5 rounded-full border border-blue-300/80 bg-white/95 px-3.5 py-1.5 text-xs shadow-lg backdrop-blur-xl transition-all duration-200 dark:border-blue-700/60 dark:bg-slate-900/95 select-none pointer-events-auto`}
      >
        <div className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xs">
          <Route className="size-3" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-blue-700 dark:text-blue-300">Wire Selected</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
              #{selectedWire.id.slice(0, 6)} ({length}m, {gauge}mm², {pathKind})
            </span>
          </div>

          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase font-mono ${
              isEnergized
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : selectedWire.fault
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-200/80 pl-2 dark:border-slate-800">
          <button
            type="button"
            onClick={() => openInspector('properties')}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
            title="Inspect Wire Properties"
          >
            <span>Inspect</span>
            <ChevronRight className="size-3" />
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            title="Clear Selection"
            aria-label="Clear Selection"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
