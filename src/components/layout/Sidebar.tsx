import React from 'react';
import {
  Waves,
  LayoutDashboard,
  Compass,
  Activity,
  Layers,
  AlertTriangle,
  FileBarChart2,
  UploadCloud,
  Bell,
  Settings,
  Workflow,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { useNavigationStore, ScreenId } from '@/stores/navigationStore';
import { useAlertStore } from '@/stores/alertStore';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useNavigationStore();
  const { triggeredAlerts } = useAlertStore();

  const activeAlertCount = triggeredAlerts.filter((a) => a.status === 'Active').length;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'stations', label: 'Stations', icon: Compass },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'patterns', label: 'Patterns', icon: Layers },
    { id: 'events', label: 'Events', icon: AlertTriangle, badge: '3' },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 },
    { id: 'upload', label: 'Upload Data', icon: UploadCloud },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'automata_lab', label: 'Automata Lab', icon: Workflow, badge: 'DFA' },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-2rem)] my-4 ml-4 flex flex-col justify-between bg-surface rounded-[28px] border border-border shadow-panel p-4 select-none shrink-0 z-30">
      {/* Brand Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-11 h-11 rounded-20 bg-charcoal flex items-center justify-center shadow-subtle relative overflow-hidden group">
            <div className="absolute inset-0 bg-mint opacity-20 group-hover:opacity-30 transition-opacity" />
            <Waves className="w-6 h-6 text-mint animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-primary-text">Seasify</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-mint/30 text-charcoal">
                DFA v1
              </span>
            </div>
            <p className="text-[11px] text-secondary-text font-medium leading-none mt-0.5">
              Coastal Tide Automata
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            const isLab = item.id === 'automata_lab';

            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[20px] transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-charcoal text-white shadow-subtle'
                    : isLab
                    ? 'hover:bg-lavender/20 text-charcoal/90 hover:text-charcoal'
                    : 'text-secondary-text hover:text-primary-text hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? isLab
                          ? 'bg-lavender text-charcoal'
                          : 'bg-mint/20 text-mint'
                        : isLab
                        ? 'bg-lavender/40 text-charcoal'
                        : 'text-secondary-text'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? isLab
                          ? 'bg-lavender text-charcoal'
                          : 'bg-mint text-charcoal'
                        : isLab
                        ? 'bg-lavender/40 text-charcoal'
                        : item.id === 'alerts' && activeAlertCount > 0
                        ? 'bg-danger text-white'
                        : 'bg-surface-muted text-secondary-text'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Profile */}
      <div className="pt-3 border-t border-border flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-20 bg-surface-muted text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-strong opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-strong" />
            </span>
            <span className="text-[11px] font-medium text-secondary-text">Engine: Active (DFA)</span>
          </div>
          <span className="text-[10px] font-mono text-secondary-text font-semibold">94% CONF</span>
        </div>

        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center text-charcoal font-bold text-xs shadow-sm">
              EV
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-primary-text leading-tight">
                Dr. E. Vance
              </span>
              <span className="text-[10px] text-secondary-text leading-tight">Chief Oceanographer</span>
            </div>
          </div>
          <Radio className="w-3.5 h-3.5 text-mint-strong" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
