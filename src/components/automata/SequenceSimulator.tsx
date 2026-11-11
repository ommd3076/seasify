import React from 'react';
import { useAutomataStore } from '@/stores/automataStore';
import { EventAlias, FormalDFA } from '@/types/automata';
import { Play, SkipForward, RotateCcw, Trash2, CheckCircle2, XCircle, Sparkles, Plus } from 'lucide-react';

interface SequenceSimulatorProps {
  dfa?: FormalDFA;
  className?: string;
}

const AVAILABLE_TOKENS: Array<{
  alias: EventAlias;
  label: string;
  badgeClass: string;
  desc: string;
}> = [
  {
    alias: 'Rise',
    label: '↑ Rise',
    badgeClass: 'bg-[#E2FBE3] text-[#359D45] border-[#A5F5A6] hover:bg-[#68DD79]/20',
    desc: 'Rapid upward surge rate (Δh ≥ +0.20 m/hr)',
  },
  {
    alias: 'Hold',
    label: '≈ Hold',
    badgeClass: 'bg-[#F3EEFD] text-[#8B64DF] border-[#C5A8F8] hover:bg-[#C5A8F8]/30',
    desc: 'Sustained water level plateau',
  },
  {
    alias: 'Fall',
    label: '↓ Fall',
    badgeClass: 'bg-[#FEF3C7] text-[#D97706] border-[#FBBF24] hover:bg-[#FBBF24]/20',
    desc: 'Receding water level drainage',
  },
  {
    alias: 'Stabilize',
    label: '✓ Stabilize',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    desc: 'Return to astronomical baseline band',
  },
  {
    alias: 'Low',
    label: '↓ Low',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    desc: 'Depressed water level below -0.20m',
  },
  {
    alias: 'Extreme',
    label: '⚡ Extreme',
    badgeClass: 'bg-[#FEE2E2] text-[#DC2626] border-[#F87171] hover:bg-[#F87171]/20',
    desc: 'Severe storm surge outlier (> +0.50m)',
  },
  {
    alias: 'Gap',
    label: '∅ Gap',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
    desc: 'Missing telemetry (>30 min outage)',
  },
  {
    alias: 'Normal',
    label: '○ Normal',
    badgeClass: 'bg-surface-muted text-secondary-text border-border hover:bg-border',
    desc: 'Equilibrium astronomical tide',
  },
];

const PRESET_SEQUENCES: Array<{
  name: string;
  tokens: EventAlias[];
}> = [
  {
    name: 'Sandy Surge Pulse',
    tokens: ['Rise', 'Hold', 'Hold', 'Fall', 'Stabilize'],
  },
  {
    name: 'Sustained Setup',
    tokens: ['Rise', 'Hold', 'Hold'],
  },
  {
    name: 'Offshore Blowout',
    tokens: ['Fall', 'Low', 'Low', 'Stabilize'],
  },
  {
    name: 'Seiche Spike',
    tokens: ['Rise', 'Fall', 'Rise', 'Fall'],
  },
];

