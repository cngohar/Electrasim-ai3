/**
 * ChallengePanel — declarative Challenge Mode UI (plan §16–§19).
 *
 * Three views in one lazy component:
 *   1. Learn hub    — Continue Challenge (when one exists) + challenge cards.
 *   2. Active       — objective, steps, rule checklist, Check / Hint / Reset.
 *   3. Complete     — the educational celebration (time + hints, never coins).
 *
 * The panel owns no electrical logic: it renders `declarativeChallengeStore`
 * state and delegates every verdict to `domain/challenges/declarative`.
 *
 * Accessibility (plan §35): verdict region is a polite live region; every
 * control is a real button with an accessible name; Escape closes dialogs.
 */

import {
  Check,
  ChevronRight,
  CircleAlert,
  Download,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Target,
  Timer,
  Trophy,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CHALLENGE_DEFINITIONS,
  type ChallengeDefinition,
  describeExtraComponents,
  formatElapsedDeclarative,
} from '../../domain/challenges/declarative';
import { useUiStore } from '../../store';
import { useDeclarativeChallengeStore } from '../../store/declarativeChallengeStore';
import { Modal } from './Modal';

interface Props {
  isPhone: boolean;
}

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
  const totalElapsedMs = useDeclarativeChallengeStore((s) => s.totalElapsedMs);
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return formatElapsedDeclarative(totalElapsedMs());
}

function difficultyBadge(difficulty: ChallengeDefinition['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
  }
}

