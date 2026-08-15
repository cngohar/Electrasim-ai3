import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MOBILE_SUITABILITY_STORAGE_KEY, useUiStore } from '../../store/uiStore';
import { MobileSuitabilityModal } from './MobileSuitabilityModal';

function resetOnboardingState() {
  act(() => {
    useUiStore.setState({ mobileSuitabilityOpen: false, welcomeOpen: false });
  });
}

beforeEach(() => {
  window.localStorage.clear();
  resetOnboardingState();
});

afterEach(() => {
  window.localStorage.clear();
  resetOnboardingState();
});

describe('MobileSuitabilityModal', () => {
  it('explains the phone limitation and continues into first-visit Welcome', async () => {
    useUiStore.setState({ mobileSuitabilityOpen: true });
    render(<MobileSuitabilityModal />);

    expect(
      screen.getByRole('dialog', { name: 'ElectraSim works best on a larger screen' }),
    ).toBeVisible();
    expect(screen.getByText(/placing components, wiring ports/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // The modal plays a 200 ms exit animation before unmounting.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(useUiStore.getState().welcomeOpen).toBe(true);
    expect(window.localStorage.getItem(MOBILE_SUITABILITY_STORAGE_KEY)).toBe('1');
  });

  it('does not reopen Welcome after a returning user continues', () => {
    window.localStorage.setItem('electrasim:welcomed', '1');
    useUiStore.setState({ mobileSuitabilityOpen: true });
    render(<MobileSuitabilityModal />);

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(useUiStore.getState().welcomeOpen).toBe(false);
  });
});
