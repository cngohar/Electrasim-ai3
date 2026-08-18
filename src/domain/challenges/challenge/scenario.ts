/**
 * Challenge Scenario schema (plan §1.2, Phase C steps 1–4).
 *
 * A scenario is the *briefing* wrapped around a generated circuit:
 *
 *     generator → target circuit → objective → user builds → compare → success
 *
 * Challenge Mode owns the objective; it does NOT own a generator. Every
 * scenario is produced by calling the locked `generateChallenge()` from
 * Phase A/B and decorating its output (plan §51: "Challenge Mode must not
 * contain its own circuit generator").
 *
 * The scenario is fully derived from `(seed, generatorVersion, difficulty)`,
 * so persisting those three values is enough to resume or share it (§21, §30).
 */

import { COMPONENT_DEFS } from '../../components';
import type { Circuit, ComponentInstance } from '../../types';
import { getDifficultyProfile } from '../difficulty/profiles';
import { generateChallenge } from '../generator/generator';
import { GENERATOR_VERSION } from '../generator/seed';
import type { ChallengeDifficulty, ChallengeIdentity, GeneratedChallenge } from '../types';
import { connectionSignatures, describeConnectionSignature } from './comparison';

/** One "you need this part" line in the objective panel. */
export interface ComponentRequirement {
  type: string;
  label: string;
  count: number;
}

/** One "these must be joined" line in the objective panel. */
export interface ConnectionRequirement {
  signature: string;
  description: string;
  count: number;
}

/** Progressive hint (plan §17: observation → direction → location). */
export interface ChallengeHint {
  level: 1 | 2 | 3;
  kind: 'observation' | 'direction' | 'location';
  text: string;
}

export interface ChallengeScenario {
  /** Stable id — `ES-CHAL-######` (plan §29). */
  challengeId: string;
  identity: ChallengeIdentity;
  seed: number;
  generatorVersion: number;
  difficulty: ChallengeDifficulty;
  recipeId: string;

  title: string;
  /** One-line goal shown as the headline objective. */
  objective: string;
  /** Short briefing paragraph. */
  brief: string;
  teaches: string;
  expectedBehaviour: string;

  /**
   * The circuit the learner is asked to reproduce. Kept out of the editor —
   * it is the answer key, revealed only on completion or on give-up.
   */
  targetCircuit: Circuit;
  /**
   * What the editor is seeded with: the supply terminals only, so the learner
   * has a fixed anchor to build from and cannot mis-place the source.
   */
  startingCircuit: Circuit;

  componentRequirements: ComponentRequirement[];
  connectionRequirements: ConnectionRequirement[];
  /** Loads that must be energised once the build is correct. */
  expectedEnergisedLoadIds: string[];

  hints: ChallengeHint[];
  hintBudget: number;
  parTimeSeconds: number;
  targetComponentCount: number;
  targetWireCount: number;
}

