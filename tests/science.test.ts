import { describe, it, expect } from 'vitest';
import { processWaterLevelSeries } from '@/engine/science/residual';
import {
  encodePointToSymbol,
  encodeTimeSeries,
  DEFAULT_THRESHOLDS,
} from '@/engine/science/symbolEncoder';
import { ThresholdConfig } from '@/types/automata';
import { WaterLevelPoint } from '@/types/noaa';

describe('Water-Level Science Engine', () => {
  describe('processWaterLevelSeries', () => {
    it('returns empty array when given empty input', () => {
      expect(processWaterLevelSeries([])).toEqual([]);
    });

    it('calculates residual as observed minus predicted', () => {
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

    it('sorts points chronologically before processing', () => {
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

    it('calculates rate of change in meters/hour across consecutive 6-minute samples', () => {
      // dt = 6 minutes = 0.1 hours
      // R(t0) = 0.10, R(t1) = 0.25 => dR/dt = (0.25 - 0.10) / 0.1 = 1.50 m/hr
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 1.10, predicted: 1.00 },
        { timestamp: '2026-11-12T00:06:00Z', observed: 1.25, predicted: 1.00 },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[1].rateOfChange).toBeCloseTo(1.50, 4);
    });

    it('calculates negative rate of change during falling surge', () => {
      // dt = 12 minutes = 0.2 hours
      // R(t0) = 0.50, R(t1) = 0.30 => dR/dt = (0.30 - 0.50) / 0.2 = -1.00 m/hr
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 1.50, predicted: 1.00 },
        { timestamp: '2026-11-12T00:12:00Z', observed: 1.30, predicted: 1.00 },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[1].rateOfChange).toBeCloseTo(-1.00, 4);
    });

    it('flags data gap when delta t exceeds gap threshold (default 30 min)', () => {
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 1.50, predicted: 1.00 },
        // 45 minute gap > 30 min threshold
        { timestamp: '2026-11-12T00:45:00Z', observed: 1.80, predicted: 1.00 },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[1].qualityFlag).toBe('missing');
      expect(result[1].rateOfChange).toBeNull();
    });

    it('handles missing or null observed/predicted values gracefully', () => {
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: null, predicted: 1.00 },
        { timestamp: '2026-11-12T00:06:00Z', observed: 1.20, predicted: null },
        { timestamp: '2026-11-12T00:12:00Z', observed: NaN, predicted: 1.00 },
        { timestamp: '2026-11-12T00:18:00Z', observed: 1.30, predicted: 1.00 },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[0].residual).toBeNull();
      expect(result[0].qualityFlag).toBe('missing');
      expect(result[1].residual).toBeNull();
      expect(result[1].qualityFlag).toBe('missing');
      expect(result[2].residual).toBeNull();
      expect(result[2].qualityFlag).toBe('missing');
      expect(result[3].residual).toBeCloseTo(0.30, 4);
      // Since previous point had null residual, rateOfChange is null
      expect(result[3].rateOfChange).toBeNull();
    });

    it('computes rolling statistics and z-scores over sliding window (>= 3 points)', () => {
      // 5 points with residuals: 0.10, 0.20, 0.30, 0.40, 0.50
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 1.10, predicted: 1.00 },
        { timestamp: '2026-11-12T00:06:00Z', observed: 1.20, predicted: 1.00 },
        { timestamp: '2026-11-12T00:12:00Z', observed: 1.30, predicted: 1.00 },
        { timestamp: '2026-11-12T00:18:00Z', observed: 1.40, predicted: 1.00 },
        { timestamp: '2026-11-12T00:24:00Z', observed: 1.50, predicted: 1.00 },
      ];
      const result = processWaterLevelSeries(raw);
      // First two points have < 3 samples in window, so zScore is null
      expect(result[0].zScore).toBeNull();
      expect(result[1].zScore).toBeNull();
      // Third point has 3 samples [0.1, 0.2, 0.3]: mean=0.2, var=((0.01 + 0 + 0.01)/3)=0.00667, std=0.08165
      // z = (0.3 - 0.2) / 0.08165 = 1.22
      expect(result[2].zScore).toBeCloseTo(1.22, 1);
      expect(typeof result[4].zScore).toBe('number');
    });

    it('sets zScore to 0 when variance is zero (all identical residuals)', () => {
      const raw = [
        { timestamp: '2026-11-12T00:00:00Z', observed: 1.20, predicted: 1.00 },
        { timestamp: '2026-11-12T00:06:00Z', observed: 1.20, predicted: 1.00 },
        { timestamp: '2026-11-12T00:12:00Z', observed: 1.20, predicted: 1.00 },
      ];
      const result = processWaterLevelSeries(raw);
      expect(result[2].zScore).toBe(0);
    });
  });

  describe('encodePointToSymbol & encodeTimeSeries', () => {
    const makePoint = (residual: number | null, rateOfChange: number | null, quality: 'verified' | 'missing' = 'verified'): WaterLevelPoint => ({
      timestamp: '2026-11-12T00:00:00Z',
      observed: residual !== null ? 1.0 + residual : null,
      predicted: 1.0,
      residual,
      rateOfChange,
      zScore: null,
      qualityFlag: quality,
    });

    it('encodes missing points as GAP symbol and alias', () => {
      const missingPoint = makePoint(null, null, 'missing');
      const encoded = encodePointToSymbol(missingPoint);
      expect(encoded.symbol).toBe('GAP');
      expect(encoded.alias).toBe('Gap');
      expect(encoded.residualCategory).toBe('GAP');
      expect(encoded.trendCategory).toBe('GAP');
      expect(encoded.confidence).toBe(1.0);
    });

    it('encodes normal baseline points (within ±0.20m and small rate)', () => {
      const pt = makePoint(0.05, 0.02);
      const encoded = encodePointToSymbol(pt);
      expect(encoded.residualCategory).toBe('N');
      expect(encoded.trendCategory).toBe('S');
      expect(encoded.symbol).toBe('N:S');
      expect(encoded.alias).toBe('Stabilize');
    });

    it('encodes high residual and rising rate as H:R and alias Rise', () => {
      const pt = makePoint(0.35, 0.30);
      const encoded = encodePointToSymbol(pt);
      expect(encoded.residualCategory).toBe('H');
      expect(encoded.trendCategory).toBe('R');
      expect(encoded.symbol).toBe('H:R');
      expect(encoded.alias).toBe('Rise');
    });

    it('encodes high steady residual as H:S and alias Hold', () => {
      const pt = makePoint(0.35, 0.05);
      const encoded = encodePointToSymbol(pt);
      expect(encoded.residualCategory).toBe('H');
      expect(encoded.trendCategory).toBe('S');
      expect(encoded.symbol).toBe('H:S');
      expect(encoded.alias).toBe('Hold');
    });

    it('encodes extreme residual (>= 0.50m) as alias Extreme', () => {
      const pt = makePoint(0.65, 0.05);
      const encoded = encodePointToSymbol(pt);
      expect(encoded.residualCategory).toBe('H');
      expect(encoded.alias).toBe('Extreme');
    });

    it('encodes low residual (depressed tide / blowout) with alias Low', () => {
      const pt = makePoint(-0.35, -0.05);
      const encoded = encodePointToSymbol(pt);
      expect(encoded.residualCategory).toBe('L');
      expect(encoded.symbol).toBe('L:S');
      expect(encoded.alias).toBe('Low');
    });

    it('encodes falling rate as trendCategory F and alias Fall', () => {
      const pt = makePoint(0.10, -0.25);
      const encoded = encodePointToSymbol(pt);
      expect(encoded.trendCategory).toBe('F');
      expect(encoded.alias).toBe('Fall');
    });

    it('applies hysteresis to prevent chatter at boundaries', () => {
      // Positive threshold is 0.20, hysteresis is 0.02
      // If previous category was 'H', residual of 0.19 (> 0.18) remains 'H'
      const ptBorder = makePoint(0.19, 0.0);
      const withPrevH = encodePointToSymbol(ptBorder, DEFAULT_THRESHOLDS, 'H');
      expect(withPrevH.residualCategory).toBe('H');

      // Without previous 'H', 0.19 is categorized as 'N'
      const withNoPrev = encodePointToSymbol(ptBorder, DEFAULT_THRESHOLDS, undefined);
      expect(withNoPrev.residualCategory).toBe('N');

      // Negative threshold is -0.20
      // If previous category was 'L', residual of -0.19 (< -0.18) remains 'L'
      const ptLowBorder = makePoint(-0.19, 0.0);
      const withPrevL = encodePointToSymbol(ptLowBorder, DEFAULT_THRESHOLDS, 'L');
      expect(withPrevL.residualCategory).toBe('L');

      const withNoPrevL = encodePointToSymbol(ptLowBorder, DEFAULT_THRESHOLDS, undefined);
      expect(withNoPrevL.residualCategory).toBe('N');
    });

    it('encodes full time series correctly and threads hysteresis', () => {
      const points: WaterLevelPoint[] = [
        makePoint(0.05, 0.0),   // N:S
        makePoint(0.25, 0.25),  // H:R -> Rise
        makePoint(0.19, 0.0),   // Stays H due to hysteresis -> Hold
        makePoint(0.15, -0.25), // Falls below 0.18 -> N:F -> Fall
        makePoint(null, null, 'missing'), // GAP
      ];
      const encoded = encodeTimeSeries(points);
      expect(encoded).toHaveLength(5);
      expect(encoded[0].residualCategory).toBe('N');
      expect(encoded[1].residualCategory).toBe('H');
      expect(encoded[2].residualCategory).toBe('H'); // Hysteresis preserved
      expect(encoded[3].residualCategory).toBe('N');
      expect(encoded[4].symbol).toBe('GAP');
    });

    it('respects custom threshold configuration', () => {
      const customConfig: ThresholdConfig = {
        positiveResidualMeters: 0.10,
        negativeResidualMeters: -0.10,
        extremeResidualMeters: 0.30,
        risingRateThreshold: 0.10,
        fallingRateThreshold: -0.10,
        gapThresholdMinutes: 15,
        minSustainedSamples: 2,
      };
      const pt = makePoint(0.12, 0.05);
      const encoded = encodePointToSymbol(pt, customConfig);
      // Under custom config (+0.10), 0.12 is high ('H')
      expect(encoded.residualCategory).toBe('H');
    });
  });
});
