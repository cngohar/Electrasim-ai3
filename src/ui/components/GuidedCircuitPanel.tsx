import { Check, ChevronRight, Circle, Lightbulb, RotateCcw, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getChallengeProgress } from '../../domain/challengeProgress';
import { cloneTemplateCircuit, getGuidedCircuitTemplate } from '../../domain/templates';
import { markChallengeCompleted } from '../../lib/challengeProgressPersistence';
import { useCircuitStore, useUiStore } from '../../store';

interface Props {
  isPhone: boolean;
}

export function GuidedCircuitPanel({ isPhone }: Props) {
  const activeGuideId = useUiStore((s) => s.activeGuideId);
  const simRunning = useUiStore((s) => s.simRunning);
  const simResult = useUiStore((s) => s.simResult);
  const components = useCircuitStore((s) => s.components);
  const wires = useCircuitStore((s) => s.wires);
  const inspectorVisible = useCircuitStore((s) => s.selectedComponentId !== null);
  const [showHint, setShowHint] = useState(false);
  const template = activeGuideId ? getGuidedCircuitTemplate(activeGuideId) : undefined;
  const progress = useMemo(
    () =>
      template
        ? getChallengeProgress(template, { components, wires }, simRunning, simResult)
        : null,
    [template, components, wires, simRunning, simResult],
  );

  useEffect(() => {
    if (template && progress?.completed) markChallengeCompleted(template.id);
  }, [template, progress?.completed]);

  if (!template || (!isPhone && inspectorVisible) || !progress) return null;

  const restart = () => {
    useCircuitStore.getState().setCircuit(cloneTemplateCircuit(template));
    const ui = useUiStore.getState();
    ui.setSimRunning(false);
    ui.setSimResult(null);
    setShowHint(false);
  };

  return (
    <aside
      className={[
        'absolute z-20 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:ring-slate-700/50',
        isPhone
          ? 'bottom-20 left-3 right-3 max-h-[52vh]'
          : 'right-4 top-24 w-56 max-h-[calc(100vh-8rem)] lg:w-[340px]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/60">
        <div className="mt-0.5 grid size-8 flex-shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
          <Trophy className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
                {template.title}
              </h2>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                {template.difficulty} · {template.topic}
              </p>
            </div>
            <button
              type="button"
              onClick={() => useUiStore.getState().setActiveGuideId(null)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Hide guide"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-[inherit] space-y-3 overflow-y-auto px-4 py-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span>{progress.completed ? 'Challenge complete' : 'Challenge progress'}</span>
          <span>
            {progress.completedIds.length}/{progress.objectives.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {template.expected}
        </p>
        <ol className="flex flex-col gap-2">
          {progress.objectives.map((objective) => {
            const done = progress.completedIds.includes(objective.id);
            const current = progress.currentObjectiveId === objective.id;
            return (
              <li
                key={objective.id}
                className={[
                  'flex gap-2 rounded-xl border px-3 py-2 text-[11px] leading-relaxed',
                  done
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
                    : current
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30'
                      : 'border-slate-100 dark:border-slate-700/70',
                ].join(' ')}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {done ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : current ? (
                    <ChevronRight className="size-4 text-blue-600" />
                  ) : (
                    <Circle className="size-4 text-slate-300" />
                  )}
                </span>
                <span
                  className={
                    done
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-slate-600 dark:text-slate-300'
                  }
                >
                  <strong className="block font-semibold">{objective.label}</strong>
                  {objective.description}
                </span>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={() => setShowHint((value) => !value)}
          className="flex items-center gap-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
        >
          <Lightbulb className="size-4" />
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
        {showHint && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {template.faultPrompt ?? template.teaches}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-800/60">
        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
        >
          <RotateCcw className="size-3" /> Restart
        </button>
        <button
          type="button"
          onClick={() => useUiStore.getState().setTemplatesOpen(true)}
          className="text-[11px] font-semibold text-blue-600 dark:text-blue-300"
        >
          Next challenge
        </button>
      </div>
    </aside>
  );
}
