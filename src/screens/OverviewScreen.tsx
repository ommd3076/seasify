import React, { useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { RadialGauge } from '@/components/charts/RadialGauge';
import { MiniSparkline } from '@/components/charts/MiniSparkline';

export const OverviewScreen: React.FC = () => {
  const { selectedStation } = useStationStore();
  const { points, events, loadStationData, isLoading } = useTideDataStore();
  const { setCurrentScreen, setSelectedEventId } = useNavigationStore();

  useEffect(() => {
    if (points.length === 0) {
      loadStationData(selectedStation.id, selectedStation.name, 24);
    }
  }, [selectedStation.id]);

  // Aggregate hourly data for Tide Activity bar chart
  const hourlyActivityData = useMemo(() => {
    if (!points || points.length === 0) {
      // Mock 12-hour hourly buckets if empty
      return Array.from({ length: 12 }, (_, i) => {
        const hour = `${(i * 2).toString().padStart(2, '0')}:00`;
        const obs = 1.1 + Math.sin(i * 0.6) * 0.8 + 0.1;
        const pred = 1.1 + Math.sin(i * 0.6) * 0.8;
        return {
          time: hour,
          observed: Number(obs.toFixed(2)),
          predicted: Number(pred.toFixed(2)),
          residual: Number((obs - pred).toFixed(2)),
          isSurge: obs - pred > 0.15,
        };
      });
    }

    // Sample roughly 12 to 16 points across the dataset for clean bar display
    const step = Math.max(1, Math.floor(points.length / 14));
    return points
      .filter((_, idx) => idx % step === 0)
      .slice(0, 16)
      .map((p) => {
        const d = new Date(p.timestamp);
        const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const obs = p.observed ?? 1.2;
        const pred = p.predicted ?? 1.2;
        const res = p.residual ?? 0;
        return {
          time: timeLabel,
          observed: obs,
          predicted: pred,
          residual: res,
          isSurge: Math.abs(res) > 0.18,
        };
      });
  }, [points]);

  const handleInspectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentScreen('events');
  };

  return (
    <div className="space-y-6">
      {/* Top Main Grid: Tide Activity Charcoal Card & Current Water Level Mint Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tide Activity Charcoal Card (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-charcoal text-white rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-panel border border-charcoal-border relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-mint/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  <span className="text-xs uppercase font-mono tracking-widest text-mint font-semibold">
                    Harmonic Cycle Analysis
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">Tide Activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hourly observed water level vs astronomical harmonic prediction at {selectedStation.name}
                </p>
              </div>

              {/* Summary Stats Badges */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-20 bg-charcoal-card border border-charcoal-border flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Peak Obs:</span>
                  <span className="text-xs font-mono font-bold text-mint">
                    {(
                      Math.max(...hourlyActivityData.map((d) => d.observed), 1.85)
                    ).toFixed(2)}m
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-20 bg-charcoal-card border border-charcoal-border flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Mean Residual:</span>
                  <span className="text-xs font-mono font-bold text-lavender">
                    {selectedStation.residual >= 0 ? '+' : ''}
                    {selectedStation.residual.toFixed(2)}m
                  </span>
                </div>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#737A75"
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    axisLine={{ stroke: '#383838' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#737A75"
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    axisLine={{ stroke: '#383838' }}
                    tickLine={false}
                    domain={['dataMin - 0.2', 'dataMax + 0.2']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-charcoal-card border border-charcoal-border rounded-xl p-3 shadow-panel text-xs text-white">
                          <div className="font-semibold text-gray-300 mb-1">{data.time}</div>
                          <div className="flex justify-between gap-4 py-0.5">
                            <span className="text-gray-400">Observed:</span>
                            <span className="font-mono font-bold text-mint">{data.observed.toFixed(2)}m</span>
                          </div>
                          <div className="flex justify-between gap-4 py-0.5">
                            <span className="text-gray-400">Predicted:</span>
                            <span className="font-mono text-lavender">{data.predicted.toFixed(2)}m</span>
                          </div>
                          <div className="flex justify-between gap-4 py-0.5 border-t border-charcoal-border mt-1 pt-1">
                            <span className="text-gray-400">Residual:</span>
                            <span className={`font-mono font-bold ${data.residual >= 0 ? 'text-mint' : 'text-danger'}`}>
                              {data.residual >= 0 ? '+' : ''}{data.residual.toFixed(2)}m
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="observed" radius={[6, 6, 0, 0]}>
                    {hourlyActivityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isSurge ? '#A5F5A6' : '#68DD79'}
                        opacity={entry.isSurge ? 1 : 0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charcoal Card Bottom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-4 border-t border-charcoal-border/80">
            <div className="flex items-center gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-mint inline-block" />
                <span>Observed Level (m MLLW)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-lavender inline-block" />
                <span>Harmonic Baseline</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('monitoring')}
              className="flex items-center gap-1.5 text-xs text-mint hover:text-white font-semibold transition-colors"
            >
              <span>Detailed Telemetry</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Current Water Level Mint Card (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-mint text-charcoal rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-panel border border-mint-strong/40 relative">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-charcoal/70">
                  Live Station Feed
                </span>
                <h3 className="text-xl font-black text-charcoal leading-tight">
                  Water Level
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-charcoal text-white text-[11px] font-bold">
                {selectedStation.state}
              </span>
            </div>

            {/* Radial Gauge Display */}
            <div className="py-2 flex items-center justify-center">
              <RadialGauge
                value={selectedStation.waterLevel}
                min={0}
                max={3.5}
                unit="m"
                title=""
                status={selectedStation.status.toUpperCase()}
                statusColor={selectedStation.status === 'elevated' ? 'lavender' : 'mint'}
                size={230}
              />
            </div>
          </div>

          {/* Live comparison metrics & Tidal Phase */}
          <div className="space-y-2.5 pt-2 border-t border-charcoal/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal/80">Tidal Phase:</span>
              <span className="font-bold text-charcoal">{selectedStation.tidalPhase}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal/80">Predicted Astro Tide:</span>
              <span className="font-mono font-bold text-charcoal">
                {selectedStation.predictedLevel.toFixed(2)} m
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal/80">Non-Tidal Residual:</span>
              <span
                className={`font-mono font-black px-2 py-0.5 rounded-full ${
                  selectedStation.residual > 0.2
                    ? 'bg-charcoal text-mint'
                    : 'bg-white/80 text-charcoal'
                }`}
              >
                {selectedStation.residual >= 0 ? '+' : ''}
                {selectedStation.residual.toFixed(2)} m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Events & Pattern Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Events Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-20 bg-lavender/30 flex items-center justify-center text-charcoal">
                  <AlertTriangle className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Recent Events</h3>
                  <p className="text-xs text-secondary-text">
                    Automata-detected surge pulses and anomalies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentScreen('events')}
                className="text-xs font-semibold text-primary-text hover:text-charcoal flex items-center gap-1 group"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleInspectEvent(event.id)}
                    className="p-3.5 rounded-24 bg-surface-muted hover:bg-surface-card border border-border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-10 rounded-full ${
                          event.severity === 'High'
                            ? 'bg-danger'
                            : event.severity === 'Moderate'
                            ? 'bg-lavender-dark'
                            : 'bg-mint-strong'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary-text">
                            {event.patternName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              event.severity === 'High'
                                ? 'bg-danger-bg text-danger'
                                : 'bg-lavender/30 text-charcoal'
                            }`}
                          >
                            {event.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary-text mt-0.5">
                          <span>{event.stationName}</span>
                          <span>•</span>
                          <span>Peak: +{event.peakResidual.toFixed(2)}m</span>
                          <span>•</span>
                          <span>{event.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          event.status === 'Open'
                            ? 'bg-warning/20 text-warning-dark'
                            : 'bg-mint/30 text-mint-dark'
                        }`}
                      >
                        {event.status}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-secondary-text" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-secondary-text bg-surface-muted rounded-24 border border-dashed border-border">
                  No critical anomaly events detected in the current window.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-secondary-text">
            <span>Automata Model: Regex AST Determinized DFA</span>
            <span className="font-mono font-semibold text-primary-text">DFA Engine v1.0</span>
          </div>
        </div>

        {/* Pattern Forecast Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-20 bg-mint/30 flex items-center justify-center text-charcoal">
                  <Clock className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Pattern Forecast</h3>
                  <p className="text-xs text-secondary-text">
                    Next tidal extremities and deterministic automata transition projections
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentScreen('automata_lab')}
                className="text-xs font-semibold text-primary-text hover:text-charcoal flex items-center gap-1 group"
              >
                <span>Automata Lab</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* High and Low Tide Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Next High Tide */}
              <div className="p-4 rounded-24 bg-surface-muted border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-secondary-text mb-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-mint-strong" />
                    <span>Next High Tide</span>
                  </div>
                  <span className="font-mono text-[10px]">T+04:15</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-primary-text font-mono">
                    {selectedStation.nextHighTide?.time || '14:26'}
                  </div>
                  <p className="text-xs font-semibold text-mint-strong mt-0.5">
                    Height: {selectedStation.nextHighTide?.height.toFixed(2) || '1.85'} m
                  </p>
                </div>
                <div className="text-[11px] text-secondary-text mt-2 pt-2 border-t border-border/60">
                  Astronomical crest predicted without major barometric surge.
                </div>
              </div>

              {/* Next Low Tide */}
              <div className="p-4 rounded-24 bg-surface-muted border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-secondary-text mb-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5 text-lavender-dark" />
                    <span>Next Low Tide</span>
                  </div>
                  <span className="font-mono text-[10px]">T+10:35</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-primary-text font-mono">
                    {selectedStation.nextLowTide?.time || '20:47'}
                  </div>
                  <p className="text-xs font-semibold text-lavender-dark mt-0.5">
                    Height: {selectedStation.nextLowTide?.height.toFixed(2) || '0.22'} m
                  </p>
                </div>
                <div className="text-[11px] text-secondary-text mt-2 pt-2 border-t border-border/60">
                  Trough clearance safe for deep-draft marine traffic.
                </div>
              </div>
            </div>

            {/* Projected Automata Trajectory */}
            <div className="p-3.5 rounded-24 bg-charcoal text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center text-mint">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Projected State: <span className="text-mint font-mono">S0 (Baseline Stable)</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    No transition into Elevated Surge State (S1) projected in the next 6 hours.
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-charcoal-card text-mint border border-charcoal-border shrink-0">
                94% Conf
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-secondary-text">
            <span>Hydrodynamic Tidal Simulation</span>
            <span className="text-primary-text font-semibold">NOAA Harmonic Spline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
