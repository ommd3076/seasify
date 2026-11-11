import { describe, it, expect, beforeEach } from 'vitest';
import { useNavigationStore } from '@/stores/navigationStore';
import { useStationStore } from '@/stores/stationStore';
import { useAutomataStore } from '@/stores/automataStore';
import { useAlertStore } from '@/stores/alertStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { NOAA_STATIONS } from '@/data/stations';

describe('Zustand State Stores', () => {
  describe('NavigationStore', () => {
    beforeEach(() => {
      useNavigationStore.setState({
        currentScreen: 'overview',
        selectedEventId: null,
      });
    });

    it('initializes on overview screen', () => {
      expect(useNavigationStore.getState().currentScreen).toBe('overview');
    });

    it('switches current screen', () => {
      useNavigationStore.getState().setCurrentScreen('stations');
      expect(useNavigationStore.getState().currentScreen).toBe('stations');

      useNavigationStore.getState().setCurrentScreen('monitoring');
      expect(useNavigationStore.getState().currentScreen).toBe('monitoring');
    });

    it('navigates to automata lab and selects pattern', () => {
      useNavigationStore.getState().navigateToAutomataLab('sustained_elevated');
      expect(useNavigationStore.getState().currentScreen).toBe('automata_lab');
      expect(useAutomataStore.getState().selectedPattern.id).toBe('sustained_elevated');
    });

    it('sets and clears selected event ID', () => {
      useNavigationStore.getState().setSelectedEventId('evt-123');
      expect(useNavigationStore.getState().selectedEventId).toBe('evt-123');

      useNavigationStore.getState().setSelectedEventId(null);
      expect(useNavigationStore.getState().selectedEventId).toBeNull();
    });
  });

  describe('StationStore', () => {
    beforeEach(() => {
      useStationStore.setState({
        stations: NOAA_STATIONS,
        selectedStation: NOAA_STATIONS[0],
        searchQuery: '',
        regionFilter: 'All Regions',
        statusFilter: 'All Statuses',
      });
    });

    it('loads bundled stations list and defaults to first station', () => {
      const state = useStationStore.getState();
      expect(state.stations.length).toBeGreaterThanOrEqual(10);
      expect(state.selectedStation.id).toBe(NOAA_STATIONS[0].id);
    });

    it('selects station by station ID', () => {
      const sfStation = NOAA_STATIONS.find(s => s.id === '9414290')!;
      useStationStore.getState().selectStation('9414290');
      expect(useStationStore.getState().selectedStation.name).toBe(sfStation.name);
    });

    it('updates search query and filters', () => {
      useStationStore.getState().setSearchQuery('Boston');
      expect(useStationStore.getState().searchQuery).toBe('Boston');

      useStationStore.getState().setRegionFilter('Pacific');
      expect(useStationStore.getState().regionFilter).toBe('Pacific');

      useStationStore.getState().setStatusFilter('elevated');
      expect(useStationStore.getState().statusFilter).toBe('elevated');
    });
  });

  describe('AutomataStore', () => {
    beforeEach(() => {
      useAutomataStore.getState().resetSimulation();
      useAutomataStore.getState().clearInputTokens();
    });

    it('manages input tokens for sequence simulation', () => {
      const store = useAutomataStore.getState();
      store.addInputToken('Rise');
      store.addInputToken('Hold');
      store.addInputToken('Fall');

      expect(useAutomataStore.getState().inputTokens).toEqual(['Rise', 'Hold', 'Fall']);

      useAutomataStore.getState().removeInputToken(1);
      expect(useAutomataStore.getState().inputTokens).toEqual(['Rise', 'Fall']);

      useAutomataStore.getState().clearInputTokens();
      expect(useAutomataStore.getState().inputTokens).toEqual([]);
    });

    it('steps through interactive sequence simulator transitions', () => {
      useAutomataStore.getState().selectPattern('abnormal_recovery');
      useAutomataStore.getState().clearInputTokens();
      useAutomataStore.getState().addInputToken('Rise');
      useAutomataStore.getState().addInputToken('Hold');
      useAutomataStore.getState().addInputToken('Fall');
      useAutomataStore.getState().resetSimulation();

      expect(useAutomataStore.getState().currentStateId).toBe('S0');
      expect(useAutomataStore.getState().currentStepIndex).toBe(0);

      // Step 1: Rise -> S1
      useAutomataStore.getState().stepSimulation();
      expect(useAutomataStore.getState().currentStepIndex).toBe(1);
      expect(useAutomataStore.getState().currentStateId).toBe('S1');

      // Step 2: Hold -> S1
      useAutomataStore.getState().stepSimulation();
      expect(useAutomataStore.getState().currentStepIndex).toBe(2);
      expect(useAutomataStore.getState().currentStateId).toBe('S1');

      // Step 3: Fall -> S2 (accepting!)
      useAutomataStore.getState().stepSimulation();
      expect(useAutomataStore.getState().currentStepIndex).toBe(3);
      expect(useAutomataStore.getState().currentStateId).toBe('S2');
      expect(useAutomataStore.getState().simulationResult?.matched).toBe(true);
    });

    it('switches view mode between state_flow, nfa, dfa, and minimized_dfa', () => {
      useAutomataStore.getState().setViewMode('dfa');
      expect(useAutomataStore.getState().viewMode).toBe('dfa');

      useAutomataStore.getState().setViewMode('minimized_dfa');
      expect(useAutomataStore.getState().viewMode).toBe('minimized_dfa');
    });
  });

  describe('AlertStore', () => {
    it('toggles alert rules on and off', () => {
      const initialRule = useAlertStore.getState().rules[0];
      const initialEnabled = initialRule.enabled;

      useAlertStore.getState().toggleRule(initialRule.id);
      const toggled = useAlertStore.getState().rules.find(r => r.id === initialRule.id)!;
      expect(toggled.enabled).toBe(!initialEnabled);

      useAlertStore.getState().toggleRule(initialRule.id);
      const reverted = useAlertStore.getState().rules.find(r => r.id === initialRule.id)!;
      expect(reverted.enabled).toBe(initialEnabled);
    });

    it('updates rule threshold value', () => {
      const ruleId = useAlertStore.getState().rules[0].id;
      useAlertStore.getState().updateRuleThreshold(ruleId, 0.48);
      const updated = useAlertStore.getState().rules.find(r => r.id === ruleId)!;
      expect(updated.thresholdValue).toBe(0.48);
    });

    it('updates notification channel preferences', () => {
      useAlertStore.getState().updateNotificationChannels({
        sms: true,
        teams: false,
      });
      const channels = useAlertStore.getState().notificationChannels;
      expect(channels.sms).toBe(true);
      expect(channels.teams).toBe(false);
    });
  });

  describe('SettingsStore', () => {
    it('updates organization settings and preferences', () => {
      useSettingsStore.getState().updateSettings({
        waterLevelUnit: 'english',
        datum: 'NAVD88',
        displayPrecision: 3,
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.waterLevelUnit).toBe('english');
      expect(settings.datum).toBe('NAVD88');
      expect(settings.displayPrecision).toBe(3);

      // Revert back to metric
      useSettingsStore.getState().updateSettings({
        waterLevelUnit: 'metric',
        datum: 'MLLW',
      });
    });

    it('adds and removes team members', () => {
      const initialCount = useSettingsStore.getState().teamMembers.length;
      useSettingsStore.getState().addTeamMember({
        name: 'Dr. Sarah Connor',
        email: 's.connor@noaa.gov',
        role: 'Analyst',
        access: 'Sensor Telemetry',
      });

      expect(useSettingsStore.getState().teamMembers.length).toBe(initialCount + 1);

      const added = useSettingsStore.getState().teamMembers.find(m => m.email === 's.connor@noaa.gov')!;
      expect(added).toBeDefined();

      useSettingsStore.getState().removeTeamMember(added.id);
      expect(useSettingsStore.getState().teamMembers.length).toBe(initialCount);
    });
  });
});
