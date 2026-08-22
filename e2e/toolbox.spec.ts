import { expect, test } from '@playwright/test';

test.describe('Electrical Toolbox & Voltage Drop Calculator', () => {
  test('Toolbox hub loads and displays available tools', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page).toHaveTitle(/Electrical Toolbox/i);
    await expect(page.locator('h1')).toContainText('Interactive Electrical Calculators');

    // Voltage drop card should be available
    const voltageCard = page.locator('.tool-card.tool-active').first();
    await expect(voltageCard).toBeVisible();
    await expect(voltageCard.locator('h2')).toContainText('Voltage Drop Calculator');

    // Clicking launch navigates to tool
    await voltageCard.locator('a.btn-tool-launch').click();
    await expect(page).toHaveURL(/\/tools\/voltage-drop-calculator\/?/);
  });

  test('Voltage Drop Calculator interactive workspace on desktop', async ({ page }) => {
    await page.goto('/tools/voltage-drop-calculator/');

    // Page title and SEO
    await expect(page).toHaveTitle(/Voltage Drop Calculator/i);

    // Initial default values in results panel
    const sourceVolt = page.locator('#res-source-voltage');
    const loadVolt = page.locator('#res-load-voltage');
    const dropVolt = page.locator('#res-voltage-drop');
    const dropPct = page.locator('#res-drop-percent');

    await expect(sourceVolt).toHaveText('230 V');
    await expect(loadVolt).toHaveText('223.7 V');
    await expect(dropVolt).toHaveText('6.33 V');
    await expect(dropPct).toHaveText('2.75%');

    // Scene SVG labels
    await expect(page.locator('#source-voltage-label')).toHaveText('230 V');
    await expect(page.locator('#load-voltage-label')).toHaveText('223.7 V');
    await expect(page.locator('#drop-callout-text')).toContainText('6.33 V (2.75%)');

    // Change cable length from 50 to 100m
    const inputLength = page.locator('#input-length');
    await inputLength.fill('100');

    // Voltage drop should double (~12.66 V, 5.50% - Excessive severity)
    await expect(dropVolt).toHaveText('12.66 V');
    await expect(dropPct).toHaveText('5.50%');
    await expect(loadVolt).toHaveText('217.3 V');
    await expect(page.locator('#status-title')).toHaveText('Excessive');

    // Change cable size to 25 mm² to bring drop back down
    const inputSize = page.locator('#input-size');
    await inputSize.fill('25');

    await expect(dropVolt).toHaveText('5.06 V');
    await expect(dropPct).toHaveText('2.20%');
    await expect(page.locator('#status-title')).toHaveText('Good');

    // Test Reset button
    const btnReset = page.locator('#btn-reset-view');
    await btnReset.click();

    // Verify defaults restored
    await expect(dropVolt).toHaveText('6.33 V');
    await expect(dropPct).toHaveText('2.75%');
    await expect(inputLength).toHaveValue('50');
    await expect(inputSize).toHaveValue('10');
  });

  test('Validation error handling, friendly error notices, and autofix restoration', async ({
    page,
  }) => {
    await page.goto('/tools/voltage-drop-calculator/');

    const inputSize = page.locator('#input-size');
    const wrapSize = page.locator('#wrap-size');
    const errSize = page.locator('#err-size');
    const errorNoticeCard = page.locator('#error-notice-card');
    const dropCallout = page.locator('#drop-callout-text');

    // Enter an invalid cable size (0.1 mm² - below 0.5 minimum)
    await inputSize.fill('0.1');

    // Field should display red error border and friendly message
    await expect(wrapSize).toHaveClass(/has-error/);
    await expect(errSize).toBeVisible();
    await expect(errSize).toContainText('Minimum conductor size is 0.5 mm²');

    // Results panel should display error notice card
    await expect(errorNoticeCard).toBeVisible();
    await expect(page.locator('#error-notice-list')).toContainText(
      'Cable cross-section is too small',
    );
    await expect(dropCallout).toContainText('Check Inputs');

    // Click "Restore Standard Values" (Autofix button)
    const btnAutofix = page.locator('#btn-autofix-inputs');
    await expect(btnAutofix).toBeVisible();
    await btnAutofix.click();

    // Errors should be dismissed and defaults restored
    await expect(wrapSize).not.toHaveClass(/has-error/);
    await expect(errSize).toBeHidden();
    await expect(errorNoticeCard).toBeHidden();
    await expect(inputSize).toHaveValue('10');
    await expect(dropCallout).toContainText('6.33 V (2.75%)');
  });

  test('Tool SEO, Structured Data Graph and FAQs are complete', async ({ page }) => {
    await page.goto('/tools/voltage-drop-calculator/');

    // Meta verification
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      'https://electrasim.com/tools/voltage-drop-calculator/',
    );

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /voltage drop/i);

    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute('content', /BS 7671/i);

    // Schema.org JSON-LD Verification
    const jsonLdScript = page.locator('script[type="application/ld+json"]').first();
    const jsonLdText = await jsonLdScript.textContent();
    expect(jsonLdText).toBeTruthy();

    const graphObj = JSON.parse(jsonLdText || '{}');
    expect(graphObj['@context']).toBe('https://schema.org');
    expect(Array.isArray(graphObj['@graph'])).toBe(true);

    const types = (graphObj['@graph'] as Array<Record<string, unknown>>).map(
      (item) => item['@type'],
    );
    expect(types).toContain('WebApplication');
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('FAQPage');
    expect(types).toContain('HowTo');

    // Educational Guide Section is visible
    const guideSection = page.locator('#educational-guide');
    await expect(guideSection).toBeVisible();

    // FAQ Accordion interaction
    const firstFaq = page.locator('.faq-item').first();
    await expect(firstFaq).toBeVisible();
    await firstFaq.locator('summary').click();
    await expect(firstFaq).toHaveAttribute('open', '');

    // Simulator CTA link
    const simCta = page.locator('.btn-launch-sim');
    await expect(simCta).toHaveAttribute('href', '/app/');
  });

  test('Command palette keyboard shortcuts (Shift+Space) and navigation', async ({ page }) => {
    await page.goto('/tools/voltage-drop-calculator/');

    const cmdBackdrop = page.locator('#cmd-palette-backdrop');
    await expect(cmdBackdrop).toBeHidden();

    // Press Shift + Space
    await page.keyboard.press('Shift+Space');
    await expect(cmdBackdrop).toBeVisible();

    // Type search query
    const cmdInput = page.locator('#cmd-palette-input');
    await cmdInput.fill('reset');

    // Filtered item should be visible
    const resetItem = page.locator('.cmd-item[data-action="reset"]');
    await expect(resetItem).toBeVisible();

    // Escape closes palette
    await page.keyboard.press('Escape');
    await expect(cmdBackdrop).toBeHidden();
  });

  test('Help modal opens with equations and closes with Escape or button', async ({ page }) => {
    await page.goto('/tools/voltage-drop-calculator/');

    const helpBackdrop = page.locator('#tool-help-backdrop');
    await expect(helpBackdrop).toBeHidden();

    // Click Help button
    await page.locator('#tool-help-btn').click();
    await expect(helpBackdrop).toBeVisible();
    await expect(page.locator('#help-modal-title')).toHaveText('How Voltage Drop Works');

    // Click Got It
    await page.locator('#tool-help-confirm').click();
    await expect(helpBackdrop).toBeHidden();
  });

  test('Theme toggle switches between light and dark mode', async ({ page }) => {
    await page.goto('/tools/voltage-drop-calculator/');

    const html = page.locator('html');

    // Click theme toggle
    await page.locator('#tool-theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light
    await page.locator('#tool-theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('Mobile responsive bottom sheet controls and layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tools/voltage-drop-calculator/');

    // Mobile bottom bar should be visible
    const mobileBottomBar = page.locator('#mobile-bottom-bar');
    await expect(mobileBottomBar).toBeVisible();

    // Click Configure Inputs
    await page.locator('#btn-mobile-open-inputs').click();

    const inputsContainer = page.locator('#inputs-panel-container');
    await expect(inputsContainer).toHaveClass(/open/);

    // Scrim should be visible
    const scrim = page.locator('#inputs-panel-scrim');
    await expect(scrim).toBeVisible();

    // Clicking scrim closes drawer
    await scrim.click();
    await expect(inputsContainer).not.toHaveClass(/open/);
  });
});
