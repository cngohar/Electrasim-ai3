import { expect, test } from '@playwright/test';

/**
 * Smoke test: app boots and renders the locked Lab Glass · Light shell.
 * Phase 4 will add full interaction coverage (place, wire, simulate, etc.).
 */
test('first-visit welcome close control works', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem('electrasim:welcomed');
    window.localStorage.removeItem('electrasim:mobile-suitability:v1');
  });
  await page.goto('/');

  const isPhone = (page.viewportSize()?.width ?? 0) < 640;
  const suitability = page.getByRole('dialog', {
    name: 'ElectraSim works best on a larger screen',
  });
  if (isPhone) {
    await expect(suitability).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Welcome to ElectraSim' })).toHaveCount(0);
    await suitability.getByRole('button', { name: 'Continue' }).click();
    expect(
      await page.evaluate(() => window.localStorage.getItem('electrasim:mobile-suitability:v1')),
    ).toBe('1');
  } else {
    await expect(suitability).toHaveCount(0);
  }

  const welcome = page.getByRole('dialog', { name: 'Welcome to ElectraSim' });
  await expect(welcome).toBeVisible();
  await welcome.getByRole('button', { name: 'Close welcome' }).click();

  await expect(welcome).not.toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem('electrasim:welcomed'))).toBe('1');
});

test('shows the phone suitability advisory once for a returning user', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'Phone-only advisory behavior.');
  await page.addInitScript(() => {
    window.localStorage.setItem('electrasim:welcomed', '1');
    window.localStorage.removeItem('electrasim:mobile-suitability:v1');
  });

  await page.goto('/');
  const suitability = page.getByRole('dialog', {
    name: 'ElectraSim works best on a larger screen',
  });
  await expect(suitability).toBeVisible();
  await suitability.getByRole('button', { name: 'Continue' }).click();
  await expect(suitability).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Welcome to ElectraSim' })).toHaveCount(0);

  await page.reload();
  await expect(suitability).toHaveCount(0);
});

test('does not show the phone suitability advisory on tablet or desktop', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chrome', 'Covered by the phone-only test.');
  await page.addInitScript(() => {
    window.localStorage.setItem('electrasim:welcomed', '1');
    window.localStorage.removeItem('electrasim:mobile-suitability:v1');
  });

  await page.goto('/');
  await expect(
    page.getByRole('dialog', { name: 'ElectraSim works best on a larger screen' }),
  ).toHaveCount(0);
});

