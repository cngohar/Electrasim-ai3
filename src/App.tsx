/**
 * App.tsx — application shell.
 *
 * The public SVG editor is complete through the v1.5.0 hardening release.
 * The Editor reads from `/store` and renders via the SVG CircuitCanvas.
 * The incomplete PixiJS renderer stays behind `import.meta.env.DEV` until Phase 8 parity work.
 */
import { Editor } from './ui/Editor';
import { ErrorBoundary } from './ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Editor />
    </ErrorBoundary>
  );
}
