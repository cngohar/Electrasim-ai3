import { describe, expect, it } from 'vitest';
import { calculateVoltageDrop, classifyDrop } from './calculate';
import { DEFAULT_INPUT, RESISTIVITY } from './constants';
import { formatPercent, formatVolts, formatWatts } from './format';
import type { VoltageDropInput } from './types';
import { validateVoltageDropInput } from './validation';

const base: VoltageDropInput = { ...DEFAULT_INPUT };
const calc = (over: Partial<VoltageDropInput> = {}) => calculateVoltageDrop({ ...base, ...over });

describe('calculateVoltageDrop — documented default case', () => {
  // 230 V, 40 A, 50 m one-way, 10 mm², copper (master plan §12 / §31).
  const r = calc();

  it('uses the round-trip conductor path', () => {
    expect(r.cableLengthRoundTrip).toBe(100);
  });

  it('derives resistance from the single documented resistivity', () => {
    expect(r.resistivity).toBe(RESISTIVITY.copper);
    expect(r.resistance).toBeCloseTo(0.17241, 6);
  });

  it('matches the authoritative worked example', () => {
    expect(r.voltageDrop).toBeCloseTo(6.8964, 6);
    expect(r.voltageDropPercent).toBeCloseTo(2.9984, 4);
    expect(r.voltageAtLoad).toBeCloseTo(223.1036, 6);
    expect(r.powerLoss).toBeCloseTo(275.856, 6);
  });

  it('rounds to the specified display values', () => {
    expect(formatVolts(r.voltageDrop)).toBe('6.90 V');
    expect(formatPercent(r.voltageDropPercent)).toBe('3.00%');
    expect(formatVolts(r.voltageAtLoad)).toBe('223.10 V');
    expect(formatWatts(r.powerLoss)).toBe('275.86 W');
  });

  it('reports the default as at / near limit, not an unqualified good', () => {
    expect(r.status).toBe('near-limit');
  });

  it('never reproduces the inconsistent mockup pairing', () => {
    // 6.33 V drop with 275.2 W loss implies two different resistances.
    expect(r.voltageDrop).not.toBeCloseTo(6.33, 2);
  });

  it('derives every figure from one resistance', () => {
    expect(r.voltageDrop / r.loadCurrent).toBeCloseTo(r.resistance, 10);
    expect(r.powerLoss / (r.loadCurrent * r.loadCurrent)).toBeCloseTo(r.resistance, 10);
  });
});

describe('calculateVoltageDrop — relationships', () => {
  const baseDrop = calc().voltageDrop;

  it('lower current lowers the drop', () => {
    expect(calc({ current: 20 }).voltageDrop).toBeLessThan(baseDrop);
  });
  it('longer cable raises the drop', () => {
    expect(calc({ lengthOneWay: 100 }).voltageDrop).toBeGreaterThan(baseDrop);
  });
  it('larger conductor lowers the drop', () => {
    expect(calc({ cableSize: 16 }).voltageDrop).toBeLessThan(baseDrop);
  });
  it('smaller conductor raises the drop', () => {
    expect(calc({ cableSize: 6 }).voltageDrop).toBeGreaterThan(baseDrop);
  });
  it('aluminium has a higher drop than copper', () => {
    expect(calc({ material: 'aluminium' }).voltageDrop).toBeGreaterThan(baseDrop);
  });
  it('drop is proportional to current', () => {
    expect(calc({ current: 80 }).voltageDrop).toBeCloseTo(baseDrop * 2, 10);
  });
  it('drop is inversely proportional to area', () => {
    expect(calc({ cableSize: 5 }).voltageDrop).toBeCloseTo(baseDrop * 2, 10);
  });
});

