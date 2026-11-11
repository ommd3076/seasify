import { create } from 'zustand';
import { FormalDFA, EventAlias } from '@/types/automata';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';
import { parsePatternRuleToNFA } from '@/engine/automata/regexParser';
import { determinizeNFA } from '@/engine/automata/determinize';
import { minimizeDFA } from '@/engine/automata/minimize';
import { DFA, NFA } from '@/engine/automata/types';

interface AutomataState {
  patterns: FormalDFA[];
  selectedPattern: FormalDFA;
  viewMode: 'state_flow' | 'nfa' | 'dfa' | 'minimized_dfa';
  activeNFA: NFA | null;
  activeDFA: DFA | null;
  activeMinimizedDFA: DFA | null;
  
  // Interactive Simulator
  inputTokens: EventAlias[];
  currentStepIndex: number;
  currentStateId: string;
  isSimulating: boolean;
  simulationResult: {
    matched: boolean;
    confidence: number;
    explanation: string;
  } | null;

  selectPattern: (patternId: string) => void;
  setViewMode: (mode: 'state_flow' | 'nfa' | 'dfa' | 'minimized_dfa') => void;
  addInputToken: (token: EventAlias) => void;
  removeInputToken: (index: number) => void;
  clearInputTokens: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  runFullSimulation: () => void;
}

export const useAutomataStore = create<AutomataState>((set, get) => {
  const initialPattern = PREDEFINED_PATTERNS[0];
  
  // Pre-generate formal machines
  const nfa = parsePatternRuleToNFA('Rise Hold+ Fall Stabilize?', initialPattern.id);
  const dfa = determinizeNFA(nfa);
  const minDfa = minimizeDFA(dfa);

  return {
    patterns: PREDEFINED_PATTERNS,
    selectedPattern: initialPattern,
    viewMode: 'state_flow',
    activeNFA: nfa,
    activeDFA: dfa,
    activeMinimizedDFA: minDfa,

    inputTokens: ['Rise', 'Hold', 'Hold', 'Fall'],
    currentStepIndex: 0,
    currentStateId: initialPattern.startState,
    isSimulating: false,
    simulationResult: {
      matched: true,
      confidence: 0.94,
      explanation: 'Normal → Elevated → Elevated → Recovery',
    },

    selectPattern: (patternId: string) => {
      const found = get().patterns.find((p) => p.id === patternId);
      if (found) {
        try {
          const newNfa = parsePatternRuleToNFA('Rise Hold+ Fall', found.id);
          const newDfa = determinizeNFA(newNfa);
          const newMinDfa = minimizeDFA(newDfa);
          set({
            selectedPattern: found,
            activeNFA: newNfa,
            activeDFA: newDfa,
            activeMinimizedDFA: newMinDfa,
            currentStateId: found.startState,
            currentStepIndex: 0,
            simulationResult: null,
          });
        } catch {
          set({ selectedPattern: found, currentStateId: found.startState });
        }
      }
    },

    setViewMode: (viewMode) => set({ viewMode }),

    addInputToken: (token: EventAlias) => {
      const updated = [...get().inputTokens, token];
      set({ inputTokens: updated });
      get().runFullSimulation();
    },

    removeInputToken: (index: number) => {
      const updated = get().inputTokens.filter((_, i) => i !== index);
      set({ inputTokens: updated });
      get().runFullSimulation();
    },

    clearInputTokens: () => {
      set({
        inputTokens: [],
        currentStepIndex: 0,
        currentStateId: get().selectedPattern.startState,
        simulationResult: null,
      });
    },

    stepSimulation: () => {
      const { inputTokens, currentStepIndex, currentStateId, selectedPattern } = get();
      if (currentStepIndex >= inputTokens.length) return;

      const token = inputTokens[currentStepIndex];
      const trans = selectedPattern.transitions.find(
        (t) => t.from === currentStateId && (t.symbol === token || t.label.includes(token))
      );

      const nextState = trans ? trans.to : currentStateId;
      const nextIndex = currentStepIndex + 1;
      const isAccepted = selectedPattern.acceptingStates.includes(nextState);

      set({
        currentStepIndex: nextIndex,
        currentStateId: nextState,
        simulationResult: {
          matched: isAccepted,
          confidence: isAccepted ? 0.94 : 0.45,
          explanation: `Transitioned on '${token}' to state ${nextState}${isAccepted ? ' (Accepting)' : ''}`,
        },
      });
    },

    resetSimulation: () => {
      set({
        currentStepIndex: 0,
        currentStateId: get().selectedPattern.startState,
        simulationResult: null,
      });
    },

    runFullSimulation: () => {
      const { inputTokens, selectedPattern } = get();
      let state = selectedPattern.startState;
      const path: string[] = [state];

      for (const token of inputTokens) {
        const trans = selectedPattern.transitions.find(
          (t) => t.from === state && (t.symbol === token || t.label.includes(token))
        );
        if (trans) {
          state = trans.to;
          path.push(state);
        }
      }

      const isAccepted = selectedPattern.acceptingStates.includes(state);
      set({
        currentStepIndex: inputTokens.length,
        currentStateId: state,
        simulationResult: {
          matched: isAccepted,
          confidence: isAccepted ? 0.94 : 0.40,
          explanation: isAccepted
            ? path.join(' → ')
            : `Ended in non-accepting state ${state}. Pattern not recognized.`,
        },
      });
    },
  };
});
