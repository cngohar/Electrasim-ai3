import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store';
import { Modal } from './Modal';
import { SettingsTabContent } from './settings/SettingsTabContent';
import { SETTINGS_TABS, type SettingsTab, isSettingsTab } from './settings/types';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: string | null;
}

export function SettingsModal({ open, onClose, initialTab }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('editing');
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  useEffect(() => {
    if (open && initialTab && isSettingsTab(initialTab)) setActiveTab(initialTab);
  }, [open, initialTab]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="⚡ Circuit Settings"
      description="Preferences are stored locally on this device."
      widthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={resetSettings}
            className="mr-auto flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <span className="text-[10px]">↺</span> Reset to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-blue-600 px-5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Done
          </button>
        </>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100/60 p-1 sm:grid-cols-4 dark:border-slate-700 dark:bg-slate-800/60">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-all duration-150',
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            ].join(' ')}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && <span className="ml-0.5 size-1.5 rounded-full bg-blue-500" />}
          </button>
        ))}
      </div>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        <SettingsTabContent activeTab={activeTab} />
      </div>
    </Modal>
  );
}
