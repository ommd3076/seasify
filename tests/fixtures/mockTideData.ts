import { WaterLevelPoint } from '@/types/noaa';
import { ConcreteSymbol, EventAlias } from '@/types/automata';

// ==========================================
// 1. 24-Hour Continuous 6-Minute Series (240 samples)
// ==========================================

export function generate24HourTideSeries(baseTime = new Date('2026-11-12T00:00:00Z')): WaterLevelPoint[] {
  const points: WaterLevelPoint[] = [];
  const count = 240; // 24 hours * 10 samples/hr (6-min interval)

  for (let i = 0; i < count; i++) {
    const timeMs = baseTime.getTime() + i * 6 * 60 * 1000;
    const timestamp = new Date(timeMs).toISOString();
    const hours = (i * 6) / 60;

    // Semi-diurnal astronomical tide (period = 12.42 hrs, amp = 0.85m, mean = 1.45m)
    const predicted = parseFloat((1.45 + 0.85 * Math.sin((2 * Math.PI * hours) / 12.42)).toFixed(4));
    // Minor normal residual variation
    const residual = parseFloat((0.05 * Math.cos(hours / 2)).toFixed(4));
    const observed = parseFloat((predicted + residual).toFixed(4));

    let rateOfChange: number | null = null;
    if (i > 0) {
      const prev = points[i - 1];
      const dtHours = 0.1; // 6 mins
      if (prev.residual !== null) {
        rateOfChange = parseFloat(((residual - prev.residual) / dtHours).toFixed(4));
      }
    }

    points.push({
      timestamp,
      observed,
      predicted,
      residual,
      rateOfChange,
      zScore: 0.1,
      qualityFlag: 'verified',
    });
  }

  return points;
}

export const mock24HourTideSeries = generate24HourTideSeries();

// ==========================================
// 2. Hurricane Sandy Benchmark Dataset (Station 8518750)
// ==========================================

/**
 * Historical Hurricane Sandy Benchmark (The Battery, NY - Oct 29-30, 2012)
 * Peak Observed: 14.055 ft (4.284 m)
 * Peak Predicted: 4.727 ft (1.441 m)
 * Peak Surge Residual: +9.328 ft (+2.843 m)
 * Peak Timestamp: 2012-10-30T01:24:00Z
 * Barometric Pressure minimum: 964.1 mb
 */
export interface StormBenchmarkFixture {
  stationId: string;
  stationName: string;
  eventName: string;
  timeRange: { start: string; end: string };
  metrics: {
    peakObserved: number; // in meters
    predictedAtPeak: number; // in meters
    peakSurgeResidualMeters: number; // +2.843 m
    peakSurgeResidualFeet: number; // +9.328 ft
    peakTimestamp: string;
    minPressureMb: number;
  };
  expectedAutomata: {
    patternId: 'sustained_elevated';
    severity: 'High';
    minConfidence: number;
    statePathIncludes: string[];
  };
  points: WaterLevelPoint[];
}

export function generateSandyBenchmark(): StormBenchmarkFixture {
  const points: WaterLevelPoint[] = [];
  const baseTime = new Date('2012-10-29T12:00:00Z');
  const count = 48; // 48 samples over 4.8 hours capturing peak approach, landfall, and surge

  const peakIdx = 28; // corresponds to landfall window
  const peakResidualMeters = 2.843; // +9.328 ft
  const peakObservedMeters = 4.284; // 14.055 ft
  const predictedAtPeakMeters = 1.441; // 4.727 ft

  for (let i = 0; i < count; i++) {
    const tMs = baseTime.getTime() + i * 6 * 60 * 1000;
    const timestamp = new Date(tMs).toISOString();
    const hours = (i * 6) / 60;

    const predicted = parseFloat((1.40 + 0.60 * Math.sin((2 * Math.PI * hours) / 12.42)).toFixed(4));
    
    // Gaussian-like surge pulse peaked at peakIdx
    const dist = Math.abs(i - peakIdx);
    const surge = parseFloat((peakResidualMeters * Math.exp(-Math.pow(dist / 10, 2))).toFixed(4));
    const observed = parseFloat((predicted + surge).toFixed(4));
    const residual = surge;

    let rateOfChange: number | null = null;
    if (i > 0 && points[i - 1].residual !== null) {
      rateOfChange = parseFloat(((residual - (points[i - 1].residual as number)) / 0.1).toFixed(4));
    }

    points.push({
      timestamp,
      observed: i === peakIdx ? peakObservedMeters : observed,
      predicted: i === peakIdx ? predictedAtPeakMeters : predicted,
      residual: i === peakIdx ? peakResidualMeters : residual,
      rateOfChange,
      zScore: dist < 5 ? 3.8 : 0.8,
      qualityFlag: 'verified',
    });
  }

  return {
    stationId: '8518750',
    stationName: 'The Battery, NY',
    eventName: 'Hurricane Sandy Record Storm Surge (2012)',
    timeRange: {
      start: '2012-10-29T12:00:00Z',
      end: '2012-10-29T16:48:00Z',
    },
    metrics: {
      peakObserved: peakObservedMeters,
      predictedAtPeak: predictedAtPeakMeters,
      peakSurgeResidualMeters: peakResidualMeters,
      peakSurgeResidualFeet: 9.328,
      peakTimestamp: '2012-10-30T01:24:00Z',
      minPressureMb: 964.1,
    },
    expectedAutomata: {
      patternId: 'sustained_elevated',
      severity: 'High',
      minConfidence: 0.95,
      statePathIncludes: ['S0', 'S1', 'S2'],
    },
    points,
  };
}

export const mockSandyBenchmark = generateSandyBenchmark();

