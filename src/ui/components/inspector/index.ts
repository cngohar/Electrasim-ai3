/**
 * Inspector module barrel — preserves the original public API after the
 * monolithic `Inspector.tsx` was split into per-view modules.
 */

export { Inspector } from './Inspector';
export { useInspectorSelectionState } from './useInspectorSelectionState';
export type { InspectorSelectionState } from './useInspectorSelectionState';
