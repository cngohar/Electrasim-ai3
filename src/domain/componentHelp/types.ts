/**
 * Component help content — shared data shape.
 *
 * Split verbatim from the former monolithic `componentHelp.ts`.
 */

export interface ComponentHelpData {
  title: string;
  category?: string;
  voltage?: string;
  amperage?: string;
  powerWatts?: string | number;
  breakingCapacity?: string;
  tripCurve?: string;
  frequency?: string;
  ipRating?: string;
  cableSize?: string;
  poles?: string;
  standards: string;
  overview: string;
  circuitBehavior: string;
  keySpecs: string[];
  quickTips: string[];
}

