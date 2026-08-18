/**
 * Challenge domain barrel.
 *
 * Phase A exposes only the circuit generator foundation (plan §51). Diagnosis,
 * fault and Ohmageddon modules are added in later phases and will be exported
 * from here too.
 */

export * from './types';
export * from './difficulty/profiles';
export * from './generator/seed';
export * from './generator/recipes';
export * from './generator/topology';
export * from './generator/layout';
export * from './generator/validator';
export * from './generator/generator';
