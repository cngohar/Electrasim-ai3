export function formatVoltage(volts: number): string {
  if (!Number.isFinite(volts)) return '—';
  if (Math.abs(volts) >= 1000) {
    const kv = volts / 1000;
    return `${Number.isInteger(kv) ? kv.toFixed(0) : kv.toFixed(2)} kV`;
  }
  return `${Number.isInteger(volts) ? volts.toFixed(0) : volts.toFixed(1)} V`;
}

export function formatCurrent(amps: number): string {
  if (!Number.isFinite(amps)) return '—';
  return `${Number.isInteger(amps) ? amps.toFixed(0) : amps.toFixed(1)} A`;
}

export function formatLength(meters: number): string {
  if (!Number.isFinite(meters)) return '—';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Number.isInteger(meters) ? meters.toFixed(0) : meters.toFixed(1)} m`;
}

export function formatCableSize(sizeMm2: number): string {
  if (!Number.isFinite(sizeMm2)) return '—';
  return `${sizeMm2} mm²`;
}

export function formatPercent(pct: number, decimals = 2): string {
  if (!Number.isFinite(pct)) return '—';
  return `${pct.toFixed(decimals)}%`;
}

export function formatPower(watts: number): string {
  if (!Number.isFinite(watts)) return '—';
  if (watts >= 1000) {
    return `${(watts / 1000).toFixed(2)} kW`;
  }
  return `${watts.toFixed(1)} W`;
}

export function formatResistance(ohms: number): string {
  if (!Number.isFinite(ohms)) return '—';
  if (ohms < 0.01) {
    return `${(ohms * 1000).toFixed(2)} mΩ`;
  }
  return `${ohms.toFixed(4)} Ω`;
}
