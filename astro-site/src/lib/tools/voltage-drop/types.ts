import type { ConductorMaterial, SystemType } from './constants';

export interface VoltageDropInput {
  systemType: SystemType;
  /** Nominal source voltage in volts. */
  voltage: number;
  /** Load current in amperes. */
  current: number;
  /** One-way run length from source to load, in metres. */
  lengthOneWay: number;
  /** Conductor cross-sectional area in mm². */
  cableSize: number;
  material: ConductorMaterial;
  /** Educational reference threshold; defaults to 3%. */
  recommendedDropPercent?: number;
}

export type DropStatus = 'good' | 'near-limit' | 'excessive';

export interface VoltageDropResult {
  sourceVoltage: number;
  loadCurrent: number;
  cableLengthOneWay: number;
  /** Out-and-return conductor path actually carrying the current. */
  cableLengthRoundTrip: number;
  cableSize: number;
  material: ConductorMaterial;
  systemType: SystemType;
  /** Ω·mm²/m used for this result. */
  resistivity: number;
  /** Total loop resistance in Ω. */
  resistance: number;
  voltageDrop: number;
  voltageDropPercent: number;
  voltageAtLoad: number;
  /** I²R resistive loss in watts. */
  powerLoss: number;
  recommendedDropPercent: number;
  status: DropStatus;
}

export interface FieldError {
  field: keyof VoltageDropInput;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: VoltageDropInput }
  | { ok: false; errors: FieldError[] };
