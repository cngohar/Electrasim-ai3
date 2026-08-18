/**
 * comparison.ts — structural equivalence tests (plan §38–44).
 *
 * The central property: equality is *never* id equality. A learner's circuit
 * has entirely different component ids from the target, so every assertion
 * here is written against relabelled / reordered graphs.
 */

import { describe, expect, it } from 'vitest';
import type { Circuit, ComponentInstance, WireInstance } from '../../types';
import {
  compareCircuits,
  connectionSignatures,
  describeConnectionSignature,
  wireSignature,
} from './comparison';

// ── Fixtures ───────────────────────────────────────────────────────────────

function comp(id: string, type: string, x = 0, y = 0): ComponentInstance {
  return { id, type, x, y, state: { on: true } };
}

function wire(
  id: string,
  from: string,
  fromPort: number,
  to: string,
  toPort: number,
): WireInstance {
  return {
    id,
    fromComponentId: from,
    fromPortIndex: fromPort,
    toComponentId: to,
    toPortIndex: toPort,
    controlPoints: [],
  };
}

/** live → mcb → lamp → neutral */
function simpleCircuit(prefix = 't'): Circuit {
  return {
    components: [
      comp(`${prefix}-l`, 'live-terminal'),
      comp(`${prefix}-m`, 'mcb'),
      comp(`${prefix}-b`, 'bulb'),
      comp(`${prefix}-n`, 'neutral-terminal'),
    ],
    wires: [
      wire(`${prefix}-w1`, `${prefix}-l`, 0, `${prefix}-m`, 0),
      wire(`${prefix}-w2`, `${prefix}-m`, 1, `${prefix}-b`, 0),
      wire(`${prefix}-w3`, `${prefix}-b`, 1, `${prefix}-n`, 0),
    ],
    globalVoltage: 230,
  };
}

/** Same graph, different ids and a reversed wire direction. */
function relabelled(): Circuit {
  const circuit = simpleCircuit('u');
  // reverse one wire's direction — must not affect the verdict
  const w = circuit.wires[1];
  const c = { ...w };
  circuit.wires[1] = {
    ...w,
    fromComponentId: c.toComponentId,
    fromPortIndex: c.toPortIndex,
    toComponentId: c.fromComponentId,
    toPortIndex: c.fromPortIndex,
  };
  circuit.components.reverse();
  return circuit;
}

// ── Signatures ─────────────────────────────────────────────────────────────

describe('wireSignature', () => {
  it('is direction-independent', () => {
    const circuit = simpleCircuit();
    const forward = wireSignature(circuit, wire('a', 't-m', 1, 't-b', 0));
    const backward = wireSignature(circuit, wire('b', 't-b', 0, 't-m', 1));
    expect(forward).toBe(backward);
    expect(forward).toBeTruthy();
  });

  it('encodes type and port, never id', () => {
    const circuit = simpleCircuit();
    const signature = wireSignature(circuit, circuit.wires[1]);
    expect(signature).toContain('mcb');
    expect(signature).toContain('bulb');
    expect(signature).not.toContain('t-m');
  });

  it('returns null for a dangling wire', () => {
    const circuit = simpleCircuit();
    expect(wireSignature(circuit, wire('x', 'ghost', 0, 't-b', 0))).toBeNull();
  });

  it('distinguishes different ports on the same pair', () => {
    const circuit = simpleCircuit();
    const a = wireSignature(circuit, wire('a', 't-m', 0, 't-b', 0));
    const b = wireSignature(circuit, wire('b', 't-m', 1, 't-b', 0));
    expect(a).not.toBe(b);
  });
});

describe('describeConnectionSignature', () => {
  it('produces readable text for a signature', () => {
    const [signature] = connectionSignatures(simpleCircuit());
    const description = describeConnectionSignature(signature);
    expect(description.length).toBeGreaterThan(0);
    expect(description).not.toContain('|');
  });
});

// ── Core comparison ────────────────────────────────────────────────────────

