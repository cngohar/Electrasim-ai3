/**
 * ChallengePanel — Challenge Mode UI (plan §14 layout conventions, §17 hints,
 * §18 attempts, §19 celebration, §22 abandon confirmation, §46 a11y).
 *
 * The panel owns no electrical logic whatsoever. It renders
 * `challengeStore` state and calls its actions; every verdict comes from
 * `domain/challenges` (scenario → evaluate → score).
 *
 * Accessibility (plan §46):
 *   - the objective/result region is a polite live region, so verdicts are
 *     announced without stealing focus;
 *   - the celebration respects `prefers-reduced-motion` (§19) — the confetti
 *     burst is replaced by a static success state;
 *   - every control is a real button with an accessible name.
 */

import {
  Check,
  ChevronRight,
  CircleAlert,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trophy,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ChallengeDifficulty } from '../../domain/challenges';
import { formatElapsed } from '../../domain/challenges';
import { useCircuitStore, useUiStore } from '../../store';
import { useChallengeStore } from '../../store/challengeStore';

interface Props {
  isPhone: boolean;
}

const DIFFICULTIES: { id: ChallengeDifficulty; label: string; blurb: string }[] = [
  { id: 'beginner', label: 'Beginner', blurb: 'One load, short path' },
  { id: 'intermediate', label: 'Intermediate', blurb: 'Branches and switching' },
  { id: 'advanced', label: 'Advanced', blurb: 'Multi-branch installation' },
];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Live mm:ss ticker driven off the store's monotonic accounting. */
function useElapsedLabel(active: boolean): string {
  const totalElapsedMs = useChallengeStore((s) => s.totalElapsedMs);
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return formatElapsed(totalElapsedMs());
}

