import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3000';
const out = {};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('dialog', (d) => d.accept());
await page.addInitScript(() => {
  window.localStorage.setItem('electrasim:welcomed', '1');
  window.localStorage.setItem('electrasim:mobile-suitability:v1', '1');
});
await page.goto(`${BASE}/?template=two-way-staircase-light`);
await page
  .getByRole('article')
  .filter({ has: page.getByRole('heading', { name: 'Two-Way Staircase Light' }) })
  .getByRole('button', { name: 'Load guide' })
  .click();
await page.getByRole('button', { name: /^Run Simulation$/ }).click();
await page.waitForTimeout(800);
const bulb = page.locator('[data-component-id="two-way-staircase-light-bulb"] > g[role="button"]');
const mcb = page.locator('[data-component-id="two-way-staircase-light-mcb"] > g[role="button"]');

out.runningBefore = await page.getByRole('button', { name: /^Stop$/ }).isVisible();
await bulb.click({ button: 'right' });
await page.waitForTimeout(300);
out.runningAfterContextMenu = await page.getByRole('button', { name: /^Stop$/ }).isVisible();
await page.getByRole('button', { name: /Inject Short Circuit/ }).click();
await page.waitForTimeout(400);
out.runningAfterInject = await page.getByRole('button', { name: /^Stop$/ }).isVisible();

// re-run and let the fault play out
await page.getByRole('button', { name: /^Run Simulation$/ }).click();
await page.waitForTimeout(2000);
out.afterRerun = {
  running: await page.getByRole('button', { name: /^Stop$/ }).isVisible(),
  mcbAria: await mcb.getAttribute('aria-label'),
  lampGlow: await page
    .locator('[data-component-id="two-way-staircase-light-bulb"]')
    .locator('circle[fill="#facc15"]')
    .count(),
  faultsActive: await page.getByText('Faults Active').count(),
  consoleTail: (
    await page.locator('text=/SHORT CIRCUIT|TRIPPED|tripped|Short circuit/').allInnerTexts()
  ).slice(0, 6),
};
await page.screenshot({ path: 'test-results/probe4-after-rerun.png' });
console.log(JSON.stringify(out, null, 2));
await browser.close();
