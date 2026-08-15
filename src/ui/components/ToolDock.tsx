/**
 * ToolDock — bottom-right cluster of canvas tools.
 *
 * Phase 6.1: zoom buttons now drive `viewportStore` and work in both
 * SVG (CPU) and Pixi (GPU) modes. Delete routes through the
 * confirmation flow when the setting is on.
 */

import {
  Eye,
  Maximize2,
  MousePointer2,
  Pen,
  Plus,
  Route,
  ScanSearch,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { InteractionMode } from '../../domain';
import { useCircuitStore, useSettingsStore, useUiStore, useViewportStore } from '../../store';
import { requestDeleteSelection } from '../canvas-actions';
import { IconBtn } from './IconBtn';

interface Props {
  selectedId: string | null;
  mode: InteractionMode;
  consoleOffset?: 'none' | 'collapsed' | 'expanded';
}

export function ToolDock({ selectedId, mode, consoleOffset = 'none' }: Props) {
  const selectedWireId = useCircuitStore((s) => s.selectedWireIds[0] ?? null);
  const selectedComponentIds = useCircuitStore((s) => s.selectedComponentIds);
  const hasSelection = !!(selectedId || selectedWireId || selectedComponentIds.length > 0);
  const inspectorCollapsed = useUiStore((s) => s.inspectorCollapsed);
  const customWiringMode = useSettingsStore((s) => s.customWiringMode);
  const pendingCustomPath = useUiStore((s) => s.pendingCustomPath);
  const simRunning = useUiStore((s) => s.simRunning);
  const tracePathMode = useUiStore((s) => s.tracePathMode);
  const toggleTracePathMode = useUiStore((s) => s.toggleTracePathMode);

  const onDelete = () => requestDeleteSelection();

  // Expanded inspector real width = drawer (w-64 md:w-72 lg:w-80) + icon rail
  // (w-12); offsets add an 8 px gap so the panel never covers this control.
  const rightClass = inspectorCollapsed ? 'right-14' : 'right-78 md:right-86 lg:right-94';

  return (
    <div
      className={`absolute ${rightClass} z-10 flex flex-col gap-2 transition-all duration-150 ${
        consoleOffset === 'expanded'
          ? 'bottom-48'
          : consoleOffset === 'collapsed'
            ? 'bottom-16'
            : 'bottom-4'
      }`}
    >
      <div className="flex items-center gap-1 rounded-full border border-white/80 bg-white/75 p-1 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:ring-slate-700/50">
        <IconBtn
          icon={MousePointer2}
          title="Select (V)"
          active={mode === 'idle'}
          onClick={() => useUiStore.getState().setMode('idle')}
        />
        <IconBtn
          icon={customWiringMode ? Pen : Plus}
          title={
            customWiringMode
              ? pendingCustomPath
                ? 'Custom wiring — click canvas to add corners, click port to finish (Esc to cancel)'
                : 'Custom wiring mode ON · click a port to start a polyline'
              : 'Wire mode (W) · click a port to start, click another to connect'
          }
          active={mode === 'wiring'}
          onClick={() => {
            if (pendingCustomPath) {
              useUiStore.getState().cancelCustomPath();
            } else if (mode === 'wiring') {
              const ui = useUiStore.getState();
              ui.setPendingWireFrom(null);
              ui.setMode('idle');
            } else {
              useUiStore.getState().setMode('wiring');
            }
          }}
        />
        <IconBtn
          icon={Eye}
          title={
            tracePathMode
              ? 'Trace Circuit Path: ACTIVE (click to turn off)'
              : 'Trace Circuit Path: OFF (click to highlight selected wire path)'
          }
          active={tracePathMode}
          onClick={toggleTracePathMode}
        />
        <IconBtn
          icon={Trash2}
          title={simRunning ? 'Cannot delete while simulation is running' : 'Delete selected (Del)'}
          disabled={!hasSelection || simRunning}
          onClick={onDelete}
        />
      </div>
      <div className="flex items-center gap-1 rounded-full border border-white/80 bg-white/75 p-1 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:ring-slate-700/50">
        <IconBtn
          icon={ZoomOut}
          title="Zoom out"
          onClick={() => useViewportStore.getState().zoomBy(1 / 1.25)}
        />
        <IconBtn
          icon={ZoomIn}
          title="Zoom in"
          onClick={() => useViewportStore.getState().zoomBy(1.25)}
        />
        <IconBtn
          icon={Maximize2}
          title="Reset view (1:1)"
          onClick={() => useViewportStore.getState().resetView()}
        />
        <IconBtn
          icon={ScanSearch}
          title="Zoom to fit all (F)"
          onClick={() => {
            const el = document.querySelector('[data-circuit-canvas]') as HTMLElement | null;
            const rect = el?.getBoundingClientRect();
            if (!rect) return;
            useViewportStore
              .getState()
              .zoomToFit(
                { width: rect.width, height: rect.height },
                useCircuitStore.getState().components,
              );
          }}
        />
      </div>
    </div>
  );
}
