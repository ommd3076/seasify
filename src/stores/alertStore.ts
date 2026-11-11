import { create } from 'zustand';
import { AlertRule, TriggeredAlert, NotificationChannels } from '@/types/alerts';

interface AlertState {
  rules: AlertRule[];
  triggeredAlerts: TriggeredAlert[];
  notificationChannels: NotificationChannels;
  toggleRule: (id: string) => void;
  updateRuleThreshold: (id: string, thresholdValue: number) => void;
  addRule: (rule: Omit<AlertRule, 'id'>) => void;
  deleteRule: (id: string) => void;
  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  updateNotificationChannels: (channels: Partial<NotificationChannels>) => void;
}

const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'rule-surge-positive',
    name: 'Severe Storm Surge Residual',
    description: 'Triggers when non-tidal residual exceeds positive hazard threshold',
    condition: 'residual > threshold',
    thresholdValue: 0.35,
    thresholdUnit: 'm',
    stationScope: 'all',
    enabled: true,
    severity: 'High',
  },
  {
    id: 'rule-rapid-rise',
    name: 'Rapid Rate of Rise (Flash Surge)',
    description: 'Triggers when rate of water-level rise exceeds hydro threshold',
    condition: 'rate_of_change > threshold',
    thresholdValue: 0.25,
    thresholdUnit: 'm/hr',
    stationScope: 'all',
    enabled: true,
    severity: 'High',
  },
  {
    id: 'rule-blowout',
    name: 'Low Water Blowout Negative Residual',
    description: 'Triggers when strong offshore winds depress water levels below navigation draft',
    condition: 'residual < threshold',
    thresholdValue: -0.30,
    thresholdUnit: 'm',
    stationScope: 'all',
    enabled: true,
    severity: 'Moderate',
  },
  {
    id: 'rule-data-gap',
    name: 'Sensor Telemetry Gap',
    description: 'Triggers when consecutive observation timestamps exceed allowable telemetry delay',
    condition: 'telemetry_gap > threshold',
    thresholdValue: 30,
    thresholdUnit: 'min',
    stationScope: 'all',
    enabled: false,
    severity: 'Low',
  },
  {
    id: 'rule-oscillatory-seiche',
    name: 'Oscillatory Harbor Seiche',
    description: 'Automata detects sub-tidal alternating sign oscillations exceeding harmonic baseline',
    condition: 'pattern_detected == "oscillatory"',
    thresholdValue: 0.20,
    thresholdUnit: 'm',
    stationScope: 'all',
    enabled: true,
    severity: 'Moderate',
  },
];

const DEFAULT_ALERTS: TriggeredAlert[] = [
  {
    id: 'trig-1',
    ruleId: 'rule-surge-positive',
    ruleName: 'Severe Storm Surge Residual',
    stationId: '9414290',
    stationName: 'San Francisco, CA',
    timestamp: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    details: 'Observed residual +0.42m exceeds positive threshold of +0.35m',
    delta: 0.42,
    status: 'Active',
  },
  {
    id: 'trig-2',
    ruleId: 'rule-rapid-rise',
    ruleName: 'Rapid Rate of Rise (Flash Surge)',
    stationId: '8771450',
    stationName: 'Galveston Pier 21, TX',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    details: 'Rate of change +0.28 m/hr triggered over 18 min window',
    delta: 0.28,
    status: 'Active',
  },
  {
    id: 'trig-3',
    ruleId: 'rule-blowout',
    ruleName: 'Low Water Blowout Negative Residual',
    stationId: '8726520',
    stationName: 'St. Petersburg, FL',
    timestamp: new Date(Date.now() - 340 * 60 * 1000).toISOString(),
    details: 'Negative depression of -0.32m sustained for 3 samples',
    delta: -0.32,
    status: 'Resolved',
  },
  {
    id: 'trig-4',
    ruleId: 'rule-surge-positive',
    ruleName: 'Severe Storm Surge Residual',
    stationId: '8518750',
    stationName: 'The Battery, NY',
    timestamp: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
    details: 'Observed residual reached +0.38m during high astronomical tide',
    delta: 0.38,
    status: 'Resolved',
  },
];

const DEFAULT_CHANNELS: NotificationChannels = {
  email: true,
  emailAddress: 'ocean-ops@seasify.gov',
  slack: true,
  slackChannel: '#coastal-hydro-alerts',
  sms: false,
  phoneNumber: '+1 (555) 234-5678',
  teams: false,
  teamsWebhook: 'https://outlook.office.com/webhook/seasify...',
  inApp: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
};

export const useAlertStore = create<AlertState>((set) => ({
  rules: DEFAULT_RULES,
  triggeredAlerts: DEFAULT_ALERTS,
  notificationChannels: DEFAULT_CHANNELS,

  toggleRule: (id: string) => {
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    }));
  },

  updateRuleThreshold: (id: string, thresholdValue: number) => {
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, thresholdValue } : r)),
    }));
  },

  addRule: (ruleData) => {
    const newRule: AlertRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
    };
    set((state) => ({ rules: [newRule, ...state.rules] }));
  },

  deleteRule: (id: string) => {
    set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
  },

  resolveAlert: (id: string) => {
    set((state) => ({
      triggeredAlerts: state.triggeredAlerts.map((a) =>
        a.id === id ? { ...a, status: 'Resolved' } : a
      ),
    }));
  },

  dismissAlert: (id: string) => {
    set((state) => ({
      triggeredAlerts: state.triggeredAlerts.filter((a) => a.id !== id),
    }));
  },

  updateNotificationChannels: (channels) => {
    set((state) => ({
      notificationChannels: { ...state.notificationChannels, ...channels },
    }));
  },
}));
