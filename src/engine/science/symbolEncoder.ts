import { ConcreteSymbol, EventAlias, ResidualCategory, ThresholdConfig, TrendCategory } from '@/types/automata';
import { WaterLevelPoint } from '@/types/noaa';

export type { ThresholdConfig };

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  positiveResidualMeters: 0.20,
  negativeResidualMeters: -0.20,
  extremeResidualMeters: 0.50,
  risingRateThreshold: 0.20, // m/hr
  fallingRateThreshold: -0.20, // m/hr
  gapThresholdMinutes: 30,
  minSustainedSamples: 3,
};

export interface EncodedSymbolResult {
  symbol: ConcreteSymbol;
  alias: EventAlias;
  residualCategory: ResidualCategory | 'GAP';
  trendCategory: TrendCategory | 'GAP';
  confidence: number;
}

/**
 * Encodes a water-level observation point into a formal finite alphabet symbol.
 */
export function encodePointToSymbol(
  point: WaterLevelPoint,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS,
  previousCategory?: ResidualCategory
): EncodedSymbolResult {
  // If point is missing or flagged with large gap
  if (point.qualityFlag === 'missing' || point.residual === null) {
    return {
      symbol: 'GAP',
      alias: 'Gap',
      residualCategory: 'GAP',
      trendCategory: 'GAP',
      confidence: 1.0,
    };
  }

  const r = point.residual;
  const vr = point.rateOfChange ?? 0;
  const hysteresis = 0.02; // 2 cm hysteresis to avoid jitter at boundary

  // 1. Determine Residual Category (L, N, H) with hysteresis
  let resCat: ResidualCategory = 'N';
  const posThresh = thresholds.positiveResidualMeters;
  const negThresh = thresholds.negativeResidualMeters;

  if (previousCategory === 'H') {
    resCat = r > (posThresh - hysteresis) ? 'H' : (r < negThresh ? 'L' : 'N');
  } else if (previousCategory === 'L') {
    resCat = r < (negThresh + hysteresis) ? 'L' : (r > posThresh ? 'H' : 'N');
  } else {
    if (r > posThresh) {
      resCat = 'H';
    } else if (r < negThresh) {
      resCat = 'L';
    } else {
      resCat = 'N';
    }
  }

  // 2. Determine Trend Category (F, S, R)
  let trendCat: TrendCategory = 'S';
  if (vr >= thresholds.risingRateThreshold) {
    trendCat = 'R';
  } else if (vr <= thresholds.fallingRateThreshold) {
    trendCat = 'F';
  } else {
    trendCat = 'S';
  }

  // 3. Concrete symbol combination
  const symbol = `${resCat}:${trendCat}` as ConcreteSymbol;

  // 4. Map to high-level EventAlias
  let alias: EventAlias = 'Normal';
  if (r >= thresholds.extremeResidualMeters) {
    alias = 'Extreme';
  } else if (trendCat === 'R') {
    alias = 'Rise';
  } else if (trendCat === 'F') {
    alias = 'Fall';
  } else if (resCat === 'H' && trendCat === 'S') {
    alias = 'Hold';
  } else if (resCat === 'L') {
    alias = 'Low';
  } else if (resCat === 'N' && Math.abs(vr) < 0.10) {
    alias = 'Stabilize';
  }

  // Confidence calculation based on distance from nearest threshold
  let distToThresh = Math.min(Math.abs(r - posThresh), Math.abs(r - negThresh));
  let confidence = Math.min(0.99, Math.max(0.70, 0.75 + distToThresh * 0.5));

  return {
    symbol,
    alias,
    residualCategory: resCat,
    trendCategory: trendCat,
    confidence: parseFloat(confidence.toFixed(2)),
  };
}

/**
 * Encodes an entire time-series of WaterLevelPoints into concrete symbols.
 */
export function encodeTimeSeries(
  points: WaterLevelPoint[],
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): EncodedSymbolResult[] {
  const results: EncodedSymbolResult[] = [];
  let prevCat: ResidualCategory | undefined = undefined;

  for (const pt of points) {
    const encoded = encodePointToSymbol(pt, thresholds, prevCat);
    results.push(encoded);
    if (encoded.residualCategory !== 'GAP') {
      prevCat = encoded.residualCategory;
    }
  }

  return results;
}
