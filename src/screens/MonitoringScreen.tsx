import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Wind,
  CloudRain,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';

export const MonitoringScreen: React.FC = () => {
  const { stations, selectedStation, selectStation } = useStationStore();
  const { points, loadStationData } = useTideDataStore();

  useEffect(() => {
    if (points.length === 0) {
      loadStationData(selectedStation.id, selectedStation.name, 24);
    }
  }, [selectedStation.id]);

  // Format 24-hour chart points
  const chartData = useMemo(() => {
    if (!points || points.length === 0) {
      return Array.from({ length: 24 }, (_, i) => {
        const hour = `${i.toString().padStart(2, '0')}:00`;
        const pred = 1.6 + Math.sin((i / 24) * Math.PI * 4) * 0.8;
        const obs = pred + (i > 16 && i < 22 ? 0.08 : (Math.random() * 0.04 - 0.02));
        return {
          time: hour,
          observed: Number(obs.toFixed(2)),
          predicted: Number(pred.toFixed(2)),
          residual: Number((obs - pred).toFixed(2)),
        };
      });
    }

    const step = Math.max(1, Math.floor(points.length / 24));
    return points
      .filter((_, idx) => idx % step === 0)
      .slice(0, 24)
      .map((p) => {
        const d = new Date(p.timestamp);
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const obs = p.observed ?? 1.38;
        const pred = p.predicted ?? 1.30;
        return {
          time,
          observed: Number(obs.toFixed(2)),
          predicted: Number(pred.toFixed(2)),
          residual: Number((obs - pred).toFixed(2)),
        };
      });
  }, [points]);

  const latestPoint = chartData[chartData.length - 1] || {
    observed: 1.38,
    predicted: 1.30,
    residual: 0.08,
  };

  return (
    <div data-testid="screen-monitoring" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Main Telemetry Chart & 2x2 Lower Cards (8 cols / ~72%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Large Card: Water Level: Observed vs Predicted */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            {/* Chart Header & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-[#227C34]"
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
                <div>
                  <h3 className="text-xl font-bold text-primary-text leading-tight">
                    Water Level: Observed vs Predicted
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Live water level over the last 24 hours at {selectedStation.name}
                  </p>
                </div>
              </div>

              {/* Legend matching UI reference */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79]" />
                  <span className="text-primary-text">Observed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C5A8F8]" />
                  <span className="text-secondary-text">Predicted</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Wave Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEC" vertical={true} />
                  <XAxis
                    dataKey="time"
                    stroke="#737A75"
                    tick={{ fill: '#737A75', fontSize: 11 }}
                    axisLine={{ stroke: '#D9DEDA' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 3.0]}
                    ticks={[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                    stroke="#737A75"
                    tick={{ fill: '#737A75', fontSize: 11 }}
                    axisLine={{ stroke: '#D9DEDA' }}
                    tickLine={false}
                    unit="m"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-panel text-xs">
                          <div className="font-bold text-primary-text mb-1.5">{d.time}</div>
                          <div className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5 text-secondary-text">
                              <span className="w-2 h-2 rounded-full bg-[#68DD79]" />
                              Observed:
                            </span>
                            <span className="font-mono font-bold text-primary-text">{d.observed.toFixed(2)} m</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5 text-secondary-text">
                              <span className="w-2 h-2 rounded-full bg-[#C5A8F8]" />
                              Predicted:
                            </span>
                            <span className="font-mono font-bold text-primary-text">{d.predicted.toFixed(2)} m</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  {/* Predicted Harmonic Tide Line (Lavender) */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#C5A8F8"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#C5A8F8', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  {/* Observed Live Water Level Line (Mint) */}
                  <Line
                    type="monotone"
                    dataKey="observed"
                    stroke="#68DD79"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, fill: '#68DD79', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lower 2x2 Grid of 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1: Current Level (Charcoal Card) */}
            <div className="bg-[#242424] text-white rounded-[28px] p-6 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[190px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#333333] text-[#A5F5A6] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-[#A5F5A6]"
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
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">
                    Current Level
                  </h4>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Live reading at {selectedStation.name}
                  </p>
                </div>
              </div>

              <div>
                <div className="text-4xl font-black font-sans tracking-tight text-white mt-3">
                  {latestPoint.observed.toFixed(2)} m
                </div>

                {/* Glowing green area sparkline */}
                <div className="h-10 w-full mt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40" fill="none">
                    <path
                      d="M 0 35 C 40 38, 80 20, 120 22 C 160 25, 180 12, 195 14 L 195 40 L 0 40 Z"
                      fill="rgba(104, 221, 121, 0.25)"
                    />
                    <path
                      d="M 0 35 C 40 38, 80 20, 120 22 C 160 25, 180 12, 195 14"
                      stroke="#68DD79"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="195" cy="14" r="3.5" fill="#FFFFFF" stroke="#68DD79" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Deviation (Surface Card) */}
            <div className="bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between min-h-[190px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
                  <span className="font-bold text-base">⇅</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary-text leading-tight">
                    Deviation
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Observed - Predicted
                  </p>
                </div>
              </div>

              <div>
                <div className="text-4xl font-black font-sans tracking-tight text-primary-text mt-3">
                  {latestPoint.residual >= 0 ? '+' : ''}{latestPoint.residual.toFixed(2)} m
                </div>

                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFADC] text-[#156024]">
                    <span>↗</span>
                    <span>Above predicted</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Change Rate (Surface Card) */}
            <div className="bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between min-h-[190px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary-text leading-tight">
                    Change Rate
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Water level change
                  </p>
                </div>
              </div>

              <div>
                <div className="text-4xl font-black font-sans tracking-tight text-primary-text mt-3">
                  +0.24 m/h
                </div>

                {/* Ascending green wave sparkline with terminal circle */}
                <div className="h-10 w-full mt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40" fill="none">
                    <path
                      d="M 0 35 C 50 35, 100 28, 150 15 C 175 8, 190 6, 195 5 L 195 40 L 0 40 Z"
                      fill="rgba(104, 221, 121, 0.2)"
                    />
                    <path
                      d="M 0 35 C 50 35, 100 28, 150 15 C 175 8, 190 6, 195 5"
                      stroke="#359D45"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="195" cy="5" r="3.5" fill="#FFFFFF" stroke="#359D45" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 4: Tidal Phase (Surface Card with Circular Meter) */}
            <div className="bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between min-h-[190px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-[#784FD8]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M2 12c4-4 8-4 12 0s8 4 12 0" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary-text leading-tight">
                    Tidal Phase
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Current stage
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between mt-3">
                <div>
                  <div className="text-3xl font-black font-sans tracking-tight text-primary-text">
                    Rising Tide
                  </div>
                  <div className="text-xs font-semibold text-secondary-text mt-1">
                    Next high in 2 h 34 m
                  </div>
                </div>

                {/* Lavender Circular Liquid Level Meter */}
                <div className="w-16 h-16 rounded-full bg-[#EBE0FE] border-2 border-[#C5A8F8] flex items-end justify-center overflow-hidden shrink-0">
                  <div className="w-full h-9 bg-[#C5A8F8] rounded-t-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Station Selector, Sensor Status, Anomaly Flags (4 cols / ~28%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Station Card */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <h4 className="text-base font-bold text-primary-text mb-3">Station</h4>
            <div className="flex items-center justify-between p-3 rounded-20 bg-surface-muted border border-border cursor-pointer">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-secondary-text" />
                <span className="text-sm font-bold text-primary-text">
                  {selectedStation.name}
                </span>
              </div>
              <span className="text-xs text-secondary-text font-bold">⌄</span>
            </div>
          </div>

          {/* Sensor Status Card */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="mb-4">
              <h4 className="text-base font-bold text-primary-text leading-tight">
                Sensor Status
              </h4>
              <p className="text-xs text-secondary-text mt-0.5">
                Live data and health
              </p>
            </div>

            <div className="space-y-3">
              {/* Water Level */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/50 border border-border/60">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-secondary-text"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                    <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                  </svg>
                  <span className="text-xs font-bold text-primary-text">
                    Water Level
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFADC] text-[#156024]">
                  <span>✔</span>
                  <span>Online</span>
                </span>
              </div>

              {/* Wind */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/50 border border-border/60">
                <div className="flex items-center gap-3">
                  <Wind className="w-4 h-4 text-secondary-text" />
                  <span className="text-xs font-bold text-primary-text">Wind</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFADC] text-[#156024]">
                  <span>✔</span>
                  <span>Online</span>
                </span>
              </div>

              {/* Rainfall */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/50 border border-border/60">
                <div className="flex items-center gap-3">
                  <CloudRain className="w-4 h-4 text-secondary-text" />
                  <span className="text-xs font-bold text-primary-text">Rainfall</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFADC] text-[#156024]">
                  <span>✔</span>
                  <span>Online</span>
                </span>
              </div>
            </div>
          </div>

          {/* Anomaly Flags Card */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="mb-4">
              <h4 className="text-base font-bold text-primary-text leading-tight">
                Anomaly Flags
              </h4>
              <p className="text-xs text-secondary-text mt-0.5">
                Automatically detected conditions
              </p>
            </div>

            <div className="space-y-3">
              {/* Flag 1: Higher than expected */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between cursor-pointer hover:bg-surface transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center font-bold text-sm shrink-0">
                    !
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text leading-tight">
                      Higher-than-expected level
                    </div>
                    <div className="text-[11px] text-secondary-text mt-0.5">
                      +{latestPoint.residual >= 0 ? latestPoint.residual.toFixed(2) : '0.08'} m ({(latestPoint.residual * 100).toFixed(0)} cm) above predicted
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-text shrink-0" />
              </div>

              {/* Flag 2: No rapid rise */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between cursor-pointer hover:bg-surface transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center font-bold text-sm shrink-0">
                    ✔
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text leading-tight">
                      No rapid rise
                    </div>
                    <div className="text-[11px] text-secondary-text mt-0.5">
                      Change rate within normal range
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-text shrink-0" />
              </div>

              {/* Flag 3: No data issues */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between cursor-pointer hover:bg-surface transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center font-bold text-sm shrink-0">
                    ✔
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text leading-tight">
                      No data issues
                    </div>
                    <div className="text-[11px] text-secondary-text mt-0.5">
                      All sensors reporting
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-text shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringScreen;
