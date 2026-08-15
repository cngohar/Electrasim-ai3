/**
 * Validation report types.
 *
 * Split verbatim from the former monolithic `circuitValidation.ts`.
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type QuickFixType =
  | 'add_earth_wire'
  | 'upgrade_mcb'
  | 'increase_cable_gauge'
  | 'rewire_switch_live'
  | 'add_rcd'
  | 'add_power_supply';

export interface QuickFixAction {
  label: string;
  type: QuickFixType;
  componentId?: string;
  wireId?: string;
  targetMaxAmps?: number;
  targetCableMm2?: number;
}

export interface DetailedStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface DetailedBreakdown {
  bs7671Regulation: string;
  physicsExplanation: string;
  steps: DetailedStep[];
  practicalTip: string;
}

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  title: string;
  description: string;
  recommendation: string;
  componentId?: string;
  wireId?: string;
  category:
    | 'grounding'
    | 'protection'
    | 'cable_sizing'
    | 'continuity'
    | 'short_circuit'
    | 'polarity'
    | 'configuration';
  quickFix?: QuickFixAction;
  detailedBreakdown?: DetailedBreakdown;
}

export interface PassedCheck {
  id: string;
  title: string;
  description: string;
}

export interface ValidationReport {
  timestamp: number;
  score: number; // 0 - 100
  status: 'pass' | 'warning' | 'fail' | 'incomplete' | 'empty';
  isEmpty?: boolean;
  isIncomplete?: boolean;
  summary: {
    errorsCount: number;
    warningsCount: number;
    infoCount: number;
    passedCount: number;
  };
  issues: ValidationIssue[];
  passedChecks: PassedCheck[];
}

/**
 * Validates a circuit against common electrical design flaws & BS 7671 standards.
 */
