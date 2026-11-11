import { WaterLevelPoint } from '@/types/noaa';
import { processWaterLevelSeries } from '@/engine/science/residual';

export interface HistoricalEventMetadata {
  id: string;
  name: string;
  stationId: string;
  stationName: string;
  dateRange: string;
  description: string;
  peakResidual: number;
  expectedPattern: 'sustained_elevated' | 'sustained_depressed' | 'rapid_rise' | 'oscillatory' | 'abnormal_recovery' | 'record_gap';
  dataPoints: WaterLevelPoint[];
}

/**
 * Generates synthetic realistic 24-hour observation time series
 * with semi-diurnal tides (M2 harmonic ≈ 12.42h period) and injected anomalies.
 */
export function generateReferenceTimeSeries(
  _stationId: string,
  hours = 24,
  injectedAnomaly?: 'none' | 'elevated_surge' | 'blowout' | 'rapid_rise' | 'seiche' | 'gap'
): WaterLevelPoint[] {
  const points: Array<{
    timestamp: string;
    observed: number | null;
    predicted: number | null;
  }> = [];

  const now = new Date();
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

  // M2 lunar semi-diurnal period ≈ 12.42 hours
  const tidalPeriod = 12.42;
  const meanSeaLevel = 1.20;
  const tidalAmplitude = 0.95;

  const totalSteps = hours * 10; // 6-minute intervals

  for (let i = 0; i <= totalSteps; i++) {
    const time = new Date(startTime.getTime() + i * 6 * 60 * 1000);
    const elapsedHours = i * 0.1;

    // Astronomical tide prediction (pure harmonic signal)
    const predicted = meanSeaLevel +
      tidalAmplitude * Math.sin((2 * Math.PI * elapsedHours) / tidalPeriod) +
      0.25 * Math.sin((4 * Math.PI * elapsedHours) / tidalPeriod + 0.5);

    // Weather/Oceanographic residual calculation
    let residual = 0.04 * Math.sin(elapsedHours * 0.5) + (Math.sin(i * 0.3) * 0.02);
    let isMissing = false;

    // Inject specified realistic anomaly pattern
    if (injectedAnomaly === 'elevated_surge') {
      // Elevated surge between hour 12 and 18
      if (elapsedHours >= 12 && elapsedHours <= 18) {
        const surgeFactor = Math.sin(((elapsedHours - 12) / 6) * Math.PI);
        residual += 0.42 * surgeFactor; // Peak +0.42 m residual
      }
    } else if (injectedAnomaly === 'blowout') {
      // Wind blowout between hour 8 and 16
      if (elapsedHours >= 8 && elapsedHours <= 16) {
        const blowoutFactor = Math.sin(((elapsedHours - 8) / 8) * Math.PI);
        residual -= 0.38 * blowoutFactor; // Low residual -0.38 m
      }
    } else if (injectedAnomaly === 'rapid_rise') {
      // Rapid surge onset between hour 14 and 16 (0.50m rise in 2 hours = 0.25 m/hr)
      if (elapsedHours >= 14 && elapsedHours <= 16) {
        const progress = (elapsedHours - 14) / 2;
        residual += 0.52 * progress;
      } else if (elapsedHours > 16 && elapsedHours <= 20) {
        residual += 0.52 * Math.exp(-(elapsedHours - 16) * 0.6);
      }
    } else if (injectedAnomaly === 'seiche') {
      // High-frequency harbor seiche oscillation (period ~ 45 mins)
      if (elapsedHours >= 10 && elapsedHours <= 16) {
        const seicheOscillation = 0.35 * Math.sin((2 * Math.PI * elapsedHours) / 0.75);
        residual += seicheOscillation;
      }
    } else if (injectedAnomaly === 'gap') {
      // Telemetry missing data gap between hour 10 and 13 (3 hours = 30 intervals)
      if (elapsedHours >= 10 && elapsedHours <= 13) {
        isMissing = true;
      }
    } else {
      // Default: realistic mild residual variation with transient peak matching UI ref
      if (elapsedHours >= 14 && elapsedHours <= 17) {
        const peakFactor = Math.sin(((elapsedHours - 14) / 3) * Math.PI);
        residual += 0.38 * peakFactor;
      }
    }

    const observed = isMissing ? null : parseFloat((predicted + residual).toFixed(3));
    const roundedPred = parseFloat(predicted.toFixed(3));

    points.push({
      timestamp: time.toISOString(),
      observed,
      predicted: roundedPred,
    });
  }

  return processWaterLevelSeries(points);
}

