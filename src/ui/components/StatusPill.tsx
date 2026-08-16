import {
  Activity,
  AlertCircle,
  Boxes,
  Cable,
  CheckCircle2,
  Grid,
  Magnet,
  Zap,
} from 'lucide-react';
import { useCircuitStore, useSettingsStore, useUiStore } from '../../store';

interface Props {
  simRunning: boolean;
  components: number;
  wires: number;
  active: number;
  dashboardOpen?: boolean;
}

export function StatusPill({
  simRunning,
  components,
  wires,
  active,
  dashboardOpen = false,
}: Props) {
  const showGrid = useSettingsStore((s) => s.showGrid);
  const snapToGrid = useSettingsStore((s) => s.snapToGrid);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const globalVoltage = useCircuitStore((s) => s.globalVoltage);
  const simResult = useUiStore((s) => s.simResult);
  const paletteOpen = useUiStore((s) => s.paletteOpen);
  const inspectorCollapsed = useUiStore((s) => s.inspectorCollapsed);

  const effectiveVoltage = simResult?.supplyVoltage ?? globalVoltage;
  const isAc = effectiveVoltage > 48;
  const hasErrors = (simResult?.errors.length ?? 0) > 0;
  const hasWarnings = (simResult?.warnings.length ?? 0) > 0;

  if (dashboardOpen) {
    return null;
  }

  const leftClass = paletteOpen ? 'left-64' : 'left-0';
  // Collapsed: clear the w-12 icon rail (right-14 = 48 px + 8 px gap).
  // Expanded: drawer (w-64 md:w-72 lg:w-80) + rail.
  const rightClass = !inspectorCollapsed ? 'right-76 md:right-84 lg:right-92' : 'right-14';

  return (
    <div
      className={`absolute bottom-0 ${leftClass} ${rightClass} z-10 hidden items-center justify-between border-t border-slate-200/80 bg-white/85 px-4 py-1.5 text-[11px] font-medium text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-150 md:flex dark:border-slate-800/80 dark:bg-slate-900/85 dark:text-slate-300`}
    >
      {/* Real-time live counts and telemetry */}
      <div className="flex items-center gap-3">
        {/* Real-time simulation pulse status */}
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <span
            className={`size-2 rounded-full ${
              simRunning ? 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            Live Check:
          </span>
        </div>

        {/* Component Count */}
        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200" title="Total components on canvas">
          <Boxes className="size-3.5 text-blue-500" />
          <span>{components}</span>
          <span className="text-slate-500 dark:text-slate-400 font-normal">comp{components === 1 ? '' : 's'}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">•</span>

        {/* Wire Count */}
        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200" title="Total connecting wires">
          <Cable className="size-3.5 text-indigo-500" />
          <span>{wires}</span>
          <span className="text-slate-500 dark:text-slate-400 font-normal">wire{wires === 1 ? '' : 's'}</span>
        </div>

        {/* Active Nodes Count when Simulation Running */}
        {simRunning && (
          <>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400" title="Active energized components">
              <Activity className="size-3.5 text-emerald-500" />
              <span>{active}</span>
              <span className="font-normal text-emerald-700/80 dark:text-emerald-300/80">energized</span>
            </div>
          </>
        )}

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Real-time Global Supply Voltage indicator (Synced from SubHeaderBar) */}
        <div
          className="flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
          title="Live circuit supply voltage — change anytime from the sub-header bar"
        >
          <Zap className="size-3.5 fill-amber-500 text-amber-500" />
          <span>Supply: {effectiveVoltage} V {isAc ? 'AC' : 'DC'}</span>
        </div>

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Real-time Health Status */}
        <div className="flex items-center gap-1 text-[10px]">
          {hasErrors ? (
            <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle className="size-3 text-rose-500" /> Faults Active
            </span>
          ) : hasWarnings ? (
            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-3 text-amber-500" /> Open Circuit
            </span>
          ) : simRunning && active > 0 ? (
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3 text-emerald-500" /> Circuit Closed & Healthy
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              {components === 0 ? 'Canvas Ready' : 'Standby'}
            </span>
          )}
        </div>
      </div>

      {/* Right controls: Snap & Grid toggles */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSetting('snapToGrid', !snapToGrid)}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Snap to Grid"
        >
          <Magnet className="size-3 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Snap:</span>
          <span
            className={`font-bold ${
              snapToGrid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
            }`}
          >
            {snapToGrid ? 'ON' : 'OFF'}
          </span>
        </button>

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          type="button"
          onClick={() => setSetting('showGrid', !showGrid)}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Canvas Grid Display"
        >
          <Grid className="size-3 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Grid:</span>
          <span
            className={`font-bold ${
              showGrid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
            }`}
          >
            {showGrid ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
    </div>
  );
}
