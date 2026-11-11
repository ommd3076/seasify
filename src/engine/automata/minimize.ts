import { DFA, DFATransition } from './types';

/**
 * Minimizes a DFA using partition refinement (Hopcroft's algorithm variant).
 * Crucial: Does not merge accepting states that have distinct output pattern labels.
 */
export function minimizeDFA(dfa: DFA): DFA {
  const statesArray = Array.from(dfa.states);
  if (statesArray.length <= 1) return dfa;

  // 1. Initial partition P:
  // - Group non-accepting states into one partition
  // - Group accepting states by their specific accepting pattern label
  const nonAccepting = statesArray.filter(s => !dfa.acceptingStates.has(s));
  const patternToAccepting = new Map<string, string[]>();

  for (const [state, pattern] of dfa.acceptingStates.entries()) {
    if (!patternToAccepting.has(pattern)) {
      patternToAccepting.set(pattern, []);
    }
    patternToAccepting.get(pattern)!.push(state);
  }

  let partitions: string[][] = [];
  if (nonAccepting.length > 0) {
    partitions.push(nonAccepting);
  }
  for (const group of patternToAccepting.values()) {
    partitions.push(group);
  }

  // Fast lookup: state -> partition index
  const getPartitionIndex = (state: string, parts: string[][]): number => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes(state)) return i;
    }
    return -1;
  };

  // Transition lookup: (state, symbol) -> nextState
  const transMap = new Map<string, string>();
  for (const tr of dfa.transitions) {
    transMap.set(`${tr.from}:${tr.symbol}`, tr.to);
  }

  const alphabet = Array.from(dfa.alphabet);

  // 2. Partition refinement loop
  let changed = true;
  while (changed) {
    changed = false;
    const newPartitions: string[][] = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Group states by signature of where each symbol transitions to
      const signatureMap = new Map<string, string[]>();

      for (const s of group) {
        const sig = alphabet
          .map(sym => {
            const next = transMap.get(`${s}:${sym}`);
            return next ? getPartitionIndex(next, partitions) : -1;
          })
          .join('|');

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, []);
        }
        signatureMap.get(sig)!.push(s);
      }

      if (signatureMap.size > 1) {
        changed = true;
        for (const splitGroup of signatureMap.values()) {
          newPartitions.push(splitGroup);
        }
      } else {
        newPartitions.push(group);
      }
    }

    partitions = newPartitions;
  }

  // 3. Reconstruct minimized DFA
  // Pick representative for each partition (preferably start state if in partition)
  const stateToRep = new Map<string, string>();
  const repStates = new Set<string>();
  let minStartState = '';

  for (let i = 0; i < partitions.length; i++) {
    const group = partitions[i];
    let rep = group[0];
    if (group.includes(dfa.startState)) {
      rep = dfa.startState;
      minStartState = rep;
    }
    for (const s of group) {
      stateToRep.set(s, rep);
    }
    repStates.add(rep);
  }

  if (!minStartState) {
    minStartState = stateToRep.get(dfa.startState) || Array.from(repStates)[0];
  }

  // Minimized transitions
  const minTransitions: DFATransition[] = [];
  const visitedTrans = new Set<string>();

  for (const tr of dfa.transitions) {
    const repFrom = stateToRep.get(tr.from)!;
    const repTo = stateToRep.get(tr.to)!;
    const key = `${repFrom}:${tr.symbol}:${repTo}`;

    if (!visitedTrans.has(key)) {
      visitedTrans.add(key);
      minTransitions.push({
        from: repFrom,
        to: repTo,
        symbol: tr.symbol,
      });
    }
  }

  // Minimized accepting states
  const minAccepting = new Map<string, string>();
  for (const [state, pat] of dfa.acceptingStates.entries()) {
    const rep = stateToRep.get(state)!;
    minAccepting.set(rep, pat);
  }

  return {
    states: repStates,
    alphabet: dfa.alphabet,
    startState: minStartState,
    acceptingStates: minAccepting,
    transitions: minTransitions,
  };
}
