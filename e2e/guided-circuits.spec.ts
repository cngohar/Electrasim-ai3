import { type Page, expect, test } from '@playwright/test';

test.describe('new Guided Circuits', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
    page.on('dialog', (dialog) => dialog.accept());
  });

  test('loads the Push-Button Doorbell and pulses only while held', async ({ page }) => {
    await loadGuide(page, 'push-button-doorbell', 'Push-Button Doorbell');

    const button = page.locator('[data-momentary-control="push-button-doorbell-button"]');
    const bell = page.locator('[data-component-id="push-button-doorbell-bell"]');

    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await expect(bell.locator('.electrasim-bell-pulse')).toHaveCount(0);

    await button.focus();
    await page.keyboard.down('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(bell.locator('.electrasim-bell-pulse')).toHaveCount(1);

    await page.keyboard.up('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(bell.locator('.electrasim-bell-pulse')).toHaveCount(0);
  });

  test('loads the RCBO-Protected Socket and opens both load rails', async ({ page }) => {
    const isPhone = (page.viewportSize()?.width ?? 0) < 640;
    await loadGuide(page, 'rcbo-protected-socket', 'RCBO-Protected Socket');

    const rcbo = page
      .locator('[data-component-id="rcbo-protected-socket-rcbo"]')
      .locator(':scope > g[role="button"]');
    const lamp = page.locator('[data-component-id="rcbo-protected-socket-test-lamp"]');

    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    // Energised lamp renders one #facc15 outer glow halo per the current design.
    await expect(lamp.locator('circle[fill="#facc15"]')).toHaveCount(1);

    if (isPhone) {
      // On phones the guide sheet overlays the lower canvas; "Hide guide" is
      // the intended way to free the canvas for component interaction.
      await page.getByRole('button', { name: 'Hide guide' }).click();
    }

    await rcbo.dblclick();
    await expect(rcbo).toHaveAttribute('aria-pressed', 'false');
    await expect(lamp.locator('circle[fill="#facc15"]')).toHaveCount(0);
  });
});

async function loadGuide(page: Page, templateId: string, title: string): Promise<void> {
  await page.goto(`/?template=${templateId}`);

  const guideCard = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: title }) });
  await expect(guideCard).toBeVisible();
  await guideCard.getByRole('button', { name: 'Load guide' }).click();

  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  /*
   * Below `lg` the component palette is a fixed overlay over the left of the
   * canvas, so it intercepts clicks aimed at components beneath it. Collapse
   * it up front — the same accommodation the guide sheet already gets on
   * phones. No-op when it is already collapsed.
   */
  const collapse = page.getByRole('button', { name: 'Collapse panel' });
  if (
    await collapse
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await collapse.first().click();
    await expect(collapse.first()).toBeHidden();
  }
}
