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
  height = 480,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Function to generate custom HTML marker based on status and selection
  const createMarkerIcon = (station: StationMetadata, isSelected: boolean) => {
    let ringColor = '#68DD79'; // normal
    let dotColor = '#359D45';
    if (station.status === 'elevated') {
      ringColor = '#C5A8F8';
      dotColor = '#8B64DF';
    } else if (station.status === 'maintenance') {
      ringColor = '#9CA3AF';
      dotColor = '#6B7280';
    } else if (station.status === 'low_tide') {
      ringColor = '#FBBF24';
      dotColor = '#D97706';
    }

    const size = isSelected ? 34 : 26;
    const selectedRing = isSelected
      ? `box-shadow: 0 0 0 4px #242424, 0 0 0 7px ${ringColor}; transform: scale(1.15);`
      : `box-shadow: 0 2px 8px rgba(0,0,0,0.25);`;

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
          ${selectedRing}
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        ">
          <div style="
            width: ${size * 0.42}px;
            height: ${size * 0.42}px;
            border-radius: 9999px;
            background: ${dotColor};
          "></div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-station-marker',
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // CartoDB Positron tiles for clean, modern scientific aesthetic
    const map = L.map(mapContainerRef.current, {
      center: [38.5, -96.0],
      zoom: 4,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

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

  // Update Markers
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

      const marker = L.marker([station.lat, station.lng], { icon }).addTo(map);

      // Popup Content
      const statusLabel =
        station.status === 'elevated'
          ? 'Elevated Tide'
          : station.status === 'low_tide'
          ? 'Low Tide'
          : station.status === 'maintenance'
          ? 'Maintenance'
          : 'Normal Status';

      const statusBadgeBg =
        station.status === 'elevated'
          ? '#F3EEFD'
          : station.status === 'low_tide'
          ? '#FEF3C7'
          : station.status === 'maintenance'
          ? '#F3F4F6'
          : '#E2FBE3';

      const statusBadgeText =
        station.status === 'elevated'
          ? '#8B64DF'
          : station.status === 'low_tide'
          ? '#D97706'
          : station.status === 'maintenance'
          ? '#6B7280'
          : '#359D45';

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 190px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #737A75; font-family: monospace;">#${station.id}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: ${statusBadgeBg}; color: ${statusBadgeText};">
              ${statusLabel}
            </span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #242424; margin-bottom: 8px;">
            ${station.name}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 10px; background: #F7F9F6; padding: 6px 8px; border-radius: 8px;">
            <div>
              <div style="color: #737A75;">Water Level</div>
              <div style="font-weight: 700; font-family: monospace; color: #171A18;">${station.waterLevel.toFixed(2)} m</div>
            </div>
            <div>
              <div style="color: #737A75;">Surge Residual</div>
              <div style="font-weight: 700; font-family: monospace; color: ${station.residual >= 0 ? '#359D45' : '#8B64DF'};">
                ${station.residual >= 0 ? '+' : ''}${station.residual.toFixed(2)} m
              </div>
            </div>
          </div>
          <button id="select-btn-${station.id}" style="
            width: 100%;
            padding: 6px 0;
            background: #242424;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 600;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            transition: background 0.15s ease;
          ">
            Select Station
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'custom-station-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`select-btn-${station.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectStation) onSelectStation(station.id);
            marker.closePopup();
          };
        }
      });

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
  }, [stations, onSelectStation]);

  // Center on selected station if it changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStationId) return;

    const station = stations.find((s) => s.id === selectedStationId);
    if (station && typeof station.lat === 'number' && typeof station.lng === 'number') {
      map.flyTo([station.lat, station.lng], 8, { duration: 1.2 });
      const marker = markersRef.current.get(station.id);
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedStationId, stations]);

  return (
    <div
      className={`relative w-full rounded-28px overflow-hidden border border-border shadow-panel bg-surface ${className}`}
      style={{ height }}
    >
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Legend (Glassmorphism Pill) */}
      <div className="absolute top-4 right-4 z-[1000] bg-surface/90 backdrop-blur-md px-4 py-2.5 rounded-24px border border-border shadow-subtle flex items-center gap-4 text-xs font-medium text-primary-text select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#68DD79] bg-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#359D45]" />
          </span>
          <span>Normal</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#C5A8F8] bg-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B64DF]" />
          </span>
          <span>Elevated</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#FBBF24] bg-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          </span>
          <span>Low Tide</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#9CA3AF] bg-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" />
          </span>
          <span>Maintenance</span>
        </div>
      </div>

      {/* Station count pill */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-charcoal text-white text-xs font-mono px-3 py-1.5 rounded-full shadow-subtle flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#68DD79] animate-pulse" />
        <span>{stations.length} Coastal Telemetry Stations</span>
      </div>
    </div>
  );
};

export default StationMap;
