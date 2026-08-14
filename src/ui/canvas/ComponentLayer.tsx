import type { MouseEvent, PointerEvent } from 'react';
import {
  COMPONENT_DEFS,
  COMP_H,
  COMP_W,
  checkFastCompatibility,
  type ComponentInstance,
  type SimulationResult,
} from '../../domain';
import { useSettingsStore, useUiStore } from '../../store';
import { getComponentIcon } from '../components/componentImages';
import type { CanvasTheme, PortLoc } from './types';

const PORT_R = 5;

interface ComponentLayerProps {
  components: readonly ComponentInstance[];
  componentsById: ReadonlyMap<string, ComponentInstance>;
  simulation?: SimulationResult | null;
  selectedId?: string | null;
  theme: CanvasTheme;
  wireMode: boolean;
  pendingFrom: PortLoc | null;
  customPathFrom: PortLoc | null;
  activeLoadEffects: boolean;
  reducedDetails: boolean;
  flaggedIds?: Set<string>;
  traceComponentIds?: Set<string> | null;
  onPointerDown: (component: ComponentInstance, event: PointerEvent<SVGGElement>) => void;
  onSelect?: (id: string | null) => void;
  onToggleSwitch?: (id: string) => void;
  onSetSwitchState?: (id: string, on: boolean) => void;
  onPortClick: (componentId: string, portIndex: number) => void;
  onHoverChange: (id: string | null) => void;
  onContextMenu: (id: string, event: MouseEvent<SVGGElement>) => void;
}

export function ComponentLayer({
  components,
  componentsById,
  simulation,
  selectedId,
  theme,
  wireMode,
  pendingFrom,
  customPathFrom,
  activeLoadEffects,
  reducedDetails,
  flaggedIds,
  traceComponentIds,
  onPointerDown,
  onSelect,
  onToggleSwitch,
  onSetSwitchState,
  onPortClick,
  onHoverChange,
  onContextMenu,
}: ComponentLayerProps) {
  return (
    <g>
      {components.map((component) => (
        <ComponentNode
          key={component.id}
          component={component}
          componentsById={componentsById}
          simulation={simulation}
          theme={theme}
          selected={selectedId === component.id}
          flagged={flaggedIds?.has(component.id)}
          energized={simulation?.energizedComponents.has(component.id) ?? false}
          error={simulation?.errorComponents.has(component.id) ?? false}
          wireMode={wireMode}
          pendingFrom={pendingFrom}
          customPathFrom={customPathFrom}
          activeLoadEffects={activeLoadEffects}
          reducedDetails={reducedDetails}
          traceComponentIds={traceComponentIds}
          onPointerDown={onPointerDown}
          onSelect={onSelect}
          onToggleSwitch={onToggleSwitch}
          onSetSwitchState={onSetSwitchState}
          onPortClick={onPortClick}
          onHoverChange={onHoverChange}
          onContextMenu={onContextMenu}
        />
      ))}
    </g>
  );
}

interface ComponentNodeProps {
  component: ComponentInstance;
  componentsById: ReadonlyMap<string, ComponentInstance>;
  simulation?: SimulationResult | null;
  theme: CanvasTheme;
  selected: boolean;
  flagged?: boolean;
  energized: boolean;
  error: boolean;
  wireMode: boolean;
  pendingFrom: PortLoc | null;
  customPathFrom: PortLoc | null;
  activeLoadEffects: boolean;
  reducedDetails: boolean;
  traceComponentIds?: Set<string> | null;
  onPointerDown: (component: ComponentInstance, event: PointerEvent<SVGGElement>) => void;
  onSelect?: (id: string | null) => void;
  onToggleSwitch?: (id: string) => void;
  onSetSwitchState?: (id: string, on: boolean) => void;
  onPortClick: (componentId: string, portIndex: number) => void;
  onHoverChange: (id: string | null) => void;
  onContextMenu: (id: string, event: MouseEvent<SVGGElement>) => void;
}

