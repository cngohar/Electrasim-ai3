/**
 * useDevice — viewport-driven device-class hook.
 *
 * Returns one of: 'desktop' | 'tablet' | 'phone' based on viewport width.
 * Breakpoints align with Tailwind defaults so we can mix this hook with
 * `md:` / `lg:` classes if/when needed.
 *
 *   phone   :        w < 640px   (tailwind `<sm`)
 *   tablet  : 640px ≤ w < 1024px (tailwind `sm` to `<lg`)
 *   desktop : 1024px ≤ w        (tailwind `lg+`)
 *
 * SSR-safe: returns 'desktop' before mount; corrects on first effect.
 */
import { useEffect, useState } from 'react';

export type DeviceKind = 'desktop' | 'tablet' | 'phone';

const detect = (): DeviceKind => {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'phone';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

export function useDevice(): DeviceKind {
  const [device, setDevice] = useState<DeviceKind>(detect);

  useEffect(() => {
    const update = () => setDevice(detect());
    update(); // sync once on mount in case SSR fallback was wrong
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return device;
}
