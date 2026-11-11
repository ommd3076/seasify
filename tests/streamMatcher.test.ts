import { describe, it, expect } from 'vitest';
import { runStreamRecognition, runAllPatternsRecognition } from '@/engine/automata/streamMatcher';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';
import { generateScientificExplanation } from '@/engine/automata/explanation';
import { WaterLevelPoint } from '@/types/noaa';

describe('Stream Recognition & Automata Matcher', () => {
  const stationId = '8518750';
  const stationName = 'The Battery, NY';

  const createSyntheticPoints = (
    specs: Array<{ residual: number | null; rate: number | null; minutesFromStart: number; quality?: 'verified' | 'missing' }>
  ): WaterLevelPoint[] => {
    const baseTime = new Date('2026-11-12T00:00:00Z').getTime();
    return specs.map(s => ({
      timestamp: new Date(baseTime + s.minutesFromStart * 60 * 1000).toISOString(),
      observed: s.residual !== null ? 1.0 + s.residual : null,
      predicted: 1.0,
      residual: s.residual,
      rateOfChange: s.rate,
      zScore: 0,
      qualityFlag: s.quality || (s.residual === null ? 'missing' : 'verified'),
    }));
  };

  describe('Basic Stream Execution & Audit Traces', () => {
    it('returns empty matches and traces for empty points array', () => {
      const result = runStreamRecognition([], stationId, stationName);
      expect(result.matches).toEqual([]);
      expect(result.traces).toEqual([]);
    });

    it('generates an audit trace for each incoming point', () => {
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },
        { residual: 0.06, rate: 0.01, minutesFromStart: 6 },
      ]);
      const result = runStreamRecognition(points, stationId, stationName);

      expect(result.traces).toHaveLength(2);
      expect(result.traces[0]).toMatchObject({
        stepIndex: 0,
        timestamp: points[0].timestamp,
        residual: 0.05,
        rateOfChange: 0.0,
        symbol: 'N:S',
        symbolAlias: 'Stabilize',
        previousState: 'S0',
        activeState: 'S0',
        isAccepting: false,
      });
      expect(result.traces[0].symbolConfidence).toBeGreaterThanOrEqual(0.70);
    });
  });

  describe('Pattern Recognition across Predefined DFAs', () => {
    it('recognizes sustained elevated surge pattern', () => {
      const surgeDFA = PREDEFINED_PATTERNS.find(p => p.id === 'sustained_elevated')!;
      expect(surgeDFA).toBeDefined();

      // Normal -> Rise (residual > +0.20m, rate >= 0.20) -> Hold (residual > +0.20m, rate small) -> accepting S2
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },   // S0 (Normal)
        { residual: 0.35, rate: 0.30, minutesFromStart: 6 },  // S1 (Rise)
        { residual: 0.36, rate: 0.02, minutesFromStart: 12 }, // S2 (Hold => accepting!)
      ]);

      const result = runStreamRecognition(points, stationId, stationName, surgeDFA);
      expect(result.matches).toHaveLength(1);
      
      const match = result.matches[0];
      expect(match.patternId).toBe('sustained_elevated');
      expect(match.stationId).toBe(stationId);
      expect(match.stationName).toBe(stationName);
      expect(match.peakResidual).toBeCloseTo(0.36, 2);
      expect(match.statePath).toContain('S2');
      expect(match.triggerSteps.length).toBeGreaterThanOrEqual(2);
      expect(match.severity).toBe('Moderate');
    });

    it('recognizes sustained depressed tide (blowout)', () => {
      const blowoutDFA = PREDEFINED_PATTERNS.find(p => p.id === 'sustained_depressed')!;
      expect(blowoutDFA).toBeDefined();

      // Normal -> Fall (residual < -0.20m, rate <= -0.20) -> Low (residual < -0.20m, steady) -> accepting S2
      const points = createSyntheticPoints([
        { residual: -0.05, rate: 0.0, minutesFromStart: 0 },   // S0 (Normal)
        { residual: -0.30, rate: -0.25, minutesFromStart: 6 }, // S1 (Fall)
        { residual: -0.32, rate: -0.02, minutesFromStart: 12 }, // S2 (Low => accepting!)
      ]);

      const result = runStreamRecognition(points, stationId, stationName, blowoutDFA);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].patternId).toBe('sustained_depressed');
      expect(result.matches[0].peakResidual).toBeCloseTo(-0.32, 2);
    });

    it('recognizes rapid water-level rise', () => {
      const rapidDFA = PREDEFINED_PATTERNS.find(p => p.id === 'rapid_rise')!;
      expect(rapidDFA).toBeDefined();

      // S0 (Steady) -> S1 (Surge Front on rateOfChange >= +0.20 m/hr)
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },   // S0
        { residual: 0.25, rate: 0.45, minutesFromStart: 6 },  // S1 (Rapid rise => accepting!)
      ]);

      const result = runStreamRecognition(points, stationId, stationName, rapidDFA);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].patternId).toBe('rapid_rise');
      expect(result.matches[0].statePath).toContain('S1');
    });

    it('recognizes repeated residual oscillation (seiche)', () => {
      const seicheDFA = PREDEFINED_PATTERNS.find(p => p.id === 'oscillatory')!;
      expect(seicheDFA).toBeDefined();

      // S0 -> Rise -> S1 -> Fall -> S2 -> Rise -> S3 (accepting)
      const points = createSyntheticPoints([
        { residual: 0.0, rate: 0.0, minutesFromStart: 0 },    // S0
        { residual: 0.30, rate: 0.35, minutesFromStart: 6 },  // S1 (Rise)
        { residual: -0.25, rate: -0.40, minutesFromStart: 12 }, // S2 (Fall)
        { residual: 0.30, rate: 0.35, minutesFromStart: 18 },  // S3 (Rise => accepting!)
      ]);

      const result = runStreamRecognition(points, stationId, stationName, seicheDFA);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].patternId).toBe('oscillatory');
      expect(result.matches[0].statePath).toContain('S3');
    });

    it('recognizes telemetry observation gap', () => {
      const gapDFA = PREDEFINED_PATTERNS.find(p => p.id === 'record_gap')!;
      expect(gapDFA).toBeDefined();

      // S0 (Online) -> Gap (missing reading) -> S1 (Telemetry Gap => accepting!)
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },
        { residual: null, rate: null, minutesFromStart: 36, quality: 'missing' },
      ]);

      const result = runStreamRecognition(points, stationId, stationName, gapDFA);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].patternId).toBe('record_gap');
      expect(result.matches[0].statePath).toContain('S1');
    });

    it('recognizes abnormal recovery pulse', () => {
      const recDFA = PREDEFINED_PATTERNS.find(p => p.id === 'abnormal_recovery')!;
      // S0 -> Rise -> S1 -> Hold -> S1 -> Fall -> S2 (accepting!)
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },   // S0
        { residual: 0.30, rate: 0.25, minutesFromStart: 6 },  // S1
        { residual: 0.35, rate: 0.05, minutesFromStart: 12 }, // S1 (Hold)
        { residual: 0.15, rate: -0.30, minutesFromStart: 18 }, // S2 (Fall => accepting!)
      ]);

      const result = runStreamRecognition(points, stationId, stationName, recDFA);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].patternId).toBe('abnormal_recovery');
      expect(result.matches[0].statePath).toContain('S2');
    });
  });

  describe('Deduplication & Multi-Pattern Stream Run', () => {
    it('deduplicates overlapping matches within 60 minutes, preserving highest peak', () => {
      const rapidDFA = PREDEFINED_PATTERNS.find(p => p.id === 'rapid_rise')!;
      
      // Two rapid rises within 12 minutes (well inside 60-minute deduplication window)
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },
        { residual: 0.25, rate: 0.30, minutesFromStart: 6 },  // Hit 1: peak 0.25
        { residual: 0.45, rate: 0.35, minutesFromStart: 12 }, // Hit 2: peak 0.45
      ]);

      const result = runStreamRecognition(points, stationId, stationName, rapidDFA);
      // Both hits should be deduplicated into a single unified match
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].peakResidual).toBeCloseTo(0.45, 2);
    });

    it('runs all predefined patterns recognition simultaneously and sorts chronologically', () => {
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },
        { residual: 0.35, rate: 0.30, minutesFromStart: 6 },
        { residual: 0.36, rate: 0.02, minutesFromStart: 12 },
        { residual: 0.10, rate: -0.35, minutesFromStart: 18 },
      ]);

      const result = runAllPatternsRecognition(points, stationId, stationName);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.traces.length).toBe(4);

      // Matches should be sorted chronologically (newest start time first)
      for (let i = 0; i < result.matches.length - 1; i++) {
        const tCurr = new Date(result.matches[i].startTime).getTime();
        const tNext = new Date(result.matches[i + 1].startTime).getTime();
        expect(tCurr).toBeGreaterThanOrEqual(tNext);
      }
    });

    it('assigns High severity when peak residual exceeds extreme threshold', () => {
      const rapidDFA = PREDEFINED_PATTERNS.find(p => p.id === 'rapid_rise')!;
      const points = createSyntheticPoints([
        { residual: 0.05, rate: 0.0, minutesFromStart: 0 },
        { residual: 0.65, rate: 0.40, minutesFromStart: 6 }, // 0.65m > 0.50m (extreme)
      ]);

      const result = runStreamRecognition(points, stationId, stationName, rapidDFA);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].severity).toBe('High');
    });
  });

  describe('Scientific Explanation Generator', () => {
    it('generates oceanographically sound text for each pattern type', () => {
      const testCases = [
        { id: 'abnormal_recovery', peak: 0.62, expected: 'transient elevated surge pulse' },
        { id: 'sustained_elevated', peak: 0.48, expected: 'sustained positive residual' },
        { id: 'sustained_depressed', peak: -0.55, expected: 'sustained negative residual (blowout)' },
        { id: 'rapid_rise', peak: 0.42, expected: 'rapid rate of residual increase' },
        { id: 'oscillatory', peak: 0.38, expected: 'Periodic water-level oscillations' },
        { id: 'record_gap', peak: 0.0, expected: 'observation telemetry dropout' },
      ];

      for (const tc of testCases) {
        const text = generateScientificExplanation(
          tc.id,
          tc.peak,
          120,
          stationName,
          '2026-11-12T14:30:00Z'
        );
        expect(text).toContain(tc.expected);
        expect(text).toContain(stationName);
      }
    });

    it('formats positive and negative residual peaks with units', () => {
      const posText = generateScientificExplanation('sustained_elevated', 0.85, 90, stationName, '2026-11-12T10:00:00Z');
      expect(posText).toContain('+0.85 m');

      const negText = generateScientificExplanation('sustained_depressed', -0.42, 45, stationName, '2026-11-12T10:00:00Z');
      expect(negText).toContain('-0.42 m');
    });

    it('formats duration in hours when > 60 minutes and minutes when <= 60 minutes', () => {
      const hourText = generateScientificExplanation('sustained_elevated', 0.5, 180, stationName, '2026-11-12T10:00:00Z');
      expect(hourText).toContain('3 hours');

      const minText = generateScientificExplanation('sustained_elevated', 0.3, 30, stationName, '2026-11-12T10:00:00Z');
      expect(minText).toContain('30 minutes');
    });
  });
});
