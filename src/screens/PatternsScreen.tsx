import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';

export const PatternsScreen: React.FC = () => {
  const { navigateToAutomataLab } = useNavigationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [recurrenceFilter, setRecurrenceFilter] = useState('All');

  const patterns = [
    {
      id: 'elevated-surge',
      name: 'Elevated Surge',
      category: 'Surge Event',
      type: 'surge',
      description:
        'Abnormally high water level sustained above the expected range, often driven by coastal setup or storm influence.',
      severity: 'High',
      severityColor: 'bg-[#EBE0FE] text-[#784FD8]',
      recurrence: 'Occasional (≈ 8%)',
      previewVariant: 'mint-surge',
    },
    {
      id: 'lower-than-expected',
      name: 'Lower-than-Expected Tide',
      category: 'Tide Anomaly',
      type: 'tide',
      description:
        'Water level falls below the predicted tide by a significant margin, commonly due to offshore winds or pressure shifts.',
      severity: 'Moderate',
      severityColor: 'bg-[#DCFADC] text-[#156024]',
      recurrence: 'Occasional (≈ 11%)',
      previewVariant: 'lavender-trough',
    },
    {
      id: 'rapid-rise',
      name: 'Rapid Rise',
      category: 'Rate Change',
      type: 'rate',
      description:
        'A fast, sustained increase in water level over a short period, often a precursor to high-tide or surge events.',
      severity: 'High',
      severityColor: 'bg-[#EBE0FE] text-[#784FD8]',
      recurrence: 'Frequent (≈ 18%)',
      previewVariant: 'mint-steep',
    },
    {
      id: 'delayed-high-tide',
      name: 'Delayed High Tide',
      category: 'Timing Shift',
      type: 'timing',
      description:
        'High tide occurs later than predicted (typically > 30 min), indicating a phase shift in the tidal cycle.',
      severity: 'Moderate',
      severityColor: 'bg-[#DCFADC] text-[#156024]',
      recurrence: 'Occasional (≈ 9%)',
      previewVariant: 'lavender-delayed',
    },
    {
      id: 'repeated-oscillation',
      name: 'Repeated Oscillation',
      category: 'Cyclic Pattern',
      type: 'cyclic',
      description:
        'Regular, higher-frequency oscillations in water level, often caused by harbor resonance or passing wave groups.',
      severity: 'Low',
      severityColor: 'bg-[#F3F4F6] text-[#4B5563]',
      recurrence: 'Frequent (≈ 34%)',
      previewVariant: 'mint-oscillation',
    },
  ];

  const filteredPatterns = patterns.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div data-testid="screen-patterns" className="space-y-6">
      {/* Top 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Pattern Coverage (Charcoal Card, 4 cols) */}
        <div className="lg:col-span-4 bg-[#242424] text-white rounded-[28px] p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[260px]">
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">
              Pattern Coverage
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Portion of time explained by known patterns
            </p>
          </div>

          {/* Radial Semi-Circular Arc Gauge */}
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
                  d="M 125 22 A 85 85 0 0 1 185 100"
                  fill="none"
                  stroke="url(#patGaugeHatch)"
                  strokeWidth="18"
                  strokeLinecap="round"
                />

                {/* Left Green Arc */}
                <path
                  d="M 15 100 A 85 85 0 0 1 125 22"
                  fill="none"
                  stroke="#68DD79"
                  strokeWidth="18"
                  strokeLinecap="round"
                />

                {/* Marker Dot */}
                <circle cx="125" cy="22" r="5" fill="#C5A8F8" stroke="#242424" strokeWidth="2" />
              </svg>

              {/* Centered Value */}
              <div className="absolute bottom-1 text-center">
                <div className="text-3xl font-black text-white font-sans tracking-tight">
                  87.4%
                </div>
                <div className="text-[11px] font-semibold text-[#A5F5A6] flex items-center justify-center gap-1 mt-0.5">
                  <span>↗</span>
                  <span>+3.2 pp vs. prior 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Detections (Surface Card, 4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-text leading-tight">
                Active Detections
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Patterns currently in progress
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl font-black font-sans text-primary-text tracking-tight">
                5
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFADC] text-[#156024]">
                Live
              </span>
            </div>

            {/* 10-bar stacked mini histogram (Mint / Lavender) */}
            <div className="flex items-end gap-1.5 h-14 w-full pt-1">
              {[
                { mint: 12, lav: 16 },
                { mint: 20, lav: 10 },
                { mint: 14, lav: 8 },
                { mint: 8, lav: 14 },
                { mint: 24, lav: 12 },
                { mint: 16, lav: 18 },
                { mint: 30, lav: 14 },
                { mint: 22, lav: 10 },
                { mint: 18, lav: 20 },
                { mint: 26, lav: 12 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-[#A5F5A6] rounded-t-md"
                    style={{ height: `${bar.mint}px` }}
                  />
                  <div
                    className="w-full bg-[#C5A8F8]"
                    style={{ height: `${bar.lav}px` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Most Common Patterns (Surface Card, 4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
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
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-primary-text mb-1">
                <span>Repeated oscillation</span>
                <span>34.2%</span>
              </div>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '34.2%' }} />
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-primary-text mb-1">
                <span>Elevated surge</span>
                <span>21.3%</span>
              </div>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '21.3%' }} />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-primary-text mb-1">
                <span>Rapid rise</span>
                <span>18.6%</span>
              </div>
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '18.6%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Pattern Library */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        {/* Filter Bar Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border/80">
          <div>
            <h3 className="text-xl font-bold text-primary-text leading-tight">
              Pattern Library
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Curated water-level patterns and event archetypes
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
              <span>Type: All</span>
              <span className="text-[10px] text-secondary-text">⌄</span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
              <span>Severity: All</span>
              <span className="text-[10px] text-secondary-text">⌄</span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
              <span>Recurrence: All</span>
              <span className="text-[10px] text-secondary-text">⌄</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-secondary-text absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-full bg-surface-muted border border-border text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:ring-1 focus:ring-mint"
              />
            </div>
          </div>
        </div>

        {/* 5 Pattern Rows */}
        <div className="space-y-3">
          {filteredPatterns.map((pat) => (
            <div
              key={pat.id}
              className="p-4 rounded-[22px] bg-surface-card hover:bg-surface-muted/50 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
            >
              {/* Left Info: Icon & Names */}
              <div className="flex items-center gap-3 w-full md:w-56 shrink-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    pat.type === 'tide' || pat.type === 'timing'
                      ? 'bg-[#EBE0FE] text-[#784FD8]'
                      : 'bg-[#DCFADC] text-[#227C34]'
                  }`}
                >
                  {pat.type === 'timing' ? (
                    <Clock className="w-5 h-5" />
                  ) : pat.type === 'tide' ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : pat.type === 'cyclic' ? (
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
                  <div className="text-sm font-bold text-primary-text leading-tight">
                    {pat.name}
                  </div>
                  <div className="text-xs text-secondary-text mt-0.5">
                    {pat.category}
                  </div>
                </div>
              </div>

              {/* Middle Thumbnail Wave Preview */}
              <div
                className={`w-full md:w-44 h-12 rounded-2xl p-2 shrink-0 flex items-center justify-center ${
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
                      d="M 0 18 C 15 6, 25 30, 40 18 C 55 6, 65 30, 80 18 C 95 6, 105 30, 120 18 C 130 12, 135 15, 140 18"
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
                onClick={() => navigateToAutomataLab(pat.id)}
                className="px-4 py-2 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-surface-muted transition flex items-center gap-1 shrink-0"
              >
                <span>View</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternsScreen;