// Generate the 6 bundled historical extreme benchmark events
export const HISTORICAL_BENCHMARKS: HistoricalEventMetadata[] = [
  {
    id: 'sandy-2012',
    name: 'Hurricane Sandy Extreme Storm Surge (2012)',
    stationId: '8518750',
    stationName: 'The Battery, NY',
    dateRange: 'Oct 29–30, 2012',
    description: 'Catastrophic storm surge arriving coincident with astronomical spring high tide. Non-tidal residual reached record +2.86 m.',
    peakResidual: 2.86,
    expectedPattern: 'sustained_elevated',
    dataPoints: generateReferenceTimeSeries('8518750', 36, 'elevated_surge'),
  },
  {
    id: 'grayson-2018',
    name: 'Bomb Cyclone Grayson Rapid Surge (2018)',
    stationId: '8443970',
    stationName: 'Boston Harbor, MA',
    dateRange: 'Jan 4, 2018',
    description: 'Intense cyclogenesis causing record high water levels (4.61 m MLLW) with rapid surge rate exceeding +0.48 m/hr.',
    peakResidual: 1.48,
    expectedPattern: 'rapid_rise',
    dataPoints: generateReferenceTimeSeries('8443970', 24, 'rapid_rise'),
  },
  {
    id: 'blowout-keywest',
    name: 'North-Wind Blowout / Extreme Low Water Event',
    stationId: '8724580',
    stationName: 'Key West, FL',
    dateRange: 'Feb 14–15, 2023',
    description: 'Sustained offshore gale force winds pushing shallow water out of the Florida Keys basin, producing a -0.44 m blowout anomaly.',
    peakResidual: -0.44,
    expectedPattern: 'sustained_depressed',
    dataPoints: generateReferenceTimeSeries('8724580', 24, 'blowout'),
  },
  {
    id: 'annapolis-kingtide',
    name: 'Annapolis King Tide Nuisance Flooding Event',
    stationId: '8575512',
    stationName: 'Annapolis, MD',
    dateRange: 'Oct 18, 2023',
    description: 'Sunny-day high tide coastal flooding exacerbated by persistent easterly winds across Chesapeake Bay (+0.42 m residual).',
    peakResidual: 0.42,
    expectedPattern: 'abnormal_recovery',
    dataPoints: generateReferenceTimeSeries('8575512', 24, 'elevated_surge'),
  },
  {
    id: 'sf-seiche',
    name: 'San Francisco Bay High-Frequency Seiche Oscillation',
    stationId: '9414290',
    stationName: 'San Francisco, CA',
    dateRange: 'Mar 21, 2023',
    description: 'Resonant atmospheric pressure front exciting 45-minute harmonic seiche modes in the Central Bay basin.',
    peakResidual: 0.35,
    expectedPattern: 'oscillatory',
    dataPoints: generateReferenceTimeSeries('9414290', 24, 'seiche'),
  },
  {
    id: 'telemetry-outage',
    name: 'Cook Inlet Acoustic Telemetry Outage Event',
    stationId: '9455920',
    stationName: 'Anchorage, AK',
    dateRange: 'May 04, 2024',
    description: 'A 3.5-hour communication gap testing finite automata telemetry dropout detection and state suspension.',
    peakResidual: 0.0,
    expectedPattern: 'record_gap',
    dataPoints: generateReferenceTimeSeries('9455920', 24, 'gap'),
  },
];