function ComponentNode({
  component,
  componentsById,
  simulation,
  theme,
  selected,
  flagged,
  energized,
  error,
  wireMode,
  pendingFrom,
  customPathFrom,
  activeLoadEffects,
  reducedDetails,
  traceComponentIds,
  onPointerDown,
  onSelect,
  onToggleSwitch,
  onSetSwitchState,
  onPortClick,
  onHoverChange,
  onContextMenu,
}: ComponentNodeProps) {
  const definition = COMPONENT_DEFS[component.type];
  if (!definition) return null;

  const isOn = component.state.on === true;
  const active = energized || (definition.isSwitch && (Boolean(definition.changeover) || isOn));
  const fault = component.state.fault;
  const faultColor =
    fault === 'short-circuit'
      ? '#ef4444'
      : fault === 'open-circuit'
        ? '#dc2626'
        : fault === 'reverse-polarity'
          ? '#f97316'
          : fault === 'earth-fault'
            ? '#eab308'
            : null;
  const stroke = faultColor
    ? faultColor
    : error
      ? '#ef4444'
      : selected
        ? theme.component.selectedRing
        : active
          ? theme.component.accent
          : theme.component.border;
  const x = component.x - COMP_W / 2;
  const y = component.y - COMP_H / 2;
  const rotation = (component.rotation ?? 0) % 360;

  const isBulbLike =
    component.type.includes('bulb') ||
    component.type.includes('light') ||
    component.type.includes('lamp') ||
    component.type === 'tube-light';

  const showBulbGlow = activeLoadEffects && energized && isBulbLike;
  const showFanSpin = activeLoadEffects && energized && component.type === 'ceiling-fan';
  const showMotorSpin = activeLoadEffects && energized && component.type === 'motor';
  const showBellPulse = activeLoadEffects && energized && component.type === 'bell';
  const changeoverPositionIndex = definition.changeover
    ? isOn
      ? definition.changeover.onPortIndex
      : definition.changeover.offPortIndex
    : null;
  const changeoverPosition =
    changeoverPositionIndex === null ? null : definition.ports[changeoverPositionIndex]?.label;

  const isDimmedByTrace = traceComponentIds != null && !traceComponentIds.has(component.id);
  const isHighlightedInTrace = Boolean(traceComponentIds?.has(component.id));

  const thermalOverlayEnabled = useUiStore((s) => s.thermalOverlayEnabled);
  const autoLabelsEnabled = useSettingsStore((s) => s.automaticComponentLabels);
  const compThermal = simulation?.thermalData?.[component.id];
  const powerW =
    compThermal?.powerWatts ??
    (energized
      ? (component.state.customPowerWatts ??
        (component.type.includes('motor') ? 750 : component.type.includes('bulb') ? 60 : 15))
      : 0);
  const tempC = compThermal?.temperature ?? (energized ? 25 + Math.min(85, powerW * 0.45) : 22);
  const thermalColor =
    compThermal?.colorCode ??
    (tempC >= 75 ? '#ef4444' : tempC >= 55 ? '#f97316' : tempC >= 40 ? '#eab308' : '#22c55e');

  return (
    <g
      data-component-id={component.id}
      data-render-detail={reducedDetails ? 'reduced' : 'full'}
      transform={`translate(${x} ${y}) rotate(${rotation} ${COMP_W / 2} ${COMP_H / 2})`}
      opacity={isDimmedByTrace ? 0.2 : 1}
      onPointerEnter={() => onHoverChange(component.id)}
      onPointerLeave={() => onHoverChange(null)}
      onContextMenu={(event) => onContextMenu(component.id, event)}
    >
      {thermalOverlayEnabled && (
        <g pointerEvents="none">
          <rect
            x={-6}
            y={-6}
            width={COMP_W + 12}
            height={COMP_H + 12}
            rx={14}
            fill={thermalColor}
            fillOpacity={0.22}
            stroke={thermalColor}
            strokeWidth={2}
            strokeDasharray={tempC > 65 ? '4 2' : undefined}
            className={tempC > 65 ? 'animate-pulse' : undefined}
          />
          <g transform={`translate(${COMP_W / 2}, ${COMP_H + 14})`}>
            <rect
              x={-30}
              y={-9}
              width={60}
              height={16}
              rx={8}
              fill="#0f172a"
              stroke={thermalColor}
              strokeWidth={1.2}
            />
            <text
              x={0}
              y={2.5}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="bold"
              fill={thermalColor}
            >
              {Math.round(tempC)}°C · {powerW < 10 ? powerW.toFixed(1) : Math.round(powerW)}W
            </text>
          </g>
        </g>
      )}
      {isHighlightedInTrace && (
        <rect
          x={-5}
          y={-5}
          width={COMP_W + 10}
          height={COMP_H + 10}
          rx={12}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          className="animate-pulse"
          pointerEvents="none"
        />
      )}
      {/* biome-ignore lint/a11y/useSemanticElements: SVG groups cannot contain HTML buttons. */}
      <g
        role="button"
        data-component-hitbox
        tabIndex={0}
        aria-label={`${definition.label} ${component.id}${selected ? ', selected' : ''}${
          definition.isSwitch
            ? definition.isMomentary
              ? `, ${isOn ? 'pressed' : 'released'}`
              : changeoverPosition
                ? `, position ${changeoverPosition}`
                : `, ${isOn ? 'on' : 'off'}`
            : ''
        }`}
        aria-pressed={definition.isSwitch && !definition.isMomentary ? isOn : undefined}
        style={{ cursor: wireMode ? 'crosshair' : 'grab' }}
        onPointerDown={(event) => onPointerDown(component, event)}
        onClick={(event) => {
          event.stopPropagation();
          if (!event.shiftKey) onSelect?.(component.id);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          if (definition.isSwitch && !definition.isMomentary) onToggleSwitch?.(component.id);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          event.stopPropagation();
          onSelect?.(component.id);
          if (definition.isSwitch && !definition.isMomentary) {
            onToggleSwitch?.(component.id);
          }
        }}
      >
        {flagged && (
          <rect
            x={-5}
            y={-5}
            width={COMP_W + 10}
            height={COMP_H + 10}
            rx={(theme.component.rounded || 8) + 4}
            ry={(theme.component.rounded || 8) + 4}
            fill="none"
            stroke="#ef4444"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            className="animate-pulse"
            pointerEvents="none"
          />
        )}
        <rect
          width={COMP_W}
          height={COMP_H}
          rx={theme.component.rounded}
          ry={theme.component.rounded}
          fill={theme.component.bg}
          stroke={stroke}
          strokeWidth={selected || error ? 2 : active ? 1.5 : 1}
        />
        {showMotorSpin && (
          <circle
            cx={COMP_W / 2}
            cy={COMP_H / 2}
            r={COMP_H / 2 - 4}
            fill={theme.component.accent}
            fillOpacity={0.18}
            pointerEvents="none"
            className="electrasim-motor-pulse"
          />
        )}
        {(active || error) && (
          <circle cx={COMP_W - 8} cy={8} r={3} fill={error ? '#ef4444' : theme.component.accent} />
        )}
        {fault && (
          <>
            <rect
              width={COMP_W}
              height={COMP_H}
              rx={theme.component.rounded}
              ry={theme.component.rounded}
              fill="none"
              stroke={faultColor ?? '#ef4444'}
              strokeWidth={2.5}
              strokeOpacity={0.6}
              strokeDasharray="4 3"
              pointerEvents="none"
            />
            <rect
              x={COMP_W - 20}
              y={-1}
              width={20}
              height={13}
              rx={4}
              fill={faultColor ?? '#ef4444'}
              pointerEvents="none"
            />
            <text
              x={COMP_W - 10}
              y={9}
              textAnchor="middle"
              fontSize="7"
              fontWeight="bold"
              fill="#fff"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {fault === 'open-circuit'
                ? '✂'
                : fault === 'short-circuit'
                  ? '⚡'
                  : fault === 'reverse-polarity'
                    ? '↔'
                    : '⚠'}
            </text>
          </>
        )}
        {definition.isSwitch && !error && (
          <circle
            cx={COMP_W - 8}
            cy={COMP_H - 8}
            r={3.5}
            fill={
              definition.changeover ? (isOn ? '#3b82f6' : '#f59e0b') : isOn ? '#22c55e' : '#ef4444'
            }
            stroke="#fff"
            strokeWidth={0.8}
          />
        )}
        {showBulbGlow &&
          (() => {
            const isCfl = component.type === 'bulb-cfl';
            const isFluorescent = component.type === 'tube-light';
            const isIncandescent = component.type === 'bulb-incandescent';
            const isHalogen = component.type === 'bulb-halogen';
            const isSmartRgb = component.type === 'bulb-smart-rgb';

            if (isCfl) {
              return (
                <g pointerEvents="none" className="electrasim-cfl-startup">
                  <circle cx={COMP_W / 2} cy={28} r={24} fill="#bae6fd" opacity={0.35} />
                  <circle cx={COMP_W / 2} cy={28} r={16} fill="#38bdf8" opacity={0.65} />
                  <circle cx={COMP_W / 2} cy={28} r={8} fill="#ffffff" opacity={0.9} />
                </g>
              );
            }
            if (isFluorescent) {
              return (
                <g pointerEvents="none" className="electrasim-fluorescent-startup">
                  <rect
                    x={10}
                    y={16}
                    width={COMP_W - 20}
                    height={24}
                    rx={6}
                    fill="#ecfeff"
                    opacity={0.4}
                  />
                  <rect
                    x={14}
                    y={20}
                    width={COMP_W - 28}
                    height={16}
                    rx={4}
                    fill="#67e8f9"
                    opacity={0.7}
                  />
                  <circle
                    cx={14}
                    cy={28}
                    r={3}
                    fill="#f97316"
                    opacity={0.85}
                    className="animate-ping"
                  />
                  <circle
                    cx={COMP_W - 14}
                    cy={28}
                    r={3}
                    fill="#f97316"
                    opacity={0.85}
                    className="animate-ping"
                  />
                </g>
              );
            }
            if (isIncandescent) {
              return (
                <g pointerEvents="none" className="electrasim-incandescent-startup">
                  <circle cx={COMP_W / 2} cy={28} r={26} fill="#ea580c" opacity={0.25} />
                  <circle cx={COMP_W / 2} cy={28} r={18} fill="#f97316" opacity={0.5} />
                  <circle cx={COMP_W / 2} cy={28} r={10} fill="#fef08a" opacity={0.85} />
                </g>
              );
            }
            if (isHalogen) {
              return (
                <g pointerEvents="none" className="electrasim-halogen-startup">
                  <circle cx={COMP_W / 2} cy={28} r={28} fill="#fed7aa" opacity={0.3} />
                  <circle cx={COMP_W / 2} cy={28} r={19} fill="#fde047" opacity={0.7} />
                  <circle cx={COMP_W / 2} cy={28} r={9} fill="#ffffff" opacity={0.95} />
                </g>
              );
            }
            if (isSmartRgb) {
              return (
                <g pointerEvents="none" className="electrasim-rgb-startup">
                  <circle cx={COMP_W / 2} cy={28} r={26} fill="#a855f7" opacity={0.3} />
                  <circle cx={COMP_W / 2} cy={28} r={17} fill="#06b6d4" opacity={0.55} />
                  <circle cx={COMP_W / 2} cy={28} r={9} fill="#f43f5e" opacity={0.85} />
                </g>
              );
            }
            return (
              <g pointerEvents="none" className="electrasim-led-startup">
                <circle cx={COMP_W / 2} cy={28} r={22} fill="#facc15" opacity={0.22} />
                <circle cx={COMP_W / 2} cy={28} r={14} fill="#fde047" opacity={0.6} />
                <circle cx={COMP_W / 2} cy={28} r={6} fill="#ffffff" opacity={0.9} />
              </g>
            );
          })()}
        {component.state.isBlown && (
          <g pointerEvents="none">
            <path
              d={`M${COMP_W / 2 - 22} 11l-5-7M${COMP_W / 2 + 22} 11l5-7M${COMP_W / 2} 8V0`}
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              className="electrasim-blown-sparks"
            />
            <g className="electrasim-blown-smoke">
              <circle cx={COMP_W / 2 - 8} cy={12} r={5} />
              <circle cx={COMP_W / 2 + 2} cy={8} r={6} />
              <circle cx={COMP_W / 2 + 11} cy={14} r={4} />
            </g>
            {(() => {
              const isProtectionDevice = Boolean(
                definition.isProtection ||
                  component.type.includes('mcb') ||
                  component.type.includes('rcd') ||
                  component.type.includes('fuse'),
              );
              const label = isProtectionDevice ? 'TRIPPED' : 'BLOWN';
              const icon = isProtectionDevice ? '⚡' : '💥';
              const badgeBg = isProtectionDevice ? '#d97706' : '#ef4444';
              const pulseColor = isProtectionDevice ? '#f59e0b' : '#ef4444';

              return (
                <>
                  <rect
                    width={COMP_W}
                    height={COMP_H}
                    rx={theme.component.rounded}
                    ry={theme.component.rounded}
                    fill="#18181b"
                    fillOpacity={0.88}
                    stroke={badgeBg}
                    strokeWidth={2}
                    className="electrasim-shattered-body"
                  />
                  <path
                    d={`M${COMP_W / 2} 10l-4 13 8 8-11 8 5 13M${COMP_W / 2} 31l-14-6M${COMP_W / 2} 31l14-7`}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeOpacity={0.75}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="electrasim-shattered-cracks"
                  />
                  <circle cx={COMP_W / 2} cy={COMP_H / 2} r={24} fill={pulseColor} opacity={0.35} />
                  <text
                    x={COMP_W / 2}
                    y={COMP_H / 2 + 7}
                    textAnchor="middle"
                    fontSize="24"
                    style={{ userSelect: 'none' }}
                  >
                    {icon}
                  </text>
                  <rect
                    x={COMP_W / 2 - 27}
                    y={-9}
                    width={54}
                    height={15}
                    rx={7.5}
                    fill={badgeBg}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                  <text
                    x={COMP_W / 2}
                    y={2}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#ffffff"
                    style={{ userSelect: 'none' }}
                  >
                    {label}
                  </text>
                </>
              );
            })()}
          </g>
        )}
        {reducedDetails ? (
          <text
            x={COMP_W / 2}
            y={COMP_H / 2 + 3}
            textAnchor="middle"
            fontSize="8"
            fontFamily={theme.monoFont ?? theme.font}
            fill={theme.component.text}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {definition.label}
          </text>
        ) : (
          <>
            <g transform={`translate(${COMP_W / 2 - 12} 16)`}>
              {getComponentIcon(component.type, definition.icon).startsWith(
                'data:image/svg+xml',
              ) ? (
                <image
                  href={getComponentIcon(component.type, definition.icon)}
                  width="24"
                  height="24"
                  preserveAspectRatio="xMidYMid meet"
                  className={
                    showFanSpin
                      ? 'electrasim-fan-spin'
                      : showMotorSpin
                        ? 'electrasim-motor-spin'
                        : showBellPulse
                          ? 'electrasim-bell-pulse'
                          : undefined
                  }
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="20"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                  className={
                    showFanSpin
                      ? 'electrasim-fan-spin'
                      : showMotorSpin
                        ? 'electrasim-motor-spin'
                        : showBellPulse
                          ? 'electrasim-bell-pulse'
                          : undefined
                  }
                >
                  {getComponentIcon(component.type, definition.icon)}
                </text>
              )}
            </g>
            <text
              x={COMP_W / 2}
              y={50}
              textAnchor="middle"
              fontSize="9"
              fontFamily={theme.monoFont ?? theme.font}
              fill={theme.component.text}
              style={{ userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.02em' }}
            >
              {autoLabelsEnabled && component.state.autoLabel
                ? `[${component.state.autoLabel}] ${definition.label}`
                : definition.label}
            </text>
            <text
              x={COMP_W / 2}
              y={62}
              textAnchor="middle"
              fontSize="7"
              fontFamily={theme.monoFont ?? theme.font}
              fill={theme.component.subtext}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {component.id}
            </text>
          </>
        )}
      </g>

      {definition.isMomentary && (
        // biome-ignore lint/a11y/useSemanticElements: SVG groups cannot contain HTML buttons.
        <g
          role="button"
          data-momentary-control={component.id}
          tabIndex={0}
          aria-label={`Press and hold ${definition.label} ${component.id}`}
          aria-pressed={isOn}
          style={{ cursor: 'pointer' }}
          onPointerDown={(event) => {
            if (event.button > 0) return;
            event.stopPropagation();
            event.currentTarget.setPointerCapture?.(event.pointerId);
            onSetSwitchState?.(component.id, true);
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            onSetSwitchState?.(component.id, false);
          }}
          onPointerCancel={(event) => {
            event.stopPropagation();
            onSetSwitchState?.(component.id, false);
          }}
          onLostPointerCapture={() => onSetSwitchState?.(component.id, false)}
          onClick={(event) => event.stopPropagation()}
          onBlur={() => onSetSwitchState?.(component.id, false)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) onSetSwitchState?.(component.id, true);
          }}
          onKeyUp={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            onSetSwitchState?.(component.id, false);
          }}
        >
          <rect
            x={29}
            y={5}
            width={42}
            height={34}
            rx={9}
            fill={isOn ? theme.component.accent : theme.component.bg}
            fillOpacity={isOn ? 0.2 : 0.01}
            stroke={isOn ? theme.component.accent : theme.component.border}
            strokeOpacity={isOn ? 0.85 : 0.35}
            strokeWidth={isOn ? 1.5 : 1}
          />
        </g>
      )}

      {definition.ports.map((port, portIndex) => {
        const activeSource = pendingFrom ?? customPathFrom;
        const pending =
          activeSource?.componentId === component.id && activeSource.portIndex === portIndex;
        const appMode = useSettingsStore.getState().appMode ?? 'basic';
        const compat =
          activeSource && !pending
            ? checkFastCompatibility(
                activeSource,
                { componentId: component.id, portIndex },
                componentsById as Map<string, ComponentInstance>,
                appMode,
              )
            : null;

        const isValid = compat?.status === 'valid';
        const isWarning = compat?.status === 'warning';
        const isInvalid = compat?.status === 'invalid';

        const showPortLabel = Boolean(definition.changeover && port.label && !reducedDetails);
        const isSelectedPosition = changeoverPositionIndex === portIndex;
        const labelInsideLeftEdge = port.relX === 0;

        let portStroke = theme.wire[port.type];
        let portStrokeWidth = 1.5;
        let portRadius = PORT_R;
        const portFill = pending ? theme.wire[port.type] : theme.port.bgIdle;

        if (pending) {
          portRadius = PORT_R + 2;
        } else if (isValid) {
          portStroke = '#22c55e';
          portStrokeWidth = 2.5;
          portRadius = PORT_R + 1;
        } else if (isWarning) {
          portStroke = '#f59e0b';
          portStrokeWidth = 2.5;
          portRadius = PORT_R + 1;
        } else if (isInvalid && activeSource) {
          portStroke = '#ef4444';
          portStrokeWidth = 1;
        }

        return (
          <g key={portIndex} opacity={activeSource && isInvalid && !pending ? 0.45 : 1}>
            {showPortLabel && (
              <text
                data-port-label={port.label}
                x={port.relX * COMP_W + (labelInsideLeftEdge ? 9 : -9)}
                y={port.relY * COMP_H + 2.5}
                textAnchor={labelInsideLeftEdge ? 'start' : 'end'}
                fontSize="7"
                fontWeight={isSelectedPosition ? 700 : 600}
                fontFamily={theme.monoFont ?? theme.font}
                fill={isSelectedPosition ? theme.component.accent : theme.component.subtext}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {port.label}
              </text>
            )}
            <circle
              data-port-index={portIndex}
              cx={port.relX * COMP_W}
              cy={port.relY * COMP_H}
              r={portRadius}
              fill={portFill}
              stroke={portStroke}
              strokeWidth={portStrokeWidth}
              tabIndex={0}
              role="button"
              aria-label={`${port.label ?? port.type} port on ${definition.label} ${component.id}${compat?.message ? ` (${compat.message})` : ''}`}
              style={{ cursor: 'crosshair' }}
              onPointerDown={(event) => {
                if (event.button === 0) event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onPortClick(component.id, portIndex);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                onPortClick(component.id, portIndex);
              }}
            >
              {compat?.message && <title>{compat.message}</title>}
            </circle>
          </g>
        );
      })}
    </g>
  );
}

