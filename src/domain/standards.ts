/**
 * standards.ts — international electrical standard presets & compliance helpers.
 *
 * Centralises the regulatory differences between the three templates the
 * "Dual Standard" feature exposes in the UI:
 *
 *   - `uk` — BS 7671 (IET Wiring Regulations, 18th Edition Amendment 3/4):
 *            230 V / 50 Hz, brown/blue/green-yellow conductors, Type B/C/D
 *            MCBs, 30 mA RCD on sockets, 3 % (lighting) / 5 % (power) drop.
 *   - `us` — NFPA 70 (National Electrical Code, NEC):
 *            120 V / 60 Hz, black/white/green conductors, 15/20 A branch
 *            circuits, GFCI on wet/outdoor receptacles, 3 % / 5 % drop.
 *   - `eu` — IEC 60364:
 *            230 V / 50 Hz, brown/blue/green-yellow (harmonised HD 308 S2),
 *            C-curve breakers on motor circuits, same drop limits as UK.
 *
 * Keep this module pure & dependency-free so the simulator worker and the
 * validation engine can both import it without dragging React in.
 */

import type { PortType } from './types';

// ─── Types ────────────────────────────────────────────────────────────────

export type StandardId = 'uk' | 'us' | 'eu' | 'au' | 'in' | 'za';

/** Regional plug / socket system (drives which socket palette tiles show). */
export type PlugSystem = 'bs1363' | 'nema5' | 'schuko' | 'as3112' | 'bs546' | 'schuko-sa';

/** Maximum permissible voltage drop at the furthest point of a final circuit. */
export interface VoltageDropLimits {
  /** Lighting final circuits (BS 7671 Appendix 4 / NEC 210.19(A) FPN 4). */
  lightingPercent: number;
  /** Power / socket-outlet final circuits. */
  powerPercent: number;
}

/** One quick-switchable regulatory preset. */
export interface StandardPreset {
  id: StandardId;
  label: string;
  shortLabel: string;
  /** Short citation shown under the selector, e.g. "BS 7671 18th Ed. Amd 3/4". */
  citation: string;
  /** Flag emoji used as a light-weight visual cue. */
  flag: string;
  /** Nominal supply voltage (Volts). */
  nominalVoltage: number;
  /** Supply frequency (Hertz); 0 for DC systems. */
  frequencyHz: number;
  /** Terminal/conductor colour convention for canvas rendering. */
  wireColors: Record<PortType, string>;
  /** Dark-mode conductor colours. */
  wireColorsDark: Record<PortType, string>;
  /** Regulatory voltage-drop ceilings (%). */
  voltageDrop: VoltageDropLimits;
  /** Default MCB trip curve for generic circuits. */
  defaultMcbCurve: 'B' | 'C' | 'D';
  /** Required MCB curve for motor / high-inrush inductive loads. */
  motorMcbCurve: 'B' | 'C' | 'D';
  /** Residual-current device threshold in milliamps for socket circuits. */
  rcdThresholdMa: number;
  /** Whether RCD/GFCI protection is mandatory on socket outlets. */
  rcdRequiredOnSockets: boolean;
  /** Nominal domestic socket branch rating (Amps). */
  socketCircuitAmps: number;
  /** Nominal lighting circuit rating (Amps). */
  lightingCircuitAmps: number;
  /** Human-readable wire-colour legend for tooltips/help text. */
  conductorLegend: { live: string; neutral: string; earth: string };
  /** Regional plug / socket system used for this region. */
  plugSystem: PlugSystem;
  /** Sockets relevant to this region (component type ids shown in palette). */
  regionalSockets: string[];
}

// ─── Presets ──────────────────────────────────────────────────────────────

