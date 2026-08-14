/**
 * Smoke tests for useDevice — proves Vitest + RTL + jsdom are wired correctly
 * and that the breakpoint logic agrees with PLAN.md §6 (mobile-first).
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useDevice } from './useDevice';

const setViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

const ORIGINAL_WIDTH = window.innerWidth;
afterEach(() => {
  act(() => {
    setViewport(ORIGINAL_WIDTH);
  });
});

describe('useDevice', () => {
  it('reports phone below 640px', () => {
    act(() => {
      setViewport(390);
    });
    const { result } = renderHook(() => useDevice());
    expect(result.current).toBe('phone');
  });

  it('reports tablet between 640px and 1024px', () => {
    act(() => {
      setViewport(834);
    });
    const { result } = renderHook(() => useDevice());
    expect(result.current).toBe('tablet');
  });

  it('reports desktop at 1024px and above', () => {
    act(() => {
      setViewport(1440);
    });
    const { result } = renderHook(() => useDevice());
    expect(result.current).toBe('desktop');
  });

  it('updates on viewport resize', () => {
    act(() => {
      setViewport(1440);
    });
    const { result } = renderHook(() => useDevice());
    expect(result.current).toBe('desktop');

    act(() => {
      setViewport(390);
    });
    expect(result.current).toBe('phone');

    act(() => {
      setViewport(800);
    });
    expect(result.current).toBe('tablet');
  });
});
