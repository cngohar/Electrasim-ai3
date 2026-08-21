import { DEFAULT_RECOMMENDED_DROP_PERCENT, NEAR_LIMIT_RATIO, RESISTIVITY } from './constants';
import type { DropStatus, VoltageDropInput, VoltageDropResult } from './types';

/**
 * Deterministic pure calculation (§12). No framework imports, no I/O, no
 * randomness — the same input always produces the same result, so the Cable
 * Size tool can later sweep candidate sizes through this same function (§30).
 *
 * Model
 * -----
 *   L = one-way length × 2      (out-and-return conductor path, DC / 1-φ AC)
 *   R = ρ × L / A
 *   Vdrop      = I × R
 *   dropPct    = Vdrop / Vsource × 100
 *   Vload      = Vsource − Vdrop
 *   powerLoss  = I² × R
 *
 * Every displayed figure derives from this single `R`.
 */
export function calculateVoltageDrop(input: VoltageDropInput): VoltageDropResult {
  const {
    systemType,
    voltage,
    current,
    lengthOneWay,
    cableSize,
    material,
    recommendedDropPercent = DEFAULT_RECOMMENDED_DROP_PERCENT,
  } = input;

  const resistivity = RESISTIVITY[material];
  const cableLengthRoundTrip = lengthOneWay * 2;

  const resistance = (resistivity * cableLengthRoundTrip) / cableSize;
  const voltageDrop = current * resistance;
  const voltageDropPercent = (voltageDrop / voltage) * 100;
  const voltageAtLoad = voltage - voltageDrop;
  const powerLoss = current * current * resistance;

  return {
    sourceVoltage: voltage,
    loadCurrent: current,
    cableLengthOneWay: lengthOneWay,
    cableLengthRoundTrip,
    cableSize,
    material,
    systemType,
    resistivity,
    resistance,
    voltageDrop,
    voltageDropPercent,
    voltageAtLoad,
    powerLoss,
    recommendedDropPercent,
    status: classifyDrop(voltageDropPercent, recommendedDropPercent),
  };
}

/**
 * Three educational states (§18). The "near limit" band exists so a result
 * sitting on the threshold — like the default 2.9984% — is not reported as an
 * unqualified "Good".
 */
export function classifyDrop(dropPercent: number, limit: number): DropStatus {
  if (dropPercent > limit) return 'excessive';
  if (dropPercent >= limit * NEAR_LIMIT_RATIO) return 'near-limit';
  return 'good';
}