test.describe('app shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
      window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
    });
  });

  test('boots and can start the simulation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('application', { name: 'Circuit diagram' })).toBeVisible();

    const runButton = page.getByRole('button', { name: /^Run Simulation$/ });
    await expect(runButton).toBeVisible();
    await runButton.click();
    await expect(page.getByRole('button', { name: /^Stop$/ })).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 640) {
      await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    } else {
      await expect(page.locator('header').getByText('ElectraSim', { exact: true })).toBeVisible();
      if (viewport && viewport.width >= 1024) {
        await expect(page.locator('aside').getByText('Components', { exact: true })).toBeVisible();
      } else {
        await expect(page.getByRole('button', { name: 'Components', exact: true })).toBeVisible();
      }
    }
  });

  test('console panel is visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.getByText(/Console · \d+ entries/)).toBeVisible();
  });

  test('keeps selection clicks stable and supports keyboard wire rerouting', async ({ page }) => {
    await page.goto('/');

    const component = page.locator('[data-component-id]').first();
    const componentBody = component.locator(':scope > g[role="button"]');
    const transformBefore = await component.getAttribute('transform');
    await componentBody.evaluate(async (node) => {
      const box = node.getBoundingClientRect();
      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      node.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 0,
          buttons: 1,
          clientX: point.x,
          clientY: point.y,
          pointerId: 70,
          pointerType: 'mouse',
        }),
      );
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          button: 0,
          buttons: 0,
          clientX: point.x,
          clientY: point.y,
          pointerId: 70,
          pointerType: 'mouse',
        }),
      );
      node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await new Promise(requestAnimationFrame);
    });
    await expect(component).toHaveAttribute('transform', transformBefore ?? '');

    const wire = page.getByRole('button', { name: /^Wire w-/ }).first();
    await wire.focus();
    await wire.press('r');
    await expect(page.locator('[data-circuit-canvas]')).toHaveAttribute(
      'data-reroute-active',
      /:to$/,
    );

    const targetPort = page.locator('[data-component-id^="fuse-"] [data-port-index="0"]').first();
    await targetPort.focus();
    await targetPort.press('Enter');
    await expect(page.locator('[data-circuit-canvas]')).not.toHaveAttribute(
      'data-reroute-active',
      /.+/,
    );
    await expect(page.locator('[data-circuit-canvas]')).toHaveAttribute(
      'data-interaction-mode',
      'idle',
    );
  });

  test('cleans up cancelled drags and pans with touch input', async ({ page }) => {
    await page.goto('/');

    const component = page.locator('[data-component-id]').first();
    const transformBefore = await component.getAttribute('transform');
    await component.locator(':scope > g[role="button"]').evaluate(async (node) => {
      const box = node.getBoundingClientRect();
      const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      node.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 0,
          buttons: 1,
          clientX: start.x,
          clientY: start.y,
          pointerId: 71,
          pointerType: 'mouse',
        }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          button: -1,
          buttons: 1,
          clientX: start.x + 30,
          clientY: start.y + 20,
          pointerId: 71,
          pointerType: 'mouse',
        }),
      );
      await new Promise(requestAnimationFrame);
      window.dispatchEvent(
        new PointerEvent('pointercancel', {
          bubbles: true,
          pointerId: 71,
          pointerType: 'mouse',
        }),
      );
      await new Promise(requestAnimationFrame);
    });
    await expect(component).toHaveAttribute('transform', transformBefore ?? '');
    expect(await component.evaluate((node) => (node as SVGElement).style.translate)).toBe('');

    const world = page.locator('[data-canvas-world]');
    const panBefore = await world.getAttribute('transform');
    const touchResult = await page
      .locator('svg[aria-label="Circuit diagram"]')
      .evaluate(async (svg) => {
        const box = svg.getBoundingClientRect();
        const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        svg.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            button: 0,
            buttons: 1,
            clientX: start.x,
            clientY: start.y,
            pointerId: 72,
            pointerType: 'touch',
          }),
        );
        svg.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            button: 0,
            buttons: 1,
            clientX: start.x + 80,
            clientY: start.y + 40,
            pointerId: 73,
            pointerType: 'touch',
          }),
        );
        window.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            button: -1,
            buttons: 1,
            clientX: start.x + 120,
            clientY: start.y + 70,
            pointerId: 73,
            pointerType: 'touch',
          }),
        );
        svg
          .querySelector('[data-port-index]')
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await new Promise(requestAnimationFrame);
        const secondaryPreview = (svg.parentElement as HTMLElement | null)?.style.transform ?? '';
        window.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            button: 0,
            buttons: 0,
            pointerId: 73,
            pointerType: 'touch',
          }),
        );
        window.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            button: -1,
            buttons: 1,
            clientX: start.x + 36,
            clientY: start.y + 18,
            pointerId: 72,
            pointerType: 'touch',
          }),
        );
        await new Promise(requestAnimationFrame);
        window.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            button: 0,
            buttons: 0,
            clientX: start.x + 36,
            clientY: start.y + 18,
            pointerId: 72,
            pointerType: 'touch',
          }),
        );
        await new Promise(requestAnimationFrame);
        return {
          secondaryPreview,
          mode: svg.getAttribute('data-interaction-mode'),
        };
      });
    expect(touchResult).toEqual({ secondaryPreview: '', mode: 'idle' });
    await expect(world).not.toHaveAttribute('transform', panBefore ?? '');
  });
});
