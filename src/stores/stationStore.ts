import { create } from 'zustand';
import { StationMetadata } from '@/types/noaa';
import { NOAA_STATIONS } from '@/data/stations';

interface StationState {
  stations: StationMetadata[];
  selectedStation: StationMetadata;
  searchQuery: string;
  regionFilter: string;
  statusFilter: string;
  setStations: (stations: StationMetadata[]) => void;
  selectStation: (stationId: string) => void;
  setSearchQuery: (query: string) => void;
  setRegionFilter: (region: string) => void;
  setStatusFilter: (status: string) => void;
}

export const useStationStore = create<StationState>((set, get) => ({
  stations: NOAA_STATIONS,
  selectedStation: NOAA_STATIONS[0],
  searchQuery: '',
  regionFilter: 'All Regions',
  statusFilter: 'All Statuses',

  setStations: (stations) => set({ stations }),

  selectStation: (stationId: string) => {
    const found = get().stations.find((s) => s.id === stationId);
    if (found) {
      set({ selectedStation: found });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRegionFilter: (regionFilter) => set({ regionFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));
