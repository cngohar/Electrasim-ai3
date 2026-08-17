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
  'bulb-incandescent',
  'bulb-halogen',
  'bulb-cfl',
  'bulb-smart-rgb',
  'led-downlight',
  'tube-light',
]);

const ART: Record<string, string> = {
  // ─── DIN-rail MCB ──────────────────────────────────────────────────────
  mcb: S(`
    <defs>
      <linearGradient id="${T('mcb')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="${T('mcb')}bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#60a5fa"/><stop offset="0.5" stop-color="#3b82f6"/><stop offset="1" stop-color="#1d4ed8"/>
      </linearGradient>
      <linearGradient id="${T('mcb')}toggle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="${T('mcb')}screw" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <!-- Housing -->
    <rect x="17" y="5" width="30" height="54" rx="5" fill="url(#${T('mcb')}body)" stroke="#475569" stroke-width="1.5"/>
    <!-- Side profile shading -->
    <rect x="17" y="5" width="4" height="54" rx="2" fill="#cbd5e1"/>
    <rect x="43" y="5" width="4" height="54" rx="2" fill="#cbd5e1"/>
    <!-- Top terminal clamp + screw -->
    <rect x="22" y="5" width="20" height="7" rx="3" fill="#64748b"/>
    <circle cx="32" cy="8.5" r="2.4" fill="url(#${T('mcb')}screw)"/>
    <line x1="30.4" y1="8.5" x2="33.6" y2="8.5" stroke="#475569" stroke-width="0.8"/>
    <!-- DIN clip at bottom -->
    <path d="M20 56 h24 l-2 -4 h-20 Z" fill="#64748b"/>
    <!-- Toggle mechanism recess -->
    <rect x="23" y="15" width="18" height="30" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Toggle handle (up = ON) -->
    <g>
      <rect x="27" y="18" width="10" height="18" rx="5" fill="url(#${T('mcb')}toggle)" stroke="#94a3b8" stroke-width="1"/>
      <line x1="29" y1="20" x2="35" y2="20" stroke="#94a3b8" stroke-width="0.8"/>
    </g>
    <!-- Trip status window -->
    <rect x="26" y="38" width="12" height="5" rx="1.5" fill="#dc2626" stroke="#991b1b" stroke-width="0.8"/>
    <!-- Rating plate -->
    <text x="32" y="51" text-anchor="middle" font-size="6" font-weight="800" fill="#0f172a" font-family="ui-monospace,monospace">B16</text>
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
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f8fafc"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <radialGradient id="${T('socket3pin')}recess" cx="0.5" cy="0.4" r="1">
        <stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#cbd5e1"/>
      </radialGradient>
      <linearGradient id="${T('socket3pin')}screw" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <!-- Faceplate with bevel -->
    <rect x="9" y="7" width="46" height="50" rx="9" fill="url(#${T('socket3pin')}face)" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="12" y="10" width="40" height="44" rx="7" fill="none" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Corner screws -->
    <circle cx="16" cy="14" r="2" fill="url(#${T('socket3pin')}screw)"/>
    <line x1="15" y1="14" x2="17" y2="14" stroke="#64748b" stroke-width="0.7"/>
    <circle cx="48" cy="14" r="2" fill="url(#${T('socket3pin')}screw)"/>
    <line x1="47" y1="14" x2="49" y2="14" stroke="#64748b" stroke-width="0.7"/>
    <circle cx="16" cy="50" r="2" fill="url(#${T('socket3pin')}screw)"/>
    <line x1="15" y1="50" x2="17" y2="50" stroke="#64748b" stroke-width="0.7"/>
    <circle cx="48" cy="50" r="2" fill="url(#${T('socket3pin')}screw)"/>
    <line x1="47" y1="50" x2="49" y2="50" stroke="#64748b" stroke-width="0.7"/>
    <!-- Socket recess -->
    <rect x="18" y="18" width="28" height="30" rx="5" fill="url(#${T('socket3pin')}recess)"/>
    <!-- Earth pin (top, centre) -->
    <rect x="30.4" y="16" width="3.2" height="10" rx="1.6" fill="#0f172a"/>
    <ellipse cx="32" cy="16.5" rx="2.2" ry="1.2" fill="#334155"/>
    <!-- Line + neutral blades -->
    <rect x="20" y="30" width="9" height="4" rx="1.5" fill="#0f172a"/>
    <ellipse cx="20" cy="31.5" rx="1.2" ry="2.2" fill="#334155"/>
    <rect x="35" y="30" width="9" height="4" rx="1.5" fill="#0f172a"/>
    <ellipse cx="44" cy="31.5" rx="1.2" ry="2.2" fill="#334155"/>
    <!-- Shutter line -->
    <rect x="18" y="37" width="28" height="1" fill="#94a3b8" opacity="0.5"/>
  `),

  // ─── Wall rocker switch ────────────────────────────────────────────────
  'single-way-switch': S(`
    <defs>
      <linearGradient id="${T('singlewayswitch')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f8fafc"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="${T('singlewayswitch')}rocker" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f1f5f9"/><stop offset="1" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="${T('singlewayswitch')}screw" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <!-- Faceplate -->
    <rect x="11" y="7" width="42" height="50" rx="8" fill="url(#${T('singlewayswitch')}face)" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Corner screws -->
    <circle cx="16" cy="12" r="1.8" fill="url(#${T('singlewayswitch')}screw)"/>
    <circle cx="48" cy="12" r="1.8" fill="url(#${T('singlewayswitch')}screw)"/>
    <circle cx="16" cy="52" r="1.8" fill="url(#${T('singlewayswitch')}screw)"/>
    <circle cx="48" cy="52" r="1.8" fill="url(#${T('singlewayswitch')}screw)"/>
    <!-- Rocker recess -->
    <rect x="19" y="17" width="26" height="30" rx="5" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Rocker (angled, glossy) -->
    <g transform="rotate(12 32 32)">
      <rect x="22" y="20" width="20" height="24" rx="4" fill="url(#${T('singlewayswitch')}rocker)" stroke="#94a3b8" stroke-width="1"/>
      <rect x="22" y="20" width="20" height="5" rx="2" fill="#ffffff" opacity="0.5"/>
    </g>
    <!-- Pivot line -->
    <line x1="22" y1="32" x2="42" y2="32" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Green status pip -->
    <circle cx="32" cy="25" r="1.6" fill="#16a34a"/>
  `),

  // ─── Two-way switch ────────────────────────────────────────────────────
  'two-way-switch': S(`
    <defs>
      <linearGradient id="${T('twowayswitch')}face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f8fafc"/><stop offset="1" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="${T('twowayswitch')}rocker" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f1f5f9"/><stop offset="1" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="${T('twowayswitch')}screw" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <!-- Faceplate -->
    <rect x="11" y="7" width="42" height="50" rx="8" fill="url(#${T('twowayswitch')}face)" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="16" cy="12" r="1.8" fill="url(#${T('twowayswitch')}screw)"/>
    <circle cx="48" cy="12" r="1.8" fill="url(#${T('twowayswitch')}screw)"/>
    <circle cx="16" cy="52" r="1.8" fill="url(#${T('twowayswitch')}screw)"/>
    <circle cx="48" cy="52" r="1.8" fill="url(#${T('twowayswitch')}screw)"/>
    <!-- Two-way rocker (double-gang style with L1/L2) -->
    <rect x="19" y="17" width="26" height="30" rx="5" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="0.8"/>
    <g transform="rotate(-8 32 32)">
      <rect x="22" y="20" width="20" height="24" rx="4" fill="url(#${T('twowayswitch')}rocker)" stroke="#94a3b8" stroke-width="1"/>
      <rect x="22" y="20" width="20" height="5" rx="2" fill="#ffffff" opacity="0.5"/>
    </g>
    <line x1="22" y1="32" x2="42" y2="32" stroke="#cbd5e1" stroke-width="1"/>
    <circle cx="25" cy="27" r="1.4" fill="#94a3b8"/>
    <circle cx="39" cy="37" r="1.4" fill="#94a3b8"/>
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

  // ─── Finned electric motor ─────────────────────────────────────────────
  motor: S(`
    <defs>
      <linearGradient id="${T('motor')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#cbd5e1"/><stop offset="0.5" stop-color="#94a3b8"/><stop offset="1" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="${T('motor')}endcap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="${T('motor')}tbox" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#64748b"/>
      </linearGradient>
    </defs>
    <!-- Cylindrical body (fins) -->
    <rect x="14" y="22" width="36" height="22" rx="4" fill="url(#${T('motor')}body)" stroke="#475569" stroke-width="1.5"/>
    <!-- Cooling fins -->
    <g stroke="#64748b" stroke-width="1.2">
      <line x1="22" y1="22" x2="22" y2="44"/>
      <line x1="27" y1="22" x2="27" y2="44"/>
      <line x1="32" y1="22" x2="32" y2="44"/>
      <line x1="37" y1="22" x2="37" y2="44"/>
      <line x1="42" y1="22" x2="42" y2="44"/>
    </g>
    <!-- End caps -->
    <rect x="10" y="22" width="6" height="22" rx="2" fill="url(#${T('motor')}endcap)" stroke="#64748b" stroke-width="1.2"/>
    <rect x="48" y="22" width="6" height="22" rx="2" fill="url(#${T('motor')}endcap)" stroke="#64748b" stroke-width="1.2"/>
    <!-- Shaft on right -->
    <rect x="54" y="30" width="7" height="6" rx="1" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
    <!-- Terminal box on top -->
    <rect x="27" y="14" width="14" height="10" rx="2" fill="url(#${T('motor')}tbox)" stroke="#475569" stroke-width="1.2"/>
    <rect x="30" y="16" width="8" height="6" rx="1" fill="#0f172a"/>
    <circle cx="34" cy="19" r="1" fill="#38bdf8"/>
    <!-- Base / feet -->
    <path d="M16 44 h32 v3 h-32 Z" fill="#64748b"/>
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

  // ─── 4-way round junction box ──────────────────────────────────────────
  'junction-box': S(`
    <defs>
      <radialGradient id="${T('junctionbox')}cap" cx="0.4" cy="0.35" r="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#f1f5f9"/><stop offset="1" stop-color="#cbd5e1"/>
      </radialGradient>
      <linearGradient id="${T('junctionbox')}ring" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <!-- Round body -->
    <circle cx="32" cy="32" r="23" fill="url(#${T('junctionbox')}ring)" stroke="#64748b" stroke-width="1.5"/>
    <!-- Lid -->
    <circle cx="32" cy="32" r="19" fill="url(#${T('junctionbox')}cap)" stroke="#94a3b8" stroke-width="1.2"/>
    <!-- Lid moulded cross pattern -->
    <line x1="32" y1="15" x2="32" y2="49" stroke="#cbd5e1" stroke-width="0.8" opacity="0.7"/>
    <line x1="15" y1="32" x2="49" y2="32" stroke="#cbd5e1" stroke-width="0.8" opacity="0.7"/>
    <!-- Central screw -->
    <circle cx="32" cy="32" r="3.4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="30" y1="32" x2="34" y2="32" stroke="#64748b" stroke-width="1"/>
    <!-- Four cable entries -->
    <path d="M32 5 v7 M32 52 v7" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
    <path d="M5 32 h7 M52 32 h7" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="9" r="1.5" fill="#475569"/>
    <circle cx="32" cy="55" r="1.5" fill="#475569"/>
    <circle cx="9" cy="32" r="1.5" fill="#475569"/>
    <circle cx="55" cy="32" r="1.5" fill="#475569"/>
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

  // ─── Edison incandescent ───────────────────────────────────────────────
  'bulb-incandescent': S(`
    <defs>
      <radialGradient id="${T('bulbincandescent')}glass" cx="0.4" cy="0.35" r="1">
        <stop offset="0" stop-color="#fff7ed"/><stop offset="0.55" stop-color="#ffedd5"/><stop offset="1" stop-color="#fdba74"/>
      </radialGradient>
    </defs>
    <path d="M32 4 c-12 0-20 9-20 20 0 8 5 13 9 17 h22 c4-4 9-9 9-17 C52 13 44 4 32 4 Z" fill="url(#${T('bulbincandescent')}glass)" stroke="#ea580c" stroke-width="1.5"/>
    <!-- Filament (classic zig-zag) -->
    <path d="M24 20 l4 5 4-5 4 5 4-5" fill="none" stroke="#b45309" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M27 25 v4 M37 25 v4" stroke="#b45309" stroke-width="1.2"/>
    <path d="M24 45 h16 M26 51 h12 M28 57 h8" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="22" y="43" width="20" height="4" rx="2" fill="#cbd5e1"/>
  `),

  // ─── Halogen (GU10 reflector) ──────────────────────────────────────────
  'bulb-halogen': S(`
    <defs>
      <linearGradient id="${T('bulbhalogen')}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fef08a"/><stop offset="1" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <!-- Reflector body (truncated cone) -->
    <path d="M16 8 L48 8 L56 34 L8 34 Z" fill="url(#${T('bulbhalogen')}body)" stroke="#ca8a04" stroke-width="1.5"/>
    <ellipse cx="32" cy="34" rx="24" ry="4" fill="#fef9c3" stroke="#ca8a04" stroke-width="1"/>
    <!-- Filament element -->
    <path d="M28 20 h8 M28 24 h8" stroke="#eab308" stroke-width="1.2"/>
    <rect x="24" y="38" width="16" height="4" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.8"/>
    <!-- GU10 pins -->
    <rect x="29" y="42" width="2.5" height="7" rx="1.2" fill="#94a3b8"/>
    <rect x="32.5" y="42" width="2.5" height="7" rx="1.2" fill="#94a3b8"/>
  `),

  // ─── CFL spiral ────────────────────────────────────────────────────────
  'bulb-cfl': S(`
    <defs>
      <linearGradient id="${T('bulbcfl')}tube" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>
    <!-- Spiral tube: four vertical runs connected by bends (zig-zag) -->
    <path
      d="M20 32 v-16 a4 4 0 0 1 8 0 v16 a4 4 0 0 1 8 0 v-16 a4 4 0 0 1 8 0 v16"
      fill="none" stroke="url(#${T('bulbcfl')}tube)" stroke-width="4" stroke-linecap="round"/>
    <!-- Inner glow line for depth -->
    <path
      d="M20 32 v-16 a4 4 0 0 1 8 0 v16 a4 4 0 0 1 8 0 v-16 a4 4 0 0 1 8 0 v16"
      fill="none" stroke="#f0f9ff" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <!-- Ballast base -->
    <rect x="18" y="34" width="28" height="10" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="22" y1="39" x2="42" y2="39" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Screw base -->
    <rect x="22" y="44" width="20" height="9" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
    <line x1="25" y1="46.5" x2="39" y2="46.5" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="25" y1="49" x2="39" y2="49" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="25" y1="51.5" x2="39" y2="51.5" stroke="#94a3b8" stroke-width="0.8"/>
  `),

  // ─── Smart RGB bulb ────────────────────────────────────────────────────
  'bulb-smart-rgb': S(`
    <defs>
      <radialGradient id="${T('bulbsmartrgb')}glass" cx="0.4" cy="0.35" r="1">
        <stop offset="0" stop-color="#e879f9"/><stop offset="0.5" stop-color="#a855f7"/><stop offset="1" stop-color="#6366f1"/>
      </radialGradient>
    </defs>
    <path d="M32 6 c-11 0-18 8-18 18 0 8 5 12 9 16 h18 c4-4 9-8 9-16 C50 14 43 6 32 6 Z" fill="url(#${T('bulbsmartrgb')}glass)" stroke="#a855f7" stroke-width="1.5"/>
    <!-- RGB chips row -->
    <rect x="25" y="22" width="4" height="7" rx="1" fill="#22d3ee"/>
    <rect x="30" y="22" width="4" height="7" rx="1" fill="#f43f5e"/>
    <rect x="35" y="22" width="4" height="7" rx="1" fill="#4ade80"/>
    <path d="M25 44 h14 M26 50 h12 M28 56 h8" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="23" y="42" width="18" height="4" rx="2" fill="#cbd5e1"/>
  `),

  // ─── LED downlight ─────────────────────────────────────────────────────
  'led-downlight': S(`
    <defs>
      <radialGradient id="${T('leddownlight')}lens" cx="0.5" cy="0.45" r="0.7">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#fef9c3"/><stop offset="1" stop-color="#fde047"/>
      </radialGradient>
      <linearGradient id="${T('leddownlight')}trim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>
    <!-- Recessed trim ring -->
    <circle cx="32" cy="32" r="24" fill="url(#${T('leddownlight')}trim)" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="32" cy="32" r="20" fill="#0f172a"/>
    <!-- Lens + LED -->
    <circle cx="32" cy="32" r="13" fill="url(#${T('leddownlight')}lens)"/>
    <circle cx="32" cy="32" r="5" fill="#ffffff" opacity="0.9"/>
    <!-- Heat sink fins hint -->
    <rect x="28" y="6" width="8" height="3" rx="1" fill="#94a3b8"/>
    <rect x="28" y="10" width="8" height="3" rx="1" fill="#94a3b8"/>
  `),

  // ─── Fluorescent tube ──────────────────────────────────────────────────
  'tube-light': S(`
    <defs>
      <linearGradient id="${T('tubelight')}glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#bae6fd"/>
      </linearGradient>
    </defs>
    <!-- Tube -->
    <rect x="6" y="24" width="52" height="16" rx="8" fill="url(#${T('tubelight')}glass)" stroke="#0ea5e9" stroke-width="1.5"/>
    <line x1="12" y1="32" x2="52" y2="32" stroke="#e0f2fe" stroke-width="7" stroke-linecap="round"/>
    <!-- End caps -->
    <rect x="6" y="26" width="5" height="12" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
    <rect x="53" y="26" width="5" height="12" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
    <!-- Pins -->
    <rect x="8" y="40" width="2" height="4" rx="1" fill="#64748b"/>
    <rect x="12" y="40" width="2" height="4" rx="1" fill="#64748b"/>
    <rect x="50" y="40" width="2" height="4" rx="1" fill="#64748b"/>
    <rect x="54" y="40" width="2" height="4" rx="1" fill="#64748b"/>
  `),
};

/** Resolve near-realistic art for a type, or undefined if not upgraded. */
export function getDefaultArt(type: string): string | undefined {
  return ART[type];
}
