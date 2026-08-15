/**
 * Component definitions — Supply terminals & sources, plus junction accessories.
 *
 * Split verbatim from the former monolithic `components.ts`.
 * Entries are byte-identical; merge order in `./index.ts` preserves the
 * original registry ordering exactly.
 */

import type { ComponentDef } from '../types';

export const SUPPLY_AND_JUNCTION_DEFS: Record<string, ComponentDef> = {
  'live-terminal': {
    label: 'Live Terminal (L)',
    description: 'Single-phase live supply terminal rail.',
    category: 'supply',
    isSource: true,
    sourceType: 'live',
    ports: [{ type: 'live', relX: 1, relY: 0.5, label: 'L-out' }],
    icon: '🔴',
  },

  'neutral-terminal': {
    label: 'Neutral Terminal (N)',
    description: 'Single-phase neutral return terminal rail.',
    category: 'supply',
    isSource: true,
    sourceType: 'neutral',
    ports: [{ type: 'neutral', relX: 1, relY: 0.5, label: 'N-out' }],
    icon: '🔵',
  },

  'earth-terminal': {
    label: 'Earth Ground (PE)',
    description: 'Safety protective earth ground terminal rail.',
    category: 'supply',
    isSource: true,
    sourceType: 'earth',
    ports: [{ type: 'earth', relX: 1, relY: 0.5, label: 'PE-out' }],
    icon: '🟢',
  },

  'ac-mains-supply': {
    label: '230V AC Mains Supply Block',
    description:
      'Combined 230V AC single-phase supply block featuring Live, Neutral, and Earth terminals.',
    category: 'supply',
    isSource: true,
    sourceType: 'live',
    ports: [
      { type: 'live', relX: 1, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 1, relY: 0.75, label: 'PE' },
    ],
    icon: '⚡',
  },

  'dc-battery-12v': {
    label: '12V DC Deep Cycle Battery',
    description: '12 Volt Direct Current battery storage unit for solar or marine DC circuits.',
    category: 'supply',
    isSource: true,
    sourceType: 'live',
    tier: 'pro',
    ports: [
      { type: 'live', relX: 1, relY: 0.35, label: '+12V' },
      { type: 'neutral', relX: 1, relY: 0.65, label: '0V' },
    ],
    icon: '🔋',
  },

  'solar-pv-panel': {
    label: 'Solar PV Array (400W DC)',
    description: 'Photovoltaic solar array generating DC current under ambient sunlight.',
    category: 'supply',
    isSource: true,
    sourceType: 'live',
    tier: 'pro',
    ports: [
      { type: 'live', relX: 1, relY: 0.35, label: 'DC+' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'DC-' },
    ],
    icon: '☀️',
  },

  'diesel-generator': {
    label: 'Standby Diesel Generator (5kVA)',
    description: 'Backup diesel generator supply delivering 230V AC emergency power.',
    category: 'supply',
    isSource: true,
    sourceType: 'live',
    tier: 'pro',
    ports: [
      { type: 'live', relX: 1, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 1, relY: 0.75, label: 'PE' },
    ],
    icon: '🏭',
  },

  'junction-box': {
    label: 'Junction Box (4-Way)',
    description: 'Circular junction box splitting live wiring into multiple branch outputs.',
    category: 'junction',
    isPassThrough: true,
    isJunction: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.25, label: 'L-out1' },
      { type: 'live', relX: 1, relY: 0.75, label: 'L-out2' },
      { type: 'live', relX: 0.5, relY: 1, label: 'L-out3' },
    ],
    icon: '🔲',
  },

  'terminal-strip': {
    label: 'Terminal Strip Block',
    description: 'Barrier screw terminal connector strip for neat multi-wire distribution.',
    category: 'junction',
    isPassThrough: true,
    isJunction: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'In1' },
      { type: 'live', relX: 0, relY: 0.65, label: 'In2' },
      { type: 'live', relX: 1, relY: 0.35, label: 'Out1' },
      { type: 'live', relX: 1, relY: 0.65, label: 'Out2' },
    ],
    icon: '🔲',
  },

  'wago-connector': {
    label: 'Wago 221 Lever Connector (3-Way)',
    description: 'Compact 3-conductor quick lever-nut wire connector.',
    category: 'junction',
    isPassThrough: true,
    isJunction: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'In' },
      { type: 'live', relX: 1, relY: 0.35, label: 'Out1' },
      { type: 'live', relX: 1, relY: 0.65, label: 'Out2' },
    ],
    icon: '🔲',
  },
};
