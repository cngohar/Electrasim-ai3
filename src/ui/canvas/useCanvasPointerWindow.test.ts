import { describe, expect, it } from 'vitest';
import { resolveDragUpdates } from './useCanvasPointerWindow';

describe('resolveDragUpdates', () => {
  const starts = new Map([
    ['off-grid', { x: 110, y: 150 }],
    ['second', { x: 290, y: 150 }],
  ]);

  it('does not snap or commit a zero-motion selection click', () => {
    expect(resolveDragUpdates(starts, { x: 0, y: 0 }, 24, true, false)).toEqual({
      updates: [
        { id: 'off-grid', x: 110, y: 150 },
        { id: 'second', x: 290, y: 150 },
      ],
      moved: false,
    });
  });

  it('snaps a real group drag once at commit', () => {
    expect(resolveDragUpdates(starts, { x: 20, y: 10 }, 24, true, true)).toEqual({
      updates: [
        { id: 'off-grid', x: 120, y: 168 },
        { id: 'second', x: 312, y: 168 },
      ],
      moved: true,
    });
  });

  it('restores exact start positions when a gesture is cancelled', () => {
    expect(resolveDragUpdates(starts, { x: 80, y: 40 }, 24, false, true)).toEqual({
      updates: [
        { id: 'off-grid', x: 110, y: 150 },
        { id: 'second', x: 290, y: 150 },
      ],
      moved: false,
    });
  });
});
