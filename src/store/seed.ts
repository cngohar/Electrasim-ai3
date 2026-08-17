/**
 * Seed circuit — initial state for the editor on first load.
 *
 * Built using real domain primitives (`ComponentInstance`, `WireInstance`)
 * so the simulation engine and the renderer see the exact same shapes that
 * a user-drawn circuit would produce. Replaces the legacy `sampleCircuit.ts`
 * mockup format.
 *
 * The layout is tuned for the 1200×720 logical canvas used by `CircuitCanvas`
 * with the domain `COMP_W=100` / `COMP_H=70` boxes.
 */

import type { Circuit, ComponentInstance, WireInstance } from '../domain';
import { COMPONENT_DEFS } from '../domain';

let nextId = 0;
const uid = (prefix: string) => `${prefix}${++nextId}`;

const C = (
  type: string,
  x: number,
  y: number,
  state: ComponentInstance['state'] = {},
): ComponentInstance => {
  if (!COMPONENT_DEFS[type]) throw new Error(`seed: unknown type "${type}"`);
  return { id: uid(`${type.split('-')[0]}-`), type, x, y, state };
};

const W = (
  from: { c: ComponentInstance; p: number },
  to: { c: ComponentInstance; p: number },
): WireInstance => ({
  id: uid('w-'),
  fromComponentId: from.c.id,
  fromPortIndex: from.p,
  toComponentId: to.c.id,
  toPortIndex: to.p,
  controlPoints: [],
});

