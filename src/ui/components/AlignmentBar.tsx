/**
 * AlignmentBar — Phase 6.3-slim
 *
 * A floating toolbar that appears above the canvas when 2+ components are
 * selected. Provides align (left / centre-H / right / top / centre-V / bottom)
 * and distribute (horizontal / vertical) actions, each as one undo entry.
 */

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  SpaceIcon,
} from 'lucide-react';
import { useCircuitStore } from '../../store';
import { alignSelected, distributeSelected } from '../canvas-actions';

export function AlignmentBar() {
  const count = useCircuitStore((s) => s.selectedComponentIds.length);
  if (count < 2) return null;

  return (
    <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2">
      <div className="flex items-center gap-0.5 rounded-full border border-white/80 bg-white/80 px-1 py-1 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:ring-slate-700/50">
        <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
          Align
        </span>
        <AlignBtn
          icon={AlignStartHorizontal}
          title="Align left edges"
          onClick={() => alignSelected('left')}
        />
        <AlignBtn
          icon={AlignCenterHorizontal}
          title="Align horizontal centres"
          onClick={() => alignSelected('center-h')}
        />
        <AlignBtn
          icon={AlignEndHorizontal}
          title="Align right edges"
          onClick={() => alignSelected('right')}
        />
        <div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <AlignBtn
          icon={AlignStartVertical}
          title="Align top edges"
          onClick={() => alignSelected('top')}
        />
        <AlignBtn
          icon={AlignCenterVertical}
          title="Align vertical centres"
          onClick={() => alignSelected('center-v')}
        />
        <AlignBtn
          icon={AlignEndVertical}
          title="Align bottom edges"
          onClick={() => alignSelected('bottom')}
        />
        {count >= 3 && (
          <>
            <div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              Distribute
            </span>
            <AlignBtn
              icon={SpaceIcon}
              title="Distribute horizontally"
              onClick={() => distributeSelected('horizontal')}
            />
            <AlignBtn
              icon={SpaceIcon}
              title="Distribute vertically"
              onClick={() => distributeSelected('vertical')}
              rotate
            />
          </>
        )}
      </div>
    </div>
  );
}

function AlignBtn({
  icon: Icon,
  title,
  onClick,
  rotate,
}: {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  rotate?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
    >
      <Icon size={14} style={rotate ? { transform: 'rotate(90deg)' } : undefined} />
    </button>
  );
}
