import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export interface RouteMeta {
  title: string;
  subtitle: string;
}

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  '/': {
    title: 'Overview',
    subtitle: 'Coastal tide and water-level patterns across your monitoring network',
  },
  '/overview': {
    title: 'Overview',
    subtitle: 'Coastal tide and water-level patterns across your monitoring network',
  },
  '/stations': {
    title: 'Stations',
    subtitle: 'Explore and manage coastal monitoring stations',
  },
  '/monitoring': {
    title: 'Monitoring',
    subtitle: 'Live coastal water levels and real-time conditions',
  },
  '/patterns': {
    title: 'Patterns',
    subtitle: 'Recurring water-level sequences and event archetypes across your monitoring network',
  },
  '/events': {
    title: 'Events',
    subtitle: 'Detected water-level anomalies across your monitoring network',
  },
  '/reports': {
    title: 'Reports',
    subtitle: 'Analytics, summaries, and exported insights from your monitoring network',
  },
  '/upload': {
    title: 'Upload',
    subtitle: 'Ingest observation files or import historical tide data into your monitoring network',
  },
  '/alerts': {
    title: 'Alerts',
    subtitle: 'Configure alert rules, delivery, and review recent activity',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Manage your organization, data, stations, users, and system preferences',
  },
  '/pattern-engine': {
    title: 'Pattern Engine',
    subtitle: 'Automata-based sequence analysis of tide events and water-level patterns',
  },
  '/automata-lab': {
    title: 'Pattern Engine',
    subtitle: 'Automata-based sequence analysis of tide events and water-level patterns',
  },
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const handleStationChange = (id: string) => {
    setSelectedStation(id);
    if (id !== 'all') {
      const { selectStation, stations } = useStationStore.getState();
      selectStation(id);
      const st = stations.find((s) => s.id === id);
      if (st) {
        useTideDataStore.getState().loadStationData(st.id, st.name, selectedRange === '24h' ? 24 : 720);
      }
    }
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    useTideDataStore.getState().setTimeRange(range);
    const { selectedStation: curr } = useStationStore.getState();
    if (curr?.id) {
      const hours = range === '24h' ? 24 : range === '7d' ? 168 : 720;
      useTideDataStore.getState().loadStationData(curr.id, curr.name, hours);
    }
  };

  const meta = ROUTE_METADATA[location.pathname] || {
    title: 'Seasify',
    subtitle: 'Coastal Tide & Water-Level Analysis',
  };

  return (
    <div
      data-testid="app-shell"
      className="flex h-screen w-screen overflow-hidden bg-[#DBE2DB] p-4 sm:p-5 gap-5 font-sans text-[#171A18] antialiased select-none"
    >
      {/* Floating Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          selectedStation={selectedStation}
          onStationChange={setSelectedStation}
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          isStationsScreen={location.pathname === '/stations'}
        />

        {/* Scrollable Viewport */}
        <main
          data-testid="main-content"
          className="flex-1 overflow-y-auto pr-1 pb-4 focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
