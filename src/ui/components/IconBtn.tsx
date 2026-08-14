/**
 * IconBtn — round capsule icon button used throughout the floating panels.
 */

import type { LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface Props {
  icon: LucideIcon;
  title?: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const IconBtn = memo(function IconBtn({
  icon: Icon,
  title,
  active,
  onClick,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        'grid size-7 place-items-center rounded-full transition',
        disabled ? 'cursor-not-allowed opacity-40' : '',
        active
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/80 dark:hover:text-slate-100',
      ].join(' ')}
    >
      <Icon className="size-3.5" />
    </button>
  );
});
