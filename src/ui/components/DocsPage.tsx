import { useEffect, useMemo, useState } from 'react';
import { useUiStore } from '../../store';
import { DocsContent } from './docs/DocsContent';
import { DocsHeader, DocsNavigation } from './docs/DocsNavigation';
import { buildComponentGroups } from './docs/data';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DocsPage({ open, onClose }: Props) {
  const scrollTarget = useUiStore((state) => state.docsScrollTo);
  const groups = useMemo(buildComponentGroups, []);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    if (!open || !scrollTarget) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      useUiStore.getState().setDocsOpen(true, null);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, scrollTarget]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 dark:text-slate-100">
      <DocsHeader
        tocOpen={tocOpen}
        onClose={onClose}
        onToggleContents={() => setTocOpen((value) => !value)}
      />
      <div className="mx-auto flex max-w-3xl gap-8 px-6 py-8">
        <DocsNavigation tocOpen={tocOpen} onNavigate={() => setTocOpen(false)} />
        <DocsContent groups={groups} />
      </div>
    </div>
  );
}
