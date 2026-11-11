import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StationMetadata } from '@/types/noaa';

interface StationMapProps {
  stations: StationMetadata[];
  selectedStationId?: string;
  onSelectStation?: (stationId: string) => void;
  height?: number | string;
  className?: string;
}

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  height = 360,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Function to generate custom HTML marker matching ui-ref Image 2
  const createMarkerIcon = (station: StationMetadata, isSelected: boolean) => {
    let ringColor = '#68DD79'; // normal mint
    let dotColor = '#359D45';
    let isWrench = false;

    if (station.status === 'elevated') {
      ringColor = '#C5A8F8';
      dotColor = '#8B64DF';
    } else if (station.status === 'maintenance') {
      ringColor = '#9CA3AF';
      dotColor = '#6B7280';
      isWrench = true;
    } else if (station.status === 'low_tide') {
      ringColor = '#82A7FD';
      dotColor = '#3B82F6';
    }

    const size = isSelected ? 32 : 24;

    const selectedStyle = isSelected
      ? `box-shadow: 0 0 0 4px rgba(104, 221, 121, 0.35), 0 2px 8px rgba(0,0,0,0.18); transform: scale(1.15);`
      : `box-shadow: 0 1px 4px rgba(0,0,0,0.15);`;

    const innerContent = isWrench
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${dotColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
      : `<div style="width: ${size * 0.45}px; height: ${size * 0.45}px; border-radius: 9999px; background: ${dotColor};"></div>`;

    const html = `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 9999px;
          background: #FFFFFF;
          border: 3px solid ${ringColor};
          display: flex;
          align-items: center;
          justify-content: center;
          ${selectedStyle}
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        ">
          ${innerContent}
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-station-marker',
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 6],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Clean subtle Positron tiles for coastal aesthetic
    const map = L.map(mapContainerRef.current, {
      center: [37.8, -122.4],
      zoom: 5,
      zoomControl: false,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; NOAA CO-OPS',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Speech Bubble Tooltip for Selected Station
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    stations.forEach((station) => {
      if (typeof station.lat !== 'number' || typeof station.lng !== 'number') return;

      const isSelected = station.id === selectedStationId;
      const icon = createMarkerIcon(station, isSelected);

      const marker = L.marker([station.lat, station.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);

      // Add speech bubble tooltip for selected station matching Image 2
      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 13px; font-weight: 700; color: #171A18; white-space: nowrap;">${station.name}</div>`,
        {
          permanent: isSelected,
          direction: 'top',
          offset: [0, -16],
          className: 'station-speech-bubble',
        }
      );

      marker.on('click', () => {
        if (onSelectStation) {
          onSelectStation(station.id);
        }
      });

      markersRef.current.set(station.id, marker);
      bounds.extend([station.lat, station.lng]);
    });

    if (stations.length > 0 && bounds.isValid() && !selectedStationId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [stations, selectedStationId, onSelectStation]);

  // Center smoothly on selected station
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStationId) return;

    const station = stations.find((s) => s.id === selectedStationId);
    if (station && typeof station.lat === 'number' && typeof station.lng === 'number') {
      map.flyTo([station.lat, station.lng], 6, { duration: 1.0 });
    }
  }, [selectedStationId, stations]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={`relative w-full rounded-[28px] overflow-hidden border border-[#D9DEDA] shadow-sm bg-[#F7F9F6] ${className}`}
      style={{ height }}
    >
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Right Zoom Buttons (matching ui-ref Image 2) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col bg-white rounded-2xl shadow-sm border border-[#D9DEDA] overflow-hidden">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-8 h-8 flex items-center justify-center font-bold text-base text-[#171A18] hover:bg-[#F7F9F6] active:bg-[#EAEFEC] border-b border-[#EAEFEC] transition-colors"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-8 h-8 flex items-center justify-center font-bold text-base text-[#171A18] hover:bg-[#F7F9F6] active:bg-[#EAEFEC] transition-colors"
        >
          −
        </button>
      </div>

      {/* Floating Map Legend (Bottom-Left matching ui-ref Image 2) */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full border border-[#D9DEDA] shadow-sm flex items-center gap-4 text-xs font-semibold text-[#171A18] select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79]" />
          <span>Normal</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5A8F8]" />
          <span>Elevated</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#82A7FD]" />
          <span>Low Tide</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" />
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