export const STANDARDS: Record<StandardId, StandardPreset> = {
  uk: {
    id: 'uk',
    label: 'United Kingdom',
    shortLabel: 'UK',
    citation: 'BS 7671 18th Ed. (Amd 3/4)',
    flag: '🇬🇧',
    nominalVoltage: 230,
    frequencyHz: 50,
    wireColors: { live: '#b45309', neutral: '#2563eb', earth: '#16a34a' },
    wireColorsDark: { live: '#f87171', neutral: '#60a5fa', earth: '#34d399' },
    voltageDrop: { lightingPercent: 3, powerPercent: 5 },
    defaultMcbCurve: 'B',
    motorMcbCurve: 'C',
    rcdThresholdMa: 30,
    rcdRequiredOnSockets: true,
    socketCircuitAmps: 32,
    lightingCircuitAmps: 6,
    conductorLegend: {
      live: 'Brown (Line)',
      neutral: 'Blue (Neutral)',
      earth: 'Green/Yellow (CPC)',
    },
    plugSystem: 'bs1363',
    regionalSockets: ['socket-3pin', 'double-socket', 'socket-usb'],
  },
  us: {
    id: 'us',
    label: 'United States',
    shortLabel: 'US',
    citation: 'NFPA 70 (NEC)',
    flag: '🇺🇸',
    nominalVoltage: 120,
    frequencyHz: 60,
    // NEC: black/red "hot", white/gray "grounded conductor", green/bare equipment ground.
    wireColors: { live: '#1e293b', neutral: '#64748b', earth: '#15803d' },
    wireColorsDark: { live: '#38bdf8', neutral: '#f1f5f9', earth: '#4ade80' },
    voltageDrop: { lightingPercent: 3, powerPercent: 5 },
    defaultMcbCurve: 'C',
    motorMcbCurve: 'D',
    rcdThresholdMa: 6, // Class A GFCI trips at 4–6 mA
    rcdRequiredOnSockets: true,
    socketCircuitAmps: 20,
    lightingCircuitAmps: 15,
    conductorLegend: {
      live: 'Black / Red (Hot)',
      neutral: 'White / Gray (Grounded)',
      earth: 'Green / Bare (EGC)',
    },
    plugSystem: 'nema5',
    regionalSockets: ['socket-2pin', 'socket-us', 'double-socket-us', 'socket-gfci'],
  },
  eu: {
    id: 'eu',
    label: 'European Union',
    shortLabel: 'EU',
    citation: 'IEC 60364 / HD 60364',
    flag: '🇪🇺',
    nominalVoltage: 230,
    frequencyHz: 50,
    wireColors: { live: '#b45309', neutral: '#2563eb', earth: '#16a34a' },
    wireColorsDark: { live: '#f87171', neutral: '#60a5fa', earth: '#34d399' },
    voltageDrop: { lightingPercent: 3, powerPercent: 5 },
    defaultMcbCurve: 'B',
    motorMcbCurve: 'C',
    rcdThresholdMa: 30,
    rcdRequiredOnSockets: true,
    socketCircuitAmps: 16,
    lightingCircuitAmps: 10,
    conductorLegend: {
      live: 'Brown (Phase)',
      neutral: 'Blue (Neutral)',
      earth: 'Green/Yellow (PE)',
    },
    plugSystem: 'schuko',
    regionalSockets: ['socket-schuko', 'socket-schuko-double'],
  },

  // ─── Australia / New Zealand — AS/NZS 3000 ──────────────────────────────
  au: {
    id: 'au',
    label: 'Australia / New Zealand',
    shortLabel: 'AU/NZ',
    citation: 'AS/NZS 3000',
    flag: '🇦🇺',
    nominalVoltage: 230,
    frequencyHz: 50,
    // AU/NZ use brown live, blue neutral, green/yellow earth (IEC-ish, AS/NZS 3008 colours).
    wireColors: { live: '#b45309', neutral: '#2563eb', earth: '#16a34a' },
    wireColorsDark: { live: '#f87171', neutral: '#60a5fa', earth: '#34d399' },
    voltageDrop: { lightingPercent: 3, powerPercent: 5 },
    defaultMcbCurve: 'C',
    motorMcbCurve: 'C',
    rcdThresholdMa: 30,
    rcdRequiredOnSockets: true,
    socketCircuitAmps: 20,
    lightingCircuitAmps: 10,
    conductorLegend: {
      live: 'Brown (Active)',
      neutral: 'Blue (Neutral)',
      earth: 'Green/Yellow (Earth)',
    },
    plugSystem: 'as3112',
    regionalSockets: ['socket-as3112', 'socket-as3112-double'],
  },

  // ─── India — BS 546 / IS 1293 (and BS 1363 for new installs) ───────────
  in: {
    id: 'in',
    label: 'India',
    shortLabel: 'IN',
    citation: 'IS 732 / IS 1293 (BS 546 style)',
    flag: '🇮🇳',
    nominalVoltage: 230,
    frequencyHz: 50,
    // India: red/brown live, black/blue neutral, green/yellow earth (IS 732).
    wireColors: { live: '#b45309', neutral: '#2563eb', earth: '#16a34a' },
    wireColorsDark: { live: '#f87171', neutral: '#60a5fa', earth: '#34d399' },
    voltageDrop: { lightingPercent: 3, powerPercent: 5 },
    defaultMcbCurve: 'C',
    motorMcbCurve: 'C',
    rcdThresholdMa: 30,
    rcdRequiredOnSockets: true,
    socketCircuitAmps: 16,
    lightingCircuitAmps: 10,
    conductorLegend: {
      live: 'Red / Brown (Phase)',
      neutral: 'Black / Blue (Neutral)',
      earth: 'Green/Yellow (Earth)',
    },
    plugSystem: 'bs546',
    regionalSockets: ['socket-bs546', 'socket-bs546-double', 'socket-3pin'],
  },

  // ─── South Africa — SANS 10142 (BS 546 / SANS 164 style, Schuko-compatible) ──
  za: {
    id: 'za',
    label: 'South Africa',
    shortLabel: 'ZA',
    citation: 'SANS 10142-1',
    flag: '🇿🇦',
    nominalVoltage: 230,
    frequencyHz: 50,
    // South Africa: brown live, blue neutral, green/yellow earth (SANS 10142).
    wireColors: { live: '#b45309', neutral: '#2563eb', earth: '#16a34a' },
    wireColorsDark: { live: '#f87171', neutral: '#60a5fa', earth: '#34d399' },
    voltageDrop: { lightingPercent: 3, powerPercent: 5 },
    defaultMcbCurve: 'C',
    motorMcbCurve: 'C',
    rcdThresholdMa: 30,
    rcdRequiredOnSockets: true,
    socketCircuitAmps: 16,
    lightingCircuitAmps: 10,
    conductorLegend: {
      live: 'Brown (Phase)',
      neutral: 'Blue (Neutral)',
      earth: 'Green/Yellow (Earth)',
    },
    plugSystem: 'bs546',
    regionalSockets: ['socket-bs546', 'socket-schuko-double'],
  },
};

