import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Sliders,
  Mail,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  Clock,
  Check,
} from 'lucide-react';
import { useAlertStore } from '@/stores/alertStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const AlertsScreen: React.FC = () => {
  const {
    rules,
    triggeredAlerts,
    notificationChannels,
    toggleRule,
    resolveAlert,
    toggleChannel,
    toggleQuietHours,
  } = useAlertStore();

  const [activeSeverityFilter, setActiveSeverityFilter] = useState<string>('all');

  const activeAlerts = triggeredAlerts.filter((a) => a.status === 'Active');
  const resolvedAlerts = triggeredAlerts.filter((a) => a.status === 'Resolved');

  const filteredRules =
    activeSeverityFilter === 'all'
      ? rules
      : rules.filter((r) => r.severity.toLowerCase() === activeSeverityFilter.toLowerCase());

  return (
    <div data-testid="screen-alerts" className="space-y-6">
      {/* Top Split: Alert Summary Charcoal Card & Channels Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alert Summary Charcoal Card (8 cols) */}
        <div className="lg:col-span-8 bg-charcoal text-white rounded-panel p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#333333] border border-[#444444] flex items-center justify-center text-mint">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Active Alerts & Hazard Rules</h2>
                  <p className="text-xs text-gray-400">
                    Real-time coastal water-level anomaly triggers and automated notification pipelines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-mint/20 text-mint border border-mint/30 text-xs font-bold">
                  {activeAlerts.length} Active Triggers
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 my-4">
              <div className="p-4 rounded-card bg-[#1E1E1E] border border-[#333333]">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Active Triggers
                </span>
                <div className="text-2xl font-black text-mint mt-1">{activeAlerts.length}</div>
                <span className="text-[10px] text-gray-400">Immediate coastal risk</span>
              </div>

              <div className="p-4 rounded-card bg-[#1E1E1E] border border-[#333333]">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Configured Rules
                </span>
                <div className="text-2xl font-black text-white mt-1">{rules.length}</div>
                <span className="text-[10px] text-gray-400">Formal threshold monitors</span>
              </div>

              <div className="p-4 rounded-card bg-[#1E1E1E] border border-[#333333]">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Resolved (24h)
                </span>
                <div className="text-2xl font-black text-lavender mt-1">{resolvedAlerts.length}</div>
                <span className="text-[10px] text-gray-400">Water levels stabilized</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#383838] flex items-center justify-between text-xs text-gray-400">
            <span>Automata Audit Pipeline: Continuous 6-minute polling</span>
            <span className="text-mint font-mono font-semibold">100% System Health</span>
          </div>
        </div>

        {/* Right: Notification Channels (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-panel border border-border shadow-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-primary-text">Dispatch Channels</h3>
              <Badge variant="normal" size="sm">Active</Badge>
            </div>
            <p className="text-xs text-secondary-text mb-4">
              Configure delivery endpoints for automated incident paging
            </p>

            <div className="space-y-3">
              {[
                { key: 'email' as const, label: 'Email Broadcast', icon: Mail, value: notificationChannels.email },
                { key: 'slack' as const, label: 'Slack Webhook', icon: MessageSquare, value: notificationChannels.slack },
                { key: 'sms' as const, label: 'Emergency SMS', icon: Smartphone, value: notificationChannels.sms },
                { key: 'webhook' as const, label: 'Webhook (REST)', icon: ShieldAlert, value: notificationChannels.webhook },
              ].map((channel) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.key}
                    onClick={() => toggleChannel(channel.key)}
                    className="flex items-center justify-between p-3 rounded-card bg-surface-muted hover:bg-[#E2E8E3] transition border border-border cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-secondary-text" />
                      <span className="text-xs font-semibold text-primary-text">{channel.label}</span>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                        channel.value ? 'bg-mint-strong' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          channel.value ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-secondary-text">
              <Clock className="w-3.5 h-3.5" />
              <span>Quiet Hours (22:00-06:00)</span>
            </div>
            <button
              onClick={toggleQuietHours}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition ${
                notificationChannels.quietHoursEnabled
                  ? 'bg-mint text-charcoal border-mint-strong'
                  : 'bg-surface-muted text-secondary-text border-border'
              }`}
            >
              {notificationChannels.quietHoursEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Rules Manager */}
      <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-primary-text">Automated Detection Rules</h3>
            <p className="text-xs text-secondary-text">
              Formal thresholds mapped to coastal water level and surge velocity telemetry
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-full border border-border">
            {['all', 'high', 'medium'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveSeverityFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition ${
                  activeSeverityFilter === filter
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-panel bg-surface-muted/50 border border-border flex flex-col justify-between hover:border-mint-strong/40 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        rule.severity === 'High' ? 'bg-[#F87171]' : 'bg-[#FBBF24]'
                      }`}
                    />
                    <h4 className="text-sm font-bold text-primary-text">{rule.name}</h4>
                  </div>
                  <Badge variant={rule.severity === 'High' ? 'high' : 'moderate'} size="sm">
                    {rule.severity}
                  </Badge>
                </div>
                <p className="text-xs text-secondary-text mb-3">{rule.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono">
                  <span className="text-secondary-text">Condition:</span>
                  <span className="font-bold text-primary-text">
                    {rule.condition.replace('threshold', `${rule.thresholdValue}${rule.thresholdUnit}`)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-secondary-text">
                  Scope: <strong className="text-primary-text uppercase">{rule.stationScope}</strong>
                </span>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                    rule.enabled
                      ? 'bg-mint text-charcoal border border-mint-strong font-bold'
                      : 'bg-surface text-secondary-text border border-border'
                  }`}
                >
                  {rule.enabled ? 'Rule Active' : 'Muted'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Triggered Alert Activity Log */}
      <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-secondary-text" />
            <h3 className="text-base font-bold text-primary-text">Recent Alert Activity Log</h3>
          </div>
          <span className="text-xs text-secondary-text font-mono">Real-time incident trail</span>
        </div>

        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-secondary-text text-xs uppercase font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Station & Incident</th>
                <th className="py-2.5 px-4">Trigger Time (UTC)</th>
                <th className="py-2.5 px-4">Peak Recorded</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {triggeredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-surface-muted/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-primary-text">{alert.stationName}</div>
                    <div className="text-[11px] text-secondary-text">{alert.ruleName}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-secondary-text">{alert.timestamp}</td>
                  <td className="py-3 px-4 font-mono font-bold text-lavender-dark">
                    +{alert.delta.toFixed(2)}m
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={alert.status === 'Active' ? 'high' : 'resolved'} size="sm">
                      {alert.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {alert.status === 'Active' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Resolve
                      </Button>
                    ) : (
                      <span className="text-secondary-text font-medium text-[11px]">Acknowledged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsScreen;
