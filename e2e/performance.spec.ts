import { type Page, expect, test } from '@playwright/test';

interface FrameStats {
  count: number;
  average: number;
  p95: number;
  longFrameRatio: number;
}

interface GestureStats extends FrameStats {
  duration: number;
  handlerAverage: number;
  handlerP95: number;
  commitHandlerDuration: number;
}

async function measurePointerGesture(
  page: Page,
  options: {
    selector: string;
    button: 0 | 1;
    delta: { x: number; y: number };
    frames?: number;
  },
): Promise<GestureStats> {
  return page.evaluate(async ({ selector, button, delta, frames = 60 }) => {
    const target = document.querySelector<Element>(selector);
    if (!target) throw new Error(`Gesture target not found: ${selector}`);

    const box = target.getBoundingClientRect();
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const buttons = button === 1 ? 4 : 1;
    const pointerId = 42;
    const dispatch = (
      eventTarget: EventTarget,
      type: 'pointerdown' | 'pointermove' | 'pointerup',
      step: number,
    ): number => {
      const progress = step / frames;
      const startedAt = performance.now();
      eventTarget.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType: 'mouse',
          isPrimary: true,
          button: type === 'pointermove' ? -1 : button,
          buttons: type === 'pointerup' ? 0 : buttons,
          clientX: start.x + delta.x * progress,
          clientY: start.y + delta.y * progress,
        }),
      );
      return performance.now() - startedAt;
    };
    const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

    dispatch(target, 'pointerdown', 0);
    const startedAt = performance.now();
    let previous = startedAt;
    const intervals: number[] = [];
    const handlerDurations: number[] = [];
    for (let step = 1; step <= frames; step += 1) {
      const now = await nextFrame();
      const interval = now - previous;
      previous = now;
      if (step > 2) intervals.push(interval);
      handlerDurations.push(dispatch(window, 'pointermove', step));
    }
    const commitHandlerDuration = dispatch(window, 'pointerup', frames);
    const committedAt = await nextFrame();
    intervals.push(committedAt - previous);

    const sorted = [...intervals].sort((a, b) => a - b);
    const sortedHandlers = [...handlerDurations].sort((a, b) => a - b);
    return {
      count: intervals.length,
      average: intervals.reduce((sum, value) => sum + value, 0) / intervals.length,
      p95: sorted[Math.floor(sorted.length * 0.95)] ?? Number.POSITIVE_INFINITY,
      longFrameRatio: intervals.filter((value) => value > 50).length / intervals.length,
      duration: performance.now() - startedAt,
      handlerAverage:
        handlerDurations.reduce((sum, value) => sum + value, 0) / handlerDurations.length,
      handlerP95:
        sortedHandlers[Math.floor(sortedHandlers.length * 0.95)] ?? Number.POSITIVE_INFINITY,
      commitHandlerDuration,
    };
  }, options);
}

