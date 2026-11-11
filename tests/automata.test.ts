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
import { epsilonClosure, move, determinizeNFA } from '@/engine/automata/determinize';
import { minimizeDFA } from '@/engine/automata/minimize';
import { DFA, NFATransition } from '@/engine/automata/types';

describe('Finite Automata Engine', () => {
  beforeEach(() => {
    resetStateCounter();
  });

  describe('Thompson NFA Construction', () => {
    it('creates an elementary symbol NFA', () => {
      const nfa = createSymbolNFA('Rise', 'surge_init');
      expect(nfa.states.size).toBe(2);
      expect(nfa.alphabet.has('Rise')).toBe(true);
      expect(nfa.startState).toBeDefined();
      expect(nfa.acceptingStates.size).toBe(1);
      
      const [acceptState, pattern] = Array.from(nfa.acceptingStates.entries())[0];
      expect(pattern).toBe('surge_init');
      expect(nfa.transitions).toHaveLength(1);
      expect(nfa.transitions[0]).toEqual({
        from: nfa.startState,
        to: acceptState,
        symbol: 'Rise',
      });
    });

    it('creates an epsilon NFA', () => {
      const nfa = createEpsilonNFA('optional_pass');
      expect(nfa.states.size).toBe(2);
      expect(nfa.alphabet.size).toBe(0);
      expect(nfa.transitions).toHaveLength(1);
      expect(nfa.transitions[0].symbol).toBeNull();
      expect(Array.from(nfa.acceptingStates.values())[0]).toBe('optional_pass');
    });

    it('concatenates two NFAs (A · B)', () => {
      const a = createSymbolNFA('Rise');
      const b = createSymbolNFA('Hold', 'sustained');
      const concat = concatenateNFAs(a, b, 'sustained');

      // State count = 2 from A + 2 from B = 4
      expect(concat.states.size).toBe(4);
      expect(concat.alphabet.has('Rise')).toBe(true);
      expect(concat.alphabet.has('Hold')).toBe(true);
      expect(concat.startState).toBe(a.startState);

      // Should have an epsilon transition from A's accept to B's start
      const acceptA = Array.from(a.acceptingStates.keys())[0];
      const connectingEpsilon = concat.transitions.find(
        t => t.from === acceptA && t.to === b.startState && t.symbol === null
      );
      expect(connectingEpsilon).toBeDefined();

      // Accepting state is B's accept state
      const acceptB = Array.from(b.acceptingStates.keys())[0];
      expect(concat.acceptingStates.get(acceptB)).toBe('sustained');
    });

    it('unions two NFAs (A | B)', () => {
      const a = createSymbolNFA('Rise');
      const b = createSymbolNFA('Fall');
      const union = unionNFAs(a, b, 'surge_or_drop');

      // 2 states from A, 2 from B, + 1 new start, + 1 new accept = 6 states
      expect(union.states.size).toBe(6);
      expect(union.alphabet.has('Rise')).toBe(true);
      expect(union.alphabet.has('Fall')).toBe(true);

      // Transitions from union start to a.start and b.start
      const toA = union.transitions.find(t => t.from === union.startState && t.to === a.startState && t.symbol === null);
      const toB = union.transitions.find(t => t.from === union.startState && t.to === b.startState && t.symbol === null);
      expect(toA).toBeDefined();
      expect(toB).toBeDefined();

      expect(union.acceptingStates.size).toBe(1);
      expect(Array.from(union.acceptingStates.values())[0]).toBe('surge_or_drop');
    });

    it('applies Kleene star (A*)', () => {
      const a = createSymbolNFA('Hold');
      const star = starNFA(a, 'zero_or_more_holds');

      // 2 from A + 1 new start + 1 new accept = 4 states
      expect(star.states.size).toBe(4);
      expect(star.alphabet.has('Hold')).toBe(true);

      // Start to accept epsilon transition exists (accepts empty string)
      const acceptId = Array.from(star.acceptingStates.keys())[0];
      const emptySkip = star.transitions.find(
        t => t.from === star.startState && t.to === acceptId && t.symbol === null
      );
      expect(emptySkip).toBeDefined();

      // Feedback loop from a accept to a start
      const acceptA = Array.from(a.acceptingStates.keys())[0];
      const loop = star.transitions.find(
        t => t.from === acceptA && t.to === a.startState && t.symbol === null
      );
      expect(loop).toBeDefined();
    });

    it('applies Plus repetition (A+)', () => {
      const a = createSymbolNFA('Hold');
      const plus = plusNFA(a, 'one_or_more_holds');

      // Plus is A · A*
      expect(plus.states.size).toBeGreaterThan(a.states.size);
      expect(plus.alphabet.has('Hold')).toBe(true);
      expect(plus.startState).toBe(a.startState);
    });
  });

  describe('Epsilon Closure & Move', () => {
    it('computes epsilon closure of single isolated state', () => {
      const transitions: NFATransition[] = [
        { from: 's0', to: 's1', symbol: 'Rise' },
      ];
      const closure = epsilonClosure(new Set(['s0']), transitions);
      expect(Array.from(closure)).toEqual(['s0']);
    });

    it('computes multi-hop epsilon transitions recursively', () => {
      const transitions: NFATransition[] = [
        { from: 's0', to: 's1', symbol: null },
        { from: 's1', to: 's2', symbol: null },
        { from: 's2', to: 's3', symbol: 'Hold' }, // Not epsilon
        { from: 's1', to: 's4', symbol: null },
      ];
      const closure = epsilonClosure(new Set(['s0']), transitions);
      expect(Array.from(closure).sort()).toEqual(['s0', 's1', 's2', 's4']);
    });

    it('safely terminates when epsilon transitions contain cycles', () => {
      const transitions: NFATransition[] = [
        { from: 's0', to: 's1', symbol: null },
        { from: 's1', to: 's2', symbol: null },
        { from: 's2', to: 's0', symbol: null }, // Cycle back to s0
      ];
      const closure = epsilonClosure(new Set(['s0']), transitions);
      expect(Array.from(closure).sort()).toEqual(['s0', 's1', 's2']);
    });

    it('computes move set for specific symbol transitions', () => {
      const transitions: NFATransition[] = [
        { from: 's0', to: 's1', symbol: 'Rise' },
        { from: 's0', to: 's2', symbol: 'Fall' },
        { from: 's3', to: 's4', symbol: 'Rise' },
      ];
      const moved = move(new Set(['s0', 's3']), 'Rise', transitions);
      expect(Array.from(moved).sort()).toEqual(['s1', 's4']);

      const movedFall = move(new Set(['s0', 's3']), 'Fall', transitions);
      expect(Array.from(movedFall)).toEqual(['s2']);

      const movedHold = move(new Set(['s0', 's3']), 'Hold', transitions);
      expect(Array.from(movedHold)).toEqual([]);
    });
  });

  describe('Subset Construction Determinization (NFA -> DFA)', () => {
    it('determinizes an NFA into a deterministic DFA', () => {
      // Build NFA for: Rise Hold* Fall
      const rise = createSymbolNFA('Rise');
      const hold = createSymbolNFA('Hold');
      const fall = createSymbolNFA('Fall', 'surge_event');
      const holdStar = starNFA(hold);
      const nfa = concatenateNFAs(rise, concatenateNFAs(holdStar, fall, 'surge_event'), 'surge_event');

      const dfa = determinizeNFA(nfa);

      expect(dfa.states.size).toBeGreaterThan(0);
      expect(dfa.startState).toBeDefined();
      expect(dfa.alphabet.has('Rise')).toBe(true);
      expect(dfa.alphabet.has('Hold')).toBe(true);
      expect(dfa.alphabet.has('Fall')).toBe(true);

      // Verify that every (state, symbol) in DFA has at most ONE outgoing transition
      const transitionKeys = new Set<string>();
      for (const tr of dfa.transitions) {
        const key = `${tr.from}:${tr.symbol}`;
        expect(transitionKeys.has(key)).toBe(false);
        transitionKeys.add(key);
      }

      // Verify accepting states retain 'surge_event' patternId
      expect(dfa.acceptingStates.size).toBeGreaterThan(0);
      for (const pattern of dfa.acceptingStates.values()) {
        expect(pattern).toBe('surge_event');
      }
    });

    it('correctly simulates accepted and rejected word sequences on determinized DFA', () => {
      // Regex: (Rise | Hold) Fall+
      const rise = createSymbolNFA('Rise');
      const hold = createSymbolNFA('Hold');
      const fall = createSymbolNFA('Fall', 'matched');
      const union = unionNFAs(rise, hold);
      const fallPlus = plusNFA(fall, 'matched');
      const nfa = concatenateNFAs(union, fallPlus, 'matched');

      const dfa = determinizeNFA(nfa);

      // Helper function to step DFA on a word
      const accepts = (symbols: string[]): boolean => {
        let state = dfa.startState;
        for (const sym of symbols) {
          const tr = dfa.transitions.find(t => t.from === state && t.symbol === sym);
          if (!tr) return false;
          state = tr.to;
        }
        return dfa.acceptingStates.has(state);
      };

      // Valid paths
      expect(accepts(['Rise', 'Fall'])).toBe(true);
      expect(accepts(['Hold', 'Fall'])).toBe(true);
      expect(accepts(['Rise', 'Fall', 'Fall'])).toBe(true);
      expect(accepts(['Hold', 'Fall', 'Fall', 'Fall'])).toBe(true);

      // Invalid paths
      expect(accepts([])).toBe(false);
      expect(accepts(['Rise'])).toBe(false);
      expect(accepts(['Fall'])).toBe(false);
      expect(accepts(['Rise', 'Hold'])).toBe(false);
      expect(accepts(['Rise', 'Fall', 'Rise'])).toBe(false);
    });
  });

  describe('DFA Minimization', () => {
    it('returns equivalent DFA if already minimal', () => {
      const dfa: DFA = {
        states: new Set(['q0', 'q1']),
        alphabet: new Set(['a']),
        startState: 'q0',
        acceptingStates: new Map([['q1', 'pat_a']]),
        transitions: [{ from: 'q0', to: 'q1', symbol: 'a' }],
      };
      const minDFA = minimizeDFA(dfa);
      expect(minDFA.states.size).toBe(2);
      expect(minDFA.acceptingStates.get('q1')).toBe('pat_a');
    });

    it('collapses redundant non-accepting states', () => {
      // q1 and q2 are equivalent non-accepting states that both go to q3 on symbol 'b'
      // q0 --a--> q1
      // q0 --c--> q2
      // q1 --b--> q3 (accepting)
      // q2 --b--> q3 (accepting)
      const dfa: DFA = {
        states: new Set(['q0', 'q1', 'q2', 'q3']),
        alphabet: new Set(['a', 'b', 'c']),
        startState: 'q0',
        acceptingStates: new Map([['q3', 'pat_match']]),
        transitions: [
          { from: 'q0', to: 'q1', symbol: 'a' },
          { from: 'q0', to: 'q2', symbol: 'c' },
          { from: 'q1', to: 'q3', symbol: 'b' },
          { from: 'q2', to: 'q3', symbol: 'b' },
        ],
      };

      const minDFA = minimizeDFA(dfa);
      // q1 and q2 can be partitioned together because their transition signatures on (a, b, c) are identical!
      expect(minDFA.states.size).toBe(3);
      expect(minDFA.acceptingStates.size).toBe(1);
    });

    it('DOES NOT merge accepting states that have distinct accepting labels', () => {
      // q1 has label 'surge', q2 has label 'blowout'
      // Even if both have the exact same transitions, they represent distinct oceanographic anomalies
      // and must remain distinct states in the minimized automaton.
      const dfa: DFA = {
        states: new Set(['q0', 'q1', 'q2']),
        alphabet: new Set(['a', 'b']),
        startState: 'q0',
        acceptingStates: new Map([
          ['q1', 'surge'],
          ['q2', 'blowout'],
        ]),
        transitions: [
          { from: 'q0', to: 'q1', symbol: 'a' },
          { from: 'q0', to: 'q2', symbol: 'b' },
        ],
      };

      const minDFA = minimizeDFA(dfa);

      // Must still have 3 distinct states (q0, representative of q1, representative of q2)
      expect(minDFA.states.size).toBe(3);
      expect(minDFA.acceptingStates.size).toBe(2);

      const patterns = Array.from(minDFA.acceptingStates.values());
      expect(patterns).toContain('surge');
      expect(patterns).toContain('blowout');
    });

    it('merges accepting states ONLY IF they share the same accepting label and transition signatures', () => {
      // q1 and q2 both have label 'surge' and both loop on 's' to themselves
      const dfa: DFA = {
        states: new Set(['q0', 'q1', 'q2']),
        alphabet: new Set(['a', 'b']),
        startState: 'q0',
        acceptingStates: new Map([
          ['q1', 'surge'],
          ['q2', 'surge'],
        ]),
        transitions: [
          { from: 'q0', to: 'q1', symbol: 'a' },
          { from: 'q0', to: 'q2', symbol: 'b' },
        ],
      };

      const minDFA = minimizeDFA(dfa);
      // Since q1 and q2 have same pattern 'surge' and identical empty/terminal transitions, they merge into 1 accepting state
      expect(minDFA.states.size).toBe(2);
      expect(minDFA.acceptingStates.size).toBe(1);
      expect(Array.from(minDFA.acceptingStates.values())[0]).toBe('surge');
    });
  });
});
