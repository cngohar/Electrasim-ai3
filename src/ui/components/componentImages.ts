import imgLightBulb from '../../assets/images/component_light_bulb_1786248966297.jpg';
import imgLightSwitch from '../../assets/images/component_light_switch_1786249016724.jpg';
import imgMcbBreaker from '../../assets/images/component_mcb_breaker_1786248947812.jpg';
import imgRcdSwitch from '../../assets/images/component_rcd_switch_1786249000503.jpg';
import imgSocketOutlet from '../../assets/images/component_socket_outlet_1786248985392.jpg';
import imgWaterHeater from '../../assets/images/component_water_heater_1786249033522.jpg';
import imgContactor3p from '../../assets/images/contactor_3p_1786522064198.jpg';
import imgDistBoard3p from '../../assets/images/dist_board_3p_1786522082960.jpg';
import imgEvCharger from '../../assets/images/ev_charger_station_1786333648320.jpg';
import imgRelayModule from '../../assets/images/relay_module_1786522047102.jpg';
import imgSolarPanel from '../../assets/images/solar_panel_pv_1786333628876.jpg';
import imgTransformer24v from '../../assets/images/transformer_24v_1786522030718.jpg';
import imgVariantBulbHalogen from '../../assets/images/variant_bulb_halogen.png';
import imgVariantBulbIncandescent from '../../assets/images/variant_bulb_incandescent.png';
import imgVariantCeilingFan from '../../assets/images/variant_ceiling_fan.png';
import imgVariantExtractorFan from '../../assets/images/variant_extractor_fan.png';
import imgVariantIndustrialExhaustFan from '../../assets/images/variant_industrial_exhaust_fan.png';
import imgVariantLedDownlight from '../../assets/images/variant_led_downlight.png';
import imgVariantMotor from '../../assets/images/variant_motor.png';
import imgVariantTableFan from '../../assets/images/variant_table_fan.png';
import imgVariantTubeLight from '../../assets/images/variant_tube_light.png';

function svg(content: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(content.trim())}`;
}

// ─── UNIQUE VARIANT ILLUSTRATION GENERATORS ───

const svgIncandescent = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="400" height="250" fill="#0f172a"/>
  <circle cx="200" cy="110" r="75" fill="rgba(251, 146, 60, 0.15)" filter="blur(10px)"/>
  <circle cx="200" cy="110" r="50" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="4 2"/>
  <path d="M 175 110 Q 200 60 225 110" fill="none" stroke="#fdba74" stroke-width="3"/>
  <path d="M 185 110 L 195 80 M 215 110 L 205 80" stroke="#f97316" stroke-width="2"/>
  <path d="M 170 140 C 170 110 230 110 230 140 C 230 160 215 170 215 185 L 185 185 C 185 170 170 160 170 140 Z" fill="rgba(255,255,255,0.08)" stroke="#fdba74" stroke-width="2.5"/>
  <rect x="182" y="185" width="36" height="25" rx="3" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="182" y1="193" x2="218" y2="193" stroke="#475569" stroke-width="2"/>
  <line x1="182" y1="201" x2="218" y2="201" stroke="#475569" stroke-width="2"/>
  <path d="M 190 210 Q 200 218 210 210" fill="#334155"/>
  <text x="200" y="238" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f97316" text-anchor="middle">INCANDESCENT 60W TUNGSTEN</text>
</svg>`);

const svgHalogen = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <polygon points="200,60 130,160 270,160" fill="rgba(254, 240, 138, 0.12)" stroke="#eab308" stroke-width="2"/>
  <ellipse cx="200" cy="160" rx="70" ry="18" fill="none" stroke="#fde047" stroke-width="3"/>
  <rect x="185" y="80" width="30" height="45" rx="5" fill="#fef08a" opacity="0.85"/>
  <line x1="193" y1="160" x2="193" y2="195" stroke="#cbd5e1" stroke-width="4"/>
  <line x1="207" y1="160" x2="207" y2="195" stroke="#cbd5e1" stroke-width="4"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#eab308" text-anchor="middle">HALOGEN 50W SPOTLIGHT</text>
</svg>`);

const svgCfl = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <path d="M 175,150 C 175,80 190,60 200,60 C 210,60 225,80 225,150" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
  <path d="M 160,150 C 160,70 180,45 200,45 C 220,45 240,70 240,150" fill="none" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round"/>
  <rect x="170" y="150" width="60" height="30" rx="4" fill="#f8fafc"/>
  <rect x="180" y="180" width="40" height="25" rx="2" fill="#94a3b8"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">CFL SPIRAL 15W COOL WHITE</text>
</svg>`);

const svgSmartRgb = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <defs>
    <linearGradient id="rgbGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="#0f172a"/>
  <circle cx="200" cy="105" r="55" fill="url(#rgbGlow)" opacity="0.85"/>
  <path d="M 170 135 C 170 105 230 105 230 135 C 230 155 215 165 215 180 L 185 180 C 185 165 170 155 170 135 Z" fill="none" stroke="#a855f7" stroke-width="3"/>
  <rect x="182" y="180" width="36" height="25" rx="3" fill="#64748b"/>
  <path d="M 190 70 A 15 15 0 0 1 210 70 M 183 62 A 25 25 0 0 1 217 62" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ec4899" text-anchor="middle">SMART RGB Wi-Fi LED 10W</text>
