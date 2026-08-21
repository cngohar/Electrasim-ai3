import { describe, expect, it } from 'vitest';
import { TOOLS, availableTools, getTool, searchTools } from './registry';

describe('tool registry', () => {
  it('exposes voltage drop as the only available tool in v1', () => {
    expect(availableTools().map((t) => t.id)).toEqual(['voltage-drop']);
  });

  it('has unique ids and routes', () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map((t) => t.route)).size).toBe(TOOLS.length);
  });

  it('uses trailing-slash routes under /tools/', () => {
    for (const t of TOOLS) {
      expect(t.route.startsWith('/tools/')).toBe(true);
      expect(t.route.endsWith('/')).toBe(true);
    }
  });

  it('looks a tool up by id', () => {
    expect(getTool('voltage-drop')?.name).toBe('Voltage Drop Calculator');
    expect(getTool('nope')).toBeUndefined();
  });

  it('searches name, summary and keywords', () => {
    expect(searchTools('volt').map((t) => t.id)).toContain('voltage-drop');
    expect(searchTools('kwh').map((t) => t.id)).toEqual(['energy-cost']);
    expect(searchTools('VDROP').map((t) => t.id)).toEqual(['voltage-drop']);
    expect(searchTools('')).toHaveLength(TOOLS.length);
    expect(searchTools('zzzz')).toHaveLength(0);
  });
});
