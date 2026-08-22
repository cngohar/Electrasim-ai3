export type SystemType = 'dc' | 'single' | 'three';
export type ConductorMaterial = 'copper' | 'aluminum';
export type VoltageDropSeverity = 'good' | 'warning' | 'excessive';

export interface MaterialProperties {
  rho20: number; // resistivity at 20°C in Ω·mm²/m
  alpha: number; // temperature coefficient per °C
}

export interface VoltageDropInputs {
  systemType: SystemType;
  voltage: number; // Volts
  current: number; // Amperes
  length: number; // One-way meters
  size: number; // mm²
  material: ConductorMaterial;
  powerFactor?: number; // 0.1 to 1.0 (default 1.0 / 0.92 for AC)
  temperature?: number; // °C (default 20°C)
  includeReactance?: boolean; // include line reactance
}

export interface VoltageDropResult {
  valid: boolean;
  systemType: SystemType;
  sourceVoltage: number; // V
  loadCurrent: number; // A
  cableLengthOneWay: number; // m
  cableLengthRoundTrip: number; // m
  cableSize: number; // mm²
  material: ConductorMaterial;
  resistancePerMeter: number; // Ω/m
  totalResistance: number; // Ω
  voltageDrop: number; // V
  voltageDropPercent: number; // %
  voltageAtLoad: number; // V
  powerLoss: number; // W
  severity: VoltageDropSeverity;
  statusTitle: string;
  statusDescription: string;
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
