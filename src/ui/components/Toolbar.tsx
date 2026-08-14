/**
 * Toolbar — the floating top capsule. Holds the brand mark, undo/redo,
 * simulation controls, and the settings entry-point.
 */

import {
  BookOpen,
  FlaskConical,
  GraduationCap,
  Moon,
  OctagonAlert,
  Play,
  Redo2,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
  Undo2,
  Wrench,
  Zap,
} from 'lucide-react';
import { redo, undo, useUiStore } from '../../store';
import { useSettingsStore } from '../../store/settingsStore';
import { clearAll, seedStress } from '../../store/stress';
import { useResolvedTheme } from '../hooks/useResolvedTheme';
import { IconBtn } from './IconBtn';

interface Props {
  isPhone: boolean;
  simRunning: boolean;
  dashboardOpen?: boolean;
  onToggleDashboard?: () => void;
}

export function Toolbar({ isPhone, simRunning, dashboardOpen, onToggleDashboard }: Props) {
  const appMode = useSettingsStore((s) => s.appMode);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const simResult = useUiStore((s) => s.simResult);

  // Check if circuit has tripped or blown components blocking simulation
  const hasTrippedComponents =
    simResult?.trippedComponents && simResult.trippedComponents.length > 0;
  const hasBlownComponents = simResult?.blownComponents && simResult.blownComponents.length > 0;
  const hasBustedWires = simResult?.bustedWires && simResult.bustedWires.size > 0;
  const isBlocked = !simRunning && (hasTrippedComponents || hasBlownComponents || hasBustedWires);

  return (
    <header
      className={[
        'absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur-xl backdrop-saturate-150 dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-900/30 dark:ring-slate-700/50',
        isPhone ? 'w-[92%] justify-between' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 pr-2">
        <div className="grid size-7 place-items-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/30">
          <Zap className="size-3.5" strokeWidth={3} />
        </div>
        {!isPhone && (
          <div>
            <div className="text-[13px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              ElectraSim
            </div>
            <div className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
              Interactive Wiring Lab
            </div>
          </div>
        )}
      </div>
      <Sep />
      <IconBtn icon={Undo2} title="Undo (Ctrl+Z)" onClick={undo} />
      <IconBtn icon={Redo2} title="Redo (Ctrl+Shift+Z)" onClick={redo} />
      {!isPhone && <Sep />}
      <button
        type="button"
        onClick={() => useUiStore.getState().setTemplatesOpen(true)}
        title="Guided circuits"
        className={[
          'flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm shadow-blue-600/5 transition hover:border-blue-200 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/70',
          isPhone ? 'px-2.5' : '',
        ].join(' ')}
      >
        <BookOpen className="size-3.5" />
        {!isPhone && 'Guides'}
      </button>
      <button
        type="button"
        onClick={() => {
          const nextMode = appMode === 'basic' ? 'pro' : 'basic';
          setSetting('appMode', nextMode);
          if (nextMode === 'basic' && dashboardOpen) {
            onToggleDashboard?.();
          }
          useUiStore
            .getState()
            .addLog(
              nextMode === 'pro'
                ? 'Switched to Pro Electrician Mode — cable sizing, BS 7671 calculations & commercial components unlocked.'
                : 'Switched to Basic Student Mode — simplified domestic wiring view.',
              'info',
            );
        }}
        title={
          appMode === 'basic'
            ? 'Basic Student Mode active — click to switch to Pro Electrician Mode'
            : 'Pro Electrician Mode active — click to switch to Basic Student Mode'
        }
        className={[
          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition',
          appMode === 'basic'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
          isPhone ? 'px-2' : '',
        ].join(' ')}
      >
        {appMode === 'basic' ? (
          <GraduationCap className="size-3.5" />
        ) : (
          <Wrench className="size-3.5" />
        )}
        {!isPhone && (appMode === 'basic' ? 'Student' : 'Pro')}
      </button>

      {appMode === 'pro' && !isPhone && (
        <button
          type="button"
          onClick={() => {
            useUiStore.getState().setInspectorCollapsed(false);
            useUiStore.getState().setActiveInspectorTab('analytics');
            onToggleDashboard?.();
          }}
          title="Toggle circuit diagnostics, analysis & waveforms"
          className={[
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition',
            dashboardOpen
              ? 'border-blue-500 bg-blue-600 text-white shadow-blue-500/20'
              : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
          ].join(' ')}
        >
          <Sparkles className="size-3.5" />
          Analyze Circuit
        </button>
      )}
      <button
        type="button"
        onClick={() => useUiStore.getState().runCircuitValidation()}
        title="Validate circuit for design flaws & BS 7671 compliance"
        className={[
          'flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70',
          isPhone ? 'px-2' : '',
        ].join(' ')}
      >
        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        {!isPhone && 'Validate'}
      </button>

      <button
        type="button"
        onClick={() => !isBlocked && useUiStore.getState().toggleSim()}
        disabled={isBlocked}
        className={[
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition',
          isBlocked
            ? 'bg-red-600 text-white cursor-not-allowed animate-pulse'
            : simRunning
              ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
              : 'bg-slate-900 text-white hover:bg-slate-800',
        ].join(' ')}
        title={
          isBlocked
            ? 'Circuit tripped or damaged - fix faults before resuming simulation'
            : undefined
        }
      >
        {isBlocked ? (
          <>
            <OctagonAlert className="size-3" />
            CIRCUIT TRIPPED
          </>
        ) : simRunning ? (
          <>
            <Square className="size-3" fill="currentColor" />
            Stop
          </>
        ) : (
          <>
            <Play className="size-3" fill="currentColor" />
            Run Simulation
          </>
        )}
      </button>
      {import.meta.env.DEV && !isPhone && (
        <button
          type="button"
          title="DEV: spawn 50 lamp branches (≈100 components, 150 wires). Shift-click to wipe + spawn 100. Alt-click to clear all."
          onClick={(e) => {
            if (e.altKey) {
              clearAll();
              useUiStore.getState().addLog('Cleared circuit.', 'info');
              return;
            }
            const branches = e.shiftKey ? 100 : 50;
            if (e.shiftKey) clearAll();
            const r = seedStress(branches);
            useUiStore
              .getState()
              .addLog(`Stress: +${r.components} components, +${r.wires} wires.`, 'info');
          }}
          className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm shadow-amber-500/20 transition hover:bg-amber-600"
        >
          <FlaskConical className="size-3" />
          Stress
        </button>
      )}
      <button
        type="button"
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        onClick={() => setSetting('colorScheme', isDark ? 'light' : 'dark')}
        className="flex size-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        {isDark ? (
          <Sun className="size-4 text-amber-400" />
        ) : (
          <Moon className="size-4 text-slate-600" />
        )}
      </button>
      <MenuTrigger />
    </header>
  );
}

