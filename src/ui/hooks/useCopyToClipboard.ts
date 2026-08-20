/**
 * Copy text to the clipboard and flash a confirmation (plan §30).
 *
 * Shared by the Diagnosis Lab and Challenge Mode so both panels behave
 * identically — the "Copy seed" affordance is the same promise in both places.
 *
 * Falls back to a hidden textarea + `execCommand` because the async Clipboard
 * API is unavailable on insecure origins and in older mobile browsers, and
 * this feature is meant to work offline in exactly those places (§3).
 */

import { useEffect, useState } from 'react';

export function useCopyToClipboard(resetMs = 1600): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), resetMs);
    return () => clearTimeout(timer);
  }, [copied, resetMs]);

  const copy = (text: string) => {
    const fallback = () => {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        setCopied(true);
      } catch {
        // Clipboard is genuinely unavailable. The seed stays visible on screen,
        // so the learner can still write it down — §47: never dead-end.
        setCopied(false);
      }
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => setCopied(true), fallback);
    } else {
      fallback();
    }
  };

  return [copied, copy];
}
