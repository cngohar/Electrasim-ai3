/**
 * componentArt — near-realistic lightweight SVG art for the default seed
 * circuit components.
 *
 * This is an experimental upgrade: each shape is hand-drawn vector art that
 * reads as the actual physical device (a DIN-rail MCB, a UK socket faceplate,
 * a wall rocker switch, a ceiling fan…) while staying crisp at any zoom and
 * costing zero network weight (inline data-URI, no raster images).
 *
 * Only the DEFAULT components are upgraded here so the user can compare the
 * new art against the untouched rest. Non-default components keep their
 * existing renderer. Gradient ids are namespaced per type to avoid SVG id
 * collisions when many nodes share the canvas.
 */

const S = (body: string, w = 64, h = 64) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  )}`;

const T = (type: string) => `g${type.replace(/[^a-z0-9]/gi, '')}`;

/** The default seed-circuit types we are upgrading. */
export const DEFAULT_ART_TYPES = new Set([
  'mcb',
  'rcd',
  'fuse',
  'socket-3pin',
  'single-way-switch',
  'two-way-switch',
  'push-button',
  'ceiling-fan',
  'motor',
  'dimmer-switch',
  'fan-dimmer',
  'distribution-board',
  'junction-box',
  'live-terminal',
  'neutral-terminal',
  'earth-terminal',
  'contactor',
  'timer-switch',
  'bell',
  'bulb',
]);

const ART: Record<string, string> = {
  // ─── DIN-rail MCB ──────────────────────────────────────────────────────
  mcb: S(`
    <defs>
      <linearGradient id="${T('mcb')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="${T('mcb')}bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <rect x="18" y="6" width="28" height="52" rx="5" fill="url(#${T('mcb')}body)" stroke="#64748b" stroke-width="2"/>
    <rect x="18" y="6" width="28" height="8" rx="4" fill="#334155"/>
    <line x1="22" y1="9" x2="42" y2="9" stroke="#64748b" stroke-width="1"/>
    <rect x="23" y="17" width="18" height="24" rx="2" fill="#cbd5e1"/>
    <rect x="26" y="20" width="12" height="18" rx="1.5" fill="url(#${T('mcb')}bar)"/>
    <rect x="29" y="22" width="6" height="14" rx="1.5" fill="#0f172a" transform="rotate(18 32 29)"/>
    <circle cx="32" cy="22" r="1.6" fill="#e0f2fe"/>
    <line x1="24" y1="46" x2="40" y2="46" stroke="#64748b" stroke-width="1"/>
    <rect x="21" y="46" width="22" height="7" rx="2" fill="#94a3b8"/>
    <line x1="26" y1="49.5" x2="38" y2="49.5" stroke="#e2e8f0" stroke-width="1"/>
    <text x="32" y="59" text-anchor="middle" font-size="7" font-weight="800" fill="#475569" font-family="ui-monospace,monospace">B16</text>
  `),

  // ─── RCD / RCCB ────────────────────────────────────────────────────────
  rcd: S(`
    <defs>
      <linearGradient id="${T('rcd')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e0f2fe"/>
      </linearGradient>
    </defs>
    <rect x="14" y="6" width="36" height="52" rx="5" fill="url(#${T('rcd')}body)" stroke="#0284c7" stroke-width="2"/>
    <rect x="14" y="6" width="36" height="8" rx="4" fill="#0c4a6e"/>
    <rect x="18" y="17" width="18" height="20" rx="2" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
    <rect x="21" y="20" width="12" height="14" rx="1.5" fill="#0284c7"/>
    <rect x="24" y="23" width="6" height="8" rx="1" fill="#0f172a" transform="rotate(18 27 27)"/>
    <circle cx="44" cy="21" r="6" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
    <text x="44" y="23.5" text-anchor="middle" font-size="6" font-weight="900" fill="#92400e">T</text>
    <rect x="20" y="41" width="24" height="8" rx="2" fill="#94a3b8"/>
    <text x="32" y="57" text-anchor="middle" font-size="6.5" font-weight="800" fill="#0c4a6e" font-family="ui-monospace,monospace">30mA</text>
  `),

  // ─── Fuse carrier ──────────────────────────────────────────────────────
  fuse: S(`
    <defs>
      <linearGradient id="${T('fuse')}metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <line x1="4" y1="32" x2="22" y2="32" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <line x1="42" y1="32" x2="60" y2="32" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <rect x="22" y="22" width="8" height="20" rx="3" fill="url(#${T('fuse')}metal)" stroke="#64748b" stroke-width="1.5"/>
    <rect x="34" y="22" width="8" height="20" rx="3" fill="url(#${T('fuse')}metal)" stroke="#64748b" stroke-width="1.5"/>
    <rect x="27" y="18" width="12" height="28" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
    <line x1="31" y1="24" x2="35" y2="24" stroke="#d97706" stroke-width="2"/>
    <path d="M33 28 v8" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
  `),

  // ─── UK 3-pin socket faceplate ─────────────────────────────────────────
  'socket-3pin': S(`
    <defs>
      <linearGradient id="${T('socket3pin')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="44" height="48" rx="9" fill="url(#${T('socket3pin')}face)" stroke="#94a3b8" stroke-width="2"/>
    <rect x="14" y="12" width="36" height="40" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle cx="20" cy="16" r="1.6" fill="#cbd5e1"/>
    <circle cx="44" cy="16" r="1.6" fill="#cbd5e1"/>
    <rect x="31.2" y="16" width="2.6" height="9" rx="1.3" fill="#0f172a"/>
    <rect x="20" y="29" width="8" height="3.6" rx="1.4" fill="#0f172a"/>
    <rect x="36" y="29" width="8" height="3.6" rx="1.4" fill="#0f172a"/>
    <rect x="29.5" y="36" width="6" height="5" rx="1.5" fill="#475569"/>
    <path d="M32 36 v-6" stroke="#334155" stroke-width="1.2"/>
    <circle cx="20" cy="44" r="1.6" fill="#cbd5e1"/>
    <circle cx="44" cy="44" r="1.6" fill="#cbd5e1"/>
  `),

  // ─── Wall rocker switch ────────────────────────────────────────────────
  'single-way-switch': S(`
    <defs>
      <linearGradient id="${T('singlewayswitch')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="${T('singlewayswitch')}rocker" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>
    <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#${T('singlewayswitch')}face)" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="18" cy="13" r="1.5" fill="#cbd5e1"/>
    <circle cx="46" cy="13" r="1.5" fill="#cbd5e1"/>
    <rect x="18" y="16" width="28" height="32" rx="6" fill="url(#${T('singlewayswitch')}rocker)" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="22" y="22" width="20" height="20" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <line x1="22" y1="32" x2="42" y2="32" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle cx="32" cy="26" r="1.8" fill="#16a34a"/>
  `),

  // ─── Two-way switch ────────────────────────────────────────────────────
  'two-way-switch': S(`
    <defs>
      <linearGradient id="${T('twowayswitch')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
    </defs>
    <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#${T('twowayswitch')}face)" stroke="#94a3b8" stroke-width="2"/>
    <rect x="18" y="16" width="28" height="32" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M22 26 L30 20 L30 26 L22 32 Z M38 26 L30 20 L30 26 L38 32 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
    <path d="M22 40 L30 34 L30 40 L22 46 Z M38 40 L30 34 L30 40 L38 46 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="30" cy="30" r="1.8" fill="#16a34a"/>
  `),

  // ─── Push button (momentary) ───────────────────────────────────────────
  'push-button': S(`
    <defs>
      <linearGradient id="${T('pushbutton')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <radialGradient id="${T('pushbutton')}btn" cx="0.4" cy="0.35" r="1">
        <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/>
      </radialGradient>
    </defs>
    <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#${T('pushbutton')}face)" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="32" cy="32" r="16" fill="url(#${T('pushbutton')}btn)" stroke="#0369a1" stroke-width="2"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="#7dd3fc" stroke-width="1.5" opacity="0.6"/>
    <circle cx="28" cy="27" r="3" fill="#e0f2fe" opacity="0.7"/>
    <text x="32" y="37" text-anchor="middle" font-size="7" font-weight="900" fill="#ffffff" font-family="ui-monospace,monospace">PUSH</text>
  `),

  // ─── Ceiling fan ───────────────────────────────────────────────────────
  'ceiling-fan': S(`
    <defs>
      <linearGradient id="${T('ceilingfan')}blade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0ea5e9"/>
      </linearGradient>
    </defs>
    <rect x="30" y="4" width="4" height="10" fill="#94a3b8"/>
    <path d="M32 14 Q32 18 38 18" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <g transform="rotate(-15 32 32)">
      <path d="M32 20 C22 8 8 14 20 30 L20 30 C30 24 36 22 44 24 Z" fill="url(#${T('ceilingfan')}blade)" opacity="0.9"/>
      <path d="M42 30 C54 30 52 46 38 42 L38 42 C44 34 44 26 40 20 Z" fill="url(#${T('ceilingfan')}blade)" opacity="0.9"/>
      <path d="M28 42 C24 54 12 48 24 34 L24 34 C30 40 34 42 38 42 Z" fill="url(#${T('ceilingfan')}blade)" opacity="0.9"/>
    </g>
    <circle cx="32" cy="32" r="7" fill="#0c4a6e" stroke="#7dd3fc" stroke-width="2"/>
    <circle cx="32" cy="32" r="2.5" fill="#e0f2fe"/>
  `),

  // ─── Motor ─────────────────────────────────────────────────────────────
  motor: S(`
    <defs>
      <linearGradient id="${T('motor')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <rect x="16" y="14" width="32" height="36" rx="6" fill="url(#${T('motor')}body)" stroke="#475569" stroke-width="2"/>
    <line x1="16" y1="22" x2="48" y2="22" stroke="#64748b" stroke-width="1"/>
    <line x1="16" y1="30" x2="48" y2="30" stroke="#64748b" stroke-width="1"/>
    <line x1="16" y1="38" x2="48" y2="38" stroke="#64748b" stroke-width="1"/>
    <line x1="16" y1="46" x2="48" y2="46" stroke="#64748b" stroke-width="1"/>
    <rect x="40" y="18" width="10" height="6" rx="2" fill="#0f172a"/>
    <rect x="40" y="40" width="10" height="6" rx="2" fill="#0f172a"/>
    <circle cx="32" cy="32" r="8" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M32 24 L32 27 M32 37 L32 40 M24 32 L27 32 M37 32 L40 32" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="2" fill="#38bdf8"/>
  `),

  // ─── Rotary dimmer / fan speed switch ──────────────────────────────────
  'dimmer-switch': S(`
    <defs>
      <linearGradient id="${T('dimmerswitch')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fef3c7"/>
      </linearGradient>
      <radialGradient id="${T('dimmerswitch')}knob" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#d97706"/>
      </radialGradient>
    </defs>
    <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#${T('dimmerswitch')}face)" stroke="#d97706" stroke-width="2"/>
    <circle cx="32" cy="30" r="17" fill="url(#${T('dimmerswitch')}knob)" stroke="#b45309" stroke-width="2"/>
    <circle cx="32" cy="30" r="12" fill="#fde68a" stroke="#b45309" stroke-width="1"/>
    <rect x="30.6" y="16" width="2.8" height="10" rx="1.4" fill="#0f172a"/>
    <circle cx="25" cy="24" r="1.5" fill="#fef9c3"/>
    <circle cx="39" cy="36" r="1.5" fill="#fef9c3"/>
  `),

  'fan-dimmer': S(`
    <defs>
      <linearGradient id="${T('fandimmer')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ecfeff"/>
      </linearGradient>
      <radialGradient id="${T('fandimmer')}knob" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#0891b2"/>
      </radialGradient>
    </defs>
    <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#${T('fandimmer')}face)" stroke="#0891b2" stroke-width="2"/>
    <circle cx="32" cy="30" r="17" fill="url(#${T('fandimmer')}knob)" stroke="#0e7490" stroke-width="2"/>
    <circle cx="32" cy="30" r="12" fill="#cffafe" stroke="#0891b2" stroke-width="1"/>
    <rect x="30.6" y="16" width="2.8" height="10" rx="1.4" fill="#083344"/>
    <path d="M24 38 a10 10 0 0 0 16 0" fill="none" stroke="#0891b2" stroke-width="1.5"/>
    <circle cx="25" cy="24" r="1.5" fill="#ecfeff"/>
    <circle cx="39" cy="36" r="1.5" fill="#ecfeff"/>
  `),

  // ─── Distribution board / consumer unit ────────────────────────────────
  'distribution-board': S(`
    <defs>
      <linearGradient id="${T('distributionboard')}door" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect x="7" y="10" width="50" height="44" rx="4" fill="url(#${T('distributionboard')}door)" stroke="#475569" stroke-width="2"/>
    <rect x="12" y="15" width="40" height="12" rx="2" fill="#0f172a"/>
    <rect x="15" y="18" width="7" height="6" rx="1" fill="#38bdf8"/>
    <rect x="25" y="18" width="7" height="6" rx="1" fill="#38bdf8"/>
    <rect x="35" y="18" width="7" height="6" rx="1" fill="#22c55e"/>
    <rect x="45" y="18" width="4" height="6" rx="1" fill="#eab308"/>
    <rect x="12" y="31" width="40" height="6" rx="2" fill="#0f172a"/>
    <circle cx="18" cy="41" r="1.6" fill="#facc15"/>
    <circle cx="26" cy="41" r="1.6" fill="#facc15"/>
    <circle cx="34" cy="41" r="1.6" fill="#facc15"/>
    <circle cx="42" cy="41" r="1.6" fill="#facc15"/>
    <circle cx="50" cy="41" r="1.6" fill="#facc15"/>
  `),

  // ─── Junction box ──────────────────────────────────────────────────────
  'junction-box': S(`
    <defs>
      <radialGradient id="${T('junctionbox')}cap" cx="0.4" cy="0.35" r="1">
        <stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="22" fill="url(#${T('junctionbox')}cap)" stroke="#64748b" stroke-width="2"/>
    <circle cx="32" cy="32" r="15" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="32" cy="32" r="4" fill="#0f172a"/>
    <circle cx="24" cy="24" r="1.5" fill="#475569"/>
    <circle cx="40" cy="24" r="1.5" fill="#475569"/>
    <circle cx="24" cy="40" r="1.5" fill="#475569"/>
    <circle cx="40" cy="40" r="1.5" fill="#475569"/>
    <rect x="30" y="5" width="4" height="5" fill="#94a3b8"/>
    <rect x="30" y="54" width="4" height="5" fill="#94a3b8"/>
  `),

  // ─── Terminals ─────────────────────────────────────────────────────────
  'live-terminal': S(`
    <rect x="8" y="22" width="48" height="20" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
    <rect x="16" y="26" width="32" height="12" rx="2" fill="#dc2626"/>
    <path d="M24 32 h16" stroke="#fecaca" stroke-width="2" stroke-linecap="round"/>
    <text x="32" y="12" text-anchor="middle" font-size="6" font-weight="800" fill="#dc2626" font-family="ui-monospace,monospace">L</text>
  `),
  'neutral-terminal': S(`
    <rect x="8" y="22" width="48" height="20" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <rect x="16" y="26" width="32" height="12" rx="2" fill="#2563eb"/>
    <path d="M24 32 h16" stroke="#bfdbfe" stroke-width="2" stroke-linecap="round"/>
    <text x="32" y="12" text-anchor="middle" font-size="6" font-weight="800" fill="#2563eb" font-family="ui-monospace,monospace">N</text>
  `),
  'earth-terminal': S(`
    <defs>
      <clipPath id="${T('earthterminal')}clip"><rect x="16" y="26" width="32" height="12" rx="2"/></clipPath>
    </defs>
    <rect x="8" y="22" width="48" height="20" rx="4" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <rect x="16" y="26" width="32" height="12" rx="2" fill="#eab308"/>
    <g clip-path="url(#${T('earthterminal')}clip)">
      <rect x="20" y="24" width="8" height="16" fill="#16a34a"/>
      <rect x="28" y="24" width="8" height="16" fill="#fefce8"/>
      <rect x="36" y="24" width="8" height="16" fill="#16a34a"/>
    </g>
    <text x="32" y="12" text-anchor="middle" font-size="6" font-weight="800" fill="#16a34a" font-family="ui-monospace,monospace">E</text>
  `),

  // ─── Contactor ─────────────────────────────────────────────────────────
  contactor: S(`
    <defs>
      <linearGradient id="${T('contactor')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect x="12" y="10" width="40" height="44" rx="4" fill="url(#${T('contactor')}body)" stroke="#475569" stroke-width="2"/>
    <rect x="18" y="15" width="28" height="8" rx="2" fill="#0f172a"/>
    <rect x="24" y="17" width="4" height="4" rx="1" fill="#38bdf8"/>
    <rect x="30" y="17" width="4" height="4" rx="1" fill="#38bdf8"/>
    <rect x="36" y="17" width="4" height="4" rx="1" fill="#38bdf8"/>
    <path d="M24 28 v8 M40 28 v8 M24 42 h16" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="20" y="24" width="24" height="4" rx="1" fill="#0f172a"/>
    <circle cx="32" cy="38" r="2" fill="#eab308"/>
  `),

  // ─── Timer switch ──────────────────────────────────────────────────────
  'timer-switch': S(`
    <defs>
      <linearGradient id="${T('timerswitch')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e0f2fe"/>
      </linearGradient>
    </defs>
    <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#${T('timerswitch')}face)" stroke="#0284c7" stroke-width="2"/>
    <rect x="18" y="16" width="28" height="22" rx="3" fill="#0c4a6e"/>
    <rect x="21" y="19" width="22" height="14" rx="2" fill="#082f49"/>
    <text x="32" y="29" text-anchor="middle" font-size="8" font-weight="800" fill="#7dd3fc" font-family="ui-monospace,monospace">18:30</text>
    <rect x="21" y="42" width="9" height="7" rx="2" fill="#0284c7"/>
    <rect x="34" y="42" width="9" height="7" rx="2" fill="#0284c7"/>
  `),

  // ─── Bell / doorbell ───────────────────────────────────────────────────
  bell: S(`
    <defs>
      <linearGradient id="${T('bell')}bell" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#d97706"/>
      </linearGradient>
    </defs>
    <path d="M14 40 a18 18 0 0 1 36 0 Z" fill="url(#${T('bell')}bell)" stroke="#b45309" stroke-width="2"/>
    <path d="M20 40 a12 12 0 0 0 24 0 Z" fill="#92400e" opacity="0.25"/>
    <circle cx="32" cy="40" r="6" fill="#fef3c7"/>
    <path d="M32 30 v10" stroke="#92400e" stroke-width="1.5"/>
    <circle cx="32" cy="12" r="3" fill="#dc2626"/>
    <line x1="32" y1="15" x2="32" y2="21" stroke="#dc2626" stroke-width="1.5"/>
    <rect x="14" y="44" width="36" height="6" rx="3" fill="#78350f" stroke="#92400e" stroke-width="1"/>
  `),

  // ─── LED bulb (replaces the photo) ─────────────────────────────────────
  bulb: S(`
    <defs>
      <radialGradient id="${T('bulb')}glass" cx="0.4" cy="0.35" r="1">
        <stop offset="0" stop-color="#fefce8"/><stop offset="0.6" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/>
      </radialGradient>
    </defs>
    <path d="M32 6 c-11 0-18 8-18 18 0 8 5 12 9 16 h18 c4-4 9-8 9-16 C50 14 43 6 32 6 Z" fill="url(#${T('bulb')}glass)" stroke="#d97706" stroke-width="1.5"/>
    <path d="M26 22 a7 7 0 0 1 12 0" fill="none" stroke="#b45309" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="26" y="30" width="12" height="3" rx="1" fill="#b45309"/>
    <path d="M25 42 h14 M26 48 h12 M28 54 h8" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="23" y="42" width="18" height="4" rx="2" fill="#cbd5e1"/>
  `),
};

/** Resolve near-realistic art for a type, or undefined if not upgraded. */
export function getDefaultArt(type: string): string | undefined {
  return ART[type];
}
