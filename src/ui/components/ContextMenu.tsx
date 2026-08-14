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

import {
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  Copy,
  Download,
  Flame,
  HelpCircle,
  Keyboard,
  MousePointerClick,
  Power,
  RefreshCcw,
  RotateCw,
  Route,
  Scissors,
  Settings,
  ShieldCheck,
  Sliders,
  Trash2,
  Unlink,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { COMPONENT_DEFS } from '../../domain';
import {
  type ContextMenuState,
  setMomentarySwitchState,
  useCircuitStore,
  useUiStore,
} from '../../store';
import {
  requestClearAll,
  requestClearWires,
  requestDeleteComponent,
  requestDeleteWire,
  requestReset,
} from '../canvas-actions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  action: () => void;
  danger?: boolean;
  disabled?: boolean;
  momentaryId?: string;
}

interface SeparatorItem {
  separator: true;
}

type MenuEntry = MenuItem | SeparatorItem;

function isSeparator(e: MenuEntry): e is SeparatorItem {
  return 'separator' in e;
}

// ─── Item builder ────────────────────────────────────────────────────────────

function buildItems(target: ContextMenuState['target']): MenuEntry[] {
  const items: MenuEntry[] = [];
  const close = () => useUiStore.getState().setContextMenu(null);
  const simRunning = useUiStore.getState().simRunning;

  // ── Cancel wiring (shown whenever a wire is in progress) ───────────────
  const ui = useUiStore.getState();
  const hasPendingWire = !!ui.pendingWireFrom || !!ui.pendingCustomPath;
  if (hasPendingWire) {
    items.push({
      icon: X,
      label: 'Cancel Wiring',
      shortcut: 'Esc',
      action: () => {
        const s = useUiStore.getState();
        if (s.pendingCustomPath) s.cancelCustomPath();
        s.setPendingWireFrom(null);
        s.setMode('idle');
        close();
      },
      danger: true,
    });
    items.push({ separator: true });
  }

  // ── Context-specific items ─────────────────────────────────────────────

  if (target.kind === 'component') {
    const comp = useCircuitStore.getState().components.find((c) => c.id === target.id);
    const def = comp ? COMPONENT_DEFS[comp.type] : null;

    items.push({
      icon: MousePointerClick,
      label: 'Select',
      action: () => {
        useCircuitStore.getState().selectComponent(target.id);
        close();
      },
    });

    if (def?.isSwitch) {
      const isOn = comp?.state.on === true;
      const nextChangeoverPort = def.changeover
        ? def.ports[isOn ? def.changeover.offPortIndex : def.changeover.onPortIndex]?.label
        : null;
      items.push({
        icon: Power,
        label: def.isMomentary
          ? isOn
            ? 'Release button'
            : 'Press and hold'
          : nextChangeoverPort
            ? `Switch to ${nextChangeoverPort}`
            : isOn
              ? 'Turn Off'
              : 'Turn On',
        momentaryId: def.isMomentary ? target.id : undefined,
        action: () => {
          if (!def.isMomentary) useCircuitStore.getState().toggleSwitch(target.id);
          close();
        },
      });
    }

    items.push({
      icon: Zap,
      label: 'Start Wire From Here',
      shortcut: 'W',
      action: () => {
        const compDef = comp ? COMPONENT_DEFS[comp.type] : null;
        if (compDef && compDef.ports.length > 0) {
          useUiStore.getState().setMode('wiring');
          useUiStore.getState().setPendingWireFrom({ componentId: target.id, portIndex: 0 });
        }
        close();
      },
    });

    const selectedComponentIds = useCircuitStore.getState().selectedComponentIds;
    const isMultiSelected =
      selectedComponentIds.length > 1 && selectedComponentIds.includes(target.id);
    const compGroup = useCircuitStore
      .getState()
      .componentGroups.find((g) => g.componentIds.includes(target.id));

    if (isMultiSelected) {
      items.push({
        icon: Copy,
        label: `Group Selected (${selectedComponentIds.length} components)`,
        shortcut: 'Ctrl+G',
        action: () => {
          useCircuitStore
            .getState()
            .createGroup(
              `Group ${useCircuitStore.getState().componentGroups.length + 1}`,
              selectedComponentIds,
            );
          useUiStore
            .getState()
            .addLog(`Grouped ${selectedComponentIds.length} components`, 'success');
          close();
        },
      });
      items.push({
        icon: RotateCw,
        label: 'Rotate All Selected 90°',
        shortcut: 'Shift+R',
        disabled: simRunning,
        action: () => {
          useCircuitStore.getState().rotateSelected(90);
          useUiStore
            .getState()
            .addLog(`Rotated ${selectedComponentIds.length} components 90°`, 'info');
          close();
        },
      });
      items.push({
        icon: Trash2,
        label: `Delete Selected (${selectedComponentIds.length} items)`,
        shortcut: 'Del',
        danger: true,
        disabled: simRunning,
        action: () => {
          useCircuitStore.getState().removeSelected();
          useUiStore.getState().addLog(`Deleted ${selectedComponentIds.length} components`, 'info');
          close();
        },
      });
      items.push({ separator: true });
    } else if (compGroup) {
      items.push({
        icon: Unlink,
        label: `Ungroup '${compGroup.name}'`,
        shortcut: 'Ctrl+Shift+G',
        action: () => {
          useCircuitStore.getState().ungroup(compGroup.id);
          useUiStore.getState().addLog(`Ungrouped '${compGroup.name}'`, 'info');
          close();
        },
      });
      items.push({ separator: true });
    }

    items.push({
      icon: RotateCw,
      label: 'Rotate 90°',
      shortcut: 'R / Shift+R',
      disabled: simRunning,
      action: () => {
        useCircuitStore.getState().rotateComponent(target.id, 90);
        useUiStore.getState().addLog(`Rotated ${def?.label ?? 'component'} 90°`, 'info');
        close();
      },
    });

    // ── Fault Simulation Injection ──────────────────────────────────
    items.push({ separator: true });

    if (comp?.state.fault) {
      items.push({
        icon: ShieldCheck,
        label: 'Clear Injected Fault',
        action: () => {
          useCircuitStore.getState().setComponentFault(target.id, undefined);
          useUiStore.getState().addLog(`Cleared fault on ${def?.label ?? 'component'}`, 'success');
          close();
        },
      });
    }

    items.push({
      icon: Scissors,
      label: 'Inject Open Circuit (Break)',
      disabled: comp?.state.fault === 'open-circuit',
      action: () => {
        useCircuitStore.getState().setComponentFault(target.id, 'open-circuit');
        useUiStore
          .getState()
          .addLog(`Injected Open Circuit fault on ${def?.label ?? 'component'}`, 'warning');
        close();
      },
    });

    items.push({
      icon: Flame,
      label: 'Inject Short Circuit',
      disabled: comp?.state.fault === 'short-circuit',
      action: () => {
        useCircuitStore.getState().setComponentFault(target.id, 'short-circuit');
        useUiStore
          .getState()
          .addLog(`Injected Short Circuit fault on ${def?.label ?? 'component'}`, 'error');
        close();
      },
    });

    items.push({
      icon: RefreshCcw,
      label: 'Inject Reverse Polarity',
      disabled: comp?.state.fault === 'reverse-polarity',
      action: () => {
        useCircuitStore.getState().setComponentFault(target.id, 'reverse-polarity');
        useUiStore
          .getState()
          .addLog(`Injected Reverse Polarity fault on ${def?.label ?? 'component'}`, 'warning');
        close();
      },
    });

    items.push({
      icon: Unlink,
      label: 'Inject Earth Fault',
      disabled: comp?.state.fault === 'earth-fault',
      action: () => {
        useCircuitStore.getState().setComponentFault(target.id, 'earth-fault');
        useUiStore
          .getState()
          .addLog(`Injected Earth Fault on ${def?.label ?? 'component'}`, 'warning');
        close();
      },
    });

    items.push({ separator: true });

    items.push({
      icon: Trash2,
      label: 'Delete Component',
      shortcut: 'Del',
      danger: true,
      disabled: simRunning,
      action: () => {
        requestDeleteComponent(target.id);
        close();
      },
    });
  }

  if (target.kind === 'wire') {
    const wire = useCircuitStore.getState().wires.find((w) => w.id === target.id);

    items.push({
      icon: Sliders,
      label: 'Inspect Wire Properties',
      action: () => {
        useCircuitStore.getState().selectWire(target.id);
        useCircuitStore.getState().selectComponent(null);
        useUiStore.getState().setInspectorCollapsed(false);
        close();
      },
    });

    items.push({
      icon: ArrowRightLeft,
      label: 'Swap From / To Terminals',
      action: () => {
        useCircuitStore.getState().swapWireEndpoints(target.id);
        useUiStore.getState().addLog('Reversed wire connection terminals', 'info');
        close();
      },
    });

    items.push({
      icon: Route,
      label: 'Reroute Wire',
      shortcut: 'R',
      action: () => {
        useCircuitStore.getState().selectWire(target.id);
        const ui = useUiStore.getState();
        ui.setMode('wiring');
        ui.setReroute({ wireId: target.id, end: 'to', source: 'armed' });
        ui.addLog('Reroute armed — click a port to reconnect.', 'info');
        close();
      },
    });

    // ── Wire Fault Simulation Options ─────────────────────────────
    items.push({ separator: true });

    if (wire?.fault) {
      items.push({
        icon: ShieldCheck,
        label: 'Clear Wire Fault',
        action: () => {
          useCircuitStore.getState().setWireFault(target.id, undefined);
          useUiStore.getState().addLog('Cleared fault from wire', 'success');
          close();
        },
      });
    }

    items.push({
      icon: Scissors,
      label: 'Inject Open Circuit (Break Wire)',
      disabled: wire?.fault === 'open-circuit',
      action: () => {
        useCircuitStore.getState().setWireFault(target.id, 'open-circuit');
        useUiStore.getState().addLog('Injected Open Circuit break on wire', 'warning');
        close();
      },
    });

    items.push({
      icon: Flame,
      label: 'Inject Short Circuit',
      disabled: wire?.fault === 'short-circuit',
      action: () => {
        useCircuitStore.getState().setWireFault(target.id, 'short-circuit');
        useUiStore.getState().addLog('Injected Short Circuit fault on wire', 'error');
        close();
      },
    });

    items.push({ separator: true });

    items.push({
      icon: Trash2,
      label: 'Delete Wire',
      shortcut: 'Del',
      danger: true,
      disabled: simRunning,
      action: () => {
        requestDeleteWire(target.id);
        close();
      },
    });
  }

  if (target.kind === 'canvas') {
    items.push({
      icon: Zap,
      label: 'Wire Mode',
      shortcut: 'W',
      action: () => {
        useUiStore.getState().setMode('wiring');
        close();
      },
    });

    items.push({
      icon: MousePointerClick,
      label: 'Select Mode',
      shortcut: 'V',
      action: () => {
        useUiStore.getState().setMode('idle');
        close();
      },
    });

    items.push({ separator: true });

    items.push({
      icon: Unlink,
      label: 'Clear All Wires',
      disabled: simRunning,
      action: () => {
        requestClearWires();
        close();
      },
      danger: true,
    });

    items.push({
      icon: Trash2,
      label: 'Clear All Components',
      disabled: simRunning,
      action: () => {
        requestClearAll();
        close();
      },
      danger: true,
    });

    items.push({
      icon: RefreshCcw,
      label: 'Reset to Default Circuit',
      disabled: simRunning,
      action: () => {
        requestReset();
        close();
      },
      danger: true,
    });
  }

  // ── Shared items ───────────────────────────────────────────────────────

  if (items.length > 0 && !isSeparator(items[items.length - 1])) {
    items.push({ separator: true });
  }

  items.push({
    icon: HelpCircle,
    label: 'What is ElectraSim?',
    action: () => {
      useUiStore.getState().setWelcomeOpen(true);
      close();
    },
  });

  items.push({
    icon: Download,
    label: 'Import / Export',
    shortcut: 'Ctrl+E',
    action: () => {
      useUiStore.getState().setImportExportOpen(true);
      close();
    },
  });

  items.push({
    icon: BookOpen,
    label: 'Documentation',
    action: () => {
      useUiStore.getState().setDocsOpen(true);
      close();
    },
  });

  items.push({
    icon: Keyboard,
    label: 'Keyboard Shortcuts',
    action: () => {
      useUiStore.getState().setDocsOpen(true, 'shortcuts');
      close();
    },
  });

  items.push({
    icon: Settings,
    label: 'Settings',
    action: () => {
      useUiStore.getState().setSettingsOpen(true);
      close();
    },
  });

  return items;
}

// ─── Component ───────────────────────────────────────────────────────────────

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
