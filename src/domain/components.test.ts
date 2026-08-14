import { describe, expect, it } from 'vitest';
import { COMPONENT_DEFS } from './components';

describe('component learning descriptions', () => {
  it.each([
    ['push-button', /normally-open.*normally-closed.*latching/i],
    ['mcb', /educational overload estimate.*not standards-compliant.*trip timing/i],
    ['rcd', /does not calculate leakage current.*mA trip thresholds.*trip timing/i],
    ['rcbo', /educational overload estimate.*does not calculate leakage.*trip thresholds.*timing/i],
    ['contactor', /without coil terminals.*coil logic.*auxiliary contacts/i],
    ['bell', /visual pulse.*does not play audio/i],
  ])('%s states the behavior this simulator does not model', (type, limitation) => {
    expect(COMPONENT_DEFS[type]?.description).toMatch(limitation);
  });
});
