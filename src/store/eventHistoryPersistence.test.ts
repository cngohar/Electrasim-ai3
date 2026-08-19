import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => memory.get(key)),
  set: vi.fn(async (key: string, value: unknown) => {
    if (value === undefined) memory.delete(key);
    else memory.set(key, value);
  }),
}));

import {
  __EVENT_HISTORY_MAX_EVENTS,
  __EVENT_HISTORY_STORAGE_KEY,
  parsePersistedEventHistory,
  startEventHistoryPersistence,
} from './eventHistoryPersistence';
import { useUiStore } from './uiStore';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function event(index: number) {
  return {
    id: `event-${index}`,
    timestamp: index,
    eventType: 'manual_intervention' as const,
    description: `Override ${index}`,
    severity: 'warning' as const,
    details: { standard: 'uk', reason: 'Teacher/demo compliance override' },
  };
}

describe('event-history persistence', () => {
  beforeEach(() => {
    memory.clear();
    useUiStore.setState({ eventHistory: [] });
  });

  it('rejects malformed payloads and sanitises/caps valid entries', () => {
    expect(parsePersistedEventHistory({ version: 99, events: [] })).toBeNull();
    expect(parsePersistedEventHistory({ version: 1, events: 'bad' })).toBeNull();

    const parsed = parsePersistedEventHistory({
      version: 1,
      events: [
        ...Array.from({ length: 120 }, (_, index) => event(index)),
        { id: 'bad', timestamp: 'yesterday', eventType: 'unknown' },
      ],
    });
    expect(parsed).toHaveLength(__EVENT_HISTORY_MAX_EVENTS);
    expect(parsed?.[0]).toMatchObject(event(0));
  });

  it('hydrates before subscribing and saves subsequent updates', async () => {
    memory.set(__EVENT_HISTORY_STORAGE_KEY, { version: 1, events: [event(1)] });
    await startEventHistoryPersistence();
    expect(useUiStore.getState().eventHistory).toHaveLength(1);

    useUiStore.getState().addEventHistory({
      eventType: 'fault_cleared',
      description: 'Fault cleared',
      severity: 'info',
    });
    await wait(200);

    const saved = memory.get(__EVENT_HISTORY_STORAGE_KEY) as { events: unknown[] };
    expect(saved.events).toHaveLength(2);
  });
});
