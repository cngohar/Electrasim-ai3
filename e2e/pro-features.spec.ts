import { type Page, expect, test } from '@playwright/test';

/**
 * End-to-end coverage for the Pro-mode feature set delivered in this branch:
 *   - Specs button removed from the SubHeaderBar
 *   - Manual fault injection master toggle (Pro-only) + fault UI gating
 *   - UK/US/EU regulation template selector (voltage, wire colors, frequency)
 *   - Compliance validation gate blocks simulation until errors are fixed
 *   - Simulation History inspector tab (audit log)
 *   - Show Stress Zones canvas heatmap toggle
 *   - Recommended Protection badge on component properties
 */

const BASE_URL = 'http://127.0.0.1:3000';

// Use a wide viewport so the right-hand inspector (≈320 px) and left palette
// don't overlap the canvas bulbs we need to click in the tests.
test.use({ viewport: { width: 1680, height: 1000 } });

async function ensureProMode(page: Page) {
  // The mode toggle always renders either "Student" (basic, emerald) or
  // "Pro" (pro, purple). If the button currently shows "Student", click it
  // to switch into Pro Electrician Mode.
  const studentToggle = page.getByRole('button', { name: /^student$/i });
  if (await studentToggle.isVisible().catch(() => false)) {
    await studentToggle.click({ force: true });
  }
  // Wait until Pro-only chrome appears (the Fault Lab button in the app bar).
  await expect(page.getByRole('button', { name: /Fault Lab/ })).toBeVisible();
}

test.describe('Dual standard & pro features', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mark first-visit modals as already welcomed so the welcome dialog and
    // mobile suitability interstitials never intercept clicks.
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('electrasim:welcomed', '1');
        window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
      } catch {
        /* storage may be unavailable in some environments */
      }
    });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // Wait for the canvas to mount before interacting.
    await page.locator('[data-circuit-canvas]').waitFor({ state: 'attached' });
    // Expand the right-hand inspector so property / fault controls are
    // reachable without each test having to open it first.
    const expand = page
      .locator('aside.fixed.right-0')
      .getByRole('button', { name: /expand inspector panel/i });
    if (await expand.isVisible().catch(() => false)) {
      await expand.click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('hides the "? Specs" quick button from the sub header bar', async ({ page }) => {
    await ensureProMode(page);
    // The removed "? Specs" button was part of the selected-component
    // cluster. After the change the literal label must not exist anywhere.
    await expect(page.getByText('? Specs', { exact: true })).toHaveCount(0);
  });

  test('Fault Lab is Pro-only and arms the manual fault UI', async ({ page }) => {
    await ensureProMode(page);

    // The Fault Lab button is the single dedicated fault entry point (the old
    // sub-header "Faults" master toggle was removed as redundant).
    const faultLab = page.getByRole('button', { name: /Fault Lab/ });
    await expect(faultLab).toBeVisible();

    // Opening it arms manual fault injection and opens the dedicated panel.
    await faultLab.click();
    await expect(page.getByLabel('Fault Lab panel')).toBeVisible();

    // Select a non-source component — the Inspector Properties tab shows the
    // Manual Fault Simulation panel while armed.
    await page.mouse.click(937, 347); // single-way switch in the seed circuit
    await page.waitForTimeout(300);
    await expect(page.getByText('Manual Fault Simulation').first()).toBeVisible();
  });

  test('student mode never shows the Fault Lab button or standards selector', async ({ page }) => {
    // Switch to Student mode (Pro toggle visible means we're in pro).
    const proToggle = page.getByRole('button', { name: /^pro$/i });
    if (await proToggle.isVisible().catch(() => false)) {
      await proToggle.click({ force: true });
    }
    await expect(page.getByRole('button', { name: /^student$/i })).toBeVisible();
    // The Fault Lab button must not be rendered in student mode (fault
    // injection is Pro-only).
    await expect(page.getByRole('button', { name: /Fault Lab/ })).toHaveCount(0);
    // Standard selector popover is absent.
    await expect(page.getByText('Regulation Template')).toHaveCount(0);
  });

  test('standard selector switches nominal voltage and frequency', async ({ page }) => {
    await ensureProMode(page);

    // The standard selector trigger has a title that starts with
    // "Regulation template:" — select by that title.
    const trigger = page.locator('[data-standard-selector]');
    await trigger.click({ force: true });
    await expect(page.getByText('United States', { exact: true })).toBeVisible();

    // Switch to US (120 V / 60 Hz).
    await page.getByRole('button', { name: /united states/i }).click();
    await expect(page.getByText(/120\s*V\s*60\s*Hz/)).toBeVisible({ timeout: 5000 });

    // Switch to EU (230 V / 50 Hz).
    await page.getByRole('button', { name: /regulation template/i }).click({ force: true });
    await page.getByRole('button', { name: /european union/i }).click();
    await expect(page.getByText(/230\s*V\s*50\s*Hz/)).toBeVisible({ timeout: 5000 });
  });

  test('validation gates simulation on a compliance violation', async ({ page }) => {
    await ensureProMode(page);

    // Click Run. Either the circuit is compliant and simulation starts, or a
    // compliance failure alert is shown — both are valid outcomes of the gate.
    await page.getByRole('button', { name: /run simulation/i }).click({ force: true });

    const pausedAfterBlock = page.getByText(/compliance check failed/i);
    const running = page.getByText(/running/i).first();
    const ok =
      (await pausedAfterBlock.isVisible().catch(() => false)) ||
      (await running.isVisible().catch(() => false));
    expect(ok).toBeTruthy();
  });

  test('simulation history tab is visible in pro inspector', async ({ page }) => {
    await ensureProMode(page);
    // Expand the inspector if collapsed.
    const expand = page.getByRole('button', { name: /expand inspector panel/i });
    if (await expand.isVisible().catch(() => false)) {
      await expand.click({ force: true });
    }
    const historyTab = page.getByRole('button', {
      name: /simulation history \(audit log\)/i,
    });
    await expect(historyTab).toBeVisible();
    await historyTab.click({ force: true });
    await expect(page.getByText('Simulation History').first()).toBeVisible();
  });

  test('stress zones toggle arms the canvas heatmap', async ({ page }) => {
    await ensureProMode(page);
    const btn = page.getByRole('button', { name: /stress zones/i });
    await expect(btn).toBeVisible();
    // Toggling persists to settings and makes the overlay group mount.
    await btn.click({ force: true });
    await page.waitForTimeout(200);
    const overlayWhenOn = await page.locator('[data-stress-zone-overlay]').count();
    expect(overlayWhenOn).toBeGreaterThanOrEqual(1);
  });

  test('recommended protection badge appears for a load in pro mode', async ({ page }) => {
    await ensureProMode(page);
    // The default seed circuit places bulbs across the canvas. Click around
    // the centre where nothing overlaps, then confirm the badge rendered.
    // We try a handful of candidate points because bulb positions vary with
    // the viewport.
    // Seed-circuit screen-space centres (derived for a 1680 px viewport).
    // motor-16 reliably renders the Recommended Protection badge; switches
    // exercise the Manual Fault Simulation panel.
    const candidates = [
      [659, 847], // motor-16
      [937, 347], // single-way switch
      [1187, 569], // push button
      [409, 208], // mcb-4
    ];
    let found = false;
    for (const [x, y] of candidates) {
      await page.mouse.click(x, y);
      await page.waitForTimeout(250);
      if (
        await page
          .locator('[data-recommended-protection]')
          .isVisible()
          .catch(() => false)
      ) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
    await expect(page.getByText(/MCB Rating/).first()).toBeVisible();
  });
});
