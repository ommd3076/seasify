import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useTideDataStore } from '@/stores/tideDataStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { ResidualChart } from '@/components/charts/ResidualChart';
import { AnomalyEvent } from '@/types/events';

export const EventsScreen: React.FC = () => {
  const { events, points, resolveEvent, addEventNote } = useTideDataStore();
  const { selectedEventId, setSelectedEventId } = useNavigationStore();

  const [activeEventId, setActiveEventId] = useState<string>(
    selectedEventId || (events.length > 0 ? events[0].id : '')
  );
  const [operatorNote, setOperatorNote] = useState<string>('');
  const [savedNoteSuccess, setSavedNoteSuccess] = useState<boolean>(false);

  // Fallback active event if none selected
  const activeEvent: AnomalyEvent | undefined = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0];
  }, [events, activeEventId]);

  // Aggregate event summary data for the top bar chart
  const summaryChartData = useMemo(() => {
    return [
      { category: 'Sustained Surge', count: 18, fill: '#68DD79' },
      { category: 'Rapid Rise', count: 12, fill: '#C5A8F8' },
      { category: 'Abnormal Recovery', count: 9, fill: '#A5F5A6' },
      { category: 'Low Blowout', count: 6, fill: '#FBBF24' },
      { category: 'Oscillatory Seiche', count: 4, fill: '#F87171' },
      { category: 'Data Gaps', count: 2, fill: '#9CA3AF' },
    ];
  }, []);

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    setSelectedEventId(id);
    setOperatorNote('');
    setSavedNoteSuccess(false);
  };

  const handleSaveNote = () => {
    if (!activeEvent || !operatorNote.trim()) return;
    addEventNote(activeEvent.id, operatorNote);
    setSavedNoteSuccess(true);
    setTimeout(() => setSavedNoteSuccess(false), 2500);
  };

  return (
    <div data-testid="screen-events" className="space-y-6">
      {/* Top: Event Summary Bar Chart Card */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-strong" />
              <h2 className="text-xl font-bold text-primary-text">
                Anomaly Event Classification & Frequency
              </h2>
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              Automata classification breakdown of verified hydrodynamic deviations
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-surface-muted text-secondary-text border border-border">
              Total Logged: 51 Events
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#737A75"
                tick={{ fill: '#4B5563', fontSize: 11 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis
                stroke="#737A75"
                tick={{ fill: '#4B5563', fontSize: 11 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-charcoal text-white rounded-xl p-2.5 shadow-panel text-xs">
                      <div className="font-semibold text-mint">{item.category}</div>
                      <div className="text-gray-300 mt-0.5">Detections: {item.count}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {summaryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Split: Detected Events List & Active Event Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Detected Events List (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] border border-border shadow-panel p-5 sm:p-6 flex flex-col h-[760px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-primary-text">Detected Events</h3>
              <p className="text-xs text-secondary-text">Select event for progression analysis</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-surface-muted text-primary-text border border-border">
              {events.length} Live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {events.length > 0 ? (
              events.map((event) => {
                const isSelected = event.id === activeEvent?.id;
                return (
                  <button
                    key={event.id}
                    onClick={() => handleSelectEvent(event.id)}
                    className={`w-full text-left p-3.5 rounded-24 border transition-all ${
                      isSelected
                        ? 'bg-charcoal text-white border-charcoal-border shadow-subtle'
                        : 'bg-surface-card hover:bg-surface-muted border-border text-primary-text'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          event.severity === 'High'
                            ? isSelected
                              ? 'bg-danger text-white'
                              : 'bg-danger-bg text-danger'
                            : isSelected
                            ? 'bg-lavender text-charcoal'
                            : 'bg-lavender/30 text-charcoal'
                        }`}
                      >
                        {event.severity} Severity
                      </span>
                      <span
                        className={`text-[11px] font-mono ${
                          isSelected ? 'text-gray-300' : 'text-secondary-text'
                        }`}
                      >
                        {new Date(event.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm leading-tight mb-1">
                      {event.patternName}
                    </h4>

                    <div
                      className={`text-xs flex items-center justify-between ${
                        isSelected ? 'text-gray-300' : 'text-secondary-text'
                      }`}
                    >
                      <span>{event.stationName}</span>
                      <span
                        className={`font-mono font-bold ${
                          isSelected ? 'text-mint' : 'text-mint-dark'
                        }`}
                      >
                        Peak: +{event.peakResidual.toFixed(2)}m
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span
                        className={
                          isSelected ? 'text-gray-400 font-mono' : 'text-secondary-text font-mono'
                        }
                      >
                        {event.durationMinutes} min duration
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          event.status === 'Resolved'
                            ? 'bg-mint/30 text-mint-dark'
                            : 'bg-warning/20 text-warning-dark'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-secondary-text">
                No anomaly events available in the current window.
              </div>
            )}
          </div>
        </div>

        {/* Right: Event Detail, 3-Stage Progression & Scientific Explanation (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeEvent ? (
            <>
              {/* Event Header & Time Series Chart */}
              <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          activeEvent.severity === 'High'
                            ? 'bg-danger-bg text-danger'
                            : 'bg-lavender/30 text-charcoal'
                        }`}
                      >
                        {activeEvent.severity} Severity
                      </span>
                      <span className="text-xs font-mono text-secondary-text">
                        ID: {activeEvent.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary-text mt-1">
                      {activeEvent.patternName}
                    </h3>
                    <p className="text-xs text-secondary-text mt-0.5">
                      Station: {activeEvent.stationName} • Duration: {activeEvent.durationMinutes} minutes
                    </p>
                  </div>

                  {/* Resolution Quick Toggle */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        activeEvent.status === 'Resolved'
                          ? 'bg-mint/30 text-mint-dark'
                          : 'bg-warning/20 text-warning-dark'
                      }`}
                    >
                      Status: {activeEvent.status}
                    </span>

                    {activeEvent.status !== 'Resolved' && (
                      <button
                        onClick={() => resolveEvent(activeEvent.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-charcoal text-white hover:bg-charcoal-card text-xs font-semibold transition-all shadow-subtle"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-mint" />
                        <span>Resolve Event</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Time Series Detail Chart */}
                <div className="w-full">
                  <ResidualChart
                    data={points}
                    height={260}
                    selectedEventId={activeEvent.id}
                    events={[activeEvent]}
                  />
                </div>
              </div>

              {/* 3-Stage Progression Cards (Before, During Peak, After) */}
              <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
                <h4 className="text-sm font-bold text-primary-text mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-mint-strong" />
                  3-Stage Event Hydrodynamic Progression
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stage 1: Before Event */}
                  <div className="p-4 rounded-24 bg-surface-muted border border-border flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-secondary-text mb-2">
                        <span className="font-bold text-primary-text">1. Before Event</span>
                        <span className="font-mono">{activeEvent.beforeReading?.time || '08:00'}</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-primary-text">
                        {activeEvent.beforeReading?.level.toFixed(2) || '1.20'} m
                      </div>
                      <div className="text-xs text-secondary-text mt-1">
                        Residual: <span className="font-mono font-semibold">+{activeEvent.beforeReading?.residual.toFixed(2) || '0.02'}m</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/60 text-[11px] text-secondary-text">
                      DFA State: <span className="font-mono font-bold text-primary-text">S0 (Baseline)</span>
                    </div>
                  </div>

                  {/* Stage 2: During Peak */}
                  <div className="p-4 rounded-24 bg-lavender/15 border border-lavender/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-charcoal mb-2">
                        <span className="font-bold">2. Peak Surge</span>
                        <span className="font-mono font-semibold">{activeEvent.duringReading?.time || '10:30'}</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-charcoal">
                        {activeEvent.duringReading?.level.toFixed(2) || '2.10'} m
                      </div>
                      <div className="text-xs text-charcoal/80 mt-1">
                        Peak Residual: <span className="font-mono font-bold text-charcoal">+{activeEvent.peakResidual.toFixed(2)}m</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-lavender/30 text-[11px] text-charcoal">
                      DFA State: <span className="font-mono font-bold">S1/S2 (Elevated Plateau)</span>
                    </div>
                  </div>

                  {/* Stage 3: After Event */}
                  <div className="p-4 rounded-24 bg-surface-muted border border-border flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-secondary-text mb-2">
                        <span className="font-bold text-primary-text">3. Recovery</span>
                        <span className="font-mono">{activeEvent.afterReading?.time || '12:45'}</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-primary-text">
                        {activeEvent.afterReading?.level.toFixed(2) || '1.35'} m
                      </div>
                      <div className="text-xs text-secondary-text mt-1">
                        Residual: <span className="font-mono font-semibold">+{activeEvent.afterReading?.residual.toFixed(2) || '0.04'}m</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/60 text-[11px] text-secondary-text">
                      DFA State: <span className="font-mono font-bold text-primary-text">S2 (Recovery Accepted)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scientific Explanation & Operator Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scientific Explanation */}
                <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-primary-text mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-mint-strong" />
                      Scientific Oceanographic Context
                    </h4>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      {activeEvent.explanation ||
                        'Strong onshore wind stress generated an Ekman transport setup along the coastal shelf, compounding astronomical high tide with a positive barometric pressure drop.'}
                    </p>
                    <div className="mt-3 p-3 rounded-20 bg-surface-muted text-xs text-primary-text border border-border">
                      <div className="font-bold text-[11px] text-secondary-text uppercase mb-1">
                        Automata State Trace Path:
                      </div>
                      <span className="font-mono text-xs font-semibold text-mint-dark">
                        {activeEvent.statePath?.join(' → ') || 'S0 → S1 → S1 → S2'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border text-[11px] text-secondary-text">
                    Confidence: {(activeEvent.confidence * 100).toFixed(0)}% • Deterministic
                  </div>
                </div>

                {/* Operator Notes & Resolution Controls */}
                <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-primary-text mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-lavender-dark" />
                      Operator Log & Annotations
                    </h4>
                    {activeEvent.notes && (
                      <div className="mb-2 p-2.5 rounded-xl bg-surface-muted text-xs text-secondary-text italic border border-border">
                        &quot;{activeEvent.notes}&quot;
                      </div>
                    )}
                    <textarea
                      rows={3}
                      placeholder="Add oceanographic note, storm verification, or sensor recalibration details..."
                      value={operatorNote}
                      onChange={(e) => setOperatorNote(e.target.value)}
                      className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-mint transition-all resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-mint-dark font-semibold">
                      {savedNoteSuccess ? 'Note logged successfully!' : ''}
                    </span>
                    <button
                      onClick={handleSaveNote}
                      disabled={!operatorNote.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-white hover:bg-charcoal-card text-xs font-semibold transition-all disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5 text-mint" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-surface rounded-[28px] border border-border shadow-panel p-12 text-center text-secondary-text text-sm">
              No anomaly event selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsScreen;
