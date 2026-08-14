/** Educational defaults used when a legacy wire has no explicit metadata. */
export const ELECTRICAL_DEFAULTS = {
  copperResistivityOhmMm2PerM: 0.0175,
  aluminumResistivityOhmMm2PerM: 0.0282,
  defaultLengthMeters: 10,
  maximumVoltageDropPercent: 3,
  deratingFactor: 1,
} as const;

export function awgToMm2(awg: number): number {
  const map: Record<number, number> = {
    10: 5.26,
    12: 3.31,
    14: 2.08,
    16: 1.31,
    18: 0.82,
    20: 0.52,
    22: 0.33,
  };
  return map[awg] ?? 2.08;
}

export function getStandardCableAmpacity(
  mm2: number,
  material: 'copper' | 'aluminum' = 'copper',
): number {
  if (!Number.isFinite(mm2) || mm2 <= 0) return 0;
  let baseAmpacity = 85;
  if (mm2 <= 0.5) baseAmpacity = 6;
  else if (mm2 <= 0.82) baseAmpacity = 9;
  else if (mm2 <= 1) baseAmpacity = 11;
  else if (mm2 <= 1.5) baseAmpacity = 16;
  else if (mm2 <= 2.5) baseAmpacity = 27;
  else if (mm2 <= 4) baseAmpacity = 37;
  else if (mm2 <= 6) baseAmpacity = 47;
  else if (mm2 <= 10) baseAmpacity = 65;

  return material === 'aluminum' ? Math.round(baseAmpacity * 0.78) : baseAmpacity;
}

export interface ElectricalCalculationInput {
  powerWatts: number;
  voltage: number;
  currentAmps: number;
  cableMm2: number;
  lengthMeters?: number;
  deratingFactor?: number;
  material?: 'copper' | 'aluminum';
  gauge?: number;
}

export interface ElectricalCalculation {
  currentAmps: number;
  cableMm2: number;
  lengthMeters: number;
  ampacityAmps: number;
  deratedAmpacityAmps: number;
  resistanceOhms: number;
  voltageDropVolts: number;
  voltageDropPercent: number;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

export function calculateLoadCurrent(powerWatts: number, voltage: number): number {
  if (
    !Number.isFinite(powerWatts) ||
    !Number.isFinite(voltage) ||
    voltage <= 0 ||
    powerWatts <= 0
  ) {
    return 0;
  }
  return powerWatts / voltage;
}

export function calculateElectricalValues(
  input: ElectricalCalculationInput,
): ElectricalCalculation {
  const rawLength = input.lengthMeters ?? ELECTRICAL_DEFAULTS.defaultLengthMeters;
  const rawDerating = input.deratingFactor ?? ELECTRICAL_DEFAULTS.deratingFactor;
  const effectiveMm2 = input.gauge ? awgToMm2(input.gauge) : input.cableMm2;
  const validInput =
    Number.isFinite(input.powerWatts) &&
    input.powerWatts >= 0 &&
    Number.isFinite(input.voltage) &&
    input.voltage > 0 &&
    Number.isFinite(input.currentAmps) &&
    input.currentAmps >= 0 &&
    Number.isFinite(effectiveMm2) &&
    effectiveMm2 > 0 &&
    Number.isFinite(rawLength) &&
    rawLength > 0 &&
    Number.isFinite(rawDerating) &&
    rawDerating > 0 &&
    rawDerating <= 1;

  if (!validInput) {
    return {
      currentAmps: Number.isFinite(input.currentAmps) ? Math.max(0, input.currentAmps) : 0,
      cableMm2: Number.isFinite(effectiveMm2) ? Math.max(0, effectiveMm2) : 0,
      lengthMeters: Number.isFinite(rawLength) ? Math.max(0, rawLength) : 0,
      ampacityAmps: 0,
      deratedAmpacityAmps: 0,
      resistanceOhms: 0,
      voltageDropVolts: 0,
      voltageDropPercent: 0,
      status: 'fail',
      message: 'Invalid electrical calculation input.',
    };
  }

  const cableMm2 = Math.max(0.33, effectiveMm2);
  const lengthMeters = Math.max(0.1, rawLength);
  const deratingFactor = Math.max(0.1, Math.min(1, rawDerating));
  const material = input.material === 'aluminum' ? 'aluminum' : 'copper';
  const resistivity =
    material === 'aluminum'
      ? ELECTRICAL_DEFAULTS.aluminumResistivityOhmMm2PerM
      : ELECTRICAL_DEFAULTS.copperResistivityOhmMm2PerM;
  const ampacityAmps = getStandardCableAmpacity(cableMm2, material);
  const deratedAmpacityAmps = ampacityAmps * deratingFactor;
  const resistanceOhms = (resistivity * lengthMeters * 2) / cableMm2;
  const voltageDropVolts = input.currentAmps * resistanceOhms;
  const voltageDropPercent = input.voltage > 0 ? (voltageDropVolts / input.voltage) * 100 : 0;
  const status =
    input.currentAmps > deratedAmpacityAmps
      ? 'fail'
      : voltageDropPercent > ELECTRICAL_DEFAULTS.maximumVoltageDropPercent
        ? 'warning'
        : 'pass';
  const message =
    status === 'fail'
      ? `Current ${input.currentAmps.toFixed(1)} A exceeds derated ${material} cable capacity ${deratedAmpacityAmps.toFixed(1)} A.`
      : status === 'warning'
        ? `Voltage drop ${voltageDropPercent.toFixed(1)}% exceeds the ${ELECTRICAL_DEFAULTS.maximumVoltageDropPercent}% guidance limit.`
        : `Cable passes: ${voltageDropPercent.toFixed(1)}% voltage drop and ${deratedAmpacityAmps.toFixed(1)} A capacity (${material}).`;
  return {
    currentAmps: input.currentAmps,
    cableMm2,
    lengthMeters,
    ampacityAmps,
    deratedAmpacityAmps,
    resistanceOhms,
    voltageDropVolts,
    voltageDropPercent,
    status,
    message,
  };
}
