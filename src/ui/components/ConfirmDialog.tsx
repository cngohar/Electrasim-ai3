/**
 * ConfirmDialog — destructive-action confirmation (Phase 6.1).
 *
 * Used by component + wire deletion when `settings.confirmDelete === true`.
 * Stateless; the parent owns whether it's open and what action to fire.
 */

import { useEffect, useRef } from 'react';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When set, renders an "Always do this — don't ask again" checkbox. */
  alwaysDoLabel?: string;
  alwaysDo?: boolean;
  onAlwaysDoChange?: (v: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  /** `'danger'` shows a red confirm button; `'primary'` blue. */
  intent?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  alwaysDoLabel,
  alwaysDo,
  onAlwaysDoChange,
  onConfirm,
  onCancel,
  intent = 'danger',
}: Props) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmCls =
    intent === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20';

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onConfirm, onCancel]);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {alwaysDoLabel ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={alwaysDo ?? false}
            onChange={(e) => onAlwaysDoChange?.(e.target.checked)}
            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          {alwaysDoLabel}
        </label>
      ) : (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          This action cannot be undone via this dialog.
        </p>
      )}
    </Modal>
  );
}
