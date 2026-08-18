/**
 * Rage difficulty progression (plan §27).
 *
 * §27 opens with a warning worth obeying: *"Do not initially create dozens of
 * Rage levels. Start with modifier combinations."* So there is no rage
 * difficulty curve, no XP and no unlock tree — three tiers, each a named
 * combination of the modifiers defined in `modifiers.ts`.
 *
 * The plan lists four tiers. Three shipped in Phase E; Phase F completes Rage 3
 * by adding the second fault §27 always specified for it. Rage 4 is still held
 * back, because §27 defines it as `2 faults + compound symptom + limited hints
 * + optional timer` and `compoundFault` remains honestly unimplementable — two
 * faults that *interact* is a different property from two that are independent,
 * and shipping the tier without it would mean labelling something "compound"
 * that is not. §24's rule that the mode must never mislead the user cuts both
 * ways, so the tier waits rather than pretending.
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
    blurb: 'Two faults, one of them a long way off, a decoy in the way, and one hint.',
    /**
     * §27 Rage 3 — "2 faults + remote fault + red herring" — now complete.
     * `limitedHints` is kept from the Phase E shape: with two faults to find,
     * a full hint ladder that names one location makes the tier easier than
     * Rage 2, and a difficulty curve that dips is worse than one that is
     * merely steep.
     *
     * Order matters. `multiFault` runs after `remoteFault` has narrowed the
     * pool, so the *first* fault is the remote one and the second is drawn
     * from the same ranked list — which is why the second fault tends to be
     * remote too rather than sitting conveniently next to the dead load.
     */
    modifiers: ['redHerring', 'remoteFault', 'multiFault', 'limitedHints'],
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