</svg>`);

const svgMcbTypeC = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="120" y="25" width="160" height="190" rx="8" fill="#1e293b" stroke="#334155" stroke-width="3"/>
  <rect x="140" y="45" width="120" height="150" rx="4" fill="#f8fafc"/>
  <rect x="175" y="80" width="50" height="50" rx="6" fill="#16a34a"/>
  <text x="200" y="110" font-family="sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">ON</text>
  <text x="200" y="155" font-family="sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">C32</text>
  <text x="200" y="175" font-family="sans-serif" font-size="11" font-weight="bold" fill="#16a34a" text-anchor="middle">10kA MOTOR CURVE</text>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#22c55e" text-anchor="middle">MCB TYPE C 32A BREAKER</text>
</svg>`);

const svgMcbTypeD = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="120" y="25" width="160" height="190" rx="8" fill="#1e293b" stroke="#334155" stroke-width="3"/>
  <rect x="140" y="45" width="120" height="150" rx="4" fill="#f8fafc"/>
  <rect x="175" y="80" width="50" height="50" rx="6" fill="#d97706"/>
  <text x="200" y="110" font-family="sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">ON</text>
  <text x="200" y="155" font-family="sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">D63</text>
  <text x="200" y="175" font-family="sans-serif" font-size="11" font-weight="bold" fill="#d97706" text-anchor="middle">15kA HEAVY INDUCTIVE</text>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f59e0b" text-anchor="middle">MCB TYPE D 63A BREAKER</text>
</svg>`);

const svgMccb = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="100" y="20" width="200" height="195" rx="6" fill="#334155" stroke="#475569" stroke-width="3"/>
  <circle cx="200" cy="100" r="35" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>
  <line x1="200" y1="100" x2="200" y2="70" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
  <text x="200" y="165" font-family="sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle">250A 3-PHASE</text>
  <text x="200" y="185" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">35kA INDUSTRIAL MCCB</text>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">MOULDED CASE BREAKER (MCCB)</text>
</svg>`);

const svgRcbo = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="130" y="25" width="140" height="190" rx="8" fill="#1e293b" stroke="#334155" stroke-width="3"/>
  <rect x="145" y="45" width="110" height="150" rx="4" fill="#f8fafc"/>
  <rect x="160" y="65" width="35" height="40" rx="4" fill="#2563eb"/>
  <circle cx="220" cy="85" r="14" fill="#dc2626"/>
  <text x="220" y="90" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">T</text>
  <text x="200" y="140" font-family="sans-serif" font-size="15" font-weight="900" fill="#0f172a" text-anchor="middle">B16 30mA</text>
  <text x="200" y="165" font-family="sans-serif" font-size="10" font-weight="bold" fill="#2563eb" text-anchor="middle">COMBINED RCD + MCB</text>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#60a5fa" text-anchor="middle">RCBO COMBINED PROTECTION</text>
</svg>`);

const svgSpd = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="130" y="25" width="140" height="190" rx="8" fill="#1e293b" stroke="#334155" stroke-width="3"/>
  <rect x="145" y="45" width="110" height="150" rx="4" fill="#0284c7"/>
  <path d="M 205 60 L 185 110 L 200 110 L 195 150 L 215 100 L 200 100 Z" fill="#facc15"/>
  <rect x="175" y="160" width="50" height="18" rx="3" fill="#22c55e"/>
  <text x="200" y="173" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">OK</text>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">TYPE 2 SURGE ARRESTER (SPD)</text>
</svg>`);

const svgSocketUsb = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="80" y="30" width="240" height="170" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <rect x="110" y="70" width="35" height="12" fill="#0f172a"/>
  <rect x="255" y="70" width="35" height="12" fill="#0f172a"/>
  <rect x="180" y="120" width="40" height="12" rx="3" fill="#0284c7"/>
  <rect x="182" y="142" width="36" height="8" rx="4" fill="#0f172a"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">13A SOCKET + DUAL USB-A/C</text>
</svg>`);

const svgSocketGfci = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="110" y="25" width="180" height="180" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <rect x="135" y="105" width="55" height="22" rx="4" fill="#dc2626"/>
  <text x="162" y="120" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">TEST</text>
  <rect x="210" y="105" width="55" height="22" rx="4" fill="#16a34a"/>
  <text x="237" y="120" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">RESET</text>
  <circle cx="200" cy="148" r="5" fill="#22c55e"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#4ade80" text-anchor="middle">GFCI SAFETY OUTLET 20A</text>
</svg>`);

const svgCookerUnit = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="100" y="25" width="200" height="180" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <rect x="130" y="55" width="50" height="70" rx="6" fill="#dc2626"/>
  <circle cx="230" cy="65" r="8" fill="#ef4444"/>
  <text x="200" y="170" font-family="sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">45A COOKER SWITCH</text>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f87171" text-anchor="middle">45A COOKER CONTROL UNIT</text>
</svg>`);

const svgDimmer = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <rect x="110" y="25" width="180" height="180" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <circle cx="200" cy="115" r="45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/>
  <circle cx="200" cy="115" r="35" fill="#ffffff" stroke="#64748b" stroke-width="2"/>
  <line x1="200" y1="115" x2="225" y2="90" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">ROTARY TRAILING-EDGE DIMMER</text>
</svg>`);

