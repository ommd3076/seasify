import React, { useState } from 'react';
import {
  Building2,
  Sliders,
  Globe2,
  Clock,
  Shield,
  Palette,
  CheckCircle2,
  Save,
  Users,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const SettingsScreen: React.FC = () => {
  const { settings, teamMembers, updateSettings } = useSettingsStore();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const refreshIntervals = [5, 15, 30, 60, 360];

  return (
    <div data-testid="screen-settings" className="space-y-6">
      {/* Toast */}
      {saveSuccess && (
        <div className="bg-[#A5F5A6] text-[#171A18] px-4 py-2.5 rounded-card border border-[#68DD79] flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#156024]" />
            <span className="text-sm font-semibold">Settings and preferences saved successfully</span>
          </div>
        </div>
      )}

      {/* 2-Column Balanced Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organization Profile & User Roles (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Organization Profile Card */}
          <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-surface-muted border border-border flex items-center justify-center text-mint-strong">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-text">Organization Profile</h3>
                <p className="text-xs text-secondary-text">Monitoring entity and regional operational center</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => updateSettings({ organizationName: e.target.value })}
                  className="w-full px-4 py-2 rounded-card bg-surface-muted border border-border text-sm font-medium text-primary-text focus:outline-none focus:border-mint-strong"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-text uppercase mb-1">
                    Telemetry Domain
                  </label>
                  <input
                    type="text"
                    value={settings.domain}
                    onChange={(e) => updateSettings({ domain: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-card bg-surface-muted border border-border text-xs font-mono text-primary-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-text uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-card bg-surface-muted border border-border text-xs text-primary-text focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase mb-1">
                  Operational Headquarters
                </label>
                <input
                  type="text"
                  value={settings.primaryLocation}
                  onChange={(e) => updateSettings({ primaryLocation: e.target.value })}
                  className="w-full px-4 py-2 rounded-card bg-surface-muted border border-border text-xs text-primary-text focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* User Roles & Access Table */}
          <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary-text" />
                <h3 className="text-base font-bold text-primary-text">Authorized Team Roles</h3>
              </div>
              <Badge variant="normal" size="sm">Active Team</Badge>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-card bg-surface-muted border border-border flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-primary-text">{member.name}</div>
                    <div className="text-xs text-secondary-text">{member.email}</div>
                    <div className="text-[11px] text-secondary-text mt-0.5">{member.access}</div>
                  </div>
                  <Badge variant={member.role === 'Admin' ? 'high' : 'normal'} size="sm">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preferences, Polling, Datums (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Measurement & Datum Preferences */}
          <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-surface-muted border border-border flex items-center justify-center text-lavender-dark">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-text">Measurement Preferences</h3>
                <p className="text-xs text-secondary-text">Standardize telemetry units and tidal datum baselines</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Unit Selection */}
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase mb-2">
                  Water Level Measurement Unit
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSettings({ waterLevelUnit: 'metric' })}
                    className={`py-2.5 px-4 rounded-card border text-sm font-semibold transition ${
                      settings.waterLevelUnit === 'metric'
                        ? 'bg-[#A5F5A6] text-[#171A18] border-[#68DD79]'
                        : 'bg-surface-muted text-secondary-text border-border'
                    }`}
                  >
                    Meters (m) — Metric
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ waterLevelUnit: 'imperial' })}
                    className={`py-2.5 px-4 rounded-card border text-sm font-semibold transition ${
                      settings.waterLevelUnit === 'imperial'
                        ? 'bg-[#A5F5A6] text-[#171A18] border-[#68DD79]'
                        : 'bg-surface-muted text-secondary-text border-border'
                    }`}
                  >
                    Feet (ft) — Imperial
                  </button>
                </div>
              </div>

              {/* Datum Baseline */}
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase mb-2">
                  Vertical Tidal Datum Reference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MLLW', 'MSL', 'NAVD88'] as const).map((datumOption) => (
                    <button
                      key={datumOption}
                      type="button"
                      onClick={() => updateSettings({ datum: datumOption })}
                      className={`py-2 px-3 rounded-card border text-xs font-bold transition ${
                        settings.datum === datumOption
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-surface-muted text-secondary-text border-border'
                      }`}
                    >
                      {datumOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <label className="block text-xs font-semibold text-secondary-text uppercase mb-2">
                  NOAA Telemetry Background Polling Interval
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {refreshIntervals.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updateSettings({ dataRefreshIntervalMinutes: mins })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        settings.dataRefreshIntervalMinutes === mins
                          ? 'bg-[#A5F5A6] text-[#171A18] border border-[#68DD79]'
                          : 'bg-surface-muted text-secondary-text border border-border'
                      }`}
                    >
                      {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-secondary-text">All parameters persist locally</span>
                <Button variant="primary" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