export function ChallengePanel({ isPhone }: Props) {
  const status = useChallengeStore((s) => s.status);
  const scenario = useChallengeStore((s) => s.scenario);
  const evaluation = useChallengeStore((s) => s.evaluation);
  const score = useChallengeStore((s) => s.score);
  const attempts = useChallengeStore((s) => s.attempts);
  const hintsUsed = useChallengeStore((s) => s.hintsUsed);
  const error = useChallengeStore((s) => s.error);
  const confirmingNew = useChallengeStore((s) => s.confirmingNew);
  const start = useChallengeStore((s) => s.start);
  const submit = useChallengeStore((s) => s.submit);
  const revealHint = useChallengeStore((s) => s.revealHint);
  const abandon = useChallengeStore((s) => s.abandon);
  const requestNew = useChallengeStore((s) => s.requestNew);
  const cancelNew = useChallengeStore((s) => s.cancelNew);
  const exitChallenge = useChallengeStore((s) => s.exit);
  const setChallengeOpen = useUiStore((s) => s.setChallengeOpen);
  const exit = () => {
    exitChallenge();
    setChallengeOpen(false);
  };

  const componentCount = useCircuitStore((s) => s.components.length);
  const reducedMotion = usePrefersReducedMotion();
  const elapsedLabel = useElapsedLabel(status === 'active');

  const [showChecklist, setShowChecklist] = useState(true);

  // Dock on the right, clear of the Inspector's 48px collapsed icon rail —
  // the same placement the guided panel uses. Challenge Mode needs the
  // component palette (left) to stay reachable, since the whole task is
  // dragging parts onto the canvas.
  const shell = [
    'absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:ring-slate-700/50',
    isPhone
      ? 'bottom-20 left-3 right-3 max-h-[52vh]'
      : 'right-14 top-24 w-56 max-h-[calc(100vh-8rem)] lg:w-[340px]',
  ].join(' ');

  const visibleHints = useMemo(
    () => (scenario ? scenario.hints.slice(0, hintsUsed) : []),
    [scenario, hintsUsed],
  );

  // ── Idle: difficulty picker ─────────────────────────────────────────────
  if (status === 'idle' || status === 'abandoned' || !scenario) {
    return (
      <section className={shell} aria-label="Challenge Mode">
        <header className="flex items-center gap-2 border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80">
          <span className="grid size-6 place-items-center rounded-lg bg-blue-600 text-white">
            <Target className="size-3.5" />
          </span>
          <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            Challenge Mode
          </h2>
          <button
            type="button"
            onClick={exit}
            aria-label="Close Challenge Mode"
            className="ml-auto rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="space-y-2 p-3">
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            Build the circuit described in the brief. Pick a difficulty to begin.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-2 py-1.5 text-[11px] font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300"
            >
              {error}
            </p>
          )}
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.id}
              type="button"
              onClick={() => void start(difficulty.id)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800"
            >
              <Play className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span className="flex-1">
                <span className="block text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                  {difficulty.label}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                  {difficulty.blurb}
                </span>
              </span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ── Completed: celebration (plan §19) ───────────────────────────────────
  if (status === 'completed' && score) {
    return (
      <section className={shell} aria-label="Challenge complete">
        <div
          className={[
            'flex flex-col items-center gap-1 border-b border-emerald-200/70 bg-emerald-50 px-3 py-4 text-center dark:border-emerald-900/60 dark:bg-emerald-950/50',
            reducedMotion ? '' : 'animate-in fade-in zoom-in-95 duration-300',
          ].join(' ')}
        >
          <Trophy className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-200">
            🎉 CIRCUIT COMPLETE!
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{scenario.title}</p>
          <p className="mt-1 text-[20px] font-black tabular-nums text-emerald-700 dark:text-emerald-300">
            {score.points}
            <span className="ml-1 text-[11px] font-semibold uppercase">{score.grade}</span>
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px bg-slate-200 text-center dark:bg-slate-700">
          {[
            ['Time', elapsedLabel],
            ['Attempts', String(attempts)],
            ['Hints', String(hintsUsed)],
          ].map(([label, value]) => (
            <div key={label} className="bg-white px-2 py-2 dark:bg-slate-900">
              <dt className="text-[9px] uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="text-[13px] font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2 p-3">
          <button
            type="button"
            onClick={() => void start(scenario.difficulty)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-blue-500"
          >
            Next Circuit <ChevronRight className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={exit}
            className="rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </section>
    );
  }

  // ── Active ──────────────────────────────────────────────────────────────
  const completionPct = Math.round((evaluation?.completion ?? 0) * 100);

  return (
    <section className={shell} aria-label="Challenge Mode">
      <header className="flex items-center gap-2 border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80">
        <span className="grid size-6 place-items-center rounded-lg bg-blue-600 text-white">
          <Target className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">
            {scenario.title}
          </h2>
          <p className="text-[9px] uppercase tracking-wide text-slate-500">
            {scenario.difficulty} · {scenario.challengeId}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Timer className="size-3" aria-hidden="true" />
          <span aria-label={`Elapsed time ${elapsedLabel}`}>{elapsedLabel}</span>
        </span>
      </header>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        <p className="text-[11px] font-medium leading-relaxed text-slate-700 dark:text-slate-200">
          {scenario.objective}
        </p>
        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
          {scenario.brief}
        </p>

        {/* Progress meter */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-wide text-slate-500">
            <span>Progress</span>
            <span className="tabular-nums">{completionPct}%</span>
          </div>
          {/*
            Native <progress> rather than a div with role="progressbar": it
            carries the same semantics without introducing an extra keyboard
            tab stop in an editor that is already dense with controls.
          */}
          <progress
            className="h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-blue-600 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-600 [&::-webkit-progress-value]:transition-[inline-size] dark:[&::-webkit-progress-bar]:bg-slate-700"
            value={completionPct}
            max={100}
            aria-label="Challenge progress"
          >
            {completionPct}%
          </progress>
        </div>

        {/* Required parts checklist */}
        <div>
          <button
            type="button"
            onClick={() => setShowChecklist((open) => !open)}
            aria-expanded={showChecklist}
            className="flex w-full items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ListChecks className="size-3" aria-hidden="true" />
            Parts needed ({scenario.targetComponentCount})
          </button>
          {showChecklist && (
            <ul className="mt-1 space-y-0.5">
              {scenario.componentRequirements.map((requirement) => {
                const missing = evaluation?.comparison.missingComponents.find(
                  (entry) => entry.type === requirement.type,
                );
                const satisfied = !missing;
                return (
                  <li
                    key={requirement.type}
                    className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    {satisfied ? (
                      <Check
                        className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="size-3 shrink-0 rounded-full border border-slate-300 dark:border-slate-600"
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex-1">{requirement.label}</span>
                    <span className="tabular-nums text-slate-400">×{requirement.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Verdict (live region — plan §46) */}
        <div aria-live="polite" className="space-y-1.5">
          {evaluation && !evaluation.success && (
            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/50">
              <p className="flex items-start gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                <CircleAlert className="mt-px size-3 shrink-0" aria-hidden="true" />
                {evaluation.summary}
              </p>
              <ul className="mt-1 space-y-0.5 pl-4">
                {evaluation.issues.slice(0, 4).map((issue) => (
                  <li
                    key={`${issue.stage}-${issue.message}`}
                    className="list-disc text-[10px] leading-relaxed text-amber-700 dark:text-amber-300"
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Hints (plan §17) */}
        {visibleHints.length > 0 && (
          <ul className="space-y-1">
            {visibleHints.map((hint) => (
              <li
                key={hint.level}
                className="rounded-lg bg-blue-50 px-2 py-1.5 text-[10px] leading-relaxed text-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
              >
                <span className="font-bold uppercase">Hint {hint.level}</span> — {hint.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Abandon confirmation (plan §22) */}
      {confirmingNew && (
        <div className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
            Start another challenge?
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Your current build will be marked as abandoned.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const difficulty = scenario.difficulty;
                void abandon().then(() => start(difficulty));
              }}
              className="flex-1 rounded-lg bg-red-600 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-red-500"
            >
              Start new
            </button>
            <button
              type="button"
              onClick={cancelNew}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200"
            >
              Keep building
            </button>
          </div>
        </div>
      )}

      <footer className="flex items-center gap-1.5 border-t border-slate-200/80 p-2.5 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => submit()}
          disabled={componentCount === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="size-3.5" aria-hidden="true" />
          Check circuit
        </button>
        <button
          type="button"
          onClick={revealHint}
          disabled={hintsUsed >= scenario.hints.length}
          aria-label={`Reveal hint (${hintsUsed} of ${scenario.hints.length} used)`}
          title="Hints never cost you the challenge"
          className="rounded-xl border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Lightbulb className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!requestNew()) void start(scenario.difficulty);
          }}
          aria-label="New challenge"
          title="New challenge"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw className="size-4" />
        </button>
      </footer>
      <p className="sr-only" aria-live="polite">
        {attempts > 0 ? `${attempts} attempts made.` : ''}
      </p>
    </section>
  );
}
