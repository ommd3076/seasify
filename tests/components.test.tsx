import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  TideChart,
  ResidualChart,
  RadialGauge,
  MiniSparkline,
  AutomataGraph,
  TransitionTable,
  EventTape,
  SequenceSimulator,
  Badge,
  Button,
  Card,
  MetricCard,
  Dropdown,
  Modal,
} from '@/components';
import { WaterLevelPoint } from '@/types/noaa';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';

describe('Shared UI, Chart, Map, and Automata Components', () => {
  const samplePoints: WaterLevelPoint[] = [
    {
      timestamp: '2024-11-12T12:00:00Z',
      observed: 1.25,
      predicted: 1.20,
      residual: 0.05,
      rateOfChange: 0.02,
      zScore: 0.1,
      qualityFlag: 'verified',
    },
    {
      timestamp: '2024-11-12T12:30:00Z',
      observed: 1.55,
      predicted: 1.25,
      residual: 0.30,
      rateOfChange: 0.25,
      zScore: 1.8,
      qualityFlag: 'verified',
    },
  ];

  it('renders TideChart and ResidualChart without crashing', () => {
    const { container: tideContainer } = render(
      <TideChart data={samplePoints} title="Water Level: Observed vs Predicted" stationName="The Battery, NY" />
    );
    expect(screen.getByText('Water Level: Observed vs Predicted')).toBeInTheDocument();
    expect(screen.getByText('The Battery, NY')).toBeInTheDocument();
    expect(tideContainer).toBeInTheDocument();

    const { container: resContainer } = render(
      <ResidualChart data={samplePoints} title="Non-Tidal Residual R(t)" />
    );
    expect(screen.getByText('Non-Tidal Residual R(t)')).toBeInTheDocument();
    expect(resContainer).toBeInTheDocument();
  });

  it('renders RadialGauge with value and status badge', () => {
    render(<RadialGauge value={2.42} min={0} max={3.5} title="Live Water Level" status="Normal" />);
    expect(screen.getByText('2.42')).toBeInTheDocument();
    expect(screen.getByText('Live Water Level')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('renders MiniSparkline without crashing', () => {
    const { container } = render(<MiniSparkline data={[1.2, 1.4, 1.1, 1.8, 1.5]} variant="mint" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders AutomataGraph with states and q0 start pointer', () => {
    const pattern = PREDEFINED_PATTERNS[0];
    render(<AutomataGraph dfa={pattern} activeStateId="S0" />);
    expect(screen.getByText('q₀')).toBeInTheDocument();
    expect(screen.getByText('S0')).toBeInTheDocument();
    expect(screen.getByText('S1')).toBeInTheDocument();
    expect(screen.getByText('S2')).toBeInTheDocument();
  });

  it('renders TransitionTable with formal transition rows', () => {
    const pattern = PREDEFINED_PATTERNS[0];
    render(<TransitionTable dfa={pattern} currentStateId="S0" />);
    expect(screen.getByText(/Formal State Transition Table/i)).toBeInTheDocument();
    expect(screen.getAllByText(/q₀/).length).toBeGreaterThan(0);
  });

  it('renders EventTape with playback controls', () => {
    render(<EventTape traces={[]} />);
    expect(screen.getByText(/Synchronized Event Stream Tape/i)).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  it('renders SequenceSimulator with token palette and preset buttons', () => {
    render(<SequenceSimulator dfa={PREDEFINED_PATTERNS[0]} />);
    expect(screen.getByText(/Interactive Finite Automata Sequence Simulator/i)).toBeInTheDocument();
    expect(screen.getByText('Sandy Surge Pulse')).toBeInTheDocument();
    expect(screen.getByText('Step (0/4)')).toBeInTheDocument();
  });

  it('renders Button, Badge, Card, and MetricCard primitives', () => {
    render(
      <Card variant="surface">
        <Badge variant="mint">Active</Badge>
        <MetricCard title="Peak Residual" value="+0.42" unit="m" variant="charcoal" />
        <Button variant="primary">Export Telemetry</Button>
      </Card>
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Peak Residual')).toBeInTheDocument();
    expect(screen.getByText('+0.42')).toBeInTheDocument();
    expect(screen.getByText('Export Telemetry')).toBeInTheDocument();
  });

  it('renders Dropdown and Modal components', () => {
    const { rerender } = render(
      <Dropdown
        options={[
          { value: '24h', label: 'Last 24 Hours' },
          { value: '48h', label: 'Last 48 Hours' },
        ]}
        value="24h"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={() => {}} title="Automaton Inspection">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Automaton Inspection')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });
});
