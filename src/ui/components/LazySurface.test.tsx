import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LazySurface } from './LazySurface';

function BrokenSurface(): never {
  throw new Error('chunk failed');
}

function FailureHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open settings
      </button>
      {open && (
        <LazySurface label="Settings" onClose={() => setOpen(false)}>
          <BrokenSurface />
        </LazySurface>
      )}
    </>
  );
}

describe('LazySurface', () => {
  it('contains a surface failure and lets the caller close it', () => {
    const onClose = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      render(
        <LazySurface label="Settings" onClose={onClose}>
          <BrokenSurface />
        </LazySurface>,
      );

      expect(screen.getByRole('alertdialog', { name: 'Settings could not load' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: /Close/ }));
      expect(onClose).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('traps focus, closes on Escape, restores focus, and restores body scrolling', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    document.body.style.overflow = 'auto';

    try {
      render(<FailureHarness />);
      const trigger = screen.getByRole('button', { name: 'Open settings' });
      trigger.focus();
      fireEvent.click(trigger);

      const dialog = await screen.findByRole('alertdialog', { name: 'Settings could not load' });
      await waitFor(() => expect(dialog).toHaveFocus());
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');

      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      expect(screen.getByRole('button', { name: /Reload/ })).toHaveFocus();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(document.body.style.overflow).toBe('auto');
    } finally {
      document.body.style.overflow = '';
      consoleError.mockRestore();
    }
  });
});
