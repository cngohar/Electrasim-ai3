/**
 * Central tool registry (master plan §28).
 *
 * Single source of truth for the hamburger menu, command palette, tool
 * switcher and the /tools/ hub. Adding a future tool means adding one entry
 * here — no navigation code changes (§29).
 */

export type ToolStatus = 'available' | 'coming-soon';

export interface ToolDefinition {
  id: string;
  name: string;
  /** Short label for the header switcher. */
  shortName: string;
  route: string;
  category: 'calculator';
  status: ToolStatus;
  /** One-line summary used by the hub, the palette and meta descriptions. */
  summary: string;
  /** Extra terms the command palette should match on. */
  keywords: string[];
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'voltage-drop',
    name: 'Voltage Drop Calculator',
    shortName: 'Voltage Drop',
    route: '/tools/voltage-drop-calculator/',
    category: 'calculator',
    status: 'available',
    summary:
      'See how cable length, current and conductor size change the voltage that actually reaches the load.',
    keywords: ['vdrop', 'volt drop', 'cable run', 'percentage drop', 'ohms law'],
  },
  {
    id: 'cable-size',
    name: 'Cable Size Calculator',
    shortName: 'Cable Size',
    route: '/tools/cable-size-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    summary: 'Find the smallest conductor that keeps voltage drop inside your chosen limit.',
    keywords: ['csa', 'conductor size', 'mm2', 'sizing'],
  },
  {
    id: 'power',
    name: 'Power Calculator',
    shortName: 'Power',
    route: '/tools/power-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    summary: 'Work between volts, amps, watts and resistance.',
    keywords: ['watts', 'kw', 'p=vi'],
  },
  {
    id: 'electrical-load',
    name: 'Electrical Load Calculator',
    shortName: 'Load',
    route: '/tools/electrical-load-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    summary: 'Add up connected load and estimate the demand on a circuit.',
    keywords: ['demand', 'diversity', 'consumer unit'],
  },
  {
    id: 'energy-cost',
    name: 'Energy Cost Calculator',
    shortName: 'Energy Cost',
    route: '/tools/energy-cost-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    summary: 'Turn power and running hours into a running cost.',
    keywords: ['kwh', 'tariff', 'bill', 'running cost'],
  },
];

/** Commands the palette and hamburger expose alongside the tools (§3.1, §4). */
export interface ToolCommand {
  id: string;
  label: string;
  action: 'navigate' | 'reset' | 'help' | 'settings';
  route?: string;
}

export const TOOL_COMMANDS: ToolCommand[] = [
  { id: 'toolbox-home', label: 'Toolbox Home', action: 'navigate', route: '/tools/' },
  { id: 'reset-tool', label: 'Reset Current Tool', action: 'reset' },
  { id: 'help', label: 'Help', action: 'help' },
  { id: 'settings', label: 'Settings', action: 'settings' },
];

export const getTool = (id: string) => TOOLS.find((t) => t.id === id);
export const availableTools = () => TOOLS.filter((t) => t.status === 'available');

/** Case-insensitive match over name, summary and keywords. */
export function searchTools(query: string): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((t) =>
    [t.name, t.shortName, t.summary, ...t.keywords].some((s) => s.toLowerCase().includes(q)),
  );
}
