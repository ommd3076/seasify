import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchStationData } from '@/engine/noaa/noaaClient';
import { setupMockNoaaFetch } from '../utils/testHelpers';

describe('Tier 2 & Tier 3 Integration: NOAA CO-OPS API Client & Offline Fallback (noaaClient.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches live NOAA observations and predictions, returning processed residuals with live_noaa source', async () => {
    const mockObsData = [
      { t: '2026-11-12 00:00', v: '1.450', s: '0.08', f: '0,0,0,0', q: 'v' },
      { t: '2026-11-12 00:06', v: '1.520', s: '0.08', f: '0,0,0,0', q: 'v' },
    ];
    const mockPredData = [
      { t: '2026-11-12 00:00', v: '1.400' },
      { t: '2026-11-12 00:06', v: '1.430' },
    ];

    setupMockNoaaFetch({
      mode: 'online',
      customData: {
        water_level: { metadata: { id: '8518750' }, data: mockObsData },
        predictions: { predictions: mockPredData },
      },
    });

    const result = await fetchStationData('8518750', 24, 'MLLW', true);

    expect(result).toBeDefined();
    expect(result.source).toBe('live_noaa');
    expect(result.points.length).toBeGreaterThan(0);
    expect(result.points[0].residual).toBeCloseTo(0.05, 3);
  });

  it('falls back seamlessly to bundled offline reference dataset when network is offline', async () => {
    setupMockNoaaFetch({ mode: 'offline' });

    const result = await fetchStationData('8518750', 24, 'MLLW', true);

    expect(result).toBeDefined();
    expect(result.source).toBe('bundled_fallback');
    expect(result.freshness).toContain('Bundled Reference');
    expect(result.points.length).toBeGreaterThan(0);
    // Residuals and observed values should still be computed and non-empty
    expect(result.points.every(p => p.timestamp !== undefined)).toBe(true);
  });

  it('falls back to bundled reference dataset on NOAA server 500 error', async () => {
    setupMockNoaaFetch({ mode: 'error_500' });

    const result = await fetchStationData('9414290', 24, 'MLLW', true);

    expect(result.source).toBe('bundled_fallback');
    expect(result.points.length).toBeGreaterThan(0);
  });

  it('falls back to bundled reference dataset on fetch timeout / abort', async () => {
    setupMockNoaaFetch({ mode: 'timeout' });

    const result = await fetchStationData('8443970', 24, 'MLLW', true);

    expect(result.source).toBe('bundled_fallback');
    expect(result.points.length).toBeGreaterThan(0);
  });

  it('serves cached data on subsequent requests within cache TTL without re-fetching', async () => {
    const fetchSpy = setupMockNoaaFetch({ mode: 'online' });

    // Initial fetch (live)
    const res1 = await fetchStationData('8724580', 24, 'MLLW', true);
    expect(res1.source).toBe('live_noaa');
    const initialCallCount = fetchSpy.mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(0);

    // Second fetch without forceRefresh should read from in-memory cache
    const res2 = await fetchStationData('8724580', 24, 'MLLW', false);
    expect(res2.source).toBe('live_noaa');
    expect(fetchSpy.mock.calls.length).toBe(initialCallCount); // No new network requests
  });

  it('bypasses in-memory cache when forceRefresh is true', async () => {
    const fetchSpy = setupMockNoaaFetch({ mode: 'online' });

    await fetchStationData('8771450', 24, 'MLLW', false);
    const count1 = fetchSpy.mock.calls.length;

    await fetchStationData('8771450', 24, 'MLLW', true);
    const count2 = fetchSpy.mock.calls.length;
    expect(count2).toBeGreaterThan(count1);
  });
});
