import { create } from 'zustand';
import { useAutomataStore } from './automataStore';

export type ScreenId =
  | 'overview'
  | 'stations'
  | 'monitoring'
  | 'patterns'
  | 'events'
  | 'reports'
  | 'upload'
  | 'alerts'
  | 'settings'
  | 'automata_lab';

interface NavigationState {
  currentScreen: ScreenId;
  selectedEventId: string | null;
  setCurrentScreen: (screen: ScreenId) => void;
  navigateToAutomataLab: (patternId?: string) => void;
  setSelectedEventId: (eventId: string | null) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentScreen: 'overview',
  selectedEventId: null,

  setCurrentScreen: (screen: ScreenId) => set({ currentScreen: screen }),

  navigateToAutomataLab: (patternId?: string) => {
    if (patternId) {
      useAutomataStore.getState().selectPattern(patternId);
    }
    set({ currentScreen: 'automata_lab' });
  },

  setSelectedEventId: (eventId: string | null) => set({ selectedEventId: eventId }),
}));
