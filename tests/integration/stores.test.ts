import { describe, it, expect, beforeEach } from 'vitest';
import { useStationStore } from '@/stores/stationStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAutomataStore } from '@/stores/automataStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useAlertStore } from '@/stores/alertStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { setupMockNoaaFetch } from '../utils/testHelpers';

describe('Tier 2 & Tier 3 Integration: Zustand Stores State Management', () => {
  beforeEach(() => {
    // Reset stores to predictable baseline states
    useNavigationStore.setState({ currentScreen: 'overview', selectedEventId: null });
    useStationStore.setState({
      searchQuery: '',
      regionFilter: 'All Regions',
      statusFilter: 'All Statuses',
    });
  });

  describe('useStationStore', () => {
    it('initializes with all 13 representative coastal monitoring stations', () => {
      const { stations, selectedStation } = useStationStore.getState();
      expect(stations.length).toBeGreaterThanOrEqual(13);
      expect(selectedStation).toBeDefined();
      expect(selectedStation.id).toBe('8518750'); // The Battery, NY
    });

    it('selects station by ID and updates selectedStation in state', () => {
      const { selectStation } = useStationStore.getState();
      selectStation('9414290'); // San Francisco, CA

      const updated = useStationStore.getState().selectedStation;
      expect(updated.id).toBe('9414290');
      expect(updated.name).toContain('San Francisco');
    });

    it('updates search query and filters', () => {
      const { setSearchQuery, setRegionFilter, setStatusFilter } = useStationStore.getState();
      setSearchQuery('Boston');
      setRegionFilter('East Coast (Northeast)');
      setStatusFilter('normal');

      const state = useStationStore.getState();
      expect(state.searchQuery).toBe('Boston');
      expect(state.regionFilter).toBe('East Coast (Northeast)');
      expect(state.statusFilter).toBe('normal');
    });
  });

  describe('useNavigationStore', () => {
    it('navigates cleanly across all 10 desktop application screens', () => {
      const { setCurrentScreen } = useNavigationStore.getState();
      const screens = [
        'overview',
        'stations',
        'monitoring',
        'patterns',
        'events',
        'reports',
        'upload',
        'alerts',
        'settings',
        'automata_lab',
      ] as const;

      for (const s of screens) {
        setCurrentScreen(s);
        expect(useNavigationStore.getState().currentScreen).toBe(s);
      }
    });

    it('navigateToAutomataLab sets screen and synchronizes selectedPattern in automataStore', () => {
      const { navigateToAutomataLab } = useNavigationStore.getState();
      navigateToAutomataLab('sustained_elevated');

      expect(useNavigationStore.getState().currentScreen).toBe('automata_lab');
      const selectedPattern = useAutomataStore.getState().selectedPattern;
      expect(selectedPattern.id).toBe('sustained_elevated');
    });

    it('sets and clears selectedEventId', () => {
      const { setSelectedEventId } = useNavigationStore.getState();
      setSelectedEventId('evt-123');
      expect(useNavigationStore.getState().selectedEventId).toBe('evt-123');

      setSelectedEventId(null);
      expect(useNavigationStore.getState().selectedEventId).toBeNull();
    });
  });

  describe('useAutomataStore', () => {
    it('initializes with predefined patterns, active machines, and tokens', () => {
      const state = useAutomataStore.getState();
      expect(state.patterns.length).toBe(6);
      expect(state.selectedPattern).toBeDefined();
      expect(state.activeNFA).toBeDefined();
      expect(state.activeDFA).toBeDefined();
      expect(state.inputTokens.length).toBeGreaterThan(0);
    });

    it('switches active pattern and compiles corresponding NFA/DFA', () => {
      const { selectPattern } = useAutomataStore.getState();
      selectPattern('rapid_rise');

      const updated = useAutomataStore.getState();
      expect(updated.selectedPattern.id).toBe('rapid_rise');
      expect(updated.activeNFA).toBeDefined();
      expect(updated.activeDFA).toBeDefined();
    });

    it('modifies input tokens (add, remove, clear)', () => {
      const { addInputToken, removeInputToken, clearInputTokens } = useAutomataStore.getState();

      clearInputTokens();
      expect(useAutomataStore.getState().inputTokens).toEqual([]);

      addInputToken('Rise');
      addInputToken('Hold');
      expect(useAutomataStore.getState().inputTokens).toEqual(['Rise', 'Hold']);

      removeInputToken(0);
      expect(useAutomataStore.getState().inputTokens).toEqual(['Hold']);
    });

    it('steps simulation and updates currentStateId', () => {
      const { selectPattern, clearInputTokens, addInputToken, resetSimulation, stepSimulation } = useAutomataStore.getState();
      selectPattern('abnormal_recovery');
      clearInputTokens();
      addInputToken('Rise');
      addInputToken('Hold');
      resetSimulation();

      expect(useAutomataStore.getState().currentStateId).toBe('S0');

      // Step 1: Rise -> S1
      stepSimulation();
      expect(useAutomataStore.getState().currentStateId).toBe('S1');
      expect(useAutomataStore.getState().currentStepIndex).toBe(1);

      // Step 2: Hold -> S1
      stepSimulation();
      expect(useAutomataStore.getState().currentStateId).toBe('S1');
      expect(useAutomataStore.getState().currentStepIndex).toBe(2);
    });

    it('switches view mode between state_flow, nfa, dfa, and minimized_dfa', () => {
      const { setViewMode } = useAutomataStore.getState();
      setViewMode('dfa');
      expect(useAutomataStore.getState().viewMode).toBe('dfa');
      setViewMode('minimized_dfa');
      expect(useAutomataStore.getState().viewMode).toBe('minimized_dfa');
    });
  });

  describe('useTideDataStore', () => {
    it('sets time range and loads station data with anomaly detection', async () => {
      setupMockNoaaFetch({ mode: 'online' });
      const { loadStationData, setTimeRange } = useTideDataStore.getState();

      setTimeRange('48h');
      expect(useTideDataStore.getState().selectedTimeRange).toBe('48h');

      await loadStationData('8518750', 'The Battery, NY', 24, true);

      const state = useTideDataStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.points.length).toBeGreaterThan(0);
      expect(state.dataSource).toBe('live_noaa');
    });
  });

  describe('useAlertStore', () => {
    it('toggles alert rule active state and updates threshold', () => {
      const { rules, toggleRule, updateRuleThreshold } = useAlertStore.getState();
      const targetRule = rules[0];
      const initialEnabled = targetRule.enabled;

      toggleRule(targetRule.id);
      expect(useAlertStore.getState().rules.find(r => r.id === targetRule.id)?.enabled).toBe(!initialEnabled);

      updateRuleThreshold(targetRule.id, 0.45);
      expect(useAlertStore.getState().rules.find(r => r.id === targetRule.id)?.thresholdValue).toBe(0.45);
    });

    it('resolves triggered alerts', () => {
      const { triggeredAlerts, resolveAlert } = useAlertStore.getState();
      if (triggeredAlerts.length > 0) {
        const alertId = triggeredAlerts[0].id;
        resolveAlert(alertId);
        const resolved = useAlertStore.getState().triggeredAlerts.find(a => a.id === alertId);
        expect(resolved?.status).toBe('Resolved');
      }
    });
  });

  describe('useSettingsStore', () => {
    it('updates general application settings and display units', () => {
      const { updateSettings } = useSettingsStore.getState();
      updateSettings({
        waterLevelUnit: 'imperial',
        datum: 'NAVD88',
        dataRefreshIntervalMinutes: 10,
      });

      const updated = useSettingsStore.getState().settings;
      expect(updated.waterLevelUnit).toBe('imperial');
      expect(updated.datum).toBe('NAVD88');
      expect(updated.dataRefreshIntervalMinutes).toBe(10);
    });
  });
});