// ==========================================
// 3. Broken Sensor & Glitch Series
// ==========================================

export interface BrokenSensorSeries {
  description: string;
  points: WaterLevelPoint[];
  injectedAnomalies: {
    telemetryGapIndex: number;
    telemetryGapMinutes: number; // 48 mins (> 18/30 threshold)
    voltageSpikeIndex: number; // +3.5 sigma jump
    flatlineStartIndex: number;
    nullValueIndex: number;
  };
}

export function generateBrokenSensorSeries(): BrokenSensorSeries {
  const points: WaterLevelPoint[] = [];
  const baseTime = new Date('2026-11-12T06:00:00Z');
  const count = 50;

  for (let i = 0; i < count; i++) {
    const tMs = baseTime.getTime() + i * 6 * 60 * 1000;
    const timestamp = new Date(tMs).toISOString();

    // 1. Telemetry Gap: samples 15 to 22 (48 minutes) are missing
    if (i >= 15 && i < 23) {
      points.push({
        timestamp,
        observed: null,
        predicted: 1.5,
        residual: null,
        rateOfChange: null,
        zScore: null,
        qualityFlag: 'missing',
      });
      continue;
    }

    // 2. Voltage Spike at sample 30: single-point jump to 8.5m
    if (i === 30) {
      points.push({
        timestamp,
        observed: 8.5,
        predicted: 1.5,
        residual: 7.0,
        rateOfChange: 45.0,
        zScore: 6.2,
        qualityFlag: 'verified',
      });
      continue;
    }

    // 3. Sensor Flatline: samples 35 to 45 have constant identical readings
    if (i >= 35 && i <= 45) {
      points.push({
        timestamp,
        observed: 1.55,
        predicted: 1.50,
        residual: 0.05,
        rateOfChange: 0.0,
        zScore: 0.0,
        qualityFlag: 'verified',
      });
      continue;
    }

    // Normal samples
    const predicted = 1.50;
    const observed = 1.54;
    points.push({
      timestamp,
      observed,
      predicted,
      residual: 0.04,
      rateOfChange: 0.01,
      zScore: 0.1,
      qualityFlag: 'verified',
    });
  }

  return {
    description: 'Telemetry series with synthetic gaps, voltage spikes, and flatlines',
    points,
    injectedAnomalies: {
      telemetryGapIndex: 15,
      telemetryGapMinutes: 48,
      voltageSpikeIndex: 30,
      flatlineStartIndex: 35,
      nullValueIndex: 18,
    },
  };
}

export const mockBrokenSensorSeries = generateBrokenSensorSeries();

// ==========================================
// 4. Predefined Discrete Symbol Sequences for All 6 DFAs
// ==========================================

export const DISCRETE_AUTOMATA_VECTORS = {
  // 1. Abnormal Recovery: S0 -> Rise -> S1 -> Hold -> S1 -> Fall -> S2 -> Stabilize -> S0
  ABNORMAL_RECOVERY_ACCEPT: ['Rise', 'Hold', 'Fall'] as EventAlias[],
  ABNORMAL_RECOVERY_FULL_CYCLE: ['Normal', 'Rise', 'Hold', 'Hold', 'Fall', 'Stabilize', 'Normal'] as EventAlias[],
  ABNORMAL_RECOVERY_REJECT: ['Normal', 'Fall', 'Stabilize'] as EventAlias[],

  // 2. Sustained Surge: S0 -> Rise/Hold -> S1 -> Hold -> S2
  SUSTAINED_SURGE_ACCEPT: ['Rise', 'Hold', 'Hold'] as EventAlias[],
  SUSTAINED_SURGE_RESET_EARLY: ['Rise', 'Fall', 'Normal'] as EventAlias[],

  // 3. Sustained Depressed Tide (Blowout): S0 -> Fall/Low -> S1 -> Low -> S2
  SUSTAINED_DEPRESSED_ACCEPT: ['Fall', 'Low', 'Low'] as EventAlias[],
  SUSTAINED_DEPRESSED_RECOVERY: ['Fall', 'Low', 'Rise', 'Normal'] as EventAlias[],

  // 4. Rapid Rise: S0 -> Rise -> S1
  RAPID_RISE_ACCEPT: ['Rise'] as EventAlias[],
  RAPID_RISE_REJECT: ['Normal', 'Hold'] as EventAlias[],

  // 5. Oscillatory Seiche: S0 -> Rise -> S1 -> Fall -> S2 -> Rise -> S3
  SEICHE_ACCEPT: ['Rise', 'Fall', 'Rise'] as EventAlias[],
  SEICHE_INCOMPLETE: ['Rise', 'Fall', 'Normal'] as EventAlias[],

  // 6. Telemetry Observation Gap: S0 -> Gap -> S1
  TELEMETRY_GAP_ACCEPT: ['Gap', 'Gap'] as EventAlias[],
  TELEMETRY_GAP_RECOVERY: ['Gap', 'Normal'] as EventAlias[],
};

// ==========================================
// 5. Hourly Harmonic Predictions for Spline Testing
// ==========================================

export function generateHourlyPredictions(baseTime = new Date('2026-11-12T00:00:00Z')): Array<{ t: string; v: number }> {
  const result: Array<{ t: string; v: number }> = [];
  for (let h = 0; h < 24; h++) {
    const tMs = baseTime.getTime() + h * 60 * 60 * 1000;
    const d = new Date(tMs);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const tStr = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:00`;
    const v = parseFloat((1.5 + 0.9 * Math.sin((2 * Math.PI * h) / 12.42)).toFixed(3));
    result.push({ t: tStr, v });
  }
  return result;
}

export const mockHourlyPredictions = generateHourlyPredictions();
