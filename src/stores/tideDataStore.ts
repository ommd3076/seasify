import { create } from 'zustand';
import { WaterLevelPoint } from '@/types/noaa';
import { AnomalyEvent } from '@/types/events';
import { AutomataStepTrace } from '@/types/automata';
import { fetchStationData } from '@/engine/noaa/noaaClient';
import { runAllPatternsRecognition } from '@/engine/automata/streamMatcher';

interface TideDataState {
  points: WaterLevelPoint[];
  events: AnomalyEvent[];
  traces: AutomataStepTrace[];
  isLoading: boolean;
  dataSource: 'live_noaa' | 'bundled_fallback';
  dataFreshness: string;
  selectedTimeRange: string; // '24h', '48h', '30d'
  loadStationData: (stationId: string, stationName: string, hours?: number, forceRefresh?: boolean) => Promise<void>;
  setTimeRange: (range: string) => void;
  resolveEvent: (eventId: string) => void;
  addEventNote: (eventId: string, note: string) => void;
}

export const useTideDataStore = create<TideDataState>((set) => ({
  points: [],
  events: [],
  traces: [],
  isLoading: false,
  dataSource: 'bundled_fallback',
  dataFreshness: 'Initializing...',
  selectedTimeRange: '24h',

  loadStationData: async (stationId: string, stationName: string, hours = 24, forceRefresh = false) => {
    set({ isLoading: true });
    try {
      const res = await fetchStationData(stationId, hours, 'MLLW', forceRefresh);
      
      // Run the deterministic finite automata pattern engine across the observation series
      const recognition = runAllPatternsRecognition(res.points, stationId, stationName);

      // Convert pattern matches into AnomalyEvents with before/during/after progression
      const anomalyEvents: AnomalyEvent[] = recognition.matches.map((m) => {
        const peakStep = m.triggerSteps.find((s) => s.timestamp === m.peakTime) || m.triggerSteps[0];
        const firstStep = m.triggerSteps[0];
        const lastStep = m.triggerSteps[m.triggerSteps.length - 1];

        return {
          ...m,
          id: m.matchId,
          status: 'Open',
          beforeReading: {
            time: new Date(firstStep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            level: firstStep.observedLevel ?? 1.20,
            residual: firstStep.residual ?? 0.02,
          },
          duringReading: {
            time: new Date(m.peakTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            level: peakStep.observedLevel ?? 2.10,
            residual: m.peakResidual,
          },
          afterReading: {
            time: new Date(lastStep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            level: lastStep.observedLevel ?? 1.35,
            residual: lastStep.residual ?? 0.04,
          },
        };
      });

      set({
        points: res.points,
        events: anomalyEvents,
        traces: recognition.traces,
        dataSource: res.source,
        dataFreshness: res.freshness,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error loading tide data:', err);
      set({ isLoading: false });
    }
  },

  setTimeRange: (range: string) => set({ selectedTimeRange: range }),

  resolveEvent: (eventId: string) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, status: 'Resolved' } : e
      ),
    }));
  },

  addEventNote: (eventId: string, note: string) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, notes: note } : e
      ),
    }));
  },
}));
