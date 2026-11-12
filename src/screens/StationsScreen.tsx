import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Calendar,
  Wrench,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { StationMap } from '@/components/map/StationMap';
import { StationMetadata } from '@/types/noaa';

// SVG Double-Wave Icon matching ui-ref Image 2
const WaveIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 9c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" />
    <path d="M2 15c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" />
  </svg>
);

export const StationsScreen: React.FC = () => {
  const navigate = useNavigate();

  const {
    stations,
    selectedStation,
    selectStation,
    searchQuery,
    setSearchQuery,
    statusFilter,
    regionFilter,
  } = useStationStore();

  const { loadStationData } = useTideDataStore();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const handleSelectStation = (stationId: string) => {
    selectStation(stationId);
    const st = stations.find((s) => s.id === stationId);
    if (st) {
      loadStationData(st.id, st.name, 24);
    }
  };

  // Filtered stations based on store query and header filters
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.includes(searchQuery) ||
        s.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.state.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All Statuses' ||
        (statusFilter === 'Normal' && s.status === 'normal') ||
        (statusFilter === 'Elevated' && s.status === 'elevated') ||
        (statusFilter === 'Low Tide' && s.status === 'low_tide') ||
        (statusFilter === 'Maintenance' && s.status === 'maintenance');

      const matchesRegion =
        regionFilter === 'All Regions' ||
        s.region.toLowerCase().includes(regionFilter.toLowerCase()) ||
        (regionFilter === 'East Coast' && s.region.includes('East Coast')) ||
        (regionFilter === 'Gulf Coast' && s.region.includes('Gulf Coast')) ||
        (regionFilter === 'Pacific NW' && s.region.includes('Pacific Northwest'));

      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [stations, searchQuery, statusFilter, regionFilter]);

  // Paginated stations
  const totalPages = Math.max(1, Math.ceil(filteredStations.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedStations = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredStations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStations, validPage, ITEMS_PER_PAGE]);

  // Status Badge / Pill Helper matching ui-ref Image 2
  const renderStatusPill = (status: StationMetadata['status']) => {
    switch (status) {
      case 'elevated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE7FA] text-[#171A18]">
            <span className="w-2 h-2 rounded-full bg-[#8C52FF]" />
            <span>Elevated</span>
          </span>
        );
      case 'low_tide':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3ECFE] text-[#171A18]">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span>Low Tide</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAEFEC] text-[#171A18]">
            <span className="w-2 h-2 rounded-full bg-[#737A75]" />
            <span>Maintenance</span>
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2FBE3] text-[#171A18]">
            <span className="w-2 h-2 rounded-full bg-[#359D45]" />
            <span>Normal</span>
          </span>
        );
    }
  };

  // Circular Icon Badge for Unselected Row
  const renderIconBadge = (status: StationMetadata['status']) => {
    switch (status) {
      case 'elevated':
        return (
          <div className="w-10 h-10 rounded-full bg-[#EDE7FA] text-[#8C52FF] flex items-center justify-center shrink-0">
            <WaveIcon className="w-5 h-5" />
          </div>
        );
      case 'low_tide':
        return (
          <div className="w-10 h-10 rounded-full bg-[#E3ECFE] text-[#3B82F6] flex items-center justify-center shrink-0">
            <WaveIcon className="w-5 h-5" />
          </div>
        );
      case 'maintenance':
        return (
          <div className="w-10 h-10 rounded-full bg-[#EAEFEC] text-[#737A75] flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
        );
      case 'normal':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-[#E2FBE3] text-[#359D45] flex items-center justify-center shrink-0">
            <WaveIcon className="w-5 h-5" />
          </div>
        );
    }
  };

  // Format anomaly timestamp
  const anomalyDateStr = useMemo(() => {
    if (!selectedStation.lastAnomaly?.timestamp) return 'Jan 24, 14:26';
    const d = new Date(selectedStation.lastAnomaly.timestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [selectedStation.lastAnomaly]);

  return (
    <div data-testid="screen-stations" className="space-y-5">
      {/* 2-Column Desktop Grid matching ui-ref Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ====================================================================
            LEFT PANEL: Station Explorer Card (5 cols)
            ==================================================================== */}
        <div className="lg:col-span-5 bg-surface rounded-[28px] border border-[#D9DEDA] shadow-sm p-6 flex flex-col justify-between min-h-[660px]">
          <div>
            {/* Header: Title, Station Count & Search Pill */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-[20px] font-bold text-[#171A18] tracking-tight leading-tight">
                  Station Explorer
                </h2>
                <p className="text-[13px] text-[#737A75] font-medium mt-0.5">
                  {filteredStations.length} stations
                </p>
              </div>

              {/* Pill-shaped Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#737A75] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-[#EAEFEC] border border-[#D9DEDA] pl-9 pr-4 py-1.5 rounded-full text-xs text-[#171A18] placeholder-[#737A75] w-40 sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#68DD79] transition-all"
                />
              </div>
            </div>

            {/* Vertically Stacked Station Items (8 items matching ui-ref Image 2) */}
            <div className="space-y-2">
              {paginatedStations.map((station) => {
                const isSelected = station.id === selectedStation.id;

                if (isSelected) {
                  return (
                    <button
                      key={station.id}
                      onClick={() => handleSelectStation(station.id)}
                      className="w-full text-left p-3 rounded-[20px] border-2 border-[#68DD79] bg-[#E2FBE3] transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Circular Green Wave Icon Badge */}
                        <div className="w-9 h-9 rounded-full bg-[#C2F7C5] flex items-center justify-center shrink-0 text-[#171A18]">
                          <WaveIcon className="w-4 h-4 text-[#359D45]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[14px] text-[#171A18] leading-tight truncate">
                            {station.name}
                          </div>
                          <div className="text-[12px] text-[#737A75] mt-0.5 leading-tight truncate font-medium">
                            {station.region}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {renderStatusPill(station.status)}
                        <ArrowRight className="w-4 h-4 text-[#171A18]" />
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={station.id}
                    onClick={() => handleSelectStation(station.id)}
                    className="w-full text-left p-3 rounded-[20px] border border-[#E3E8E4] bg-white hover:bg-[#F4F7F4] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderIconBadge(station.status)}
                      <div className="min-w-0">
                        <div className="font-semibold text-[14px] text-[#171A18] leading-tight truncate">
                          {station.name}
                        </div>
                        <div className="text-[12px] text-[#737A75] mt-0.5 leading-tight truncate font-medium">
                          {station.region}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {renderStatusPill(station.status)}
                      <ArrowRight className="w-4 h-4 text-[#737A75]" />
                    </div>
                  </button>
                );
              })}

              {paginatedStations.length === 0 && (
                <div className="py-12 text-center text-[#737A75] text-xs">
                  No stations match your filter criteria.
                </div>
              )}
            </div>
          </div>

          {/* Pagination Pill Bar (< 1 2 3 ... 6 >) */}
          <div className="flex items-center justify-center gap-1.5 pt-4 mt-4 border-t border-[#EAEFEC] select-none">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage === 1}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-[#737A75] hover:text-[#171A18] hover:bg-[#EAEFEC] disabled:opacity-30 transition-colors font-medium"
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  validPage === page
                    ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                    : 'text-[#737A75] hover:text-[#171A18] hover:bg-[#EAEFEC]'
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 3 && (
              <>
                <span className="text-xs text-[#737A75] px-1 font-medium">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    validPage === totalPages
                      ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                      : 'text-[#737A75] hover:text-[#171A18] hover:bg-[#EAEFEC]'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage === totalPages}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-[#737A75] hover:text-[#171A18] hover:bg-[#EAEFEC] disabled:opacity-30 transition-colors font-medium"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* ====================================================================
            RIGHT PANEL: Leaflet Map + Selected Station Card (7 cols)
            ==================================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top: Leaflet Coastal Map Card */}
          <StationMap
            stations={filteredStations}
            selectedStationId={selectedStation.id}
            onSelectStation={handleSelectStation}
            height={370}
          />

          {/* Bottom: Selected Station Summary Card */}
          <div className="bg-surface rounded-[28px] border border-[#D9DEDA] shadow-sm p-6">
            {/* Header: Circle Icon, Station Name & ID, Status Pill */}
            <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-[#EAEFEC]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#E2FBE3] text-[#359D45] flex items-center justify-center shrink-0">
                  <WaveIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-bold text-[#171A18] tracking-tight leading-tight truncate">
                    {selectedStation.name}
                  </h3>
                  <p className="text-[13px] text-[#737A75] font-medium mt-0.5 truncate">
                    {selectedStation.region} • Station ID: {selectedStation.id}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {renderStatusPill(selectedStation.status)}
              </div>
            </div>

            {/* 3 Columns Subcards Grid matching ui-ref Image 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subcard 1: Current Water Level (Mint) */}
              <div className="bg-[#B8F5BC] rounded-[24px] p-5 flex flex-col justify-between h-[185px] relative overflow-hidden shadow-xs">
                <div>
                  <span className="text-[13px] font-semibold text-[#171A18]/80 block">
                    Current Water Level
                  </span>
                  <div className="text-[34px] font-black tracking-tight text-[#171A18] leading-tight my-1">
                    {selectedStation.waterLevel.toFixed(2)} m
                  </div>
                  <span className="text-[12px] font-medium text-[#171A18]/75 block">
                    {selectedStation.delta24h >= 0 ? '+' : ''}
                    {selectedStation.delta24h.toFixed(2)} m vs. 24 h ago
                  </span>
                </div>

                {/* Smooth bezier wave graphic with endpoint dot */}
                <div className="w-full h-12 mt-2">
                  <svg viewBox="0 0 200 48" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="mintWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#242424" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#242424" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 38 Q 45 44 75 24 T 150 26 T 190 14"
                      fill="none"
                      stroke="#171A18"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 38 Q 45 44 75 24 T 150 26 T 190 14 L 190 48 L 0 48 Z"
                      fill="url(#mintWaveGrad)"
                    />
                    <circle
                      cx="190"
                      cy="14"
                      r="3.5"
                      fill="#FFFFFF"
                      stroke="#171A18"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Subcard 2: Trend (30 days) (Lavender) */}
              <div className="bg-[#DDD0F8] rounded-[24px] p-5 flex flex-col justify-between h-[185px] relative overflow-hidden shadow-xs">
                <div>
                  <span className="text-[13px] font-semibold text-[#171A18]/80 block">
                    Trend (30 days)
                  </span>
                  <div className="text-[26px] font-extrabold tracking-tight text-[#171A18] leading-tight my-1 flex items-center gap-1.5">
                    <span>↗</span>
                    <span>
                      {selectedStation.trend30d >= 0 ? '+' : ''}
                      {selectedStation.trend30d.toFixed(2)} m
                    </span>
                  </div>
                </div>

                {/* Lavender filled area curve */}
                <div className="w-full h-12 mt-2">
                  <svg viewBox="0 0 200 48" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 Q 50 42 90 28 T 160 18 T 200 16 L 200 48 L 0 48 Z"
                      fill="#9D73EE"
                      fillOpacity="0.45"
                    />
                    <path
                      d="M 0 34 Q 50 42 90 28 T 160 18 T 200 16"
                      fill="none"
                      stroke="#8C52FF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Subcard 3: Last Anomaly (Surface Card) */}
              <div
                onClick={() => navigate('/events')}
                className="bg-white border border-[#D9DEDA] rounded-[24px] p-5 flex flex-col justify-between h-[185px] hover:border-[#B5BEB6] transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#171A18] shrink-0" />
                    <span className="text-[13px] font-semibold text-[#171A18]">
                      Last Anomaly
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#737A75] group-hover:text-[#171A18] group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <div className="text-[18px] font-bold text-[#171A18] leading-snug">
                    {anomalyDateStr}
                  </div>
                  <p className="text-[13px] text-[#737A75] mt-1 font-medium leading-snug">
                    {selectedStation.lastAnomaly?.description || 'Elevated water level (+0.51 m)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsScreen;
