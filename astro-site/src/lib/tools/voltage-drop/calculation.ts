import type {
  ConductorMaterial,
  MaterialProperties,
  VoltageDropInputs,
  VoltageDropResult,
  VoltageDropSeverity,
} from './types';

export const MATERIAL_PROPERTIES: Record<ConductorMaterial, MaterialProperties> = {
  copper: {
    rho20: 0.0172, // Ω·mm²/m at 20°C (standard electrolytic copper)
    alpha: 0.00393, // Temperature coefficient /°C
  },
  aluminum: {
    rho20: 0.0282, // Ω·mm²/m at 20°C (standard EC grade aluminum)
    alpha: 0.00403, // Temperature coefficient /°C
  },
};

// Typical line reactance for standard non-magnetic multicore cable: 0.08 mΩ/m (8e-5 Ω/m)
export const DEFAULT_LINE_REACTANCE = 8e-5;

export const SEVERITY_INFO: Record<VoltageDropSeverity, { title: string; description: string }> = {
  good: {
    title: 'Good',
    description:
      'The calculated voltage drop is within the 3% recommended limit (e.g. BS 7671 lighting circuits).',
  },
  warning: {
    title: 'Marginal',
    description:
      'Voltage drop is between 3% and 5%. It is acceptable for general power/socket circuits, but close to the limit.',
  },
  excessive: {
    title: 'Excessive',
    description:
      'Voltage drop exceeds 5%. This may cause motors to overheat, equipment to malfunction, or excessive power loss. Upsize the cable.',
  },
};

/**
 * Calculates resistivity at the specified operating temperature.
 * ρ_T = ρ_20 * [1 + α * (T - 20)]
 */
export function getResistivityAtTemperature(material: ConductorMaterial, tempC = 20): number {
  const props = MATERIAL_PROPERTIES[material] ?? MATERIAL_PROPERTIES.copper;
  const clampedTemp = Math.min(250, Math.max(-50, tempC));
  return Math.max(0, props.rho20 * (1 + props.alpha * (clampedTemp - 20)));
}

/**
 * Pure calculation engine for electrical voltage drop.
 * Supports DC, 1-Phase AC, and 3-Phase AC resistive + reactive loads.
 */
export function calculateVoltageDrop(inputs: VoltageDropInputs): VoltageDropResult {
  const systemType = inputs.systemType ?? 'single';
  const voltage = Number.isFinite(inputs.voltage) ? Math.max(0, inputs.voltage) : 0;
  const current = Number.isFinite(inputs.current) ? Math.max(0, inputs.current) : 0;
  const lengthOneWay = Number.isFinite(inputs.length) ? Math.max(0, inputs.length) : 0;
  const size = Number.isFinite(inputs.size) ? Math.max(0, inputs.size) : 0;
  const material = inputs.material === 'aluminum' ? 'aluminum' : 'copper';
  const temp = Number.isFinite(inputs.temperature) ? inputs.temperature! : 20;
  const pf = systemType === 'dc' ? 1.0 : Math.min(1.0, Math.max(0.1, inputs.powerFactor ?? 0.92));
  const includeReactance = Boolean(inputs.includeReactance);

  const roundTripMultiplier = systemType === 'three' ? Math.sqrt(3) : 2;
  const powerLossMultiplier = systemType === 'three' ? 3 : 2;
  const roundTripLength = lengthOneWay * (systemType === 'three' ? Math.sqrt(3) : 2);

  if (voltage <= 0 || size <= 0) {
    return {
      valid: false,
      systemType,
      sourceVoltage: voltage,
      loadCurrent: current,
      cableLengthOneWay: lengthOneWay,
      cableLengthRoundTrip: roundTripLength,
      cableSize: size,
      material,
      resistancePerMeter: 0,
      totalResistance: 0,
      voltageDrop: 0,
      voltageDropPercent: 0,
      voltageAtLoad: 0,
      powerLoss: 0,
      severity: 'warning',
      statusTitle: 'Check Inputs',
      statusDescription: 'System voltage and cable size must both be greater than zero.',
      errorMessage: 'System voltage and cable size must be greater than 0.',
    };
  }

  // Resistance per meter = rho_T / A  (in Ω/m)
  const rho = getResistivityAtTemperature(material, temp);
  const resistancePerMeter = rho / size;
  const totalResistance = resistancePerMeter * lengthOneWay * roundTripMultiplier;

  // Reactance (only applies to AC)
  const reactancePerMeter = systemType !== 'dc' && includeReactance ? DEFAULT_LINE_REACTANCE : 0;
  const sinPhi = systemType === 'dc' ? 0 : Math.sqrt(Math.max(0, 1 - pf * pf));

  // Voltage drop formula:
  // DC: 2 * I * L * r
  // 1-Phase: 2 * I * L * (r * cos φ + x * sin φ)
  // 3-Phase: √3 * I * L * (r * cos φ + x * sin φ)
  const effectiveImpedancePerMeter = resistancePerMeter * pf + reactancePerMeter * sinPhi;
  const voltageDrop = roundTripMultiplier * current * lengthOneWay * effectiveImpedancePerMeter;

  const dropPercent = voltage > 0 ? (voltageDrop / voltage) * 100 : 0;
  const voltageAtLoad = Math.max(0, voltage - voltageDrop);

  // Power loss: I² * R_total = I² * (powerLossMultiplier * r * L)
  const powerLoss = current * current * (powerLossMultiplier * resistancePerMeter * lengthOneWay);

  // Severity rating: <= 3% is good, 3-5% is warning, > 5% is excessive
  const EPSILON = 1e-9;
  let severity: VoltageDropSeverity = 'good';
  if (dropPercent > 5.0 + EPSILON) {
    severity = 'excessive';
  } else if (dropPercent > 3.0 + EPSILON) {
    severity = 'warning';
  }

  const status = SEVERITY_INFO[severity];

  return {
    valid: true,
    systemType,
    sourceVoltage: voltage,
    loadCurrent: current,
    cableLengthOneWay: lengthOneWay,
    cableLengthRoundTrip: roundTripLength,
    cableSize: size,
    material,
    resistancePerMeter,
    totalResistance,
    voltageDrop,
    voltageDropPercent: dropPercent,
    voltageAtLoad,
    powerLoss,
    severity,
    statusTitle: status.title,
    statusDescription: status.description,
  };
}
