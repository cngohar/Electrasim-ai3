/**
 * InspectorAnalyticsView — analytics tab (waveforms, energy, cost).
 * Moved verbatim from the previous monolithic `Inspector.tsx`.
 */

import { Activity, Sparkles, Thermometer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COMPONENT_DEFS, type SimulationResult } from '../../../domain';
import { useCircuitStore, useUiStore } from '../../../store';
import { AnimatedNumber } from '../AnimatedNumber';

export function InspectorAnalyticsView({ simResult }: { simResult: SimulationResult | null }) {
  const simRunning = useUiStore((s) => s.simRunning);
  const components = useCircuitStore((s) => s.components);
  const globalVoltage = useCircuitStore((s) => s.globalVoltage);
  const wires = useCircuitStore((s) => s.wires);
  const componentGroups = useCircuitStore((s) => s.componentGroups);
  const thermalOverlayEnabled = useUiStore((s) => s.thermalOverlayEnabled);

  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!simRunning) return;
    const interval = setInterval(() => {
      setTime((t) => (t + 0.08) % (Math.PI * 200));
    }, 35);
    return () => clearInterval(interval);
  }, [simRunning]);

  const liveSupplyVoltage = simResult?.supplyVoltage ?? globalVoltage;
  const hasAcSupply =
    components.some(
      (c) =>
        c.type.includes('ac') ||
        c.type.includes('mains') ||
        c.type.includes('generator') ||
        c.type.includes('inverter'),
    ) || liveSupplyVoltage > 48;

  let activePowerW = 0;
  if (simRunning && simResult && simResult.energizedComponents.size > 0) {
    for (const id of simResult.energizedComponents) {
      const comp = components.find((c) => c.id === id);
      if (!comp || comp.state?.isBlown) continue;
      const def = COMPONENT_DEFS[comp.type];
      const pWatts = comp.state?.customPowerWatts ?? def?.powerWatts;
      if (pWatts !== undefined && pWatts > 0) {
        activePowerW += pWatts;
      }
    }
  }

  // Realistic dynamic calculations for Live Measurements
  const voltageLive = simRunning
    ? liveSupplyVoltage - 0.4 + 0.3 * Math.sin(time * 1.8)
    : liveSupplyVoltage;

  const currentAmpsCalculated =
    activePowerW > 0 ? activePowerW / Math.max(1, liveSupplyVoltage) : 0;
  const currentLive =
    simRunning && activePowerW > 0
      ? currentAmpsCalculated + 0.05 * Math.sin(time * 2.3)
      : currentAmpsCalculated;

  const powerLive =
    simRunning && activePowerW > 0 ? activePowerW + 2.5 * Math.sin(time * 2.8) : activePowerW;

  const hasInductive = components.some(
    (c) =>
      c.type.includes('motor') ||
      c.type.includes('transformer') ||
      c.type.includes('fan') ||
      c.type.includes('pump'),
  );
  const powerFactorLive = simRunning
    ? hasInductive
      ? 0.94 + 0.02 * Math.sin(time * 1.2)
      : 0.98 + 0.01 * Math.sin(time * 0.9)
    : 0.98;

  const frequencyLive = hasAcSupply
    ? simRunning
      ? (liveSupplyVoltage === 110 || liveSupplyVoltage === 120 ? 60.0 : 50.0) +
        0.012 * Math.sin(time * 1.5) +
        0.008 * Math.cos(time * 3.4)
      : liveSupplyVoltage === 110 || liveSupplyVoltage === 120
        ? 60.0
        : 50.0
    : 0.0;

  // Real-time mini sparklines for Live Measurements cards
  const generateSineSparkline = (
    color: string,
    omega = 0.12,
    speed = 3,
    phase = 0,
    width = 120,
    height = 24,
  ) => {
    const midY = height / 2;
    const points: string[] = [];
    const amplitude = height * 0.38;

    for (let x = 0; x <= width; x += 2) {
      const y = simRunning
        ? midY - Math.sin(x * omega + time * speed + phase) * amplitude
        : midY - Math.sin(x * omega + phase) * (amplitude * 0.4);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generatePowerSparkline = (width = 120, height = 24) => {
    const midY = height / 2;
    const points: string[] = [];
    const amplitude = height * 0.36;

    for (let x = 0; x <= width; x += 2) {
      const y = simRunning
        ? midY -
          (Math.sin(2 * (x * 0.12 + time * 3)) * 0.7 + 0.15 * Math.sin(x * 0.36 + time * 6)) *
            amplitude
        : midY - Math.sin(2 * (x * 0.12)) * (amplitude * 0.4);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generateFrequencyTransientSparkline = (width = 180, height = 36) => {
    const midY = height / 2;
    const points: string[] = [];
    const amplitude = height * 0.42;

    for (let x = 0; x <= width; x += 1.5) {
      const progress = x / width;
      const t = simRunning ? time * 2.8 : 0;
      // Multi-harmonic envelope packet mimicking the frequency resonance visual
      const burst = Math.exp(-(((progress - 0.6) * 4.2) ** 2));
      const baseWave = 0.22 * Math.sin(x * 0.14 + t);
      const ringing = burst * 0.88 * Math.sin(x * 0.38 + t * 1.9);
      const y = midY - (baseWave + ringing) * amplitude;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generateWaveformPath = (width = 280, height = 80) => {
    const midY = height / 2;
    if (!simRunning) {
      return `M 0,${midY} L ${width},${midY}`;
    }
    const points: string[] = [];
    const amplitude = hasAcSupply
      ? height * 0.36
      : Math.min(height * 0.35, Math.max(10, (liveSupplyVoltage / 240) * (height * 0.35)));

    for (let x = 0; x <= width; x += 1.5) {
      let y = midY;
      if (hasAcSupply) {
        const omega = 0.07;
        const fundamental = Math.sin(x * omega + time * 3);
        const harmonic3 = 0.04 * Math.sin(3 * (x * omega + time * 3));
        y = midY - (fundamental + harmonic3) * amplitude;
      } else {
        const ripple = Math.sin(x * 0.4 + time * 10) * 1.5;
        y = midY - amplitude + ripple;
      }
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const generateCurrentWaveformPath = (width = 280, height = 80) => {
    const midY = height / 2;
    if (!simRunning || activePowerW === 0) {
      return `M 0,${midY} L ${width},${midY}`;
    }
    const points: string[] = [];
    const currentAmps = activePowerW / Math.max(1, liveSupplyVoltage);
    const amplitude = Math.min(height * 0.32, Math.max(6, currentAmps * 3));

    for (let x = 0; x <= width; x += 1.5) {
      let y = midY;
      if (hasAcSupply) {
        const omega = 0.07;
        const phaseLag = 0.35;
        const fundamental = Math.sin(x * omega + time * 3 - phaseLag);
        y = midY - fundamental * amplitude;
      } else {
        const ripple = Math.sin(x * 0.4 + time * 10 + 1) * 1.0;
        y = midY - amplitude + ripple;
      }
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  // Statistics data
  const stats = {
    runtime: simRunning ? time : 0,
    activeNodes: simResult?.energizedComponents.size ?? 0,
    tickRate: simRunning ? 60 : 0,
    totalComponents: components.length,
    totalWires: wires.length,
    totalGroups: componentGroups.length,
  };

  return (
    <div className="p-3.5 space-y-3.5 text-xs select-none">
      {/* ─── LIVE MEASUREMENTS PANEL (AS PER REFERENCE IMAGE) ─── */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-3.5 shadow-xl text-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px] shadow-emerald-400 animate-pulse" />
            Live Measurements
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {simRunning ? 'REAL-TIME 60Hz' : 'PAUSED'}
          </span>
        </div>

        {/* 2x2 Grid for Voltage, Current, Power, Power Factor */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Voltage (L-N) */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Voltage (L-N)</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={voltageLive} decimals={1} suffix=" V" duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Voltage Waveform</title>
                <path
                  d={generateSineSparkline('#3b82f6', 0.12, 3, 0, 120, 24)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Current (A) */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Current (A)</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={currentLive} decimals={1} suffix=" A" duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Current Waveform</title>
                <path
                  d={generateSineSparkline('#22c55e', 0.12, 3, -0.35, 120, 24)}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Power (W) */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Power (W)</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={powerLive} decimals={0} suffix=" W" duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Power Waveform</title>
                <path
                  d={generatePowerSparkline(120, 24)}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Power Factor */}
          <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:border-slate-700/80 transition">
            <div className="text-[11px] font-medium text-slate-300">Power Factor</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white my-1">
              <AnimatedNumber value={powerFactorLive} decimals={2} duration={250} />
            </div>
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 24">
                <title>Power Factor Waveform</title>
                <path
                  d={generateSineSparkline('#a855f7', 0.14, 2.6, 0.4, 120, 24)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 5: Frequency (Wide Card with Harmonic Transient Waveform) */}
        <div className="rounded-xl border border-slate-800/80 bg-[#131d31] p-3 flex items-center justify-between gap-3 overflow-hidden shadow-xs hover:border-slate-700/80 transition">
          <div className="flex-shrink-0">
            <div className="text-[11px] font-medium text-slate-300">Frequency</div>
            <div className="font-mono text-xl font-bold tracking-tight text-white mt-1">
              {hasAcSupply ? (
                <AnimatedNumber value={frequencyLive} decimals={2} suffix=" Hz" duration={250} />
              ) : (
                '0.00 Hz (DC)'
              )}
            </div>
          </div>
          <div className="h-9 flex-1 pl-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 180 36">
              <title>Frequency Waveform</title>
              <defs>
                <filter id="glow-freq" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                d={generateFrequencyTransientSparkline(180, 36)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#glow-freq)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Waveform Oscilloscope ─── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-emerald-500" /> DSO Waveform Scope
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[9px]">
            <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5">
              CH1: {liveSupplyVoltage}V
            </span>
            <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5">
              CH2: {activePowerW}W
            </span>
          </div>
        </div>

        <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-950 p-1 border border-slate-800 shadow-inner">
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Oscilloscope Graticule Grid</title>
            <defs>
              <pattern id="scope-grid" width="28" height="16" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 16" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#scope-grid)" />
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </svg>

          <svg
            className="h-full w-full relative z-10"
            viewBox="0 0 280 80"
            preserveAspectRatio="none"
          >
            <title>Waveform Oscilloscope View</title>
            <defs>
              <filter id="glow-ch1" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-ch2" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {simRunning && activePowerW > 0 && (
              <path
                d={generateCurrentWaveformPath(280, 80)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeLinecap="round"
                filter="url(#glow-ch2)"
                opacity="0.85"
              />
            )}

            <path
              d={generateWaveformPath(280, 80)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow-ch1)"
            />
          </svg>

          <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-slate-400 pointer-events-none z-20">
            <span>5.0ms/div • 50V/div</span>
            <span>
              {hasAcSupply ? '50.0 Hz AC' : 'DC Steady'} • {simRunning ? 'TRIG: AUTO' : 'HOLD'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Runtime Statistics ─── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="size-3.5 text-green-500" /> Runtime Statistics
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Active Nodes
            </div>
            <div className="font-mono text-sm font-bold text-green-600 dark:text-green-400">
              {stats.activeNodes}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Tick Rate
            </div>
            <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
              {stats.tickRate} Hz
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Runtime</div>
            <div className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
              {(stats.runtime / 10).toFixed(1)}s
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Components
            </div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              {stats.totalComponents}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Wires</div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              {stats.totalWires}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/80 p-2 dark:bg-slate-950/60">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Groups</div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
              {stats.totalGroups}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Thermal Overlay Toggle ─── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer className="size-3.5 text-red-500" /> Thermal Overlay
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={thermalOverlayEnabled}
              onChange={(e) => useUiStore.getState().setThermalOverlayEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[10px] text-slate-600 dark:text-slate-400">Enable</span>
          </label>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#22c55e]"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#eab308]"></div>
            <span>Warm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#f97316]"></div>
            <span>Hot</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#ef4444]"></div>
            <span>Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
