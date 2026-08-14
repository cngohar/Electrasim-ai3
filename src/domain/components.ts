/**
 * Component registry — the catalogue of every electrical component the editor
 * can place. Each entry is a pure data record (a `ComponentDef`) describing
 * the component's behavioural flags, its ports, and presentation hints.
 *
 * The registry is queried by:
 *   - the simulation engine (behavioural flags, port types)
 *   - the renderer (icon, port positions, grid size)
 *   - the palette UI (label, description, category)
 *
 * Adding a new component = add an entry here and ensure tests cover its
 * behavioural flags. No code changes elsewhere are needed.
 */

import type { ComponentDef } from './types';

// ─── Visual constants (component box, grid, port radius) ───────────────────

export const GRID_SIZE = 30;
export const COMP_W = 100;
export const COMP_H = 70;
export const PORT_RADIUS = 7;

// ─── The registry ──────────────────────────────────────────────────────────

export const COMPONENT_DEFS: Record<string, ComponentDef> = {
  // ─── SWITCHES & CONTROLS ────────────────────────────────────────────────
  'single-way-switch': {
    label: 'Single-way Switch',
    description: 'A standard on/off switch for controlling a single circuit or light.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    powerWatts: 0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🔌',
  },
  'two-way-switch': {
    label: 'Two-way Switch',
    description: 'Allows controlling a load from two different locations (SPDT switch).',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    changeover: {
      commonPortIndex: 0,
      onPortIndex: 1,
      offPortIndex: 2,
    },
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'COM' },
      { type: 'live', relX: 1, relY: 0.25, label: 'L1' },
      { type: 'live', relX: 1, relY: 0.75, label: 'L2' },
    ],
    icon: '🔀',
  },
  'intermediate-switch': {
    label: 'Intermediate Switch',
    description:
      '4-terminal switch used between two 2-way switches to control lights from 3+ locations.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    proNotes: 'BS 7671 — Crossover topology for multi-point corridor and stairwell lighting.',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L1-in' },
      { type: 'live', relX: 0, relY: 0.65, label: 'L2-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L1-out' },
      { type: 'live', relX: 1, relY: 0.65, label: 'L2-out' },
    ],
    icon: '🔀',
  },
  'double-pole-switch': {
    label: 'Double-Pole Switch (20A)',
    description:
      'Switches both Live and Neutral simultaneously for isolation of high-power appliances.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    powerWatts: 4600,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🔌',
  },
  'push-button': {
    label: 'Push Button',
    description:
      'Normally-open momentary switch (can be configured as normally-closed or latching). Closes contact only while held.',
    category: 'switch',
    isSwitch: true,
    isMomentary: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🔘',
  },

  'rotary-selector-switch': {
    label: 'Rotary Selector Switch',
    description: '3-position selector switch (OFF / AUTO / MANUAL) for industrial panels.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'COM' },
      { type: 'live', relX: 1, relY: 0.35, label: 'AUTO' },
      { type: 'live', relX: 1, relY: 0.65, label: 'MAN' },
    ],
    icon: '🎛️',
  },
  contactor: {
    label: 'Power Contactor (25A)',
    description:
      'Heavy-duty electromechanical switching relay for motors and heavy loads. Modeled without coil terminals, control coil logic, or auxiliary contacts.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '⚡',
  },

  'cooker-unit': {
    label: 'Cooker Control Unit (45A)',
    description:
      'High-power double-pole isolator switch with auxiliary socket for kitchen appliances.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    powerWatts: 7200,
    recommendedCableMm2: 6.0,
    proNotes: 'BS 7671 Reg 537.2 — Cooker switch must be located within 2 metres of appliance.',
    defaultOn: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🍳',
  },

  // ─── LIGHTING VARIANTS ─────────────────────────────────────────────────
  bulb: {
    label: 'LED Bulb (9W)',
    description: 'Energy-efficient LED light bulb with standard E27 screw base.',
    category: 'lighting',
    isLoad: true,
    powerWatts: 9,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
  },
  'bulb-incandescent': {
    label: 'Incandescent Bulb (60W)',
    description:
      'Traditional tungsten filament lamp with warm light and high resistive thermal load.',
    category: 'lighting',
    isLoad: true,
    powerWatts: 60,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
  },
  'bulb-halogen': {
    label: 'Halogen Lamp (42W)',
    description: 'High-brightness halogen lamp providing bright white illumination.',
    category: 'lighting',
    isLoad: true,
    powerWatts: 42,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
  },
  'bulb-cfl': {
    label: 'CFL Lamp (15W)',
    description: 'Compact Fluorescent Light lamp for commercial and residential lighting.',
    category: 'lighting',
    isLoad: true,
    powerWatts: 15,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
    bulbAnimationType: 'cfl', // Slow warm-up flicker
  },
  'bulb-smart-rgb': {
    label: 'Smart RGB LED Bulb (10W)',
    description: 'Color-tunable smart LED lamp for modern home automation.',
    category: 'lighting',
    isLoad: true,
    tier: 'pro',
    powerWatts: 10,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
    bulbAnimationType: 'led', // Instant on with soft fade
  },
  'led-downlight': {
    label: 'LED Downlight (12W)',
    description: 'Ceiling recessed LED spotlight fixture.',
    category: 'lighting',
    isLoad: true,
    powerWatts: 12,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
    bulbAnimationType: 'led', // Instant on with soft fade
  },
  'tube-light': {
    label: 'Fluorescent Tube (36W)',
    description: 'Linear T8 fluorescent tube batten light with electronic ballast.',
    category: 'lighting',
    isLoad: true,
    powerWatts: 36,
    recommendedCableMm2: 1.0,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '💡',
    bulbAnimationType: 'fluorescent', // Flickering start-up
  },

  // ─── PROTECTION VARIANTS ────────────────────────────────────────────────
  mcb: {
    label: 'MCB Type B (16A)',
    description:
      'Miniature Circuit Breaker Type B for domestic lighting and sockets. Pro mode provides an educational overload estimate, not standards-compliant fault-current thresholds or trip timing.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    maxAmps: 16,
    mcbType: 'B',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⚙️',
  },

  'mcb-type-c': {
    label: 'MCB Type C (32A)',
    description:
      'Type C breaker for motors, transformers, and inductive loads. Pro mode provides an educational overload estimate, not standards-compliant fault-current thresholds or trip timing.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    tier: 'pro',
    maxAmps: 32,
    mcbType: 'C',
    proNotes: 'BS 7671 Reg 433.1 — Type C curve accommodates motor inrush currents.',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⚙️',
  },
  'mcb-type-d': {
    label: 'MCB Type D (63A)',
    description:
      'Type D breaker for heavy industrial loads with high inrush current. Pro mode provides an educational overload estimate, not standards-compliant fault-current thresholds or trip timing.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    tier: 'pro',
    maxAmps: 63,
    mcbType: 'D',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⚙️',
  },
  mccb: {
    label: 'MCCB Breaker (100A)',
    description:
      'Molded Case Circuit Breaker for high-current main distribution and heavy industrial sub-mains.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    tier: 'pro',
    maxAmps: 100,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⚙️',
  },
  rcd: {
    label: 'RCD / RCCB (80A 30mA)',
    description:
      'Residual Current Device represented as a two-pole manual control. The simulator does not calculate leakage current, mA trip thresholds, or trip timing.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    maxAmps: 80,
    ratedLeakage_mA: 30,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🛡️',
  },
  rcbo: {
    label: 'RCBO (32A 30mA)',
    description:
      'Combined overcurrent and residual-current device. Pro mode provides an educational overload estimate, but does not calculate leakage or standards-compliant trip thresholds and timing.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    maxAmps: 32,
    mcbType: 'B',
    ratedLeakage_mA: 30,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🛡️',
  },
  fuse: {
    label: 'Cartridge Fuse (13A)',
    description:
      'BS 1362 ceramic cartridge fuse that melts and opens circuit upon severe overcurrent.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    maxAmps: 13,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🧨',
  },
  spd: {
    label: 'Surge Protector (SPD Type 2)',
    description:
      'Surge Protection Device safeguarding electronic equipment from lightning and switching transients.',
    category: 'protection',
    isPassThrough: true,
    isProtection: true,
    tier: 'pro',
    proNotes: 'BS 7671 Section 443 — Mandatory SPD installation for risk assessment protection.',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'earth', relX: 0.5, relY: 1.0, label: 'PE' },
    ],
    icon: '🛡️',
  },
  'distribution-board': {
    label: 'Distribution Board (Consumer Unit)',
    description:
      'Main consumer unit panel distributing incoming supply to multiple individual sub-circuits.',
    category: 'protection',
    isPassThrough: true,
    isJunction: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.75, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.17, label: 'L1' },
      { type: 'live', relX: 1, relY: 0.34, label: 'L2' },
      { type: 'live', relX: 1, relY: 0.51, label: 'L3' },
      { type: 'neutral', relX: 1, relY: 0.68, label: 'N1' },
      { type: 'neutral', relX: 1, relY: 0.83, label: 'N2' },
    ],
    icon: '🗄️',
  },
  'fused-spur': {
    label: 'Fused Connection Unit (FCU 13A)',
    description: 'Switched FCU with BS 1362 fuse for local protection of fixed appliances.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    tier: 'pro',
    powerWatts: 3000,
    recommendedCableMm2: 2.5,
    defaultOn: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🎛️',
  },

  // ─── SOCKET / OUTLET VARIANTS ──────────────────────────────────────────
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

  // ─── FAN / VENTILATION VARIANTS ───────────────────────────────────────
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

  // ─── LOADS & APPLIANCES VARIANTS ──────────────────────────────────────
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

  // ─── CONTROL & AUTOMATION VARIANTS ─────────────────────────────────────
  'fan-dimmer': {
    label: 'Rotary Fan Speed Regulator',
    description: 'Capacitive / triac speed controller for ceiling and exhaust fans.',
    category: 'control',
    isSwitch: true,
    isPassThrough: true,
    isDimmer: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🎛️',
  },
  'dimmer-switch': {
    label: 'Light Dimmer Switch (400W)',
    description: 'Trailing-edge digital light dimmer for dimmable LED and incandescent lamps.',
    category: 'control',
    isSwitch: true,
    isPassThrough: true,
    isDimmer: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🔆',
  },
  'pir-sensor': {
    label: 'PIR Motion Sensor',
    description: 'Infrared motion sensor switch for security lighting and common areas.',
    category: 'control',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    powerWatts: 5,
    recommendedCableMm2: 1.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '👁️',
  },
  thermostat: {
    label: 'Digital Room Thermostat',
    description:
      'Temperature-sensitive relay contact for controlling heating boilers and AC pumps.',
    category: 'control',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🌡️',
  },
  'photocell-sensor': {
    label: 'Dusk-to-Dawn Photocell',
    description: 'Light sensor that switches outdoor lighting automatically at sunset.',
    category: 'control',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🌅',
  },
  'smart-relay': {
    label: 'Smart WiFi Relay Module',
    description: 'Micro smart relay module compatible with app and voice assistant control.',
    category: 'control',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '📻',
  },

  // ─── POWER SUPPLY VARIANTS ─────────────────────────────────────────────
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

  // ─── JUNCTION VARIANTS ─────────────────────────────────────────────────
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

  // ─── TIMER VARIANTS ────────────────────────────────────────────────────
  'timer-switch': {
    label: 'Mechanical 24h Pin Timer',
    description: '24-hour dial time switch for automatic scheduled switching.',
    category: 'timer',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⏲️',
  },
  'digital-weekly-timer': {
    label: 'Digital 7-Day Programmable Timer',
    description: 'LCD weekly programmable timer with multiple daily ON/OFF schedule settings.',
    category: 'timer',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⏱️',
  },
  'staircase-timer': {
    label: 'Staircase Delay Timer (30s-10m)',
    description:
      'DIN-rail mounted delay timer automatically turning off stairwell or hallway lights after a set interval.',
    category: 'timer',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⏳',
  },
  'countdown-timer': {
    label: 'Digital Countdown Timer Switch',
    description: 'Preset interval timer switch (5m, 15m, 30m, 60m) for ventilation and heaters.',
    category: 'timer',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '⏱️',
  },
  'delay-timer': {
    label: 'Time Delay Relay (On/Off Delay)',
    description:
      'DIN-rail mounted electronic time delay relay for staggered motor startup and control.',
    category: 'timer',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'A1' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'A2' },
      { type: 'live', relX: 1, relY: 0.35, label: '15-COM' },
      { type: 'live', relX: 1, relY: 0.65, label: '18-NO' },
    ],
    icon: '⏳',
  },

  // ─── SWITCH VARIANTS ───
  'double-gang-switch': {
    label: '2-Gang 1-Way Switch',
    description: 'Dual independent rocker switch controlling two separate lighting circuits.',
    category: 'switch',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L1-out' },
      { type: 'live', relX: 1, relY: 0.65, label: 'L2-out' },
    ],
    icon: '🔘',
  },

  // ─── SOCKET VARIANTS ───
  'switched-socket': {
    label: 'Single Switched Socket (13A)',
    description: 'Standard 13A wall socket with integrated ON/OFF rocker switch.',
    category: 'socket',
    isSocket: true,
    isSwitch: true,
    defaultOn: true,
    powerWatts: 2990,
    recommendedCableMm2: 2.5,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.5, label: 'N' },
      { type: 'earth', relX: 0, relY: 0.75, label: 'E' },
    ],
    icon: '🔌',
  },

  // ─── PROTECTION VARIANTS ───
  'isolator-switch': {
    label: 'Rotary Isolator Switch (100A)',
    description:
      'High-current double-pole rotary main isolation switch for safely disconnecting mains power.',
    category: 'protection',
    isSwitch: true,
    isPassThrough: true,
    isProtection: true,
    defaultOn: true,
    tier: 'pro',
    maxAmps: 100,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🛡️',
  },

  // ─── TRANSFORMER VARIANTS ───
  'transformer-8v': {
    label: 'Doorbell Transformer (230V -> 8V AC)',
    description: 'Step-down safety isolating transformer for doorbells and low-voltage chimes.',
    category: 'transformer',
    isPassThrough: true,
    powerWatts: 15,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-230V' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-230V' },
      { type: 'live', relX: 1, relY: 0.35, label: '8V-A' },
      { type: 'neutral', relX: 1, relY: 0.65, label: '8V-B' },
    ],
    icon: '⚡',
  },
  'transformer-12v': {
    label: 'Low Voltage Transformer (230V -> 12V)',
    description:
      'Step-down power transformer for 12V halogen/LED lighting and electronic controls.',
    category: 'transformer',
    isPassThrough: true,
    powerWatts: 60,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-230V' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-230V' },
      { type: 'live', relX: 1, relY: 0.35, label: '12V+' },
      { type: 'neutral', relX: 1, relY: 0.65, label: '12V-' },
    ],
    icon: '⚡',
  },
  'transformer-24v': {
    label: 'Industrial Control Transformer (230V -> 24V)',
    description:
      'Heavy-duty 24V AC/DC control circuit transformer for relays, contactors, and automation.',
    category: 'transformer',
    isPassThrough: true,
    tier: 'pro',
    powerWatts: 100,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-230V' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-230V' },
      { type: 'live', relX: 1, relY: 0.35, label: '24V+' },
      { type: 'neutral', relX: 1, relY: 0.65, label: '24V-' },
    ],
    icon: '⚡',
  },
  'step-up-down-transformer': {
    label: 'Step-Up / Step-Down Transformer (110V <-> 230V)',
    description:
      'Bi-directional auto-transformer converting between 110V US and 230V UK/EU voltage levels.',
    category: 'transformer',
    isPassThrough: true,
    tier: 'pro',
    powerWatts: 1500,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'In-L' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'In-N' },
      { type: 'live', relX: 1, relY: 0.35, label: 'Out-L' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'Out-N' },
    ],
    icon: '⚡',
  },

  // ─── RELAY VARIANTS ───
  'relay-spst': {
    label: 'SPST Power Relay',
    description: 'Single Pole Single Throw electromechanical relay with coil drive and NO contact.',
    category: 'relay',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'Coil+' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'Coil-' },
      { type: 'live', relX: 1, relY: 0.35, label: 'COM' },
      { type: 'live', relX: 1, relY: 0.65, label: 'NO' },
    ],
    icon: '🔧',
  },
  'relay-spdt': {
    label: 'SPDT Changeover Relay',
    description: 'Single Pole Double Throw relay switching COM terminal between NO and NC outputs.',
    category: 'relay',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'Coil+' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'Coil-' },
      { type: 'live', relX: 1, relY: 0.25, label: 'COM' },
      { type: 'live', relX: 1, relY: 0.5, label: 'NO' },
      { type: 'live', relX: 1, relY: 0.75, label: 'NC' },
    ],
    icon: '🔧',
  },
  'relay-dpdt': {
    label: 'DPDT Power Relay',
    description:
      'Double Pole Double Throw relay simultaneously controlling two isolated changeover circuits.',
    category: 'relay',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'Coil+' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'Coil-' },
      { type: 'live', relX: 1, relY: 0.2, label: 'C1' },
      { type: 'live', relX: 1, relY: 0.4, label: 'NO1' },
      { type: 'live', relX: 1, relY: 0.6, label: 'C2' },
      { type: 'live', relX: 1, relY: 0.8, label: 'NO2' },
    ],
    icon: '🔧',
  },
  'control-relay': {
    label: 'Industrial 8-Pin Control Relay',
    description:
      'Octal 8-pin plug-in control relay with LED status indicator for panel automation.',
    category: 'relay',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'A1' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'A2' },
      { type: 'live', relX: 1, relY: 0.25, label: '11-COM' },
      { type: 'live', relX: 1, relY: 0.5, label: '14-NO' },
      { type: 'live', relX: 1, relY: 0.75, label: '12-NC' },
    ],
    icon: '🔧',
  },

  // ─── CONTACTOR VARIANTS ───
  'contactor-1p': {
    label: 'Single-Pole Contactor (1P 25A)',
    description: '1-Pole AC contactor for switching single-phase heating or lighting loads.',
    category: 'contactor',
    isSwitch: true,
    isPassThrough: true,
    maxAmps: 25,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'live', relX: 0.5, relY: 0, label: 'A1' },
      { type: 'neutral', relX: 0.5, relY: 1, label: 'A2' },
    ],
    icon: '🔩',
  },
  'contactor-2p': {
    label: 'Double-Pole Contactor (2P 25A)',
    description: '2-Pole AC power contactor switching both Live and Neutral simultaneously.',
    category: 'contactor',
    isSwitch: true,
    isPassThrough: true,
    maxAmps: 25,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'L-out' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'N-out' },
    ],
    icon: '🔩',
  },
  'contactor-3p': {
    label: 'Three-Pole Contactor (3P 40A)',
    description:
      'Heavy-duty 3-pole contactor for 3-phase motor starters and heavy inductive loads.',
    category: 'contactor',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    maxAmps: 40,
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'L1' },
      { type: 'live', relX: 0, relY: 0.5, label: 'L2' },
      { type: 'live', relX: 0, relY: 0.75, label: 'L3' },
      { type: 'live', relX: 1, relY: 0.25, label: 'T1' },
      { type: 'live', relX: 1, relY: 0.5, label: 'T2' },
      { type: 'live', relX: 1, relY: 0.75, label: 'T3' },
    ],
    icon: '🔩',
  },
  'contactor-4p': {
    label: 'Four-Pole Contactor (4P 63A)',
    description:
      '4-Pole power contactor for 3-phase + neutral mains changeover and generator transfer.',
    category: 'contactor',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    maxAmps: 63,
    ports: [
      { type: 'live', relX: 0, relY: 0.2, label: 'L1' },
      { type: 'live', relX: 0, relY: 0.4, label: 'L2' },
      { type: 'live', relX: 0, relY: 0.6, label: 'L3' },
      { type: 'neutral', relX: 0, relY: 0.8, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.2, label: 'T1' },
      { type: 'live', relX: 1, relY: 0.4, label: 'T2' },
      { type: 'live', relX: 1, relY: 0.6, label: 'T3' },
      { type: 'neutral', relX: 1, relY: 0.8, label: 'N-out' },
    ],
    icon: '🔩',
  },

  // ─── THERMOSTAT VARIANTS ───
  'room-thermostat': {
    label: 'Mechanical Room Thermostat',
    description: 'Bimetallic dial room thermostat for simple ambient heating control.',
    category: 'thermostat',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L-in' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L-out' },
    ],
    icon: '🌡️',
  },
  'heating-thermostat': {
    label: 'Underfloor Heating Thermostat',
    description: 'Programmable floor temperature sensor thermostat for radiant heating mats.',
    category: 'thermostat',
    isSwitch: true,
    isPassThrough: true,
    tier: 'pro',
    powerWatts: 3000,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.35, label: 'Load-L' },
      { type: 'neutral', relX: 1, relY: 0.65, label: 'Load-N' },
    ],
    icon: '🌡️',
  },

  // ─── SENSOR VARIANTS ───
  'temperature-sensor': {
    label: 'NTC Temperature Sensor Probe',
    description: 'Precision temperature sensor transmitting analog thermal resistance signals.',
    category: 'sensor',
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'T1' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'T2' },
    ],
    icon: '👁️',
  },
  'door-sensor': {
    label: 'Magnetic Door / Window Contact',
    description: 'Reed switch contact sensor detecting door opening for security and lighting.',
    category: 'sensor',
    isSwitch: true,
    isPassThrough: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'C1' },
      { type: 'live', relX: 1, relY: 0.5, label: 'C2' },
    ],
    icon: '👁️',
  },

  // ─── SOUNDER VARIANTS ───
  'electric-buzzer': {
    label: 'Panel Electric Buzzer (90dB)',
    description: 'High-pitch continuous acoustic warning buzzer for control panels.',
    category: 'sounder',
    isLoad: true,
    powerWatts: 5,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🔔',
  },
  'wireless-doorbell': {
    label: 'Wireless Doorbell Chime Receiver',
    description: 'Mains plug-in wireless doorbell chime unit with selectable ringtones.',
    category: 'sounder',
    isLoad: true,
    powerWatts: 8,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🔔',
  },
  'alarm-siren': {
    label: 'High-Output Security Alarm Siren',
    description: 'Dual-tone 110dB emergency acoustic alarm siren.',
    category: 'sounder',
    isLoad: true,
    powerWatts: 25,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🔔',
  },

  // ─── MOTOR VARIANTS ───
  'motor-3phase': {
    label: '3-Phase AC Induction Motor (3kW / 4HP)',
    description: 'Heavy industrial 3-phase asynchronous squirrel-cage motor for machinery.',
    category: 'motor',
    isLoad: true,
    powerWatts: 3000,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.25, label: 'U' },
      { type: 'live', relX: 0, relY: 0.5, label: 'V' },
      { type: 'live', relX: 0, relY: 0.75, label: 'W' },
      { type: 'earth', relX: 1, relY: 0.5, label: 'PE' },
    ],
    icon: '🌀',
  },
  'water-pump': {
    label: 'Electric Water Pump (1.1kW / 1.5HP)',
    description: 'Centrifugal motor pump for domestic water supply and drainage.',
    category: 'motor',
    isLoad: true,
    powerWatts: 1100,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N' },
      { type: 'earth', relX: 1, relY: 0.5, label: 'PE' },
    ],
    icon: '🌀',
  },

  // ─── HEATER VARIANTS ───
  'heating-element': {
    label: 'Tubular Resistance Heating Element (1.5kW)',
    description: 'Direct heating element for industrial ovens and water heating.',
    category: 'heater',
    isLoad: true,
    powerWatts: 1500,
    ports: [
      { type: 'live', relX: 0, relY: 0.5, label: 'L' },
      { type: 'neutral', relX: 1, relY: 0.5, label: 'N' },
    ],
    icon: '🔥',
  },

  // ─── DISTRIBUTION VARIANTS ───
  'distribution-box': {
    label: '1-Phase Sub-Distribution Box (8-Way)',
    description: 'Compact single-phase 8-way consumer unit enclosure for room sub-circuits.',
    category: 'distribution',
    isPassThrough: true,
    isJunction: true,
    ports: [
      { type: 'live', relX: 0, relY: 0.35, label: 'L-in' },
      { type: 'neutral', relX: 0, relY: 0.65, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.25, label: 'L1' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L2' },
      { type: 'neutral', relX: 1, relY: 0.75, label: 'N1' },
    ],
    icon: '📦',
  },
  'distribution-board-3phase': {
    label: '3-Phase TPN Distribution Board',
    description: 'Industrial 3-Phase, Neutral and Earth (TP&N) main distribution unit.',
    category: 'distribution',
    isPassThrough: true,
    isJunction: true,
    tier: 'pro',
    ports: [
      { type: 'live', relX: 0, relY: 0.2, label: 'L1-in' },
      { type: 'live', relX: 0, relY: 0.4, label: 'L2-in' },
      { type: 'live', relX: 0, relY: 0.6, label: 'L3-in' },
      { type: 'neutral', relX: 0, relY: 0.8, label: 'N-in' },
      { type: 'live', relX: 1, relY: 0.25, label: 'L1-out' },
      { type: 'live', relX: 1, relY: 0.5, label: 'L2-out' },
      { type: 'live', relX: 1, relY: 0.75, label: 'L3-out' },
    ],
    icon: '📦',
  },
};

/** Convenience: get a def or throw a descriptive error. */
export const getDef = (
  type: string,
  registry: Record<string, ComponentDef> = COMPONENT_DEFS,
): ComponentDef => {
  const def = registry[type];
  if (!def) {
    throw new Error(`Unknown component type "${type}". Did you register it in COMPONENT_DEFS?`);
  }
  return def;
};