export function buildSeedCircuit(socketTypeArg = 'socket-3pin'): Circuit {
  const socketType = COMPONENT_DEFS[socketTypeArg] ? socketTypeArg : 'socket-3pin';
  // Deterministic ids: reset the module counter so every call produces the
  // same component/wire ids. This lets callers rebuild an identical seed
  // (e.g. swapping the demo socket for a region) and compare by id.
  nextId = 0;
  // ── Supply rail (left column) ─────────────────────────────────────────
  const live = C('live-terminal', 110, 150);
  const neutral = C('neutral-terminal', 110, 380);
  const earth = C('earth-terminal', 110, 610);

  // ── Protection ───────────────────────────────────────────────────────
  const mcb = C('mcb', 290, 150, { on: true });
  const fuse = C('fuse', 290, 610, { on: true });

  // ── Junction split ───────────────────────────────────────────────────
  const jb = C('junction-box', 470, 150);

  // ── Branch 1: staircase (two 2-way switches → bulb) ──────────────────
  const sw1 = C('two-way-switch', 670, 90, { on: true });
  const sw2 = C('two-way-switch', 850, 90, { on: true });
  const bulb1 = C('bulb', 1030, 90);

  // ── Branch 2: switched fan with dimmer ───────────────────────────────
  const sw3 = C('single-way-switch', 670, 250, { on: true });
  const dim = C('fan-dimmer', 850, 250, { on: true });
  const fan = C('ceiling-fan', 1030, 250);

  // ── Branch 3: socket (region-aware) + push-button bell ───────────────
  const socket = C(socketType, 670, 410);
  const pb = C('push-button', 850, 410, { on: false });
  const bulb2 = C('bulb', 1030, 410);

  // ── Branch 4 (motor on its own with fuse) ────────────────────────────
  const motor = C('motor', 470, 610);

  // ── Second supply row (y=800) for new components ─────────────────────
  const live2 = C('live-terminal', 110, 820);
  const neutral2 = C('neutral-terminal', 110, 1010);

  // ── Branch 5: RCD protecting a distribution board → dimmer → bulb ───
  //   L2 → RCD(L-in) → DB(L-in) → DB(L1) → dimmer-switch → bulb3
  //   N2 → RCD(N-in) → DB(N-in) → DB(N1) → bulb3(N)
  const rcd = C('rcd', 290, 820, { on: true });
  const db = C('distribution-board', 470, 820);
  const dimSw = C('dimmer-switch', 670, 820, { on: true });
  const bulb3 = C('bulb', 850, 820);

  // ── Branch 6: contactor switching a motor (heavy-load) ───────────────
  //   DB(L2) → contactor(L-in) → motor2(L)
  //   DB(N2) → contactor(N-in) → motor2(N)
  const contactor = C('contactor', 670, 980, { on: true });
  const motor2 = C('motor', 850, 980);

  // ── Branch 7: timer switch → bell (doorbell-style) ───────────────────
  //   DB(L3) → timer-switch → bell(L)
  //   neutral2 → bell(N)  [direct neutral — no separate branch needed]
  const timer = C('timer-switch', 670, 1130, { on: true });
  const bellComp = C('bell', 850, 1130);

  const components: ComponentInstance[] = [
    live,
    neutral,
    earth,
    mcb,
    fuse,
    jb,
    sw1,
    sw2,
    bulb1,
    sw3,
    dim,
    fan,
    socket,
    pb,
    bulb2,
    motor,
    // new
    live2,
    neutral2,
    rcd,
    db,
    dimSw,
    bulb3,
    contactor,
    motor2,
    timer,
    bellComp,
  ];

  // ── Wires ─────────────────────────────────────────────────────────────
  // Component port indices follow COMPONENT_DEFS order:
  //   live-terminal:       0 = L-out
  //   neutral-terminal:    0 = N-out
  //   earth-terminal:      0 = E-out
  //   mcb / fuse / single-way-switch / push-button / fan-dimmer:
  //                        0 = L-in,  1 = L-out
  //   two-way-switch:      0 = COM,   1 = L1, 2 = L2
  //   junction-box:        0 = L-in,  1 = L-out1, 2 = L-out2, 3 = L-out3
  //   bulb / fan / motor:  0 = L,     1 = N
  //   socket-3pin:         0 = L,     1 = N, 2 = E
  //   rcd:                 0 = L-in,  1 = N-in, 2 = L-out, 3 = N-out
  //   contactor:           0 = L-in,  1 = N-in, 2 = L-out, 3 = N-out
  //   timer-switch:        0 = L-in,  1 = L-out
  //   dimmer-switch:       0 = L-in,  1 = L-out
  //   distribution-board:  0 = L-in,  1 = N-in, 2 = L1, 3 = L2, 4 = L3, 5 = N1, 6 = N2
  //   bell:                0 = L,     1 = N
  const wires: WireInstance[] = [
    // Live trunk: L → MCB → JB
    W({ c: live, p: 0 }, { c: mcb, p: 0 }),
    W({ c: mcb, p: 1 }, { c: jb, p: 0 }),

    // Branch 1: JB → SW1 → SW2 → bulb1
    W({ c: jb, p: 1 }, { c: sw1, p: 0 }),
    W({ c: sw1, p: 1 }, { c: sw2, p: 1 }),
    W({ c: sw1, p: 2 }, { c: sw2, p: 2 }),
    W({ c: sw2, p: 0 }, { c: bulb1, p: 0 }),

    // Branch 2: JB → SW3 → DIM → fan
    W({ c: jb, p: 2 }, { c: sw3, p: 0 }),
    W({ c: sw3, p: 1 }, { c: dim, p: 0 }),
    W({ c: dim, p: 1 }, { c: fan, p: 0 }),

    // Branch 3: JB → socket; JB → PB → bulb2
    W({ c: jb, p: 3 }, { c: socket, p: 0 }),
    W({ c: jb, p: 2 }, { c: pb, p: 0 }),
    W({ c: pb, p: 1 }, { c: bulb2, p: 0 }),

    // Neutral returns (upper half)
    W({ c: neutral, p: 0 }, { c: bulb1, p: 1 }),
    W({ c: neutral, p: 0 }, { c: fan, p: 1 }),
    W({ c: neutral, p: 0 }, { c: socket, p: 1 }),
    W({ c: neutral, p: 0 }, { c: bulb2, p: 1 }),
    W({ c: neutral, p: 0 }, { c: motor, p: 1 }),

    // Earth → socket
    W({ c: earth, p: 0 }, { c: socket, p: 2 }),

    // Motor branch: L → fuse → motor
    W({ c: live, p: 0 }, { c: fuse, p: 0 }),
    W({ c: fuse, p: 1 }, { c: motor, p: 0 }),

    // ── Branch 5: L2 → RCD → DB → dimmer-switch → bulb3 ─────────────
    W({ c: live2, p: 0 }, { c: rcd, p: 0 }),
    W({ c: neutral2, p: 0 }, { c: rcd, p: 1 }),
    W({ c: rcd, p: 2 }, { c: db, p: 0 }),
    W({ c: rcd, p: 3 }, { c: db, p: 1 }),
    W({ c: db, p: 2 }, { c: dimSw, p: 0 }),
    W({ c: dimSw, p: 1 }, { c: bulb3, p: 0 }),
    W({ c: db, p: 5 }, { c: bulb3, p: 1 }),

    // ── Branch 6: DB → contactor → motor2 ────────────────────────────
    W({ c: db, p: 3 }, { c: contactor, p: 0 }),
    W({ c: db, p: 6 }, { c: contactor, p: 1 }),
    W({ c: contactor, p: 2 }, { c: motor2, p: 0 }),
    W({ c: contactor, p: 3 }, { c: motor2, p: 1 }),

    // ── Branch 7: DB → timer-switch → bell ───────────────────────────
    W({ c: db, p: 4 }, { c: timer, p: 0 }),
    W({ c: timer, p: 1 }, { c: bellComp, p: 0 }),
    W({ c: neutral2, p: 0 }, { c: bellComp, p: 1 }),
  ];

  return { components, wires };
}
