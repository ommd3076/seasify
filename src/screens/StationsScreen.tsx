import React, { useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { StationMap } from '@/components/map/StationMap';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { StationMetadata } from '@/types/noaa';

export const StationsScreen: React.FC = () => {
  const {
    stations,
    selectedStation,
    selectStation,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    regionFilter,
    setRegionFilter,
  } = useStationStore();

  const { points, loadStationData } = useTideDataStore();

  const handleSelectStation = (stationId: string) => {
    selectStation(stationId);
    const st = stations.find((s) => s.id === stationId);
    if (st) {
      loadStationData(st.id, st.name, 24);
    }
  };

  // Regions list
  const regions = useMemo(() => {
    const list = Array.from(new Set(stations.map((s) => s.region)));
    return ['All Regions', ...list];
  }, [stations]);

  // Filtered stations
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.includes(searchQuery) ||
        s.state.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All Statuses' ||
        (statusFilter === 'Normal' && s.status === 'normal') ||
        (statusFilter === 'Elevated' && s.status === 'elevated') ||
        (statusFilter === 'Low Tide' && s.status === 'low_tide') ||
        (statusFilter === 'Maintenance' && s.status === 'maintenance');

      const matchesRegion =
        regionFilter === 'All Regions' || s.region === regionFilter;

      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [stations, searchQuery, statusFilter, regionFilter]);

  // Sparkline data for selected station
  const sparklineData = useMemo(() => {
    if (points && points.length > 0) {
      return points
        .filter((_, i) => i % 4 === 0)
        .map((p) => p.observed ?? 1.2);
    }
    // Synthetic fallback curve based on station water level
    return Array.from({ length: 24 }, (_, i) => {
      return selectedStation.waterLevel + Math.sin(i * 0.5) * 0.4;
    });
  }, [points, selectedStation.waterLevel]);

  // Status badge helper
  const renderStatusBadge = (status: StationMetadata['status']) => {
    switch (status) {
      case 'elevated':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lavender/30 text-charcoal border border-lavender/50">
            Elevated
          </span>
        );
      case 'low_tide':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-warning/20 text-warning-dark border border-warning/40">
            Low Tide
          </span>
        );
      case 'maintenance':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-200 text-gray-600 border border-gray-300">
            Maint
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-mint/30 text-mint-dark border border-mint/50">
            Normal
          </span>
        );
    }
  };

  return (
    <div data-testid="screen-stations" className="space-y-6">
      {/* Top Split: Station Explorer List & Leaflet Coastal Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Station Explorer List (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-[28px] border border-border shadow-panel p-5 sm:p-6 flex flex-col h-[560px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-primary-text flex items-center gap-2">
                <Compass className="w-5 h-5 text-mint-strong" />
                Station Explorer
              </h2>
              <p className="text-xs text-secondary-text">
                NOAA CO-OPS Tide Gauges & Telemetry
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface-muted text-primary-text border border-border">
              {filteredStations.length} / {stations.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search station name, ID, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-border rounded-20 text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-mint transition-all"
            />
          </div>

          {/* Status and Region Filters */}
          <div className="flex flex-col gap-2 mb-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {['All Statuses', 'Normal', 'Elevated', 'Low Tide', 'Maintenance'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                      statusFilter === st
                        ? 'bg-charcoal text-white font-semibold shadow-xs'
                        : 'bg-surface-muted text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>

            {/* Region Select */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs text-primary-text focus:outline-none focus:ring-1 focus:ring-mint font-medium"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Scrollable Stations List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredStations.map((station) => {
              const isSelected = station.id === selectedStation.id;
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelectStation(station.id)}
                  className={`w-full text-left p-3 rounded-20 border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-charcoal text-white border-charcoal-border shadow-subtle'
                      : 'bg-surface-card hover:bg-surface-muted border-border text-primary-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-8 rounded-full shrink-0 ${
                        station.status === 'elevated'
                          ? 'bg-lavender'
                          : station.status === 'low_tide'
                          ? 'bg-warning'
                          : station.status === 'maintenance'
                          ? 'bg-gray-400'
                          : 'bg-mint-strong'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm leading-tight">
                          {station.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            isSelected ? 'text-gray-300' : 'text-secondary-text'
                          }`}
                        >
                          {station.id}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 flex items-center gap-2 ${
                          isSelected ? 'text-gray-300' : 'text-secondary-text'
                        }`}
                      >
                        <span>{station.state}</span>
                        <span>•</span>
                        <span>{station.tidalPhase}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`font-mono font-bold text-xs ${
                        isSelected ? 'text-mint' : 'text-primary-text'
                      }`}
                    >
                      {station.waterLevel.toFixed(2)} m
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        station.residual >= 0
                          ? isSelected
                            ? 'text-mint'
                            : 'text-mint-dark'
                          : 'text-danger'
                      }`}
                    >
                      {station.residual >= 0 ? '+' : ''}
                      {station.residual.toFixed(2)}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Leaflet Coastal Map (7 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-[28px] border border-border shadow-panel p-5 sm:p-6 flex flex-col justify-between h-[560px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-strong animate-pulse" />
              <h3 className="text-base font-bold text-primary-text">
                Coastal Station Sensor Network
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-secondary-text">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-strong" />
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lavender" />
                <span>Elevated Surge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                <span>Low Tide</span>
              </div>
            </div>
          </div>

          {/* Leaflet Map Integration */}
          <div className="flex-1 w-full rounded-24 overflow-hidden border border-border relative">
            <StationMap
              stations={filteredStations}
              selectedStationId={selectedStation.id}
              onSelectStation={handleSelectStation}
              height="100%"
            />
          </div>

          <div className="pt-3 mt-2 flex items-center justify-between text-xs text-secondary-text">
            <span>Coordinates: {selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°W</span>
            <span className="font-semibold text-primary-text">Datum: MLLW (Tidal Baseline)</span>
          </div>
        </div>
      </div>

      {/* Selected Station Details Card */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-24 bg-charcoal text-mint flex items-center justify-center font-bold text-lg shadow-subtle">
              {selectedStation.state}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-primary-text">
                  {selectedStation.name}
                </h3>
                {renderStatusBadge(selectedStation.status)}
              </div>
              <p className="text-xs text-secondary-text font-mono mt-0.5">
                NOAA Station ID: {selectedStation.id} • Region: {selectedStation.region}
              </p>
            </div>
          </div>

          {/* Sparkline Trend Container */}
          <div className="flex items-center gap-4 bg-surface-muted px-4 py-2.5 rounded-24 border border-border">
            <div>
              <span className="text-[11px] text-secondary-text font-medium block">
                24-Hour Observed Trend
              </span>
              <span className="text-sm font-bold text-primary-text font-mono">
                {selectedStation.waterLevel.toFixed(2)}m (Δ: {selectedStation.delta24h >= 0 ? '+' : ''}{selectedStation.delta24h.toFixed(2)}m)
              </span>
            </div>
            <div className="w-32">
              <MiniSparkline
                data={sparklineData}
                variant={selectedStation.status === 'elevated' ? 'lavender' : 'mint'}
                height={32}
              />
            </div>
          </div>
        </div>

        {/* 4 Metrics Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-24 bg-surface-muted border border-border">
            <span className="text-xs text-secondary-text font-medium block">Observed Level</span>
            <div className="text-2xl font-black text-primary-text font-mono mt-1">
              {selectedStation.waterLevel.toFixed(2)}
              <span className="text-xs font-normal text-secondary-text ml-1">m</span>
            </div>
            <span className="text-[11px] text-mint-dark font-semibold mt-1 block">
              Continuous Acoustic Sensor
            </span>
          </div>

          <div className="p-4 rounded-24 bg-surface-muted border border-border">
            <span className="text-xs text-secondary-text font-medium block">Harmonic Predicted</span>
            <div className="text-2xl font-black text-primary-text font-mono mt-1">
              {selectedStation.predictedLevel.toFixed(2)}
              <span className="text-xs font-normal text-secondary-text ml-1">m</span>
            </div>
            <span className="text-[11px] text-secondary-text font-semibold mt-1 block">
              NOAA Astronomical Model
            </span>
          </div>

          <div className="p-4 rounded-24 bg-surface-muted border border-border">
            <span className="text-xs text-secondary-text font-medium block">Non-Tidal Residual</span>
            <div
              className={`text-2xl font-black font-mono mt-1 ${
                selectedStation.residual >= 0 ? 'text-mint-dark' : 'text-danger'
              }`}
            >
              {selectedStation.residual >= 0 ? '+' : ''}
              {selectedStation.residual.toFixed(2)}
              <span className="text-xs font-normal text-secondary-text ml-1">m</span>
            </div>
            <span className="text-[11px] text-secondary-text font-semibold mt-1 block">
              Atmospheric / Wind Forcing
            </span>
          </div>

          <div className="p-4 rounded-24 bg-surface-muted border border-border">
            <span className="text-xs text-secondary-text font-medium block">30-Day Mean Trend</span>
            <div className="text-2xl font-black text-primary-text font-mono mt-1">
              {selectedStation.trend30d >= 0 ? '+' : ''}
              {selectedStation.trend30d.toFixed(2)}
              <span className="text-xs font-normal text-secondary-text ml-1">m</span>
            </div>
            <span className="text-[11px] text-secondary-text font-semibold mt-1 block">
              Sub-Seasonal Baseline Shift
            </span>
          </div>
        </div>

        {/* Anomaly History Table for Station */}
        <div>
          <h4 className="text-sm font-bold text-primary-text mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Station Anomaly Log & Automata History
          </h4>
          <div className="overflow-x-auto rounded-20 border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-muted text-secondary-text uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-3">Timestamp (UTC)</th>
                  <th className="px-4 py-3">Event Type / Description</th>
                  <th className="px-4 py-3">Peak Residual</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">DFA State Path</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {selectedStation.lastAnomaly ? (
                  <tr className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-secondary-text">
                      {new Date(selectedStation.lastAnomaly.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary-text">
                      {selectedStation.lastAnomaly.description}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-primary-text">
                      +{selectedStation.lastAnomaly.delta.toFixed(2)} m
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedStation.lastAnomaly.severity === 'High'
                            ? 'bg-danger-bg text-danger'
                            : 'bg-lavender/30 text-charcoal'
                        }`}
                      >
                        {selectedStation.lastAnomaly.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-secondary-text text-[11px]">
                      S0 → S1 → S2
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-mint/30 text-mint-dark font-bold text-[10px]">
                        Resolved
                      </span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-secondary-text">
                      No anomalous hydro events logged for this station.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsScreen;
