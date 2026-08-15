import { type Locator, type Page, expect, test } from '@playwright/test';

/**
 * Fault-injection → protection-trip → reset flows, plus the editing
 * fundamentals (delete+confirm+undo, copy/paste, fault undo, JSON export)
 * that the original smoke/guide specs never exercised. Every assertion here
 * encodes behaviour first verified live in the browser (see
 * scripts/probe5-post-trip.mjs).
 */

const STAIRCASE = 'two-way-staircase-light';
const RCBO_TEMPLATE = 'rcbo-protected-socket';

/** Component hitbox inside its positioned canvas node. */
function hitbox(page: Page, componentId: string): Locator {
  return page.locator(`[data-component-id="${componentId}"] > g[role="button"]`);
}

function hitboxIn(node: Locator): Locator {
  return node.locator('> g[role="button"]');
}

async function loadGuide(page: Page, templateId: string, title: string) {
  await page.goto(`/?template=${templateId}`);
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: title }) });
  await card.getByRole('button', { name: 'Load guide' }).click();
}

async function runSim(page: Page) {
  await page.getByRole('button', { name: /^Run Simulation$/ }).click();
  await expect(page.getByRole('button', { name: /^Stop$/ })).toBeVisible();
}

/** Amber dashed frame + badge rendered on a tripped protection device. */
function tripMarker(page: Page, componentId: string) {
  const node = page.locator(`[data-component-id="${componentId}"]`);
  return {
    dot: node.locator('circle[fill="#f59e0b"]'),
    frame: node.locator('rect[stroke="#f59e0b"][stroke-dasharray="4 3"]'),
  };
}

const faultAlertDialog = (page: Page) =>
  page.getByRole('dialog').filter({ has: page.getByText('CIRCUIT PROTECTION TRIPPED!') });

async function dismissFaultAlert(page: Page) {
  await faultAlertDialog(page)
    .getByRole('button', { name: 'Close modal' })
    .click();
  await expect(faultAlertDialog(page)).toBeHidden();
}

/** Open the Inspector → Simulation tab for the component and reset its trip. */
async function resetBreakerViaInspector(page: Page, componentId: string) {
  await hitbox(page, componentId).click();
  await page.getByRole('button', { name: 'Simulation Telemetry & Faults' }).click();
  const reset = page.getByRole('button', { name: /RESET Breaker/ });
  await expect(reset).toBeVisible();
  await expect(reset).toBeEnabled();
  await reset.click();
}

