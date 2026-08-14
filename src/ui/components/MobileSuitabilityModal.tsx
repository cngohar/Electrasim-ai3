import { MonitorSmartphone } from 'lucide-react';
import { useUiStore } from '../../store';
import { Modal } from './Modal';

/** One-time advisory for users who open the editor on a phone-sized viewport. */
export function MobileSuitabilityModal() {
  const open = useUiStore((state) => state.mobileSuitabilityOpen);
  const continueOnPhone = () => useUiStore.getState().dismissMobileSuitability();

  return (
    <Modal
      open={open}
      onClose={continueOnPhone}
      title="ElectraSim works best on a larger screen"
      description="You can continue on this phone, but placing components, wiring ports, and inspecting a circuit are easier on a tablet or computer."
      footer={
        <button
          type="button"
          onClick={continueOnPhone}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Continue
        </button>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-200">
        <MonitorSmartphone aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p>Your circuit and all editor features remain available if you continue.</p>
      </div>
    </Modal>
  );
}
