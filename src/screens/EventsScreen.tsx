import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Check,
  Edit3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatWaterLevel } from '@/utils/formatUnit';

export const EventsScreen: React.FC = () => {
  const { resolveEvent } = useTideDataStore();
  const { settings } = useSettingsStore();
  const unitSetting = settings.waterLevelUnit;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  const [noteText, setNoteText] = useState(
    'Likely wind-driven setup. No operational impact observed.'
  );
  const [isEditingNote, setIsEditingNote] = useState(false);

  const eventList = [
    {
      id: 'ev-1',
      title: 'Elevated water level',
      station: 'Harbor Point',
      time: 'Nov 14, 14:26',
      delta: '+0.42 m',
      status: 'Open',
      severity: 'High',
      variant: 'mint',
      before: '2.31 m',
      during: '2.73 m',
      after: '2.46 m',
      context:
        'A rapid rise of +0.42 m (≈ 18% above the expected level) occurred at Harbor Point, peaking at 14:26. Levels began returning toward normal about 30 minutes later.',
    },
    {
      id: 'ev-2',
      title: 'Lower-than-expected tide',
      station: 'Bayview Inlet',
      time: 'Nov 13, 20:47',
      delta: '-0.36 m',
      status: 'Open',
      severity: 'Moderate',
      variant: 'lavender',
      before: '1.25 m',
      during: '0.89 m',
      after: '1.10 m',
      context:
        'Water level depressed by strong offshore wind forcing, reaching -0.36 m below predicted astronomical baseline.',
    },
    {
      id: 'ev-3',
      title: 'Rapid water-level rise',
      station: 'East Jetty',
      time: 'Nov 12, 08:15',
      delta: '+0.51 m',
      status: 'Resolved',
      severity: 'High',
      variant: 'mint',
      before: '1.80 m',
      during: '2.31 m',
      after: '2.05 m',
      context:
        'Steep rise rate of +0.34 m/hr detected across 45-minute window preceding high tide crest.',
    },
    {
      id: 'ev-4',
      title: 'Lower-than-expected tide',
      station: 'Harbor Point',
      time: 'Nov 10, 03:15',
      delta: '-0.28 m',
      status: 'Resolved',
      severity: 'Moderate',
      variant: 'lavender',
      before: '1.15 m',
      during: '0.87 m',
      after: '1.02 m',
      context: 'Atmospheric high pressure trough resulting in low tide depression.',
    },
    {
      id: 'ev-5',
      title: 'Elevated water level',
      station: 'North Spit',
      time: 'Nov 8, 18:09',
      delta: '+0.47 m',
      status: 'Resolved',
      severity: 'High',
      variant: 'mint',
      before: '2.10 m',
      during: '2.57 m',
      after: '2.30 m',
      context: 'Wind setup elevated residual sustained over 2 consecutive cycles.',
    },
    {
      id: 'ev-6',
      title: 'Elevated water level',
      station: 'Bayview Inlet',
      time: 'Nov 6, 09:36',
      delta: '+0.39 m',
      status: 'Resolved',
      severity: 'High',
      variant: 'mint',
      before: '1.95 m',
      during: '2.34 m',
      after: '2.12 m',
      context: 'Mild swell group coinciding with lunar perigean tide.',
    },
    {
      id: 'ev-7',
      title: 'Lower-than-expected tide',
      station: 'East Jetty',
      time: 'Nov 4, 22:17',
      delta: '-0.33 m',
      status: 'Resolved',
      severity: 'Moderate',
      variant: 'lavender',
      before: '1.30 m',
      during: '0.97 m',
      after: '1.18 m',
      context: 'Offshore gale causing temporary bay depression.',
    },
    {
      id: 'ev-8',
      title: 'Elevated water level',
      station: 'Harbor Point',
      time: 'Nov 2, 11:08',
      delta: '+0.41 m',
      status: 'Resolved',
      severity: 'High',
      variant: 'mint',
      before: '2.20 m',
      during: '2.61 m',
      after: '2.38 m',
      context: 'Frontal boundary passage with sudden barometric pressure drop.',
    },
  ];

  const currentEvent = eventList[selectedEventIndex] || eventList[0];

  // Simulated 6-hour event hydrograph
  const eventTimeSeries = [
    { time: '12:00', level: 2.22 },
    { time: '13:00', level: 2.28 },
    { time: '13:30', level: 2.35 },
    { time: '14:00', level: 2.50 },
    { time: '14:26', level: 2.73, isPeak: true },
    { time: '15:00', level: 2.45 },
    { time: '16:00', level: 2.32 },
    { time: '17:00', level: 2.25 },
  ];

  return (
    <div data-testid="screen-events" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Event Summary & Detected Events List (5 cols / ~42%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Card: Event Summary (Charcoal Card) */}
          <div className="bg-[#242424] text-white rounded-[28px] p-6 border border-[#383838] shadow-panel flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Event Summary
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Last 30 days
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between pt-2">
              <div className="flex items-baseline gap-6">
                <div>
                  <div className="text-4xl font-black font-sans text-white tracking-tight">
                    24
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Total events
                  </div>
                </div>

                <div className="border-l border-[#383838] pl-5">
                  <div className="text-2xl font-black font-sans text-[#68DD79]">
                    16
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Resolved
                  </div>
                </div>

                <div className="border-l border-[#383838] pl-5">
                  <div className="text-2xl font-black font-sans text-[#C5A8F8]">
                    8
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Open
                  </div>
                </div>
              </div>

              {/* Monthly Stacked Bars */}
              <div className="flex items-end gap-2.5">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-[#9CA3AF]">Sep</span>
                  <div className="w-8 h-14 rounded-lg overflow-hidden flex flex-col justify-end bg-[#333333]">
                    <div className="h-6 bg-[#A5F5A6]" />
                    <div className="h-8 bg-[#C5A8F8]" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-[#9CA3AF]">Oct</span>
                  <div className="w-8 h-20 rounded-lg overflow-hidden flex flex-col justify-end bg-[#333333]">
                    <div className="h-10 bg-[#A5F5A6]" />
                    <div className="h-10 bg-[#C5A8F8]" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-[#9CA3AF]">Nov</span>
                  <div className="w-8 h-24 rounded-lg overflow-hidden flex flex-col justify-end bg-[#333333]">
                    <div className="h-14 bg-[#A5F5A6]" />
                    <div className="h-10 bg-[#C5A8F8]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Detected Events List */}
          <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-primary-text leading-tight">
                Detected Events
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                24 events in the last 30 days
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-border rounded-full text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:ring-1 focus:ring-mint"
              />
            </div>

            {/* Event Items */}
            <div className="space-y-2">
              {eventList.map((ev, index) => {
                const isSelected = selectedEventIndex === index;
                const isMint = ev.variant === 'mint';

                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEventIndex(index)}
                    className={`w-full text-left p-3 rounded-20 border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#DCFADC] border-2 border-[#68DD79] shadow-xs'
                        : 'bg-surface hover:bg-surface-muted/60 border-border text-primary-text'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                          isMint
                            ? 'bg-[#DCFADC] text-[#227C34]'
                            : 'bg-[#EBE0FE] text-[#784FD8]'
                        }`}
                      >
                        {isMint ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#171A18] truncate leading-tight">
                          {ev.title}
                        </div>
                        <div className="text-xs text-secondary-text truncate mt-0.5">
                          {ev.station} • {ev.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-bold text-xs font-mono text-[#171A18]">
                        {ev.delta}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          ev.status === 'Open'
                            ? 'bg-[#DCFADC] text-[#156024]'
                            : 'bg-[#F3F4F6] text-[#6B7280]'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Event Details (7 cols / ~58%) */}
        <div className="lg:col-span-7 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div>
            {/* Header: Title, Station, Severity */}
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    currentEvent.variant === 'mint'
                      ? 'bg-[#DCFADC] text-[#227C34]'
                      : 'bg-[#EBE0FE] text-[#784FD8]'
                  }`}
                >
                  {currentEvent.variant === 'mint' ? (
                    <ArrowUpRight className="w-6 h-6" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text leading-tight">
                    {currentEvent.title}
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    {currentEvent.station} • {currentEvent.time}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBE0FE] text-[#784FD8] flex items-center gap-1.5">
                <span>000</span>
                <span>{currentEvent.severity}</span>
              </span>
            </div>

            {/* Event Time Series Chart */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-text">
                  Event Time Series
                </span>
                <span className="text-xs text-secondary-text">
                  Water level at {currentEvent.station}
                </span>
              </div>

              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eventTimeSeries} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eventLavender" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C5A8F8" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#C5A8F8" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F3F1" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#737A75"
                      tick={{ fill: '#737A75', fontSize: 11 }}
                      axisLine={{ stroke: '#D9DEDA' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[2.0, 2.8]}
                      ticks={[2.0, 2.2, 2.4, 2.6, 2.8]}
                      stroke="#737A75"
                      tick={{ fill: '#737A75', fontSize: 11 }}
                      axisLine={{ stroke: '#D9DEDA' }}
                      tickLine={false}
                      unit="m"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-border rounded-xl p-2.5 shadow-panel text-xs">
                            <span className="font-bold text-primary-text">{d.time}: </span>
                            <span className="font-mono text-[#784FD8] font-bold">{d.level} m</span>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="level"
                      stroke="#8B64DF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#eventLavender)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Peak Callout Badge */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#EBE0FE] border border-[#C5A8F8] text-xs font-bold text-[#784FD8] shadow-xs">
                  14:26 {currentEvent.delta}
                </div>
              </div>
            </div>

            {/* 3 Progression Cards (Before, During Peak, After) */}
            <div className="grid grid-cols-3 gap-3 my-5">
              {/* Before */}
              <div className="p-3.5 rounded-[20px] bg-surface-muted border border-border text-center">
                <span className="text-xs font-semibold text-secondary-text block">
                  Before
                </span>
                <span className="text-[11px] text-secondary-text block">13:56</span>
                <div className="text-xl font-black font-sans text-primary-text mt-1">
                  {currentEvent.before}
                </div>
              </div>

              {/* During Peak (Lavender card) */}
              <div className="p-3.5 rounded-[20px] bg-[#EBE0FE] text-center shadow-xs">
                <span className="text-xs font-bold text-[#784FD8] block">
                  During (Peak)
                </span>
                <span className="text-[11px] text-[#784FD8]/80 block">14:26</span>
                <div className="text-xl font-black font-sans text-[#784FD8] mt-1">
                  {currentEvent.during}
                </div>
              </div>

              {/* After */}
              <div className="p-3.5 rounded-[20px] bg-surface-muted border border-border text-center">
                <span className="text-xs font-semibold text-secondary-text block">
                  After
                </span>
                <span className="text-[11px] text-secondary-text block">14:56</span>
                <div className="text-xl font-black font-sans text-primary-text mt-1">
                  {currentEvent.after}
                </div>
              </div>
            </div>

            {/* Context Box */}
            <div className="mb-4">
              <span className="text-xs font-bold text-primary-text block mb-1">
                Context
              </span>
              <p className="text-xs text-secondary-text leading-relaxed">
                {currentEvent.context}
              </p>
            </div>

            {/* Notes Box */}
            <div>
              <span className="text-xs font-bold text-primary-text block mb-1">
                Notes
              </span>
              <div className="p-3.5 rounded-[20px] bg-[#F3EEFD] border border-[#E0D4FC] text-xs text-[#784FD8] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>{noteText}</span>
                </div>
                <button
                  onClick={() => {
                    const newNote = prompt('Update operator note:', noteText);
                    if (newNote) setNoteText(newNote);
                  }}
                  className="text-xs font-bold text-[#784FD8] hover:underline shrink-0"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/80">
            {/* Status Dropdown */}
            <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-2 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-[#359D45]" />
              <span>{isResolved ? 'Resolved' : 'Open'}</span>
              <span className="text-[10px] text-secondary-text">⌄</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  const newNote = prompt('Add note to event:', '');
                  if (newNote) setNoteText(newNote);
                }}
                className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-surface-muted transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>

              <button
                onClick={() => setIsResolved(true)}
                className="px-4 py-2 rounded-full bg-[#171A18] text-white text-xs font-semibold hover:bg-black transition flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as Resolved</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsScreen;