interface ComponentTooltipProps {
  component: ComponentInstance | undefined;
  simulation: SimulationResult | null;
  pan: { x: number; y: number };
  zoom: number;
}

export function ComponentTooltip({ component, simulation, pan, zoom }: ComponentTooltipProps) {
  if (!component) return null;
  const definition = COMPONENT_DEFS[component.type];
  if (!definition) return null;
  const anchorX = pan.x + (component.x - COMP_W / 2) * zoom;
  const anchorY = pan.y + (component.y - COMP_H / 2) * zoom - 12;
  const energized = simulation?.energizedComponents.has(component.id) ?? false;
  const error = simulation?.errorComponents.has(component.id) ?? false;
  const isOn = component.state.on === true;
  const changeoverPosition = definition.changeover
    ? definition.ports[
        isOn ? definition.changeover.onPortIndex : definition.changeover.offPortIndex
      ]?.label
    : null;
  const lines = [
    `${definition.label}  ·  ${component.id}`,
    definition.isSwitch
      ? definition.isMomentary
        ? `Button: ${isOn ? 'pressed' : 'released'}`
        : changeoverPosition
          ? `Switch position: ${changeoverPosition}`
          : `Switch: ${isOn ? 'closed (on)' : 'open (off)'}`
      : '',
    error ? 'Status: fault' : energized ? 'Status: energised' : 'Status: idle',
    `Ports: ${definition.ports.map((port) => port.label ?? port.type).join(' · ')}`,
  ].filter(Boolean);
  const width = 200;
  const height = 16 + lines.length * 14;
  return (
    <g pointerEvents="none" transform={`translate(${anchorX} ${anchorY - height})`}>
      <rect width={width} height={height} rx={8} ry={8} fill="#0f172a" opacity={0.92} />
      {lines.map((line, index) => (
        <text
          key={line}
          x={10}
          y={16 + index * 14}
          fontSize={10}
          fill="#e2e8f0"
          fontFamily="ui-sans-serif, system-ui"
        >
          {line}
        </text>
      ))}
    </g>
  );
}
