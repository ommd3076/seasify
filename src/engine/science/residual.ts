import { WaterLevelPoint } from '@/types/noaa';

export interface ProcessedPoint extends WaterLevelPoint {
  rollingMean?: number;
  rollingStd?: number;
}

/**
 * Calculates water-level residual, rate of change (m/hr), and rolling statistics.
 * r(t) = H_observed(t) - H_predicted(t)
 * v_r(t) = (r(t) - r(t - dt)) / dt (m/hr)
 */
export function processWaterLevelSeries(
  rawPoints: Array<{
    timestamp: string;
    observed: number | null;
    predicted: number | null;
    quality?: 'verified' | 'preliminary' | 'interpolated' | 'missing';
  }>,
  gapThresholdMinutes = 30
): WaterLevelPoint[] {
  if (!rawPoints || rawPoints.length === 0) return [];

  // Sort chronologically
  const sorted = [...rawPoints].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const results: WaterLevelPoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentTime = new Date(current.timestamp).getTime();

    // Check if observed or predicted is missing
    const isMissing = current.observed === null || current.predicted === null || isNaN(current.observed) || isNaN(current.predicted);
    
    let residual: number | null = null;
    if (!isMissing && current.observed !== null && current.predicted !== null) {
      residual = parseFloat((current.observed - current.predicted).toFixed(4));
    }

    let rateOfChange: number | null = null;
    let qualityFlag = current.quality || (isMissing ? 'missing' : 'verified');

    // Calculate rate of change with respect to previous valid point
    if (i > 0 && residual !== null) {
      const prev = results[i - 1];
      const prevTime = new Date(prev.timestamp).getTime();
      const dtHours = (currentTime - prevTime) / (1000 * 60 * 60);

      // Check for large data gap
      if (dtHours * 60 > gapThresholdMinutes) {
        qualityFlag = 'missing';
        rateOfChange = null;
      } else if (dtHours > 0 && prev.residual !== null) {
        rateOfChange = parseFloat(((residual - prev.residual) / dtHours).toFixed(4));
      }
    }

    results.push({
      timestamp: current.timestamp,
      observed: current.observed,
      predicted: current.predicted,
      residual,
      rateOfChange,
      zScore: null, // Computed in second pass below
      qualityFlag: isMissing ? 'missing' : qualityFlag,
    });
  }

  // Second pass: Calculate rolling statistics and z-scores (window of 20 points, ~2 hours)
  const windowSize = 20;
  for (let i = 0; i < results.length; i++) {
    const startIdx = Math.max(0, i - windowSize + 1);
    const windowSlice = results.slice(startIdx, i + 1).filter(p => p.residual !== null);

    if (windowSlice.length >= 3 && results[i].residual !== null) {
      const residuals = windowSlice.map(p => p.residual as number);
      const mean = residuals.reduce((sum, v) => sum + v, 0) / residuals.length;
      const variance = residuals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / residuals.length;
      const std = Math.sqrt(variance);

      if (std > 0.001) {
        results[i].zScore = parseFloat((( (results[i].residual as number) - mean) / std).toFixed(2));
      } else {
        results[i].zScore = 0;
      }
    }
  }

  return results;
}
