import { expect, test } from '@playwright/test';

/**
 * Zs / disconnection checker panel (Inspector → Circuit Safety & Validation).
 * Verifies the panel renders real computed values for a guided template and
 * reacts to the earthing-arrangement (Ze) selector.
 */

const RCBO_TEMPLATE = 'rcbo-protected-socket';

test.describe('zs check panel', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 640,
      'inspector drawer interaction is a desktop/tablet flow',
    );
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
    page.on('dialog', (dialog) => dialog.accept());
  });

  test('shows per-device Zs verdicts with BS 7671 max-Zs values, reactive to Ze', async ({
    page,
  }) => {
    await page.goto(`/?template=${RCBO_TEMPLATE}`);
    const card = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'RCBO-Protected Socket' }) });
    await card.getByRole('button', { name: 'Load guide' }).click();

    await page.getByRole('button', { name: 'Circuit Safety & Validation' }).click();

    const panel = page.getByTestId('zs-check-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Zs / Disconnection Check');

    // The template's RCBO (32A, Type B curve) must show the A4:2026 Cmin-corrected Zs limit.
    await expect(panel).toContainText('RCBO (32A 30mA)');
    await expect(panel).toContainText('Max Zs (Type B 32A) = 1.37 Ω');
    await expect(panel.locator('[data-zs-verdict]').first()).toBeVisible();

    // TN-C-S is the default; switching to TN-S raises Ze and the computed Zs.
    const zsCell = panel.getByText(/^Zs = Ze /).first();
    await expect(zsCell).toContainText('Ze 0.35');
    await panel.getByLabel(/Earthing arrangement/).selectOption('TN-S');
    await expect(zsCell).toContainText('Ze 0.80');
  });
});
