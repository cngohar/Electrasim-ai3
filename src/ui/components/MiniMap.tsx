/**
 * MiniMap — Phase 6.3-slim
 *
 * A thumbnail SVG in the bottom-left corner showing all components as small
 * rectangles, with a viewport indicator rectangle. Pure read-only — clicking
 * pans the main canvas to the clicked world position.
 *
 * Performance: renders only when showMiniMap is true; subscribes only to
 * components + viewport. No per-frame work outside those subscriptions.
 */

import { useCallback, useRef } from 'react';
import { COMP_H, COMP_W } from '../../domain';
import { useCircuitStore, useUiStore, useViewportStore } from '../../store';

const MM_W = 160;
const MM_H = 100;
const PADDING = 24;

interface Props {
  consoleOffset?: 'none' | 'collapsed' | 'expanded';
}

function worldToMiniMap(
  wx: number,
  wy: number,
  bounds: { minX: number; minY: number; scaleX: number; scaleY: number },
) {
  return {
    x: (wx - bounds.minX) * bounds.scaleX + PADDING / 2,
    y: (wy - bounds.minY) * bounds.scaleY + PADDING / 2,
  };
}

export function MiniMap({ consoleOffset = 'none' }: Props) {
  const components = useCircuitStore((s) => s.components);
  const selectedComponentIds = useCircuitStore((s) => s.selectedComponentIds);
  const selectedWireIds = useCircuitStore((s) => s.selectedWireIds);
  const hasSelection = selectedComponentIds.length > 0 || selectedWireIds.length > 0;
  const inspectorCollapsed = useUiStore((s) => s.inspectorCollapsed);
  const { pan, zoom } = useViewportStore();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || components.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mmX = e.clientX - rect.left;
      const mmY = e.clientY - rect.top;
      const xs = components.map((c) => c.x);
      const ys = components.map((c) => c.y);
      const minX = Math.min(...xs) - COMP_W / 2 - PADDING;
      const minY = Math.min(...ys) - COMP_H / 2 - PADDING;
      const maxX = Math.max(...xs) + COMP_W / 2 + PADDING;
      const maxY = Math.max(...ys) + COMP_H / 2 + PADDING;
      const spanX = maxX - minX;
      const spanY = maxY - minY;
      const scaleX = (MM_W - PADDING) / spanX;
      const scaleY = (MM_H - PADDING) / spanY;
      const worldX = (mmX - PADDING / 2) / scaleX + minX;
      const worldY = (mmY - PADDING / 2) / scaleY + minY;
      useViewportStore.getState().setPan({ x: -worldX * zoom + 600, y: -worldY * zoom + 360 });
    },
    [components, zoom],
  );

  if (components.length === 0) return null;

  const xs = components.map((c) => c.x);
  const ys = components.map((c) => c.y);
  const minX = Math.min(...xs) - COMP_W / 2 - PADDING;
  const minY = Math.min(...ys) - COMP_H / 2 - PADDING;
  const maxX = Math.max(...xs) + COMP_W / 2 + PADDING;
  const maxY = Math.max(...ys) + COMP_H / 2 + PADDING;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scaleX = (MM_W - PADDING) / spanX;
  const scaleY = (MM_H - PADDING) / spanY;
  const bounds = { minX, minY, scaleX, scaleY };

  // Viewport rect in mini-map coords
  const vpW = 1200;
  const vpH = 720;
  const vpMinX = -pan.x / zoom;
  const vpMinY = -pan.y / zoom;
  const vpMaxX = vpMinX + vpW / zoom;
  const vpMaxY = vpMinY + vpH / zoom;
  const vpTL = worldToMiniMap(vpMinX, vpMinY, bounds);
  const vpBR = worldToMiniMap(vpMaxX, vpMaxY, bounds);
  const rightClass = inspectorCollapsed ? 'right-14' : 'right-76 lg:right-84';

  const bottomClass =
    consoleOffset === 'expanded'
      ? 'bottom-72'
      : consoleOffset === 'collapsed'
        ? 'bottom-44'
        : 'bottom-36';

  return (
    <div
      className={`absolute ${rightClass} z-10 overflow-hidden rounded-xl border border-white/60 bg-white/70 shadow-lg ring-1 ring-slate-900/5 backdrop-blur-xl transition-all duration-150 dark:border-slate-700/60 dark:bg-slate-900/70 ${bottomClass}`}
    >
      <svg
        ref={svgRef}
        width={MM_W}
        height={MM_H}
        className="block cursor-crosshair"
        onClick={handleClick}
        aria-label="Mini-map — click to pan"
      >
        <title>Mini-map — click to pan</title>
        {/* Component rects */}
        {components.map((c) => {
          const p = worldToMiniMap(c.x - COMP_W / 2, c.y - COMP_H / 2, bounds);
          return (
            <rect
              key={c.id}
              x={p.x}
              y={p.y}
              width={Math.max(2, COMP_W * scaleX)}
              height={Math.max(2, COMP_H * scaleY)}
              rx={1}
              fill="#3b82f6"
              fillOpacity={0.5}
            />
          );
        })}
        {/* Viewport indicator */}
        <rect
          x={vpTL.x}
          y={vpTL.y}
          width={Math.max(4, vpBR.x - vpTL.x)}
          height={Math.max(4, vpBR.y - vpTL.y)}
          rx={2}
          fill="none"
          stroke="#2563eb"
          strokeWidth={1}
          strokeOpacity={0.7}
        />
        <text x={4} y={MM_H - 4} fontSize={7} fill="#94a3b8" fontFamily="ui-monospace, monospace">
          mini-map
        </text>
      </svg>
    </div>
  );
}
