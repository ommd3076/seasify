import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

import OverviewScreen from './screens/OverviewScreen';
import StationsScreen from './screens/StationsScreen';
import MonitoringScreen from './screens/MonitoringScreen';
import PatternsScreen from './screens/PatternsScreen';
import EventsScreen from './screens/EventsScreen';
import ReportsScreen from './screens/ReportsScreen';
import UploadScreen from './screens/UploadScreen';
import AlertsScreen from './screens/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AutomataLabScreen from './screens/AutomataLabScreen';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Default redirect to /overview */}
          <Route path="/" element={<Navigate to="/overview" replace />} />

          {/* 10 Application Screens */}
          <Route path="/overview" element={<OverviewScreen />} />
          <Route path="/stations" element={<StationsScreen />} />
          <Route path="/monitoring" element={<MonitoringScreen />} />
          <Route path="/patterns" element={<PatternsScreen />} />
          <Route path="/events" element={<EventsScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/pattern-engine" element={<AutomataLabScreen />} />

          {/* Compatibility Alias */}
          <Route path="/automata-lab" element={<Navigate to="/pattern-engine" replace />} />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
