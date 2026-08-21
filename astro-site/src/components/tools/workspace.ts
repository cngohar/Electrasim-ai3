/**
 * Tool workspace behaviour — drawer, command palette, panels, fullscreen.
 *
 * Bundled by Astro (not inline), so the strict `script-src 'self'` CSP is
 * unchanged. Framework-free: state lives in the DOM via classes and data
 * attributes, so there is no hydration cost and nothing re-renders.
 */
import { TOOL_COMMANDS, TOOLS, searchTools } from '../../lib/tools/registry';

type Cleanup = () => void;

const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector(sel) as T | null;

/** Focus-trapped overlay controller shared by the drawer and the palette. */
function createOverlay(panel: HTMLElement, opener: HTMLElement | null) {
  const scrim = qs('[data-overlay-scrim]');
  let lastFocus: HTMLElement | null = null;
  let release: Cleanup | null = null;

  const focusables = () =>
    Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  function open() {
    lastFocus = document.activeElement as HTMLElement;
    panel.hidden = false;
    if (scrim) scrim.hidden = false;
    opener?.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKey);
    scrim?.addEventListener('click', close);
    release = () => {
      document.removeEventListener('keydown', onKey);
      scrim?.removeEventListener('click', close);
    };
    focusables()[0]?.focus();
  }

  function close() {
    panel.hidden = true;
    if (scrim) scrim.hidden = true;
    opener?.setAttribute('aria-expanded', 'false');
    release?.();
    release = null;
    lastFocus?.focus();
  }

  return { open, close, isOpen: () => !panel.hidden };
}

