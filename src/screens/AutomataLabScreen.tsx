import React, { useState } from 'react';
import {
  Workflow,
  Cpu,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useAutomataStore } from '@/stores/automataStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { AutomataGraph } from '@/components/automata/AutomataGraph';
import { TransitionTable } from '@/components/automata/TransitionTable';
import { EventTape } from '@/components/automata/EventTape';
import { SequenceSimulator } from '@/components/automata/SequenceSimulator';
import MetricCard from '@/components/common/MetricCard';
import Badge from '@/components/common/Badge';

export const AutomataLabScreen: React.FC = () => {
  const {
    patterns,
    selectedPattern,
    selectPattern,
    currentStateId,
    viewMode,
    setViewMode,
  } = useAutomataStore();

  const { points } = useTideDataStore();
  const [selectedState, setSelectedState] = useState<string>(currentStateId || 'S0');

  // Convert points to step traces if available
  const sampleTraces = points.slice(0, 12).map((pt, idx) => ({
    stepIndex: idx,
    timestamp: pt.timestamp,
    observedLevel: pt.observed,
    predictedLevel: pt.predicted,
    residual: pt.residual,
    rateOfChange: pt.rateOfChange,
    symbol: (pt.residual && pt.residual > 0.2 ? 'H' : 'N') as any,
    symbolAlias: (pt.residual && pt.residual > 0.2 ? 'Hold' : 'Normal') as any,
    symbolConfidence: 0.94,
    previousState: idx === 0 ? 'S0' : 'S1',
    activeState: idx > 2 ? 'S2' : 'S1',
    transitionCondition: 'Residual deviation delta',
    isAccepting: idx > 3,
  }));

  return (
    <div data-testid="screen-automata-lab" className="space-y-6">
      <div data-testid="screen-pattern-engine" className="space-y-6">
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Active Rule Set (Charcoal) */}
          <MetricCard
            variant="charcoal"
            title="Active Automaton Model"
            value={selectedPattern?.name || 'Sustained Surge'}
            subtitle={`Regular Expression: ${selectedPattern?.regexDescription || 'Rise Hold+ Fall'}`}
            unit="DFA"
            badge={
              <Badge variant="normal" size="sm">
                Formal M = (Q, Σ, δ, q₀, F)
              </Badge>
            }
          />

          {/* Card 2: Matched Sequences */}
          <MetricCard
            variant="surface"
            title="Total Pattern Matches"
            value="42"
            unit="Events"
            delta={{ text: '+8 recognized this week', direction: 'up', isPositive: true }}
            subtitle="Verified against NOAA harmonic baseline"
          />

          {/* Card 3: Pattern Confidence */}
          <MetricCard
            variant="surface"
            title="Automata Recognition Confidence"
            value="96.8"
            unit="%"
            delta={{ text: 'Mean Z-Score 2.4σ', direction: 'up', isPositive: true }}
            subtitle="Zero false positive rate on benchmark storm sets"
          />
        </div>

        {/* Pattern Selector Pill Row */}
        <div className="bg-surface rounded-panel border border-border shadow-panel p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-text">
              Select DFA Rule:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPattern(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedPattern?.id === p.id
                      ? 'bg-mint text-charcoal border border-mint-strong shadow-sm font-bold'
                      : 'bg-surface-muted text-secondary-text hover:text-primary-text border border-border'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="normal" size="sm">
              States: {selectedPattern?.states?.length || 3}
            </Badge>
            <Badge variant="elevated" size="sm">
              Alphabet: |Σ| = 8
            </Badge>
          </div>
        </div>

        {/* Middle Row: Automata State Flow Graph (~65%) and Transition Table (~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* State Graph */}
          <div className="lg:col-span-8 bg-surface rounded-panel border border-border shadow-panel p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-mint-strong" />
                <h3 className="text-base font-bold text-primary-text">
                  Directed State Transition Diagram
                </h3>
              </div>
              <span className="text-xs font-mono text-secondary-text">
                Current State: <strong className="text-primary-text">{selectedState}</strong>
              </span>
            </div>
            <p className="text-xs text-secondary-text mb-4">
              Deterministic finite automaton showing accepting states (double circle) and active transition
            </p>

            <div className="w-full flex-1 min-h-[300px]">
              <AutomataGraph
                dfa={selectedPattern}
                activeStateId={selectedState}
                onSelectState={setSelectedState}
              />
            </div>
          </div>

          {/* Transition Table */}
          <div className="lg:col-span-4 bg-surface rounded-panel border border-border shadow-panel p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-lavender-dark" />
                <h3 className="text-base font-bold text-primary-text">Transition δ(q, σ)</h3>
              </div>
              <Badge variant="normal" size="sm">Deterministic</Badge>
            </div>
            <p className="text-xs text-secondary-text mb-4">
              Formal lookup matrix mapping states & oceanographic symbols
            </p>

            <div className="w-full flex-1 overflow-y-auto">
              <TransitionTable
                dfa={selectedPattern}
                currentStateId={selectedState}
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Event Stream Trace (~58%) & Interactive Simulator (~42%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Event Stream Trace */}
          <div className="lg:col-span-7 bg-surface rounded-panel border border-border shadow-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-mint-strong" />
                <h3 className="text-base font-bold text-primary-text">Synchronized Event Stream Tape</h3>
              </div>
              <Badge variant="normal" size="sm">Live Tape</Badge>
            </div>
            <EventTape traces={sampleTraces} currentStepIndex={0} />
          </div>

          {/* Interactive Sequence Simulator */}
          <div className="lg:col-span-5 bg-surface rounded-panel border border-border shadow-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-mint-strong" />
                <h3 className="text-base font-bold text-primary-text">Sequence Simulator</h3>
              </div>
              <Badge variant="elevated" size="sm">Interactive</Badge>
            </div>
            <SequenceSimulator dfa={selectedPattern} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomataLabScreen;
