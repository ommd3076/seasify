import { NOAAApiResponse, WaterLevelPoint } from '@/types/noaa';
import { processWaterLevelSeries } from '../science/residual';
import { generateReferenceTimeSeries } from '@/data/historicalEvents';

const NOAA_BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

// Simple in-memory cache to respect API rate limits
const apiCache = new Map<string, { timestamp: number; data: WaterLevelPoint[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface FetchResult {
  points: WaterLevelPoint[];
  source: 'live_noaa' | 'bundled_fallback';
  freshness: string;
  errorMessage?: string;
}

/**
 * Fetches water level observations and astronomical predictions from NOAA CO-OPS.
 * Falls back to bundled reference data if the NOAA API is unavailable or offline.
 */
export async function fetchStationData(
  stationId: string,
  hours = 24,
  datum = 'MLLW',
  forceRefresh = false
): Promise<FetchResult> {
  const cacheKey = `${stationId}_${hours}_${datum}`;
  const cached = apiCache.get(cacheKey);

  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      points: cached.data,
      source: 'live_noaa',
      freshness: new Date(cached.timestamp).toLocaleTimeString(),
    };
  }

  // Format NOAA date strings: yyyymmdd hh:mm
  const now = new Date();
  const past = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const formatNOAADate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  };

  const beginDate = formatNOAADate(past);
  const endDate = formatNOAADate(now);

  const obsParams = new URLSearchParams({
    begin_date: beginDate,
    end_date: endDate,
    station: stationId,
    product: 'water_level',
    datum: datum,
    time_zone: 'gmt',
    units: 'metric',
    format: 'json',
    application: 'Seasify',
  });

  const predParams = new URLSearchParams({
    begin_date: beginDate,
    end_date: endDate,
    station: stationId,
    product: 'predictions',
    datum: datum,
    time_zone: 'gmt',
    units: 'metric',
    interval: '6',
    format: 'json',
    application: 'Seasify',
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const [obsRes, predRes] = await Promise.all([
      fetch(`${NOAA_BASE_URL}?${obsParams.toString()}`, { signal: controller.signal }).catch(e => {
        console.warn('NOAA Observation fetch failed:', e);
        return null;
      }),
      fetch(`${NOAA_BASE_URL}?${predParams.toString()}`, { signal: controller.signal }).catch(e => {
        console.warn('NOAA Prediction fetch failed:', e);
        return null;
      }),
    ]);

    clearTimeout(timeoutId);

    if (obsRes && obsRes.ok && predRes && predRes.ok) {
      const obsJson: NOAAApiResponse = await obsRes.json();
      const predJson: NOAAApiResponse = await predRes.json();

      if (obsJson.data && predJson.predictions && !obsJson.error && !predJson.error) {
        // Map predictions by time
        const predMap = new Map<string, number>();
        for (const p of predJson.predictions) {
          predMap.set(p.t, parseFloat(p.v));
        }

        // Align observations and predictions
        const rawPoints: Array<{ timestamp: string; observed: number | null; predicted: number | null }> = [];
        for (const o of obsJson.data) {
          const isoTime = new Date(o.t.replace(' ', 'T') + ':00Z').toISOString();
          const observedVal = parseFloat(o.v);
          const predictedVal = predMap.get(o.t) ?? null;

          rawPoints.push({
            timestamp: isoTime,
            observed: isNaN(observedVal) ? null : observedVal,
            predicted: predictedVal,
          });
        }

        const processed = processWaterLevelSeries(rawPoints);
        apiCache.set(cacheKey, { timestamp: Date.now(), data: processed });

        return {
          points: processed,
          source: 'live_noaa',
          freshness: new Date().toLocaleTimeString(),
        };
      }
    }
  } catch (err: any) {
    console.warn(`Live NOAA fetch failed for station ${stationId}:`, err.message);
  }

  // Graceful fallback to bundled reference data
  console.info(`Using bundled reference dataset for station ${stationId}`);
  const fallbackPoints = generateReferenceTimeSeries(stationId, hours, 'elevated_surge');
  return {
    points: fallbackPoints,
    source: 'bundled_fallback',
    freshness: 'Bundled Reference (Offline Resilience)',
  };
}
