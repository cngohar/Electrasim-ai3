/**
 * Component definitions — Fans and general-purpose loads (motor, bell, heaters, AC, hob, EV charger).
 *
 * Split verbatim from the former monolithic `components.ts`.
 * Entries are byte-identical; merge order in `./index.ts` preserves the
 * original registry ordering exactly.
 */

import type { ComponentDef } from '../types';

export const FAN_AND_LOAD_DEFS: Record<string, ComponentDef> = {
  'ceiling-fan': {
    label: 'Ceiling Fan (65W)',
    description: 'Multi-speed ceiling fan motor for ambient air circulation.',
    category: 'fan',
    isLoad: true,
    powerWatts: 65,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🌀',
  },

  'extractor-fan': {
    label: 'Bathroom Extractor Fan (25W)',
    description: 'Wall/ceiling extraction fan with timer overrun for bathroom moisture control.',
    category: 'fan',
    isLoad: true,
    powerWatts: 25,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🌀',
  },

  'industrial-exhaust-fan': {
    label: 'Industrial Exhaust Fan (250W)',
    description: 'High CFM commercial exhaust fan for kitchens and workshop ventilation.',
    category: 'fan',
    isLoad: true,
    tier: 'pro',
    powerWatts: 250,
    recommendedCableMm2: 1.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🌀',
  },

  'table-fan': {
    label: 'Portable Desk Fan (45W)',
    description: 'Small portable oscillating table fan.',
    category: 'fan',
    isLoad: true,
    powerWatts: 45,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🌀',
  },

  motor: {
    label: 'Electric Motor (750W / 1HP)',
    description: 'Single-phase AC induction motor driving mechanical pumps and machinery.',
    category: 'load',
    isLoad: true,
    powerWatts: 750,
    recommendedCableMm2: 1.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🛞',
  },

  bell: {
    label: 'Doorbell / Buzzer (15W)',
    description:
      'Electromechanical chime signaling unit. Shows a visual pulse when energised (does not play audio).',
    category: 'load',
    isLoad: true,
    powerWatts: 15,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🔔',
  },

  'water-heater': {
    label: 'Electric Water Heater (2.0kW)',
    description: 'Immersion water heater geyser element.',
    category: 'load',
    isLoad: true,
    powerWatts: 2000,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🚿',
  },

  'space-heater': {
    label: 'Convector Space Heater (2.0kW)',
    description: 'High-power resistive heating element for room heating.',
    category: 'load',
    isLoad: true,
    powerWatts: 2000,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🔥',
  },

  'air-conditioner': {
    label: 'Inverter Air Conditioner (1.5kW)',
    description: 'Split-system AC inverter compressor load.',
    category: 'load',
    isLoad: true,
    tier: 'pro',
    powerWatts: 1500,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '❄️',
  },

  'induction-hob': {
    label: 'Induction Cooktop (3.5kW)',
    description:
      'Magnetic induction heating cooktop requiring dedicated heavy-gauge radial wiring.',
    category: 'load',
    isLoad: true,
    tier: 'pro',
    powerWatts: 3500,
    recommendedCableMm2: 4.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🍳',
  },

  'ev-charger': {
    label: 'EV Charger Point (7.4kW)',
    description: 'Single-phase 32A Type 2 Smart Electric Vehicle charging station.',
    category: 'load',
    isLoad: true,
    tier: 'pro',
    powerWatts: 7400,
    recommendedCableMm2: 10.0,
    proNotes:
      'BS 7671 Section 722 — Dedicated 32A/40A Type B or A RCBO with PEN fault protection required.',
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '🚗',
  },
};
