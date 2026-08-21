/**
 * Declarative challenge types (plan §5).
 *
 * A challenge is data: what the learner must build, the parts they may use,
 * the rules that judge their circuit, the hints that guide them, and the
 * message they see when it works. No React, no store, no generator.
 */

import type { Circuit } from '../../types';
import type { ChallengeDifficulty } from '../types';
import type { Rule } from './rules';

/** Overall challenge state (plan §6). */
export type ChallengeState = 'not-started' | 'in-progress' | 'has-errors' | 'complete';

/** Stable, human-facing challenge id (plan §34: never stored in circuit JSON). */
export type ChallengeId =
  | 'protected-lamp'
  | 'push-button-doorbell'
  | 'rcbo-socket'
  | 'two-way-staircase'
  | 'open-neutral-repair'
  | 'reverse-polarity'
  | 'missing-earth'
  | 'distribution-board';

/** One structured step shown in the objective panel (plan §5 `steps`). */
export interface ChallengeStep {
  /** 1-based step number. */
  no: number;
  /** Plain-English instruction. */
  text: string;
}

/** One progressive hint level (plan §10: concept → component → connection). */
export interface ChallengeHint {
  level: 1 | 2 | 3;
  text: string;
}

/**
 * A declarative challenge definition (plan §5).
 *
 * `starter` is the circuit loaded into the editor on start (possibly with a
 * deliberate fault for repair challenges). `rules` is the ordered checklist
 * the validator evaluates — including functional (interaction-evidence)
 * rules, which run the real simulator with evidence states (plan §8).
 */
export interface ChallengeDefinition {
  id: ChallengeId;
  version: number;
  title: string;
  difficulty: ChallengeDifficulty;
  /** Estimated completion time in minutes (plan §23–§25). */
  estimatedMinutes: number;

  /** One-line goal (the headline). */
  objective: string;
  /** Short briefing paragraph. */
  brief: string;
  /** What the finished circuit teaches. */
  teaches: string;
  /** Ordered build/repair steps shown in the panel. */
  steps: ChallengeStep[];

  /** The circuit the learner starts from (repair challenges carry the fault). */
  starter: Circuit;
  /**
   * Component types the palette exposes during this challenge, or `null` for
   * the unrestricted palette. Placing anything outside the list produces a
   * warning rather than a rejection (plan §20).
   */
  allowedComponents: readonly string[] | null;

  /** The ordered rule checklist (plan §6, §8). */
  rules: Rule[];

  /** Three progressive hints (plan §10). */
  hints: ChallengeHint[];
  /** Completion message (plan §23–§25). */
  completionMessage: string;
}
