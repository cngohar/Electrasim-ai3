import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../../../store';
import { SettingsModal } from '../SettingsModal';

afterEach(() => {
  act(() => useSettingsStore.setState({ canvasPreset: 'default' }));
});

describe('SettingsModal', () => {
  it('opens a requested tab and writes changes through the settings store', () => {
    const onClose = vi.fn();
    render(<SettingsModal open onClose={onClose} initialTab="display" />);

    expect(screen.getByText('Canvas Display')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /High Contrast/ }));
    expect(useSettingsStore.getState().canvasPreset).toBe('high-contrast');

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
