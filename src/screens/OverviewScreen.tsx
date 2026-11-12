import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatWaterLevel, formatDelta } from '@/utils/formatUnit';

export const OverviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const unitSetting = settings.waterLevelUnit;
  const { stations, selectedStation, selectStation } = useStationStore();
  const { points, loadStationData } = useTideDataStore();
  const { setSelectedEventId } = useNavigationStore();

  const [stationIndex, setStationIndex] = useState(0);

  // Month & Timeframe interactive state
  const [activeTimeframe, setActiveTimeframe] = useState<string>('Monthly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<'Sep' | 'Oct' | 'Nov'>('Nov');
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Station counts and metrics per month
  const monthData: Record<string, { stations: number; peak: string; avgSurge: string; label: string }> = {
    Nov: { stations: 128, peak: '2.85 m', avgSurge: '+0.42 m', label: 'November 2024' },
    Oct: { stations: 134, peak: '2.73 m', avgSurge: '+0.38 m', label: 'October 2024' },
    Sep: { stations: 119, peak: '2.61 m', avgSurge: '+0.31 m', label: 'September 2024' },
    Aug: { stations: 112, peak: '2.45 m', avgSurge: '+0.22 m', label: 'August 2024' },
    Weekly: { stations: 128, peak: '2.85 m', avgSurge: '+0.42 m', label: 'Weekly View' },
    Daily: { stations: 128, peak: '2.85 m', avgSurge: '+0.42 m', label: 'Daily View' },
  };

  const currentStats = monthData[selectedMonth] || monthData.Nov;

  useEffect(() => {
    if (points.length === 0) {
      loadStationData(selectedStation.id, selectedStation.name, 24);
    }
  }, [selectedStation.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize carousel index if selectedStation changes elsewhere
  useEffect(() => {
    const idx = stations.findIndex((s) => s.id === selectedStation.id);
    if (idx !== -1 && idx !== stationIndex) {
      setStationIndex(idx);
    }
  }, [selectedStation.id, stations]);

  // Compute dynamic gauge scale, fill ratio, and dot coordinates for the selected station
  const currentWaterLevel = selectedStation.waterLevel;
  // Typical coastal water-level scale 0m to 3.5m, scaling up for extreme tidal ranges (e.g. Eastport 7.2m)
  const effectiveMax = Math.max(3.5, Math.ceil(currentWaterLevel * 1.15));
  const rawRatio = currentWaterLevel / effectiveMax;
  // Keep clamped between 8% and 96% so the rounded cap is always visible and does not overshoot the track
  const gaugeRatio = Math.max(0.08, Math.min(0.96, rawRatio));

  // Semi-circular geometry: cx = 100, cy = 100, radius = 85
  // Total arc length: Math.PI * 85 ≈ 267.04
  const arcLength = 267.04;
  const strokeOffset = arcLength * (1 - gaugeRatio);

  // Marker dot angle: starts at Math.PI (180 deg) at ratio=0, sweeps clockwise to 0 at ratio=1
  const dotAngle = Math.PI * (1 - gaugeRatio);
  const dotX = 100 + 85 * Math.cos(dotAngle);
  const dotY = 100 - 85 * Math.sin(dotAngle);

  // Pattern forecast values derived from the active station
  const highTideHeight = selectedStation.nextHighTide?.height ?? Number((currentWaterLevel * 1.28).toFixed(2));
  const highTideTime = selectedStation.nextHighTide?.time ?? '14:26';
  const highDelta = Math.max(0.05, highTideHeight - currentWaterLevel);

  const lowTideHeight = selectedStation.nextLowTide?.height ?? Number((currentWaterLevel * 0.35).toFixed(2));
  const lowTideTime = selectedStation.nextLowTide?.time ?? '20:47';
  const lowDelta = Math.max(0.05, currentWaterLevel - lowTideHeight);

  // Project subsequent tides based on M2 semidiurnal periodicity (12.42h)
  const computeNextTidalTime = (timeStr: string, hoursToAdd: number): string => {
    const [h, m] = (timeStr || '12:00').split(':').map(Number);
    const totalMinutes = Math.round((h || 0) * 60 + (m || 0) + hoursToAdd * 60);
    const nextH = Math.floor(totalMinutes / 60) % 24;
    const nextM = totalMinutes % 60;
    return `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;
  };

  const handlePrevStation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (stationIndex - 1 + stations.length) % stations.length;
    setStationIndex(nextIdx);
    selectStation(stations[nextIdx].id);
    loadStationData(stations[nextIdx].id, stations[nextIdx].name, 24);
  };

  const handleNextStation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (stationIndex + 1) % stations.length;
    setStationIndex(nextIdx);
    selectStation(stations[nextIdx].id);
    loadStationData(stations[nextIdx].id, stations[nextIdx].name, 24);
  };

  const handleSelectMonthOption = (option: string) => {
    setActiveTimeframe(option);
    setIsDropdownOpen(false);
    if (option.includes('Oct')) setSelectedMonth('Oct');
    else if (option.includes('Sep')) setSelectedMonth('Sep');
    else if (option.includes('Aug')) setSelectedMonth('Sep');
    else setSelectedMonth('Nov');
  };

  return (
    <div data-testid="screen-overview" className="space-y-6">
      {/* 2x2 Modular Grid Matching UI Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Left: Tide Activity Charcoal Card (6 cols) */}
        <div className="lg:col-span-6 bg-[#242424] text-white rounded-[28px] p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[330px] relative">
          {/* Card Header with Interactive Month/Timeframe Dropdown */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Tide Activity
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Updated for {monthData[selectedMonth]?.label || 'November 2024'}
              </p>
            </div>

            {/* Interactive Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3.5 py-1.5 rounded-full bg-[#333333] hover:bg-[#444444] border border-[#444444] hover:border-gray-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs"
              >
                <span>{activeTimeframe}</span>
                <span className={`text-[10px] text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#2C2C2C] border border-[#444444] shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-[#3D3D3D]">
                    Timeframe & Month
                  </div>
                  {[
                    { key: 'Monthly', label: 'November 2024 (Current)', month: 'Nov' },
                    { key: 'October 2024', label: 'October 2024', month: 'Oct' },
                    { key: 'September 2024', label: 'September 2024', month: 'Sep' },
                    { key: 'Weekly', label: 'Weekly View', month: 'Nov' },
                    { key: 'Daily', label: 'Daily View', month: 'Nov' },
                  ].map((opt) => {
                    const isSelected = activeTimeframe === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectMonthOption(opt.key)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition cursor-pointer hover:bg-[#383838] ${
                          isSelected ? 'text-[#A5F5A6] font-bold' : 'text-gray-200'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#A5F5A6]" />}
                      </button>
                    );
                  })}
                </div>
              )}
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
              <div className="text-5xl font-black text-white font-sans tracking-tight transition-all duration-200">
                {currentStats.stations}
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-1.5 flex items-center gap-2">
                <span>Peak: <strong className="text-white font-mono">{currentStats.peak}</strong></span>
                <span>•</span>
                <span>Surge: <strong className="text-[#A5F5A6] font-mono">{currentStats.avgSurge}</strong></span>
              </div>
            </div>

            {/* Right Stacked 3-Month Bars (Sep, Oct, Nov) with Hover & Click Interactivity */}
            <div className="flex items-end gap-3 sm:gap-4 pb-1 relative">
              {/* Tooltip on bar hover */}
              {hoveredBar && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#171A18] border border-[#444444] px-3 py-1 rounded-xl text-[11px] text-white shadow-xl whitespace-nowrap pointer-events-none z-10 animate-in fade-in">
                  <span className="font-bold text-[#A5F5A6]">{hoveredBar}: </span>
                  <span>{monthData[hoveredBar]?.stations} stations • Peak {monthData[hoveredBar]?.peak}</span>
                </div>
              )}

              {/* Sep Bar */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth('Sep');
                  setActiveTimeframe('September 2024');
                }}
                onMouseEnter={() => setHoveredBar('Sep')}
                onMouseLeave={() => setHoveredBar(null)}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none`}
              >
                <span className={`text-[11px] font-semibold transition ${selectedMonth === 'Sep' ? 'text-[#A5F5A6] font-bold' : 'text-[#9CA3AF]'}`}>
                  Sep
                </span>
                <div className={`w-14 sm:w-16 h-28 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333] transition-all duration-200 ${
                  selectedMonth === 'Sep' ? 'ring-2 ring-[#A5F5A6] shadow-[0_0_15px_rgba(165,245,166,0.3)]' : 'group-hover:brightness-110'
                }`}>
                  <div className="h-16 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </button>

              {/* Oct Bar */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth('Oct');
                  setActiveTimeframe('October 2024');
                }}
                onMouseEnter={() => setHoveredBar('Oct')}
                onMouseLeave={() => setHoveredBar(null)}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none`}
              >
                <span className={`text-[11px] font-semibold transition ${selectedMonth === 'Oct' ? 'text-[#A5F5A6] font-bold' : 'text-[#9CA3AF]'}`}>
                  Oct
                </span>
                <div className={`w-14 sm:w-16 h-36 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333] transition-all duration-200 ${
                  selectedMonth === 'Oct' ? 'ring-2 ring-[#A5F5A6] shadow-[0_0_15px_rgba(165,245,166,0.3)]' : 'group-hover:brightness-110'
                }`}>
                  <div className="h-24 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </button>

              {/* Nov Bar */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth('Nov');
                  setActiveTimeframe('Monthly');
                }}
                onMouseEnter={() => setHoveredBar('Nov')}
                onMouseLeave={() => setHoveredBar(null)}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none`}
              >
                <span className={`text-[11px] font-semibold transition ${selectedMonth === 'Nov' ? 'text-[#A5F5A6] font-bold' : 'text-[#9CA3AF]'}`}>
                  Nov
                </span>
                <div className={`w-14 sm:w-16 h-32 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333] transition-all duration-200 ${
                  selectedMonth === 'Nov' ? 'ring-2 ring-[#A5F5A6] shadow-[0_0_15px_rgba(165,245,166,0.3)]' : 'group-hover:brightness-110'
                }`}>
                  <div className="h-20 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Top-Right: Recent Events Surface Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[330px]">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#242424] text-white flex items-center justify-center shrink-0 shadow-xs">
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
              onClick={() => navigate('/events')}
              className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-[#EAEFEC] hover:border-charcoal/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {/* 3 Event Rows with Interactive Hover & Navigation */}
          <div className="space-y-3 pt-2">
            {/* Event 1 */}
            <div
              onClick={() => {
                setSelectedEventId('ev-harbor-point-surge');
                navigate('/events');
              }}
              className="flex items-center justify-between py-2.5 border-b border-border/70 cursor-pointer hover:bg-[#EAEFEC]/80 hover:translate-x-1.5 px-2.5 rounded-xl transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-text leading-tight group-hover:text-charcoal">
                    Elevated water level
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    Harbor Point • 2 h ago
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-primary-text font-mono group-hover:text-[#227C34] transition-colors">
                +0.42 m
              </div>
            </div>

            {/* Event 2 */}
            <div
              onClick={() => {
                setSelectedEventId('ev-bayview-blowout');
                navigate('/events');
              }}
              className="flex items-center justify-between py-2.5 border-b border-border/70 cursor-pointer hover:bg-[#EAEFEC]/80 hover:translate-x-1.5 px-2.5 rounded-xl transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-text leading-tight group-hover:text-charcoal">
                    Lower-than-expected tide
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    Bayview Inlet • 5 h ago
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-primary-text font-mono group-hover:text-[#784FD8] transition-colors">
                -0.36 m
              </div>
            </div>

            {/* Event 3 */}
            <div
              onClick={() => {
                setSelectedEventId('ev-east-jetty-rise');
                navigate('/events');
              }}
              className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-[#EAEFEC]/80 hover:translate-x-1.5 px-2.5 rounded-xl transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-text leading-tight group-hover:text-charcoal">
                    Rapid water-level rise
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    East Jetty • 8 h ago
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-primary-text font-mono group-hover:text-[#227C34] transition-colors">
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

            {/* Carousel Buttons with Hover Scale Effects */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStation}
                className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-[#EAEFEC] hover:border-charcoal/40 hover:scale-110 active:scale-90 transition-all cursor-pointer shadow-xs"
                title="Previous station"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextStation}
                className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-[#EAEFEC] hover:border-charcoal/40 hover:scale-110 active:scale-90 transition-all cursor-pointer shadow-xs"
                title="Next station"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inner Mint Container with Semi-Circular Gauge (Clickable to Telemetry) */}
          <div
            onClick={() => navigate('/monitoring')}
            className="bg-[#A5F5A6] hover:bg-[#9DEFA0] rounded-[24px] p-6 relative flex flex-col justify-between min-h-[240px] shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md group"
            title="Click to view detailed live telemetry"
          >
            {/* Top-Left Wave Mark */}
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#242424] shadow-xs group-hover:scale-105 transition-transform">
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

                  {/* Background Track Arc: Full Semi-Circle with Diagonal Green Hatched Pattern */}
                  <path
                    d="M 15 100 A 85 85 0 0 1 185 100"
                    fill="none"
                    stroke="url(#gaugeHatch)"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />

                  {/* Active Foreground Arc: Solid Charcoal dynamically filling from 15,100 based on water level */}
                  <path
                    d="M 15 100 A 85 85 0 0 1 185 100"
                    fill="none"
                    stroke="#242424"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    strokeDashoffset={strokeOffset}
                    style={{
                      transition: 'stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />

                  {/* Marker Dot: Lavender circle positioned dynamically at the tip of the charcoal arc */}
                  <g
                    style={{
                      transform: `translate(${dotX.toFixed(2)}px, ${dotY.toFixed(2)}px)`,
                      transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={5}
                      fill="#C5A8F8"
                      stroke="#242424"
                      strokeWidth={2}
                      className="transition-transform duration-200 group-hover:scale-125"
                    />
                  </g>
                </svg>

                {/* Gauge Centered Value */}
                <div className="absolute bottom-2 text-center pointer-events-none">
                  <div className="text-4xl font-black text-[#242424] font-sans tracking-tight">
                    {formatWaterLevel(selectedStation.waterLevel, unitSetting).withUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Left Pill with Hover Feedback */}
            <div className="pt-2 flex items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#171A18] shadow-xs">
                  <span>
                    {formatDelta(selectedStation.delta24h, unitSetting)}
                  </span>
                  <span>↗</span>
                </div>
                <div className="text-[11px] font-semibold text-[#171A18]/70 mt-1 pl-1">
                  vs. 6 h ago
                </div>
              </div>

              <span className="text-xs font-semibold text-[#171A18]/70 group-hover:text-[#171A18] flex items-center gap-1">
                <span>Detailed Telemetry</span>
                <span>→</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Pattern Forecast Surface Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0 shadow-xs">
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
              <div
                onClick={() => navigate('/monitoring')}
                className="relative cursor-pointer hover:bg-[#EAEFEC]/70 px-2 py-1 -mx-2 rounded-xl transition"
              >
                <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-primary-text bg-surface" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Today, {highTideTime}
                </div>
                <div className="text-[11px] text-secondary-text">
                  High tide (≈ {formatWaterLevel(highTideHeight, unitSetting).withUnit})
                </div>
              </div>

              {/* Node 2 */}
              <div
                onClick={() => navigate('/monitoring')}
                className="relative cursor-pointer hover:bg-[#EAEFEC]/70 px-2 py-1 -mx-2 rounded-xl transition"
              >
                <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-primary-text bg-surface" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Today, {lowTideTime}
                </div>
                <div className="text-[11px] text-secondary-text">
                  Low tide (≈ {formatWaterLevel(lowTideHeight, unitSetting).withUnit})
                </div>
              </div>

              {/* Node 3 */}
              <div
                onClick={() => navigate('/monitoring')}
                className="relative cursor-pointer hover:bg-[#EAEFEC]/70 px-2 py-1 -mx-2 rounded-xl transition"
              >
                <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-primary-text bg-surface" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Tomorrow, {computeNextTidalTime(highTideTime, 12.4)}
                </div>
                <div className="text-[11px] text-secondary-text">
                  High tide (≈ {formatWaterLevel(highTideHeight * 0.98, unitSetting).withUnit})
                </div>
              </div>

              {/* Node 4 (Solid Dot) */}
              <div
                onClick={() => navigate('/monitoring')}
                className="relative cursor-pointer hover:bg-[#EAEFEC]/70 px-2 py-1 -mx-2 rounded-xl transition"
              >
                <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full bg-[#171A18]" />
                <div className="text-xs font-bold text-primary-text leading-tight">
                  Tomorrow, {computeNextTidalTime(lowTideTime, 12.4)}
                </div>
                <div className="text-[11px] text-secondary-text">
                  Low tide (≈ {formatWaterLevel(lowTideHeight * 1.05, unitSetting).withUnit})
                </div>
              </div>
            </div>

            {/* Right: High & Low Cards (7 cols) with Hover Elevation */}
            <div className="sm:col-span-7 flex flex-col gap-3">
              {/* Predicted High Tide (Mint card) */}
              <div
                onClick={() => navigate('/monitoring')}
                className="bg-[#A5F5A6] hover:bg-[#9DEFA0] rounded-[22px] p-4 text-[#171A18] shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A18]/80 group-hover:text-[#171A18]">
                    Predicted high tide
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#171A18] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="my-1">
                  <div className="text-2xl font-black font-sans tracking-tight text-[#171A18]">
                    {formatWaterLevel(highTideHeight, unitSetting).withUnit}
                  </div>
                  <div className="text-[11px] font-semibold text-[#171A18]/70">
                    +{formatWaterLevel(highDelta, unitSetting).withUnit} above current
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
              <div
                onClick={() => navigate('/monitoring')}
                className="bg-[#C5A8F8] hover:bg-[#BC9FF2] rounded-[22px] p-4 text-[#171A18] shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A18]/80 group-hover:text-[#171A18]">
                    Next low tide
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#171A18] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="my-1">
                  <div className="text-2xl font-black font-sans tracking-tight text-[#171A18]">
                    {formatWaterLevel(lowTideHeight, unitSetting).withUnit}
                  </div>
                  <div className="text-[11px] font-semibold text-[#171A18]/70">
                    -{formatWaterLevel(lowDelta, unitSetting).withUnit} below current
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
