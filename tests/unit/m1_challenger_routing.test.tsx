import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AppRoutes } from '@/App';
import { NAV_ITEMS } from '@/components/layout/Sidebar';
import { ROUTE_METADATA } from '@/components/layout/AppLayout';
import { useTideDataStore } from '@/stores/tideDataStore';

describe('Milestone 1 Adversarial Challenge: Route Coverage & Sidebar Active Sync', () => {
  beforeEach(() => {
    // Seed tide data store with a clean point to avoid unhandled async fetch during route mounting
    useTideDataStore.setState({
      points: [
        {
          timestamp: '2024-11-12T12:00:00Z',
          observed: 1.45,
          predicted: 1.40,
          residual: 0.05,
          rateOfChange: 0.01,
          zScore: 0.1,
          qualityFlag: 'verified',
        },
      ],
      isLoading: false,
      dataSource: 'bundled_fallback',
    });
  });

  const allTenRoutes = [
    { id: 'overview', path: '/overview', testId: 'screen-overview', title: 'Overview' },
    { id: 'stations', path: '/stations', testId: 'screen-stations', title: 'Stations' },
    { id: 'monitoring', path: '/monitoring', testId: 'screen-monitoring', title: 'Monitoring' },
    { id: 'patterns', path: '/patterns', testId: 'screen-patterns', title: 'Patterns' },
    { id: 'events', path: '/events', testId: 'screen-events', title: 'Events' },
    { id: 'reports', path: '/reports', testId: 'screen-reports', title: 'Reports' },
    { id: 'upload', path: '/upload', testId: 'screen-upload', title: 'Upload' },
    { id: 'alerts', path: '/alerts', testId: 'screen-alerts', title: 'Alerts' },
    { id: 'settings', path: '/settings', testId: 'screen-settings', title: 'Settings' },
    { id: 'pattern-engine', path: '/pattern-engine', testId: 'screen-pattern-engine', title: 'Pattern Engine' },
  ];

  describe('1. Exhaustive Deep-Link Coverage & Single-Active-Pill Invariant', () => {
    allTenRoutes.forEach((route) => {
      it(`accurately activates ${route.path} with unique active pill, header title, and screen container`, () => {
        render(
          <MemoryRouter initialEntries={[route.path]}>
            <AppRoutes />
          </MemoryRouter>
        );

        // 1. Verify correct screen is rendered
        expect(screen.getByTestId(route.testId)).toBeInTheDocument();

        // 2. Verify header title matches route metadata
        expect(screen.getByTestId('header-title')).toHaveTextContent(route.title);

        // 3. Verify exactly ONE nav item is active, and it is the target route
        const activeNavPills = NAV_ITEMS.filter((item) => {
          const pill = screen.getByTestId(`nav-${item.id}`);
          return pill.className.includes('bg-[#A5F5A6]');
        });

        expect(activeNavPills).toHaveLength(1);
        expect(activeNavPills[0].id).toBe(route.id);

        // 4. Verify target pill has active font and styling tokens
        const targetPill = screen.getByTestId(`nav-${route.id}`);
        expect(targetPill.className).toContain('bg-[#A5F5A6]');
        expect(targetPill.className).toContain('text-[#171A18]');
        expect(targetPill.className).toContain('font-semibold');

        // 5. Verify all other 9 pills are inactive
        const inactiveItems = NAV_ITEMS.filter((item) => item.id !== route.id);
        inactiveItems.forEach((item) => {
          const pill = screen.getByTestId(`nav-${item.id}`);
          expect(pill.className).not.toContain('bg-[#A5F5A6]');
          expect(pill.className).toContain('text-[#737A75]');
        });
      });
    });
  });

  describe('2. Adversarial Redirects & Edge-Case URL Navigation', () => {
    it('redirects root "/" to "/overview" and highlights Overview nav pill', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByTestId('screen-overview')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Overview');

      const activePill = screen.getByTestId('nav-overview');
      expect(activePill.className).toContain('bg-[#A5F5A6]');

      const otherPills = NAV_ITEMS.filter((i) => i.id !== 'overview');
      otherPills.forEach((i) => {
        expect(screen.getByTestId(`nav-${i.id}`).className).not.toContain('bg-[#A5F5A6]');
      });
    });

    it('redirects legacy alias "/automata-lab" to "/pattern-engine" with active Pattern Engine pill', () => {
      render(
        <MemoryRouter initialEntries={['/automata-lab']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByTestId('screen-pattern-engine')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Pattern Engine');

      const activePill = screen.getByTestId('nav-pattern-engine');
      expect(activePill.className).toContain('bg-[#A5F5A6]');
    });

    const adversarialGarbageUrls = [
      '/foo/bar/xyz',
      '/null',
      '/undefined',
      '/[object%20Object]',
      '/stations/9414290/unknown/deep/subpath',
      '/admin/shell.php',
      '/../../etc/passwd',
      '/%2e%2e/%2e%2e/restricted',
      '/1234567890',
      '/unknown?param=malicious<script>alert(1)</script>',
      '/#fragment-only',
    ];

    adversarialGarbageUrls.forEach((badUrl) => {
      it(`safely handles adversarial URL "${badUrl}" by redirecting to "/overview" without crash`, () => {
        render(
          <MemoryRouter initialEntries={[badUrl]}>
            <AppRoutes />
          </MemoryRouter>
        );

        // Expect safe recovery to Overview
        expect(screen.getByTestId('screen-overview')).toBeInTheDocument();
        expect(screen.getByTestId('header-title')).toHaveTextContent('Overview');
        expect(screen.getByTestId('nav-overview').className).toContain('bg-[#A5F5A6]');
      });
    });

    it('preserves route matching when query parameters are attached to valid routes', () => {
      render(
        <MemoryRouter initialEntries={['/stations?stationId=9414290&view=list']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByTestId('screen-stations')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Stations');
      expect(screen.getByTestId('nav-stations').className).toContain('bg-[#A5F5A6]');
    });

    it('preserves route matching when hash anchors are attached to valid routes', () => {
      render(
        <MemoryRouter initialEntries={['/pattern-engine#tape-simulation']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByTestId('screen-pattern-engine')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Pattern Engine');
      expect(screen.getByTestId('nav-pattern-engine').className).toContain('bg-[#A5F5A6]');
    });
  });

  describe('3. Interactive Sidebar Navigation & Active State Transitions', () => {
    it('updates route, header, screen, and active pill when clicking a sidebar nav item', async () => {
      render(
        <MemoryRouter initialEntries={['/overview']}>
          <AppRoutes />
        </MemoryRouter>
      );

      // Initial state is Overview
      expect(screen.getByTestId('screen-overview')).toBeInTheDocument();
      expect(screen.getByTestId('nav-overview').className).toContain('bg-[#A5F5A6]');
      expect(screen.getByTestId('nav-monitoring').className).not.toContain('bg-[#A5F5A6]');

      // Click on Monitoring nav pill
      const monitoringLink = screen.getByTestId('nav-monitoring');
      await act(async () => {
        fireEvent.click(monitoringLink);
      });

      // Verify state transitioned to Monitoring
      expect(screen.getByTestId('screen-monitoring')).toBeInTheDocument();
      expect(screen.queryByTestId('screen-overview')).not.toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Monitoring');
      expect(screen.getByTestId('nav-monitoring').className).toContain('bg-[#A5F5A6]');
      expect(screen.getByTestId('nav-overview').className).not.toContain('bg-[#A5F5A6]');
    });

    it('completes a full continuous 10-screen tour via sequential sidebar clicks', async () => {
      render(
        <MemoryRouter initialEntries={['/overview']}>
          <AppRoutes />
        </MemoryRouter>
      );

      for (const route of allTenRoutes) {
        const link = screen.getByTestId(`nav-${route.id}`);
        await act(async () => {
          fireEvent.click(link);
        });

        // Verify active screen
        expect(screen.getByTestId(route.testId)).toBeInTheDocument();
        expect(screen.getByTestId('header-title')).toHaveTextContent(route.title);

        // Verify strictly ONE active pill
        const activePills = NAV_ITEMS.filter((item) =>
          screen.getByTestId(`nav-${item.id}`).className.includes('bg-[#A5F5A6]')
        );
        expect(activePills).toHaveLength(1);
        expect(activePills[0].id).toBe(route.id);
      }
    });

    it('withstands rapid ping-pong switching between two distant routes without desync or memory error', async () => {
      render(
        <MemoryRouter initialEntries={['/overview']}>
          <AppRoutes />
        </MemoryRouter>
      );

      for (let i = 0; i < 6; i++) {
        // Switch to Pattern Engine
        await act(async () => {
          fireEvent.click(screen.getByTestId('nav-pattern-engine'));
        });
        expect(screen.getByTestId('screen-pattern-engine')).toBeInTheDocument();
        expect(screen.getByTestId('nav-pattern-engine').className).toContain('bg-[#A5F5A6]');

        // Switch back to Overview
        await act(async () => {
          fireEvent.click(screen.getByTestId('nav-overview'));
        });
        expect(screen.getByTestId('screen-overview')).toBeInTheDocument();
        expect(screen.getByTestId('nav-overview').className).toContain('bg-[#A5F5A6]');
      }
    });
  });

  describe('4. Shell & Header Interaction Concurrency', () => {
    it('maintains selected station and date range filters when navigating across routes', async () => {
      render(
        <MemoryRouter initialEntries={['/overview']}>
          <AppRoutes />
        </MemoryRouter>
      );

      // Open Station dropdown and change station to Boston
      const stationFilter = screen.getByTestId('station-filter');
      const stationBtn = stationFilter.querySelector('button');
      expect(stationBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(stationBtn!);
      });

      const bostonOption = screen.getByText(/Boston, MA/i);
      await act(async () => {
        fireEvent.click(bostonOption);
      });

      // Verify dropdown updated
      expect(screen.getByText(/Boston, MA/i)).toBeInTheDocument();

      // Navigate to Stations screen
      await act(async () => {
        fireEvent.click(screen.getByTestId('nav-stations'));
      });

      // Boston selection is preserved in Header across route change
      expect(screen.getByText(/Boston, MA/i)).toBeInTheDocument();
      expect(screen.getByTestId('screen-stations')).toBeInTheDocument();
    });

    it('renders root App production container without crashing', () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});
