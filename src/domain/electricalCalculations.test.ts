import { describe, expect, it } from 'vitest';
import {
  calculateElectricalValues,
  calculateLoadCurrent,
  getStandardCableAmpacity,
} from './electricalCalculations';

describe('electrical calculations', () => {
  it('calculates load current from power and voltage', () => {
    expect(calculateLoadCurrent(2300, 230)).toBe(10);
  });

  it('uses standard cable ampacity steps', () => {
    expect(getStandardCableAmpacity(1.5)).toBe(16);
    expect(getStandardCableAmpacity(2.5)).toBe(27);
  });

  it('calculates two-way voltage drop and passes a normal branch', () => {
    const result = calculateElectricalValues({
      powerWatts: 1150,
      voltage: 230,
      currentAmps: 5,
      cableMm2: 2.5,
      lengthMeters: 10,
    });
    expect(result.voltageDropVolts).toBeCloseTo(0.7, 1);
    expect(result.status).toBe('pass');
  });

  it('rejects non-finite and physically invalid inputs', () => {
    expect(calculateLoadCurrent(Number.NaN, 230)).toBe(0);
    expect(getStandardCableAmpacity(Number.NaN)).toBe(0);

    const result = calculateElectricalValues({
      powerWatts: Number.NaN,
      voltage: 0,
      currentAmps: Number.NaN,
      cableMm2: -1,
      lengthMeters: Number.POSITIVE_INFINITY,
    });

    expect(result.status).toBe('fail');
    expect(result.message).toBe('Invalid electrical calculation input.');
    expect(
      Object.values(result).some((value) => typeof value === 'number' && !Number.isFinite(value)),
    ).toBe(false);
  });

  it('calculates voltage drop and derating for aluminum conductor', () => {
    const result = calculateElectricalValues({
      powerWatts: 1150,
      voltage: 230,
      currentAmps: 5,
      cableMm2: 2.5,
      lengthMeters: 10,
      material: 'aluminum',
    });
    expect(result.voltageDropVolts).toBeCloseTo(1.13, 1);
    expect(result.ampacityAmps).toBe(21);
    expect(result.status).toBe('pass');
  });

  it('supports AWG gauge input', () => {
    const result = calculateElectricalValues({
      powerWatts: 1150,
      voltage: 230,
      currentAmps: 5,
      cableMm2: 0,
      gauge: 14,
      lengthMeters: 10,
    });
    expect(result.cableMm2).toBe(2.08);
    expect(result.status).toBe('pass');
  });
});
