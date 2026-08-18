/**
 * Diagnosis Scenario schema (plan §1.3, §13–§15, §17; Phase D steps 1–5).
 *
 * The Diagnosis Lab inverts Challenge Mode. There the learner builds a circuit
 * from nothing; here they are handed a *working installation that has stopped
 * working* and must find out why:
 *
 *     Circuit Generator → valid circuit → fault scenario → intentional fault
 *       → user diagnoses → user repairs → simulation confirms recovery
 *
 * Like Challenge Mode this module owns no generator (§51) and no fault model
 * (§13). It calls the locked `generateChallenge()`, then places one fault via
 * the existing fault registry, then proves the fault is visible (§12). If it
 * is not visible the candidate is thrown away and another seed is tried —
 * a scenario whose fault cannot be observed is not a puzzle, it is a bug.
 *
 * Everything is derived from `(seed, generatorVersion, difficulty)`, so those
 * three values are all that persistence needs (§21).
 */

import { getFaultDefinition } from '../../faults';
import { simulate } from '../../simulation/simulate';
import type { Circuit, FaultTarget, FaultType, InjectedFault, SimulationResult } from '../../types';
import { getDifficultyProfile } from '../difficulty/profiles';
import {
  type FaultCandidate,
  collectFaultCandidates,
  eligibleFaultTypes,
} from '../faults/eligibility';
import {
  createScenarioFault,
  describeFaultTarget,
  selectFaultCandidate,
  withScenarioFaults,
} from '../faults/injection';
import { labelById } from '../faults/labels';
import { type FaultSymptom, describeSymptom, diffSymptom } from '../faults/verification';
import { generateChallenge } from '../generator/generator';
import { GENERATOR_VERSION, createSeededRng, normalizeSeed } from '../generator/seed';
import type { ChallengeDifficulty, ChallengeIdentity } from '../types';

/** Progressive hint (plan §17: observation → direction → location). */
export interface DiagnosisHint {
  level: 1 | 2 | 3;
  kind: 'observation' | 'direction' | 'location';
  text: string;
}

/** One option in the "what is wrong?" question (plan §15A). */
export interface FaultTypeChoice {
  type: FaultType;
  label: string;
  description: string;
}

/** One option in the "where is it wrong?" question (plan §15B). */
export interface FaultLocationChoice {
  /** Stable key — `wire:<id>`, `component:<id>` or `port:<id>:<index>`. */
  key: string;
  kind: 'wire' | 'component' | 'port';
  label: string;
  /** Ids the canvas should highlight when this option is focused. */
  wireId?: string;
  componentId?: string;
  portIndex?: number;
}

export interface DiagnosisScenario {
  /** Stable id — `ES-DIAG-######` (plan §29). */
  challengeId: string;
  identity: ChallengeIdentity;
  seed: number;
  generatorVersion: number;
  difficulty: ChallengeDifficulty;
  recipeId: string;

  title: string;
  /** Deliberately vague opening line — §14 forbids naming the fault. */
  complaint: string;
  brief: string;
  teaches: string;
  /** What the installation does when it is healthy. */
  expectedBehaviour: string;

  /**
   * The circuit the learner works on — the healthy circuit **with the fault
   * already injected**. This is what gets loaded into the editor.
   */
  faultedCircuit: Circuit;
  /** The healthy circuit, kept as the recovery reference. Never shown. */
  healthyCircuit: Circuit;

  /** The answer: the one fault that was injected. */
  fault: InjectedFault;
  /** How that fault manifests, measured from the simulator (§12). */
  symptom: FaultSymptom;
  /** Correct answer to §15B, as a location key. */
  faultLocationKey: string;

  /** Multiple-choice options for "what is wrong?" (§15A). */
  faultTypeChoices: FaultTypeChoice[];
  /** Options for "where is it wrong?" (§15B). */
  locationChoices: FaultLocationChoice[];

  hints: DiagnosisHint[];
  hintBudget: number;
  parTimeSeconds: number;

  /** Load component ids whose behaviour the learner is watching. */
  loadComponentIds: string[];
  /** Labels of the loads that went dead — used in the complaint text. */
  deadLoadLabels: string[];
}

