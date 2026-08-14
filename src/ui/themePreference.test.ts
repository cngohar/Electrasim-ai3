import { afterEach, describe, expect, it } from 'vitest';
import { applyDocumentTheme, readThemeHint, resolveThemePreference } from './themePreference';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-app-theme');
  document.documentElement.style.colorScheme = '';
  document.querySelector('meta[name="theme-color"]')?.remove();
  localStorage.clear();
});

describe('theme preference bootstrap', () => {
  it('resolves explicit and system preferences', () => {
    expect(resolveThemePreference('light', true)).toBe('light');
    expect(resolveThemePreference('dark', false)).toBe('dark');
    expect(resolveThemePreference('system', true)).toBe('dark');
    expect(resolveThemePreference('system', false)).toBe('light');
  });

  it('applies and stores a resolved theme hint', () => {
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    document.head.append(themeColor);

    applyDocumentTheme('dark');

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement.dataset.appTheme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(themeColor.content).toBe('#111827');
    expect(readThemeHint()).toBe('dark');
  });
});
