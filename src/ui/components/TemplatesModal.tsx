import {
  GUIDED_CIRCUIT_TEMPLATES,
  type GuidedCircuitTemplate,
  cloneTemplateCircuit,
} from '../../domain/templates';
import { isChallengeCompleted } from '../../lib/challengeProgressPersistence';
import { useCircuitStore, useUiStore } from '../../store';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

function difficultyClass(difficulty: GuidedCircuitTemplate['difficulty']): string {
  return difficulty === 'Beginner'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
    : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
}

export function TemplatesModal({ open, onClose }: Props) {
  const componentCount = useCircuitStore((s) => s.components.length);
  const wireCount = useCircuitStore((s) => s.wires.length);
  const hasCircuit = componentCount > 0 || wireCount > 0;

  const loadTemplate = (template: GuidedCircuitTemplate) => {
    if (
      hasCircuit &&
      !window.confirm(
        'Replace the current canvas with this guided circuit? You can undo after loading.',
      )
    ) {
      return;
    }

    useCircuitStore.getState().setCircuit(cloneTemplateCircuit(template));
    const ui = useUiStore.getState();
    ui.setActiveGuideId(template.id);
    ui.setSimRunning(false);
    ui.setSimResult(null);
    ui.setPendingWireFrom(null);
    ui.setPlacingType(null);
    ui.setReroute(null);
    ui.cancelCustomPath();
    ui.addLog(`Loaded guided circuit: ${template.title}`, 'success');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Guided Circuits"
      description="Load a ready-made circuit and follow a short checklist inside the simulator."
      widthClass="max-w-4xl"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {GUIDED_CIRCUIT_TEMPLATES.map((template) => (
          <article
            key={template.id}
            className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-blue-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {template.title}
                </h3>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {template.topic}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${difficultyClass(template.difficulty)}`}
                >
                  {template.difficulty}
                </span>
                <span
                  className={`text-[10px] font-semibold ${isChallengeCompleted(template.id) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                  {isChallengeCompleted(template.id) ? 'Completed' : 'Not started'}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {template.summary}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {template.teaches}
            </p>

            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700/70 dark:bg-slate-800/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                First steps
              </div>
              <ol className="mt-1 space-y-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                {template.steps.slice(0, 2).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={() => loadTemplate(template)}
              className="mt-auto w-full rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Load guide
            </button>
          </article>
        ))}
      </div>
    </Modal>
  );
}
