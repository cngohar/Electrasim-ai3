/**
 * ContextMenu — Phase 6.5.2 right-click context menu.
 *
 * Positioned at the cursor, shows context-sensitive items depending on
 * whether the user right-clicked a component, a wire, or the empty canvas.
 *
 * Shared items (always visible): Documentation, Import/Export, Settings.
 * Component items: Toggle (switches only), Inspect, Delete.
 * Wire items: Reroute, Delete.
 * Canvas items: Paste (placeholder for Phase 6.2).
 */

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { setMomentarySwitchState, useUiStore } from '../../store';
import { type MenuEntry, buildItems, isSeparator } from './contextMenuItems';

export function ContextMenu() {
  const contextMenu = useUiStore((s) => s.contextMenu);
  const ref = useRef<HTMLDivElement>(null);
  const activeMomentaryId = useRef<string | null>(null);

  useEffect(() => {
    if (contextMenu || !activeMomentaryId.current) return;
    setMomentarySwitchState(activeMomentaryId.current, false);
    activeMomentaryId.current = null;
  }, [contextMenu]);

  useEffect(
    () => () => {
      if (!activeMomentaryId.current) return;
      setMomentarySwitchState(activeMomentaryId.current, false);
      activeMomentaryId.current = null;
    },
    [],
  );

  // Close on any click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        useUiStore.getState().setContextMenu(null);
      }
    };
    // Use capture so we catch clicks before they propagate
    window.addEventListener('mousedown', handler, true);
    return () => window.removeEventListener('mousedown', handler, true);
  }, [contextMenu]);

  // Reposition to stay within viewport
  useEffect(() => {
    if (!contextMenu || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) {
      el.style.left = `${contextMenu.x - rect.width}px`;
    }
    if (rect.bottom > vh) {
      el.style.top = `${contextMenu.y - rect.height}px`;
    }
  }, [contextMenu]);

  if (!contextMenu) return null;

  const items = buildItems(contextMenu.target);

  return (
    <div
      ref={ref}
      className="fixed z-[60] min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white/95 py-1 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {items.map((entry, i) => {
        if (isSeparator(entry)) {
          return <div key={`sep-${i}`} className="my-1 h-px bg-slate-100 dark:bg-slate-700" />;
        }
        const Icon = entry.icon;
        return (
          <button
            key={`item-${i}`}
            type="button"
            disabled={entry.disabled}
            onClick={(event) => {
              if (entry.momentaryId) {
                event.preventDefault();
                return;
              }
              entry.action();
            }}
            onPointerDown={(event) => {
              if (!entry.momentaryId || event.button > 0) return;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              activeMomentaryId.current = entry.momentaryId;
              setMomentarySwitchState(entry.momentaryId, true);
            }}
            onPointerUp={() => {
              if (!entry.momentaryId) return;
              setMomentarySwitchState(entry.momentaryId, false);
              activeMomentaryId.current = null;
              entry.action();
            }}
            onPointerCancel={() => {
              if (!entry.momentaryId) return;
              setMomentarySwitchState(entry.momentaryId, false);
              activeMomentaryId.current = null;
            }}
            onLostPointerCapture={() => {
              if (!entry.momentaryId) return;
              setMomentarySwitchState(entry.momentaryId, false);
              activeMomentaryId.current = null;
            }}
            onKeyDown={(event) => {
              if (
                !entry.momentaryId ||
                (event.key !== 'Enter' && event.key !== ' ') ||
                event.repeat
              ) {
                return;
              }
              event.preventDefault();
              activeMomentaryId.current = entry.momentaryId;
              setMomentarySwitchState(entry.momentaryId, true);
            }}
            onKeyUp={(event) => {
              if (!entry.momentaryId || (event.key !== 'Enter' && event.key !== ' ')) return;
              event.preventDefault();
              setMomentarySwitchState(entry.momentaryId, false);
              activeMomentaryId.current = null;
              entry.action();
            }}
            onBlur={() => {
              if (!entry.momentaryId) return;
              setMomentarySwitchState(entry.momentaryId, false);
              activeMomentaryId.current = null;
            }}
            className={[
              'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs transition',
              entry.danger
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                : entry.disabled
                  ? 'cursor-default text-slate-300 dark:text-slate-600'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-950/50 dark:hover:text-blue-300',
            ].join(' ')}
          >
            <Icon
              className={`size-3.5 flex-shrink-0 ${entry.danger ? 'text-red-400' : 'text-slate-400 dark:text-slate-500'}`}
            />
            <span className="flex-1 font-medium">{entry.label}</span>
            {entry.shortcut && (
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                {entry.shortcut}
              </kbd>
            )}
          </button>
        );
      })}
    </div>
  );
}
