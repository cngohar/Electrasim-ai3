/**
 * InspectorHistoryView — Pro Mode "Simulation History" audit log.
 *
 * Surfaces the same event stream as the floating EventHistoryPanel but
 * embedded directly in the Inspector for Pro users, as requested for the
 * audit-trail feature. Every entry is timestamped and grouped into:
 *   - regulatory violations (validation errors/warnings)
 *   - fault trigger timestamps
 *   - manual intervention events (trips, repairs, clears)
 *
 * A dedicated "Clear history" action resets the log. The log holds the last
 * 100 events (capped in `uiStore.addEventHistory`).
 */

import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Clock,
  OctagonAlert,
  ShieldAlert,
  Thermometer,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUiStore } from '../../../store';

function iconFor(eventType: string): LucideIcon {
  switch (eventType) {
    case 'component_tripped':
      return OctagonAlert;
    case 'wire_overheated':
    case 'wire_melted':
      return Thermometer;
    case 'component_blown':
      return AlertTriangle;
    case 'fault_cleared':
      return CheckCircle;
    case 'component_repaired':
      return Wrench;
    case 'fault_detected':
    case 'fault_injected':
      return Zap;
    case 'regulatory_violation':
      return ShieldAlert;
    default:
      return ClipboardList;
  }
}

function toneFor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'info':
      return 'text-sky-600 dark:text-sky-400';
    default:
      return 'text-slate-500 dark:text-slate-400';
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function InspectorHistoryView() {
  const eventHistory = useUiStore((s) => s.eventHistory);
  const clearEventHistory = useUiStore((s) => s.clearEventHistory);
  const addLog = useUiStore((s) => s.addLog);

  const violations = eventHistory.filter((e) => e.eventType === 'regulatory_violation');
  const faults = eventHistory.filter(
    (e) =>
      e.eventType === 'fault_injected' ||
      e.eventType === 'fault_detected' ||
      e.eventType === 'component_tripped' ||
      e.eventType === 'wire_melted' ||
      e.eventType === 'component_blown',
  );
  const interventions = eventHistory.filter(
    (e) => e.eventType === 'fault_cleared' || e.eventType === 'component_repaired',
  );

  return (
    <div className="flex h-full flex-col text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Simulation History
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            clearEventHistory();
            addLog('Simulation history cleared.', 'info');
          }}
          disabled={eventHistory.length === 0}
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Clear history log"
        >
          <Trash2 className="size-3" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        <Stat label="Violations" count={violations.length} tone="text-red-600" />
        <Stat label="Faults" count={faults.length} tone="text-amber-600" />
        <Stat label="Interventions" count={interventions.length} tone="text-emerald-600" />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {eventHistory.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <ClipboardList className="mb-2 size-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              No events recorded
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              Regulatory violations, fault triggers and manual interventions will appear here as an
              audit trail while you work.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {eventHistory.map((event) => {
              const Icon = iconFor(event.eventType);
              return (
                <li
                  key={event.id}
                  className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`mt-0.5 size-3.5 flex-shrink-0 ${toneFor(event.severity)}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium leading-snug text-slate-700 dark:text-slate-200">
                        {event.description}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{formatTime(event.timestamp)}</span>
                        {event.componentName && <span>· {event.componentName}</span>}
                        {event.details?.currentAmps != null && (
                          <span className="font-mono">
                            · {event.details.currentAmps.toFixed(1)} A
                          </span>
                        )}
                        {event.details?.voltage != null && (
                          <span className="font-mono">· {event.details.voltage.toFixed(0)} V</span>
                        )}
                        {event.details?.faultType && <span>· {event.details.faultType}</span>}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, count, tone }: { label: string; count: number; tone: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-1.5 text-center dark:bg-slate-950/60">
      <div className={`font-mono text-sm font-bold ${tone}`}>{count}</div>
      <div className="text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
