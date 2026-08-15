/**
 * Protection-device trip modelling — cable ampacity table (BS 7671 Table
 * 4D5) and IEC 60898-1 / IEC 61008-9 trip-curve calculators.
 *
 * Split verbatim from the former monolithic `simulation.ts`. Pure module:
 * no React / DOM imports so it can ship into `simulation.worker.ts`.
 */

/** Get cable current carrying capacity in Amps based on cross-section mm² (BS 7671 Table 4D5). */
export function getCableAmpacity(mm2: number): number {
  if (mm2 <= 1.0) return 11;
  if (mm2 <= 1.5) return 16;
  if (mm2 <= 2.5) return 27;
  if (mm2 <= 4.0) return 37;
  if (mm2 <= 6.0) return 47;
  if (mm2 <= 10.0) return 65;
  return 85;
}

/**
 * MCB/RCBO Trip Curve Simulation - IEC 60898-1 Standard
 *
 * Calculates whether a protection device should trip based on:
 * 1. Thermal trip (overload): Inverse time delay for moderate overcurrents (1.13-3×In)
 * 2. Magnetic trip (short-circuit): Instantaneous trip for high fault currents
 *
 * MCB Types define the magnetic trip threshold multiplier:
 * - Type B: 3-5× rated current (domestic lighting, resistive loads)
 * - Type C: 5-10× rated current (motors, transformers, inductive loads)
 * - Type D: 10-20× rated current (heavy industrial, high inrush)
 *
 * @param currentAmps - Actual current flowing through the breaker
 * @param ratedAmps - Breaker rated current (In)
 * @param mcbType - 'B', 'C', or 'D' curve type
 * @param elapsedSeconds - Time current has been flowing at this level
 * @returns Object with trip decision and timing information
 */
export interface TripCurveResult {
  /** Whether the breaker should trip */
  shouldTrip: boolean;
  /** Reason for trip: 'thermal' (overload) or 'magnetic' (short-circuit) */
  tripReason?: 'thermal' | 'magnetic';
  /** Minimum time to trip at this current level (seconds), undefined if no trip */
  timeToTrip?: number;
  /** Multiple of rated current */
  currentMultiple: number;
}

export function calculateMCBTrip(
  currentAmps: number,
  ratedAmps: number,
  mcbType: 'B' | 'C' | 'D' = 'B',
  elapsedSeconds = 0,
): TripCurveResult {
  if (ratedAmps <= 0) {
    return { shouldTrip: false, currentMultiple: 0 };
  }

  const currentMultiple = currentAmps / ratedAmps;

  // No trip below 1.13×In per IEC 60898-1 (conventional non-tripping current)
  if (currentMultiple < 1.13) {
    return { shouldTrip: false, currentMultiple };
  }

  // Determine magnetic trip threshold based on MCB type
  let magneticThreshold: number;
  switch (mcbType) {
    case 'B':
      magneticThreshold = 3; // Trips instantaneously at 3-5×In
      break;
    case 'C':
      magneticThreshold = 5; // Trips instantaneously at 5-10×In
      break;
    case 'D':
      magneticThreshold = 10; // Trips instantaneously at 10-20×In
      break;
    default:
      magneticThreshold = 3;
  }

  // Magnetic trip (instantaneous) for severe overcurrent/short-circuit
  // Upper bound of magnetic range: 5× for B, 10× for C, 20× for D
  let magneticUpper: number;
  switch (mcbType) {
    case 'B':
      magneticUpper = 5;
      break;
    case 'C':
      magneticUpper = 10;
      break;
    case 'D':
      magneticUpper = 20;
      break;
    default:
      magneticUpper = 5;
  }

  if (currentMultiple >= magneticThreshold) {
    // Instantaneous magnetic trip (typically < 100ms)
    // For simplicity, we consider it immediate in simulation ticks
    return {
      shouldTrip: true,
      tripReason: 'magnetic',
      timeToTrip: 0.1, // 100ms typical magnetic trip time
      currentMultiple,
    };
  }

  // Thermal trip (inverse time characteristic) for overloads
  // IEC 60898-1 specifies:
  // - Must NOT trip at 1.13×In within 1 hour (for In ≤ 63A)
  // - Must trip at 1.45×In within 1 hour
  // - Must trip at 2.55×In between 1s and 60s

  // Simplified inverse-time formula: t = k / (I/In)^α - 1
  // Where k and α are calibrated to meet IEC requirements

  // At 1.45×In: must trip within 3600s (1 hour)
  // At 2.55×In: must trip within 1-60s
  // At 3×In: approaching magnetic trip zone

  // Using simplified formula: t = 3600 / ((I/In)^2 - 1) for 1.13× to 3× range
  // This gives approximately correct timing per IEC 60898-1

  const thermalMultiplier = Math.max(0.01, currentMultiple * currentMultiple - 1);
  const timeToTripSeconds = 3600 / thermalMultiplier;

  // Clamp to realistic bounds
  const clampedTimeToTrip = Math.max(0.1, Math.min(3600, timeToTripSeconds));

  // Trip if elapsed time exceeds the required trip time
  const shouldTrip = elapsedSeconds >= clampedTimeToTrip;

  return {
    shouldTrip,
    tripReason: 'thermal',
    timeToTrip: clampedTimeToTrip,
    currentMultiple,
  };
}

/**
 * Calculate RCD/RCBO earth leakage trip based on residual current.
 * Per IEC 61008/61009:
 * - 30mA RCD must trip at 30mA within 300ms
 * - Must trip at 150mA (5×In) within 40ms
 *
 * @param leakageCurrent_mA - Earth leakage current in milliamps
 * @param ratedLeakage_mA - RCD rated residual current (e.g., 30mA)
 * @param elapsedSeconds - Time leakage has been present
 * @returns Whether the RCD should trip
 */
export interface RCDTripResult {
  shouldTrip: boolean;
  leakageMultiple: number;
  timeToTrip?: number;
}

export function calculateRCDTrip(
  leakageCurrent_mA: number,
  ratedLeakage_mA = 30,
  elapsedSeconds = 0,
): RCDTripResult {
  if (ratedLeakage_mA <= 0) {
    return { shouldTrip: false, leakageMultiple: 0 };
  }

  const leakageMultiple = leakageCurrent_mA / ratedLeakage_mA;

  // No trip below 50% of rated leakage (per IEC 61008)
  if (leakageMultiple < 0.5) {
    return { shouldTrip: false, leakageMultiple };
  }

  // At rated current (1.0×In): must trip within 300ms
  // At 5× rated (150mA for 30mA RCD): must trip within 40ms

  let timeToTripSeconds: number;
  if (leakageMultiple >= 5) {
    timeToTripSeconds = 0.04; // 40ms for high leakage
  } else if (leakageMultiple >= 1.0) {
    // Linear interpolation between 1× and 5×
    timeToTripSeconds = 0.3 - (leakageMultiple - 1) * (0.26 / 4);
  } else {
    // Between 0.5× and 1×: longer delay
    timeToTripSeconds = 0.3 + (1 - leakageMultiple) * 0.3;
  }

  const shouldTrip = elapsedSeconds >= timeToTripSeconds;

  return {
    shouldTrip,
    leakageMultiple,
    timeToTrip: timeToTripSeconds,
  };
}
