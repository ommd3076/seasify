import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AppRoutes } from '@/App';
import { cn } from '@/utils/cn';
import { MetricCard } from '@/components/common/MetricCard';
import { RadialGauge } from '@/components/common/RadialGauge';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Dropdown } from '@/components/common/Dropdown';
import { DateRangePicker, PRESET_RANGES } from '@/components/common/DateRangePicker';
import { Sidebar, NAV_ITEMS } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

describe('Milestone 1: cn utility', () => {
  it('merges tailwind classes cleanly and resolves conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('bg-red-500', false && 'text-white', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn(['text-sm', 'font-bold'])).toBe('text-sm font-bold');
  });
});

describe('Milestone 1: Shared Components', () => {
  it('renders MetricCard in charcoal and surface variants with delta', () => {
    const { rerender } = render(
      <MetricCard
        variant="charcoal"
        title="Tide Activity"
        value={128}
        unit="Active"
        delta={{ text: '+12% vs last month', direction: 'up', isPositive: true }}
      />
    );
    expect(screen.getByText('Tide Activity')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('+12% vs last month')).toBeInTheDocument();

    rerender(
      <MetricCard
        variant="surface"
        title="Current Water Level"
        value="1.86"
        unit="m"
        delta={{ text: '-0.15m deviation', direction: 'down', isPositive: false }}
      />
    );
    expect(screen.getByText('Current Water Level')).toBeInTheDocument();
    expect(screen.getByText('1.86')).toBeInTheDocument();
    expect(screen.getByText('m')).toBeInTheDocument();
    expect(screen.getByText('-0.15m deviation')).toBeInTheDocument();
  });

  it('renders RadialGauge with SVG arcs and center value', () => {
    render(
      <RadialGauge
        value={1.86}
        min={0}
        max={3.5}
        unit="m"
        title="Current Water Level"
        deltaText="+0.24 m vs. 6 h ago"
      />
    );
    expect(screen.getByText('Current Water Level')).toBeInTheDocument();
    expect(screen.getByText('1.86')).toBeInTheDocument();
    expect(screen.getByText('+0.24 m vs. 6 h ago')).toBeInTheDocument();
    expect(screen.getByTestId('radial-gauge')).toBeInTheDocument();
  });

  it('renders Badge in multiple status variants with dot indicators', () => {
    const { rerender } = render(<Badge variant="normal">Normal</Badge>);
    expect(screen.getByText('Normal')).toBeInTheDocument();

    rerender(<Badge variant="elevated">Elevated Surge</Badge>);
    expect(screen.getByText('Elevated Surge')).toBeInTheDocument();

    rerender(<Badge variant="low_tide">Low Tide</Badge>);
    expect(screen.getByText('Low Tide')).toBeInTheDocument();

    rerender(<Badge variant="maintenance">Maintenance</Badge>);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();

    rerender(<Badge variant="high">High Severity</Badge>);
    expect(screen.getByText('High Severity')).toBeInTheDocument();
  });

  it('renders Button in primary, secondary, ghost, danger, and icon variants', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button variant="primary" onClick={handleClick}>
        Click Me
      </Button>
    );
    const btn = screen.getByText('Click Me');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toBeInTheDocument();

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toBeInTheDocument();

    rerender(<Button isLoading>Loading</Button>);
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it('renders Dropdown and responds to option selection', () => {
    const handleChange = vi.fn();
    render(
      <Dropdown
        options={[
          { value: 'all', label: 'All Stations' },
          { value: '8518750', label: 'The Battery, NY' },
        ]}
        value="all"
        onChange={handleChange}
      />
    );

    expect(screen.getByText('All Stations')).toBeInTheDocument();
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const option = screen.getByText('The Battery, NY');
    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith('8518750');
  });

  it('renders DateRangePicker and responds to preset range selection', () => {
    const handleChange = vi.fn();
    render(<DateRangePicker value="30d" onChange={handleChange} />);

    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const option = screen.getByText('Last 7 Days');
    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith('7d');
  });
});

describe('Milestone 1: Layout Shell & Navigation', () => {
  it('renders Sidebar with 10 navigation pills and brand header', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Seasify')).toBeInTheDocument();
    expect(screen.getByText('Tide & Water-Level Analysis')).toBeInTheDocument();
    expect(screen.getByText('NOAA CO-OPS')).toBeInTheDocument();

    for (const item of NAV_ITEMS) {
      expect(screen.getByTestId(`nav-${item.id}`)).toBeInTheDocument();
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
  });

  it('renders Header with dynamic title, subtitle, and filters', () => {
    render(
      <Header
        title="Overview"
        subtitle="Coastal tide and water-level patterns across your monitoring network"
        selectedStation="all"
        selectedRange="30d"
      />
    );

    expect(screen.getByTestId('header-title')).toHaveTextContent('Overview');
    expect(screen.getByTestId('header-subtitle')).toHaveTextContent(
      'Coastal tide and water-level patterns across your monitoring network'
    );
    expect(screen.getByTestId('station-filter')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-filter')).toBeInTheDocument();
  });
});

describe('Milestone 1: Routing & 10 Application Screens', () => {
  const testRoutes = [
    { path: '/overview', testId: 'screen-overview', title: 'Overview' },
    { path: '/stations', testId: 'screen-stations', title: 'Stations' },
    { path: '/monitoring', testId: 'screen-monitoring', title: 'Monitoring' },
    { path: '/patterns', testId: 'screen-patterns', title: 'Patterns' },
    { path: '/events', testId: 'screen-events', title: 'Events' },
    { path: '/reports', testId: 'screen-reports', title: 'Reports' },
    { path: '/upload', testId: 'screen-upload', title: 'Upload' },
    { path: '/alerts', testId: 'screen-alerts', title: 'Alerts' },
    { path: '/settings', testId: 'screen-settings', title: 'Settings' },
    { path: '/pattern-engine', testId: 'screen-pattern-engine', title: 'Pattern Engine' },
  ];

  for (const route of testRoutes) {
    it(`renders ${route.title} screen at ${route.path} inside AppLayout`, () => {
      render(
        <MemoryRouter initialEntries={[route.path]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByTestId(route.testId)).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  }

  it('redirects root / to /overview', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('screen-overview')).toBeInTheDocument();
  });

  it('redirects /automata-lab to /pattern-engine', () => {
    render(
      <MemoryRouter initialEntries={['/automata-lab']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('screen-pattern-engine')).toBeInTheDocument();
  });

  it('renders root App component without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });
});
