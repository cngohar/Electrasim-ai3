/**
 * Component definitions — Socket outlets (2-pin, 3-pin, double, USB, GFCI, industrial).
 *
 * Split verbatim from the former monolithic `components.ts`.
 * Entries are byte-identical; merge order in `./index.ts` preserves the
 * original registry ordering exactly.
 */

import type { ComponentDef } from '../types';

export const SOCKET_DEFS: Record<string, ComponentDef> = {
  'socket-2pin': {
    label: '2-Pin Un-earthed Socket',
    description: 'Basic 2-pole power outlet without protective earth connection.',
    category: 'socket',
    isSocket: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N' },
    ],
    icon: '⑊',
  },

  'socket-3pin': {
    label: 'Single 3-Pin Socket (13A)',
    description: 'Standard grounded BS 1363 single power socket with safety shutter.',
    category: 'socket',
    isSocket: true,
    powerWatts: 2990,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '⏚',
  },

  'double-socket': {
    label: 'Double 3-Pin Socket (13A Twin)',
    description: 'Twin 13A grounded socket outlet for domestic ring main or radial circuits.',
    category: 'socket',
    isSocket: true,
    powerWatts: 3120,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '🔌',
  },

  'socket-usb': {
    label: '3-Pin Socket + Dual USB',
    description: 'Grounded 13A wall socket with integrated 5V USB-A & USB-C fast charging ports.',
    category: 'socket',
    isSocket: true,
    tier: 'pro',
    powerWatts: 3000,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '🔌',
  },

  'socket-gfci': {
    label: 'GFCI / RCD Safety Outlet (20A)',
    description:
      'Ground Fault Circuit Interrupter outlet providing localized shock hazard protection.',
    category: 'socket',
    isSocket: true,
    tier: 'pro',
    powerWatts: 2400,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '🛡️',
  },

  'socket-industrial': {
    label: 'Industrial CEE Socket (32A)',
    description: 'Heavy-duty IP67 weather-proof industrial socket for high-power site equipment.',
    category: 'socket',
    isSocket: true,
    tier: 'pro',
    powerWatts: 7360,
    recommendedCableMm2: 6.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '🔌',
  },
};