export const SequenceSimulator: React.FC<SequenceSimulatorProps> = ({
  dfa,
  className = '',
}) => {
  const store = useAutomataStore();

  const activeDfa = dfa || store.selectedPattern;
  const inputTokens = store.inputTokens;
  const currentStepIndex = store.currentStepIndex;
  const currentStateId = store.currentStateId;
  const simulationResult = store.simulationResult;

  const isAcceptingState = activeDfa.acceptingStates.includes(currentStateId);

  const handleAddToken = (token: EventAlias) => {
    store.addInputToken(token);
  };

  const handleRemoveToken = (index: number) => {
    store.removeInputToken(index);
  };

  const handleClear = () => {
    store.clearInputTokens();
  };

  const handleStep = () => {
    store.stepSimulation();
  };

  const handleRunFull = () => {
    store.runFullSimulation();
  };

  const handleReset = () => {
    store.resetSimulation();
  };

  const handleLoadPreset = (tokens: EventAlias[]) => {
    store.clearInputTokens();
    tokens.forEach((t) => store.addInputToken(t));
  };

  return (
    <div className={`bg-surface rounded-28px p-5 border border-border shadow-panel flex flex-col gap-4 ${className}`}>
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#359D45]" />
            <h4 className="text-sm font-bold text-primary-text font-sans">
              Interactive Finite Automata Sequence Simulator
            </h4>
          </div>
          <p className="text-xs text-secondary-text">
            Test token strings against formal DFA transitions to verify language acceptance L(M)
          </p>
        </div>

        {/* Preset Sequences Dropdown / Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-secondary-text">Presets:</span>
          {PRESET_SEQUENCES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleLoadPreset(preset.tokens)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white text-charcoal border border-border hover:bg-surface-muted transition-colors shadow-sm"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Token Palette (Buttons to add) */}
      <div className="bg-surface-card p-3 rounded-20px border border-border">
        <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block mb-2">
          Master Alphabet Tokens (Click to append):
        </span>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TOKENS.map((token) => (
            <button
              key={token.alias}
              onClick={() => handleAddToken(token.alias)}
              title={token.desc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all shadow-sm active:scale-95 ${token.badgeClass}`}
            >
              <Plus size={12} />
              <span>{token.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Token Sequence Tape (Chips with 'x') */}
      <div className="bg-white p-3.5 rounded-20px border border-border flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary-text">
            Input Token String w = σ₁ σ₂ ... σₙ ({inputTokens.length} tokens):
          </span>
          {inputTokens.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={12} />
              <span>Clear String</span>
            </button>
          )}
        </div>

        {inputTokens.length === 0 ? (
          <div className="py-4 text-center text-xs text-secondary-text italic bg-surface-muted/30 rounded-16px border border-dashed border-border">
            No input tokens selected. Click buttons above or choose a preset to begin simulation.
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            {inputTokens.map((token, idx) => {
              const isCurrentStep = idx === currentStepIndex - 1;
              const isUpcoming = idx >= currentStepIndex;

              const matchedToken = AVAILABLE_TOKENS.find((t) => t.alias === token);
              const badgeClass = matchedToken?.badgeClass || 'bg-surface-muted text-charcoal border-border';

              return (
                <div
                  key={`${token}-${idx}`}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-all shadow-sm shrink-0 ${badgeClass} ${
                    isCurrentStep ? 'ring-2 ring-charcoal scale-105' : isUpcoming ? 'opacity-85' : 'opacity-100'
                  }`}
                >
                  <span className="text-[10px] text-gray-500 font-sans font-normal">#{idx + 1}</span>
                  <span>{token}</span>
                  <button
                    onClick={() => handleRemoveToken(idx)}
                    className="ml-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-black/10 p-0.5"
                    title="Remove token"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls Bar: Step, Run All, Reset */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Step Button */}
          <button
            onClick={handleStep}
            disabled={currentStepIndex >= inputTokens.length || inputTokens.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-charcoal text-white hover:bg-black text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
          >
            <SkipForward size={14} />
            <span>Step ({currentStepIndex}/{inputTokens.length})</span>
          </button>

          {/* Run All Full Simulation */}
          <button
            onClick={handleRunFull}
            disabled={inputTokens.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#359D45] text-white hover:bg-[#2e873b] text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
          >
            <Play size={14} />
            <span>Run Full Sequence</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-border text-charcoal text-xs font-medium transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Current State Readout */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-secondary-text">Current State:</span>
          <span className="font-mono font-bold px-2.5 py-0.5 rounded-full bg-charcoal text-white">
            {currentStateId}
          </span>
          {isAcceptingState && (
            <span className="px-2 py-0.5 rounded-full bg-[#E2FBE3] text-[#359D45] border border-[#A5F5A6] font-semibold text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#359D45]" />
              Accepting State
            </span>
          )}
        </div>
      </div>

      {/* Acceptance / Rejection Banner */}
      {simulationResult && (
        <div
          className={`p-4 rounded-20px border flex items-start gap-3 transition-all ${
            simulationResult.matched
              ? 'bg-[#E2FBE3] border-[#A5F5A6] text-[#171A18]'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          {simulationResult.matched ? (
            <CheckCircle2 size={20} className="text-[#359D45] shrink-0 mt-0.5" />
          ) : (
            <XCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">
                {simulationResult.matched
                  ? `Pattern Language Accepted L(M) — ${activeDfa.name}`
                  : 'Pattern String Rejected / Incomplete'}
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  simulationResult.matched
                    ? 'bg-[#359D45] text-white'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                Confidence: {Math.round(simulationResult.confidence * 100)}%
              </span>
            </div>

            <p className="text-secondary-text mb-1.5 font-sans">
              {simulationResult.explanation}
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal/80">
              <span className="font-semibold font-sans">Execution Trace:</span>
              <span>{simulationResult.explanation.includes('→') ? simulationResult.explanation : `q₀ (${activeDfa.startState}) ➔ ... ➔ ${currentStateId}`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceSimulator;
