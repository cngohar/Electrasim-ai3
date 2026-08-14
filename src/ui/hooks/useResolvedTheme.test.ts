import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../../store';
import { useResolvedTheme } from './useResolvedTheme';

describe('useResolvedTheme', () => {
  afterEach(() => {
    act(() => useSettingsStore.setState({ colorScheme: 'light' }));
    vi.restoreAllMocks();
  });

  it('refreshes a changed OS preference when System is selected later', async () => {
    let prefersDark = false;
    const mediaQuery: MediaQueryList = {
      get matches() {
        return prefersDark;
      },
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    } satisfies MediaQueryList;
    vi.spyOn(window, 'matchMedia').mockReturnValue(mediaQuery);
    useSettingsStore.setState({ colorScheme: 'light' });

    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe('light');

    prefersDark = true;
    act(() => useSettingsStore.getState().setSetting('colorScheme', 'system'));

    await waitFor(() => expect(result.current).toBe('dark'));
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
