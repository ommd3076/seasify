export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  thresholdValue: number;
  thresholdUnit: string;
  stationScope: 'all' | string[];
  enabled: boolean;
  severity: 'High' | 'Moderate' | 'Low';
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  stationId: string;
  stationName: string;
  timestamp: string;
  details: string;
  delta: number;
  status: 'Active' | 'Resolved';
}

export interface NotificationChannels {
  email: boolean;
  emailAddress: string;
  slack: boolean;
  slackChannel: string;
  sms: boolean;
  phoneNumber: string;
  teams: boolean;
  teamsWebhook: string;
  inApp: boolean;
  webhook?: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
