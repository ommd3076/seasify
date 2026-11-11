import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Activity,
  TrendingUp,
  AlertTriangle,
  FileText,
  UploadCloud,
  Bell,
  Settings,
  Cpu,
} from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', name: 'Overview', path: '/overview', icon: LayoutDashboard },
  { id: 'stations', name: 'Stations', path: '/stations', icon: Radio },
  { id: 'monitoring', name: 'Monitoring', path: '/monitoring', icon: Activity },
  { id: 'patterns', name: 'Patterns', path: '/patterns', icon: TrendingUp },
  { id: 'events', name: 'Events', path: '/events', icon: AlertTriangle },
  { id: 'reports', name: 'Reports', path: '/reports', icon: FileText },
  { id: 'upload', name: 'Upload', path: '/upload', icon: UploadCloud },
  { id: 'alerts', name: 'Alerts', path: '/alerts', icon: Bell },
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
  { id: 'pattern-engine', name: 'Pattern Engine', path: '/pattern-engine', icon: Cpu },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      data-testid="sidebar"
      className="w-[260px] xl:w-[280px] h-full flex-shrink-0 rounded-[28px] bg-[#F7F9F6] border border-[#D9DEDA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col p-5 select-none"
    >
      {/* Brand & Logo Header */}
      <div className="flex items-center gap-3.5 px-2 py-1 mb-6">
        {/* Double-Wave Mark */}
        <div className="w-10 h-10 rounded-2xl bg-[#EAEFEC] flex items-center justify-center flex-shrink-0 border border-[#D9DEDA]">
          <svg
            className="w-6 h-6 text-[#68DD79]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          </svg>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[18px] tracking-tight text-[#171A18] leading-tight truncate">
              CoastalSight
            </span>
            <span className="text-[10px] font-semibold bg-[#A5F5A6] text-[#171A18] px-1.5 py-0.5 rounded-full">
              Seasify
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#737A75] leading-tight truncate">
            Tide & Water-Level Analysis
          </span>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              data-testid={`nav-${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-full text-[14px] transition-all duration-150 ${
                  isActive
                    ? 'bg-[#A5F5A6] text-[#171A18] font-semibold shadow-sm border border-[#68DD79]/30'
                    : 'text-[#737A75] hover:text-[#171A18] hover:bg-[#EAEFEC]/70 font-medium'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer System Status */}
      <div className="pt-4 border-t border-[#D9DEDA]/80 mt-auto px-2">
        <div className="flex items-center justify-between text-xs text-[#737A75]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#68DD79] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#68DD79]"></span>
            </span>
            <span className="font-medium text-[#171A18]">NOAA CO-OPS</span>
          </div>
          <span className="font-mono text-[11px] bg-[#EAEFEC] px-2 py-0.5 rounded-full border border-[#D9DEDA]">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
