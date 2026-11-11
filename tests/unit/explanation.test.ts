import { describe, it, expect } from 'vitest';
import { generateScientificExplanation } from '@/engine/automata/explanation';

describe('Tier 1 & Tier 2 Unit: Oceanographic Explanation Generator (explanation.ts)', () => {
  const peakTime = '2026-11-12T14:30:00Z';
  const stationName = 'The Battery, NY';

  it('generates narrative for Abnormal Recovery with atypical recovery trajectory', () => {
    const text = generateScientificExplanation('abnormal_recovery', 0.45, 180, stationName, peakTime);
    expect(text).toContain('The Battery, NY');
    expect(text).toContain('+0.45 m');
    expect(text).toContain('3 hours');
    expect(text).toContain('transient elevated surge pulse');
    expect(text).toContain('atypical recovery trajectory');
    expect(text).toContain('astronomical baseline');
  });

  it('generates narrative for Sustained Elevated Surge mentioning onshore setup', () => {
    const text = generateScientificExplanation('sustained_elevated', 0.85, 240, stationName, peakTime);
    expect(text).toContain('+0.85 m');
    expect(text).toContain('4 hours');
    expect(text).toContain('onshore wind setup');
    expect(text).toContain('inverse-barometer effect');
  });

  it('generates narrative for Sustained Depressed Tide (Blowout) with negative residual formatting', () => {
    const text = generateScientificExplanation('sustained_depressed', -0.38, 120, stationName, peakTime);
    expect(text).toContain('-0.38 m');
    expect(text).toContain('blowout');
    expect(text).toContain('offshore winds');
    expect(text).toContain('anticyclonic high pressure');
  });

  it('generates narrative for Rapid Rise mentioning surge front and squall passage', () => {
    const text = generateScientificExplanation('rapid_rise', 0.52, 45, stationName, peakTime);
    expect(text).toContain('+0.52 m');
    expect(text).toContain('rapid rate of residual increase');
    expect(text).toContain('The Battery, NY');
    expect(text).toContain('squall line passage');
  });

  it('generates narrative for Oscillatory Seiche mentioning resonant harbor oscillations', () => {
    const text = generateScientificExplanation('oscillatory', 0.30, 90, stationName, peakTime);
    expect(text).toContain('+0.30 m');
    expect(text).toContain('resonant harbor seiche oscillations');
  });

  it('generates narrative for Telemetry Record Gap mentioning telemetry dropout', () => {
    const text = generateScientificExplanation('record_gap', 0.0, 48, stationName, peakTime);
    expect(text).toContain('telemetry dropout');
    expect(text).toContain('48 minutes');
    expect(text).toContain('State progression was suspended');
  });

  it('generates fallback scientific explanation for unknown/custom pattern IDs', () => {
    const text = generateScientificExplanation('custom_user_rule', 0.28, 60, stationName, peakTime);
    expect(text).toContain('+0.28 m');
    expect(text).toContain('The Battery, NY');
    expect(text).toContain('custom_user_rule');
  });

  it('formats duration in minutes when duration is 60 minutes or less in duration-bearing patterns', () => {
    const text = generateScientificExplanation('abnormal_recovery', 0.40, 30, stationName, peakTime);
    expect(text).toContain('30 minutes');
  });

  it('formats duration in hours when duration exceeds 60 minutes in duration-bearing patterns', () => {
    const text = generateScientificExplanation('sustained_elevated', 0.40, 180, stationName, peakTime);
    expect(text).toContain('3 hours');
  });
});
