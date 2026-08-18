/**
 * Rage difficulty progression (plan §27).
 *
 * §27 opens with a warning worth obeying: *"Do not initially create dozens of
 * Rage levels. Start with modifier combinations."* So there is no rage
 * difficulty curve, no XP and no unlock tree — three tiers, each a named
 * combination of the modifiers defined in `modifiers.ts`.
 *
 * The plan lists four tiers. Only the first three ship in Phase E, because
 * Rage 4 needs `compoundFault` and `timeLimit`, both of which are honestly
 * unimplementable today (see `modifiers.ts`). Rage 3 is also trimmed: §27 lists
 * it as `2 faults + remote fault + red herring`, and the two-fault half of that
 * is Phase F work, so the shipped Rage 3 is the single-fault version of the
 * same shape. The tier is labelled accordingly rather than pretending — §24's
 * rule that the mode must never mislead the user cuts both ways.
 */

import type { RageTier, RageTierId } from './types';

export const RAGE_TIERS: Record<RageTierId, RageTier> = {
  'rage-1': {
    id: 'rage-1',
    label: 'Rage 1',
    blurb: 'One fault, one innocent suspect.',
    // §27 Rage 1 — "1 fault + 1 red herring", exactly.
    modifiers: ['redHerring'],
  },
  'rage-2': {
    id: 'rage-2',
    label: 'Rage 2',
    blurb: 'One fault, a long way from the symptom, with the hints thinned out.',
    /**
     * §27 Rage 2 is "1 fault + misleading symptom + reduced hints".
     * `misleadingSymptom` is not truthfully implementable yet, so this tier
     * substitutes `remoteFault` — the same intent (the obvious place to look
     * is the wrong one) achieved by a mechanic the simulator can support
     * honestly. The reduced-hints half is shipped as specified.
     */
    modifiers: ['remoteFault', 'limitedHints'],
  },
  'rage-3': {
    id: 'rage-3',
    label: 'Rage 3',
    blurb: 'A remote fault, a decoy in the way, and one hint if you are lucky.',
    // §27 Rage 3 minus the second fault (Phase F), plus the hint rationing
    // that makes the combination bite.
    modifiers: ['redHerring', 'remoteFault', 'limitedHints'],
  },
};

export const RAGE_TIER_IDS: readonly RageTierId[] = ['rage-1', 'rage-2', 'rage-3'] as const;

export function getRageTier(id: RageTierId): RageTier {
  const tier = RAGE_TIERS[id];
  if (!tier) throw new Error(`Unknown rage tier: ${id}`);
  return tier;
}

export function isRageTierId(value: string): value is RageTierId {
  return RAGE_TIER_IDS.includes(value as RageTierId);
}

/**
 * The `rageProfile` string folded into the challenge identity (§29).
 *
 * Phase A already hashes `rageProfile` into `seedFingerprint`, so two
 * scenarios that differ only by tier get different `ES-RAGE-######` ids for
 * free. Keeping the derivation here means the identity and the tier can never
 * drift apart.
 */
export function rageProfileKey(tier: RageTierId): string {
  return tier;
}