test.describe('dense editor benchmark', () => {
  const explicitlySelected = process.argv.some((arg) => arg.includes('performance.spec'));
  test.skip(
    process.env.PERF !== '1' && !explicitlySelected,
    'Run explicitly with `npm run benchmark:browser`.',
  );

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('electrasim:welcomed', '1');
    });
  });

  test('keeps the SVG editing path responsive at roughly 200 components', async ({ page }) => {
    await page.goto('/');

    const stressButton = page.getByRole('button', { name: 'Stress' });
    await expect(stressButton).toBeVisible();
    await stressButton.click({ modifiers: ['Shift'] });
    await expect(page.getByText(/202 components · 300 wires/)).toBeVisible();

    await page.getByRole('button', { name: /^Run Simulation$/ }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-render-detail="reduced-wires"]')).toHaveCount(1);
    await expect(page.locator('[data-component-id]').first()).toHaveAttribute(
      'data-render-detail',
      'reduced',
    );

    const deferredWireState = await page
      .locator('[data-component-id] > [role="button"]')
      .first()
      .evaluate(async (node) => {
        const box = node.getBoundingClientRect();
        const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const layer = document.querySelector<SVGElement>('[data-dense-wire-layer]');
        node.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            button: 0,
            buttons: 1,
            clientX: start.x,
            clientY: start.y,
            pointerId: 31,
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
            pointerId: 31,
            pointerType: 'mouse',
          }),
        );
        await new Promise(requestAnimationFrame);
        const during = layer?.style.opacity ?? '';
        window.dispatchEvent(
          new PointerEvent('pointercancel', {
            bubbles: true,
            pointerId: 31,
            pointerType: 'mouse',
          }),
        );
        await new Promise(requestAnimationFrame);
        return { during, after: layer?.style.opacity ?? '' };
      });
    expect(deferredWireState).toEqual({ during: '0.28', after: '' });

    const wirePoint = await page
      .locator('path[data-wire-id]')
      .first()
      .evaluate((path) => {
        if (!(path instanceof SVGPathElement))
          throw new Error('Dense wire hit target is not a path.');
        const point = path.getPointAtLength(path.getTotalLength() / 2);
        const matrix = path.getScreenCTM();
        if (!matrix) throw new Error('Dense wire hit target has no screen transform.');
        const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
        return { x: screen.x, y: screen.y };
      });
    const trustedPanBefore = await page.locator('[data-canvas-world]').getAttribute('transform');
    await page.mouse.move(wirePoint.x, wirePoint.y);
    await page.mouse.down({ button: 'middle' });
    await page.mouse.move(wirePoint.x + 24, wirePoint.y + 12);
    await page.mouse.up({ button: 'middle' });
    await expect(page.locator('[data-canvas-world]')).not.toHaveAttribute(
      'transform',
      trustedPanBefore ?? '',
    );

    const panFrames = await measurePointerGesture(page, {
      selector: 'svg[aria-label="Circuit diagram"]',
      button: 1,
      delta: { x: 100, y: 60 },
    });
    test.info().annotations.push({
      type: 'pan-duration',
      description: `${panFrames.duration.toFixed(1)} ms`,
    });
    await test.info().attach('pan-frame-budget.json', {
      body: Buffer.from(JSON.stringify(panFrames, null, 2)),
      contentType: 'application/json',
    });

    const component = page.locator('[data-component-id]').first();
    const componentTransformBefore = await component.getAttribute('transform');
    const dragFrames = await measurePointerGesture(page, {
      selector: '[data-component-id] > [role="button"]',
      button: 0,
      delta: { x: 80, y: 40 },
    });
    const componentTransformAfter = await component.getAttribute('transform');
    await test.info().attach('drag-frame-budget.json', {
      body: Buffer.from(JSON.stringify(dragFrames, null, 2)),
      contentType: 'application/json',
    });

    console.info('Dense interaction frames', JSON.stringify({ panFrames, dragFrames }));
    expect(componentTransformAfter).not.toBe(componentTransformBefore);

    const frames = await page.evaluate(
      () =>
        new Promise<{ average: number; p95: number; longFrameRatio: number }>((resolve) => {
          const intervals: number[] = [];
          let previous = performance.now();
          const sample = (now: number) => {
            intervals.push(now - previous);
            previous = now;
            if (intervals.length < 180) {
              requestAnimationFrame(sample);
              return;
            }
            const sorted = [...intervals].sort((a, b) => a - b);
            resolve({
              average: intervals.reduce((sum, value) => sum + value, 0) / intervals.length,
              p95: sorted[Math.floor(sorted.length * 0.95)] ?? Number.POSITIVE_INFINITY,
              longFrameRatio: intervals.filter((value) => value > 50).length / intervals.length,
            });
          };
          requestAnimationFrame(sample);
        }),
    );

    await test.info().attach('frame-budget.json', {
      body: Buffer.from(JSON.stringify(frames, null, 2)),
      contentType: 'application/json',
    });
    console.info('Dense idle frames', JSON.stringify(frames));
    expect(panFrames.duration).toBeLessThan(10_000);
    expect(panFrames.count).toBeGreaterThanOrEqual(50);
    expect(panFrames.handlerAverage).toBeLessThan(1);
    expect(panFrames.handlerP95).toBeLessThan(2);
    expect(panFrames.commitHandlerDuration).toBeLessThan(16);
    expect(dragFrames.duration).toBeLessThan(10_000);
    expect(dragFrames.count).toBeGreaterThanOrEqual(50);
    expect(dragFrames.handlerAverage).toBeLessThan(1);
    expect(dragFrames.handlerP95).toBeLessThan(2);
    expect(dragFrames.commitHandlerDuration).toBeLessThan(16);
    expect(frames.average).toBeLessThan(30);
    expect(frames.p95).toBeLessThanOrEqual(50);
    expect(frames.longFrameRatio).toBeLessThan(0.1);
  });
});
