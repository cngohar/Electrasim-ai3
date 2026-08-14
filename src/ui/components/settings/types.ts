export type SettingsTab = 'editing' | 'display' | 'simulation' | 'about';

export const SETTINGS_TABS: ReadonlyArray<{
  id: SettingsTab;
  label: string;
  icon: string;
}> = [
  { id: 'editing', label: 'Editing', icon: '✏️' },
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'simulation', label: 'Simulation', icon: '⚡' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

export function isSettingsTab(value: string): value is SettingsTab {
  return SETTINGS_TABS.some((tab) => tab.id === value);
}
