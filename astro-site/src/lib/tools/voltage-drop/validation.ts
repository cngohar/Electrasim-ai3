import type { ValidationResult, VoltageDropInputs } from './types';

export function validateVoltageDropInputs(inputs: Partial<VoltageDropInputs>): ValidationResult {
  const errors: Record<string, string> = {};

  // Voltage validation
  if (inputs.voltage === undefined || inputs.voltage === null || Number.isNaN(inputs.voltage)) {
    errors.voltage = 'System voltage is required.';
  } else if (inputs.voltage <= 0) {
    errors.voltage = 'System voltage must be greater than 0 V.';
  } else if (inputs.voltage > 1_000_000) {
    errors.voltage = 'System voltage cannot exceed 1,000 kV.';
  }

  // Current validation
  if (inputs.current === undefined || inputs.current === null || Number.isNaN(inputs.current)) {
    errors.current = 'Load current is required.';
  } else if (inputs.current < 0) {
    errors.current = 'Load current cannot be negative.';
  } else if (inputs.current > 50_000) {
    errors.current = 'Load current cannot exceed 50,000 A.';
  }

  // Length validation
  if (inputs.length === undefined || inputs.length === null || Number.isNaN(inputs.length)) {
    errors.length = 'Cable length is required.';
  } else if (inputs.length <= 0) {
    errors.length = 'Cable length must be greater than 0 m.';
  } else if (inputs.length > 50_000) {
    errors.length = 'Cable length cannot exceed 50,000 m.';
  }

  // Cable size validation
  if (inputs.size === undefined || inputs.size === null || Number.isNaN(inputs.size)) {
    errors.size = 'Cable size is required.';
  } else if (inputs.size <= 0) {
    errors.size = 'Cable cross-sectional area must be greater than 0 mm².';
  } else if (inputs.size > 2_500) {
    errors.size = 'Cable size cannot exceed 2,500 mm².';
  }

  // Power factor validation
  if (inputs.powerFactor !== undefined && inputs.powerFactor !== null) {
    if (inputs.powerFactor < 0.1 || inputs.powerFactor > 1.0) {
      errors.powerFactor = 'Power factor must be between 0.1 and 1.0.';
    }
  }

  // Temperature validation
  if (inputs.temperature !== undefined && inputs.temperature !== null) {
    if (inputs.temperature < -50 || inputs.temperature > 250) {
      errors.temperature = 'Conductor temperature must be between -50 °C and 250 °C.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
