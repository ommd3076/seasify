import { describe, it, expect } from 'vitest';
import { processWaterLevelSeries } from '@/engine/science/residual';
import { generateSyntheticTimeSeries, expectCloseTo } from '../utils/testHelpers';
import { mockSandyBenchmark, mockBrokenSensorSeries } from '../fixtures/mockTideData';

describe('Tier 1 & Tier 2 Unit: Oceanographic Science Engine (residual.ts)', () => {
  describe('Residual Math & Basic Computation (R(t) = obs(t) - pred(t))', () => {
    it('returns empty array when given an empty input array', () => {
      expect(processWaterLevelSeries([])).toEqual([]);
    });

    it('calculates residual as exact difference between observed and predicted water level', () => {
      const raw = [
        {
          timestamp: '2026-11-12T00:00:00Z',
          observed: 2.45,
          predicted: 2.10,
        },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result).toHaveLength(1);
      expect(result[0].residual).toBeCloseTo(0.35, 4);
      expect(result[0].rateOfChange).toBeNull();
      expect(result[0].qualityFlag).toBe('verified');
    });

    it('calculates negative residuals correctly during depressed tides', () => {
      const raw = [
        {
          timestamp: '2026-11-12T00:00:00Z',
          observed: 1.20,
          predicted: 1.65,
        },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[0].residual).toBeCloseTo(-0.45, 4);
    });

    it('flags point as missing when observed water level is null', () => {
      const raw = [
        {
          timestamp: '2026-11-12T00:00:00Z',
          observed: null,
          predicted: 2.00,
        },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[0].residual).toBeNull();
      expect(result[0].qualityFlag).toBe('missing');
    });

    it('flags point as missing when predicted tide is null', () => {
      const raw = [
        {
          timestamp: '2026-11-12T00:00:00Z',
          observed: 2.15,
          predicted: null,
        },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[0].residual).toBeNull();
      expect(result[0].qualityFlag).toBe('missing');
    });
  });

  describe('Chronological Sorting & Temporal Alignment', () => {
    it('sorts out-of-order raw points chronologically before processing', () => {
      const raw = [
        { timestamp: '2026-11-12T00:12:00Z', observed: 2.30, predicted: 2.00 },
        { timestamp: '2026-11-12T00:00:00Z', observed: 2.10, predicted: 2.00 },
        { timestamp: '2026-11-12T00:06:00Z', observed: 2.20, predicted: 2.00 },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result.map(p => p.timestamp)).toEqual([
        '2026-11-12T00:00:00Z',
        '2026-11-12T00:06:00Z',
        '2026-11-12T00:12:00Z',
      ]);
      expect(result[0].residual).toBeCloseTo(0.10, 4);
      expect(result[1].residual).toBeCloseTo(0.20, 4);
      expect(result[2].residual).toBeCloseTo(0.30, 4);
    });
  });

  describe('Surge Velocity & Rate of Change (dR/dt)', () => {
    it('calculates rate of change (m/hr) across consecutive 6-minute intervals', () => {
      // dt = 6 minutes = 0.1 hours
      // dR = 0.22 - 0.10 = 0.12 m -> rate = 0.12 / 0.1 = 1.2 m/hr
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 2.10, predicted: 2.00 }, // residual: 0.10
        { timestamp: '2026-11-12T00:06:00Z', observed: 2.22, predicted: 2.00 }, // residual: 0.22
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[1].rateOfChange).toBeCloseTo(1.20, 3);
    });

    it('calculates negative rate of change during surge recession', () => {
      // dR = 0.10 - 0.25 = -0.15 m over 6 mins (0.1 hr) -> -1.5 m/hr
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 2.25, predicted: 2.00 }, // residual: 0.25
        { timestamp: '2026-11-12T00:06:00Z', observed: 2.10, predicted: 2.00 }, // residual: 0.10
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[1].rateOfChange).toBeCloseTo(-1.50, 3);
    });

    it('handles gap threshold by nullifying rate of change when dt exceeds threshold', () => {
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 2.00, predicted: 2.00 },
        { timestamp: '2026-11-12T01:00:00Z', observed: 2.50, predicted: 2.00 }, // 60 min gap (> 30 min default)
      ];
      const result = processWaterLevelSeries(raw, 30);
      expect(result[1].qualityFlag).toBe('missing');
      expect(result[1].rateOfChange).toBeNull();
    });

    it('respects custom gapThresholdMinutes parameter', () => {
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 2.00, predicted: 2.00 },
        { timestamp: '2026-11-12T00:20:00Z', observed: 2.10, predicted: 2.00 }, // 20 min interval
      ];
      // With threshold = 15 mins, 20 mins is a gap
      const with15 = processWaterLevelSeries(raw, 15);
      expect(with15[1].qualityFlag).toBe('missing');
      expect(with15[1].rateOfChange).toBeNull();

      // With threshold = 30 mins, 20 mins is within limits
      const with30 = processWaterLevelSeries(raw, 30);
      expect(with30[1].qualityFlag).toBe('verified');
      expect(with30[1].rateOfChange).not.toBeNull();
    });
  });

  describe('Rolling Statistics & Z-Score Computation', () => {
    it('computes rolling z-scores across multi-point windows', () => {
      // Build 25 points with baseline residuals and an injected anomaly at the end
      const raw = [];
      for (let i = 0; i < 25; i++) {
        const time = new Date(new Date('2026-11-12T00:00:00Z').getTime() + i * 6 * 60 * 1000).toISOString();
        const obs = i === 24 ? 3.5 : 2.0; // sudden spike at the end
        raw.push({ timestamp: time, observed: obs, predicted: 2.0 });
      }

      const result = processWaterLevelSeries(raw);
      expect(result).toHaveLength(25);
      // The last point with residual 1.5 against baseline 0.0 should have a large positive z-score
      expect(result[24].zScore).not.toBeNull();
      expect(result[24].zScore!).toBeGreaterThan(2.0);
    });

    it('returns zScore = 0 when standard deviation is near zero (flatline)', () => {
      const raw = [];
      for (let i = 0; i < 22; i++) {
        const time = new Date(new Date('2026-11-12T00:00:00Z').getTime() + i * 6 * 60 * 1000).toISOString();
        raw.push({ timestamp: time, observed: 2.0, predicted: 2.0 }); // constant residual = 0
      }
      const result = processWaterLevelSeries(raw);
      expect(result[20].zScore).toBe(0);
    });
  });

  describe('Synthetic & Benchmark Series Validation', () => {
    it('processes synthetic tidal series without unhandled errors', () => {
      const synthetic = generateSyntheticTimeSeries({ pointsCount: 30, surgeOffset: 0.50 });
      const raw = synthetic.map(p => ({
        timestamp: p.timestamp,
        observed: p.observed,
        predicted: p.predicted,
      }));
      const processed = processWaterLevelSeries(raw);
      expect(processed).toHaveLength(30);
      expect(processed.some(p => p.residual! >= 0.40)).toBe(true);
    });

    it('verifies Hurricane Sandy peak residual matches benchmark within tolerance', () => {
      const sandy = mockSandyBenchmark;
      expect(sandy.metrics.peakSurgeResidualMeters).toBeCloseTo(2.843, 3);
      // Convert 2.843 meters to feet: 2.843 * 3.28084 = 9.3274 ft (~9.33 ft)
      const feet = sandy.metrics.peakSurgeResidualMeters * 3.28084;
      expect(feet).toBeCloseTo(9.33, 1);
    });
  });
});
