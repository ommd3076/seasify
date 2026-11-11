import { create } from 'zustand';
import { AppSettings, UserRole } from '@/types/settings';

interface SettingsState {
  settings: AppSettings;
  teamMembers: UserRole[];
  userRoles: UserRole[];
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addTeamMember: (member: Omit<UserRole, 'id'>) => void;
  removeTeamMember: (id: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  organizationName: 'National Ocean & Coastal Research Lab',
  domain: 'coastal-monitoring.noaa.gov',
  contactEmail: 'ocean-ops@seasify.gov',
  organizationType: 'Federal Oceanographic Institute',
  primaryLocation: 'Woods Hole & Silver Spring, MD',
  teamSize: 18,
  waterLevelUnit: 'metric',
  datum: 'MLLW',
  temperatureUnit: 'celsius',
  displayPrecision: 2,
  dataRefreshIntervalMinutes: 5,
  timeZone: 'UTC',
  theme: 'light',
  systemNotifications: true,
  emailSummaryFrequency: 'Daily',
};

const DEFAULT_TEAM_MEMBERS: UserRole[] = [
  {
    id: 'u1',
    name: 'Dr. Eleanor Vance',
    email: 'e.vance@seasify.gov',
    role: 'Admin',
    access: 'Full System Control & Calibration',
  },
  {
    id: 'u2',
    name: 'Marcus Chen',
    email: 'm.chen@seasify.gov',
    role: 'Analyst',
    access: 'Anomaly Annotation & DFA Tuning',
  },
  {
    id: 'u3',
    name: 'Capt. Sarah Jenkins',
    email: 's.jenkins@port-ops.org',
    role: 'Viewer',
    access: 'Read-only Dashboards & Reports',
  },
];

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  teamMembers: DEFAULT_TEAM_MEMBERS,
  userRoles: DEFAULT_TEAM_MEMBERS,

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  addTeamMember: (member) => {
    const newMember: UserRole = {
      ...member,
      id: `u-${Date.now()}`,
    };
    set((state) => ({ teamMembers: [...state.teamMembers, newMember] }));
  },

  removeTeamMember: (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== id),
    }));
  },
}));
