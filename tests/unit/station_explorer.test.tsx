import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StationsScreen } from '@/screens/StationsScreen';
import { useStationStore } from '@/stores/stationStore';
import { NOAA_STATIONS } from '@/data/stations';

// Mock Leaflet and StationMap to avoid canvas/webgl jsdom limitations
vi.mock('@/components/map/StationMap', () => ({
  StationMap: () => <div data-testid="station-map-mock">Mocked Leaflet Map</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Milestone 2: Station Explorer Visual Parity & Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStationStore.setState({
      stations: NOAA_STATIONS,
      selectedStation: NOAA_STATIONS[0],
      searchQuery: '',
      regionFilter: 'All Regions',
      statusFilter: 'All Statuses',
    });
  });

  it('renders Station Explorer title and exact station count matching ui-ref Image 2', () => {
    render(
      <MemoryRouter>
        <StationsScreen />
      </MemoryRouter>
    );

    expect(screen.getByText('Station Explorer')).toBeInTheDocument();
    expect(screen.getByText('24 stations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search stations...')).toBeInTheDocument();
  });

  it('filters stations in real time when typing into search input', async () => {
    render(
      <MemoryRouter>
        <StationsScreen />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search stations...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'San Francisco' } });
    });

    expect(screen.getByText('1 stations')).toBeInTheDocument();
    expect(screen.getByText(/San Francisco/i)).toBeInTheDocument();
  });

  it('renders pagination control and allows navigating between pages', async () => {
    render(
      <MemoryRouter>
        <StationsScreen />
      </MemoryRouter>
    );

    // Page 1 is active by default
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Click page 2
    const page2Button = screen.getByText('2');
    await act(async () => {
      fireEvent.click(page2Button);
    });

    // Check that button 2 is now highlighted
    expect(page2Button.className).toContain('bg-[#A5F5A6]');
  });

  it('highlights the selected station with distinct green border and styling', () => {
    render(
      <MemoryRouter>
        <StationsScreen />
      </MemoryRouter>
    );

    const firstStationName = NOAA_STATIONS[0].name;
    const matchingElements = screen.getAllByText(firstStationName);
    const selectedBtn = matchingElements[0].closest('button');
    expect(selectedBtn).toBeInTheDocument();
    expect(selectedBtn?.className).toContain('border-[#68DD79]');
    expect(selectedBtn?.className).toContain('bg-[#E2FBE3]');
  });

  it('renders the 3 metric subcards in the bottom right panel', () => {
    render(
      <MemoryRouter>
        <StationsScreen />
      </MemoryRouter>
    );

    expect(screen.getByText('Current Water Level')).toBeInTheDocument();
    expect(screen.getByText('Trend (30 days)')).toBeInTheDocument();
    expect(screen.getByText('Last Anomaly')).toBeInTheDocument();
  });

  it('clicking Last Anomaly card navigates to /events', async () => {
    render(
      <MemoryRouter>
        <StationsScreen />
      </MemoryRouter>
    );

    const anomalyCard = screen.getByText('Last Anomaly').closest('div[class*="cursor-pointer"]');
    expect(anomalyCard).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(anomalyCard!);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });
});
