import { describe, it, expect } from 'vitest';
import {
  encodePointToSymbol,
  encodeTimeSeries,
  DEFAULT_THRESHOLDS,
  ThresholdConfig,
} from '@/engine/science/symbolEncoder';
import { WaterLevelPoint, QualityFlag } from '@/types/noaa';

describe('Tier 1 & Tier 2 Unit: Symbol Discretization & Alphabet Encoder (symbolEncoder.ts)', () => {
  const makePoint = (residual: number | null, rateOfChange: number | null = 0, qualityFlag: any = 'verified'): WaterLevelPoint => ({
    timestamp: '2026-11-12T00:00:00Z',
    observed: residual !== null ? 2.0 + residual : null,
    predicted: 2.0,
    residual,
    rateOfChange,
    zScore: 0,
    qualityFlag,
  });

  describe('Concrete Alphabet (Σ = {L:F, L:S, L:R, N:F, N:S, N:R, H:F, H:S, H:R, GAP})', () => {
    it('encodes normal residual with steady trend as N:S', () => {
      const pt = makePoint(0.05, 0.0);
      const res = encodePointToSymbol(pt);
      expect(res.symbol).toBe('N:S');
      expect(res.residualCategory).toBe('N');
      expect(res.trendCategory).toBe('S');
    });

    it('encodes high residual with rising rate as H:R', () => {
      const pt = makePoint(0.35, 0.40);
      const res = encodePointToSymbol(pt);
      expect(res.symbol).toBe('H:R');
      expect(res.residualCategory).toBe('H');
      expect(res.trendCategory).toBe('R');
    });

    it('encodes high residual with steady rate as H:S (Hold)', () => {
      const pt = makePoint(0.30, 0.05);
      const res = encodePointToSymbol(pt);
      expect(res.symbol).toBe('H:S');
      expect(res.alias).toBe('Hold');
    });

    it('encodes low residual with falling rate as L:F', () => {
      const pt = makePoint(-0.35, -0.30);
      const res = encodePointToSymbol(pt);
      expect(res.symbol).toBe('L:F');
      expect(res.residualCategory).toBe('L');
      expect(res.trendCategory).toBe('F');
    });

    it('encodes missing water level or null residual as GAP', () => {
      const pt = makePoint(null, null, 'missing');
      const res = encodePointToSymbol(pt);
      expect(res.symbol).toBe('GAP');
      expect(res.alias).toBe('Gap');
      expect(res.confidence).toBe(1.0);
    });
  });

  describe('High-Level Event Aliases Mapping', () => {
    it('maps extreme positive residual (>= 0.50m) to Extreme alias', () => {
      const pt = makePoint(0.75, 0.10);
      const res = encodePointToSymbol(pt);
      expect(res.alias).toBe('Extreme');
    });

    it('maps rapid positive rate of change to Rise alias', () => {
      const pt = makePoint(0.15, 0.35); // normal residual, rapid climb
      const res = encodePointToSymbol(pt);
      expect(res.alias).toBe('Rise');
    });

    it('maps rapid negative rate of change to Fall alias', () => {
      const pt = makePoint(0.15, -0.40); // rapid drop
      const res = encodePointToSymbol(pt);
      expect(res.alias).toBe('Fall');
    });

    it('maps low residual to Low alias', () => {
      const pt = makePoint(-0.30, 0.0);
      const res = encodePointToSymbol(pt);
      expect(res.alias).toBe('Low');
    });

    it('maps small residual with near-zero velocity to Stabilize alias', () => {
      const pt = makePoint(0.02, 0.03);
      const res = encodePointToSymbol(pt);
      expect(res.alias).toBe('Stabilize');
    });
  });

  describe('Boundary Conditions & Hysteresis Band', () => {
    it('applies hysteresis when transitioning out of High residual state', () => {
      // Threshold is 0.20m, hysteresis is 0.02m (band: 0.18m)
      // When previous was 'H', 0.19m should remain 'H' due to hysteresis
      const pt = makePoint(0.19, 0.0);
      const withPrevH = encodePointToSymbol(pt, DEFAULT_THRESHOLDS, 'H');
      expect(withPrevH.residualCategory).toBe('H');

      // Without previous 'H', 0.19m is categorized as 'N'
      const withoutPrev = encodePointToSymbol(pt, DEFAULT_THRESHOLDS, 'N');
      expect(withoutPrev.residualCategory).toBe('N');
    });

    it('applies hysteresis when transitioning out of Low residual state', () => {
      // Neg threshold is -0.20m, hysteresis is 0.02m (band: -0.18m)
      // When previous was 'L', -0.19m should remain 'L'
      const pt = makePoint(-0.19, 0.0);
      const withPrevL = encodePointToSymbol(pt, DEFAULT_THRESHOLDS, 'L');
      expect(withPrevL.residualCategory).toBe('L');

      const withoutPrev = encodePointToSymbol(pt, DEFAULT_THRESHOLDS, 'N');
      expect(withoutPrev.residualCategory).toBe('N');
    });
  });

  describe('Custom Threshold Configurations', () => {
    it('respects user-customized threshold settings', () => {
      const custom: ThresholdConfig = {
        positiveResidualMeters: 0.10, // lowered threshold
        negativeResidualMeters: -0.10,
        extremeResidualMeters: 0.30,
        risingRateThreshold: 0.10,
        fallingRateThreshold: -0.10,
        gapThresholdMinutes: 15,
        minSustainedSamples: 2,
      };

      const pt = makePoint(0.12, 0.0);
      const res = encodePointToSymbol(pt, custom);
      expect(res.residualCategory).toBe('H'); // Would be 'N' under default (0.20)
    });
  });

  describe('Confidence Score Estimation', () => {
    it('yields higher confidence for points far from classification boundaries', () => {
      const nearBoundary = encodePointToSymbol(makePoint(0.21, 0.0));
      const farFromBoundary = encodePointToSymbol(makePoint(0.85, 0.0));

      expect(nearBoundary.confidence).toBeGreaterThanOrEqual(0.70);
      expect(farFromBoundary.confidence).toBeGreaterThan(nearBoundary.confidence);
      expect(farFromBoundary.confidence).toBeLessThanOrEqual(0.99);
    });
  });

  describe('Batch Time-Series Discretization (encodeTimeSeries)', () => {
    it('encodes an entire sequence of points into concrete symbols maintaining state continuity', () => {
      const points: WaterLevelPoint[] = [
        makePoint(0.05, 0.0),
        makePoint(0.25, 0.30),
        makePoint(0.35, 0.02),
        makePoint(0.10, -0.30),
      ];

      const encoded = encodeTimeSeries(points);
      expect(encoded).toHaveLength(4);
      expect(encoded[0].symbol).toBe('N:S');
      expect(encoded[1].symbol).toBe('H:R');
      expect(encoded[2].symbol).toBe('H:S');
      expect(encoded[3].symbol).toBe('N:F');
    });
  });
});
