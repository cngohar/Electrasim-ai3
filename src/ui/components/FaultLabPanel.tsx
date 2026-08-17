/**
 * FaultLabPanel — Workbench experiment: a dedicated, grouped fault-injection
 * panel (the "Fault Lab" mode).
 *
 * It reuses the exact same circuit-store fault actions that the right-click
 * context menu uses (`setComponentFault` / `clearAllFaults`). No new fault
 * behaviour is invented; this is purely a more discoverable, scannable
 * surface. It operates on the currently selected component.
 */

import {
  AlertTriangle,
  Eraser,
  Flame,
  FlaskConical,
  Link2Off,
  Scissors,
  ShieldCheck,
  Sliders,
  Unlink,
  Waves,
  Zap,
} from 'lucide-react';
import type { FaultType } from '../../domain';
import { COMPONENT_DEFS } from '../../domain';
import { useCircuitStore, useSettingsStore, useUiStore } from '../../store';

interface FaultDef {
  type: FaultType;
  label: string;
  hint?: string;
  icon: typeof Scissors;
  scope?: 'switch' | 'protection';
}

const FAULTS: FaultDef[] = [
  { type: 'open-circuit', label: 'Open Circuit', hint: 'Break a conductor', icon: Scissors },
  { type: 'short-circuit', label: 'Short Circuit', hint: 'L–N bolted fault', icon: Zap },
  { type: 'reverse-polarity', label: 'Reverse Polarity', hint: 'L↔N swap', icon: Link2Off },
  { type: 'earth-fault', label: 'Earth Fault', hint: 'Live-to-earth leakage', icon: Unlink },
  {
    type: 'switched-neutral',
    label: 'Switched Neutral',
    hint: 'Neutral through switch',
    icon: AlertTriangle,
    scope: 'switch',
  },
  { type: 'smooth-dc-residual', label: 'Smooth DC', hint: 'EV/PV — blinds RCD', icon: Waves },
  { type: 'arc-fault', label: 'Arc Fault', hint: 'Only AFDD detects', icon: Flame },
  {
    type: 'protection-bypass',
    label: 'Bypass Breaker',
    hint: 'Bridged protection',
    icon: ShieldCheck,
    scope: 'protection',
  },
  {
    type: 'protection-forced-open',
    label: 'Jam Breaker',
    hint: 'Stuck open',
    icon: Sliders,
    scope: 'protection',
  },
];

export function FaultLabPanel() {
  const open = useUiStore((s) => s.faultLabOpen);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const components = useCircuitStore((s) => s.components);
  const appMode = useSettingsStore((s) => s.appMode);
  const isPro = appMode === 'pro';

  // Fault injection is a Pro-mode feature; never surface the panel in Student mode.
  if (!open || !isPro) return null;

  const selected = selectedId ? (components.find((c) => c.id === selectedId) ?? null) : null;
  const def = selected ? COMPONENT_DEFS[selected.type] : null;
  const selectedFault = selected?.state?.fault ?? null;
  const isSwitch = def?.isSwitch ?? false;
  const isProtection = def?.isProtection ?? false;

  const inject = (type: FaultType) => {
    if (!selected) return;
    useCircuitStore.getState().setComponentFault(selected.id, type);
    useUiStore
      .getState()
      .addLog(`Fault Lab: injected ${type} on ${def?.label ?? selected.type}`, 'warning');
  };

  const clearSelectionFault = () => {
    if (!selected) return;
    useCircuitStore.getState().setComponentFault(selected.id, undefined);
    useUiStore
      .getState()
      .addLog(`Fault Lab: cleared fault on ${def?.label ?? selected.type}`, 'success');
  };

  const clearAll = () => {
    useCircuitStore.getState().clearAllFaults();
    useUiStore.getState().addLog('Fault Lab: cleared all injected faults.', 'success');
  };

  // Visible faults, filtered by component capability (switch/protection-only).
  const visibleFaults = FAULTS.filter((f) => {
    if (f.scope === 'switch') return isSwitch;
    if (f.scope === 'protection') return isProtection;
    return true;
  });

  return (
    <div
      aria-label="Fault Lab panel"
      className="absolute left-[17.25rem] top-24 z-20 w-[290px] overflow-hidden rounded-2xl border border-amber-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-amber-500/20 backdrop-blur-xl dark:border-amber-900/60 dark:bg-slate-900/95 dark:ring-amber-500/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-100 bg-amber-50/70 px-3.5 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/40">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-lg bg-amber-500 text-white shadow-sm shadow-amber-500/30">
            <FlaskConical className="size-3.5" />
          </span>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Fault Lab</div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isPro ? 'Pro · Manual injection' : 'Select a component to arm'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clearAll}
          title="Clear all injected faults"
          className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-amber-950/60"
        >
          <Eraser className="size-3" />
          Clear all
        </button>
      </div>

      {/* Target */}
      <div className="border-b border-slate-100 px-3.5 py-2 dark:border-slate-800">
        {selected ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Target
            </span>
            <span className="truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {def?.label ?? selected.type}
            </span>
            {selectedFault && (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-950/60 dark:text-red-300">
                {selectedFault}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <AlertTriangle className="size-3.5 text-amber-500" />
            Select a component on the canvas to target it with a fault.
          </div>
        )}
      </div>

      {/* Fault grid */}
      <div className="max-h-[40vh] overflow-y-auto p-3">
        {visibleFaults.length === 0 && (
          <p className="py-2 text-center text-[11px] text-slate-400">
            No faults apply to the selected component.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {visibleFaults.map((f) => {
            const isActive = selectedFault === f.type;
            return (
              <button
                key={f.type}
                type="button"
                disabled={!selected}
                title={selected ? f.hint : 'Select a component first'}
                onClick={() => inject(f.type)}
                className={[
                  'flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-[10px] font-semibold shadow-sm transition',
                  isActive
                    ? 'border-red-300 bg-red-50 text-red-700 ring-1 ring-red-200 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300'
                    : selected
                      ? 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-600 dark:hover:bg-amber-950/40'
                      : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-600',
                ].join(' ')}
              >
                <f.icon className="size-4" />
                {f.label}
              </button>
            );
          })}
        </div>
        {selected && selectedFault && (
          <button
            type="button"
            onClick={clearSelectionFault}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <ShieldCheck className="size-3.5" />
            Clear fault on selection
          </button>
        )}
      </div>
    </div>
  );
}
