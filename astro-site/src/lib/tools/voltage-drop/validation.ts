import { RESISTIVITY, SYSTEM_TYPES } from './constants';
import type { FieldError, ValidationResult, VoltageDropInput } from './types';

/**
 * Friendly, educational validation (§13). Messages name the field and the
 * rule — never a bare "Invalid input".
 */

type RawInput = Partial<Record<keyof VoltageDropInput, unknown>>;

/** Accepts numbers or numeric strings; rejects blanks, NaN and Infinity. */
function toNumber(raw: unknown): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

interface NumericRule {
  field: keyof VoltageDropInput;
  label: string;
  unit: string;
  /** Whether zero is an acceptable value. */
  allowZero: boolean;
  max: number;
}

const NUMERIC_RULES: NumericRule[] = [
  { field: 'voltage', label: 'System voltage', unit: 'V', allowZero: false, max: 1_000_000 },
  { field: 'current', label: 'Load current', unit: 'A', allowZero: true, max: 100_000 },
  { field: 'lengthOneWay', label: 'Cable length', unit: 'm', allowZero: true, max: 100_000 },
  { field: 'cableSize', label: 'Cable size', unit: 'mm²', allowZero: false, max: 10_000 },
];

export function validateVoltageDropInput(raw: RawInput): ValidationResult {
  const errors: FieldError[] = [];
  const numbers = {} as Record<string, number>;

  for (const rule of NUMERIC_RULES) {
    const value = toNumber(raw[rule.field]);

    if (value === null) {
      errors.push({
        field: rule.field,
        message: `${rule.label} needs a number, in ${rule.unit}.`,
      });
      continue;
    }
    if (value < 0) {
      errors.push({
        field: rule.field,
        message: `${rule.label} cannot be negative — it must be 0 ${rule.unit} or more.`,
      });
      continue;
    }
    if (!rule.allowZero && value === 0) {
      errors.push({
        field: rule.field,
        message: `${rule.label} must be greater than 0 ${rule.unit}.`,
      });
      continue;
    }
    if (value > rule.max) {
      errors.push({
        field: rule.field,
        message: `${rule.label} looks too large — keep it under ${rule.max.toLocaleString('en-GB')} ${rule.unit}.`,
      });
      continue;
    }
    numbers[rule.field] = value;
  }

  const material = raw.material;
  if (typeof material !== 'string' || !(material in RESISTIVITY)) {
    errors.push({
      field: 'material',
      message: `Conductor material must be one of: ${Object.keys(RESISTIVITY).join(', ')}.`,
    });
  }

  const systemType = raw.systemType;
  if (typeof systemType !== 'string' || !SYSTEM_TYPES.includes(systemType as never)) {
    errors.push({
      field: 'systemType',
      message: 'System type must be DC or single-phase AC. Three-phase is not supported yet.',
    });
  }

  const threshold =
    raw.recommendedDropPercent === undefined ? undefined : toNumber(raw.recommendedDropPercent);
  if (raw.recommendedDropPercent !== undefined && (threshold === null || threshold <= 0)) {
    errors.push({
      field: 'recommendedDropPercent',
      message: 'The reference limit must be a percentage greater than 0.',
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      systemType: systemType as VoltageDropInput['systemType'],
      voltage: numbers.voltage,
      current: numbers.current,
      lengthOneWay: numbers.lengthOneWay,
      cableSize: numbers.cableSize,
      material: material as VoltageDropInput['material'],
      ...(threshold != null ? { recommendedDropPercent: threshold } : {}),
    },
  };
}
