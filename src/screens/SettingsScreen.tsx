import React, { useState } from 'react';
import {
  Building2,
  RefreshCw,
  Users,
  Sliders,
  MapPin,
  Monitor,
  Edit2,
  Plus,
  MoreHorizontal,
  Sun,
  Moon,
  Laptop,
  Info,
  Check,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatWaterLevel } from '@/utils/formatUnit';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [refreshInterval, setRefreshInterval] = useState('15 min');
  const [waterUnit, setWaterUnit] = useState<'meters' | 'feet'>(
    settings.waterLevelUnit === 'english' ? 'feet' : 'meters'
  );
  const [tideRef, setTideRef] = useState('msl');
  const [tempUnit, setTempUnit] = useState('celsius');
  const [theme, setTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [stationsList, setStationsList] = useState([
    { id: 'hp', name: 'Harbor Point', updated: 'Last update 2 min ago', active: true },
    { id: 'bi', name: 'Bayview Inlet', updated: 'Last update 5 min ago', active: true },
    { id: 'ej', name: 'East Jetty', updated: 'Last update 8 min ago', active: true },
  ]);

  const toggleStation = (id: string) => {
    setStationsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div data-testid="screen-settings" className="space-y-6">
      {/* Toast */}
      {saveSuccess && (
        <div className="bg-[#A5F5A6] text-[#171A18] px-4 py-2.5 rounded-card border border-[#68DD79] flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <span className="text-sm font-semibold">Settings saved successfully</span>
          <button onClick={() => setSaveSuccess(false)} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* 2-Column Balanced Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Organization Profile */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text leading-tight">
                    Organization Profile
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Your organization details and identity
                  </p>
                </div>
              </div>

              <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-surface-muted transition flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Inner Brand Card */}
            <div className="p-4 rounded-[22px] bg-surface-muted/60 border border-border flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                  <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                </svg>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-primary-text">
                  Seasify Research
                </h4>
                <div className="text-xs font-medium text-secondary-text mt-0.5">
                  seasify.org
                </div>
                <div className="text-xs text-secondary-text">
                  research@seasify.org
                </div>
              </div>
            </div>

            {/* Profile Rows */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-secondary-text">Organization type</span>
                <span className="font-bold text-primary-text">Research & Monitoring</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-secondary-text">Primary location</span>
                <span className="font-bold text-primary-text">Bayview, CA</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-secondary-text">Team size</span>
                <span className="font-bold text-primary-text">24 users</span>
              </div>
            </div>
          </div>

          {/* Card 2: Data Refresh Interval */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Data Refresh Interval
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Control how often station data is updated
                </p>
              </div>
            </div>

            {/* Segmented Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-surface-muted border border-border mb-4">
              {['5 min', '15 min', '30 min', '1 hour', '6 hours'].map((int) => (
                <button
                  key={int}
                  onClick={() => setRefreshInterval(int)}
                  className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold transition text-center ${
                    refreshInterval === int
                      ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                      : 'text-secondary-text hover:text-primary-text'
                  }`}
                >
                  {int}
                </button>
              ))}
            </div>

            {/* Notice Callout */}
            <div className="p-3 rounded-20 bg-[#F3EEFD] border border-[#E0D4FC] text-xs text-[#784FD8] flex items-center gap-2">
              <span>ⓘ</span>
              <span>Data will refresh every {refreshInterval} for all active stations.</span>
            </div>
          </div>

          {/* Card 3: User Roles */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text leading-tight">
                    User Roles
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Manage users, roles, and permissions
                  </p>
                </div>
              </div>

              <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-surface-muted transition flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Invite User</span>
              </button>
            </div>

            {/* Roles Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-secondary-text">
                    <th className="pb-2 font-semibold">User</th>
                    <th className="pb-2 font-semibold">Role</th>
                    <th className="pb-2 font-semibold">Access</th>
                    <th className="pb-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    {
                      name: 'Emma Carter',
                      email: 'emma@seasify.org',
                      role: 'Admin',
                      access: 'Full access',
                      roleColor: 'bg-[#DCFADC] text-[#156024]',
                    },
                    {
                      name: 'Liam Brooks',
                      email: 'liam@seasify.org',
                      role: 'Analyst',
                      access: 'View & analyze',
                      roleColor: 'bg-[#EBE0FE] text-[#784FD8]',
                    },
                    {
                      name: 'Mia Chen',
                      email: 'mia@seasify.org',
                      role: 'Viewer',
                      access: 'View only',
                      roleColor: 'bg-[#F3F4F6] text-[#6B7280]',
                    },
                  ].map((u) => (
                    <tr key={u.email} className="hover:bg-surface-muted/40 transition">
                      <td className="py-2.5">
                        <div className="font-bold text-primary-text">{u.name}</div>
                        <div className="text-[11px] text-secondary-text">{u.email}</div>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${u.roleColor}`}>
                          {u.role} ⌄
                        </span>
                      </td>
                      <td className="py-2.5 text-secondary-text">{u.access}</td>
                      <td className="py-2.5 text-right">
                        <MoreHorizontal className="w-4 h-4 text-secondary-text inline-block cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-secondary-text hover:text-primary-text cursor-pointer">
              <span>Manage Roles & Permissions</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Units & Measurement Preferences */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Units & Measurement Preferences
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Choose how data is displayed and calculated
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Water level unit */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary-text block">
                    Water level unit
                  </span>
                  <span className="text-[11px] text-secondary-text">
                    Applied globally across all charts & gauges
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-full bg-surface-muted border border-border">
                  <button
                    onClick={() => {
                      setWaterUnit('meters');
                      updateSettings({ waterLevelUnit: 'metric' });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      waterUnit === 'meters'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Meters (m)
                  </button>
                  <button
                    onClick={() => {
                      setWaterUnit('feet');
                      updateSettings({ waterLevelUnit: 'english' });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      waterUnit === 'feet'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Feet (ft)
                  </button>
                </div>
              </div>

              {/* Unit Conversion Live Feedback */}
              <div className="p-3 rounded-20 bg-[#DCFADC]/50 border border-[#A5F5A6] flex items-center justify-between text-xs">
                <span className="text-secondary-text font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#156024]" />
                  Active conversion:
                </span>
                <span className="font-mono font-bold text-[#156024]">
                  {waterUnit === 'feet'
                    ? `1.00 m = 3.28 ft (Imperial active)`
                    : `1.00 m = 1.00 m (SI Metric active)`}
                </span>
              </div>

              {/* Tide height reference */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 relative">
                  <span className="text-xs font-bold text-primary-text">
                    Tide height reference
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'tideRef' ? null : 'tideRef')}
                    onMouseEnter={() => setActiveTooltip('tideRef')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="w-4 h-4 rounded-full bg-[#EAEFEC] hover:bg-[#D9DEDA] text-secondary-text hover:text-primary-text flex items-center justify-center text-[10px] font-bold cursor-pointer transition shadow-2xs"
                    title="Click for datum details"
                  >
                    ⓘ
                  </button>
                  {activeTooltip === 'tideRef' && (
                    <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white rounded-2xl shadow-xl border border-border text-xs text-primary-text leading-relaxed">
                      <div className="font-bold mb-1 text-[#156024]">Tidal Reference Datums</div>
                      <p className="text-[11px] text-secondary-text">
                        <strong>MSL (Mean Sea Level):</strong> 19-year National Tidal Datum Epoch arithmetic mean.<br />
                        <strong>Chart Datum (MLLW):</strong> Mean Lower Low Water sounding base for nautical navigation.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 p-1 rounded-full bg-surface-muted border border-border">
                  <button
                    onClick={() => setTideRef('msl')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      tideRef === 'msl'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Mean Sea Level
                  </button>
                  <button
                    onClick={() => setTideRef('datum')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      tideRef === 'datum'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Chart Datum
                  </button>
                </div>
              </div>

              {/* Temperature unit */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-text">
                  Temperature unit
                </span>
                <div className="flex items-center gap-1 p-1 rounded-full bg-surface-muted border border-border">
                  <button
                    onClick={() => setTempUnit('celsius')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      tempUnit === 'celsius'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    onClick={() => setTempUnit('fahrenheit')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      tempUnit === 'fahrenheit'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>

              {/* Display precision */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 relative">
                  <span className="text-xs font-bold text-primary-text">
                    Display precision
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'precision' ? null : 'precision')}
                    onMouseEnter={() => setActiveTooltip('precision')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="w-4 h-4 rounded-full bg-[#EAEFEC] hover:bg-[#D9DEDA] text-secondary-text hover:text-primary-text flex items-center justify-center text-[10px] font-bold cursor-pointer transition shadow-2xs"
                    title="Click for precision details"
                  >
                    ⓘ
                  </button>
                  {activeTooltip === 'precision' && (
                    <div className="absolute left-0 bottom-6 z-50 w-64 p-3 bg-white rounded-2xl shadow-xl border border-border text-xs text-primary-text leading-relaxed">
                      <div className="font-bold mb-1 text-[#156024]">Sensor Precision</div>
                      <p className="text-[11px] text-secondary-text">
                        Formats acoustic sensor soundings to 2 decimals (0.01 m ≈ 1 cm), exceeding IHO S-44 hydrographic standards.
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-3 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-2 cursor-pointer">
                  <span>2 decimal places (e.g., 1.23 m / 4.04 ft)</span>
                  <span className="text-[10px] text-secondary-text">⌄</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Station Management */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text leading-tight">
                    Station Management
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Add, edit, and organize monitoring stations
                  </p>
                </div>
              </div>

              <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-surface-muted transition flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Station</span>
              </button>
            </div>

            <div className="space-y-2.5 mb-4">
              {stationsList.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-20 bg-surface-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                        <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-primary-text truncate">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-secondary-text truncate mt-0.5">
                        Active • {st.updated}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleStation(st.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                        st.active ? 'bg-[#68DD79]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                          st.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <Edit2 className="w-3.5 h-3.5 text-secondary-text cursor-pointer" />
                    <MoreHorizontal className="w-4 h-4 text-secondary-text cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-secondary-text hover:text-primary-text cursor-pointer">
              <span>View All Stations (12)</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Theme & System Preferences */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Theme & System Preferences
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Customize the look, behavior, and regional settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Theme Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-text">Theme</span>
                <div className="flex items-center gap-1 p-1 rounded-full bg-surface-muted border border-border">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      theme === 'light'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      theme === 'dark'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      theme === 'system'
                        ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                        : 'text-secondary-text'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* System Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-primary-text">
                    System notifications
                  </div>
                  <div className="text-[11px] text-secondary-text">
                    Updates, data delays, and important alerts
                  </div>
                </div>

                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    notificationsEnabled ? 'bg-[#68DD79]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Email summaries */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-primary-text">
                    Email summaries
                  </div>
                  <div className="text-[11px] text-secondary-text">
                    Receive a daily or weekly monitoring summary
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
                  <span>Daily</span>
                  <span className="text-[10px] text-secondary-text">⌄</span>
                </div>
              </div>

              {/* Time zone */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-text">Time zone</span>
                <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
                  <span>(UTC-08:00) Pacific Time (US & Canada)</span>
                  <span className="text-[10px] text-secondary-text">⌄</span>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-text">Language</span>
                <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
                  <span>English (US)</span>
                  <span className="text-[10px] text-secondary-text">⌄</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Limitation & Educational Disclaimer Notice */}
      <div className="p-4 rounded-[22px] bg-surface border border-border flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-[#EAEFEC] text-[#737A75] flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
          ℹ
        </div>
        <div className="text-xs text-secondary-text leading-relaxed">
          <span className="font-bold text-primary-text block mb-0.5">Scientific Limitation & Educational Purpose</span>
          A positive residual is not necessarily a flood, and a negative residual is not necessarily a dangerous low tide. Seasify is an educational and analytical research platform utilizing finite automata theory for environmental time-series pattern recognition, not a certified life-safety flood-warning or maritime-navigation system.
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
