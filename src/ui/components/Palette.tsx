/**
 * Palette — component catalogue.
 *
 * Full screen height toggleable left panel.
 */

import { ChevronLeft, ChevronRight, Layers, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COMPONENT_DEFS } from '../../domain';
import { useUiStore } from '../../store';
import { useSettingsStore } from '../../store/settingsStore';

interface PaletteEntry {
  type: string;
  label: string;
  icon: string;
  tier?: 'basic' | 'pro';
}

interface Group {
  category: string;
  items: PaletteEntry[];
}

const CATEGORY_ORDER = [
  'supply',
  'switch',
  'socket',
  'protection',
  'transformer',
  'relay',
  'contactor',
  'timer',
  'thermostat',
  'sensor',
  'sounder',
  'motor',
  'heater',
  'distribution',
  'lighting',
  'fan',
  'load',
  'control',
  'junction',
];

const PRIMARY_PALETTE_TYPES = new Set([
  // Supply
  'ac-mains-supply',
  'dc-battery-12v',
  'solar-pv-panel',
  'live-terminal',
  'neutral-terminal',
  'earth-terminal',
  // Protection
  'mcb',
  'rcd',
  'rcbo',
  'fuse',
  'spd',
  'isolator-switch',
  'distribution-board',
  // Switch
  'single-way-switch',
  'two-way-switch',
  'intermediate-switch',
  'double-pole-switch',
  'double-gang-switch',
  'push-button',
  'cooker-unit',
  // Sockets
  'socket-3pin',
  'double-socket',
  'switched-socket',
  'socket-usb',
  'socket-gfci',
  'socket-industrial',
  // Lighting
  'bulb',
  'led-downlight',
  'tube-light',
  // Transformer
  'transformer-8v',
  'transformer-12v',
  'transformer-24v',
  'step-up-down-transformer',
  // Relay
  'relay-spst',
  'relay-spdt',
  'relay-dpdt',
  'control-relay',
  // Contactor
  'contactor-1p',
  'contactor-2p',
  'contactor-3p',
  'contactor-4p',
  // Timer
  'timer-switch',
  'digital-weekly-timer',
  'staircase-timer',
  'countdown-timer',
  'delay-timer',
  // Thermostat
  'thermostat',
  'room-thermostat',
  'heating-thermostat',
  // Sensor
  'pir-sensor',
  'photocell-sensor',
  'temperature-sensor',
  'door-sensor',
  // Sounder
  'bell',
  'electric-buzzer',
  'wireless-doorbell',
  'alarm-siren',
  // Motor
  'motor',
  'motor-3phase',
  'water-pump',
  // Heater
  'space-heater',
  'water-heater',
  'heating-element',
  // Distribution
  'distribution-box',
  'distribution-board-3phase',
  // Fan
  'ceiling-fan',
  'extractor-fan',
  // Load
  'air-conditioner',
  'induction-hob',
  'ev-charger',
  // Control
  'dimmer-switch',
  'fan-dimmer',
  // Junction
  'junction-box',
  'wago-connector',
  'terminal-strip',
]);

function buildGroups(): Group[] {
  const groups = new Map<string, PaletteEntry[]>();
  for (const [type, def] of Object.entries(COMPONENT_DEFS)) {
    if (!PRIMARY_PALETTE_TYPES.has(type)) continue;
    const cat = def.category;
    const existing = groups.get(cat);
    const list = existing ?? [];
    if (!existing) groups.set(cat, list);
    list.push({ type, label: def.label, icon: def.icon, tier: def.tier });
  }
  return CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => ({
    category: c.charAt(0).toUpperCase() + c.slice(1),
    items: groups.get(c) ?? [],
  }));
}

interface Props {
  open: boolean;
  isPhone: boolean;
}

