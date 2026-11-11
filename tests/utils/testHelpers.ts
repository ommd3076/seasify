import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { WaterLevelPoint, StationMetadata } from '@/types/noaa';
import { ConcreteSymbol, EventAlias, AutomataStepTrace } from '@/types/automata';

// ==========================================
// 1. Tolerance & Precision Comparators
// ==========================================

/**
 * Floating point comparison with configurable epsilon.
 */
export function expectCloseTo(actual: number, expected: number, epsilon = 1e-4): boolean {
  return Math.abs(actual - expected) <= epsilon;
}

/**
 * Vector / array floating point comparison.
 */
export function expectCloseVector(actual: number[], expected: number[], epsilon = 1e-4): void {
  if (actual.length !== expected.length) {
    throw new Error(`Vector length mismatch: actual ${actual.length} vs expected ${expected.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    const diff = Math.abs(actual[i] - expected[i]);
    if (diff > epsilon) {
      throw new Error(`Vector element mismatch at index ${i}: actual ${actual[i]} vs expected ${expected[i]} (diff: ${diff} > epsilon: ${epsilon})`);
    }
  }
}

/**
 * Verifies that two timestamps are aligned within allowed drift tolerance (<= 3 min by default).
 */
export function isTimestampAligned(t1: string, t2: string, maxDriftMinutes = 3): boolean {
  const d1 = new Date(t1).getTime();
  const d2 = new Date(t2).getTime();
  const diffMinutes = Math.abs(d1 - d2) / (1000 * 60);
  return diffMinutes <= maxDriftMinutes;
}

/**
 * Verifies if time difference between consecutive samples constitutes a telemetry gap (> 18 or 30 min).
 */
export function isTelemetryGap(tEarlier: string, tLater: string, gapThresholdMinutes = 18): boolean {
  const d1 = new Date(tEarlier).getTime();
  const d2 = new Date(tLater).getTime();
  const diffMinutes = (d2 - d1) / (1000 * 60);
  return diffMinutes > gapThresholdMinutes;
}

/**
 * Verifies rate of change calculation matches finite difference within tolerance.
 * v_r = (r2 - r1) / dtHours
 */
export function verifyRateOfChange(
  r1: number,
  r2: number,
  dtHours: number,
  calculatedRate: number,
  epsilon = 1e-3
): boolean {
  const expectedRate = (r2 - r1) / dtHours;
  return Math.abs(calculatedRate - expectedRate) <= epsilon;
}

// ==========================================
// 2. Synthetic Time-Series Generators
// ==========================================

export interface TimeSeriesGeneratorOptions {
  startTime?: Date;
  pointsCount?: number;
  intervalMinutes?: number;
  baseLevel?: number;
  tidalAmplitude?: number;
  tidalPeriodHours?: number;
  noiseStdDev?: number;
  surgeOffset?: number;
  surgeStartIndex?: number;
  surgeDurationPoints?: number;
  gapStartIndex?: number;
  gapLengthPoints?: number;
}

/**
 * Generates continuous synthetic tidal series with realistic astronomical tides and optional surge/gaps.
 */
export function generateSyntheticTimeSeries(options: TimeSeriesGeneratorOptions = {}): WaterLevelPoint[] {
  const {
    startTime = new Date('2026-11-12T00:00:00Z'),
    pointsCount = 40,
    intervalMinutes = 6,
    baseLevel = 1.5,
    tidalAmplitude = 0.8,
    tidalPeriodHours = 12.42,
    noiseStdDev = 0.01,
    surgeOffset = 0.45,
    surgeStartIndex = 15,
    surgeDurationPoints = 10,
    gapStartIndex = -1,
    gapLengthPoints = 3,
  } = options;

  const points: WaterLevelPoint[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const tMs = startTime.getTime() + i * intervalMinutes * 60 * 1000;
    const timestamp = new Date(tMs).toISOString();

    // Injected gap
    if (gapStartIndex >= 0 && i >= gapStartIndex && i < gapStartIndex + gapLengthPoints) {
      points.push({
        timestamp,
        observed: null,
        predicted: null,
        residual: null,
        rateOfChange: null,
        zScore: null,
        qualityFlag: 'missing',
      });
      continue;
    }

    const tHours = (i * intervalMinutes) / 60;
    // Astronomical tide prediction (M2 semi-diurnal constituent)
    const predicted = parseFloat(
      (baseLevel + tidalAmplitude * Math.sin((2 * Math.PI * tHours) / tidalPeriodHours)).toFixed(4)
    );

    // Injected surge
    let surge = 0;
    if (i >= surgeStartIndex && i < surgeStartIndex + surgeDurationPoints) {
      surge = surgeOffset;
    }

    // Pseudo-random noise
    const noise = (Math.sin(i * 1.7) * noiseStdDev);
    const observed = parseFloat((predicted + surge + noise).toFixed(4));
    const residual = parseFloat((observed - predicted).toFixed(4));

    // Finite difference rate of change
    let rateOfChange: number | null = null;
    if (i > 0 && points[i - 1].residual !== null) {
      const prev = points[i - 1];
      const prevMs = new Date(prev.timestamp).getTime();
      const dt = (tMs - prevMs) / (1000 * 60 * 60);
      if (dt > 0) {
        rateOfChange = parseFloat(((residual - (prev.residual as number)) / dt).toFixed(4));
      }
    }

    points.push({
      timestamp,
      observed,
      predicted,
      residual,
      rateOfChange,
      zScore: null,
      qualityFlag: 'verified',
    });
  }

  return points;
}

/**
 * Creates a mock station metadata object.
 */
export function generateMockStation(overrides: Partial<StationMetadata> = {}): StationMetadata {
  return {
    id: '8518750',
    name: 'The Battery, NY',
    lat: 40.7005,
    lng: -74.0142,
    state: 'NY',
    region: 'East Coast (Mid-Atlantic)',
    status: 'normal',
    waterLevel: 1.42,
    predictedLevel: 1.36,
    residual: 0.06,
    delta24h: 0.12,
    trend30d: 0.08,
    lastUpdated: new Date().toISOString(),
    tidalPhase: 'Flood (Rising)',
    ...overrides,
  };
}

// ==========================================
// 3. Automata Verification Helpers
// ==========================================

export interface ExpectedStepSpec {
  stepIndex?: number;
  symbol?: string;
  previousState?: string;
  activeState?: string;
  isAccepting?: boolean;
}

export function verifyStepTrace(step: AutomataStepTrace, expected: ExpectedStepSpec): void {
  if (expected.symbol !== undefined && step.symbol !== expected.symbol) {
    throw new Error(`Step symbol mismatch: expected ${expected.symbol}, got ${step.symbol}`);
  }
  if (expected.previousState !== undefined && step.previousState !== expected.previousState) {
    throw new Error(`Step previousState mismatch: expected ${expected.previousState}, got ${step.previousState}`);
  }
  if (expected.activeState !== undefined && step.activeState !== expected.activeState) {
    throw new Error(`Step activeState mismatch: expected ${expected.activeState}, got ${step.activeState}`);
  }
  if (expected.isAccepting !== undefined && step.isAccepting !== expected.isAccepting) {
    throw new Error(`Step isAccepting mismatch: expected ${expected.isAccepting}, got ${step.isAccepting}`);
  }
}

export function verifyStatePath(trace: AutomataStepTrace[], expectedStates: string[]): void {
  const actualStates = trace.map(t => t.activeState);
  if (actualStates.length !== expectedStates.length) {
    throw new Error(`State path length mismatch: expected ${expectedStates.length}, got ${actualStates.length}`);
  }
  for (let i = 0; i < expectedStates.length; i++) {
    if (actualStates[i] !== expectedStates[i]) {
      throw new Error(`State path mismatch at index ${i}: expected ${expectedStates[i]}, got ${actualStates[i]}`);
    }
  }
}

// ==========================================
// 4. Mock NOAA API Fetch Utility
// ==========================================

export interface MockNoaaOptions {
  mode?: 'online' | 'offline' | 'error_400' | 'error_500' | 'timeout' | 'corrupted';
  customStations?: any;
  customData?: any;
}

export function setupMockNoaaFetch(options: MockNoaaOptions = {}) {
  const mode = options.mode ?? 'online';

  const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (mode === 'offline') {
      throw new TypeError('Failed to fetch (offline)');
    }

    if (mode === 'timeout') {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      throw error;
    }

    if (mode === 'error_500') {
      return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'error_400') {
      return new Response(JSON.stringify({ error: { message: 'Invalid station or missing parameter' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'corrupted') {
      return new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // NOAA Data API (datagetter)
    if (urlStr.includes('/api/prod/datagetter')) {
      const parsedUrl = new URL(urlStr);
      const product = parsedUrl.searchParams.get('product');

      if (product === 'water_level') {
        const payload = options.customData?.water_level ?? {
          metadata: { id: '8518750', name: 'The Battery, NY', lat: '40.7005', lon: '-74.0142' },
          data: [
            { t: '2026-11-12 00:00', v: '1.420', s: '0.082', f: '0,0,0,0', q: 'v' },
            { t: '2026-11-12 00:06', v: '1.455', s: '0.080', f: '0,0,0,0', q: 'v' },
            { t: '2026-11-12 00:12', v: '1.492', s: '0.085', f: '0,0,0,0', q: 'v' },
          ],
        };
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      if (product === 'predictions') {
        const payload = options.customData?.predictions ?? {
          predictions: [
            { t: '2026-11-12 00:00', v: '1.412' },
            { t: '2026-11-12 00:06', v: '1.448' },
            { t: '2026-11-12 00:12', v: '1.485' },
          ],
        };
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response(JSON.stringify({}), { status: 200 });
  });

  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

// ==========================================
// 5. React Render Helpers
// ==========================================

export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(ui);
}
