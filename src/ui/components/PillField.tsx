/**
 * PillField — label/value capsule used in the Inspector.
 */

import { memo } from 'react';

interface Props {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
  /** Phase 6.1.1 — colored state pill: 'success' (green), 'danger' (red). */
  color?: 'success' | 'danger';
}

export const PillField = memo(function PillField({ label, value, accent, mono, color }: Props) {
  const colorClass =
    color === 'success'
      ? 'font-semibold text-green-600 dark:text-green-400'
      : color === 'danger'
        ? 'font-semibold text-red-500 dark:text-red-400'
        : accent
          ? 'font-semibold text-blue-600 dark:text-blue-400'
          : 'text-slate-700 dark:text-slate-300';
  return (
    <div className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-800/80">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span className={[mono ? 'font-mono text-[10px]' : 'text-[11px]', colorClass].join(' ')}>
        {value}
      </span>
    </div>
  );
});