describe('calculateVoltageDrop — identities and boundaries', () => {
  it('percentage identity holds', () => {
    const r = calc({ voltage: 400, current: 63, lengthOneWay: 25, cableSize: 16 });
    expect(r.voltageDropPercent).toBeCloseTo((r.voltageDrop / r.sourceVoltage) * 100, 10);
  });
  it('load-voltage identity holds', () => {
    const r = calc({ current: 12, lengthOneWay: 8 });
    expect(r.voltageAtLoad).toBeCloseTo(r.sourceVoltage - r.voltageDrop, 10);
  });
  it('zero length means no drop', () => {
    const r = calc({ lengthOneWay: 0 });
    expect(r.voltageDrop).toBe(0);
    expect(r.voltageAtLoad).toBe(230);
    expect(r.status).toBe('good');
  });
  it('zero current means no drop and no loss', () => {
    const r = calc({ current: 0 });
    expect(r.voltageDrop).toBe(0);
    expect(r.powerLoss).toBe(0);
  });
  it('changing voltage changes the percentage but not the drop', () => {
    const a = calc({ voltage: 230 });
    const b = calc({ voltage: 115 });
    expect(b.voltageDrop).toBeCloseTo(a.voltageDrop, 10);
    expect(b.voltageDropPercent).toBeCloseTo(a.voltageDropPercent * 2, 10);
  });
  it('is deterministic', () => {
    expect(calc()).toEqual(calc());
  });
});

describe('classifyDrop', () => {
  it('bands correctly around the reference limit', () => {
    expect(classifyDrop(1.0, 3)).toBe('good');
    expect(classifyDrop(2.69, 3)).toBe('good');
    expect(classifyDrop(2.7, 3)).toBe('near-limit');
    expect(classifyDrop(3.0, 3)).toBe('near-limit');
    expect(classifyDrop(3.01, 3)).toBe('excessive');
  });
  it('honours a custom educational threshold', () => {
    expect(classifyDrop(4, 5)).toBe('good');
    expect(classifyDrop(6, 5)).toBe('excessive');
  });
});

describe('validateVoltageDropInput', () => {
  const raw = {
    systemType: 'ac-single',
    voltage: '230',
    current: '40',
    lengthOneWay: '50',
    cableSize: '10',
    material: 'copper',
  };

  it('accepts numeric strings', () => {
    const res = validateVoltageDropInput(raw);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.voltage).toBe(230);
  });

  it.each([
    ['', 'needs a number'],
    ['   ', 'needs a number'],
    ['abc', 'needs a number'],
  ])('rejects non-numeric voltage %p', (voltage, fragment) => {
    const res = validateVoltageDropInput({ ...raw, voltage });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors[0].message).toContain(fragment);
  });

  it('rejects negative current with a friendly message', () => {
    const res = validateVoltageDropInput({ ...raw, current: '-5' });
    expect(res.ok).toBe(false);
    if (!res.ok)
      expect(res.errors[0].message).toBe(
        'Load current cannot be negative — it must be 0 A or more.',
      );
  });

  it('rejects zero cable size but allows zero length', () => {
    const bad = validateVoltageDropInput({ ...raw, cableSize: '0' });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors[0].message).toBe('Cable size must be greater than 0 mm².');
    expect(validateVoltageDropInput({ ...raw, lengthOneWay: '0' }).ok).toBe(true);
  });

  it('rejects negative cable length', () => {
    const res = validateVoltageDropInput({ ...raw, lengthOneWay: '-1' });
    expect(res.ok).toBe(false);
  });

  it('rejects three-phase — out of scope in v1', () => {
    const res = validateVoltageDropInput({ ...raw, systemType: 'ac-three' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors[0].message).toContain('Three-phase is not supported yet');
  });

  it('rejects an unknown material', () => {
    expect(validateVoltageDropInput({ ...raw, material: 'unobtainium' }).ok).toBe(false);
  });

  it('rejects Infinity and NaN', () => {
    expect(validateVoltageDropInput({ ...raw, voltage: Number.POSITIVE_INFINITY }).ok).toBe(false);
    expect(validateVoltageDropInput({ ...raw, voltage: Number.NaN }).ok).toBe(false);
  });

  it('collects every problem at once', () => {
    const res = validateVoltageDropInput({ ...raw, voltage: '-1', cableSize: '0' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.length).toBe(2);
  });
});
