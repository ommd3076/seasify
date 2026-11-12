import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Layers,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RotateCcw,
  Check,
  Cpu,
  Zap,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';

export const PatternsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { navigateToAutomataLab } = useNavigationStore();

  const [coverageHorizon, setCoverageHorizon] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeDetectionsTab, setActiveDetectionsTab] = useState<'All' | 'Surge' | 'Oscillation' | 'Rate'>('All');
  const [selectedHourlyBar, setSelectedHourlyBar] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [recurrenceFilter, setRecurrenceFilter] = useState('All');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'type' | 'severity' | 'recurrence' | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic coverage calculation
  const coverageData = useMemo(() => {
    let base = coverageHorizon === '7d' ? 91.4 : coverageHorizon === '90d' ? 84.1 : 87.4;
    let delta =
      coverageHorizon === '7d'
        ? '+4.8 pp vs. prior 7 days'
        : coverageHorizon === '90d'
        ? '+1.6 pp vs. prior 90 days'
        : '+3.2 pp vs. prior 30 days';

    if (typeFilter !== 'All') {
      const typeMap: Record<string, { pct: number; delta: string }> = {
        Surge: { pct: 24.8, delta: '+2.1 pp (Surge share)' },
        Tide: { pct: 38.2, delta: '+1.4 pp (Tide share)' },
        Rate: { pct: 46.5, delta: '+3.0 pp (Rate share)' },
        Cyclic: { pct: 58.9, delta: '+4.2 pp (Cyclic share)' },
        Timing: { pct: 31.2, delta: '-0.8 pp (Timing share)' },
      };
      if (typeMap[typeFilter]) {
        base = typeMap[typeFilter].pct;
        delta = typeMap[typeFilter].delta;
      }
    }

    const p = Math.max(0.06, Math.min(0.97, base / 100));
    const endX = 100 - 85 * Math.cos(p * Math.PI);
    const endY = 100 - 85 * Math.sin(p * Math.PI);

    return {
      percent: base,
      delta,
      endX: endX.toFixed(1),
      endY: endY.toFixed(1),
    };
  }, [coverageHorizon, typeFilter]);

  const activeDetectionsList = [
    {
      id: 'elevated-surge-1',
      patternId: 'elevated-surge',
      name: 'Elevated Surge',
      category: 'Surge',
      station: 'Fort Point, SF',
      stationId: '9414290',
      severity: 'High',
      variant: 'mint',
      stateName: 'State q3: Surge Peak Confirmed',
      progress: 80,
      confidence: '98.2%',
      duration: '14m 20s active',
      reading: '+0.51 m above MHHW',
    },
    {
      id: 'repeated-oscillation-1',
      patternId: 'repeated-oscillation',
      name: 'Repeated Oscillation',
      category: 'Oscillation',
      station: 'Monterey, CA',
      stationId: '9413450',
      severity: 'Low',
      variant: 'lavender',
      stateName: 'State q2: Harmonic Resonance (2/3 cycles)',
      progress: 66,
      confidence: '92.4%',
      duration: '42m 10s active',
      reading: '3.4 cph resonance',
    },
    {
      id: 'rapid-rise-1',
      patternId: 'rapid-rise',
      name: 'Rapid Rise',
      category: 'Rate',
      station: 'San Francisco, CA',
      stationId: '9414290',
      severity: 'High',
      variant: 'mint',
      stateName: 'State q4: Gradient Exceeded',
      progress: 90,
      confidence: '95.1%',
      duration: '8m 45s active',
      reading: '+0.42 m/h gradient',
    },
    {
      id: 'delayed-high-tide-1',
      patternId: 'delayed-high-tide',
      name: 'Delayed High Tide',
      category: 'Surge',
      station: 'Port San Luis, CA',
      stationId: '9412110',
      severity: 'Moderate',
      variant: 'lavender',
      stateName: 'State q2: Phase Lag Tracking',
      progress: 60,
      confidence: '88.7%',
      duration: '25m 00s active',
      reading: '+34 min phase shift',
    },
    {
      id: 'seiche-wave-1',
      patternId: 'repeated-oscillation',
      name: 'Seiche Wave Group',
      category: 'Oscillation',
      station: 'Crescent City, CA',
      stationId: '9419750',
      severity: 'Moderate',
      variant: 'mint',
      stateName: 'State q3: Multi-Node Resonance',
      progress: 75,
      confidence: '93.0%',
      duration: '19m 30s active',
      reading: '22 min cycle period',
    },
  ];

  const filteredActiveDetections = activeDetectionsList.filter((d) => {
    if (activeDetectionsTab === 'All') return true;
    return d.category === activeDetectionsTab;
  });

  const hourlyActivity = [
    { hour: '07:00', mint: 12, lav: 16, total: 28, label: 'T-9h' },
    { hour: '08:00', mint: 20, lav: 10, total: 30, label: 'T-8h' },
    { hour: '09:00', mint: 14, lav: 8, total: 22, label: 'T-7h' },
    { hour: '10:00', mint: 8, lav: 14, total: 22, label: 'T-6h' },
    { hour: '11:00', mint: 24, lav: 12, total: 36, label: 'T-5h' },
    { hour: '12:00', mint: 16, lav: 18, total: 34, label: 'T-4h' },
    { hour: '13:00', mint: 30, lav: 14, total: 44, label: 'T-3h' },
    { hour: '14:00', mint: 22, lav: 10, total: 32, label: 'T-2h' },
    { hour: '15:00', mint: 18, lav: 20, total: 38, label: 'T-1h' },
    { hour: '16:00', mint: 26, lav: 12, total: 38, label: 'Now' },
  ];

  const patterns = [
    {
      id: 'elevated-surge',
      name: 'Elevated Surge',
      category: 'Surge Event',
      type: 'Surge',
      description:
        'Abnormally high water level sustained above the expected range, often driven by coastal setup or storm influence.',
      severity: 'High',
      severityColor: 'bg-[#EBE0FE] text-[#784FD8]',
      recurrence: 'Occasional (≈ 8%)',
      recurrenceType: 'Occasional',
      previewVariant: 'mint-surge',
    },
    {
      id: 'lower-than-expected',
      name: 'Lower-than-Expected Tide',
      category: 'Tide Anomaly',
      type: 'Tide',
      description:
        'Water level falls below the predicted tide by a significant margin, commonly due to offshore winds or pressure shifts.',
      severity: 'Moderate',
      severityColor: 'bg-[#DCFADC] text-[#156024]',
      recurrence: 'Occasional (≈ 11%)',
      recurrenceType: 'Occasional',
      previewVariant: 'lavender-trough',
    },
    {
      id: 'rapid-rise',
      name: 'Rapid Rise',
      category: 'Rate Change',
      type: 'Rate',
      description:
        'A fast, sustained increase in water level over a short period, often a precursor to high-tide or surge events.',
      severity: 'High',
      severityColor: 'bg-[#EBE0FE] text-[#784FD8]',
      recurrence: 'Frequent (≈ 18%)',
      recurrenceType: 'Frequent',
      previewVariant: 'mint-steep',
    },
    {
      id: 'delayed-high-tide',
      name: 'Delayed High Tide',
      category: 'Timing Shift',
      type: 'Timing',
      description:
        'High tide occurs later than predicted (typically > 30 min), indicating a phase shift in the tidal cycle.',
      severity: 'Moderate',
      severityColor: 'bg-[#DCFADC] text-[#156024]',
      recurrence: 'Occasional (≈ 9%)',
      recurrenceType: 'Occasional',
      previewVariant: 'lavender-delayed',
    },
    {
      id: 'repeated-oscillation',
      name: 'Repeated Oscillation',
      category: 'Cyclic Pattern',
      type: 'Cyclic',
      description:
        'Regular, higher-frequency oscillations in water level, often caused by harbor resonance or passing wave groups.',
      severity: 'Low',
      severityColor: 'bg-[#F3F4F6] text-[#4B5563]',
      recurrence: 'Frequent (≈ 34%)',
      recurrenceType: 'Frequent',
      previewVariant: 'mint-oscillation',
    },
  ];

  const filteredPatterns = patterns.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || p.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'All' || p.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesRecurrence = recurrenceFilter === 'All' || p.recurrenceType.toLowerCase() === recurrenceFilter.toLowerCase();

    return matchesSearch && matchesType && matchesSeverity && matchesRecurrence;
  });

  const handleInspectPattern = (patId: string) => {
    navigateToAutomataLab(patId);
    navigate('/pattern-engine');
  };

  return (
    <div data-testid="screen-patterns" className="space-y-6">
      {/* Top 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Pattern Coverage (Charcoal Card, 4 cols) */}
        <div className="lg:col-span-4 bg-[#242424] text-white rounded-[28px] p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[270px] hover:shadow-lg transition-all">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">
                Pattern Coverage
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Portion of time explained by known patterns
              </p>
            </div>

            {/* Interactive Horizon Switcher */}
            <div className="flex items-center gap-1 bg-[#171A18] p-1 rounded-full border border-[#383838] shrink-0">
              {(['7d', '30d', '90d'] as const).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setCoverageHorizon(hz)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    coverageHorizon === hz
                      ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {hz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Radial Semi-Circular Arc Gauge with live math */}
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="relative w-56 h-28 flex items-end justify-center overflow-visible">
              <svg className="w-56 h-28 overflow-visible" viewBox="0 0 200 100">
                <defs>
                  <pattern
                    id="patGaugeHatch"
                    width="6"
                    height="6"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#444444" strokeWidth="2" />
                  </pattern>
                </defs>

                {/* Right Hatched Arc */}
                <path
                  d={`M ${coverageData.endX} ${coverageData.endY} A 85 85 0 0 1 185 100`}
                  fill="none"
                  stroke="url(#patGaugeHatch)"
                  strokeWidth="18"
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />

                {/* Left Green Arc */}
                <path
                  d={`M 15 100 A 85 85 0 0 1 ${coverageData.endX} ${coverageData.endY}`}
                  fill="none"
                  stroke="#68DD79"
                  strokeWidth="18"
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />

                {/* Marker Dot */}
                <circle
                  cx={coverageData.endX}
                  cy={coverageData.endY}
                  r="5.5"
                  fill="#C5A8F8"
                  stroke="#242424"
                  strokeWidth="2.5"
                  className="transition-all duration-300 ease-out shadow-xs"
                />
              </svg>

              {/* Centered Value */}
              <div className="absolute bottom-1 text-center">
                <div className="text-3xl font-black text-white font-sans tracking-tight">
                  {coverageData.percent.toFixed(1)}%
                </div>
                <div className="text-[11px] font-semibold text-[#A5F5A6] flex items-center justify-center gap-1 mt-0.5">
                  <span>↗</span>
                  <span>{coverageData.delta}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Most Common Patterns (Surface Card, 4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[270px] hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-text leading-tight">
                Most Common Patterns
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                By occurrence (last 30 days)
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Row 1 */}
            <div
              onClick={() => handleInspectPattern('repeated-oscillation')}
              className="p-1.5 -m-1.5 rounded-xl hover:bg-[#EAEFEC] transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-primary-text mb-1">
                <span>Repeated oscillation</span>
                <span className="font-mono text-[#227C34]">34.2%</span>
              </div>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '34.2%' }} />
              </div>
            </div>

            {/* Row 2 */}
            <div
              onClick={() => handleInspectPattern('elevated-surge')}
              className="p-1.5 -m-1.5 rounded-xl hover:bg-[#EAEFEC] transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-primary-text mb-1">
                <span>Elevated surge</span>
                <span className="font-mono text-[#227C34]">21.3%</span>
              </div>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '21.3%' }} />
              </div>
            </div>

            {/* Row 3 */}
            <div
              onClick={() => handleInspectPattern('rapid-rise')}
              className="p-1.5 -m-1.5 rounded-xl hover:bg-[#EAEFEC] transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-primary-text mb-1">
                <span>Rapid rise</span>
                <span className="font-mono text-[#227C34]">18.6%</span>
              </div>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '18.6%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Automata Engine Telemetry (Surface Card, 4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[270px] hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0 shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Automata Engine
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Deterministic streaming health
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFADC] text-[#156024]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Active</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-surface-muted border border-border">
              <div className="text-xs text-secondary-text font-medium">Evaluation Speed</div>
              <div className="text-xl font-black font-sans text-primary-text mt-0.5">14.2k/s</div>
              <div className="text-[10px] text-[#227C34] font-semibold mt-0.5">Zero backpressure</div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-muted border border-border">
              <div className="text-xs text-secondary-text font-medium">Active Rules</div>
              <div className="text-xl font-black font-sans text-primary-text mt-0.5">14 DFAs</div>
              <div className="text-[10px] text-secondary-text font-medium mt-0.5">100% Deterministic</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs text-secondary-text">
            <span>False Positives: &lt; 0.28%</span>
            <button
              onClick={() => navigate('/pattern-engine')}
              className="font-bold text-[#784FD8] hover:underline flex items-center gap-1"
            >
              <span>Automata Lab</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* BIG ANALYTICS COMPONENT: Active Detections Live Center (12 cols) */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        {/* Component Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Active Detections & Automata Pipeline
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFADC] text-[#156024]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                  <span>5 Live</span>
                </span>
              </div>
              <p className="text-xs text-secondary-text mt-0.5">
                Deterministic finite automata streams continuously classifying live NOAA water-level telemetry
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-full border border-border shrink-0">
            {(['All', 'Surge', 'Oscillation', 'Rate'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDetectionsTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeDetectionsTab === tab
                    ? 'bg-[#171A18] text-white shadow-xs'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {tab === 'All' ? 'All (5)' : `${tab}s`}
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-border/70">
          <div className="p-3.5 rounded-2xl bg-surface-card border border-border">
            <div className="text-xs text-secondary-text font-medium">In-Flight Automata</div>
            <div className="text-2xl font-black font-sans text-primary-text mt-0.5">5 active</div>
            <div className="text-[11px] text-[#227C34] font-semibold mt-0.5">Across 4 NOAA gauges</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-card border border-border">
            <div className="text-xs text-secondary-text font-medium">Detection Velocity</div>
            <div className="text-2xl font-black font-sans text-primary-text mt-0.5">4.2 / hr</div>
            <div className="text-[11px] text-secondary-text font-medium mt-0.5">+14% vs. normal tide</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-card border border-border">
            <div className="text-xs text-secondary-text font-medium">Mean Fit Confidence</div>
            <div className="text-2xl font-black font-sans text-[#784FD8] mt-0.5">94.8%</div>
            <div className="text-[11px] text-secondary-text font-medium mt-0.5">Pattern likelihood score</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-card border border-border">
            <div className="text-xs text-secondary-text font-medium">Transition Latency</div>
            <div className="text-2xl font-black font-sans text-primary-text mt-0.5">1.2 ms</div>
            <div className="text-[11px] text-[#227C34] font-semibold mt-0.5">Real-time DFA execution</div>
          </div>
        </div>

        {/* Main Content: Left Active Stream Cards + Right Hourly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          {/* Left Column: Live Detection Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-primary-text">
                Live State Streams ({filteredActiveDetections.length})
              </span>
              <span className="text-[11px] text-secondary-text">
                Click any pattern to inspect state machine
              </span>
            </div>

            {filteredActiveDetections.map((det) => (
              <div
                key={det.id}
                onClick={() => handleInspectPattern(det.patternId)}
                className="p-4 rounded-[22px] bg-surface-card hover:bg-[#EAEFEC] border border-border transition-all hover:scale-[1.01] hover:shadow-xs cursor-pointer group flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        det.variant === 'mint'
                          ? 'bg-[#DCFADC] text-[#227C34]'
                          : 'bg-[#EBE0FE] text-[#784FD8]'
                      }`}
                    >
                      {det.variant === 'mint' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-primary-text leading-tight group-hover:text-charcoal">
                        {det.name}
                      </div>
                      <div className="text-xs text-secondary-text mt-0.5">
                        {det.station} • {det.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        det.severity === 'High'
                          ? 'bg-[#EBE0FE] text-[#784FD8]'
                          : det.severity === 'Moderate'
                          ? 'bg-[#DCFADC] text-[#156024]'
                          : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}
                    >
                      {det.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-primary-text">
                      {det.confidence}
                    </span>
                  </div>
                </div>

                {/* Progress bar towards final accepting state */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-secondary-text font-medium text-[11px]">
                      {det.stateName}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#171A18]">
                      {det.reading}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        det.variant === 'mint' ? 'bg-[#68DD79]' : 'bg-[#A78BFA]'
                      }`}
                      style={{ width: `${det.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Time-Series Detection Volume & Hourly Histogram (5 cols) */}
          <div className="lg:col-span-5 bg-surface-card rounded-[24px] p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-text">
                  Hourly Detection Volume
                </span>
                <span className="text-[11px] text-secondary-text">
                  Last 10 hours
                </span>
              </div>
              <p className="text-[11px] text-secondary-text leading-relaxed mb-4">
                Distribution of surge and oscillation matches. Hover over any bar to view hourly detections.
              </p>

              {/* Hourly interactive bars */}
              <div className="flex items-end gap-1.5 h-32 w-full pt-2 pb-1 border-b border-border/70">
                {hourlyActivity.map((bar, i) => {
                  const isSelected = selectedHourlyBar === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedHourlyBar(isSelected ? null : i)}
                      onMouseEnter={() => setSelectedHourlyBar(i)}
                      title={`${bar.hour} (${bar.label}): ${bar.total} matches`}
                      className={`flex-1 flex flex-col justify-end h-full transition-all cursor-pointer ${
                        isSelected ? 'scale-110 opacity-100' : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div
                        className="w-full bg-[#A5F5A6] rounded-t-md transition-all"
                        style={{ height: `${bar.mint * 2.2}px` }}
                      />
                      <div
                        className="w-full bg-[#C5A8F8] transition-all"
                        style={{ height: `${bar.lav * 2.2}px` }}
                      />
                      <span className="text-[9px] text-secondary-text text-center mt-1 select-none">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Callout box for selected hour */}
              <div className="mt-3.5 p-3 rounded-2xl bg-surface-muted border border-border text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-primary-text block">
                    {selectedHourlyBar !== null
                      ? `${hourlyActivity[selectedHourlyBar].hour} (${hourlyActivity[selectedHourlyBar].label})`
                      : 'Real-time Intensity: Peak at T-3h'}
                  </span>
                  <span className="text-[11px] text-secondary-text mt-0.5 block">
                    {selectedHourlyBar !== null
                      ? `${hourlyActivity[selectedHourlyBar].mint} Surges / ${hourlyActivity[selectedHourlyBar].lav} Oscillations`
                      : '44 matches observed during coastal high-water transition'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#A5F5A6]" />
                  <span className="text-[10px] text-secondary-text">Surge</span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C5A8F8] ml-1" />
                  <span className="text-[10px] text-secondary-text">Osc</span>
                </div>
              </div>
            </div>

            {/* Jump to Pattern Engine Button */}
            <button
              onClick={() => navigate('/pattern-engine')}
              className="mt-4 w-full py-2.5 px-4 rounded-full bg-[#171A18] text-white hover:bg-black transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Explore State Machines in Automata Lab</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Card: Pattern Library with Live Interactive Filters */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        {/* Filter Bar Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border/80">
          <div>
            <h3 className="text-xl font-bold text-primary-text leading-tight">
              Pattern Library
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Curated water-level patterns and event archetypes ({filteredPatterns.length} available)
            </p>
          </div>

          {/* Interactive Filter Pills & Search */}
          <div ref={filterRef} className="flex flex-wrap items-center gap-2.5 relative">
            {/* Type Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs ${
                  typeFilter !== 'All'
                    ? 'bg-[#A5F5A6] text-[#171A18] border-[#68DD79] font-bold'
                    : 'bg-surface-muted text-primary-text border-border hover:bg-[#EAEFEC]'
                }`}
              >
                <span>Type: {typeFilter}</span>
                <span className="text-[10px] text-secondary-text">⌄</span>
              </button>

              {openDropdown === 'type' && (
                <div className="absolute left-0 mt-1.5 w-36 rounded-2xl bg-white border border-border shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {['All', 'Surge', 'Tide', 'Rate', 'Timing', 'Cyclic'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTypeFilter(t);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-surface-muted transition ${
                        typeFilter === t ? 'font-bold text-[#156024] bg-[#DCFADC]' : 'text-primary-text'
                      }`}
                    >
                      <span>{t}</span>
                      {typeFilter === t && <Check className="w-3 h-3 text-[#156024]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'severity' ? null : 'severity')}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs ${
                  severityFilter !== 'All'
                    ? 'bg-[#A5F5A6] text-[#171A18] border-[#68DD79] font-bold'
                    : 'bg-surface-muted text-primary-text border-border hover:bg-[#EAEFEC]'
                }`}
              >
                <span>Severity: {severityFilter}</span>
                <span className="text-[10px] text-secondary-text">⌄</span>
              </button>

              {openDropdown === 'severity' && (
                <div className="absolute left-0 mt-1.5 w-36 rounded-2xl bg-white border border-border shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {['All', 'High', 'Moderate', 'Low'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSeverityFilter(s);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-surface-muted transition ${
                        severityFilter === s ? 'font-bold text-[#156024] bg-[#DCFADC]' : 'text-primary-text'
                      }`}
                    >
                      <span>{s}</span>
                      {severityFilter === s && <Check className="w-3 h-3 text-[#156024]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recurrence Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'recurrence' ? null : 'recurrence')}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs ${
                  recurrenceFilter !== 'All'
                    ? 'bg-[#A5F5A6] text-[#171A18] border-[#68DD79] font-bold'
                    : 'bg-surface-muted text-primary-text border-border hover:bg-[#EAEFEC]'
                }`}
              >
                <span>Recurrence: {recurrenceFilter}</span>
                <span className="text-[10px] text-secondary-text">⌄</span>
              </button>

              {openDropdown === 'recurrence' && (
                <div className="absolute left-0 mt-1.5 w-40 rounded-2xl bg-white border border-border shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {['All', 'Frequent', 'Occasional'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRecurrenceFilter(r);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-surface-muted transition ${
                        recurrenceFilter === r ? 'font-bold text-[#156024] bg-[#DCFADC]' : 'text-primary-text'
                      }`}
                    >
                      <span>{r}</span>
                      {recurrenceFilter === r && <Check className="w-3 h-3 text-[#156024]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters button if any active */}
            {(typeFilter !== 'All' || severityFilter !== 'All' || recurrenceFilter !== 'All') && (
              <button
                onClick={() => {
                  setTypeFilter('All');
                  setSeverityFilter('All');
                  setRecurrenceFilter('All');
                }}
                className="text-[11px] font-bold text-[#784FD8] hover:underline px-1 cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-secondary-text absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-full bg-surface-muted border border-border text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:ring-1 focus:ring-mint focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Pattern Rows with Interactive Hover & View Action */}
        <div className="space-y-3">
          {filteredPatterns.length > 0 ? (
            filteredPatterns.map((pat) => (
              <div
                key={pat.id}
                onClick={() => handleInspectPattern(pat.id)}
                className="p-4 rounded-[22px] bg-surface-card hover:bg-[#EAEFEC] border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-150 hover:scale-[1.01] hover:shadow-xs cursor-pointer group"
              >
                {/* Left Info: Icon & Names */}
                <div className="flex items-center gap-3 w-full md:w-56 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${
                      pat.type === 'Tide' || pat.type === 'Timing'
                        ? 'bg-[#EBE0FE] text-[#784FD8]'
                        : 'bg-[#DCFADC] text-[#227C34]'
                    }`}
                  >
                    {pat.type === 'Timing' ? (
                      <Clock className="w-5 h-5" />
                    ) : pat.type === 'Tide' ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : pat.type === 'Cyclic' ? (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                        <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                      </svg>
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-primary-text group-hover:text-charcoal leading-tight">
                      {pat.name}
                    </div>
                    <div className="text-xs text-secondary-text mt-0.5">
                      {pat.category}
                    </div>
                  </div>
                </div>

                {/* Middle Thumbnail Wave Preview */}
                <div
                  className={`w-full md:w-44 h-12 rounded-2xl p-2 shrink-0 flex items-center justify-center shadow-xs ${
                    pat.previewVariant.startsWith('mint') ? 'bg-[#DCFADC]' : 'bg-[#EBE0FE]'
                  }`}
                >
                  {pat.previewVariant === 'mint-surge' && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 140 32" fill="none">
                      <path
                        d="M 0 24 C 30 28, 60 20, 85 8 C 105 2, 120 18, 140 20 L 140 32 L 0 32 Z"
                        fill="rgba(34, 124, 52, 0.2)"
                      />
                      <path
                        d="M 0 24 C 30 28, 60 20, 85 8 C 105 2, 120 18, 140 20"
                        stroke="#227C34"
                        strokeWidth="2"
                      />
                      <circle cx="85" cy="8" r="3.5" fill="#C5A8F8" stroke="#227C34" strokeWidth="1.5" />
                    </svg>
                  )}
                  {pat.previewVariant === 'lavender-trough' && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 140 32" fill="none">
                      <path
                        d="M 0 10 C 30 10, 50 26, 75 26 C 100 26, 115 10, 140 10 L 140 32 L 0 32 Z"
                        fill="rgba(112, 60, 215, 0.2)"
                      />
                      <path
                        d="M 0 10 C 30 10, 50 26, 75 26 C 100 26, 115 10, 140 10"
                        stroke="#6B21A8"
                        strokeWidth="2"
                      />
                      <circle cx="75" cy="26" r="3.5" fill="#A5F5A6" stroke="#6B21A8" strokeWidth="1.5" />
                    </svg>
                  )}
                  {pat.previewVariant === 'mint-steep' && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 140 32" fill="none">
                      <path
                        d="M 0 26 C 40 26, 70 24, 100 10 C 115 4, 130 5, 140 5 L 140 32 L 0 32 Z"
                        fill="rgba(34, 124, 52, 0.2)"
                      />
                      <path
                        d="M 0 26 C 40 26, 70 24, 100 10 C 115 4, 130 5, 140 5"
                        stroke="#227C34"
                        strokeWidth="2"
                      />
                      <circle cx="120" cy="5" r="3.5" fill="#FFFFFF" stroke="#227C34" strokeWidth="1.5" />
                    </svg>
                  )}
                  {pat.previewVariant === 'lavender-delayed' && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 140 32" fill="none">
                      <path
                        d="M 0 24 C 20 24, 35 10, 50 10 C 65 10, 80 24, 100 24"
                        stroke="#9CA3AF"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <path
                        d="M 30 26 C 50 26, 70 8, 85 8 C 105 8, 120 24, 140 24 L 140 32 L 30 32 Z"
                        fill="rgba(112, 60, 215, 0.2)"
                      />
                      <path
                        d="M 30 26 C 50 26, 70 8, 85 8 C 105 8, 120 24, 140 24"
                        stroke="#6B21A8"
                        strokeWidth="2"
                      />
                      <circle cx="85" cy="8" r="3.5" fill="#A5F5A6" stroke="#6B21A8" strokeWidth="1.5" />
                    </svg>
                  )}
                  {pat.previewVariant === 'mint-oscillation' && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 140 32" fill="none">
                      <path
                        d="M 0 18 C 15 6, 25 30, 40 18 C 55 6, 65 30, 80 18 C 95 6, 105 30, 120 18 C 130 12, 135 15, 140 18 L 140 32 L 0 32 Z"
                        fill="rgba(34, 124, 52, 0.2)"
                      />
                      <path
                        d="M 0 18 C 15 6, 25 30, 40 18 C 55 6, 65 30, 80 18 C 95 6, 105 30, 120 18"
                        stroke="#227C34"
                        strokeWidth="2"
                      />
                      <circle cx="80" cy="18" r="3.5" fill="#FFFFFF" stroke="#227C34" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>

                {/* Description */}
                <div className="flex-1 text-xs text-secondary-text pr-2 leading-relaxed">
                  {pat.description}
                </div>

                {/* Severity & Recurrence Badges */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${pat.severityColor}`}>
                    <span>000</span>
                    <span>{pat.severity}</span>
                  </span>
                  <span className="text-[11px] text-secondary-text font-medium flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-secondary-text" />
                    <span>{pat.recurrence}</span>
                  </span>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectPattern(pat.id);
                  }}
                  className="px-4 py-2 rounded-full border border-border bg-white text-xs font-bold text-primary-text hover:bg-surface-muted hover:border-charcoal/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                >
                  <span>View</span>
                  <span>→</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-secondary-text bg-surface-muted rounded-24 border border-dashed border-border">
              No patterns matched the selected filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternsScreen;