function Sep() {
  return <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700" />;
}

/** MCB breaker-switch menu trigger — Phase 6.5. */
function MenuTrigger() {
  const menuOpen = useUiStore((s) => s.menuOpen);
  return (
    <button
      type="button"
      aria-label="Menu"
      onClick={() => useUiStore.getState().setMenuOpen(!menuOpen)}
      className="group relative grid size-9 place-items-center rounded-xl border border-slate-200/80 bg-white/80 shadow-md shadow-slate-900/5 backdrop-blur-xl transition hover:border-blue-300 hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-800/80 dark:hover:border-blue-500"
      title="Menu (Esc to close)"
    >
      {/* MCB breaker lever — rotates on toggle */}
      <div
        className={[
          'relative h-5 w-1.5 rounded-full transition-transform duration-300 ease-out',
          menuOpen
            ? 'rotate-[35deg] bg-red-500 shadow-sm shadow-red-400/40'
            : 'rotate-0 bg-blue-600 shadow-sm shadow-blue-600/30',
        ].join(' ')}
      >
        <div
          className={[
            'absolute -top-0.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full border-2 border-white transition-colors',
            menuOpen ? 'bg-red-500' : 'bg-blue-600',
          ].join(' ')}
        />
      </div>
      <span
        className={[
          'absolute bottom-1 right-1 size-1.5 rounded-full',
          menuOpen ? 'bg-red-400' : 'bg-emerald-400',
        ].join(' ')}
      />
    </button>
  );
}
