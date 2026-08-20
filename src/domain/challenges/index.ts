/**
 * Challenge domain barrel.
 *
 * Exposes the circuit generator foundation (Phase A/B), Challenge Mode
 * (Phase C) and the Diagnosis Lab (Phase D) per plan §51. Ohmageddon is added
 * in a later phase and will be exported from here too.
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
export * from './faults/eligibility';
export * from './faults/injection';
export * from './faults/labels';
export * from './faults/verification';
export * from './diagnosis/scenario';
export * from './diagnosis/evaluator';
export * from './diagnosis/scoring';
export * from './share';
export * from './rage';
