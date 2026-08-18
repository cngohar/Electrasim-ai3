import { type Page, expect, test } from '@playwright/test';

/**
 * Diagnosis Lab end-to-end (plan §14–§22, §33, §41).
 *
 * The grading rules, scoring arithmetic and anti-guess properties are covered
 * exhaustively offline (`diagnosis/*.test.ts`, `diagnosisStore.test.ts`,
 * `scripts/stress-diagnosis.ts`). This spec covers what only a real browser
 * can prove: the panel mounts, the faulted circuit is framed where the learner
 * can actually see it, the three-state verdict surfaces, hints are budgeted,
 * and the answer never leaks into the DOM before it is earned.
 */

const panel = (page: Page) => page.locator('section[aria-label="Diagnosis Lab"]');

async function openDiagnosisLab(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByText('Diagnosis Lab', { exact: false }).first().click();
  await expect(panel(page)).toBeVisible();
}

async function startExercise(page: Page, difficulty = 'Intermediate') {
  await openDiagnosisLab(page);
  await page.getByRole('button', { name: new RegExp(difficulty) }).click();
  await expect(panel(page).getByText(/Something isn.t working correctly/i)).toBeVisible();
}

test.describe('Diagnosis Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
    page.on('dialog', (dialog) => dialog.accept());
  });

  test('offers three difficulties and presents a fault complaint', async ({ page }) => {
    await openDiagnosisLab(page);

    for (const label of ['Beginner', 'Intermediate', 'Advanced']) {
      await expect(page.getByRole('button', { name: new RegExp(label) })).toBeVisible();
    }

    await page.getByRole('button', { name: /Beginner/ }).click();

    // §14: the learner is told the *symptom*, then asked both questions.
    await expect(panel(page).getByText(/Something isn.t working correctly/i)).toBeVisible();
    await expect(panel(page).getByText(/WHAT IS WRONG\?/i)).toBeVisible();
    await expect(panel(page).getByText(/WHERE IS IT\?/i)).toBeVisible();
  });

  test('seeds the canvas with the faulted installation', async ({ page }) => {
    await startExercise(page);
    // The learner investigates a real circuit, not an empty canvas.
    const components = page.locator('[data-component-hitbox]');
    await expect.poll(() => components.count()).toBeGreaterThan(2);
  });

  test('frames the circuit clear of the panel (plan §33)', async ({ page }) => {
    await startExercise(page);
    await expect.poll(() => page.locator('[data-component-hitbox]').count()).toBeGreaterThan(2);

    // The canvas SVG has a fixed viewBox with `xMidYMid meet`, so the fit maths
    // has to convert pixels into user units. When that conversion is wrong the
    // circuit either hides under the panel or collapses into an unreadable
    // clump — both regressions this assertion pins down.
    const panelBox = await panel(page).boundingBox();
    expect(panelBox).not.toBeNull();
    if (!panelBox) return;

    const boxes = await page.locator('[data-component-hitbox]').evaluateAll((nodes) =>
      nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }),
    );
    expect(boxes.length).toBeGreaterThan(2);

    for (const b of boxes) {
      const overlaps =
        b.x < panelBox.x + panelBox.width &&
        b.x + b.width > panelBox.x &&
        b.y < panelBox.y + panelBox.height &&
        b.y + b.height > panelBox.y;
      expect(overlaps).toBe(false);
      // Legibility guard for the original defect: double-applying the meet
      // scale rendered components at ~12px. The threshold is set well below
      // what a legitimately dense phone layout produces (~40px for an
      // 8-component circuit) so this only fires on a real collapse.
      expect(b.width).toBeGreaterThan(25);
    }
  });

  test('requires BOTH answers before a repair can be carried out (plan §15)', async ({ page }) => {
    await startExercise(page);

    const submit = panel(page).getByRole('button', { name: /Submit diagnosis/i });
    await expect(submit).toBeDisabled();

    // Choosing only the fault type is not enough.
    await panel(page).getByRole('radio').first().click();
    await expect(submit).toBeDisabled();
  });

  test('a wrong diagnosis does not end the exercise (plan §41)', async ({ page }) => {
    await startExercise(page);

    const radios = panel(page).getByRole('radio');
    await radios.first().click();
    const locations = panel(page).locator('input[type="radio"]');
    await locations.last().click();

    const submit = panel(page).getByRole('button', { name: /Submit diagnosis/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // Still investigating: the panel stays, and no completion card appears.
    await expect(panel(page)).toBeVisible();
    await expect(page.locator('[aria-label="Diagnosis complete"]')).toBeHidden();
  });

  test('reveals hints within the budget and then disables the control', async ({ page }) => {
    await startExercise(page, 'Beginner');

    const hintButton = panel(page).getByRole('button', { name: /hint/i });
    // Beginner budget is 3 (difficulty profiles).
    for (let i = 0; i < 3; i++) {
      await hintButton.click();
      await expect(panel(page).getByText(new RegExp(`HINT ${i + 1}`, 'i'))).toBeVisible();
    }
    await expect(hintButton).toBeDisabled();
  });

  test('never leaks the answer before it is earned (plan §14)', async ({ page }) => {
    await startExercise(page);

    // The brief describes what the installation is *doing*, never the fault.
    // A leak here would make the whole exercise pointless.
    const text = (await panel(page).innerText()).toLowerCase();
    const briefing = text.split('what is wrong?')[0] ?? '';
    for (const giveaway of [
      'short circuit',
      'open circuit',
      'insulation leakage',
      'reversed polarity',
    ]) {
      expect(briefing).not.toContain(giveaway);
    }
  });

  test('confirms before discarding an exercise in progress (plan §22)', async ({ page }) => {
    await startExercise(page, 'Beginner');

    // The prompt is deliberately suppressed until there is progress worth
    // losing (see `requestNew`), so spend a hint first — otherwise restarting
    // an untouched exercise would nag for no reason.
    await panel(page)
      .getByRole('button', { name: /Reveal hint/i })
      .click();
    await expect(panel(page).getByText(/HINT 1/i)).toBeVisible();

    await panel(page).getByRole('button', { name: 'New diagnosis exercise' }).click();
    await expect(panel(page).getByText(/Start another exercise\?/i)).toBeVisible();

    // Backing out must keep the current exercise alive.
    await panel(page)
      .getByRole('button', { name: /Keep investigating/ })
      .click();
    await expect(panel(page).getByText(/Start another exercise\?/i)).toBeHidden();
    await expect(panel(page).getByRole('button', { name: /Submit diagnosis/i })).toBeVisible();
  });
});
