import React, { useState, useEffect, useRef } from 'react';
import { AutomataStepTrace } from '@/types/automata';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface EventTapeProps {
  traces: AutomataStepTrace[];
  currentStepIndex?: number;
  onStepSelect?: (index: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}

export const EventTape: React.FC<EventTapeProps> = ({
  traces = [],
  currentStepIndex = 0,
  onStepSelect,
  isPlaying: externalIsPlaying,
  onTogglePlay: externalOnTogglePlay,
  className = '',
}) => {
  const [internalStep, setInternalStep] = useState<number>(currentStepIndex);
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeIndex = currentStepIndex !== undefined ? currentStepIndex : internalStep;
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalPlaying;

  // Handle Playback Interval
  useEffect(() => {
    if (!isPlaying || traces.length === 0) return;

    const intervalTime = Math.max(300 / playbackSpeed, 100);
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % traces.length;
      if (onStepSelect) {
        onStepSelect(nextIndex);
      } else {
        setInternalStep(nextIndex);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, activeIndex, traces.length, playbackSpeed, onStepSelect]);

  // Auto-scroll to keep active cell in view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const activeCell = container.querySelector(`[data-step="${activeIndex}"]`) as HTMLElement;
    if (activeCell) {
      const containerWidth = container.offsetWidth;
      const cellLeft = activeCell.offsetLeft;
      const cellWidth = activeCell.offsetWidth;
      const scrollPos = cellLeft - containerWidth / 2 + cellWidth / 2;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: scrollPos,
          behavior: 'smooth',
        });
      } else {
        container.scrollLeft = scrollPos;
      }
    }
  }, [activeIndex]);

  const handleTogglePlay = () => {
    if (externalOnTogglePlay) {
      externalOnTogglePlay();
    } else {
      setInternalPlaying(!internalPlaying);
    }
  };

  const handleStepPrev = () => {
    const prev = Math.max(0, activeIndex - 1);
    if (onStepSelect) onStepSelect(prev);
    else setInternalStep(prev);
  };

  const handleStepNext = () => {
    const next = Math.min(traces.length - 1, activeIndex + 1);
    if (onStepSelect) onStepSelect(next);
    else setInternalStep(next);
  };

  const handleReset = () => {
    if (onStepSelect) onStepSelect(0);
    else setInternalStep(0);
    if (internalPlaying) setInternalPlaying(false);
  };

  // If empty traces, provide fallback mockup steps
  const displayTraces: AutomataStepTrace[] = traces.length > 0
    ? traces
    : [
        {
          stepIndex: 0,
          timestamp: '2024-11-12T12:00:00Z',
          observedLevel: 1.25,
          predictedLevel: 1.22,
          residual: 0.03,
          rateOfChange: 0.02,
          symbol: 'N:S',
          symbolAlias: 'Normal',
          symbolConfidence: 0.98,
          previousState: 'S0',
          activeState: 'S0',
          transitionCondition: 'Residual in baseline',
          isAccepting: false,
        },
        {
          stepIndex: 1,
          timestamp: '2024-11-12T12:30:00Z',
          observedLevel: 1.55,
          predictedLevel: 1.28,
          residual: 0.27,
          rateOfChange: 0.24,
          symbol: 'H:R',
          symbolAlias: 'Rise',
          symbolConfidence: 0.94,
          previousState: 'S0',
          activeState: 'S1',
          transitionCondition: 'Δh ≥ +0.20 m/hr',
          isAccepting: false,
        },
        {
          stepIndex: 2,
          timestamp: '2024-11-12T13:00:00Z',
          observedLevel: 1.62,
          predictedLevel: 1.31,
          residual: 0.31,
          rateOfChange: 0.05,
          symbol: 'H:S',
          symbolAlias: 'Hold',
          symbolConfidence: 0.96,
          previousState: 'S1',
          activeState: 'S1',
          transitionCondition: 'Residual > +0.20 m sustained',
          isAccepting: false,
        },
        {
          stepIndex: 3,
          timestamp: '2024-11-12T13:30:00Z',
          observedLevel: 1.68,
          predictedLevel: 1.34,
          residual: 0.34,
          rateOfChange: 0.04,
          symbol: 'H:S',
          symbolAlias: 'Hold',
          symbolConfidence: 0.97,
          previousState: 'S1',
          activeState: 'S2',
          transitionCondition: 'Surge plateau sample 2 verified',
          isAccepting: true,
        },
        {
          stepIndex: 4,
          timestamp: '2024-11-12T14:00:00Z',
          observedLevel: 1.32,
          predictedLevel: 1.35,
          residual: -0.03,
          rateOfChange: -0.28,
          symbol: 'L:F',
          symbolAlias: 'Fall',
          symbolConfidence: 0.91,
          previousState: 'S2',
          activeState: 'S0',
          transitionCondition: 'Dissipated to baseline',
          isAccepting: false,
        },
      ];

  const getAliasBadge = (alias: string) => {
    switch (alias) {
      case 'Rise':
        return 'bg-[#E2FBE3] text-[#359D45] border-[#A5F5A6]';
      case 'Hold':
        return 'bg-[#F3EEFD] text-[#8B64DF] border-[#C5A8F8]';
      case 'Fall':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FBBF24]';
      case 'Stabilize':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Extreme':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'Gap':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-surface-muted text-secondary-text border-border';
    }
  };


  return (
    <div className={`bg-surface rounded-28px p-5 border border-border shadow-panel flex flex-col ${className}`}>
      {/* Tape Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79] animate-pulse" />
            <h4 className="text-sm font-bold text-primary-text">
              Synchronized Event Stream Tape
            </h4>
          </div>
          <p className="text-xs text-secondary-text">
            Step-by-step token alphabet stream, automata state sequence, and telemetry curve
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Step Back */}
          <button
            onClick={handleStepPrev}
            disabled={activeIndex <= 0}
            className="p-1.5 rounded-full bg-surface-muted hover:bg-border text-charcoal disabled:opacity-40 transition-colors"
            title="Step Backward"
          >
            <SkipBack size={15} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-white hover:bg-black text-xs font-semibold shadow-sm transition-colors"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Step Forward */}
          <button
            onClick={handleStepNext}
            disabled={activeIndex >= displayTraces.length - 1}
            className="p-1.5 rounded-full bg-surface-muted hover:bg-border text-charcoal disabled:opacity-40 transition-colors"
            title="Step Forward"
          >
            <SkipForward size={15} />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full bg-surface-muted hover:bg-border text-secondary-text hover:text-charcoal transition-colors"
            title="Reset to Step 0"
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Pills */}
          <div className="flex items-center bg-surface-muted rounded-full p-0.5 border border-border text-[11px] font-mono">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-charcoal text-white font-bold'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Tape Rows */}
      <div className="flex">
        {/* Row Labels Left Bar */}
        <div className="w-24 shrink-0 flex flex-col justify-between py-2 text-xs font-semibold text-secondary-text border-r border-border pr-3">
          <div className="h-10 flex items-center">
            <span>Input (Σ)</span>
          </div>
          <div className="h-10 flex items-center">
            <span>State (Q)</span>
          </div>
          <div className="h-14 flex items-center">
            <span>Surge R(t)</span>
          </div>
        </div>

        {/* Scrollable Event Tape Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden py-1 pl-3 scrollbar-thin scrollbar-thumb-border"
        >
          <div className="inline-flex gap-2 min-w-full">
            {displayTraces.map((trace, idx) => {
              const isActive = idx === activeIndex;
              const formattedTime = new Date(trace.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={`step-${idx}`}
                  data-step={idx}
                  onClick={() => onStepSelect ? onStepSelect(idx) : setInternalStep(idx)}
                  className={`flex flex-col items-center w-28 shrink-0 p-2 rounded-20px border cursor-pointer transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-white border-[#68DD79] shadow-subtle ring-2 ring-[#68DD79]/30'
                      : 'bg-surface-card/60 border-border hover:bg-white hover:border-charcoal/30'
                  }`}
                >
                  {/* Step Timestamp Pill */}
                  <span className="text-[10px] font-mono text-secondary-text mb-1">
                    {formattedTime}
                  </span>

                  {/* 1. Input Events Row */}
                  <div className="h-10 flex items-center justify-center w-full">
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm ${getAliasBadge(
                        trace.symbolAlias
                      )}`}
                    >
                      {trace.symbolAlias}
                    </span>
                  </div>

                  {/* 2. State Row */}
                  <div className="h-10 flex items-center justify-center w-full">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold transition-transform ${
                        trace.isAccepting
                          ? 'bg-[#E2FBE3] text-[#359D45] border-[#A5F5A6] shadow-sm'
                          : isActive
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-white text-primary-text border-border'
                      }`}
                    >
                      <span>{trace.activeState}</span>
                      {trace.isAccepting && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#359D45] animate-ping" />
                      )}
                    </div>
                  </div>

                  {/* 3. Water Level Curve Bar / Value */}
                  <div className="h-14 w-full flex flex-col justify-end items-center pt-2">
                    <div className="w-full h-8 relative flex items-center justify-center">
                      {/* Baseline guide */}
                      <div className="absolute w-full h-[1px] bg-border top-1/2" />
                      {/* Mini bar or dot */}
                      <div
                        className={`w-3 rounded-full transition-all duration-300 ${
                          (trace.residual ?? 0) >= 0.2
                            ? 'bg-[#68DD79]'
                            : (trace.residual ?? 0) <= -0.2
                            ? 'bg-[#C5A8F8]'
                            : 'bg-gray-400'
                        }`}
                        style={{
                          height: `${Math.max(Math.abs((trace.residual ?? 0)) * 40, 6)}px`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        (trace.residual ?? 0) >= 0.2
                          ? 'text-[#359D45]'
                          : (trace.residual ?? 0) <= -0.2
                          ? 'text-[#8B64DF]'
                          : 'text-secondary-text'
                      }`}
                    >
                      {(trace.residual ?? 0) >= 0 ? '+' : ''}
                      {(trace.residual ?? 0).toFixed(2)}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Step Details Bar */}
      {displayTraces[activeIndex] && (
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between text-xs text-secondary-text gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-primary-text">
              Step #{activeIndex + 1} of {displayTraces.length}
            </span>
            <span className="font-mono text-charcoal">
              Symbol: <strong>{displayTraces[activeIndex].symbol}</strong> ({displayTraces[activeIndex].symbolAlias})
            </span>
            <span className="font-mono text-charcoal">
              State: <strong>{displayTraces[activeIndex].activeState}</strong>
              {displayTraces[activeIndex].isAccepting ? ' (Accepting F)' : ''}
            </span>
          </div>

          <div className="text-[11px] text-secondary-text">
            Condition: {displayTraces[activeIndex].transitionCondition || 'Observation ingested'}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTape;