describe('compareCircuits', () => {
  it('matches a circuit against itself', () => {
    const circuit = simpleCircuit();
    const result = compareCircuits(circuit, circuit);
    expect(result.matches).toBe(true);
    expect(result.isomorphic).toBe(true);
    expect(result.completion).toBe(1);
  });

  it('is invariant to id relabelling, ordering and wire direction', () => {
    const result = compareCircuits(simpleCircuit(), relabelled());
    expect(result.matches).toBe(true);
    expect(result.isomorphic).toBe(true);
    expect(result.missingComponents).toHaveLength(0);
    expect(result.extraComponents).toHaveLength(0);
  });

  it('returns a mapping from target ids to user ids', () => {
    const result = compareCircuits(simpleCircuit(), relabelled());
    expect(result.mapping).not.toBeNull();
    const mapping = result.mapping as Record<string, string>;
    expect(Object.keys(mapping)).toHaveLength(4);
    // every target id maps to a *user* id, never to itself
    for (const [targetId, userId] of Object.entries(mapping)) {
      expect(targetId.startsWith('t-')).toBe(true);
      expect(userId.startsWith('u-')).toBe(true);
    }
  });

  it('reports a missing component', () => {
    const user = simpleCircuit('u');
    user.components = user.components.filter((c) => c.type !== 'mcb');
    user.wires = user.wires.filter((w) => w.fromComponentId !== 'u-m' && w.toComponentId !== 'u-m');
    const result = compareCircuits(simpleCircuit(), user);
    expect(result.matches).toBe(false);
    expect(result.componentsMatch).toBe(false);
    expect(result.missingComponents.map((e) => e.type)).toContain('mcb');
  });

  it('reports an extra component', () => {
    const user = relabelled();
    user.components.push(comp('u-extra', 'bulb', 500, 500));
    const result = compareCircuits(simpleCircuit(), user);
    expect(result.matches).toBe(false);
    expect(result.extraComponents.map((e) => e.type)).toContain('bulb');
  });

  it('reports a missing connection when a wire is removed', () => {
    const user = relabelled();
    user.wires.pop();
    const result = compareCircuits(simpleCircuit(), user);
    expect(result.matches).toBe(false);
    expect(result.connectionsMatch).toBe(false);
    expect(result.missingConnections.length).toBeGreaterThan(0);
  });

  it('rejects a wire moved to the wrong port', () => {
    const user = relabelled();
    const target = user.wires.find((w) => w.fromComponentId.endsWith('-l'));
    if (target) target.toPortIndex = 1;
    const result = compareCircuits(simpleCircuit(), user);
    expect(result.matches).toBe(false);
  });

  it('counts parallel wires as a multiset, not a set', () => {
    const target = simpleCircuit();
    target.wires.push(wire('t-w4', 't-m', 1, 't-b', 0)); // duplicate join
    const user = relabelled(); // has only one such wire
    const result = compareCircuits(target, user);
    expect(result.matches).toBe(false);
    expect(result.missingConnections.length).toBeGreaterThan(0);
  });

  it('ignores dangling wires rather than throwing', () => {
    const user = relabelled();
    user.wires.push(wire('u-dangle', 'nonexistent', 0, 'u-b', 0));
    expect(() => compareCircuits(simpleCircuit(), user)).not.toThrow();
  });

  it('treats an empty user circuit as zero completion', () => {
    const result = compareCircuits(simpleCircuit(), {
      components: [],
      wires: [],
      globalVoltage: 230,
    });
    expect(result.matches).toBe(false);
    expect(result.completion).toBe(0);
  });

  it('never reports completion 1 unless isomorphic', () => {
    const user = relabelled();
    user.wires.pop();
    const result = compareCircuits(simpleCircuit(), user);
    expect(result.completion).toBeLessThan(1);
  });

  it('increases completion as the build progresses', () => {
    const target = simpleCircuit();
    const partial = relabelled();
    partial.wires = [];
    const partialResult = compareCircuits(target, partial);
    const fullResult = compareCircuits(target, relabelled());
    expect(fullResult.completion).toBeGreaterThan(partialResult.completion);
  });

  it('detects a wrong-instance wiring that preserves all signatures', () => {
    // Two identical branches off one MCB; swapping which bulb each switch
    // feeds keeps every type-level signature identical but is a different
    // graph when the branches are asymmetric.
    const target: Circuit = {
      components: [
        comp('t-l', 'live-terminal'),
        comp('t-m', 'mcb'),
        comp('t-s1', 'switch-1way'),
        comp('t-s2', 'switch-1way'),
        comp('t-b1', 'bulb'),
        comp('t-b2', 'bulb'),
      ],
      wires: [
        wire('t-w1', 't-l', 0, 't-m', 0),
        wire('t-w2', 't-m', 1, 't-s1', 0),
        wire('t-w3', 't-s1', 1, 't-b1', 0),
        wire('t-w4', 't-b1', 1, 't-s2', 0),
        wire('t-w5', 't-s2', 1, 't-b2', 0),
      ],
      globalVoltage: 230,
    };
    // user: chain reordered so s2 comes before s1 in the series path
    const user: Circuit = {
      components: target.components.map((c) => ({ ...c, id: c.id.replace('t-', 'u-') })),
      wires: [
        wire('u-w1', 'u-l', 0, 'u-m', 0),
        wire('u-w2', 'u-m', 1, 'u-s1', 0),
        wire('u-w3', 'u-s1', 1, 'u-b1', 0),
        wire('u-w4', 'u-b1', 1, 'u-s2', 0),
        wire('u-w5', 'u-s2', 1, 'u-b2', 0),
      ],
      globalVoltage: 230,
    };
    // identical structure → should match
    expect(compareCircuits(target, user).isomorphic).toBe(true);

    // now genuinely break it: move the last bulb onto the MCB instead
    user.wires[4] = wire('u-w5', 'u-m', 1, 'u-b2', 0);
    const broken = compareCircuits(target, user);
    expect(broken.matches).toBe(false);
  });

  it('is symmetric for isomorphic inputs', () => {
    const a = simpleCircuit();
    const b = relabelled();
    expect(compareCircuits(a, b).isomorphic).toBe(compareCircuits(b, a).isomorphic);
  });
});
