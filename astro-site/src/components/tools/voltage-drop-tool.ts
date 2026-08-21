/**
 * Voltage Drop tool controller.
 *
 * Reads the form, runs the pure engine, writes the result into the DOM and
 * the scene. No framework: each recalculation touches a handful of text nodes
 * and two attributes, so there is no per-frame work and nothing re-renders.
 * If the scene were removed entirely the numbers would still update (§38).
 */
import {
  DEFAULT_INPUT,
  calculateVoltageDrop,
  explainCalculation,
  formatOhms,
  formatPercent,
  formatVolts,
  formatWatts,
  statusExplanation,
  validateVoltageDropInput,
  STATUS_LABEL,
} from '../../lib/tools/voltage-drop';
import type { DropStatus, VoltageDropResult } from '../../lib/tools/voltage-drop';

const STATUS_COLOUR: Record<DropStatus, string> = {
  good: '#16a34a',
  'near-limit': '#f59e0b',
  excessive: '#dc2626',
};

const STATUS_ICON: Record<DropStatus, string> = {
  good: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>',
  'near-limit': '<circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16h.01"></path>',
  excessive:
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4.5M12 17h.01"></path>',
};

export function initVoltageDropTool() {
  const form = document.querySelector<HTMLFormElement>('[data-vd-form]');
  const results = document.querySelector<HTMLElement>('[data-results]');
  if (!form || !results) return;

  const out = (k: string) => results.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const errorFor = (f: string) => form.querySelector<HTMLElement>(`[data-error-for="${f}"]`);
  const scene = document.querySelector<SVGElement>('[data-scene]');
  const flow = document.querySelector<SVGPathElement>('[data-cable-flow]');
  const callout = document.querySelector<HTMLElement>('[data-callout]');

  let systemType: string = DEFAULT_INPUT.systemType;

  const readForm = () => ({
    systemType,
    voltage: (form.elements.namedItem('voltage') as HTMLInputElement).value,
    current: (form.elements.namedItem('current') as HTMLInputElement).value,
    lengthOneWay: (form.elements.namedItem('lengthOneWay') as HTMLInputElement).value,
    cableSize: (form.elements.namedItem('cableSize') as HTMLInputElement).value,
    material: (form.elements.namedItem('material') as HTMLSelectElement).value,
  });

  function clearErrors() {
    for (const el of form.querySelectorAll<HTMLElement>('.tool-error')) el.hidden = true;
    for (const el of form.querySelectorAll<HTMLElement>('.tool-input-row')) delete el.dataset.invalid;
  }

  function paint(r: VoltageDropResult) {
    out('sourceVoltage')!.textContent = formatVolts(r.sourceVoltage);
    out('voltageAtLoad')!.textContent = formatVolts(r.voltageAtLoad);
    out('voltageDrop')!.textContent = formatVolts(r.voltageDrop);
    out('voltageDropPercent')!.textContent = formatPercent(r.voltageDropPercent);
    out('resistance')!.textContent = formatOhms(r.resistance);
    out('powerLoss')!.textContent = formatWatts(r.powerLoss);

    results.dataset.status = r.status;
    const label = results.querySelector<HTMLElement>('[data-status-label]');
    const note = results.querySelector<HTMLElement>('[data-status-note]');
    const icon = results.querySelector<SVGElement>('[data-status-icon]');
    if (label) label.textContent = STATUS_LABEL[r.status];
    if (note) note.textContent = statusExplanation(r);
    if (icon) icon.innerHTML = STATUS_ICON[r.status];

    const steps = results.querySelector<HTMLElement>('[data-explain]');
    if (steps) {
      steps.innerHTML = '';
      for (const line of explainCalculation(r)) {
        const li = document.createElement('li');
        li.textContent = line;
        steps.appendChild(li);
      }
    }

    // Scene: source/load readouts, cable colour, drop callout.
    const src = document.querySelector<SVGTextElement>('[data-source-voltage]');
    const load = document.querySelector<SVGTextElement>('[data-load-voltage]');
    if (src) src.textContent = formatVolts(r.sourceVoltage);
    if (load) load.textContent = formatVolts(r.voltageAtLoad);
    if (flow) flow.setAttribute('stroke', STATUS_COLOUR[r.status]);

    if (callout) {
      callout.querySelector('[data-callout-drop]')!.textContent = formatVolts(r.voltageDrop);
      callout.querySelector('[data-callout-pct]')!.textContent = `(${formatPercent(r.voltageDropPercent)})`;
    }

    // Heavier drop = slower, sparser dots, so the animation carries meaning.
    if (flow) {
      const ratio = Math.min(r.voltageDropPercent / (r.recommendedDropPercent * 2), 1);
      flow.style.animationDuration = `${(0.75 + ratio * 1.1).toFixed(2)}s`;
      flow.style.strokeWidth = String(7 - ratio * 2.4);
    }

    const desc = document.querySelector('[data-scene-desc]');
    if (desc) {
      desc.textContent =
        `Source at ${formatVolts(r.sourceVoltage)} feeding a load through ${r.cableLengthOneWay} m of ` +
        `${r.cableSize} mm² ${r.material}. The load sees ${formatVolts(r.voltageAtLoad)}, a drop of ` +
        `${formatVolts(r.voltageDrop)} or ${formatPercent(r.voltageDropPercent)}. Status: ${STATUS_LABEL[r.status]}.`;
    }
  }

  function showErrors(errors: { field: string; message: string }[]) {
    for (const e of errors) {
      const slot = errorFor(e.field);
      if (slot) {
        slot.textContent = e.message;
        slot.hidden = false;
      }
      const input = form.querySelector<HTMLElement>(`[name="${e.field}"]`);
      input?.closest<HTMLElement>('.tool-input-row')?.setAttribute('data-invalid', 'true');
    }
  }

  function recalc() {
    clearErrors();
    const parsed = validateVoltageDropInput(readForm());
    if (!parsed.ok) {
      showErrors(parsed.errors);
      return;
    }
    try {
      paint(calculateVoltageDrop(parsed.value));
    } catch {
      const note = results.querySelector<HTMLElement>('[data-status-note]');
      const label = results.querySelector<HTMLElement>('[data-status-label]');
      if (label) label.textContent = 'Something went wrong';
      if (note) note.textContent = 'We could not calculate this result. Use Reset to restore the defaults.';
      results.dataset.status = 'excessive';
    }
  }

  form.addEventListener('input', recalc);
  form.addEventListener('change', recalc);

  for (const btn of form.querySelectorAll<HTMLButtonElement>('[data-system]')) {
    btn.addEventListener('click', () => {
      systemType = btn.dataset.system as string;
      for (const b of form.querySelectorAll<HTMLButtonElement>('[data-system]')) {
        b.setAttribute('aria-pressed', String(b === btn));
      }
      recalc();
    });
  }

  function reset() {
    (form.elements.namedItem('voltage') as HTMLInputElement).value = String(DEFAULT_INPUT.voltage);
    (form.elements.namedItem('current') as HTMLInputElement).value = String(DEFAULT_INPUT.current);
    (form.elements.namedItem('lengthOneWay') as HTMLInputElement).value = String(DEFAULT_INPUT.lengthOneWay);
    (form.elements.namedItem('cableSize') as HTMLInputElement).value = String(DEFAULT_INPUT.cableSize);
    (form.elements.namedItem('material') as HTMLSelectElement).value = DEFAULT_INPUT.material;
    systemType = DEFAULT_INPUT.systemType;
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-system]')) {
      b.setAttribute('aria-pressed', String(b.dataset.system === systemType));
    }
    recalc();
  }

  form.querySelector('[data-vd-reset]')?.addEventListener('click', reset);
  document.addEventListener('tool:reset', reset);

  // Pause the scene when it is not on screen — nothing animates off-view.
  if (scene && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => scene.classList.toggle('scene-paused', !e.isIntersecting), {
      threshold: 0,
    }).observe(scene);
  }

  recalc();
}