export function initToolWorkspace() {
  /* ── Toolbox drawer ─────────────────────────────────────────────────── */
  const drawer = qs('[data-drawer]');
  const drawerOpen = qs('[data-drawer-open]');
  let drawerCtl: ReturnType<typeof createOverlay> | null = null;
  if (drawer) {
    drawerCtl = createOverlay(drawer, drawerOpen);
    drawerOpen?.addEventListener('click', () => drawerCtl?.open());
    qs('[data-drawer-close]', drawer)?.addEventListener('click', () => drawerCtl?.close());
  }

  /* ── Command palette ────────────────────────────────────────────────── */
  const palette = qs('[data-palette]');
  const input = qs<HTMLInputElement>('[data-palette-input]');
  const list = qs('[data-palette-list]');
  const currentTool = palette?.dataset.currentTool ?? '';
  let paletteCtl: ReturnType<typeof createOverlay> | null = null;
  let active = 0;

  type Row = { label: string; href?: string; command?: string; current: boolean; soon: boolean };

  const rows = (q: string): Row[] => {
    const term = q.trim().toLowerCase();
    const tools: Row[] = searchTools(q).map((t) => ({
      label: t.name,
      href: t.status === 'available' ? t.route : undefined,
      current: t.id === currentTool,
      soon: t.status === 'coming-soon',
    }));
    const cmds: Row[] = TOOL_COMMANDS.filter((c) => !term || c.label.toLowerCase().includes(term)).map((c) => ({
      label: c.label,
      href: c.route,
      command: c.action === 'navigate' ? undefined : c.action,
      current: false,
      soon: false,
    }));
    return [...tools, ...cmds];
  };

  function render(q = '') {
    if (!list) return;
    const data = rows(q);
    active = Math.min(active, Math.max(0, data.length - 1));
    if (data.length === 0) {
      list.innerHTML = '<li class="tool-palette-empty">No tools or commands match that.</li>';
      return;
    }
    list.innerHTML = '';
    data.forEach((row, i) => {
      const li = document.createElement('li');
      const el = document.createElement(row.href && !row.soon ? 'a' : 'button');
      el.className = 'tool-nav-item';
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', String(i === active));
      if (i === active) el.dataset.active = 'true';
      if (row.href && !row.soon) (el as HTMLAnchorElement).href = row.href;
      if (row.command) el.dataset.command = row.command;
      if (row.soon) {
        el.dataset.disabled = 'true';
        el.setAttribute('aria-disabled', 'true');
      }
      if (row.current) el.setAttribute('aria-current', 'page');
      el.innerHTML =
        `<span class="tool-nav-check" aria-hidden="true">${row.current ? '✓' : ''}</span>` +
        `${row.label}${row.soon ? '<span class="tool-nav-soon">Soon</span>' : ''}`;
      li.appendChild(el);
      list.appendChild(li);
    });
  }

  if (palette && input && list) {
    paletteCtl = createOverlay(palette, null);
    const openPalette = () => {
      active = 0;
      input.value = '';
      render('');
      paletteCtl?.open();
      input.focus();
    };

    qs('[data-palette-open]')?.addEventListener('click', openPalette);
    input.addEventListener('input', () => {
      active = 0;
      render(input.value);
    });

    palette.addEventListener('keydown', (e) => {
      const items = Array.from(list.querySelectorAll<HTMLElement>('.tool-nav-item'));
      if (items.length === 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((el, i) => {
          el.dataset.active = String(i === active);
          el.setAttribute('aria-selected', String(i === active));
        });
        items[active].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[active]?.click();
      }
    });

    // Shift+Space, ignored while typing in a field.
    document.addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
      if (e.shiftKey && e.code === 'Space' && !typing) {
        e.preventDefault();
        paletteCtl?.isOpen() ? paletteCtl.close() : openPalette();
      }
    });
  }

  /* ── Commands (reset / help / settings) ─────────────────────────────── */
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-command]');
    if (!btn) return;
    const action = btn.dataset.command;
    drawerCtl?.close();
    paletteCtl?.close();
    if (action === 'reset') document.dispatchEvent(new CustomEvent('tool:reset'));
    if (action === 'help' || action === 'settings') {
      document.dispatchEvent(new CustomEvent('tool:open-modal', { detail: action }));
    }
  });

  /* ── Collapsible floating panels ────────────────────────────────────── */
  for (const head of document.querySelectorAll<HTMLElement>('[data-panel-toggle]')) {
    head.addEventListener('click', () => {
      const panel = head.closest<HTMLElement>('.tool-panel');
      if (!panel) return;
      const collapsed = panel.dataset.collapsed === 'true';
      panel.dataset.collapsed = String(!collapsed);
      head.setAttribute('aria-expanded', String(collapsed));
    });
  }

  /* ── Fullscreen ─────────────────────────────────────────────────────── */
  for (const btn of document.querySelectorAll('[data-fullscreen]')) {
    btn.addEventListener('click', () => {
      drawerCtl?.close();
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.().catch(() => {});
    });
  }

  /* ── View toggles (reusable by any tool) ────────────────────────────── */
  const root = qs('[data-tool-page]');
  const VIEW_KEY = 'electrasim:tool-view';

  const readViewPrefs = (): Record<string, boolean> => {
    try {
      return JSON.parse(localStorage.getItem(VIEW_KEY) || '{}');
    } catch {
      return {};
    }
  };
  const writeViewPref = (id: string, on: boolean) => {
    try {
      localStorage.setItem(VIEW_KEY, JSON.stringify({ ...readViewPrefs(), [id]: on }));
    } catch {
      /* storage unavailable — the toggle still works for this page view */
    }
  };

  const applyView = (id: string, on: boolean) => {
    root?.setAttribute(`data-view-${id}`, String(on));
    document.dispatchEvent(new CustomEvent('tool:view', { detail: { id, on } }));
  };

  const stored = readViewPrefs();
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-view-toggle]')) {
    const id = btn.dataset.viewToggle as string;
    const on = stored[id] ?? btn.dataset.default !== 'false';
    btn.setAttribute('aria-pressed', String(on));
    applyView(id, on);
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(next));
      applyView(id, next);
      writeViewPref(id, next);
    });
  }

  /* ── Modals (reusable) ──────────────────────────────────────────────── */
  const modals = new Map<string, ReturnType<typeof createOverlay>>();
  for (const el of document.querySelectorAll<HTMLElement>('[data-modal]')) {
    const id = el.dataset.modal as string;
    const ctl = createOverlay(el, null);
    modals.set(id, ctl);
    qs('[data-modal-close]', el)?.addEventListener('click', () => ctl.close());
  }
  document.addEventListener('tool:open-modal', ((e: CustomEvent) => {
    modals.get(e.detail === 'settings' ? 'help' : e.detail)?.open();
  }) as EventListener);
  document.addEventListener('click', (e) => {
    const opener = (e.target as HTMLElement).closest<HTMLElement>('[data-modal-open]');
    if (!opener) return;
    e.preventDefault();
    drawerCtl?.close();
    paletteCtl?.close();
    modals.get(opener.dataset.modalOpen as string)?.open();
  });

  /* ── Rotating tips (reusable) ───────────────────────────────────────── */
  const tips = qs('[data-tips]');
  if (tips) {
    const textEl = qs('[data-tips-text]', tips);
    const strings = Array.from(tips.querySelectorAll('template')).map((t) => t.innerHTML.trim());
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let idx = 0;
    let timer = 0;

    const show = (i: number) => {
      idx = (i + strings.length) % strings.length;
      if (textEl) textEl.textContent = strings[idx];
    };
    const stop = () => {
      clearInterval(timer);
      timer = 0;
    };
    const start = () => {
      if (reduce || timer || strings.length < 2) return;
      timer = window.setInterval(() => show(idx + 1), Number(tips.dataset.interval || 7) * 1000);
    };

    qs('[data-tips-next]', tips)?.addEventListener('click', () => {
      show(idx + 1);
      stop();
      start();
    });

    const sw = qs<HTMLButtonElement>('[data-tips-toggle]', tips);
    const setTips = (on: boolean) => {
      sw?.setAttribute('aria-checked', String(on));
      tips.dataset.on = String(on);
      on ? start() : stop();
    };
    setTips((readViewPrefs().tips ?? true) as boolean);
    sw?.addEventListener('click', () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      setTips(next);
      writeViewPref('tips', next);
    });
  }

  /* ── Theme label follows the shared theme.js state ──────────────────── */
  const syncTheme = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    const page = qs('[data-tool-page]');
    if (page) page.dataset.theme = dark ? 'dark' : 'light';
    const label = qs('[data-theme-label]');
    if (label) label.textContent = dark ? 'Light Mode' : 'Dark Mode';
  };
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

export { TOOLS };
