import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useNavigationStore } from '@/stores/navigationStore';

export const OverviewScreen: React.FC = () => {
  const { stations, selectedStation, selectStation } = useStationStore();
  const { points, loadStationData } = useTideDataStore();
  const { setCurrentScreen, setSelectedEventId } = useNavigationStore();

  const [stationIndex, setStationIndex] = useState(0);

  useEffect(() => {
    if (points.length === 0) {
      loadStationData(selectedStation.id, selectedStation.name, 24);
    }
  }, [selectedStation.id]);

  const handlePrevStation = () => {
    const nextIdx = (stationIndex - 1 + stations.length) % stations.length;
    setStationIndex(nextIdx);
    selectStation(stations[nextIdx].id);
  };

  const handleNextStation = () => {
    const nextIdx = (stationIndex + 1) % stations.length;
    setStationIndex(nextIdx);
    selectStation(stations[nextIdx].id);
  };

  return (
    <div data-testid="screen-overview" className="space-y-6">
      {/* 2x2 Modular Grid Matching UI Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Left: Tide Activity Charcoal Card (6 cols) */}
        <div className="lg:col-span-6 bg-[#242424] text-white rounded-[28px] p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[320px]">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Tide Activity
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Updated 10 min ago
              </p>
            </div>

            {/* Dropdown Pill */}
            <div className="px-3.5 py-1.5 rounded-full bg-[#333333] border border-[#444444] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer">
              <span>Monthly</span>
              <span className="text-[10px] text-gray-400">⌄</span>
            </div>
          </div>

          {/* Lower Section: Active Stations Stat on Left, 3 Stacked Bars on Right */}
          <div className="flex items-end justify-between pt-6 mt-4">
            {/* Left Stat */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs text-[#9CA3AF] font-medium">
                  Active stations
                </span>
                <span className="w-4 h-4 rounded-full bg-[#A5F5A6] text-[#171A18] flex items-center justify-center text-[10px] font-bold">
                  ↗
                </span>
              </div>
              <div className="text-5xl font-black text-white font-sans tracking-tight">
                128
              </div>
            </div>

            {/* Right Stacked 3-Month Bars (Sep, Oct, Nov) */}
            <div className="flex items-end gap-3 sm:gap-4 pb-1">
              {/* Sep Bar */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">Sep</span>
                <div className="w-14 sm:w-16 h-28 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333]">
                  <div className="h-16 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </div>

              {/* Oct Bar (Taller) */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">Oct</span>
                <div className="w-14 sm:w-16 h-36 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333]">
                  <div className="h-24 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </div>

              {/* Nov Bar */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">Nov</span>
                <div className="w-14 sm:w-16 h-32 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333]">
                  <div className="h-20 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Recent Events Surface Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[320px]">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#242424] text-white flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-white"
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
                  Recent Events
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Latest tide and water-level anomalies
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('events')}
              className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-surface-muted transition-all flex items-center gap-1.5"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {/* 3 Event Rows */}
          <div className="space-y-3 pt-2">
            {/* Event 1 */}
            <div
              onClick={() => {
                setSelectedEventId('ev-harbor-point-surge');
                setCurrentScreen('events');
              }}
              className="flex items-center justify-between py-2.5 border-b border-border/70 cursor-pointer hover:bg-surface-muted/40 px-2 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center font-bold text-sm shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-text leading-tight">
                    Elevated water level
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    Harbor Point • 2 h ago
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-primary-text font-mono">
                +0.42 m
              </div>
            </div>

            {/* Event 2 */}
            <div
              onClick={() => {
                setSelectedEventId('ev-bayview-blowout');
                setCurrentScreen('events');
              }}
              className="flex items-center justify-between py-2.5 border-b border-border/70 cursor-pointer hover:bg-surface-muted/40 px-2 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center font-bold text-sm shrink-0">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-text leading-tight">
                    Lower-than-expected tide
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    Bayview Inlet • 5 h ago
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-primary-text font-mono">
                -0.36 m
              </div>
            </div>

            {/* Event 3 */}
            <div
              onClick={() => {
                setSelectedEventId('ev-east-jetty-rise');
                setCurrentScreen('events');
              }}
              className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-surface-muted/40 px-2 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center font-bold text-sm shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-text leading-tight">
                    Rapid water-level rise
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    East Jetty • 8 h ago
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-primary-text font-mono">
                +0.51 m
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Left: Current Water Level Surface Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-primary-text leading-tight">
                Current Water Level
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Live reading at {selectedStation.name}
              </p>
            </div>

            {/* Carousel Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStation}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-muted transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextStation}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-muted transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inner Mint Container with Semi-Circular Gauge */}
          <div className="bg-[#A5F5A6] rounded-[24px] p-6 relative flex flex-col justify-between min-h-[240px] shadow-xs">
            {/* Top-Left Wave Mark */}
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#242424] shadow-xs">
              <svg
                className="w-5 h-5 text-[#242424]"
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

            {/* Semi-Circular Arc Radial Gauge */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-64 h-32 flex items-end justify-center overflow-visible">
                <svg className="w-64 h-32 overflow-visible" viewBox="0 0 200 100">
                  <defs>
                    <pattern
                      id="gaugeHatch"
                      width="6"
                      height="6"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#227C34" strokeWidth="2" />
                    </pattern>
                  </defs>

                  {/* Right Arc: Diagonal Hatched Pattern */}
                  <path
                    d="M 100 15 A 85 85 0 0 1 185 100"
                    fill="none"
                    stroke="url(#gaugeHatch)"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />

                  {/* Left Arc: Solid Charcoal */}
                  <path
                    d="M 15 100 A 85 85 0 0 1 125 22"
                    fill="none"
                    stroke="#242424"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />

                  {/* Marker Dot: Lavender circle */}
                  <circle cx="125" cy="22" r="5" fill="#C5A8F8" stroke="#242424" strokeWidth="2" />
                </svg>

                {/* Gauge Centered Value */}
                <div className="absolute bottom-2 text-center">
                  <div className="text-4xl font-black text-[#242424] font-sans tracking-tight">
                    {selectedStation.waterLevel.toFixed(2)} m
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Left Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#171A18] shadow-xs">
                <span>
                  {selectedStation.delta24h >= 0 ? '+' : ''}
                  {selectedStation.delta24h.toFixed(2)} m
                </span>
                <span>↗</span>
              </div>
              <div className="text-[11px] font-semibold text-[#171A18]/70 mt-1 pl-1">
                vs. 6 h ago
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Pattern Forecast Surface Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
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
                Pattern Forecast
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Expected water-level events and tide pattern
              </p>
            </div>
          </div>

          {/* Content: Left Timeline & Right High/Low Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left Vertical Timeline (5 cols) */}
            <div className="sm:col-span-5 relative pl-5 space-y-4">
              {/* Vertical connecting line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

              {/* Node 1 */}
              <div className="relative">
                <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-primary-text bg-surface" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Today, 14:26
                </div>
                <div className="text-[11px] text-secondary-text">
                  High tide (≈ 2.31 m)
                </div>
              </div>

              {/* Node 2 */}
              <div className="relative">
                <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-primary-text bg-surface" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Today, 20:47
                </div>
                <div className="text-[11px] text-secondary-text">
                  Low tide (≈ 0.89 m)
                </div>
              </div>

              {/* Node 3 */}
              <div className="relative">
                <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-primary-text bg-surface" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Tomorrow, 03:15
                </div>
                <div className="text-[11px] text-secondary-text">
                  High tide (≈ 2.28 m)
                </div>
              </div>

              {/* Node 4 (Solid Dot) */}
              <div className="relative">
                <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#171A18]" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Tomorrow, 09:36
                </div>
                <div className="text-[11px] text-secondary-text">
                  Low tide (≈ 0.93 m)
                </div>
              </div>
            </div>

            {/* Right: High & Low Cards (7 cols) */}
            <div className="sm:col-span-7 flex flex-col gap-3">
              {/* Predicted High Tide (Mint card) */}
              <div className="bg-[#A5F5A6] rounded-[22px] p-4 text-[#171A18] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A18]/80">
                    Predicted high tide
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#171A18]" />
                </div>
                <div className="my-1">
                  <div className="text-2xl font-black font-sans tracking-tight text-[#171A18]">
                    2.31 m
                  </div>
                  <div className="text-[11px] font-semibold text-[#171A18]/70">
                    +0.18 m above mean
                  </div>
                </div>

                {/* Wave sparkline with lavender peak dot */}
                <div className="h-9 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 36" fill="none">
                    <path
                      d="M 0 28 C 30 32, 60 25, 90 8 C 110 0, 130 18, 160 22 L 160 36 L 0 36 Z"
                      fill="rgba(34, 124, 52, 0.2)"
                    />
                    <path
                      d="M 0 28 C 30 32, 60 25, 90 8 C 110 0, 130 18, 160 22"
                      stroke="#227C34"
                      strokeWidth="2"
                    />
                    <circle cx="95" cy="8" r="3.5" fill="#C5A8F8" stroke="#227C34" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Next Low Tide (Lavender card) */}
              <div className="bg-[#C5A8F8] rounded-[22px] p-4 text-[#171A18] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A18]/80">
                    Next low tide
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#171A18]" />
                </div>
                <div className="my-1">
                  <div className="text-2xl font-black font-sans tracking-tight text-[#171A18]">
                    0.89 m
                  </div>
                  <div className="text-[11px] font-semibold text-[#171A18]/70">
                    -0.21 m below mean
                  </div>
                </div>

                {/* Wave sparkline with green trough dot */}
                <div className="h-9 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 36" fill="none">
                    <path
                      d="M 0 12 C 30 8, 60 28, 90 30 C 120 32, 140 16, 160 14 L 160 36 L 0 36 Z"
                      fill="rgba(112, 60, 215, 0.2)"
                    />
                    <path
                      d="M 0 12 C 30 8, 60 28, 90 30 C 120 32, 140 16, 160 14"
                      stroke="#6B21A8"
                      strokeWidth="2"
                    />
                    <circle cx="90" cy="30" r="3.5" fill="#A5F5A6" stroke="#6B21A8" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
