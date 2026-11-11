import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RadialGauge } from '@/components/common/RadialGauge';
import { MetricCard } from '@/components/common/MetricCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Dropdown } from '@/components/common/Dropdown';
import { DateRangePicker, PRESET_RANGES } from '@/components/common/DateRangePicker';

describe('Empirical Adversarial Challenge Suite: Core Shared Components', () => {
  // Suppress expected console.error during deliberate error-boundary / crash tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // 1. RadialGauge Adversarial Boundaries
  // =========================================================================
  describe('RadialGauge Boundary & Degenerate Input Tests', () => {
    it('handles exact minimum boundary value (0.0)', () => {
      render(
        <RadialGauge
          value={0.0}
          min={0.0}
          max={3.0}
          unit="m"
          title="Min Bound Test"
        />
      );
      expect(screen.getByText('0.00')).toBeInTheDocument();
      expect(screen.getByText('0.0 m')).toBeInTheDocument();
      expect(screen.getByText('3.0 m')).toBeInTheDocument();
    });

    it('handles exact maximum boundary value (3.0)', () => {
      render(
        <RadialGauge
          value={3.0}
          min={0.0}
          max={3.0}
          unit="m"
          title="Max Bound Test"
        />
      );
      expect(screen.getByText('3.00')).toBeInTheDocument();
    });

    it('clamps extreme negative value (-5.0) to min without crashing or math distortion', () => {
      const { container } = render(
        <RadialGauge
          value={-5.0}
          min={0.0}
          max={3.5}
          unit="m"
          title="Negative Input Test"
        />
      );
      // Value text should display the actual negative value
      expect(screen.getByText('-5.00')).toBeInTheDocument();
      
      // Progress arc and needle should not have NaN or Infinite coordinates
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
      const needle = lines[0];
      const x2 = parseFloat(needle.getAttribute('x2') || '0');
      const y2 = parseFloat(needle.getAttribute('y2') || '0');
      expect(Number.isFinite(x2)).toBe(true);
      expect(Number.isFinite(y2)).toBe(true);
      // For min value, needle angle is Math.PI, so x2 = 100 + 65*(-1) = 35, y2 = 100
      expect(Math.round(x2)).toBe(35);
      expect(Math.round(y2)).toBe(100);
    });

    it('clamps extreme high value (10.0) exceeding max (3.5) without overflowing geometry', () => {
      const { container } = render(
        <RadialGauge
          value={10.0}
          min={0.0}
          max={3.5}
          unit="m"
          title="High Input Test"
        />
      );
      expect(screen.getByText('10.00')).toBeInTheDocument();

      const needle = container.querySelector('line');
      expect(needle).toBeTruthy();
      const x2 = parseFloat(needle?.getAttribute('x2') || '0');
      const y2 = parseFloat(needle?.getAttribute('y2') || '0');
      expect(Number.isFinite(x2)).toBe(true);
      expect(Number.isFinite(y2)).toBe(true);
      // For max clamped value, angle is 0, so x2 = 100 + 65*(1) = 165, y2 = 100
      expect(Math.round(x2)).toBe(165);
      expect(Math.round(y2)).toBe(100);
    });

    it('handles negative domain bounds correctly (e.g. min: -10, max: -2, value: -5)', () => {
      const { container } = render(
        <RadialGauge
          value={-5.0}
          min={-10.0}
          max={-2.0}
          unit="m"
          title="Negative Range Test"
        />
      );
      expect(screen.getByText('-5.00')).toBeInTheDocument();
      expect(screen.getByText('-10.0 m')).toBeInTheDocument();
      expect(screen.getByText('-2.0 m')).toBeInTheDocument();

      const needle = container.querySelector('line');
      const x2 = parseFloat(needle?.getAttribute('x2') || '0');
      const y2 = parseFloat(needle?.getAttribute('y2') || '0');
      expect(Number.isFinite(x2)).toBe(true);
      expect(Number.isFinite(y2)).toBe(true);
      // -5 is between -10 and -2: ratio = (-5 - -10) / (-2 - -10) = 5/8 = 0.625
      // needle should be strictly between 35 and 165
      expect(x2).toBeGreaterThan(35);
      expect(x2).toBeLessThan(165);
    });

    it('safely handles zero-width bounds (min === max) without division by zero', () => {
      const { container } = render(
        <RadialGauge
          value={3.5}
          min={3.5}
          max={3.5}
          unit="m"
          title="Zero Width Bounds"
        />
      );
      expect(screen.getByText('3.50')).toBeInTheDocument();
      const needle = container.querySelector('line');
      const x2 = parseFloat(needle?.getAttribute('x2') || '0');
      const y2 = parseFloat(needle?.getAttribute('y2') || '0');
      // When min === max, ratio must evaluate to 0, not NaN or Infinity
      expect(Number.isFinite(x2)).toBe(true);
      expect(Number.isFinite(y2)).toBe(true);
      expect(x2).not.toBeNaN();
      expect(y2).not.toBeNaN();
    });

    it('handles inverted bounds (min > max) without math explosion', () => {
      const { container } = render(
        <RadialGauge
          value={2.0}
          min={5.0}
          max={1.0}
          unit="m"
          title="Inverted Bounds"
        />
      );
      expect(screen.getByText('2.00')).toBeInTheDocument();
      const needle = container.querySelector('line');
      const x2 = needle?.getAttribute('x2');
      expect(x2).not.toBe('Infinity');
      expect(x2).not.toBe('-Infinity');
    });

    it('renders with NaN without unhandled runtime crash', () => {
      // In JavaScript, passing NaN as value
      const { container } = render(
        <RadialGauge
          value={NaN}
          min={0.0}
          max={3.5}
          unit="m"
          title="NaN Value Test"
        />
      );
      expect(screen.getByText('NaN')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('evaluates behavior when value is undefined or null', () => {
      // Direct empirical test: does value.toFixed(2) crash when value is undefined?
      expect(() => {
        render(
          <RadialGauge
            value={undefined as any}
            min={0.0}
            max={3.5}
            unit="m"
          />
        );
      }).toThrow(/Cannot read properties of undefined|toFixed/);

      // Direct empirical test: does value.toFixed(2) crash when value is null?
      expect(() => {
        render(
          <RadialGauge
            value={null as any}
            min={0.0}
            max={3.5}
            unit="m"
          />
        );
      }).toThrow(/Cannot read properties of null|toFixed/);
    });
  });

  // =========================================================================
  // 2. MetricCard Adversarial Inputs
  // =========================================================================
  describe('MetricCard Adversarial Stress Tests', () => {
    it('handles extreme text lengths without layout breakdown or crashing', () => {
      const extremeTitle = 'A'.repeat(500);
      const extremeSubtitle = 'B'.repeat(1000);
      const extremeValue = '9'.repeat(120);

      render(
        <MetricCard
          title={extremeTitle}
          subtitle={extremeSubtitle}
          value={extremeValue}
          unit="very-long-custom-unit-label"
          variant="charcoal"
        />
      );

      expect(screen.getByText(extremeTitle)).toBeInTheDocument();
      expect(screen.getByText(extremeSubtitle)).toBeInTheDocument();
      expect(screen.getByText(extremeValue)).toBeInTheDocument();
      expect(screen.getByText('very-long-custom-unit-label')).toBeInTheDocument();
    });

    it('handles undefined unit and null value gracefully', () => {
      render(
        <MetricCard
          title="Missing Properties"
          value={null as any}
          unit={undefined}
          variant="surface"
        />
      );
      expect(screen.getByText('Missing Properties')).toBeInTheDocument();
      // Unit container should not be rendered
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    });

    it('handles missing or incomplete delta properties gracefully', () => {
      const { rerender } = render(
        <MetricCard
          title="Incomplete Delta"
          value={42}
          delta={{} as any}
        />
      );
      expect(screen.getByText('Incomplete Delta')).toBeInTheDocument();

      // Delta with only text
      rerender(
        <MetricCard
          title="Incomplete Delta"
          value={42}
          delta={{ text: '+5% surge' } as any}
        />
      );
      expect(screen.getByText('+5% surge')).toBeInTheDocument();

      // Delta with only direction but missing text
      rerender(
        <MetricCard
          title="Incomplete Delta"
          value={42}
          delta={{ direction: 'up' } as any}
        />
      );
      expect(screen.getByText('Incomplete Delta')).toBeInTheDocument();
    });

    it('handles incomplete trend properties gracefully', () => {
      const { rerender } = render(
        <MetricCard
          title="Trend Test"
          value={100}
          trend={{} as any}
        />
      );
      expect(screen.getByText('Trend Test')).toBeInTheDocument();

      rerender(
        <MetricCard
          title="Trend Test"
          value={100}
          trend={{ value: '+0.12 m/hr' }}
        />
      );
      expect(screen.getByText('+0.12 m/hr')).toBeInTheDocument();
    });

    it('survives rapid variant switching across all variants and unknown strings', () => {
      const variants = ['charcoal', 'surface', 'mint', 'lavender', 'unknown_variant', ''] as const;

      const TestHarness = () => {
        const [curr, setCurr] = useState(0);
        return (
          <div>
            <button data-testid="switch-btn" onClick={() => setCurr((c) => (c + 1) % variants.length)}>
              Switch
            </button>
            <MetricCard
              title="Variant Stress"
              value={curr}
              variant={variants[curr] as any}
              data-testid="stress-card"
            />
          </div>
        );
      };

      render(<TestHarness />);
      const btn = screen.getByTestId('switch-btn');

      // Cycle rapidly through all variants multiple times
      for (let i = 0; i < variants.length * 3; i++) {
        act(() => {
          fireEvent.click(btn);
        });
      }

      expect(screen.getByTestId('stress-card')).toBeInTheDocument();
    });

    it('handles empty and single-value sparklineData without SVG path errors', () => {
      const { rerender, container } = render(
        <MetricCard
          title="Sparkline Test"
          value={12}
          sparklineData={[]}
        />
      );
      // Empty array: no sparkline rendered
      expect(screen.getByText('Sparkline Test')).toBeInTheDocument();

      // Single point
      rerender(
        <MetricCard
          title="Sparkline Test"
          value={12}
          sparklineData={[42]}
        />
      );
      expect(screen.getByText('Sparkline Test')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3. Badge Adversarial Inputs
  // =========================================================================
  describe('Badge Robustness & Fallback Tests', () => {
    it('safely handles unknown and arbitrary variant strings with neutral fallback', () => {
      render(
        <Badge variant={'completely_unrecognized_variant' as any}>
          Custom Text
        </Badge>
      );
      const textSpan = screen.getByText('Custom Text');
      expect(textSpan).toBeInTheDocument();
      // Should inherit neutral styling (bg-[#EAEFEC] border-[#D9DEDA])
      const badgeRoot = screen.getByTestId('badge');
      expect(badgeRoot.className).toContain('bg-[#EAEFEC]');
    });

    it('handles empty strings and missing children/label props without throwing', () => {
      const { container: c1 } = render(<Badge label="" />);
      expect(c1.querySelector('span')).toBeInTheDocument();

      const { container: c2 } = render(<Badge label={undefined} children={undefined} />);
      expect(c2.querySelector('span')).toBeInTheDocument();
    });

    it('handles withDot={false} cleanly without dot span in DOM', () => {
      const { container } = render(
        <Badge variant="normal" withDot={false}>
          No Dot
        </Badge>
      );
      expect(screen.getByText('No Dot')).toBeInTheDocument();
      // When withDot is false, dot element (w-1.5 h-1.5) must not be rendered
      const dot = container.querySelector('.w-1\\.5');
      expect(dot).toBeNull();
    });

    it('survives rapid re-renders and property mutations', () => {
      const variants: any[] = ['normal', 'elevated', 'low_tide', 'maintenance', 'high', 'moderate', 'low', 'open', 'resolved', 'invalid'];
      
      const ReRenderHarness = () => {
        const [index, setIndex] = useState(0);
        return (
          <div>
            <button data-testid="badge-next" onClick={() => setIndex((i) => (i + 1) % variants.length)}>
              Next
            </button>
            <Badge variant={variants[index]}>Variant {index}</Badge>
          </div>
        );
      };

      render(<ReRenderHarness />);
      const btn = screen.getByTestId('badge-next');

      for (let i = 0; i < 50; i++) {
        act(() => {
          fireEvent.click(btn);
        });
      }

      expect(screen.getByText(/Variant/)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. Button State, Loading & Double-Click Tests
  // =========================================================================
  describe('Button Behavioral & Interaction Tests', () => {
    it('prevents click events when disabled={true}', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Action
        </Button>
      );
      const btn = screen.getByText('Disabled Action').closest('button')!;
      expect(btn).toBeDisabled();

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders spinner and prevents clicks when isLoading={true}', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Button isLoading onClick={handleClick}>
          Loading Action
        </Button>
      );
      const btn = screen.getByText('Loading Action').closest('button')!;
      expect(btn).toBeDisabled();
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles rapid double-clicks accurately', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick}>
          Rapid Click
        </Button>
      );
      const btn = screen.getByText('Rapid Click').closest('button')!;

      // Fire 5 rapid clicks
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);

      expect(handleClick).toHaveBeenCalledTimes(5);
    });

    it('renders icon-only variant with appropriate square aspect ratio', () => {
      render(
        <Button
          variant="icon"
          icon={<span data-testid="custom-icon">★</span>}
          aria-label="Star Button"
        />
      );
      const btn = screen.getByLabelText('Star Button');
      expect(btn).toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(btn.className).toContain('aspect-square');
    });

    it('falls back to secondary variant on unknown variant', () => {
      render(
        <Button variant={'alien_variant' as any}>
          Fallback Variant
        </Button>
      );
      const btn = screen.getByText('Fallback Variant').closest('button')!;
      expect(btn.className).toContain('bg-[#F7F9F6]');
    });
  });

  // =========================================================================
  // 5. Dropdown & DateRangePicker Adversarial Inputs
  // =========================================================================
  describe('Dropdown & DateRangePicker Stress Tests', () => {
    it('handles completely empty options array without crashing', () => {
      render(
        <Dropdown
          options={[]}
          value=""
          onChange={() => {}}
          placeholder="No items available"
        />
      );
      expect(screen.getByText('No items available')).toBeInTheDocument();

      // Open popover
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Popover should be open with 0 options and no crash
      const popover = screen.getByRole('listbox');
      expect(popover).toBeInTheDocument();
      expect(popover.querySelectorAll('[role="option"]').length).toBe(0);
    });

    it('evaluates behavior when options is undefined or null', () => {
      expect(() => {
        render(
          <Dropdown
            options={undefined as any}
            value=""
            onChange={() => {}}
          />
        );
      }).toThrow(/Cannot read properties of undefined|map/);
    });

    it('handles selection of a missing key cleanly without crashing', () => {
      const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
      ];
      render(
        <Dropdown
          options={options}
          value="nonexistent_key_999"
          onChange={() => {}}
          placeholder="Select Station..."
        />
      );
      // When key does not exist, it should gracefully display the placeholder
      expect(screen.getByText('Select Station...')).toBeInTheDocument();
    });

    it('closes popover when clicking outside the dropdown container', () => {
      render(
        <div>
          <Dropdown
            options={['Alpha', 'Beta', 'Gamma']}
            value="Alpha"
            onChange={() => {}}
          />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      const trigger = screen.getByText('Alpha').closest('button')!;
      // Open dropdown
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside-element'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('survives rapid opening and closing cycles', () => {
      render(
        <Dropdown
          options={['Option A', 'Option B']}
          value="Option A"
          onChange={() => {}}
        />
      );
      const trigger = screen.getByText('Option A').closest('button')!;

      // Rapidly toggle 20 times
      for (let i = 0; i < 20; i++) {
        fireEvent.click(trigger);
      }

      // Final state: even number of clicks (20) should leave it closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('supports string array and object array options interchangeably', () => {
      const handleChange = vi.fn();
      render(
        <Dropdown
          options={['StringOpt', { value: 'ObjOpt', label: 'Object Option', subtitle: 'Desc' }]}
          value="StringOpt"
          onChange={handleChange}
        />
      );
      expect(screen.getByText('StringOpt')).toBeInTheDocument();

      // Open and click Object Option
      fireEvent.click(screen.getByText('StringOpt').closest('button')!);
      const objOptBtn = screen.getByText('Object Option');
      expect(objOptBtn).toBeInTheDocument();
      expect(screen.getByText('Desc')).toBeInTheDocument();

      fireEvent.click(objOptBtn);
      expect(handleChange).toHaveBeenCalledWith('ObjOpt');
    });

    it('DateRangePicker falls back to default 30d preset on unknown value', () => {
      render(
        <DateRangePicker
          value="unknown_range_code"
          onChange={() => {}}
        />
      );
      // Default fallback in DateRangePicker is PRESET_RANGES[2] which is "Last 30 Days"
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('DateRangePicker closes when clicking outside', () => {
      render(
        <div>
          <DateRangePicker
            value="7d"
            onChange={() => {}}
          />
          <div data-testid="calendar-outside">Outside Canvas</div>
        </div>
      );
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument();

      // Open picker
      fireEvent.click(screen.getByText('Last 7 Days').closest('button')!);
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('calendar-outside'));
      expect(screen.queryByText('Last 24 Hours')).not.toBeInTheDocument();
    });

    it('DateRangePicker fires onChange with exact range key when preset is selected', () => {
      const handleChange = vi.fn();
      render(
        <DateRangePicker
          value="30d"
          onChange={handleChange}
        />
      );
      fireEvent.click(screen.getByText('Last 30 Days').closest('button')!);

      const option90d = screen.getByText('Last 90 Days');
      fireEvent.click(option90d);

      expect(handleChange).toHaveBeenCalledWith('90d');
      // Picker should close after selection
      expect(screen.queryByText('Last 24 Hours')).not.toBeInTheDocument();
    });
  });
});
