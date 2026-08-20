import { type Page, expect, test } from '@playwright/test';

/**
 * Challenge Mode end-to-end (plan §14, §17, §18, §21, §22).
 *
 * Completion + scoring arithmetic is covered exhaustively by the unit suites
 * (`challenge/*.test.ts`, `challengeStore.test.ts`); this spec covers what
 * only a browser can prove: the panel mounts, the editor is seeded, feedback
 * renders, and the abandon/resume affordances behave.
 */

const panel = (page: Page) => page.locator('section[aria-label="Challenge Mode"]');

async function openChallengeMode(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByText('Challenge Mode', { exact: false }).first().click();
  await expect(panel(page)).toBeVisible();
}

test.describe('Challenge Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
    page.on('dialog', (dialog) => dialog.accept());
  });

  test('offers three difficulties and starts a challenge', async ({ page }) => {
    await openChallengeMode(page);

    for (const label of ['Beginner', 'Intermediate', 'Advanced']) {
      await expect(page.getByRole('button', { name: new RegExp(label) })).toBeVisible();
    }

    await page.getByRole('button', { name: /Beginner/ }).click();

    // Briefing renders with an objective, a parts checklist and a timer.
    await expect(panel(page).getByText(/Build a working/)).toBeVisible();
    await expect(panel(page).getByText(/PARTS NEEDED/i)).toBeVisible();
    await expect(panel(page).getByRole('progressbar')).toBeVisible();
    await expect(panel(page).getByRole('button', { name: /Check circuit/ })).toBeVisible();
  });

  test('seeds the canvas with supply terminals and no wires', async ({ page }) => {
    await openChallengeMode(page);
    await page.getByRole('button', { name: /Beginner/ }).click();

    // The learner starts from the supply only — never an empty canvas and
    // never the answer.
    const components = page.locator('[data-component-id]');
    await expect.poll(() => components.count()).toBeGreaterThan(0);
    await expect.poll(() => components.count()).toBeLessThan(4);
  });

  test('gives actionable feedback on an incomplete submission (plan §18)', async ({ page }) => {
    await openChallengeMode(page);
    await page.getByRole('button', { name: /Intermediate/ }).click();

    await page.getByRole('button', { name: /Check circuit/ }).click();

    // A wrong answer must NOT end the challenge.
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole('button', { name: /Check circuit/ })).toBeVisible();
    await expect(
      panel(page).getByText(/does not work correctly yet|not the circuit|Missing connection|Add /i),
    ).toBeVisible();
  });

  test('reveals progressive hints without ending the run (plan §17)', async ({ page }) => {
    await openChallengeMode(page);
    await page.getByRole('button', { name: /Beginner/ }).click();

    const hintButton = page.getByRole('button', { name: /Reveal hint/ });
    await hintButton.click();
    await expect(panel(page).getByText(/HINT 1/i)).toBeVisible();

    await hintButton.click();
    await expect(panel(page).getByText(/HINT 2/i)).toBeVisible();

    await hintButton.click();
    await expect(panel(page).getByText(/HINT 3/i)).toBeVisible();

    // Budget exhausted — the control disables rather than erroring.
    await expect(hintButton).toBeDisabled();
    await expect(panel(page).getByRole('button', { name: /Check circuit/ })).toBeEnabled();
  });

  test('confirms before discarding a challenge in progress (plan §22)', async ({ page }) => {
    await openChallengeMode(page);
    await page.getByRole('button', { name: /Beginner/ }).click();
    await page.getByRole('button', { name: /Check circuit/ }).click();

    await page.getByRole('button', { name: 'New challenge' }).click();
    await expect(panel(page).getByText(/Start another challenge\?/)).toBeVisible();

    // Backing out keeps the current run alive.
    await page.getByRole('button', { name: /Keep building/ }).click();
    await expect(panel(page).getByText(/Start another challenge\?/)).toBeHidden();
    await expect(panel(page).getByRole('button', { name: /Check circuit/ })).toBeVisible();
  });

  test('exposes an accessible progress meter', async ({ page }) => {
    await openChallengeMode(page);
    await page.getByRole('button', { name: /Beginner/ }).click();

    const meter = panel(page).getByRole('progressbar', { name: /Challenge progress/i });
    await expect(meter).toBeVisible();
    await expect(meter).toHaveAttribute('max', '100');
    // Semantics come from the native <progress> element, so the meter never
    // steals a keyboard tab stop from the editor's controls.
    expect(await meter.evaluate((node) => node.tagName)).toBe('PROGRESS');
  });
  test('copies a seed and replays the identical challenge (plan §30)', async ({
    page,
    context,
    browser,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await openChallengeMode(page);
    await page.getByRole('button', { name: /Beginner/ }).click();
    const panel = page.locator('section[aria-label="Challenge Mode"]');
    const idOf = () =>
      panel
        .locator('p', { hasText: /ES-CHAL-\d+/ })
        .first()
        .innerText();
    const originalId = await idOf();

    await panel.getByRole('button', { name: /Copy seed/i }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/Seed: \d+/);
    expect(copied).toMatch(/Mode: Challenge/i);

    // Replay in a clean context so nothing can be restored from the first run.
    const fresh = await browser.newContext();
    const replayPage = await fresh.newPage();
    await replayPage.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
    await openChallengeMode(replayPage);
    await replayPage.getByLabel('Replay a seed').fill(copied);
    await replayPage.getByRole('button', { name: 'Replay' }).click();

    const replayPanel = replayPage.locator('section[aria-label="Challenge Mode"]');
    await expect(replayPanel.locator('p', { hasText: /ES-CHAL-\d+/ }).first()).toBeVisible();
    expect(
      await replayPanel
        .locator('p', { hasText: /ES-CHAL-\d+/ })
        .first()
        .innerText(),
    ).toBe(originalId);
    await fresh.close();
  });
});