export function Palette({ open, isPhone }: Props) {
  const groups = useMemo(buildGroups, []);
  const placingType = useUiStore((s) => s.placingType);
  const appMode = useSettingsStore((s) => s.appMode);
  const [query, setQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => {
          if (appMode === 'basic' && it.tier === 'pro') return false;
          if (!q) return true;
          return it.label.toLowerCase().includes(q) || it.type.toLowerCase().includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, appMode]);

  if (!open) {
    if (isPhone) return null;
    return (
      <button
        type="button"
        onClick={() => useUiStore.getState().togglePalette()}
        className="fixed left-4 top-20 z-10 flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg ring-1 ring-slate-900/5 backdrop-blur-xl hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Layers className="size-3.5" />
        Components
      </button>
    );
  }

  if (isPhone) {
    return (
      <>
        {/* Backdrop — tap outside to close */}
        <div
          className="absolute inset-0 z-20 bg-black/30 backdrop-blur-sm"
          onClick={() => useUiStore.getState().togglePalette()}
        />
        <aside className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[62vh] flex-col overflow-hidden rounded-t-2xl border-t border-white/80 bg-white/95 shadow-2xl shadow-slate-900/20 dark:border-slate-700/80 dark:bg-slate-900/95">
          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 dark:border-slate-700/60">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Add Component
            </span>
            <button
              type="button"
              onClick={() => useUiStore.getState().togglePalette()}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              aria-label="Close palette"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="border-b border-slate-100 p-3 dark:border-slate-700/60">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search components…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">
                No components match &ldquo;{query}&rdquo;
              </div>
            )}
            {filtered.map((cat) => (
              <div key={cat.category} className="mb-4">
                <div className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {cat.category}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {cat.items.map((it) => {
                    const active = placingType === it.type;
                    return (
                      <button
                        type="button"
                        key={it.type}
                        onClick={() =>
                          useUiStore.getState().setPlacingType(active ? null : it.type)
                        }
                        className={[
                          'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-medium shadow-sm transition active:scale-95',
                          active
                            ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                        ].join(' ')}
                      >
                        <span className="text-2xl leading-none">{it.icon}</span>
                        <span className="truncate text-center w-full">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </>
    );
  }

  if (isCollapsed) {
    return (
      <aside
        className="fixed left-0 top-0 bottom-0 z-20 flex h-screen w-12 flex-col items-center justify-between border-r border-slate-200/80 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"
        title="Component Library (Collapsed)"
      >
        <div className="flex flex-col items-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs hover:bg-blue-100 dark:bg-blue-950/80 dark:text-blue-400 dark:hover:bg-blue-900"
            title="Expand Component Library"
            aria-label="Expand Component Library"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="flex flex-col items-center gap-2 pt-4">
            <Layers className="size-4 text-slate-500 dark:text-slate-400" />
            <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Components
            </span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-20 flex h-screen w-64 flex-col overflow-hidden border-r border-slate-200/80 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-3 select-none dark:border-slate-700/60">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="size-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
            Components
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Collapse panel"
            aria-label="Collapse panel"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-100 p-2.5 dark:border-slate-700/60">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white/80 py-1.5 pl-8 pr-8 text-xs outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Categories & Components */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {filtered.length === 0 && (
          <div className="py-4 text-center text-xs text-slate-400">
            No components match &ldquo;{query}&rdquo;
          </div>
        )}
        {filtered.map((cat) => (
          <div key={cat.category} className="mb-3">
            <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {cat.category}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cat.items.map((it) => {
                const active = placingType === it.type;
                const isProItem = it.tier === 'pro';
                return (
                  <button
                    type="button"
                    key={it.type}
                    title={`Click to place ${it.label} on canvas${isProItem ? ' (Pro Component)' : ''}`}
                    onClick={() => useUiStore.getState().setPlacingType(active ? null : it.type)}
                    className={[
                      'relative flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[10px] font-medium shadow-sm transition hover:scale-[1.03]',
                      active
                        ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-600 dark:ring-blue-900'
                        : 'border-slate-200/80 bg-white/80 text-slate-700 hover:border-blue-300 hover:bg-white hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-slate-700/80 dark:hover:text-blue-400',
                    ].join(' ')}
                  >
                    {isProItem && (
                      <span className="absolute top-1 right-1 rounded bg-purple-100 px-1 py-0.5 text-[8px] font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                        PRO
                      </span>
                    )}
                    <span className="text-xl leading-none">{it.icon}</span>
                    <span className="truncate text-center w-full px-1">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