export interface BuildDiagnosisScenarioRequest {
  seed: number;
  difficulty: ChallengeDifficulty;
  generatorVersion?: number;
  recipeId?: string;
  /**
   * Bounded retries (plan §37). Each attempt re-seeds the generator, so a
   * circuit whose fault turned out to be invisible is replaced rather than
   * patched.
   */
  maxAttempts?: number;
}

export const MAX_SCENARIO_ATTEMPTS = 10;

/** Raised when no seed in the retry budget produced an observable fault. */
export class DiagnosisScenarioError extends Error {
  readonly rejections: string[];
  constructor(message: string, rejections: string[]) {
    super(message);
    this.name = 'DiagnosisScenarioError';
    this.rejections = rejections;
  }
}

/**
 * Build a diagnosis scenario, retrying until the injected fault is provably
 * observable (plan §12 — this gate is mandatory).
 */
export function buildDiagnosisScenario(request: BuildDiagnosisScenarioRequest): DiagnosisScenario {
  const generatorVersion = request.generatorVersion ?? GENERATOR_VERSION;
  const maxAttempts = request.maxAttempts ?? MAX_SCENARIO_ATTEMPTS;
  const baseSeed = normalizeSeed(request.seed);
  const rejections: string[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // Derive a fresh seed per attempt so a rejected circuit is *replaced*,
    // not re-faulted — the generator core stays untouched (§57).
    const seed = attempt === 0 ? baseSeed : normalizeSeed(baseSeed + attempt * 7919);
    const built = tryBuildScenario({ ...request, seed, generatorVersion });
    if (built.ok) return built.scenario;
    rejections.push(`seed ${seed}: ${built.reason}`);
  }

  throw new DiagnosisScenarioError(
    `Could not build an observable diagnosis scenario in ${maxAttempts} attempts`,
    rejections,
  );
}

type BuildOutcome = { ok: true; scenario: DiagnosisScenario } | { ok: false; reason: string };

