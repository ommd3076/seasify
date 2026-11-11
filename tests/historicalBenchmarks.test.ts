import { describe, it, expect } from 'vitest';
import { HISTORICAL_BENCHMARKS, generateReferenceTimeSeries } from '@/data/historicalEvents';
import { NOAA_STATIONS } from '@/data/stations';
import { runAllPatternsRecognition } from '@/engine/automata/streamMatcher';

describe('Historical Benchmarks & Fallback Datasets', () => {
  describe('Bundled Coastal Stations (Offline Fallback)', () => {
    it('contains all 13 representative coastal monitoring stations', () => {
      expect(NOAA_STATIONS.length).toBeGreaterThanOrEqual(13);
    });

    it('each station has valid coordinates and geographic metadata', () => {
      for (const st of NOAA_STATIONS) {
        expect(st.id).toBeDefined();
        expect(st.name.length).toBeGreaterThan(0);
        expect(typeof st.lat).toBe('number');
        expect(typeof st.lng).toBe('number');
        expect(st.lat).toBeGreaterThan(20);
        expect(st.lat).toBeLessThan(65);
        expect(st.lng).toBeLessThan(-60);
        expect(st.lng).toBeGreaterThan(-170);
        expect(['normal', 'elevated', 'low_tide', 'maintenance']).toContain(st.status);
      }
    });

    it('The Battery, NY (8518750) is included as reference primary station', () => {
      const battery = NOAA_STATIONS.find(s => s.id === '8518750');
      expect(battery).toBeDefined();
      expect(battery?.name).toBe('The Battery, NY');
    });
  });

  describe('Historical Benchmark Storm Datasets', () => {
    it('contains all 6 historical extreme storm and anomaly benchmarks', () => {
      expect(HISTORICAL_BENCHMARKS).toHaveLength(6);
      const benchmarkIds = HISTORICAL_BENCHMARKS.map(b => b.id);
      expect(benchmarkIds).toContain('sandy-2012');
      expect(benchmarkIds).toContain('grayson-2018');
      expect(benchmarkIds).toContain('blowout-keywest');
      expect(benchmarkIds).toContain('annapolis-kingtide');
      expect(benchmarkIds).toContain('sf-seiche');
      expect(benchmarkIds).toContain('telemetry-outage');
    });

    it('Hurricane Sandy benchmark generates elevated surge detection', () => {
      const sandy = HISTORICAL_BENCHMARKS.find(b => b.id === 'sandy-2012')!;
      expect(sandy.dataPoints.length).toBeGreaterThan(100);

      const recognition = runAllPatternsRecognition(sandy.dataPoints, sandy.stationId, sandy.stationName);
      expect(recognition.matches.length).toBeGreaterThan(0);
      const hasSurge = recognition.matches.some(
        m => m.patternId === 'sustained_elevated' || m.patternId === 'abnormal_recovery' || m.patternId === 'rapid_rise'
      );
      expect(hasSurge).toBe(true);
    });

    it('Bomb Cyclone Grayson benchmark detects rapid rise pattern', () => {
      const grayson = HISTORICAL_BENCHMARKS.find(b => b.id === 'grayson-2018')!;
      const recognition = runAllPatternsRecognition(grayson.dataPoints, grayson.stationId, grayson.stationName);
      expect(recognition.matches.length).toBeGreaterThan(0);
      const hasRapid = recognition.matches.some(m => m.patternId === 'rapid_rise');
      expect(hasRapid).toBe(true);
    });

    it('Key West blowout benchmark detects sustained depressed tide', () => {
      const blowout = HISTORICAL_BENCHMARKS.find(b => b.id === 'blowout-keywest')!;
      const recognition = runAllPatternsRecognition(blowout.dataPoints, blowout.stationId, blowout.stationName);
      expect(recognition.matches.length).toBeGreaterThan(0);
      const hasDepressed = recognition.matches.some(m => m.patternId === 'sustained_depressed');
      expect(hasDepressed).toBe(true);
    });

    it('Telemetry outage benchmark detects record gap', () => {
      const outage = HISTORICAL_BENCHMARKS.find(b => b.id === 'telemetry-outage')!;
      const recognition = runAllPatternsRecognition(outage.dataPoints, outage.stationId, outage.stationName);
      expect(recognition.matches.length).toBeGreaterThan(0);
      const hasGap = recognition.matches.some(m => m.patternId === 'record_gap');
      expect(hasGap).toBe(true);
    });

    it('SF Bay seiche benchmark generates oscillatory wave detections', () => {
      const seiche = HISTORICAL_BENCHMARKS.find(b => b.id === 'sf-seiche')!;
      const recognition = runAllPatternsRecognition(seiche.dataPoints, seiche.stationId, seiche.stationName);
      expect(recognition.matches.length).toBeGreaterThan(0);
      const hasOscillatory = recognition.matches.some(m => m.patternId === 'oscillatory');
      expect(hasOscillatory).toBe(true);
    });

    it('generates synthetic reference time series smoothly with no NaN values', () => {
      const points = generateReferenceTimeSeries('8518750', 24, 'none');
      expect(points.length).toBe(241); // 24 hours * 10 steps + 1
      for (const pt of points) {
        expect(pt.observed).not.toBeNull();
        expect(Number.isNaN(pt.observed)).toBe(false);
        expect(pt.predicted).not.toBeNull();
        expect(Number.isNaN(pt.predicted)).toBe(false);
        expect(pt.residual).not.toBeNull();
      }
    });
  });
});
