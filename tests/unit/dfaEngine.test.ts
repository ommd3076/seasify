import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSymbolNFA,
  createEpsilonNFA,
  concatenateNFAs,
  unionNFAs,
  starNFA,
  plusNFA,
  resetStateCounter,
} from '@/engine/automata/nfa';
import {
  epsilonClosure,
  move,
  determinizeNFA,
} from '@/engine/automata/determinize';
import { minimizeDFA } from '@/engine/automata/minimize';
import { parsePatternRuleToNFA, tokenizePattern } from '@/engine/automata/regexParser';
import { runStreamRecognition } from '@/engine/automata/streamMatcher';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';
import { WaterLevelPoint } from '@/types/noaa';

describe('Tier 1 & Tier 2 Unit: Formal Automata Engine (NFA, Determinization, Minimization, Execution)', () => {
  beforeEach(() => {
    resetStateCounter();
  });

  describe('NFA Construction (Thompson Algorithms)', () => {
    it('creates an elementary symbol NFA with exactly 2 states and 1 transition', () => {
      const nfa = createSymbolNFA('Rise', 'surge');
      expect(nfa.states.size).toBe(2);
      expect(nfa.alphabet.has('Rise')).toBe(true);
      expect(nfa.transitions).toHaveLength(1);
      expect(nfa.transitions[0].symbol).toBe('Rise');
      expect(nfa.acceptingStates.size).toBe(1);
    });

    it('creates an elementary epsilon transition NFA with null symbol', () => {
      const nfa = createEpsilonNFA('pat');
      expect(nfa.states.size).toBe(2);
      expect(nfa.transitions).toHaveLength(1);
      expect(nfa.transitions[0].symbol).toBeNull();
    });

    it('concatenates two NFAs (A · B) with epsilon bridge', () => {
      const a = createSymbolNFA('Rise');
      const b = createSymbolNFA('Hold');
      const concat = concatenateNFAs(a, b, 'surge');

      expect(concat.alphabet.has('Rise')).toBe(true);
      expect(concat.alphabet.has('Hold')).toBe(true);
      // Contains transitions for a, b, and the epsilon transition connecting accept(A) to start(B)
      expect(concat.transitions).toHaveLength(3);
      expect(concat.transitions.some(t => t.symbol === null)).toBe(true);
    });

    it('unions two NFAs (A | B) with branch and join epsilon transitions', () => {
      const a = createSymbolNFA('Rise');
      const b = createSymbolNFA('Hold');
      const union = unionNFAs(a, b, 'choice');

      expect(union.states.size).toBe(a.states.size + b.states.size + 2);
      // 2 branch epsilon transitions + 2 join epsilon transitions + 2 symbol transitions = 6
      expect(union.transitions).toHaveLength(6);
    });

    it('constructs Kleene star NFA (A*) allowing zero or more repetitions', () => {
      const a = createSymbolNFA('Hold');
      const star = starNFA(a, 'star_pattern');

      // Start state can bypass directly to accept state via epsilon
      const bypass = star.transitions.some(t => t.from === star.startState && t.symbol === null);
      expect(bypass).toBe(true);
    });

    it('constructs Plus NFA (A+) requiring at least one repetition', () => {
      const a = createSymbolNFA('Hold');
      const plus = plusNFA(a, 'plus_pattern');
      expect(plus.alphabet.has('Hold')).toBe(true);
      expect(plus.states.size).toBeGreaterThan(a.states.size);
    });
  });

  describe('Determinization: Subset Construction (NFA -> DFA)', () => {
    it('computes epsilon closure transitively over epsilon transitions', () => {
      const transitions = [
        { from: 'q0', to: 'q1', symbol: null },
        { from: 'q1', to: 'q2', symbol: null },
        { from: 'q2', to: 'q3', symbol: 'Rise' },
      ];
      const closure = epsilonClosure(new Set(['q0']), transitions);
      expect(closure.has('q0')).toBe(true);
      expect(closure.has('q1')).toBe(true);
      expect(closure.has('q2')).toBe(true);
      expect(closure.has('q3')).toBe(false); // 'q3' is behind a symbol transition
    });

    it('computes move set correctly for target symbol', () => {
      const transitions = [
        { from: 'q0', to: 'q1', symbol: 'Rise' },
        { from: 'q0', to: 'q2', symbol: 'Fall' },
        { from: 'q1', to: 'q3', symbol: 'Rise' },
      ];
      const moved = move(new Set(['q0', 'q1']), 'Rise', transitions);
      expect(moved.has('q1')).toBe(true);
      expect(moved.has('q3')).toBe(true);
      expect(moved.has('q2')).toBe(false);
    });

    it('determinizes an NFA with branches into a valid DFA with no epsilon transitions', () => {
      const a = createSymbolNFA('Rise');
      const b = createSymbolNFA('Hold');
      const union = unionNFAs(a, b, 'branch');
      const dfa = determinizeNFA(union);

      expect(dfa.states.size).toBeGreaterThanOrEqual(2);
      expect(dfa.transitions.every(t => t.symbol !== null)).toBe(true);
      expect(dfa.acceptingStates.size).toBeGreaterThan(0);
    });
  });

  describe('DFA Minimization (Hopcroft Partition Refinement)', () => {
    it('minimizes equivalent states while preserving distinct accepting classifications', () => {
      // Build a regex rule with redundant repetition: (Rise | Rise)
      const nfa = parsePatternRuleToNFA('Rise | Rise', 'rise_rule');
      const dfa = determinizeNFA(nfa);
      const minDFA = minimizeDFA(dfa);

      expect(minDFA.states.size).toBeLessThanOrEqual(dfa.states.size);
      expect(minDFA.acceptingStates.size).toBeGreaterThan(0);
      expect(minDFA.alphabet.has('Rise')).toBe(true);
    });

    it('leaves already-minimal DFAs unchanged', () => {
      const nfa = createSymbolNFA('Rise', 'simple');
      const dfa = determinizeNFA(nfa);
      const minDFA = minimizeDFA(dfa);
      expect(minDFA.states.size).toBe(dfa.states.size);
    });
  });

  describe('Regex Parsing & Tokenization', () => {
    it('tokenizes regular pattern expressions with identifiers and operators', () => {
      const tokens = tokenizePattern('Rise Hold+ (Fall | Stabilize)*');
      expect(tokens).toEqual(['Rise', 'Hold', '+', '(', 'Fall', '|', 'Stabilize', ')', '*']);
    });

    it('compiles regular pattern expression to NFA successfully', () => {
      const nfa = parsePatternRuleToNFA('Rise Hold (Fall | Normal)', 'recovery_rule');
      expect(nfa.alphabet.has('Rise')).toBe(true);
      expect(nfa.alphabet.has('Hold')).toBe(true);
      expect(nfa.alphabet.has('Fall')).toBe(true);
      expect(nfa.alphabet.has('Normal')).toBe(true);
      expect(nfa.acceptingStates.size).toBeGreaterThan(0);
    });
  });

  describe('Stream Matcher & Step Execution (StreamMatcher)', () => {
    const makePoint = (timestamp: string, residual: number, rateOfChange: number): WaterLevelPoint => ({
      timestamp,
      observed: 2.0 + residual,
      predicted: 2.0,
      residual,
      rateOfChange,
      zScore: 0,
      qualityFlag: 'verified',
    });

    it('executes step-by-step state transitions over incoming water level points', () => {
      const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'rapid_rise')!;
      const points: WaterLevelPoint[] = [
        makePoint('2026-11-12T00:00:00Z', 0.05, 0.0), // Normal
        makePoint('2026-11-12T00:06:00Z', 0.25, 0.35), // Rise
      ];

      const { matches, traces } = runStreamRecognition(points, '8518750', 'The Battery', dfa);
      expect(traces).toHaveLength(2);
      expect(traces[0].activeState).toBe('S0');
      expect(traces[1].activeState).toBe('S1');
      expect(traces[1].isAccepting).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].patternId).toBe('rapid_rise');
    });

    it('resets to start state when sequence deviates from pattern', () => {
      const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'sustained_elevated')!;
      const points: WaterLevelPoint[] = [
        makePoint('2026-11-12T00:00:00Z', 0.05, 0.0),  // Normal -> S0
        makePoint('2026-11-12T00:06:00Z', 0.25, 0.30), // Rise -> S1
        makePoint('2026-11-12T00:12:00Z', 0.02, -0.40), // Fall -> resets to S0
      ];

      const { matches, traces } = runStreamRecognition(points, '8518750', 'The Battery', dfa);
      expect(traces[2].activeState).toBe('S0');
      expect(matches).toHaveLength(0); // Sustained elevated requires consecutive hold
    });
  });
});
