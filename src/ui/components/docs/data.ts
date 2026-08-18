import {
  Cpu,
  Keyboard,
  Lightbulb,
  type LucideIcon,
  MousePointerClick,
  Shield,
  Zap,
} from 'lucide-react';
import { COMPONENT_DEFS, type ComponentDef } from '../../../domain';

export const SHORTCUTS: Array<[key: string, action: string]> = [
  ['V', 'Select tool — pick and move components'],
  ['W', 'Wire tool — click two ports to connect them'],
  ['R', 'Reroute — cycle TO → FROM → cancel on selected wire'],
  ['F', 'Zoom-to-fit — frame all components in the viewport'],
  ['Ctrl+E', 'Open Import / Export modal'],
  ['Ctrl+S', 'Quick-export circuit as JSON'],
  ['Ctrl+C', 'Copy selected component(s) to the in-memory clipboard'],
  ['Ctrl+V', 'Paste clipboard — each paste offsets by 24 px so copies stack visibly'],
  ['Delete', 'Delete selected component(s) or wire — multi-select deletes all at once'],
  ['Escape', 'Cancel placement / wire / close modal / deselect'],
  ['Ctrl+Z', 'Undo'],
  ['Ctrl+Shift+Z', 'Redo (or Ctrl+Y)'],
  ['Ctrl+K', 'Open the command palette'],
  ['?', 'Open the keyboard shortcuts overlay'],
];

export const DOCS_TOC: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'getting-started', label: 'Getting Started', icon: MousePointerClick },
  { id: 'components', label: 'Components Reference', icon: Cpu },
  { id: 'wiring', label: 'Wiring Guide', icon: Zap },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'simulation', label: 'Simulation & Faults', icon: Shield },
  { id: 'tips', label: 'Tips & Tricks', icon: Lightbulb },
];

export const CATEGORY_ORDER = [
  'supply',
  'protection',
  'distribution',
  'switch',
  'control',
  'relay',
  'contactor',
  'sensor',
  'thermostat',
  'timer',
  'transformer',
  'lighting',
  'fan',
  'load',
  'motor',
  'heater',
  'sounder',
  'socket',
  'junction',
];

export interface ComponentGroup {
  category: string;
  items: Array<{ type: string; definition: ComponentDef }>;
}

export function buildComponentGroups(): ComponentGroup[] {
  const groups = new Map<string, ComponentGroup>();
  for (const [type, definition] of Object.entries(COMPONENT_DEFS)) {
    const group = groups.get(definition.category) ?? {
      category: definition.category,
      items: [],
    };
    group.items.push({ type, definition });
    groups.set(definition.category, group);
  }
  return CATEGORY_ORDER.flatMap((category) => {
    const group = groups.get(category);
    return group ? [group] : [];
  });
}

export const TIPS = [
  'Use the search bar in the palette to quickly find components by name.',
  'Click the MCB breaker lever to access Settings, Import/Export, and bulk actions from one place.',
  'Ctrl+Z undoes almost everything — including wire creation, component placement, and deletion.',
  'Press F to zoom-to-fit — frames every component in the viewport with smart padding.',
  'Smart wiring (Settings → Wiring style → Smart) routes new wires around components automatically and re-routes them as you drag.',
  'Switch between Light, Dark, and System color schemes in Settings — the canvas re-themes instantly.',
  'Use "PDF / Print" in Import / Export to generate a printable circuit sheet with a title block.',
  'Share your circuit via URL — the entire state is compressed into the link, no account needed.',
  'Use the confirm-delete setting (in Settings) to prevent accidental deletions.',
  'On older laptops or for big circuits, enable Settings → Simulation visuals → Reduce visual effects to keep frame rates steady. It auto-enables above 50 components.',
  'Dark mode: open Settings → Display → Color scheme and pick Dark or System. Every panel — toolbar, palette, inspector, log, all modals — switches instantly.',
  'Multi-select: drag an empty area to rubber-band select components, or Shift-click to add/remove individual ones. Drag any selected component to move the whole group.',
  'Copy/paste: select one or more components, press Ctrl+C, then Ctrl+V. Each paste lands 24 px offset from the last so copies are visible. The clipboard is in-memory — it clears on page reload.',
  'Alignment toolbar: select 2+ components (drag-rect or Shift-click), then use the toolbar that appears at the top of the canvas to align or distribute them. Each action is one undo step.',
  'Gridless mode: go to Settings → Display and turn off “Show dot grid” for a clean, distraction-free canvas.',
  'Colour presets: Settings → Display → Canvas colour preset. Choose High Contrast or Colour-blind (deuteranopia) to replace the default red/green/blue wire palette with more accessible colours.',
  'Mini-map: the thumbnail in the bottom-right shows your whole circuit. Click anywhere on it to jump the canvas view to that area. Toggle it in Settings → Display.',
  'Custom wiring mode (Settings → Editing → Custom wiring mode): click a port to start a polyline, click empty canvas to add corners, then click the destination port to commit — each wire is one undo entry. Press Esc any time to cancel without leaving a partial wire.',
  'MCB: ElectraSim treats the breaker as a manually opened or closed Live path. Pro mode provides an educational overload estimate, not standards-compliant fault-current thresholds or trip timing.',
  'RCD / RCCB: connect both Live and Neutral in and out. The simulated control opens or closes both rails together, but does not measure leakage current, apply an mA threshold, or trip automatically.',
  'RCBO: use the separate Live and Neutral inputs and outputs for one circuit. Pro mode provides an educational overload estimate, but leakage and standards-compliant trip thresholds or timing are not modelled.',
  'Push Button: press and hold the centre control to close its normally-open contact, then release it to open the circuit. Normally-closed and latching contact modes are not modelled.',
  'Contactor: ElectraSim models a manually toggled two-pole power contact. It does not provide coil terminals, coil-control logic, interlocks, or auxiliary contacts.',
  'Timer Switch: place it in series on a Live line to simulate a timed or scheduled circuit. Toggle it manually during simulation to test ON/OFF states.',
  'Dimmer Switch: works like Fan Dimmer but is intended for lighting circuits. Connect it in the Live path between the supply and a bulb.',
  'Distribution Board: has two Live bus ports (L-in) and five output rails (L1–L3, N1–N2). Wire individual MCBs or loads to the output rails for a realistic consumer-unit layout.',
  'Bell / Buzzer: treated as a load — it energises when both Live and Neutral paths are complete. Use it with a push button for a doorbell circuit.',
];

export const FAULTS: Array<[name: string, description: string]> = [
  ['Short Circuit', 'Live and Neutral share a zero-impedance path.'],
  ['Reverse Polarity', 'A component has its Live and Neutral connections swapped.'],
  ['Earth Fault', 'A component is missing its required protective-earth connection.'],
  ['Open Circuit', 'An injected wire break interrupts the current path.'],
];
