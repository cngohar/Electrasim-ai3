/**
 * stress — dev-only utility for benchmarking the renderer + simulation.
 *
 * Generates a large synthetic circuit: live/neutral rails plus N "lamp
 * branches" (live → switch → bulb → neutral). Every branch is a closed
 * circuit, so the simulation does real work.
 *
 * Usage from the toolbar dev button: `seedStress(50)` adds ~150 components
 * + ~200 wires (each branch = 2 comps + 4 wires; rails added once).
 */

import { COMP_H, COMP_W, type ComponentInstance, type WireInstance } from '../domain';
import { useCircuitStore } from './circuitStore';

const WORLD_W = 1200;
const WORLD_H = 720;
const MARGIN = 40;

let stressSeq = 0;

function nextId(prefix: string): string {
  return `${prefix}-${(++stressSeq).toString(36)}-${Date.now().toString(36).slice(-3)}`;
}

/**
 * Append `branches` lamp branches to the current circuit. Returns counts
 * of components and wires actually added.
 */
export function seedStress(branches: number): { components: number; wires: number } {
  const store = useCircuitStore.getState();
  const existing = store.components;
  const components: ComponentInstance[] = [];
  const wires: WireInstance[] = [];

  // Reuse rails if they already exist; otherwise create them at top + bottom.
  let liveId = existing.find((c) => c.type === 'live-terminal')?.id;
  let neutralId = existing.find((c) => c.type === 'neutral-terminal')?.id;

  if (!liveId) {
    liveId = nextId('live');
    components.push({
      id: liveId,
      type: 'live-terminal',
      x: WORLD_W / 2,
      y: MARGIN + COMP_H / 2,
      state: {},
    });
  }
  if (!neutralId) {
    neutralId = nextId('neut');
    components.push({
      id: neutralId,
      type: 'neutral-terminal',
      x: WORLD_W / 2,
      y: WORLD_H - MARGIN - COMP_H / 2,
      state: {},
    });
  }

  // Lay out branches in a grid filling the world.
  const cols = Math.max(1, Math.floor((WORLD_W - 2 * MARGIN) / (COMP_W + 12)));
  const cellW = (WORLD_W - 2 * MARGIN) / cols;
  const rowH = (COMP_H + 16) * 2; // 2 rows per branch (switch above, bulb below)

  for (let i = 0; i < branches; i++) {
    const col = i % cols;
    const rowPair = Math.floor(i / cols);
    const cx = MARGIN + col * cellW + cellW / 2;
    const cyTop = MARGIN + COMP_H + 32 + rowPair * rowH;
    const cyBot = cyTop + COMP_H + 16;

    const switchId = nextId('sw');
    const bulbId = nextId('bulb');

    components.push({
      id: switchId,
      type: 'single-way-switch',
      x: cx,
      y: cyTop,
      state: { on: Math.random() > 0.5 },
    });
    components.push({
      id: bulbId,
      type: 'bulb',
      x: cx,
      y: cyBot,
      state: {},
    });

    // Rough wiring: live → switch.in, switch.out → bulb.l, bulb.n → neutral.
    // We don't validate ports here — components.ts uses port indices that
    // match this pattern for switch-1way (0=in, 1=out) and bulb (0=l, 1=n).
    wires.push({
      id: nextId('w'),
      fromComponentId: liveId,
      fromPortIndex: 0,
      toComponentId: switchId,
      toPortIndex: 0,
      controlPoints: [],
    });
    wires.push({
      id: nextId('w'),
      fromComponentId: switchId,
      fromPortIndex: 1,
      toComponentId: bulbId,
      toPortIndex: 0,
      controlPoints: [],
    });
    wires.push({
      id: nextId('w'),
      fromComponentId: bulbId,
      fromPortIndex: 1,
      toComponentId: neutralId,
      toPortIndex: 0,
      controlPoints: [],
    });
  }

  // Apply in one batched mutation by calling addComponent/addWire per item;
  // each call is O(1) on the Immer draft so the cumulative cost is fine.
  for (const c of components) store.addComponent(c);
  for (const w of wires) store.addWire(w);

  return { components: components.length, wires: wires.length };
}

/** Wipe everything and start fresh. */
export function clearAll() {
  const store = useCircuitStore.getState();
  // Iterate over a snapshot — addComponent etc. mutate.
  for (const w of [...store.wires]) store.removeWire(w.id);
  for (const c of [...store.components]) store.removeComponent(c.id);
}