const svgPirSensor = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#0f172a"/>
  <circle cx="200" cy="115" r="70" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <path d="M 150 115 A 50 50 0 0 1 250 115 Z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="200" cy="115" r="8" fill="#ef4444"/>
  <text x="200" y="235" font-family="sans-serif" font-size="13" font-weight="bold" fill="#a855f7" text-anchor="middle">360° PIR MOTION SENSOR</text>
</svg>`);

/** Photorealistic component images registry */
export const COMPONENT_IMAGES: Record<string, string> = {
  // ─── LIGHTING VARIANTS ───
  bulb: imgLightBulb,
  'bulb-incandescent': imgVariantBulbIncandescent,
  'bulb-halogen': imgVariantBulbHalogen,
  'bulb-cfl': svgCfl,
  'bulb-smart-rgb': svgSmartRgb,
  'led-downlight': imgVariantLedDownlight,
  'tube-light': imgVariantTubeLight,

  // ─── PROTECTION & BREAKERS ───
  mcb: imgMcbBreaker,
  'mcb-type-c': svgMcbTypeC,
  'mcb-type-d': svgMcbTypeD,
  mccb: svgMccb,
  rcd: imgRcdSwitch,
  rcbo: svgRcbo,
  fuse: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&auto=format&fit=crop&q=80',
  spd: svgSpd,
  'distribution-board':
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',

  // ─── SWITCHES & CONTROLS ───
  'single-way-switch': imgLightSwitch,
  'two-way-switch':
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80',
  'intermediate-switch':
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80',
  'double-pole-switch':
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&auto=format&fit=crop&q=80',
  'cooker-unit': svgCookerUnit,
  'push-button':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
  'rotary-selector-switch':
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',
  contactor:
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
  'fused-spur':
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80',

  // ─── SOCKETS & OUTLETS ───
  'socket-2pin':
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=400&auto=format&fit=crop&q=80',
  'socket-3pin': imgSocketOutlet,
  'double-socket':
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80',
  'socket-usb': svgSocketUsb,
  'socket-gfci': svgSocketGfci,
  'socket-industrial':
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',

  // ─── FANS ───
  'ceiling-fan': imgVariantCeilingFan,
  'extractor-fan': imgVariantExtractorFan,
  'industrial-exhaust-fan': imgVariantIndustrialExhaustFan,
  'table-fan': imgVariantTableFan,

  // ─── CONTROL & AUTOMATION ───
  'dimmer-switch': svgDimmer,
  'fan-dimmer':
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',
  'pir-sensor': svgPirSensor,
  thermostat:
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80',
  'photocell-sensor':
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
  'smart-relay':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',

  // ─── POWER SUPPLIES & TERMINALS ───
  'live-terminal':
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&auto=format&fit=crop&q=80',
  'neutral-terminal':
    'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&auto=format&fit=crop&q=80',
  'earth-terminal':
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&auto=format&fit=crop&q=80',
  'ac-mains-supply':
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
  'dc-battery-12v':
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&auto=format&fit=crop&q=80',
  'solar-pv-panel': imgSolarPanel,
  'diesel-generator':
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',

  // ─── APPLIANCES & LOADS ───
  bell: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&auto=format&fit=crop&q=80',
  'water-heater': imgWaterHeater,
  'space-heater':
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80',
  'air-conditioner':
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
  'induction-hob':
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
  'ev-charger': imgEvCharger,
  motor: imgVariantMotor,

  // ─── NEW GENERATED VARIANTS ───
  'transformer-8v': imgTransformer24v,
  'transformer-12v': imgTransformer24v,
  'transformer-24v': imgTransformer24v,
  'step-up-down-transformer': imgTransformer24v,

  'relay-spst': imgRelayModule,
  'relay-spdt': imgRelayModule,
  'relay-dpdt': imgRelayModule,
  'control-relay': imgRelayModule,

  'contactor-1p': imgContactor3p,
  'contactor-2p': imgContactor3p,
  'contactor-3p': imgContactor3p,
  'contactor-4p': imgContactor3p,

  'distribution-box': imgDistBoard3p,
  'distribution-board-3phase': imgDistBoard3p,

  // ─── JUNCTION & TIMERS ───
  'junction-box':
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&auto=format&fit=crop&q=80',
  'terminal-strip':
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
  'wago-connector':
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&auto=format&fit=crop&q=80',
  'timer-switch':
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80',
  'digital-weekly-timer':
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80',
  'staircase-timer':
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
};

const VARIANT_ACCENTS: Record<string, string> = {
  lighting: '#f59e0b',
  protection: '#38bdf8',
  socket: '#22c55e',
  switch: '#a78bfa',
  fan: '#06b6d4',
  load: '#f97316',
  supply: '#ef4444',
  junction: '#64748b',
};

function generatedVariantImage(type: string, category?: string): string {
  const title = type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 28);
  const accent = VARIANT_ACCENTS[category ?? ''] ?? '#94a3b8';
  const hash = [...type].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const x = 120 + (hash % 80);
  const shape =
    category === 'fan'
      ? `<circle cx="200" cy="104" r="54" fill="none" stroke="${accent}" stroke-width="10"/><path d="M200 104 C150 80 142 42 176 58 C202 70 214 92 200 104 M200 104 C250 80 258 42 224 58 C198 70 186 92 200 104 M200 104 C232 144 218 177 196 148 C180 126 184 108 200 104" fill="${accent}" opacity=".8"/>`
      : category === 'lighting'
        ? `<path d="M${x} 118 C${x - 30} 84 ${x - 22} 48 ${x} 38 C${x + 22} 48 ${x + 30} 84 ${x} 118Z" fill="${accent}" opacity=".85"/><rect x="${x - 18}" y="118" width="36" height="42" rx="4" fill="#cbd5e1"/><path d="M${x - 18} 130h36M${x - 18} 142h36" stroke="#64748b" stroke-width="3"/>`
        : `<rect x="${x - 58}" y="38" width="116" height="132" rx="12" fill="#f8fafc" stroke="${accent}" stroke-width="5"/><rect x="${x - 32}" y="68" width="64" height="48" rx="8" fill="${accent}" opacity=".85"/><circle cx="${x}" cy="140" r="10" fill="${accent}"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><rect width="400" height="250" fill="#0f172a"/>${shape}<text x="200" y="220" font-family="sans-serif" font-size="13" font-weight="700" fill="${accent}" text-anchor="middle">${title.toUpperCase()}</text></svg>`,
  );
}

/** Resolve an image for every variant without collapsing remote entries into category fallbacks. */
export function getComponentImage(type: string, category?: string): string {
  const registeredImage = COMPONENT_IMAGES[type];
  if (registeredImage && !registeredImage.startsWith('https://images.unsplash.com')) {
    return registeredImage;
  }
  if (registeredImage?.startsWith('https://images.unsplash.com')) {
    return generatedVariantImage(type, category);
  }
  if (category === 'lighting') return imgLightBulb;
  if (category === 'protection') return imgMcbBreaker;
  if (category === 'socket') return imgSocketOutlet;
  if (category === 'switch') return imgLightSwitch;
  if (category === 'load') return imgWaterHeater;
  if (type.includes('solar')) return imgSolarPanel;
  if (type.includes('ev')) return imgEvCharger;
  return generatedVariantImage(type, category);
}

function canvasIconSvg(type: string): string {
  const customShapes: Record<string, string> = {
    // ─── LIGHTING VARIANTS ───
    bulb: `<path d="M32 8c-11 0-18 8-18 18 0 8 5 12 9 16h18c4-4 9-8 9-16C50 16 43 8 32 8Z" fill="#facc15" stroke="#eab308" stroke-width="2"/><circle cx="32" cy="27" r="7" fill="#fff7ed"/><path d="M25 44h14M27 51h10M29 57h6" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>`,
    'bulb-incandescent': `<path d="M32 8c-11 0-18 8-18 18 0 8 5 12 9 16h18c4-4 9-8 9-16C50 16 43 8 32 8Z" fill="#fb923c" stroke="#ea580c" stroke-width="2"/><path d="M25 24 Q 28 14 32 20 Q 36 26 39 16" fill="none" stroke="#fff7ed" stroke-width="2.5"/><path d="M25 44h14M26 51h12M28 57h8" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>`,
    'bulb-halogen': `<polygon points="32,8 14,38 50,38" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><ellipse cx="32" cy="38" rx="18" ry="5" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"/><rect x="28" y="16" width="8" height="12" rx="2" fill="#eab308"/><line x1="28" y1="38" x2="28" y2="54" stroke="#94a3b8" stroke-width="3"/><line x1="36" y1="38" x2="36" y2="54" stroke="#94a3b8" stroke-width="3"/>`,
    'bulb-cfl': `<path d="M22 14 C22 8 28 8 28 14 L28 38 M28 14 C28 8 36 8 36 14 L36 38 M36 14 C36 8 42 8 42 14 L42 38" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/><rect x="20" y="38" width="24" height="8" rx="2" fill="#f1f5f9"/><path d="M24 46h16M26 52h12M28 58h8" stroke="#cbd5e1" stroke-width="3.5" stroke-linecap="round"/>`,
    'bulb-smart-rgb': `<defs><linearGradient id="rgbGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ec4899"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><path d="M32 8c-11 0-18 8-18 18 0 8 5 12 9 16h18c4-4 9-8 9-16C50 16 43 8 32 8Z" fill="url(#rgbGlow)" stroke="#c084fc" stroke-width="2"/><path d="M28 22a6 6 0 0 1 8 0 M26 18a9 9 0 0 1 12 0" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M25 44h14M27 51h10M29 57h6" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>`,
    'led-downlight': `<circle cx="32" cy="32" r="22" fill="#f8fafc" stroke="#94a3b8" stroke-width="3"/><circle cx="32" cy="32" r="14" fill="#fef08a" stroke="#eab308" stroke-width="2"/><circle cx="32" cy="32" r="7" fill="#ffffff"/><path d="M12 18h-4 M52 18h4" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>`,
    'tube-light': `<rect x="6" y="24" width="52" height="16" rx="8" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2"/><line x1="12" y1="32" x2="52" y2="32" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round"/><rect x="6" y="27" width="4" height="10" rx="1" fill="#94a3b8"/><rect x="54" y="27" width="4" height="10" rx="1" fill="#94a3b8"/>`,

    // ─── SOCKET VARIANTS ───
    'socket-2pin': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#3b82f6" stroke-width="3"/><circle cx="24" cy="32" r="4.5" fill="#0f172a"/><circle cx="40" cy="32" r="4.5" fill="#0f172a"/>`,
    'socket-3pin': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#3b82f6" stroke-width="3"/><rect x="30" y="18" width="4" height="9" rx="1.5" fill="#0f172a"/><rect x="20" y="34" width="8" height="4" rx="1" fill="#0f172a"/><rect x="36" y="34" width="8" height="4" rx="1" fill="#0f172a"/>`,
    'double-socket': `<rect x="6" y="14" width="52" height="36" rx="6" fill="#f8fafc" stroke="#3b82f6" stroke-width="3"/><rect x="18" y="20" width="3" height="6" fill="#0f172a"/><rect x="12" y="30" width="5" height="3" fill="#0f172a"/><rect x="21" y="30" width="5" height="3" fill="#0f172a"/><rect x="43" y="20" width="3" height="6" fill="#0f172a"/><rect x="37" y="30" width="5" height="3" fill="#0f172a"/><rect x="46" y="30" width="5" height="3" fill="#0f172a"/>`,
    'socket-usb': `<rect x="8" y="12" width="48" height="40" rx="6" fill="#f8fafc" stroke="#06b6d4" stroke-width="3"/><rect x="18" y="18" width="3" height="6" fill="#0f172a"/><rect x="12" y="27" width="5" height="3" fill="#0f172a"/><rect x="21" y="27" width="5" height="3" fill="#0f172a"/><rect x="43" y="18" width="3" height="6" fill="#0f172a"/><rect x="37" y="27" width="5" height="3" fill="#0f172a"/><rect x="46" y="27" width="5" height="3" fill="#0f172a"/><rect x="28" y="36" width="8" height="4" rx="1" fill="#0284c7"/><rect x="29" y="43" width="6" height="2.5" rx="1.2" fill="#0f172a"/>`,
    'socket-gfci': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#10b981" stroke-width="3"/><rect x="30" y="16" width="4" height="6" fill="#0f172a"/><rect x="21" y="25" width="6" height="3" fill="#0f172a"/><rect x="37" y="25" width="6" height="3" fill="#0f172a"/><rect x="24" y="32" width="6" height="4" rx="1" fill="#ef4444"/><rect x="34" y="32" width="6" height="4" rx="1" fill="#0f172a"/><rect x="30" y="40" width="4" height="6" fill="#0f172a"/>`,
    'socket-industrial': `<circle cx="32" cy="32" r="22" fill="#1e3a8a" stroke="#3b82f6" stroke-width="3"/><circle cx="32" cy="32" r="15" fill="#f8fafc"/><circle cx="32" cy="23" r="3.5" fill="#0f172a"/><circle cx="23" cy="37" r="3.5" fill="#0f172a"/><circle cx="41" cy="37" r="3.5" fill="#0f172a"/>`,
    'switched-socket': `<rect x="10" y="10" width="44" height="44" rx="6" fill="#f8fafc" stroke="#3b82f6" stroke-width="3"/><rect x="16" y="14" width="10" height="7" rx="1" fill="#ef4444"/><rect x="30" y="24" width="4" height="7" fill="#0f172a"/><rect x="20" y="35" width="7" height="3" fill="#0f172a"/><rect x="37" y="35" width="7" height="3" fill="#0f172a"/>`,

    // ─── FAN VARIANTS ───
    'ceiling-fan': `<circle cx="32" cy="32" r="8" fill="#0284c7"/><path d="M32 24 C28 6 12 10 24 28 M39 36 C56 42 52 58 34 40 M24 36 C8 48 4 32 24 32" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>`,
    'extractor-fan': `<rect x="10" y="10" width="44" height="44" rx="6" fill="#f8fafc" stroke="#0ea5e9" stroke-width="3"/><circle cx="32" cy="32" r="16" fill="#e0f2fe"/><path d="M32 20 L32 44 M20 32 L44 32 M24 24 L40 40 M24 40 L40 24" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="5" fill="#0369a1"/>`,
    'industrial-exhaust-fan': `<rect x="8" y="8" width="48" height="48" rx="4" fill="#334155" stroke="#0284c7" stroke-width="3"/><circle cx="32" cy="32" r="18" fill="#1e293b" stroke="#0ea5e9" stroke-width="2"/><path d="M32 16 C25 24 39 24 32 32 C25 39 25 25 32 32 M48 32 C40 25 40 39 32 32 M16 32 C24 39 24 25 32 32" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.5"/><circle cx="32" cy="32" r="6" fill="#ef4444"/>`,
    'table-fan': `<circle cx="32" cy="24" r="16" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/><path d="M32 12v24M20 24h24" stroke="#7dd3fc" stroke-width="1.5"/><circle cx="32" cy="24" r="5" fill="#0284c7"/><path d="M32 40 L32 50 M22 56 L42 56" stroke="#475569" stroke-width="4" stroke-linecap="round"/>`,

    // ─── SWITCHES & CONTROLS ───
    'single-way-switch': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#8b5cf6" stroke-width="3"/><rect x="22" y="18" width="20" height="28" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><line x1="22" y1="32" x2="42" y2="32" stroke="#cbd5e1" stroke-width="2"/><circle cx="32" cy="24" r="2.5" fill="#a855f7"/>`,
    'two-way-switch': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#8b5cf6" stroke-width="3"/><path d="M22 24 L32 14 L42 24 M42 40 L32 50 L22 40" fill="none" stroke="#7c3aed" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    'intermediate-switch': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#8b5cf6" stroke-width="3"/><path d="M20 20 L44 44 M20 44 L44 20" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="5" fill="#a855f7"/>`,
    'double-pole-switch': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#ef4444" stroke-width="3"/><rect x="20" y="16" width="24" height="24" rx="4" fill="#dc2626"/><circle cx="32" cy="46" r="3.5" fill="#f87171"/><text x="32" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">20A</text>`,
    'push-button': `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="3"/><circle cx="32" cy="32" r="14" fill="#0284c7" stroke="#0369a1" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#38bdf8"/>`,
    'rotary-selector-switch': `<circle cx="32" cy="32" r="22" fill="#1e293b" stroke="#64748b" stroke-width="3"/><circle cx="32" cy="32" r="14" fill="#334155"/><rect x="30" y="14" width="4" height="14" rx="2" fill="#f8fafc"/><circle cx="32" cy="10" r="2" fill="#22c55e"/><circle cx="16" cy="22" r="2" fill="#94a3b8"/><circle cx="48" cy="22" r="2" fill="#38bdf8"/>`,
    'dimmer-switch': `<circle cx="32" cy="32" r="22" fill="#f8fafc" stroke="#f59e0b" stroke-width="3"/><circle cx="32" cy="32" r="13" fill="#fbbf24" stroke="#d97706" stroke-width="2"/><path d="M18 38 A 16 16 0 1 1 46 38" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="2 3"/><rect x="30" y="20" width="4" height="9" rx="2" fill="#0f172a"/>`,
    'fan-dimmer': `<circle cx="32" cy="32" r="22" fill="#f8fafc" stroke="#06b6d4" stroke-width="3"/><circle cx="32" cy="32" r="13" fill="#0ea5e9" stroke="#0284c7" stroke-width="2"/><rect x="30" y="20" width="4" height="9" rx="2" fill="#ffffff"/><text x="32" y="42" text-anchor="middle" font-size="8" font-weight="900" fill="#0369a1">1-5</text>`,
    'cooker-unit': `<rect x="10" y="10" width="44" height="44" rx="6" fill="#f8fafc" stroke="#dc2626" stroke-width="3"/><rect x="16" y="16" width="14" height="20" rx="2" fill="#dc2626"/><circle cx="23" cy="42" r="2.5" fill="#ef4444"/><rect x="34" y="22" width="2.5" height="5" fill="#0f172a"/><rect x="39" y="22" width="2.5" height="5" fill="#0f172a"/>`,

    // ─── PROTECTION & BREAKERS ───
    mcb: `<rect x="18" y="8" width="28" height="48" rx="4" fill="#f8fafc" stroke="#64748b" stroke-width="3"/><rect x="24" y="14" width="16" height="20" rx="3" fill="#38bdf8"/><path d="M32 18v12M27 25h10" stroke="#0f172a" stroke-width="2"/><text x="32" y="48" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f172a">B</text>`,
    'mcb-type-c': `<rect x="18" y="8" width="28" height="48" rx="4" fill="#f8fafc" stroke="#64748b" stroke-width="3"/><rect x="24" y="14" width="16" height="20" rx="3" fill="#22c55e"/><path d="M32 18v12M27 25h10" stroke="#0f172a" stroke-width="2"/><text x="32" y="48" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f172a">C</text>`,
    'mcb-type-d': `<rect x="18" y="8" width="28" height="48" rx="4" fill="#f8fafc" stroke="#64748b" stroke-width="3"/><rect x="24" y="14" width="16" height="20" rx="3" fill="#f97316"/><path d="M32 18v12M27 25h10" stroke="#0f172a" stroke-width="2"/><text x="32" y="48" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f172a">D</text>`,
    mccb: `<rect x="12" y="8" width="40" height="48" rx="4" fill="#1e293b" stroke="#475569" stroke-width="3"/><rect x="20" y="14" width="24" height="22" rx="3" fill="#334155"/><rect x="29" y="18" width="6" height="14" rx="2" fill="#ef4444"/><text x="32" y="48" text-anchor="middle" font-size="9" font-weight="bold" fill="#38bdf8">MCCB</text>`,
    rcd: `<rect x="14" y="8" width="36" height="48" rx="4" fill="#f8fafc" stroke="#38bdf8" stroke-width="3"/><rect x="20" y="14" width="12" height="18" rx="2" fill="#38bdf8"/><rect x="36" y="14" width="10" height="10" rx="2" fill="#eab308"/><text x="41" y="22" text-anchor="middle" font-size="8" font-weight="bold" fill="#0f172a">T</text><text x="32" y="48" text-anchor="middle" font-size="9" font-weight="bold" fill="#0f172a">RCD</text>`,
    rcbo: `<rect x="14" y="8" width="36" height="48" rx="4" fill="#f8fafc" stroke="#10b981" stroke-width="3"/><rect x="20" y="14" width="12" height="18" rx="2" fill="#22c55e"/><rect x="36" y="14" width="10" height="10" rx="2" fill="#eab308"/><text x="41" y="22" text-anchor="middle" font-size="8" font-weight="bold" fill="#0f172a">T</text><text x="32" y="48" text-anchor="middle" font-size="8" font-weight="bold" fill="#0f172a">RCBO</text>`,
    fuse: `<rect x="14" y="22" width="36" height="20" rx="3" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><line x1="8" y1="32" x2="56" y2="32" stroke="#f59e0b" stroke-width="3"/><rect x="14" y="22" width="6" height="20" fill="#64748b"/><rect x="44" y="22" width="6" height="20" fill="#64748b"/>`,
    spd: `<rect x="18" y="8" width="28" height="48" rx="4" fill="#f8fafc" stroke="#eab308" stroke-width="3"/><polygon points="34,14 24,30 31,30 28,44 38,26 31,26" fill="#eab308"/><text x="32" y="52" text-anchor="middle" font-size="8" font-weight="bold" fill="#0f172a">SPD</text>`,
    'isolator-switch': `<rect x="12" y="8" width="40" height="48" rx="6" fill="#eab308" stroke="#ca8a04" stroke-width="3"/><circle cx="32" cy="30" r="12" fill="#dc2626"/><rect x="30" y="20" width="4" height="20" rx="2" fill="#fef08a"/>`,
    'distribution-board': `<rect x="8" y="10" width="48" height="44" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="3"/><rect x="14" y="16" width="36" height="12" rx="2" fill="#334155"/><line x1="18" y1="22" x2="18" y2="28" stroke="#38bdf8" stroke-width="2"/><line x1="26" y1="22" x2="26" y2="28" stroke="#38bdf8" stroke-width="2"/><line x1="34" y1="22" x2="34" y2="28" stroke="#38bdf8" stroke-width="2"/><line x1="42" y1="22" x2="42" y2="28" stroke="#38bdf8" stroke-width="2"/>`,
    'distribution-board-3phase': `<rect x="8" y="10" width="48" height="44" rx="4" fill="#0f172a" stroke="#ef4444" stroke-width="3"/><rect x="14" y="16" width="36" height="14" rx="2" fill="#1e293b"/><line x1="18" y1="18" x2="18" y2="28" stroke="#ef4444" stroke-width="2.5"/><line x1="26" y1="18" x2="26" y2="28" stroke="#eab308" stroke-width="2.5"/><line x1="34" y1="18" x2="34" y2="28" stroke="#3b82f6" stroke-width="2.5"/><line x1="42" y1="18" x2="42" y2="28" stroke="#22c55e" stroke-width="2.5"/>`,

    // ─── TRANSFORMERS & RELAYS ───
    'transformer-8v': `<circle cx="24" cy="32" r="12" fill="none" stroke="#6366f1" stroke-width="3"/><circle cx="40" cy="32" r="12" fill="none" stroke="#a855f7" stroke-width="3"/><text x="32" y="52" text-anchor="middle" font-size="8" font-weight="bold" fill="#6366f1">8V</text>`,
    'transformer-12v': `<circle cx="24" cy="32" r="12" fill="none" stroke="#6366f1" stroke-width="3"/><circle cx="40" cy="32" r="12" fill="none" stroke="#a855f7" stroke-width="3"/><text x="32" y="52" text-anchor="middle" font-size="8" font-weight="bold" fill="#6366f1">12V</text>`,
    'transformer-24v': `<circle cx="24" cy="32" r="12" fill="none" stroke="#6366f1" stroke-width="3"/><circle cx="40" cy="32" r="12" fill="none" stroke="#a855f7" stroke-width="3"/><text x="32" y="52" text-anchor="middle" font-size="8" font-weight="bold" fill="#6366f1">24V</text>`,
    'step-up-down-transformer': `<circle cx="22" cy="30" r="11" fill="none" stroke="#3b82f6" stroke-width="3"/><circle cx="42" cy="30" r="11" fill="none" stroke="#ef4444" stroke-width="3"/><line x1="32" y1="14" x2="32" y2="46" stroke="#94a3b8" stroke-width="2" stroke-dasharray="2 2"/>`,
    'relay-spst': `<rect x="12" y="12" width="40" height="40" rx="4" fill="#f8fafc" stroke="#6366f1" stroke-width="3"/><rect x="18" y="24" width="10" height="16" fill="#6366f1"/><path d="M34 22 L42 22 M34 38 L42 32" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>`,
    'relay-spdt': `<rect x="12" y="12" width="40" height="40" rx="4" fill="#f8fafc" stroke="#8b5cf6" stroke-width="3"/><path d="M20 32 L32 32 M32 32 L42 22 M42 42 h-6" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>`,
    'relay-dpdt': `<rect x="12" y="12" width="40" height="40" rx="4" fill="#f8fafc" stroke="#8b5cf6" stroke-width="3"/><path d="M18 24 L28 24 M28 24 L36 18 M18 40 L28 40 M28 40 L36 34" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/>`,
    'contactor-1p': `<rect x="14" y="10" width="36" height="44" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/><path d="M32 16v10M32 38v10M28 26h8" stroke="#38bdf8" stroke-width="3"/><text x="32" y="44" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff">1P</text>`,
    'contactor-2p': `<rect x="12" y="10" width="40" height="44" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/><path d="M24 16v12M40 16v12" stroke="#38bdf8" stroke-width="2.5"/><text x="32" y="44" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff">2P</text>`,
    'contactor-3p': `<rect x="10" y="10" width="44" height="44" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/><path d="M18 16v12M32 16v12M46 16v12" stroke="#38bdf8" stroke-width="2"/><text x="32" y="44" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff">3P</text>`,
    'contactor-4p': `<rect x="8" y="10" width="48" height="44" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/><path d="M16 16v10M26 16v10M36 16v10M46 16v10" stroke="#38bdf8" stroke-width="2"/><text x="32" y="44" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff">4P</text>`,
  };

  const hash = [...type].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rotation = (hash % 18) - 9;
  const uniqueAccent = ['#38bdf8', '#22c55e', '#a78bfa', '#f97316', '#ef4444'][hash % 5];
  const shape =
    customShapes[type] ??
    (type.includes('fan')
      ? `<circle cx="32" cy="32" r="7" fill="${uniqueAccent}"/><g transform="rotate(${rotation} 32 32)"><path d="M32 25C13 17 9 28 25 32M39 32C47 13 36 9 32 25M32 39C51 47 55 36 39 32" fill="none" stroke="${uniqueAccent}" stroke-width="5" stroke-linecap="round"/></g>`
      : type === 'motor'
        ? `<circle cx="32" cy="32" r="21" fill="#cbd5e1" stroke="${uniqueAccent}" stroke-width="4"/><path d="M18 22h28M18 32h28M18 42h28" stroke="#64748b" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="${uniqueAccent}"/>`
        : type.includes('socket')
          ? `<rect x="12" y="10" width="40" height="44" rx="8" fill="#f8fafc" stroke="${uniqueAccent}" stroke-width="4"/><circle cx="25" cy="28" r="4" fill="${uniqueAccent}"/><circle cx="39" cy="28" r="4" fill="${uniqueAccent}"/><path d="M32 38v7" stroke="${uniqueAccent}" stroke-width="4" stroke-linecap="round"/>`
          : type.includes('terminal') || type.includes('connector') || type.includes('junction')
            ? `<rect x="10" y="18" width="44" height="28" rx="5" fill="#f8fafc" stroke="${uniqueAccent}" stroke-width="4"/><path d="M18 18v28M28 18v28M38 18v28M48 18v28" stroke="#94a3b8" stroke-width="2"/><circle cx="23" cy="32" r="3" fill="${uniqueAccent}"/>`
            : `<rect x="13" y="12" width="38" height="40" rx="${5 + (hash % 6)}" fill="#e2e8f0" stroke="${uniqueAccent}" stroke-width="4" transform="rotate(${rotation} 32 32)"/><circle cx="32" cy="32" r="${7 + (hash % 5)}" fill="${uniqueAccent}"/>`);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${shape}</svg>`)}`;
}

