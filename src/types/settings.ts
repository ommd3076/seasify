import { Datum, UnitSystem } from './noaa';

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Viewer';
  access: string;
}

export interface AppSettings {
  organizationName: string;
  domain: string;
  contactEmail: string;
  organizationType: string;
  primaryLocation: string;
  teamSize: number;
  waterLevelUnit: UnitSystem;
  datum: Datum;
  temperatureUnit: 'celsius' | 'fahrenheit';
  displayPrecision: number; // e.g. 2
  dataRefreshIntervalMinutes: number; // 5, 15, 30, 60
  timeZone: string;
  theme: 'light' | 'dark' | 'system';
  systemNotifications: boolean;
  emailSummaryFrequency: 'Daily' | 'Weekly' | 'Never';
}
