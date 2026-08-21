/**
 * Voltage Drop Calculator — reference constants.
 *
 * DOCUMENTED MODEL (master plan §12)
 * ----------------------------------
 * This is a deliberately simplified *educational* resistive model. It models
 * the cable as pure DC resistance and nothing else. It intentionally does NOT
 * model: cable reactance, power factor, temperature correction, installation
 * correction factors, or harmonics. It is not a standards-compliance engine.
 *
 * One resistivity value per material is used everywhere in the application —
 * the engine, the tests and the UI all read these constants.
 */

/** Conductor resistivity in Ω·mm²/m at 20 °C. */
export const RESISTIVITY = {
  copper: 0.017241,
  aluminium: 0.028264,
} as const;

export type ConductorMaterial = keyof typeof RESISTIVITY;

/** Systems supported in v1. Three-phase is explicitly out of scope (§11). */
export const SYSTEM_TYPES = ['dc', 'ac-single'] as const;
export type SystemType = (typeof SYSTEM_TYPES)[number];

/**
 * Educational reference threshold, NOT a regulatory claim (§15). The UI must
 * present this as a configurable reference value, not as compliance.
 */
export const DEFAULT_RECOMMENDED_DROP_PERCENT = 3;

/**
 * Fraction of the threshold above which a result is reported as "at / near
 * limit" rather than "good". The default input set lands on 2.9984%, which
 * the plan requires to read as at/near limit rather than an unqualified good.
 */
export const NEAR_LIMIT_RATIO = 0.9;

/** Reset targets (§39). */
export const DEFAULT_INPUT = {
  systemType: 'ac-single' as SystemType,
  voltage: 230,
  current: 40,
  lengthOneWay: 50,
  cableSize: 10,
  material: 'copper' as ConductorMaterial,
};

/** Standard metric conductor sizes, used later by the Cable Size tool (§30). */
export const CABLE_SIZES_MM2 = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120] as const;
