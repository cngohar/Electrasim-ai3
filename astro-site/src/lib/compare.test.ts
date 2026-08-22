import { describe, expect, it } from 'vitest';
import {
  closeWiringAlternatives,
  comparisonFaqs,
  comparisonReviewedIso,
  comparisonTools,
  taskFits,
} from './compare';

describe('comparison page data', () => {
  it('keeps the main comparison balanced and uniquely addressable', () => {
    expect(comparisonTools).toHaveLength(6);
    expect(comparisonTools[0]?.id).toBe('electrasim');
    expect(new Set(comparisonTools.map((tool) => tool.id)).size).toBe(comparisonTools.length);
  });

  it('backs every profile with secure official sources', () => {
    const profiles = [...comparisonTools, ...closeWiringAlternatives];

    for (const profile of profiles) {
      expect(profile.sources.length).toBeGreaterThan(0);
      expect(profile.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
      expect(profile.officialUrl.startsWith('https://')).toBe(true);
    }
  });

  it('provides visible FAQ and task-fit content for structured data and navigation', () => {
    expect(comparisonFaqs.length).toBeGreaterThanOrEqual(5);
    expect(taskFits).toHaveLength(comparisonTools.length);
    expect(comparisonReviewedIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
