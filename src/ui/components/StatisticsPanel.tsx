import { Activity, Cpu, Play, Square, Zap } from 'lucide-react';
/**
 * Statistics Panel - Shows runtime performance metrics with smooth UI transitions
 */
import type React from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { useUiStore } from '../../store/uiStore';

export const StatisticsPanel: React.FC = () => {
  const components = useCircuitStore((s) => s.components);
  const wires = useCircuitStore((s) => s.wires);
  const simRunning = useUiStore((s) => s.simRunning);
  const simResult = useUiStore((s) => s.simResult);

  const energizedComponents = simResult?.energizedComponents ?? new Set<string>();
  const energizedWires = simResult?.energizedWires ?? new Set<string>();

  // Calculate active nodes (components with power flowing through)
  const activeNodes = energizedComponents.size;

  // Simulation tick rate (approximate based on last frame time)
  const tickRate = simRunning ? 60 : 0;

  const totalComponents = components.length;
  const totalWires = wires.length;
  const activeWires = energizedWires.size;

  return (
    <div className="statistics-panel transition-all duration-300 ease-in-out p-3.5 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-xl text-slate-200 text-xs leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="font-semibold text-sm text-emerald-400 tracking-wide">
            Runtime Engine Telemetry
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
            simRunning
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {simRunning ? 'Active 60Hz' : 'Standby'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 transition-all hover:bg-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Active Nodes
          </div>
          <div className="text-sm font-semibold text-white">
            <span className="text-emerald-400">{activeNodes}</span>
            <span className="text-slate-400 text-xs font-normal"> / {totalComponents}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 transition-all hover:bg-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Cpu className="w-3 h-3 text-blue-400" />
            Live Wires
          </div>
          <div className="text-sm font-semibold text-white">
            <span className="text-blue-400">{activeWires}</span>
            <span className="text-slate-400 text-xs font-normal"> / {totalWires}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex justify-between items-center">
          <span>Solver Step Rate:</span>
          <span className="font-mono font-medium text-slate-200">{tickRate} FPS</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Topology Complexity:</span>
          <span className="font-mono text-slate-200">{totalComponents + totalWires} elements</span>
        </div>
      </div>
    </div>
  );
};
