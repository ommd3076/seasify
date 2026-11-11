import React, { useState } from 'react';
import {
  Bell,
  Send,
  Moon,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
} from 'lucide-react';

export const AlertsScreen: React.FC = () => {
  const [rules, setRules] = useState([
    {
      id: 'r1',
      name: 'Elevated water level',
      sub: 'Water level above expected range',
      threshold: '≥ +2.30 m (above mean)',
      scope: 'All stations',
      enabled: true,
      variant: 'mint',
    },
    {
      id: 'r2',
      name: 'Rapid rise',
      sub: 'Water level increases too quickly',
      threshold: '≥ +0.50 m / 1 h',
      scope: 'All stations',
      enabled: true,
      variant: 'lavender',
    },
    {
      id: 'r3',
      name: 'Lower-than-expected tide',
      sub: 'Water level below expected range',
      threshold: '≤ -0.90 m (below mean)',
      scope: 'All stations',
      enabled: true,
      variant: 'lavender',
    },
    {
      id: 'r4',
      name: 'Repeated oscillation',
      sub: 'Unusually frequent water-level swings',
      threshold: '≥ 3 cycles / 6 h (amplitude ≥ 0.30 m)',
      scope: 'All stations',
      enabled: true,
      variant: 'mint',
    },
    {
      id: 'r5',
      name: 'Sensor outage',
      sub: 'No data received from a station',
      threshold: 'No data ≥ 10 min',
      scope: 'All stations',
      enabled: true,
      variant: 'lavender',
    },
  ]);

  const [channels, setChannels] = useState({
    email: true,
    slack: true,
    sms: false,
    teams: true,
  });

  const [quietHours, setQuietHours] = useState(true);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div data-testid="screen-alerts" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Summary, Rules, Activity Table (8 cols / ~68%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Alert Summary (Charcoal Card) */}
          <div className="bg-[#242424] text-white rounded-[28px] p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Alert Summary
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Last 30 days
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#333333] border border-[#444444] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer">
                <span>All Stations</span>
                <span className="text-[10px] text-gray-400">⌄</span>
              </div>
            </div>

            <div className="flex items-end justify-between pt-2">
              <div className="flex items-baseline gap-6 sm:gap-8">
                <div>
                  <div className="text-5xl font-black font-sans text-white tracking-tight">
                    14
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Total alerts
                  </div>
                </div>

                <div className="border-l border-[#383838] pl-5 sm:pl-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#A5F5A6] text-[#171A18] flex items-center justify-center text-[10px] font-bold">
                      ↗
                    </span>
                    <span className="text-2xl font-black font-sans text-white">7</span>
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Elevated / Rapid
                  </div>
                </div>

                <div className="border-l border-[#383838] pl-5 sm:pl-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#C5A8F8] text-[#171A18] flex items-center justify-center text-[10px] font-bold">
                      ↘
                    </span>
                    <span className="text-2xl font-black font-sans text-white">4</span>
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Low tide
                  </div>
                </div>

                <div className="border-l border-[#383838] pl-5 sm:pl-6 hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#333333] text-gray-300 border border-[#555] flex items-center justify-center text-[10px] font-bold">
                      △
                    </span>
                    <span className="text-2xl font-black font-sans text-white">3</span>
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    System / Other
                  </div>
                </div>
              </div>

              {/* Monthly mini histogram */}
              <div className="flex items-end gap-1.5 h-12">
                {[
                  { h: 20, color: 'bg-[#A5F5A6]' },
                  { h: 36, color: 'bg-[#68DD79]' },
                  { h: 16, color: 'bg-[#C5A8F8]' },
                  { h: 28, color: 'bg-[#68DD79]' },
                  { h: 42, color: 'bg-[#A5F5A6]' },
                  { h: 24, color: 'bg-[#C5A8F8]' },
                ].map((b, i) => (
                  <div
                    key={i}
                    className={`w-2.5 rounded-t-md ${b.color}`}
                    style={{ height: `${b.h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Alert Rules */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Alert Rules
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Define conditions, thresholds, and scope
                </p>
              </div>

              <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-surface-muted transition flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => {
                const isMint = rule.variant === 'mint';

                return (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-[22px] bg-surface-card hover:bg-surface-muted/50 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 md:w-64 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                          isMint ? 'bg-[#DCFADC] text-[#227C34]' : 'bg-[#EBE0FE] text-[#784FD8]'
                        }`}
                      >
                        {rule.name.includes('Rapid') || rule.name.includes('Elevated') ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : rule.name.includes('Lower') ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : rule.name.includes('Repeated') ? (
                          <Activity className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-primary-text truncate">
                          {rule.name}
                        </div>
                        <div className="text-[11px] text-secondary-text truncate mt-0.5">
                          {rule.sub}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-primary-text">
                      {rule.threshold}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="px-2.5 py-1 rounded-full bg-surface-muted border border-border text-[11px] font-semibold text-secondary-text flex items-center gap-1 cursor-pointer">
                        <span>{rule.scope}</span>
                        <span className="text-[9px]">⌄</span>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                          rule.enabled ? 'bg-[#68DD79]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            rule.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <MoreHorizontal className="w-4 h-4 text-secondary-text cursor-pointer" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Recent Alert Activity Table */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary-text leading-tight">
                  Recent Alert Activity
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Latest alerts across your network
                </p>
              </div>

              <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-surface-muted transition flex items-center gap-1">
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-secondary-text">
                    <th className="pb-3 font-semibold">Time (Local)</th>
                    <th className="pb-3 font-semibold">Alert</th>
                    <th className="pb-3 font-semibold">Station</th>
                    <th className="pb-3 font-semibold">Details</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    {
                      time: 'Nov 18, 14:26',
                      alert: 'Elevated water level',
                      variant: 'mint',
                      station: 'Harbor Point',
                      details: '2.47 m (+0.17 m above threshold)',
                      status: 'Active',
                    },
                    {
                      time: 'Nov 18, 09:36',
                      alert: 'Rapid rise',
                      variant: 'lavender',
                      station: 'East Jetty',
                      details: '+0.58 m in 1 h',
                      status: 'Resolved',
                    },
                    {
                      time: 'Nov 17, 20:47',
                      alert: 'Lower-than-expected tide',
                      variant: 'lavender',
                      station: 'Bayview Inlet',
                      details: '0.83 m (-0.07 m below threshold)',
                      status: 'Resolved',
                    },
                    {
                      time: 'Nov 16, 03:15',
                      alert: 'Repeated oscillation',
                      variant: 'mint',
                      station: 'East Jetty',
                      details: '4 cycles / 6 h (amp 0.34 m)',
                      status: 'Resolved',
                    },
                    {
                      time: 'Nov 15, 11:02',
                      alert: 'Sensor outage',
                      variant: 'lavender',
                      station: 'North Pier',
                      details: 'No data for 14 min',
                      status: 'Resolved',
                    },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-surface-muted/40 transition">
                      <td className="py-3 text-secondary-text">{row.time}</td>
                      <td className="py-3 font-bold text-primary-text flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            row.variant === 'mint'
                              ? 'bg-[#DCFADC] text-[#227C34]'
                              : 'bg-[#EBE0FE] text-[#784FD8]'
                          }`}
                        >
                          {row.variant === 'mint' ? '↗' : '↘'}
                        </span>
                        <span>{row.alert}</span>
                      </td>
                      <td className="py-3 text-primary-text">{row.station}</td>
                      <td className="py-3 text-secondary-text font-mono">{row.details}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            row.status === 'Active'
                              ? 'bg-[#DCFADC] text-[#156024]'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <MoreHorizontal className="w-4 h-4 text-secondary-text inline-block cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Status, Channels, Quiet Hours, Rule Health (4 cols / ~32%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Alert Status */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary-text leading-tight">
                    Alert Status
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5">
                    System is monitoring
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFADC] text-[#156024]">
                <span className="w-2 h-2 rounded-full bg-[#359D45] animate-pulse" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-20 bg-surface-muted/60 border border-border">
                <div className="text-2xl font-black font-sans text-primary-text">
                  5
                </div>
                <div className="text-xs text-secondary-text mt-0.5">
                  Active rules
                </div>
              </div>

              <div className="p-3 rounded-20 bg-surface-muted/60 border border-border">
                <div className="text-2xl font-black font-sans text-primary-text">
                  9 / 9
                </div>
                <div className="text-xs text-secondary-text mt-0.5">
                  Stations monitored
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Notification Channels */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-primary-text leading-tight">
                  Notification Channels
                </h4>
                <p className="text-xs text-secondary-text mt-0.5">
                  Where to send alerts
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary-text">Email</div>
                  <div className="text-[11px] text-secondary-text font-mono truncate">
                    ops@seasify.gov
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel('email')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    channels.email ? 'bg-[#68DD79]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      channels.email ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Slack */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary-text">Slack</div>
                  <div className="text-[11px] text-secondary-text font-mono truncate">
                    #coastal-alerts
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel('slack')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    channels.slack ? 'bg-[#68DD79]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      channels.slack ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary-text">SMS</div>
                  <div className="text-[11px] text-secondary-text font-mono truncate">
                    +1 (206) 555-0147
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel('sms')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    channels.sms ? 'bg-[#68DD79]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      channels.sms ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Microsoft Teams */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary-text">Microsoft Teams</div>
                  <div className="text-[11px] text-secondary-text font-mono truncate">
                    Seasify Ops
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel('teams')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    channels.teams ? 'bg-[#68DD79]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      channels.teams ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Quiet Hours */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary-text leading-tight">
                    Quiet Hours
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Pause non-critical notifications
                  </p>
                </div>
              </div>

              <button
                onClick={() => setQuietHours(!quietHours)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                  quietHours ? 'bg-[#68DD79]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                    quietHours ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 rounded-20 bg-surface-muted/60 border border-border text-xs mb-3">
              <span className="text-secondary-text">From</span>
              <span className="font-bold text-primary-text font-mono">22:00 ⌄</span>
              <span className="text-secondary-text">To</span>
              <span className="font-bold text-primary-text font-mono">07:00 ⌄</span>
              <span className="text-[11px] text-secondary-text font-mono">UTC-08:00</span>
            </div>

            <div className="text-[11px] text-secondary-text flex items-center gap-1.5">
              <span>ⓘ</span>
              <span>Critical alerts (e.g., sensor outage) are always sent.</span>
            </div>
          </div>

          {/* Card 4: Rule Health */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary-text leading-tight">
                    Rule Health
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Status of alerting configuration
                  </p>
                </div>
              </div>

              <span className="text-secondary-text font-bold">→</span>
            </div>

            <div className="p-3.5 rounded-20 bg-[#DCFADC] border border-[#A5F5A6] text-[#156024]">
              <div className="font-bold text-xs flex items-center gap-2">
                <span>✔</span>
                <span>All systems operational</span>
              </div>
              <div className="text-[11px] text-[#227C34] mt-0.5">
                5 rules active • Notifications configured • No issues
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsScreen;
