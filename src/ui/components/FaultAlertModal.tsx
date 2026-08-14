import { AlertTriangle, Flame, HelpCircle, RefreshCw, X, Zap } from 'lucide-react';
import { useRef } from 'react';
import { useCircuitStore, useUiStore } from '../../store';
import { useDialogFocus } from '../hooks/useDialogFocus';

export function FaultAlertModal() {
  const faultAlert = useUiStore((s) => s.faultAlert);
  const clearFaultAlert = useUiStore((s) => s.clearFaultAlert);
  const setWhatHappenedOpen = useUiStore((s) => s.setWhatHappenedOpen);
  const repairAllFaults = useCircuitStore((s) => s.repairAllFaults);
  const panelRef = useRef<HTMLDialogElement | null>(null);
  useDialogFocus(Boolean(faultAlert), clearFaultAlert, panelRef);

  if (!faultAlert) return null;

  const handleRepair = () => {
    repairAllFaults();
    clearFaultAlert();
  };

  const handleWhatHappened = () => {
    setWhatHappenedOpen(true);
    clearFaultAlert();
  };

  const handleAdjustInInspector = () => {
    if (faultAlert.deviceId) {
      useCircuitStore.getState().selectComponent(faultAlert.deviceId);
    } else if (faultAlert.wireId) {
      useCircuitStore.getState().selectWire(faultAlert.wireId);
    } else {
      const cs = useCircuitStore.getState();
      const blownComp = cs.components.find((c) => c.state?.isBlown);
      if (blownComp) {
        cs.selectComponent(blownComp.id);
      } else {
        const bustedWire = cs.wires.find((w) => w.isBusted);
        if (bustedWire) {
          cs.selectWire(bustedWire.id);
        }
      }
    }
    useUiStore.getState().setInspectorCollapsed(false);
    useUiStore.getState().setInspectorOpen(true);
    clearFaultAlert();
  };

  const isMelt = faultAlert.kind === 'melt';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <dialog
        open
        ref={panelRef}
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="fault-alert-title"
        className={`w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 ${
          isMelt
            ? 'border-red-500/50 shadow-red-500/20 dark:border-red-600/60'
            : 'border-amber-500/50 shadow-amber-500/20 dark:border-amber-600/60'
        }`}
      >
        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
              isMelt
                ? 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
            }`}
          >
            {isMelt ? (
              <Flame className="h-7 w-7 animate-bounce text-red-600 dark:text-red-400" />
            ) : (
              <Zap className="h-7 w-7 animate-pulse text-amber-600 dark:text-amber-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="fault-alert-title"
                className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
              >
                {faultAlert.title}
              </h2>
              <button
                type="button"
                onClick={clearFaultAlert}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {faultAlert.deviceName && (
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {faultAlert.deviceName}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {faultAlert.reason}
          </p>

          {/* Metrics Card */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Current Demand
              </span>
              <span className="text-base font-extrabold font-mono text-red-600 dark:text-red-400">
                {faultAlert.currentAmps.toFixed(1)} A
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {isMelt ? 'Cable Capacity' : 'Protection Rating'}
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {faultAlert.limitAmps.toFixed(1)} A
              </span>
            </div>
          </div>

          {/* Action Hint */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">How to Resolve Issue:</strong>
              {faultAlert.resolutionHint}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleWhatHappened}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/80"
          >
            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            What Happened?
          </button>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <button
              type="button"
              onClick={handleAdjustInInspector}
              className="w-1/2 sm:w-auto rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Adjust in Inspector
            </button>
            <button
              type="button"
              onClick={handleRepair}
              className={`w-1/2 sm:w-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                isMelt
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                  : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Repair & Reset
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