function tryBuildScenario(request: {
  seed: number;
  difficulty: ChallengeDifficulty;
  generatorVersion: number;
  recipeId?: string;
}): BuildOutcome {
  const { seed, difficulty, generatorVersion, recipeId } = request;

  const generated = generateChallenge({
    seed,
    difficulty,
    mode: 'diagnosis',
    generatorVersion,
    recipeId,
  });

  const healthyCircuit = generated.circuit;
  const baseline = simulate(healthyCircuit, { appMode: 'pro' });

  // A scenario is only meaningful if the healthy circuit actually works —
  // the learner must have a "correct" state to restore.
  if (baseline.errors.length > 0) {
    return { ok: false, reason: 'baseline circuit is not clean' };
  }

  const candidates = collectFaultCandidates(healthyCircuit, generated.scenario);
  if (candidates.length === 0) {
    return { ok: false, reason: 'no eligible fault candidates' };
  }

  const rng = createSeededRng({
    generatorVersion,
    seed,
    difficulty,
    mode: 'diagnosis',
  }).fork('diagnosis-fault');

  const candidate = selectFaultCandidate(candidates, rng);
  if (!candidate) return { ok: false, reason: 'fault selection produced nothing' };

  const challengeId = generated.metadata.identity.displayId;
  const fault = createScenarioFault(challengeId, candidate);
  const faultedCircuit = withScenarioFaults(healthyCircuit, [fault]);
  const faulted = simulate(faultedCircuit, { appMode: 'pro' });

  const symptom = diffSymptom(baseline, faulted, generated.scenario.loadComponentIds);

  // ── Plan §12: the mandatory gate. ────────────────────────────────────────
  if (!symptom.observable) {
    return { ok: false, reason: `${candidate.type} produced no observable symptom` };
  }

  return {
    ok: true,
    scenario: assembleScenario({
      generated,
      healthyCircuit,
      faultedCircuit,
      baseline,
      fault,
      candidate,
      symptom,
      difficulty,
      seed,
      generatorVersion,
      rng,
    }),
  };
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function assembleScenario(args: {
  generated: ReturnType<typeof generateChallenge>;
  healthyCircuit: Circuit;
  faultedCircuit: Circuit;
  baseline: SimulationResult;
  fault: InjectedFault;
  candidate: FaultCandidate;
  symptom: FaultSymptom;
  difficulty: ChallengeDifficulty;
  seed: number;
  generatorVersion: number;
  rng: ReturnType<typeof createSeededRng>;
}): DiagnosisScenario {
  const {
    generated,
    healthyCircuit,
    faultedCircuit,
    fault,
    candidate,
    symptom,
    difficulty,
    seed,
    generatorVersion,
    rng,
  } = args;

  const profile = getDifficultyProfile(difficulty);
  const labelOf = (id: string): string => labelById(healthyCircuit, id, 'load');

  const deadLoadLabels = symptom.deEnergisedLoadIds.map(labelOf);
  const complaint = describeSymptom(symptom, deadLoadLabels);

  const locationChoices = buildLocationChoices(healthyCircuit, generated.scenario);
  const faultLocationKey = locationKeyFor(candidate);
  const faultTypeChoices = buildFaultTypeChoices(
    healthyCircuit,
    generated.scenario,
    candidate.type,
    profile.diagnosticChoiceCount,
    rng.fork('choices'),
  );

  return {
    challengeId: generated.metadata.identity.displayId,
    identity: generated.metadata.identity,
    seed,
    generatorVersion,
    difficulty,
    recipeId: generated.scenario.recipeId,

    title: generated.scenario.recipeTitle,
    complaint,
    brief:
      'This installation was working. It is not working now. Investigate the circuit, ' +
      'work out what has gone wrong and where, then put it right.',
    teaches: generated.scenario.teaches,
    expectedBehaviour: generated.scenario.expectedBehaviour,

    faultedCircuit: deepCopy(faultedCircuit),
    healthyCircuit: deepCopy(healthyCircuit),

    fault,
    symptom,
    faultLocationKey,

    faultTypeChoices,
    locationChoices,

    hints: buildHints(healthyCircuit, candidate, symptom, deadLoadLabels),
    hintBudget: profile.hintBudget,
    parTimeSeconds: profile.parTimeSeconds,

    loadComponentIds: [...generated.scenario.loadComponentIds],
    deadLoadLabels,
  };
}

/**
 * Stable location key for a fault target — mirrors {@link FaultLocationChoice.key}.
 *
 * Exported separately from {@link locationKeyFor} because the UI needs to key
 * *live* faults in the learner's circuit (which are `InjectedFault`s, not
 * candidates) against the same option list.
 */
export function locationKeyForTarget(target: FaultTarget): string {
  if (target.type === 'port') return `port:${target.componentId}:${target.portIndex}`;
  return `${target.type}:${target.id}`;
}

/** Stable location key for a candidate — mirrors {@link FaultLocationChoice.key}. */
export function locationKeyFor(candidate: FaultCandidate): string {
  return locationKeyForTarget(candidate.target);
}

/**
 * Every place the learner is allowed to point at.
 *
 * The list covers the whole investigable circuit, not just the fault's own
 * placement class — otherwise the shape of the options would leak the answer
 * (e.g. "only wires are listed, so it must be a wire fault").
 */
function buildLocationChoices(
  circuit: Circuit,
  scenario: {
    faultCandidateWireIds: string[];
    loadComponentIds: string[];
    protectionComponentIds: string[];
  },
): FaultLocationChoice[] {
  const choices: FaultLocationChoice[] = [];
  const wireIds = new Set(scenario.faultCandidateWireIds);

  for (const wire of circuit.wires) {
    if (!wireIds.has(wire.id)) continue;
    const from = labelById(circuit, wire.fromComponentId, '?');
    const to = labelById(circuit, wire.toComponentId, '?');
    choices.push({
      key: `wire:${wire.id}`,
      kind: 'wire',
      label: `Wire: ${from} → ${to}`,
      wireId: wire.id,
    });
  }

  for (const id of [...scenario.protectionComponentIds, ...scenario.loadComponentIds]) {
    if (!circuit.components.some((c) => c.id === id)) continue;
    choices.push({
      key: `component:${id}`,
      kind: 'component',
      label: `Device: ${labelById(circuit, id)}`,
      componentId: id,
    });
  }

  // Terminals of loads that are actually wired — matches the eligibility rule.
  const seenPorts = new Set<string>();
  for (const wire of circuit.wires) {
    if (!wireIds.has(wire.id)) continue;
    for (const end of [
      { componentId: wire.toComponentId, portIndex: wire.toPortIndex },
      { componentId: wire.fromComponentId, portIndex: wire.fromPortIndex },
    ]) {
      if (!scenario.loadComponentIds.includes(end.componentId)) continue;
      const key = `port:${end.componentId}:${end.portIndex}`;
      if (seenPorts.has(key)) continue;
      seenPorts.add(key);
      choices.push({
        key,
        kind: 'port',
        label: `Terminal ${end.portIndex + 1} of ${labelById(circuit, end.componentId, '?')}`,
        componentId: end.componentId,
        portIndex: end.portIndex,
      });
    }
  }

  choices.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return choices;
}

/**
 * The §15A choice set: the true fault plus plausible distractors.
 *
 * Distractors are drawn from faults that were *genuinely eligible on this
 * circuit*, so every wrong answer is a fault that could really have happened
 * here. A distractor that is impossible on the topology teaches nothing and
 * is trivially eliminated.
 *
 * Size follows `difficulty.diagnosticChoiceCount` (3 / 5 / 7).
 */
function buildFaultTypeChoices(
  circuit: Circuit,
  scenario: Parameters<typeof collectFaultCandidates>[1],
  correct: FaultType,
  desiredCount: number,
  rng: ReturnType<typeof createSeededRng>,
): FaultTypeChoice[] {
  const eligible = eligibleFaultTypes(collectFaultCandidates(circuit, scenario));
  const distractors = eligible.filter((t) => t !== correct);
  const wanted = Math.max(2, desiredCount) - 1;
  const chosen = rng.shuffle(distractors).slice(0, wanted);

  const types = rng.shuffle([correct, ...chosen]);
  return types.map((type) => {
    const def = getFaultDefinition(type);
    return { type, label: def.label, description: def.description };
  });
}

/**
 * Progressive hints (plan §17), written from the *symptom* outward.
 *
 * The plan's own worked example is the template:
 *   1. observation — "The load does not have a complete electrical path."
 *   2. direction   — "Check the Neutral path."
 *   3. location    — "Inspect the wire between the load and the Neutral return."
 *
 * Each level reveals strictly more than the last and no level reveals the
 * fault *type* and *location* together — that pair is the answer, and §17
 * says hints "must not directly reveal more than the configured hint level".
 */
function buildHints(
  circuit: Circuit,
  candidate: FaultCandidate,
  symptom: FaultSymptom,
  deadLoadLabels: readonly string[],
): DiagnosisHint[] {
  const def = getFaultDefinition(candidate.type);

  const observation =
    symptom.primary === 'load-dead'
      ? `${deadLoadLabels[0] ?? 'A load'} has no complete electrical path — something in its circuit is interrupted or diverted.`
      : symptom.primary === 'tripped'
        ? 'A protective device is doing its job: it is seeing a current it does not like.'
        : symptom.primary === 'blown'
          ? 'A component has been destroyed, so the energy went somewhere it should not have.'
          : 'The installation is reporting a condition the regulations do not permit.';

  const direction = directionHint(candidate.type, def.category);

  const location = `Inspect ${describeFaultTarget(circuit, candidate.target)}.`;

  return [
    { level: 1, kind: 'observation', text: observation },
    { level: 2, kind: 'direction', text: direction },
    { level: 3, kind: 'location', text: location },
  ];
}

/** Narrow the search without naming the fault (plan §17 hint 2). */
function directionHint(type: FaultType, category: string): string {
  switch (type) {
    case 'open-live':
      return 'Follow the Line conductor from the supply towards the load.';
    case 'open-neutral':
      return 'Check the Neutral return path.';
    case 'open-circuit':
      return 'A conductor is broken somewhere along the run — trace it end to end.';
    case 'short-circuit':
      return 'Line and Neutral are meeting somewhere they should not.';
    case 'earth-fault':
    case 'live-to-earth':
      return 'Current is escaping to earth — check insulation and the CPC.';
    case 'reverse-polarity':
      return 'The conductors are connected, but check which one is which.';
    case 'terminal-disconnect':
      return 'The cable runs look sound — check the connections at the terminals.';
    case 'protection-forced-open':
    case 'protection-bypass':
      return 'Look at the protective device itself rather than the cabling.';
    default:
      return `Investigate the ${category} side of the installation.`;
  }
}

function deepCopy(circuit: Circuit): Circuit {
  return JSON.parse(JSON.stringify(circuit)) as Circuit;
}
