import { describe, it, expect } from 'vitest';
import { runStreamRecognition } from '@/engine/automata/streamMatcher';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';
import { DEFAULT_THRESHOLDS } from '@/engine/science/symbolEncoder';
import { generateSyntheticTimeSeries } from '../utils/testHelpers';

describe('Tier 3: Web Worker Automata Pattern Recognition Engine', () => {
  it('processes water-level streams and generates recognition matches synchronously or in worker', () => {
    const mockPoints = generateSyntheticTimeSeries({ pointsCount: 48, baseLevel: 1.5, surgeOffset: 0.4 });
    const dfa = PREDEFINED_PATTERNS[0];

    const result = runStreamRecognition(
      mockPoints,
      '8518750',
      'The Battery, NY',
      dfa,
      DEFAULT_THRESHOLDS
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result.matches)).toBe(true);
    expect(Array.isArray(result.traces)).toBe(true);
    expect(result.traces.length).toBe(mockPoints.length);
  });

  it('correctly handles empty streams without errors', () => {
    const result = runStreamRecognition([], '8518750', 'The Battery, NY');
    expect(result.matches).toHaveLength(0);
    expect(result.traces).toHaveLength(0);
  });
});
