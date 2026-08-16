/**
 * StandardSelector — quick-switch UK / US / EU regulation template control.
 *
 * Renders as a compact segmented pill used in the SubHeaderBar (Pro mode).
 * Selecting a template:
 *   - updates `regulationStandard` in the settings store (persisted),
 *   - applies that standard's nominal voltage as the global supply voltage,
 *   - re-runs validation so any new compliance violations surface at once.
 *
 * Pro Mode only — the caller decides whether to render it. The component
 * itself is presentational and safe to mount anywhere.
 */

import { ChevronDown, Globe, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { STANDARD_LIST, type StandardId, getStandard } from '../../domain/standards';
import { useCircuitStore, useSettingsStore, useUiStore } from '../../store';

interface Props {
  /** Compact variant drops the citation text (used on narrow widths). */
  compact?: boolean;
}

export function StandardSelector({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const regulationStandard = useSettingsStore((s) => s.regulationStandard);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const setGlobalSupplyVoltage = useCircuitStore((s) => s.setGlobalSupplyVoltage);
  const runCircuitValidation = useUiStore((s) => s.runCircuitValidation);
  const addLog = useUiStore((s) => s.addLog);

  const current = getStandard(regulationStandard);

  // Close the popover on outside-click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const applyStandard = (id: StandardId) => {
    const preset = getStandard(id);
    setSetting('regulationStandard', id);
    setGlobalSupplyVoltage(preset.nominalVoltage);
    setOpen(false);
    addLog(
      `Regulation template set to ${preset.flag} ${preset.label} (${preset.citation}) — ${preset.nominalVoltage} V / ${preset.frequencyHz} Hz.`,
      'info',
    );
    // Re-validate so newly applicable rules (drop %, RCD, MCB curve) flag up.
    setTimeout(() => runCircuitValidation(), 0);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        data-standard-selector
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
        title={`Regulation template: ${current.citation}. Click to switch UK / US / EU.`}
        aria-label={`Regulation template: ${current.shortLabel}. Click to switch UK / US / EU.`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="size-3.5" />
        <span className="font-mono">{current.flag}</span>
        {!compact && <span className="hidden md:inline">{current.shortLabel}</span>}
        <ChevronDown
          className={`size-3 text-indigo-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          tabIndex={-1}
          className="absolute left-0 top-9 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-1.5 flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Regulation Template
          </div>
          {STANDARD_LIST.map((s) => {
            const selected = s.id === regulationStandard;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                onClick={() => applyStandard(s.id)}
                className={`mb-1 flex w-full items-start gap-2.5 rounded-lg border p-2 text-left transition last:mb-0 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/50'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base leading-none">{s.flag}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {s.label}
                    </span>
                    {selected && (
                      <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                    {s.citation}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1 font-mono text-[9px] text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                      {s.nominalVoltage}V
                    </span>
                    <span className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                      {s.frequencyHz}Hz
                    </span>
                    <span className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                      ΔU ≤ {s.voltageDrop.lightingPercent}/{s.voltageDrop.powerPercent}%
                    </span>
                    <span className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                      {s.rcdThresholdMa}mA RCD
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
          <p className="mt-1.5 border-t border-slate-200 pt-1.5 text-[9px] leading-snug text-slate-400 dark:border-slate-800">
            Switching updates supply voltage, conductor colours and the rule set used by the
            compliance checker. Simulation is blocked while any error-level violation is open.
          </p>
        </div>
      )}
    </div>
  );
}
