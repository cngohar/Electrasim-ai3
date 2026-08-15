/**
 * Inspector — public entry point.
 *
 * The 3,166-line monolith was split into per-view modules under
 * `./inspector/`. This shim preserves the historical import path so
 * existing consumers (`Editor.tsx`, tests) keep working unchanged.
 */

export { Inspector, useInspectorSelectionState } from './inspector';
