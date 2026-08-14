/**
 * useResolvedTheme — Phase 6.8 dark theme support.
 *
 * Resolves the effective color scheme from the user's `colorScheme`
 * setting ('light' | 'dark' | 'system'). When 'system', it listens
 * to `prefers-color-scheme` media query changes.
 */

import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store';
import { DARK_MODE_QUERY, resolveThemePreference } from '../themePreference';

function getSystemPreference(): 'light' | 'dark' {
  return resolveThemePreference('system');
}

export function useResolvedTheme(): 'light' | 'dark' {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const [systemPref, setSystemPref] = useState(getSystemPreference);

  useEffect(() => {
    if (colorScheme !== 'system') return;
    const mq = window.matchMedia(DARK_MODE_QUERY);
    const handler = () => setSystemPref(mq.matches ? 'dark' : 'light');
    // The OS preference may have changed while an explicit app theme was
    // selected. Refresh immediately before subscribing so switching back to
    // System never renders the stale value captured at mount.
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [colorScheme]);

  if (colorScheme === 'system') return systemPref;
  return colorScheme;
}