const VARIANT_ICON_TYPES = new Set([
  'bulb',
  'bulb-incandescent',
  'bulb-halogen',
  'bulb-cfl',
  'bulb-smart-rgb',
  'led-downlight',
  'tube-light',
  'mcb',
  'mcb-type-c',
  'mcb-type-d',
  'mccb',
  'rcd',
  'rcbo',
  'fuse',
  'spd',
  'distribution-board',
  'fused-spur',
  'single-way-switch',
  'two-way-switch',
  'intermediate-switch',
  'double-pole-switch',
  'cooker-unit',
  'push-button',
  'rotary-selector-switch',
  'contactor',
  'socket-2pin',
  'socket-3pin',
  'double-socket',
  'socket-usb',
  'socket-gfci',
  'socket-industrial',
  'ceiling-fan',
  'extractor-fan',
  'industrial-exhaust-fan',
  'table-fan',
  'dimmer-switch',
  'fan-dimmer',
  'pir-sensor',
  'thermostat',
  'photocell-sensor',
  'smart-relay',
  'ac-mains-supply',
  'dc-battery-12v',
  'solar-pv-panel',
  'diesel-generator',
  'motor',
  'bell',
  'water-heater',
  'space-heater',
  'air-conditioner',
  'induction-hob',
  'ev-charger',
  'junction-box',
  'terminal-strip',
  'wago-connector',
  'timer-switch',
  'digital-weekly-timer',
  'staircase-timer',
  'countdown-timer',
  'delay-timer',
  'double-gang-switch',
  'switched-socket',
  'isolator-switch',
  'transformer-8v',
  'transformer-12v',
  'transformer-24v',
  'step-up-down-transformer',
  'relay-spst',
  'relay-spdt',
  'relay-dpdt',
  'control-relay',
  'contactor-1p',
  'contactor-2p',
  'contactor-3p',
  'contactor-4p',
  'room-thermostat',
  'heating-thermostat',
  'temperature-sensor',
  'door-sensor',
  'electric-buzzer',
  'wireless-doorbell',
  'alarm-siren',
  'motor-3phase',
  'water-pump',
  'heating-element',
  'distribution-box',
  'distribution-board-3phase',
]);

export function getComponentIcon(type: string, fallback: string): string {
  return VARIANT_ICON_TYPES.has(type) ? canvasIconSvg(type) : fallback;
}