export const STANDARD_LIST: StandardPreset[] = [
  STANDARDS.uk,
  STANDARDS.us,
  STANDARDS.eu,
  STANDARDS.au,
  STANDARDS.in,
  STANDARDS.za,
];

export function getStandard(id: StandardId | undefined | null): StandardPreset {
  return STANDARDS[id ?? 'uk'];
}

// ─── Compliance helpers ───────────────────────────────────────────────────

/**
 * Recommend a standard MCB rating (Amps) for a load given its power draw and
 * the selected standard. Rounds UP to the next common domestic rating.
 *
 *   Ib = P / V   (design current)
 *   In ≥ Ib, chosen from a prefered-size list so the breaker is the smallest
 *   standard rating that comfortably carries the load.
 */
export function recommendMcbrating(
  powerWatts: number,
  voltage: number,
  standard: StandardPreset,
): { ratingAmps: number; curve: 'B' | 'C' | 'D'; designCurrentAmps: number } {
  const safeV = voltage > 0 ? voltage : standard.nominalVoltage;
  const designCurrentAmps = powerWatts > 0 && safeV > 0 ? powerWatts / safeV : 0;

  // Preferred ratings to IEC 60898 / NEC 240.6(A) common sizes.
  const preferredSizes = [6, 10, 15, 16, 20, 25, 32, 40, 50, 63];
  let ratingAmps = preferredSizes[preferredSizes.length - 1];
  for (const size of preferredSizes) {
    if (size >= designCurrentAmps * 1.25) {
      // 1.25 = continuous-load margin (NEC 210.20 / BS 7671 Ib ≤ In guidance).
      ratingAmps = size;
      break;
    }
  }
  return {
    ratingAmps,
    curve: standard.defaultMcbCurve,
    designCurrentAmps,
  };
}

/**
 * Choose the correct MCB trip curve for a load. Inductive / motor loads
 * (compressors, fans, EVSE) require C or D curves to ride through inrush;
 * resistive/electronic loads use B.
 */
export function recommendCurveForLoad(
  componentType: string,
  standard: StandardPreset,
): 'B' | 'C' | 'D' {
  const t = componentType.toLowerCase();
  const isMotor =
    t.includes('motor') ||
    t.includes('compressor') ||
    t.includes('pump') ||
    t.includes('transformer') ||
    t.includes('ev-charger') ||
    t.includes('air-conditioner') ||
    t.includes('induction-hob');
  if (isMotor) return standard.motorMcbCurve;
  return standard.defaultMcbCurve;
}

/**
 * Classify a component as "lighting" vs "power" so the correct voltage-drop
 * ceiling applies (3 % lighting, 5 % power under all three standards).
 */
export function isLightingLoad(componentType: string): boolean {
  const t = componentType.toLowerCase();
  return (
    t.includes('bulb') ||
    t.includes('lamp') ||
    t.includes('light') ||
    t.includes('tube-light') ||
    t.includes('downlight') ||
    t.includes('chandelier')
  );
}

/** Voltage-drop ceiling (percent) for a load under the given standard. */
export function voltageDropCeiling(componentType: string, standard: StandardPreset): number {
  return isLightingLoad(componentType)
    ? standard.voltageDrop.lightingPercent
    : standard.voltageDrop.powerPercent;
}
