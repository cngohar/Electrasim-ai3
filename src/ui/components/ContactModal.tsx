/**
 * ContactModal — Phase 6.6 contact popup.
 *
 * Shows a brief instruction panel with a Google Forms link that opens in a
 * new tab. To change the form URL, edit the `CONTACT_FORM_URL` constant
 * below.
 *
 * ## How to change the Google Forms link
 *
 * 1. Open this file (`src/ui/components/ContactModal.tsx`).
 * 2. Replace the `CONTACT_FORM_URL` string with your new Google Forms URL.
 * 3. Save — the app hot-reloads immediately.
 */

import { ExternalLink, Mail, MessageSquare } from 'lucide-react';
import { Modal } from './Modal';

const CONTACT_FORM_URL = 'https://forms.gle/z1eED6sbmXmZrRKT8';

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ContactModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contact Us"
      description="Have a question, bug report, or feature request? We'd love to hear from you."
      widthClass="max-w-md"
    >
      <div className="space-y-4">
        {/* Instructions */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare className="size-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              How to reach us
            </span>
          </div>
          <ol className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span className="grid size-5 flex-shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                1
              </span>
              <span>
                Click the button below to open our contact form in a <strong>new tab</strong>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="grid size-5 flex-shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                2
              </span>
              <span>
                Fill in your <strong>name</strong>, <strong>email</strong>, and{' '}
                <strong>message</strong>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="grid size-5 flex-shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                3
              </span>
              <span>Submit the form — we'll get back to you as soon as possible.</span>
            </li>
          </ol>
        </div>

        {/* What to include */}
        <div className="rounded-xl border border-slate-100 bg-white/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
          <div className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            What to include
          </div>
          <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 size-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span>
                <strong className="text-slate-700 dark:text-slate-300">Bug report</strong> — steps
                to reproduce, what you expected vs. what happened.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 size-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              <span>
                <strong className="text-slate-700 dark:text-slate-300">Feature request</strong> —
                describe the behaviour you'd like to see.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 size-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              <span>
                <strong className="text-slate-700 dark:text-slate-300">General question</strong> —
                anything about ElectraSim.
              </span>
            </li>
          </ul>
        </div>

        {/* CTA button */}
        <a
          href={CONTACT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <Mail className="size-4" />
          Open Contact Form
          <ExternalLink className="size-3.5 opacity-60" />
        </a>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
          The form opens in a new tab via Google Forms.
        </p>
      </div>
    </Modal>
  );
}
