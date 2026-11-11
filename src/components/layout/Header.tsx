import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  RefreshCw,
  Clock,
  Radio,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useNavigationStore } from '@/stores/navigationStore';

export const Header: React.FC = () => {
  const { stations, selectedStation, selectStation } = useStationStore();
  const {
    dataSource,
    dataFreshness,
    selectedTimeRange,
    setTimeRange,
    loadStationData,
    isLoading,
  } = useTideDataStore();
  const { currentScreen, setCurrentScreen } = useNavigationStore();

  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStation = (id: string) => {
    selectStation(id);
    const station = stations.find((s) => s.id === id);
    if (station) {
      const hours = selectedTimeRange === '48h' ? 48 : selectedTimeRange === '30d' ? 720 : 24;
      loadStationData(station.id, station.name, hours);
    }
    setStationDropdownOpen(false);
  };

  const handleRefresh = () => {
    const hours = selectedTimeRange === '48h' ? 48 : selectedTimeRange === '30d' ? 720 : 24;
    loadStationData(selectedStation.id, selectedStation.name, hours, true);
  };

  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    const hours = range === '48h' ? 48 : range === '30d' ? 720 : 24;
    loadStationData(selectedStation.id, selectedStation.name, hours);
  };

  // Status color dot
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'elevated':
        return 'bg-lavender ring-lavender/40';
      case 'low_tide':
        return 'bg-warning ring-warning/40';
      case 'maintenance':
        return 'bg-gray-400 ring-gray-400/40';
      default:
        return 'bg-mint-strong ring-mint/40';
    }
  };

  return (
    <header className="h-16 px-6 bg-surface/95 backdrop-blur-md rounded-[28px] border border-border shadow-subtle flex items-center justify-between gap-4 mb-4 select-none">
      {/* Left: Station Selector Pill */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-surface-muted hover:bg-surface-muted/80 border border-border transition-all text-sm font-semibold text-primary-text group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ring-2 ${getStatusColor(
                selectedStation.status
              )}`}
            />
            <MapPin className="w-4 h-4 text-secondary-text group-hover:text-primary-text transition-colors" />
            <span className="font-bold">{selectedStation.name}</span>
            <span className="font-mono text-xs text-secondary-text font-normal">
              ({selectedStation.id})
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-secondary-text transition-transform duration-200 ${
              stationDropdownOpen ? 'rotate-180 text-primary-text' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {stationDropdownOpen && (
          <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface rounded-[24px] border border-border shadow-panel p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 text-xs font-bold text-secondary-text uppercase tracking-wider border-b border-border/60 mb-1">
              Select Coastal Station
            </div>
            {stations.map((st) => (
              <button
                key={st.id}
                onClick={() => handleSelectStation(st.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-20 text-left transition-all text-sm ${
                  selectedStation.id === st.id
                    ? 'bg-charcoal text-white font-semibold'
                    : 'hover:bg-surface-muted text-primary-text'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ring-2 ${getStatusColor(st.status)}`}
                  />
                  <div className="flex flex-col">
                    <span className="leading-snug">{st.name}</span>
                    <span
                      className={`text-[11px] font-mono leading-none ${
                        selectedStation.id === st.id
                          ? 'text-gray-300'
                          : 'text-secondary-text'
                      }`}
                    >
                      ID: {st.id} • {st.state}
                    </span>
                  </div>
                </div>
                {selectedStation.id === st.id ? (
                  <CheckCircle2 className="w-4 h-4 text-mint" />
                ) : (
                  <span className="text-[11px] font-mono font-medium text-secondary-text">
                    {st.waterLevel.toFixed(2)}m
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center: Date Range Selector Pill */}
      <div className="flex items-center bg-surface-muted p-1 rounded-full border border-border shadow-inner">
        {[
          { id: '24h', label: '24 Hours' },
          { id: '48h', label: '48 Hours' },
          { id: '30d', label: '30 Days' },
        ].map((range) => (
          <button
            key={range.id}
            onClick={() => handleRangeChange(range.id)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedTimeRange === range.id
                ? 'bg-charcoal text-white shadow-subtle'
                : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Right: Data Freshness, Live Status, Refresh Action */}
      <div className="flex items-center gap-3">
        {/* Source Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            dataSource === 'live_noaa'
              ? 'bg-mint/15 text-charcoal border-mint/40'
              : 'bg-lavender/25 text-charcoal border-lavender/40'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dataSource === 'live_noaa' ? 'bg-mint-strong' : 'bg-lavender-dark'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                dataSource === 'live_noaa' ? 'bg-mint-strong' : 'bg-lavender-dark'
              }`}
            />
          </span>
          <span>{dataSource === 'live_noaa' ? 'NOAA Live' : 'Bundled Fallback'}</span>
        </div>

        {/* Freshness Timestamp */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{dataFreshness}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh Station Data"
          className="w-9 h-9 rounded-full bg-surface-muted hover:bg-surface-card border border-border flex items-center justify-center text-primary-text transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-charcoal' : ''}`} />
        </button>

        {/* Automata Shortcut Quick Pill */}
        <button
          onClick={() => setCurrentScreen('automata_lab')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-white hover:bg-charcoal-card border border-charcoal-border text-xs font-semibold transition-transform active:scale-95 shadow-subtle"
        >
          <Sparkles className="w-3.5 h-3.5 text-mint" />
          <span>Lab</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
