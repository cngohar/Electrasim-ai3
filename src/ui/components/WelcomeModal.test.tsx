import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from '../../store/uiStore';
import { WelcomeModal } from './WelcomeModal';

function resetWelcomeState() {
  act(() => {
    useUiStore.setState({ mobileSuitabilityOpen: false, welcomeOpen: false });
  });
}

beforeEach(() => {
  window.localStorage.clear();
  resetWelcomeState();
});

afterEach(() => {
  window.localStorage.clear();
  resetWelcomeState();
});

describe('WelcomeModal', () => {
  it('presents an accessible learning-first path into the editor', () => {
    useUiStore.setState({ welcomeOpen: true });
    render(<WelcomeModal />);

    expect(screen.getByRole('dialog', { name: 'Welcome to ElectraSim' })).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: /Start with a Guided Circuit/ })).toBeVisible();
    expect(screen.getByText(/learning model, not a substitute/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open Guided Circuits' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Continue to canvas' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('electrasim:welcomed')).toBe('1');
  });
});
