import type { DropStatus, VoltageDropResult } from './types';

/** Display rounding, kept out of the calculation so maths stays exact. */
const round = (n: number, dp: number) => {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
};

export const formatVolts = (v: number) => `${round(v, 2).toFixed(2)} V`;
export const formatPercent = (v: number) => `${round(v, 2).toFixed(2)}%`;
export const formatWatts = (v: number) => `${round(v, 2).toFixed(2)} W`;
export const formatOhms = (v: number) => `${round(v, 5).toFixed(5)} Ω`;

export const STATUS_LABEL: Record<DropStatus, string> = {
  good: 'Good',
  'near-limit': 'At / near limit',
  excessive: 'Excessive',
};

export function statusExplanation(r: VoltageDropResult): string {
  const limit = `${r.recommendedDropPercent}%`;
  switch (r.status) {
    case 'good':
      return `The calculated drop of ${formatPercent(r.voltageDropPercent)} is comfortably within the ${limit} educational reference limit.`;
    case 'near-limit':
      return `The calculated drop of ${formatPercent(r.voltageDropPercent)} sits right on the ${limit} educational reference limit. A longer run, a higher current or a smaller conductor would push it over.`;
    case 'excessive':
      return `The calculated drop of ${formatPercent(r.voltageDropPercent)} exceeds the ${limit} educational reference limit. Try a larger conductor, a shorter run or a lower current.`;
  }
}

/** Plain-English walkthrough for the "What happened?" panel (§22, §35). */
export function explainCalculation(r: VoltageDropResult): string[] {
  return [
    `The current flows out to the load and back, so the conductor path is ${r.cableLengthOneWay} m × 2 = ${r.cableLengthRoundTrip} m.`,
    `Resistance R = ρ × L ÷ A = ${r.resistivity} × ${r.cableLengthRoundTrip} ÷ ${r.cableSize} = ${formatOhms(r.resistance)}.`,
    `Voltage drop = I × R = ${r.loadCurrent} A × ${formatOhms(r.resistance)} = ${formatVolts(r.voltageDrop)}.`,
    `As a share of the supply that is ${formatVolts(r.voltageDrop)} ÷ ${formatVolts(r.sourceVoltage)} = ${formatPercent(r.voltageDropPercent)}.`,
    `The load therefore sees ${formatVolts(r.sourceVoltage)} − ${formatVolts(r.voltageDrop)} = ${formatVolts(r.voltageAtLoad)}.`,
    `The cable dissipates I²R = ${formatWatts(r.powerLoss)} as heat.`,
  ];
}
