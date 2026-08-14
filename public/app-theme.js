(() => {
  const hintKey = 'electrasim:app-theme-hint';
  let theme;

  try {
    const hint = localStorage.getItem(hintKey);
    if (hint === 'light' || hint === 'dark') theme = hint;
  } catch {
    // Storage can be unavailable in strict privacy modes; the OS preference is still usable.
  }

  theme ??= 'light';

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.appTheme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute('content', theme === 'dark' ? '#111827' : '#2563eb');
})();
