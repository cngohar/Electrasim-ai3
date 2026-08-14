import { ChevronDown, Edit2, Sliders, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCircuitStore, useUiStore } from '../../store';

const VOLTAGE_PRESETS = [
  { label: '12V DC', val: 12 },
  { label: '24V DC', val: 24 },
  { label: '110V AC', val: 110 },
  { label: '230V AC', val: 230 },
  { label: '240V AC', val: 240 },
  { label: '400V 3Ph', val: 400 },
];

export function SubHeaderBar() {
  const simRunning = useUiStore((s) => s.simRunning);
  const globalVoltage = useCircuitStore((s) => s.globalVoltage);
  const setGlobalSupplyVoltage = useCircuitStore((s) => s.setGlobalSupplyVoltage);
  const simResult = useUiStore((s) => s.simResult);

  const [projectName, setProjectName] = useState('Kitchen Lighting & Sockets');
  const [isEditing, setIsEditing] = useState(false);
  const [showVoltagePicker, setShowVoltagePicker] = useState(false);
  const [customVoltInput, setCustomVoltInput] = useState(globalVoltage.toString());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomVoltInput(globalVoltage.toString());
  }, [globalVoltage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowVoltagePicker(false);
      }
    };
    if (showVoltagePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVoltagePicker]);

  const handleApplyCustomVoltage = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number.parseFloat(customVoltInput);
    if (!Number.isNaN(num) && num > 0) {
      setGlobalSupplyVoltage(num);
      setShowVoltagePicker(false);
    }
  };

  const effectiveVoltage = simResult?.supplyVoltage ?? globalVoltage;
  const isAc = effectiveVoltage > 48;

  return (
    <div className="absolute left-1/2 top-16 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/80 bg-white/85 px-4 py-1 text-xs text-slate-700 shadow-lg ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:ring-slate-700/50">
      {/* Global Voltage Dropdown Picker */}
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowVoltagePicker(!showVoltagePicker)}
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Click to change Global Supply Voltage"
        >
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400" />
          <span className="text-slate-500 dark:text-slate-400">Supply:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {effectiveVoltage} V {isAc ? '50 Hz' : 'DC'}
          </span>
          <ChevronDown
            className={`size-3 text-slate-400 transition-transform ${showVoltagePicker ? 'rotate-180' : ''}`}
          />
        </button>

        {showVoltagePicker && (
          <div className="absolute left-0 top-8 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-800 dark:border-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-1.5 text-xs">
                <Sliders className="size-3.5 text-amber-500" /> Global Supply Voltage
              </span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                {effectiveVoltage} V
              </span>
            </div>

            <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400">
              Select global supply voltage level. Synchronizes with real-time checks and load calculations.
            </div>

            {/* Voltage presets */}
            <div className="mb-3 grid grid-cols-3 gap-1">
              {VOLTAGE_PRESETS.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => {
                    setGlobalSupplyVoltage(preset.val);
                    setShowVoltagePicker(false);
                  }}
                  className={`rounded border px-2 py-1 font-mono text-[10px] font-bold transition ${
                    globalVoltage === preset.val
                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <form onSubmit={handleApplyCustomVoltage} className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="1000"
                value={customVoltInput}
                onChange={(e) => setCustomVoltInput(e.target.value)}
                placeholder="Custom Volts..."
                className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-500"
              >
                Apply
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400" />
        <span className="font-medium text-slate-500 dark:text-slate-400">System:</span>
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">TN-S</span>
      </div>

      <div className="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

      <div className="hidden items-center gap-1.5 sm:flex">
        <span className="font-medium text-slate-500 dark:text-slate-400">Project:</span>
        {isEditing ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditing(false);
            }}
            className="rounded border border-blue-400 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span>{projectName}</span>
            <Edit2 className="size-3 text-slate-400 opacity-60 group-hover:opacity-100" />
          </button>
        )}
      </div>

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-1.5">
        <span className="font-medium text-slate-500 dark:text-slate-400">Sim:</span>
        <span
          className={`flex items-center gap-1 font-semibold ${
            simRunning
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {simRunning ? 'Running' : 'Paused'}
          <span
            className={`size-2 rounded-full ${
              simRunning ? 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400' : 'bg-slate-400'
            }`}
          />
        </span>
      </div>
    </div>
  );
}
