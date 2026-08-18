/**
 * Diagnosis evaluation (plan §16, §41; Phase D steps 6–7).
 *
 * Two things must both be true before a diagnosis exercise is finished:
 *
 *   1. the learner correctly named **what** is wrong and **where** (§15), and
 *   2. the circuit has actually been **repaired** and proven so by simulation.
 *
 * §16 is explicit that a correct guess alone is not completion — otherwise a
 * learner could pick the right radio button on a still-broken installation and
 * be told they had fixed it. That is why §41's truth table has *three* states,
 * not two:
 *
 *   | diagnosis        | repair            | verdict      |
 *   |------------------|-------------------|--------------|
 *   | correct type+loc | circuit recovered | success      |
 *   | correct type+loc | fault still live  | incomplete   |
 *   | anything else    | —                 | failure      |
 *
 * `incomplete` is the pedagogically interesting one: the learner has *found*
 * the fault but not *cleared* it, so the UI should keep them on the same
 * scenario and ask for the repair rather than resetting the exercise.
 *
 * Pure: no store access, no persistence, no timers.
 */

import { isFaultResolved } from '../../faults';
import { simulate } from '../../simulation';
import type { Circuit, FaultType, SimulationResult } from '../../types';
import { describeFaultTarget } from '../faults/injection';
import { describeRecoveryGap, describeStructuralGap } from '../faults/verification';
import type { DiagnosisScenario } from './scenario';

/** §41 verdict — note the third state. */
export type DiagnosisVerdict = 'success' | 'incomplete' | 'failure';

/** Which half of the answer was wrong (drives targeted feedback). */
export interface DiagnosisAnswer {
  /** What the learner says is wrong (§15A). */
  faultType: FaultType;
  /** Where the learner says it is (§15B), as a `locationChoices` key. */
  locationKey: string;
}

export interface DiagnosisEvaluation {
  verdict: DiagnosisVerdict;
  /** Convenience: `verdict === 'success'`. */
  success: boolean;

  /** Did they name the right fault type? */
  typeCorrect: boolean;
  /** Did they point at the right place? */
  locationCorrect: boolean;
  /** Both halves right — the §41 "correct diagnosis" column. */
  diagnosisCorrect: boolean;

  /** Has the injected fault actually gone from the circuit? */
  faultCleared: boolean;
  /** Does the repaired circuit behave like the healthy one again? */
  recovered: boolean;
  /** Why recovery was rejected, when it was. */
  recoveryGap: string | null;

  /** Simulation of the circuit as submitted. */
  simulation: SimulationResult;
  /** Short status line for the panel. */
  summary: string;
  /** Actionable next step — never names the fault unless already solved. */
  guidance: string;
}

export interface EvaluateDiagnosisOptions {
  appMode?: 'basic' | 'pro';
}

/**
 * Grade one submission.
 *
 * `userCircuit` is the learner's working copy — they may have cleared the
 * fault, deleted and re-run a cable, or swapped a device. Any of those count
 * as a repair provided the simulator agrees the installation is healthy again;
 * we deliberately do *not* require them to have used the "clear fault" button.
 */
export function evaluateDiagnosis(
  scenario: DiagnosisScenario,
  userCircuit: Circuit,
  answer: DiagnosisAnswer,
  options: EvaluateDiagnosisOptions = {},
): DiagnosisEvaluation {
  const appMode = options.appMode ?? 'pro';
  const simulation = simulate(userCircuit, { appMode });

  const typeCorrect = answer.faultType === scenario.fault.type;
  const locationCorrect = answer.locationKey === scenario.faultLocationKey;
  const diagnosisCorrect = typeCorrect && locationCorrect;

  // Repair is judged from three independent angles, because each alone is
  // foolable: `isFaultResolved` would accept a circuit "fixed" by deleting the
  // load; a behavioural diff would accept a severed earth; a structural diff
  // would accept a reconnected-but-still-faulted cable.
  const faultCleared = isFaultResolved(scenario.fault, userCircuit, simulation);
  const baseline = simulate(scenario.healthyCircuit, { appMode });
  // Behaviour *and* structure: some conductors (a CPC, a redundant strapper)
  // carry no current in normal service, so cutting them out is invisible to a
  // behavioural diff yet is emphatically not a repair.
  const recoveryGap =
    describeRecoveryGap(baseline, simulation) ??
    describeStructuralGap(scenario.healthyCircuit, userCircuit);
  const recovered = faultCleared && recoveryGap === null;

  const verdict: DiagnosisVerdict = !diagnosisCorrect
    ? 'failure'
    : recovered
      ? 'success'
      : 'incomplete';

  return {
    verdict,
    success: verdict === 'success',
    typeCorrect,
    locationCorrect,
    diagnosisCorrect,
    faultCleared,
    recovered,
    recoveryGap: faultCleared ? recoveryGap : 'the original fault is still present',
    simulation,
    summary: summarise(verdict, typeCorrect, locationCorrect),
    guidance: guide(scenario, verdict, typeCorrect, locationCorrect, faultCleared, recoveryGap),
  };
}

function summarise(
  verdict: DiagnosisVerdict,
  typeCorrect: boolean,
  locationCorrect: boolean,
): string {
  if (verdict === 'success') return 'Fault correctly identified and repaired.';
  if (verdict === 'incomplete') return 'Correct diagnosis — the circuit is not repaired yet.';
  if (typeCorrect) return 'Right kind of fault, wrong place.';
  if (locationCorrect) return 'Right place, wrong kind of fault.';
  return 'That is not the fault on this circuit.';
}

/**
 * What to do next.
 *
 * On a wrong answer this must not leak the correct one (§14/§17 — hints are
 * the only sanctioned disclosure channel, and they are rationed). Once the
 * diagnosis is right the answer is no longer a secret, so the repair guidance
 * can name the target explicitly.
 */
function guide(
  scenario: DiagnosisScenario,
  verdict: DiagnosisVerdict,
  typeCorrect: boolean,
  locationCorrect: boolean,
  faultCleared: boolean,
  recoveryGap: string | null,
): string {
  if (verdict === 'success') return 'The installation is working again. Well done.';

  if (verdict === 'incomplete') {
    const where = describeFaultTarget(scenario.healthyCircuit, scenario.fault.target);
    if (!faultCleared) {
      return `You have found it: ${where}. Now clear the fault and restore that connection.`;
    }
    return `The fault is cleared but the circuit still is not right — ${recoveryGap}.`;
  }

  if (typeCorrect) {
    return 'The fault type is right. Re-check which part of the circuit is affected.';
  }
  if (locationCorrect) {
    return 'You are looking in the right place. Re-check what has actually failed there.';
  }
  return 'Re-read the symptom and trace the circuit again — use a hint if you are stuck.';
}