test.describe('faults & editing', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 640,
      'fault injection uses the context menu, which has no phone affordance',
    );
    void testInfo;
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
    page.on('dialog', (dialog) => dialog.accept());
  });

  test('a bolted short trips the guarding MCB; reset → re-trip → clear → clean run', async ({
    page,
  }) => {
    const mcbId = `${STAIRCASE}-mcb`;
    const bulbId = `${STAIRCASE}-bulb`;

    await loadGuide(page, STAIRCASE, 'Two-Way Staircase Light');
    await runSim(page);

    // The guide panel overlays the rightmost canvas components at tablet
    // widths; "Hide guide" is the (now non-destructive) way to free the space.
    await page.getByRole('button', { name: 'Hide guide' }).click();

    await hitbox(page, bulbId).click({ button: 'right' });
    await page.getByRole('button', { name: 'Inject Short Circuit' }).click();

    // Injection pauses the sim; re-running lets the fault operate protection.
    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await expect(faultAlertDialog(page)).toBeVisible();

    const mcbAria = hitboxIn(page.locator(`[data-component-id="${mcbId}"]`));
    await expect(mcbAria).toHaveAttribute('aria-label', /, tripped/);
    await expect(tripMarker(page, mcbId).dot.first()).toBeVisible();
    await expect(tripMarker(page, mcbId).frame.first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Stop$/ })).toBeHidden();
    await dismissFaultAlert(page);

    // Resetting the breaker with the fault still injected must re-trip —
    // a real breaker reclosing onto a bolted fault does exactly this.
    await resetBreakerViaInspector(page, mcbId);
    await expect(mcbAria).not.toHaveAttribute('aria-label', /, tripped/);
    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await expect(faultAlertDialog(page)).toBeVisible();
    await expect(mcbAria).toHaveAttribute('aria-label', /, tripped/);
    await dismissFaultAlert(page);

    // The expanded drawer covers right-side canvas components at tablet
    // widths; collapse it to reach the faulted bulb again.
    await page.getByRole('button', { name: 'Collapse Inspector' }).first().click();
    await hitbox(page, bulbId).click({ button: 'right' });
    await page.getByRole('button', { name: 'Clear Injected Fault' }).click();
    await resetBreakerViaInspector(page, mcbId);
    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await expect(page.getByRole('button', { name: /^Stop$/ })).toBeVisible();
    await expect(faultAlertDialog(page)).toBeHidden();
    await expect(mcbAria).not.toHaveAttribute('aria-label', /, tripped/);
    // Both travellers at L1 energise the lamp again (single-halo glow).
    await expect(
      page.locator(`[data-component-id="${bulbId}"]`).locator('circle[fill="#facc15"]').first(),
    ).toBeVisible();

    // Hiding the guide earlier must not have ended the challenge: the
    // floating pill brings the checklist back with progress intact. The MCB
    // is still selected with the drawer open, so the panel yields to the
    // Inspector — the drawer's own return strip closes the loop.
    await page.getByRole('button', { name: 'Show guide steps' }).click();
    await page.getByRole('button', { name: 'Close inspector and return to guide' }).click();
    await expect(page.getByRole('heading', { name: 'Two-Way Staircase Light' })).toBeVisible();
  });

  test('earth leakage trips the RCBO guarding the faulted network', async ({ page }) => {
    const rcboId = `${RCBO_TEMPLATE}-rcbo`;
    const socketId = `${RCBO_TEMPLATE}-socket`;

    await loadGuide(page, RCBO_TEMPLATE, 'RCBO-Protected Socket');
    await runSim(page);

    await hitbox(page, socketId).click({ button: 'right' });
    await page.getByRole('button', { name: 'Inject Earth Leakage / Earth Fault' }).click();

    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await expect(faultAlertDialog(page)).toBeVisible();
    await expect(faultAlertDialog(page)).toContainText('RCBO (32A 30mA)');

    const rcboAria = hitboxIn(page.locator(`[data-component-id="${rcboId}"]`));
    await expect(rcboAria).toHaveAttribute('aria-label', /, tripped/);
    await dismissFaultAlert(page);

    // Recover fully: clear the fault, reset the RCBO, and the lamp relights.
    await hitbox(page, socketId).click({ button: 'right' });
    await page.getByRole('button', { name: 'Clear Injected Fault' }).click();
    await resetBreakerViaInspector(page, rcboId);
    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await expect(page.getByRole('button', { name: /^Stop$/ })).toBeVisible();
    await expect(faultAlertDialog(page)).toBeHidden();
  });

  test('deleting a component asks for confirmation and Ctrl+Z restores it', async ({ page }) => {
    const bulbId = `${STAIRCASE}-bulb`;
    await loadGuide(page, STAIRCASE, 'Two-Way Staircase Light');
    await page.getByRole('button', { name: 'Hide guide' }).click();

    await hitbox(page, bulbId).click({ button: 'right' });
    await page.getByRole('button', { name: 'Delete Component' }).click();
    const confirm = page.getByRole('dialog');
    await expect(confirm).toContainText('Delete this component?');
    await confirm.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.locator(`[data-component-id="${bulbId}"]`)).toHaveCount(0);

    await page.keyboard.press('Control+z');
    await expect(page.locator(`[data-component-id="${bulbId}"]`)).toHaveCount(1);
  });

  test('Ctrl+Z removes an injected fault — no invisible ghost faults keep tripping', async ({
    page,
  }) => {
    const mcbId = `${STAIRCASE}-mcb`;
    const bulbId = `${STAIRCASE}-bulb`;
    await loadGuide(page, STAIRCASE, 'Two-Way Staircase Light');
    await page.getByRole('button', { name: 'Hide guide' }).click();

    await hitbox(page, bulbId).click({ button: 'right' });
    await page.getByRole('button', { name: 'Inject Short Circuit' }).click();
    // Fault badge renders on the faulted component (red dashed fault frame).
    const bulbNode = page.locator(`[data-component-id="${bulbId}"]`);
    await expect(bulbNode.locator('rect[stroke-dasharray="4 3"]').first()).toBeVisible();

    await page.keyboard.press('Control+z');
    await expect(bulbNode.locator('rect[stroke-dasharray="4 3"]')).toHaveCount(0);

    // The undo must clear the scenario array too. Gate on the lamp actually
    // relighting first — asserting "no alert" immediately would race the
    // worker and could pass before a ghost-fault trip lands.
    await runSim(page);
    await expect(
      page.locator(`[data-component-id="${bulbId}"]`).locator('circle[fill="#facc15"]').first(),
    ).toBeVisible();
    await expect(faultAlertDialog(page)).toBeHidden();
    await expect(
      hitboxIn(page.locator(`[data-component-id="${mcbId}"]`)),
    ).not.toHaveAttribute('aria-label', /, tripped/);
  });

  test('copy/paste duplicates the selected component and undo removes it', async ({ page }) => {
    const bulbId = `${STAIRCASE}-bulb`;
    await loadGuide(page, STAIRCASE, 'Two-Way Staircase Light');

    const statusPill = page.getByText(/6\s*comps\s*•\s*6\s*wires/);
    await expect(statusPill).toBeVisible();
    await page.getByRole('button', { name: 'Hide guide' }).click();

    await hitbox(page, bulbId).click();
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await expect(page.getByText(/7\s*comps\s*•\s*6\s*wires/)).toBeVisible();

    await page.keyboard.press('Control+z');
    await expect(statusPill).toBeVisible();
  });

  test('JSON export downloads the circuit through the filename prompt', async ({ page }) => {
    await loadGuide(page, STAIRCASE, 'Two-Way Staircase Light');

    await page.keyboard.press('Control+e');
    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Import / Export', { exact: true })).toBeVisible();

    await modal.getByRole('button', { name: /^JSON/ }).click();
    await expect(modal.getByText('Save Circuit As')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await modal.getByRole('button', { name: /Download/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.electrasim\.json$/);

    await expect(modal.getByText(/JSON exported as/)).toBeVisible();
  });
});