export interface BuildChallengeScenarioRequest {
  seed: number;
  difficulty: ChallengeDifficulty;
  generatorVersion?: number;
  /** Test/stress only — pins the recipe. Never set by product code. */
  recipeId?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function labelFor(type: string): string {
  return COMPONENT_DEFS[type]?.label ?? type;
}

/**
 * Component labels in the registry can embed a *default* rating (e.g.
 * "MCB Type B (16A)"). A generated instance often carries a different
 * `customMaxAmps`, so showing the raw label would contradict the brief.
 * Strip the trailing parenthetical and re-attach the real rating.
 */
function requirementLabel(type: string, instances: readonly ComponentInstance[]): string {
  // Trailing parenthetical that quotes an amp figure, e.g. "(16A)" or
  // "(32A 30mA)" — it is a catalogue default, not this instance's rating.
  const base = labelFor(type).replace(/\s*\([^()]*\d\s*A\b[^()]*\)\s*$/i, '');
  const ratings = [
    ...new Set(
      instances
        .map((instance) => instance.state.customMaxAmps)
        .filter((amps): amps is number => typeof amps === 'number' && Number.isFinite(amps)),
    ),
  ].sort((a, b) => a - b);
  if (ratings.length === 0) return labelFor(type);
  return `${base} (${ratings.map((amps) => `${amps} A`).join(' / ')})`;
}

function isSupply(component: ComponentInstance): boolean {
  return COMPONENT_DEFS[component.type]?.isSource === true;
}

function countTypes(components: readonly ComponentInstance[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const component of components) {
    counts.set(component.type, (counts.get(component.type) ?? 0) + 1);
  }
  return counts;
}

/**
 * The editor seed: the target's supply terminals, copied verbatim (same ids,
 * positions and state) so the learner's canvas starts electrically anchored.
 * No wires — every connection is the learner's job.
 */
function buildStartingCircuit(target: Circuit): Circuit {
  return {
    components: target.components.filter(isSupply).map((component) => ({
      ...component,
      state: { ...component.state },
    })),
    wires: [],
    globalVoltage: target.globalVoltage,
  };
}

/**
 * Progressive hints derived from the target (plan §17). Each level reveals
 * strictly more than the last and never more than its own level:
 *   1. observation — what the finished circuit must do,
 *   2. direction   — which parts are involved,
 *   3. location    — the specific joins that are still missing.
 */
function buildHints(challenge: GeneratedChallenge): ChallengeHint[] {
  const { scenario, circuit } = challenge;
  const loadLabels = [
    ...new Set(
      scenario.loadComponentIds
        .map((id) => circuit.components.find((c) => c.id === id)?.type)
        .filter((type): type is string => Boolean(type))
        .map(labelFor),
    ),
  ];
  const protectionLabels = [
    ...new Set(
      scenario.protectionComponentIds
        .map((id) => circuit.components.find((c) => c.id === id)?.type)
        .filter((type): type is string => Boolean(type))
        .map(labelFor),
    ),
  ];
  const switchLabels = [
    ...new Set(
      scenario.switchComponentIds
        .map((id) => circuit.components.find((c) => c.id === id)?.type)
        .filter((type): type is string => Boolean(type))
        .map(labelFor),
    ),
  ];

  const parts = [...protectionLabels, ...switchLabels, ...loadLabels];

  return [
    {
      level: 1,
      kind: 'observation',
      text: `${scenario.expectedBehaviour} Every load needs a complete live and neutral path back to the supply.`,
    },
    {
      level: 2,
      kind: 'direction',
      text:
        parts.length > 0
          ? `Work outward from the supply through the ${parts.join(', ')}.`
          : 'Work outward from the supply terminals towards each load.',
    },
    {
      level: 3,
      kind: 'location',
      text: `The finished circuit uses ${circuit.components.length} components and ${circuit.wires.length} connections. Check the Neutral returns and the earth conductors — they are the joins most often left out.`,
    },
  ];
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Turn a generated challenge into a Challenge Mode scenario.
 *
 * Split from {@link buildChallengeScenario} so callers that already hold a
 * `GeneratedChallenge` (share links, replays, tests) don't regenerate it.
 */
export function toChallengeScenario(challenge: GeneratedChallenge): ChallengeScenario {
  const { circuit, scenario, metadata } = challenge;
  const profile = getDifficultyProfile(metadata.difficulty);

  const componentRequirements: ComponentRequirement[] = [...countTypes(circuit.components)]
    .map(([type, count]) => ({
      type,
      label: requirementLabel(
        type,
        circuit.components.filter((component) => component.type === type),
      ),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const connectionCounts = new Map<string, number>();
  for (const signature of connectionSignatures(circuit)) {
    connectionCounts.set(signature, (connectionCounts.get(signature) ?? 0) + 1);
  }
  const connectionRequirements: ConnectionRequirement[] = [...connectionCounts]
    .map(([signature, count]) => ({
      signature,
      description: describeConnectionSignature(signature),
      count,
    }))
    .sort((a, b) => a.description.localeCompare(b.description));

  const loadCount = scenario.loadComponentIds.length;
  const objective =
    loadCount === 1
      ? `Build a working ${scenario.recipeTitle.toLowerCase()} — one load, correctly protected and switched.`
      : `Build a working ${scenario.recipeTitle.toLowerCase()} — ${loadCount} loads, correctly protected and switched.`;

  return {
    challengeId: metadata.challengeId,
    identity: metadata.identity,
    seed: metadata.seed,
    generatorVersion: metadata.generatorVersion,
    difficulty: metadata.difficulty,
    recipeId: metadata.recipeId,

    title: scenario.recipeTitle,
    objective,
    brief: `${scenario.summary} ${scenario.expectedBehaviour}`,
    teaches: scenario.teaches,
    expectedBehaviour: scenario.expectedBehaviour,

    targetCircuit: circuit,
    startingCircuit: buildStartingCircuit(circuit),

    componentRequirements,
    connectionRequirements,
    expectedEnergisedLoadIds: [...metadata.baseline.expectedEnergisedLoadIds],

    hints: buildHints(challenge),
    hintBudget: profile.hintBudget,
    parTimeSeconds: profile.parTimeSeconds,
    targetComponentCount: circuit.components.length,
    targetWireCount: circuit.wires.length,
  };
}

/**
 * Generate a Challenge Mode scenario for a seed + difficulty.
 *
 * Deterministic: the same request always yields the same scenario, because
 * it delegates entirely to the locked generator (plan §5).
 */
export function buildChallengeScenario(request: BuildChallengeScenarioRequest): ChallengeScenario {
  const challenge = generateChallenge({
    seed: request.seed,
    difficulty: request.difficulty,
    mode: 'challenge',
    generatorVersion: request.generatorVersion ?? GENERATOR_VERSION,
    recipeId: request.recipeId,
  });
  return toChallengeScenario(challenge);
}
