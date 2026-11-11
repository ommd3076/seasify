import React, { useState } from 'react';
import { FormalDFA, AutomataTransition } from '@/types/automata';

interface TransitionTableProps {
  dfa?: FormalDFA;
  currentStateId?: string;
  activeInputSymbol?: string;
  className?: string;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  dfa,
  currentStateId,
  activeInputSymbol,
  className = '',
}) => {
  const [filterState, setFilterState] = useState<string>('ALL');

  // Fallback sample transitions if none provided
  const transitions: AutomataTransition[] = dfa?.transitions?.length
    ? dfa.transitions
    : [
        { from: 'S0', to: 'S1', symbol: 'Rise', label: '↑ Rise', conditionDescription: 'Δh ≥ +0.20 m/hr or residual > +0.20 m' },
        { from: 'S0', to: 'S0', symbol: 'Normal', label: 'Normal', conditionDescription: 'Residual within astronomical baseline ±0.20 m' },
        { from: 'S1', to: 'S1', symbol: 'Hold', label: '≈ Hold', conditionDescription: 'Residual sustained > +0.20 m (|Δh| < 0.10 m/hr)' },
        { from: 'S1', to: 'S2', symbol: 'Hold', label: '≈ Hold', conditionDescription: 'Persistent positive anomaly confirmed across 2+ samples' },
        { from: 'S1', to: 'S0', symbol: 'Fall', label: '↓ Fall', conditionDescription: 'Residual dissipates to baseline (Δh ≤ -0.20 m/hr)' },
        { from: 'S2', to: 'S2', symbol: 'Hold', label: '≈ Hold', conditionDescription: 'Ongoing surge event maintenance' },
        { from: 'S2', to: 'S0', symbol: 'Fall', label: '↓ Recede', conditionDescription: 'Surge recedes to normal baseline' },
        { from: 'S2', to: 'S0', symbol: 'Stabilize', label: 'Stabilize', conditionDescription: '|Δh| < 0.10 m/hr and residual returns within baseline' },
      ];

  const acceptingStateIds = new Set(
    dfa?.acceptingStates || ['S2']
  );
  const startStateId = dfa?.startState || 'S0';

  // Unique states for filter buttons
  const uniqueStates = Array.from(new Set(transitions.map((t) => t.from))).sort();

  const filteredTransitions = filterState === 'ALL'
    ? transitions
    : transitions.filter((t) => t.from === filterState);

  // Symbol badge colors
  const getSymbolBadgeClass = (symbol: string) => {
    switch (symbol) {
      case 'Rise':
      case 'H:R':
        return 'bg-[#E2FBE3] text-[#359D45] border-[#A5F5A6]';
      case 'Hold':
      case 'H:S':
        return 'bg-[#F3EEFD] text-[#8B64DF] border-[#C5A8F8]';
      case 'Fall':
      case 'L:F':
      case 'N:F':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FBBF24]';
      case 'Extreme':
      case 'EH':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#F87171]';
      case 'GAP':
      case 'Gap':
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]';
      default:
        return 'bg-surface-muted text-primary-text border-border';
    }
  };

  return (
    <div className={`bg-surface rounded-28px p-5 border border-border shadow-panel flex flex-col ${className}`}>
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-primary-text">
            Formal State Transition Table δ(Q × Σ → Q)
          </h4>
          <p className="text-xs text-secondary-text">
            Deterministic state transitions and oceanographic boundary conditions
          </p>
        </div>

        {/* State Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterState('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
              filterState === 'ALL'
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-secondary-text border-border hover:bg-surface-muted'
            }`}
          >
            All States ({transitions.length})
          </button>
          {uniqueStates.map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-full transition-colors border ${
                filterState === st
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white text-secondary-text border-border hover:bg-surface-muted'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-20px border border-border bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-muted/60 text-secondary-text font-semibold uppercase text-[10px] tracking-wider border-b border-border">
              <th className="py-2.5 px-4">Current State (q)</th>
              <th className="py-2.5 px-4">Event / Input (σ)</th>
              <th className="py-2.5 px-4">Next State δ(q, σ)</th>
              <th className="py-2.5 px-4">Oceanographic Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 font-sans">
            {filteredTransitions.map((t, idx) => {
              const isCurrentState = currentStateId === t.from;
              const isSymbolMatch = activeInputSymbol ? t.symbol === activeInputSymbol || t.label.includes(activeInputSymbol) : false;
              const isRowActive = isCurrentState && isSymbolMatch;

              const isFromStart = t.from === startStateId;
              const isToAccepting = acceptingStateIds.has(t.to);

              return (
                <tr
                  key={`${t.from}-${t.to}-${t.symbol}-${idx}`}
                  className={`transition-colors duration-150 ${
                    isRowActive
                      ? 'bg-[#E2FBE3]/80 font-semibold'
                      : isCurrentState
                      ? 'bg-surface-card hover:bg-surface-muted/40'
                      : 'hover:bg-surface-muted/30'
                  }`}
                >
                  {/* Current State */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-text bg-surface-muted px-2 py-0.5 rounded border border-border">
                        {t.from}
                      </span>
                      {isFromStart && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-charcoal text-white">
                          Start (q₀)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Input Event Token */}
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full border text-[11px] ${getSymbolBadgeClass(
                        t.symbol
                      )}`}
                    >
                      {t.label || t.symbol}
                    </span>
                  </td>

                  {/* Next State */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-text bg-surface-muted px-2 py-0.5 rounded border border-border">
                        {t.to}
                      </span>
                      {isToAccepting && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2FBE3] text-[#359D45] border border-[#A5F5A6] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#359D45]" />
                          Accepting (F)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Condition */}
                  <td className="py-2.5 px-4 text-secondary-text font-mono text-[11px]">
                    {t.conditionDescription || 'Transition on symbol match'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransitionTable;
