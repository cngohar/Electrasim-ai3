/**
 * Challenge domain barrel.
 *
 * Exposes the circuit generator foundation (Phase A/B) and Challenge Mode
 * (Phase C) per plan §51. Diagnosis Lab and Ohmageddon are added in later
 * phases and will be exported from here too.
 */

export * from './types';
export * from './difficulty/profiles';
export * from './generator/seed';
export * from './generator/recipes';
export * from './generator/topology';
export * from './generator/layout';
export * from './generator/validator';
export * from './generator/generator';
export * from './challenge/scenario';
export * from './challenge/comparison';
export * from './challenge/evaluator';
export * from './challenge/scoring';
