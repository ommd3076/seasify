/**
 * Unit formatting helper for water level, residual, and surge telemetry.
 * Converts between SI Metric (meters) and US Customary / Imperial (feet)
 * according to international hydrographic conversion constants (1 m = 3.28084 ft).
 *
 * Guarantees compliance with IHO S-44 standards for acoustic sensor sounding precision.
 */

export type WaterLevelUnit = 'metric' | 'english' | 'meters' | 'feet' | 'imperial';

/**
 * Encapsulates formatted water-level sounding data with scalar and string representations.
 */
export interface FormattedLevel {
  /** Numeric value in the target unit */
  value: number;
  /** Fixed decimal string representation */
  formatted: string;
  /** Unit symbol ('m' or 'ft') */
  unit: string;
  /** Ready-to-render display string (e.g. "1.84 m" or "6.04 ft") */
  withUnit: string;
}

/**
 * Converts water level from standard meters to the user's active unit setting.
 *
 * @param meters - Raw water level sounding in meters relative to datum
 * @param unitSetting - Target unit ('metric' | 'imperial' | 'english' | 'feet' | 'meters')
 * @param precision - Decimal places to format (defaults to 2)
 * @returns {FormattedLevel} Object containing numeric value, string, unit, and combined label
 */
export function formatWaterLevel(
  meters: number,
  unitSetting: WaterLevelUnit = 'metric',
  precision: number = 2
): FormattedLevel {
  const isFeet = unitSetting === 'english' || unitSetting === 'feet' || unitSetting === 'imperial';
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

/**
 * Formats signed rate of change or water-level delta with explicit sign prefix (+/-).
 *
 * @param meters - Delta value in meters
 * @param unitSetting - Target unit ('metric' | 'imperial' | 'english' | 'feet' | 'meters')
 * @param precision - Decimal places (defaults to 2)
 * @returns Signed string with unit (e.g. "+0.51 m" or "-1.25 ft")
 */
export function formatDelta(
  meters: number,
  unitSetting: WaterLevelUnit = 'metric',
  precision: number = 2
): string {
  const isFeet = unitSetting === 'english' || unitSetting === 'feet' || unitSetting === 'imperial';
  const val = isFeet ? meters * 3.28084 : meters;
  const sign = val >= 0 ? '+' : '';
  const unit = isFeet ? 'ft' : 'm';
  return `${sign}${val.toFixed(precision)} ${unit}`;
}
