import React from 'react';
import {
  Layers,
  Workflow,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  Compass,
} from 'lucide-react';
import { useAutomataStore } from '@/stores/automataStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { RadialGauge } from '@/components/charts/RadialGauge';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';

export const PatternsScreen: React.FC = () => {
  const { patterns } = useAutomataStore();
  const { navigateToAutomataLab } = useNavigationStore();

  const patternDistribution = [
    { name: 'Sustained Elevated Surge', pct: 38, count: 42, color: 'bg-mint-strong' },
    { name: 'Rapid Rate of Rise (Flash)', pct: 24, count: 26, color: 'bg-lavender' },
    { name: 'Elevated Event with Recovery', pct: 18, count: 20, color: 'bg-mint' },
    { name: 'Low Water Blowout', pct: 12, count: 14, color: 'bg-warning' },
    { name: 'Oscillatory Harbor Seiche', pct: 8, count: 9, color: 'bg-danger' },
  ];

  const handleInspect = (patternId: string) => {
    navigateToAutomataLab(patternId);
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Coverage Gauge, Active Detections Charcoal Card, Most Common Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Pattern Coverage Gauge Card (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] border border-border shadow-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-strong" />
                <h3 className="text-base font-bold text-primary-text">
                  Pattern Coverage
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-mint/30 text-mint-dark text-xs font-bold">
                Optimal
              </span>
            </div>

            <div className="py-2 flex items-center justify-center">
              <RadialGauge
                value={94.4}
                min={0}
                max={100}
                unit="%"
                title="Automata Recognition"
                subtitle="Percentage of tidal anomaly observations matched by formal regular expressions"
                status="94.4% ACCURACY"
                statusColor="mint"
                size={230}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-secondary-text">
            <span>DFA Determinization</span>
            <span className="font-mono text-primary-text font-semibold">0 False Rejections</span>
          </div>
        </div>

        {/* Card 2: Active Detections Charcoal Card (4 cols) */}
        <div className="lg:col-span-4 bg-charcoal text-white rounded-[28px] border border-charcoal-border shadow-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-lavender/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest text-mint uppercase font-semibold">
                Live State Traces
              </span>
              <span className="px-2 py-0.5 rounded-full bg-charcoal-card text-xs font-mono text-mint border border-charcoal-border">
                STREAM ENGINE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-2">Active Detections</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Current real-time pattern states across coastal network
            </p>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-20 bg-charcoal-card border border-charcoal-border">
                <span className="text-[11px] text-gray-400 block">Active Matches</span>
                <span className="text-2xl font-black text-mint font-mono">3</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Ongoing surges</span>
              </div>

              <div className="p-3 rounded-20 bg-charcoal-card border border-charcoal-border">
                <span className="text-[11px] text-gray-400 block">Triggered Alerts</span>
                <span className="text-2xl font-black text-lavender font-mono">2</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">High severity</span>
              </div>

              <div className="p-3 rounded-20 bg-charcoal-card border border-charcoal-border">
                <span className="text-[11px] text-gray-400 block">Avg Event Duration</span>
                <span className="text-2xl font-black text-white font-mono">4.2h</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Rise-to-recovery</span>
              </div>

              <div className="p-3 rounded-20 bg-charcoal-card border border-charcoal-border">
                <span className="text-[11px] text-gray-400 block">Confidence Mean</span>
                <span className="text-2xl font-black text-mint font-mono">96%</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Deterministic</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-charcoal-border flex items-center justify-between text-xs text-gray-400">
            <span>DFA Step Cycle: 360s</span>
            <span className="text-mint font-semibold">Synchronized</span>
          </div>
        </div>

        {/* Card 3: Most Common Patterns Progress Bars (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] border border-border shadow-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-primary-text">
                  Most Common Patterns
                </h3>
                <p className="text-xs text-secondary-text">
                  Historical distribution across 111 detected events
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {patternDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-primary-text truncate">
                      {item.name}
                    </span>
                    <span className="font-mono font-bold text-secondary-text ml-2">
                      {item.pct}% ({item.count})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-secondary-text">
            <span>Classification: Regular Grammars</span>
            <span className="font-semibold text-primary-text">6 Archetypes</span>
          </div>
        </div>
      </div>

      {/* Pattern Library Section */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-charcoal text-mint flex items-center justify-center">
                <Workflow className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-primary-text">Pattern Library</h2>
            </div>
            <p className="text-xs text-secondary-text mt-1">
              Deterministic Finite Automata (DFA) state machines designed for coastal anomaly detection
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-surface-muted text-secondary-text border border-border">
            Formal Thompson NFA → Subset Construction DFA
          </span>
        </div>

        {/* Archetypes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PREDEFINED_PATTERNS.map((p) => {
            return (
              <div
                key={p.id}
                className="p-5 rounded-24 bg-surface-card hover:bg-surface-muted border border-border transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-secondary-text">
                      {p.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-mint/30 text-mint-dark text-[10px] font-bold">
                      {p.states.length} States
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-primary-text group-hover:text-charcoal leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-xs text-secondary-text mt-2 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Rule summary box */}
                  <div className="mt-4 p-3 rounded-16 bg-surface border border-border/80">
                    <span className="text-[10px] uppercase font-bold text-secondary-text tracking-wider block mb-1">
                      Transition Sequence:
                    </span>
                    <p className="text-xs font-mono text-primary-text font-semibold break-words leading-relaxed">
                      {p.ruleSummary}
                    </p>
                  </div>

                  {/* Alphabet Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.alphabet.map((sym) => (
                      <span
                        key={sym}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-muted border border-border text-secondary-text"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-border flex items-center justify-between">
                  <div className="text-[11px] text-secondary-text">
                    Accepting: <span className="font-mono font-bold text-primary-text">{p.acceptingStates.join(', ')}</span>
                  </div>

                  <button
                    onClick={() => handleInspect(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-white hover:bg-charcoal-card text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-subtle"
                  >
                    <span>Inspect Automaton</span>
                    <ArrowRight className="w-3.5 h-3.5 text-mint" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatternsScreen;