export function ChallengePanel({ isPhone }: Props) {
  const status = useDeclarativeChallengeStore((s) => s.status);
  const definition = useDeclarativeChallengeStore((s) => s.definition);
  const verdict = useDeclarativeChallengeStore((s) => s.verdict);
  const attempts = useDeclarativeChallengeStore((s) => s.attempts);
  const hintsUsed = useDeclarativeChallengeStore((s) => s.hintsUsed);
  const progress = useDeclarativeChallengeStore((s) => s.progress);
  const confirmingExit = useDeclarativeChallengeStore((s) => s.confirmingExit);
  const resumePrompt = useDeclarativeChallengeStore((s) => s.resumePrompt);

  const start = useDeclarativeChallengeStore((s) => s.start);
  const check = useDeclarativeChallengeStore((s) => s.check);
  const revealHint = useDeclarativeChallengeStore((s) => s.revealHint);
  const resetChallenge = useDeclarativeChallengeStore((s) => s.resetChallenge);
  const requestExit = useDeclarativeChallengeStore((s) => s.requestExit);
  const cancelExit = useDeclarativeChallengeStore((s) => s.cancelExit);
  const exitToMyCircuit = useDeclarativeChallengeStore((s) => s.exitToMyCircuit);
  const keepCopy = useDeclarativeChallengeStore((s) => s.keepCopy);
  const resumeActive = useDeclarativeChallengeStore((s) => s.resumeActive);
  const returnFromReload = useDeclarativeChallengeStore((s) => s.returnFromReload);
  const refreshProgress = useDeclarativeChallengeStore((s) => s.refreshProgress);

  const setChallengeOpen = useUiStore((s) => s.setChallengeOpen);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    void refreshProgress();
  }, [refreshProgress]);

  const elapsedLabel = useElapsedLabel(status === 'active');
  const [showSteps, setShowSteps] = useState(true);
  // All hooks must run unconditionally — the conditional returns below are
  // view switches only (React rules of hooks).
  const visibleHints = useMemo(
    () => (definition ? definition.hints.slice(0, hintsUsed) : []),
    [definition, hintsUsed],
  );
  // §19: on phones the bottom sheet can cover the canvas — the learner may
  // collapse it to a floating pill and bring it back, exactly like the
  // guided panel's hide affordance.
  const [panelHidden, setPanelHidden] = useState(false);

  if (isPhone && panelHidden && status === 'active') {
    return (
      <button
        type="button"
        onClick={() => setPanelHidden(false)}
        aria-label="Show challenge panel"
        className="absolute bottom-20 right-3 z-20 flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-2 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl transition hover:bg-blue-50 dark:border-slate-700/80 dark:bg-slate-900/95 dark:ring-slate-700/50 dark:hover:bg-slate-800"
      >
        <span className="grid size-6 place-items-center rounded-lg bg-blue-600 text-white">
          <Target className="size-3.5" />
        </span>
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          Challenge
        </span>
        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {Math.round((verdict?.completion ?? 0) * 100)}%
        </span>
      </button>
    );
  }

  const shell = [
    'absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:ring-slate-700/50',
    isPhone
      ? 'bottom-20 left-3 right-3 max-h-[52vh]'
      : 'right-14 top-24 w-56 max-h-[calc(100vh-8rem)] lg:w-[340px]',
  ].join(' ');

  const closePanel = () => {
    setChallengeOpen(false);
  };

  // ── Resume prompt (§14: never silently choose) ─────────────────────────
  if (resumePrompt) {
    return (
      <Modal open onClose={closePanel} title="Continue Challenge?" aria-label="Continue Challenge?">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          You were in the middle of a challenge. Continue where you left off, or return to your
          saved circuit?
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            onClick={() => void resumeActive()}
          >
            Continue Challenge
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => void returnFromReload()}
          >
            Return to My Circuit
          </button>
        </div>
      </Modal>
    );
  }

  // ── Exit confirmation (§13) ─────────────────────────────────────────────
  if (confirmingExit && definition) {
    return (
      <Modal open onClose={cancelExit} title="Leave Challenge?" aria-label="Leave Challenge?">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Your challenge build will be discarded. You can return to your saved circuit, or keep a
          copy of the challenge circuit as a normal ElectraSim JSON file.
        </p>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            onClick={() => void exitToMyCircuit()}
          >
            Return to My Circuit
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={keepCopy}
          >
            <Download className="size-3.5" /> Keep a Copy
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={cancelExit}
          >
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  // ── Idle: Learn hub (§16, §17) ──────────────────────────────────────────
  if (status === 'idle' || status === 'exited' || status === 'abandoned' || !definition) {
    const hasUnfinished = status === 'abandoned';
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
            onClick={closePanel}
            aria-label="Close Challenge Mode"
            className="ml-auto rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {hasUnfinished && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-left transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:hover:bg-blue-900/40"
              onClick={() => void resumeActive()}
            >
              <ChevronRight className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[12px] font-semibold text-blue-800 dark:text-blue-200">
                Continue Challenge
              </span>
            </button>
          )}

          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            Structured challenges that walk you through real wiring skills. No timers, no scores —
            just build it right.
          </p>

          {CHALLENGE_DEFINITIONS.map((challenge) => {
            const done = progress[challenge.id]?.completed === true;
            return (
              <div
                key={challenge.id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">
                    {challenge.title}
                  </span>
                  {done && <Check className="size-3.5 text-emerald-600" aria-label="Completed" />}
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  {difficultyBadge(challenge.difficulty)} · ~{challenge.estimatedMinutes} minutes
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {challenge.objective}
                </p>
                <button
                  type="button"
                  onClick={() => void start(challenge.id)}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-500"
                >
                  {done ? 'Retry' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── Completed: celebration (§32) ───────────────────────────────────────
  if (status === 'completed') {
    const next = CHALLENGE_DEFINITIONS.find(
      (c) => !progress[c.id]?.completed && c.id !== definition.id,
    );
    return (
      <section className={shell} aria-label="Challenge complete">
        <div
          className={[
            'flex flex-col items-center gap-1 border-b border-emerald-200/70 bg-emerald-50 px-3 py-4 text-center dark:border-emerald-900/60 dark:bg-emerald-950/50',
            reducedMotion ? '' : 'animate-in fade-in zoom-in-95 duration-300',
          ].join(' ')}
        >
          <Trophy className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-200">COMPLETE!</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{definition.title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-200">
            {definition.completionMessage}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px bg-slate-200 text-center dark:bg-slate-700">
          {[
            ['Time', elapsedLabel],
            ['Checks', String(attempts)],
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
        <div className="flex flex-col gap-2 p-3">
          {next && (
            <button
              type="button"
              onClick={() => void start(next.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-blue-500"
            >
              Next Challenge <ChevronRight className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => void start(definition.id)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Review Circuit
          </button>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Return to My Circuit
          </button>
        </div>
      </section>
    );
  }

  // ── Active (§19) ────────────────────────────────────────────────────────
  const completionPct = Math.round((verdict?.completion ?? 0) * 100);

  return (
    <section className={shell} aria-label="Challenge Mode">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80">
        <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
          <Target className="size-3.5" />
        </span>
        <div className="min-w-[7rem] flex-1">
          <h2 className="truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">
            {definition.title}
          </h2>
          <p className="text-[9px] uppercase tracking-wide text-slate-500">
            {difficultyBadge(definition.difficulty)}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Timer className="size-3" aria-hidden="true" />
          <span aria-label={`Elapsed time ${elapsedLabel}`}>{elapsedLabel}</span>
        </span>
        <button
          type="button"
          onClick={closePanel}
          aria-label="Close Challenge Mode"
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="size-4" />
        </button>
        {isPhone && (
          <button
            type="button"
            onClick={() => setPanelHidden(true)}
            aria-label="Hide challenge panel"
            title="Collapse to a pill so the canvas stays reachable"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        <p className="text-[11px] font-medium leading-relaxed text-slate-700 dark:text-slate-200">
          {definition.objective}
        </p>
        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
          {definition.brief}
        </p>

        {/* Steps (§5) */}
        <div>
          <button
            type="button"
            onClick={() => setShowSteps((open) => !open)}
            aria-expanded={showSteps}
            className="flex w-full items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ListChecks className="size-3" aria-hidden="true" />
            Steps ({definition.steps.length})
          </button>
          {showSteps && (
            <ol className="mt-1 space-y-0.5">
              {definition.steps.map((step) => (
                <li
                  key={step.no}
                  className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                >
                  <span className="mt-px shrink-0 text-[10px] font-bold tabular-nums text-slate-400">
                    {step.no}.
                  </span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Progress meter (§19) */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-wide text-slate-500">
            <span>Progress</span>
            <span className="tabular-nums">{completionPct}%</span>
          </div>
          <progress
            className="h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-blue-600 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-600 dark:[&::-webkit-progress-bar]:bg-slate-700"
            value={completionPct}
            max={100}
            aria-label="Challenge progress"
          >
            {completionPct}%
          </progress>
        </div>

        {/* Rule checklist (plan §6, §9) */}
        {verdict && (
          <ul className="space-y-0.5" aria-label="Rule checklist">
            {verdict.rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
              >
                {rule.verdict === 'pass' ? (
                  <Check
                    className="mt-px size-3 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleAlert
                    className="mt-px size-3 shrink-0 text-amber-500"
                    aria-hidden="true"
                  />
                )}
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Verdict (live region — plan §35) */}
        <div aria-live="polite" className="space-y-1.5">
          {verdict && verdict.state !== 'complete' && (
            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/50">
              <p className="flex items-start gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                <CircleAlert className="mt-px size-3 shrink-0" aria-hidden="true" />
                {verdict.summary}
              </p>
              {verdict.nextRule?.reason && (
                <p className="mt-1 text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
                  Next: {verdict.nextRule.reason}
                </p>
              )}
            </div>
          )}
          {verdict && verdict.extraComponents.length > 0 && (
            <p className="rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {describeExtraComponents(verdict.extraComponents)}
            </p>
          )}
        </div>

        {/* Hints (plan §10) */}
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

      <footer className="flex items-center gap-1.5 border-t border-slate-200/80 p-2.5 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => check()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-blue-500"
        >
          <Check className="size-3.5" aria-hidden="true" />
          Check circuit
        </button>
        <button
          type="button"
          onClick={revealHint}
          disabled={hintsUsed >= definition.hints.length}
          aria-label={`Reveal hint (${hintsUsed} of ${definition.hints.length} used)`}
          title="Hints never cost you the challenge"
          className="rounded-xl border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Lightbulb className="size-4" />
        </button>
        <button
          type="button"
          onClick={resetChallenge}
          aria-label="Reset challenge"
          title="Restore this challenge's starter circuit"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={requestExit}
          aria-label="Exit challenge"
          title="Leave challenge"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <X className="size-4" />
        </button>
      </footer>
      <p className="sr-only" aria-live="polite">
        {attempts > 0 ? `${attempts} checks made.` : ''}
      </p>
    </section>
  );
}
