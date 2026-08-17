/**
 * CommandPalette — Workbench experiment (Ctrl+K).
 *
 * Progressive enhancement on top of the existing stores/actions. No new
 * state; it just dispatches the same actions the toolbar/panels already use.
 * If a command isn't applicable (e.g. no selected component to copy), the
 * action simply no-ops like it does elsewhere.
 */

import {
  BookOpen,
  Copy,
  Download,
  FlaskConical,
  Grid,
  Layers,
  Maximize2,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COMPONENT_DEFS } from '../../domain';
import { useCircuitStore, useClipboardStore, useUiStore, useViewportStore } from '../../store';
import { useSettingsStore } from '../../store/settingsStore';
import { requestDeleteSelection } from '../canvas-actions';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Search;
  run: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      // Focus after the overlay paints so the search box is ready to type.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const ui = useUiStore.getState;
    const add = (type: string) => {
      ui().setPlacingType(useUiStore.getState().placingType === type ? null : type);
      setOpen(false);
    };
    const base: Command[] = [
      {
        id: 'run-sim',
        label: 'Run Simulation',
        hint: 'Start live circuit simulation',
        icon: Play,
        keywords: 'start play live energize',
        run: () => {
          ui().toggleSim();
          setOpen(false);
        },
      },
      {
        id: 'fault-lab',
        label: 'Open Fault Lab',
        hint: 'Arm manual fault injection & open telemetry',
        icon: FlaskConical,
        keywords: 'fault short open circuit injection',
        run: () => {
          const ui = useUiStore.getState();
          ui.setFaultLabOpen(true);
          ui.addLog('Fault Lab opened — manual fault controls armed.', 'info');
          setOpen(false);
        },
      },
      {
        id: 'validate',
        label: 'Run Circuit Validation',
        hint: 'BS 7671 safety & compliance check',
        icon: ShieldCheck,
        keywords: 'safety check compliance bs7671 validate',
        run: () => {
          ui().runCircuitValidation();
          setOpen(false);
        },
      },
      {
        id: 'zoom-fit',
        label: 'Zoom to Fit',
        hint: 'Frame all components (F)',
        icon: Maximize2,
        keywords: 'fit frame center view',
        run: () => {
          const el = document.querySelector('[data-circuit-canvas]') as HTMLElement | null;
          const rect = el?.getBoundingClientRect();
          if (rect) {
            useViewportStore
              .getState()
              .zoomToFit(
                { width: rect.width, height: rect.height },
                useCircuitStore.getState().components,
              );
          }
          setOpen(false);
        },
      },
      {
        id: 'toggle-grid',
        label: 'Toggle Grid',
        hint: 'Show / hide the canvas dot grid',
        icon: Grid,
        keywords: 'grid dots canvas show hide',
        run: () => {
          useSettingsStore.getState().setSetting('showGrid', !useSettingsStore.getState().showGrid);
          setOpen(false);
        },
      },
      {
        id: 'copy',
        label: 'Copy Selection',
        hint: 'Copy selected components (Ctrl+C)',
        icon: Copy,
        keywords: 'duplicate clipboard',
        run: () => {
          const ids = useCircuitStore.getState().selectedComponentIds;
          if (ids.length === 0) return;
          const allComps = useCircuitStore.getState().components;
          useClipboardStore.getState().copy(allComps.filter((c) => ids.includes(c.id)));
          setOpen(false);
        },
      },
      {
        id: 'delete',
        label: 'Delete Selection',
        hint: 'Remove selected component(s) / wire(s)',
        icon: Copy,
        keywords: 'remove clear',
        run: () => {
          requestDeleteSelection();
          setOpen(false);
        },
      },
      {
        id: 'export',
        label: 'Import / Export',
        hint: 'JSON, SVG, PNG & share URL',
        icon: Download,
        keywords: 'json svg png save load import export',
        run: () => {
          ui().setImportExportOpen(true);
          setOpen(false);
        },
      },
      {
        id: 'docs',
        label: 'Documentation',
        hint: 'Open in-app guide',
        icon: BookOpen,
        keywords: 'help guide docs manual',
        run: () => {
          ui().setDocsOpen(true);
          setOpen(false);
        },
      },
      {
        id: 'settings',
        label: 'Settings',
        hint: 'Open preferences',
        icon: Settings,
        keywords: 'preferences options',
        run: () => {
          ui().setSettingsOpen(true);
          setOpen(false);
        },
      },
    ];

    // Add frequently used components (a small subset to keep the list scannable).
    const quickTypes = [
      'mcb',
      'rcd',
      'single-way-switch',
      'socket-3pin',
      'bulb',
      'led-downlight',
      'ceiling-fan',
      'push-button',
      'isolator-switch',
    ];
    for (const t of quickTypes) {
      const def = COMPONENT_DEFS[t];
      if (!def) continue;
      base.push({
        id: `add-${t}`,
        label: `Add ${def.label}`,
        hint: 'Place on canvas',
        icon: Layers,
        keywords: `add place ${def.label} ${t}`,
        run: () => add(t),
      });
    }
    return base;
  }, [setOpen]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? commands.filter(
        (c) => c.label.toLowerCase().includes(q) || (c.keywords ?? '').toLowerCase().includes(q),
      )
    : commands;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] bg-slate-900/30 backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <dialog
        open
        className="m-0 w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-700/50"
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search className="size-4 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to do?"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const first = filtered[0];
                if (first) first.run();
              }
            }}
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            Esc
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-slate-400">
              No commands match &ldquo;{query}&rdquo;
            </div>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={c.run}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              <c.icon className="size-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {c.label}
              </span>
              {c.hint && <span className="text-[11px] text-slate-400">{c.hint}</span>}
            </button>
          ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 dark:border-slate-800">
          <Zap className="mr-1 inline size-3 text-amber-400" />
          Enter to run · Esc to close
        </div>
      </dialog>
    </div>
  );
}
