export type Datum = 'MLLW' | 'MSL' | 'NAVD88' | 'MHHW';
export type UnitSystem = 'metric' | 'english' | 'imperial';
export type QualityFlag = 'verified' | 'preliminary' | 'interpolated' | 'missing';

export interface StationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state: string;
  region: string;
  status: 'normal' | 'elevated' | 'low_tide' | 'maintenance';
  waterLevel: number; // in meters
  predictedLevel: number; // in meters
  residual: number; // observed - predicted
  delta24h: number; // meters change vs 24h ago
  trend30d: number; // meters change over 30d
  lastUpdated: string; // ISO 8601
  tidalPhase: string;
  nextHighTide?: { time: string; height: number };
  nextLowTide?: { time: string; height: number };
  lastAnomaly?: {
    timestamp: string;
    description: string;
    delta: number;
    severity: 'High' | 'Moderate' | 'Low';
  };
}

export interface WaterLevelPoint {
  timestamp: string; // ISO 8601
  observed: number | null; // meters
  predicted: number | null; // meters
  residual: number | null; // observed - predicted
  rateOfChange: number | null; // meters per hour (dR/dt)
  zScore: number | null;
  qualityFlag: QualityFlag;
  rawSymbol?: string;
}

export interface NOAAApiResponse {
  data?: Array<{
    t: string; // "2024-11-12 00:00"
    v: string; // "1.234"
    s?: string; // standard deviation
    f?: string; // flags: "0,0,0"
    q?: string; // "p" (preliminary) or "v" (verified)
  }>;
  predictions?: Array<{
    t: string;
    v: string;
  }>;
  error?: {
    message: string;
  };
}
