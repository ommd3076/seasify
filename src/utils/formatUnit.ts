/**
 * Unit formatting helper for water level and surge metrics.
 * Converts between metric (meters) and English / Imperial (feet).
 */

export type WaterLevelUnit = 'metric' | 'english' | 'meters' | 'feet';

export interface FormattedLevel {
  value: number;
  formatted: string;
  unit: string;
  withUnit: string;
}

export function formatWaterLevel(
  meters: number,
  unitSetting: WaterLevelUnit = 'metric',
  precision: number = 2
): FormattedLevel {
  const isFeet = unitSetting === 'english' || unitSetting === 'feet';
  if (isFeet) {
    const feet = meters * 3.28084;
    const formatted = feet.toFixed(precision);
    return {
      value: Number(formatted),
      formatted,
      unit: 'ft',
      withUnit: `${formatted} ft`,
    };
  }

  const formatted = meters.toFixed(precision);
  return {
    value: Number(formatted),
    formatted,
    unit: 'm',
    withUnit: `${formatted} m`,
  };
}

export function formatDelta(
  meters: number,
  unitSetting: WaterLevelUnit = 'metric',
  precision: number = 2
): string {
  const isFeet = unitSetting === 'english' || unitSetting === 'feet';
  const val = isFeet ? meters * 3.28084 : meters;
  const sign = val >= 0 ? '+' : '';
  const unit = isFeet ? 'ft' : 'm';
  return `${sign}${val.toFixed(precision)} ${unit}`;
}
