import { DFA, DFATransition, NFA, NFATransition } from './types';

/**
 * Computes epsilon-closure of a set of NFA states.
 * All states reachable from `states` via zero or more epsilon (null) transitions.
 */
export function epsilonClosure(states: Set<string>, transitions: NFATransition[]): Set<string> {
  const closure = new Set<string>(states);
  const stack = Array.from(states);

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const tr of transitions) {
      if (tr.from === current && tr.symbol === null) {
        if (!closure.has(tr.to)) {
          closure.add(tr.to);
          stack.push(tr.to);
        }
      }
    }
  }

  return closure;
}

/**
 * Computes move(states, symbol): all states reachable from `states` on an exact symbol transition.
 */
export function move(states: Set<string>, symbol: string, transitions: NFATransition[]): Set<string> {
  const result = new Set<string>();
  for (const s of states) {
    for (const tr of transitions) {
      if (tr.from === s && tr.symbol === symbol) {
        result.add(tr.to);
      }
    }
  }
  return result;
}

/**
 * Converts an NFA to an equivalent DFA using subset construction.
 */
export function determinizeNFA(nfa: NFA): DFA {
  const initialClosure = epsilonClosure(new Set([nfa.startState]), nfa.transitions);
  
  // Map set of NFA state IDs (sorted string key) to DFA state ID
  const setToKey = (s: Set<string>) => Array.from(s).sort().join(',');
  const keyToId = new Map<string, string>();
  let dfaCounter = 0;
  
  const initialKey = setToKey(initialClosure);
  const startDFAState = `D${dfaCounter++}`;
  keyToId.set(initialKey, startDFAState);

  const workQueue: Array<{ id: string; nfaSet: Set<string> }> = [
    { id: startDFAState, nfaSet: initialClosure }
  ];

  const dfaStates = new Set<string>([startDFAState]);
  const dfaTransitions: DFATransition[] = [];
  const dfaAccepting = new Map<string, string>();

  // Helper to check if NFA set contains accepting states
  const checkAccepting = (dfaId: string, nfaSet: Set<string>) => {
    for (const [accState, pat] of nfa.acceptingStates.entries()) {
      if (nfaSet.has(accState)) {
        dfaAccepting.set(dfaId, pat);
        break; // Priority to first match
      }
    }
  };

  checkAccepting(startDFAState, initialClosure);

  while (workQueue.length > 0) {
    const { id: uId, nfaSet: uSet } = workQueue.shift()!;

    for (const symbol of nfa.alphabet) {
      const moved = move(uSet, symbol, nfa.transitions);
      if (moved.size === 0) continue;

      const targetClosure = epsilonClosure(moved, nfa.transitions);
      if (targetClosure.size === 0) continue;

      const targetKey = setToKey(targetClosure);
      let targetId = keyToId.get(targetKey);

      if (!targetId) {
        targetId = `D${dfaCounter++}`;
        keyToId.set(targetKey, targetId);
        dfaStates.add(targetId);
        checkAccepting(targetId, targetClosure);
        workQueue.push({ id: targetId, nfaSet: targetClosure });
      }

      dfaTransitions.push({
        from: uId,
        to: targetId,
        symbol,
      });
    }
  }

  return {
    states: dfaStates,
    alphabet: nfa.alphabet,
    startState: startDFAState,
    acceptingStates: dfaAccepting,
    transitions: dfaTransitions,
  };
}
