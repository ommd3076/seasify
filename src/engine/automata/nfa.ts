import { NFA, NFATransition } from './types';

let stateCounter = 0;
export function resetStateCounter() {
  stateCounter = 0;
}

function nextStateId(prefix = 's'): string {
  return `${prefix}${stateCounter++}`;
}

/**
 * Creates an elementary NFA for a single symbol transition.
 * s0 --symbol--> s1
 */
export function createSymbolNFA(symbol: string, patternId?: string): NFA {
  const start = nextStateId();
  const accept = nextStateId();
  
  const states = new Set<string>([start, accept]);
  const alphabet = new Set<string>([symbol]);
  const transitions: NFATransition[] = [{ from: start, to: accept, symbol }];
  const acceptingStates = new Map<string, string>();
  if (patternId) {
    acceptingStates.set(accept, patternId);
  } else {
    acceptingStates.set(accept, 'accept');
  }

  return {
    states,
    alphabet,
    startState: start,
    acceptingStates,
    transitions,
  };
}

/**
 * Creates an elementary NFA for an epsilon (ε) transition.
 * s0 --ε--> s1
 */
export function createEpsilonNFA(patternId?: string): NFA {
  const start = nextStateId();
  const accept = nextStateId();

  const states = new Set<string>([start, accept]);
  const alphabet = new Set<string>();
  const transitions: NFATransition[] = [{ from: start, to: accept, symbol: null }];
  const acceptingStates = new Map<string, string>([[accept, patternId || 'accept']]);

  return {
    states,
    alphabet,
    startState: start,
    acceptingStates,
    transitions,
  };
}

/**
 * Concatenates two NFAs: A · B
 */
export function concatenateNFAs(a: NFA, b: NFA, patternId?: string): NFA {
  const states = new Set<string>([...a.states, ...b.states]);
  const alphabet = new Set<string>([...a.alphabet, ...b.alphabet]);
  const transitions: NFATransition[] = [...a.transitions, ...b.transitions];

  // Epsilon transitions from all accepting states of A to start state of B
  for (const acceptA of a.acceptingStates.keys()) {
    transitions.push({ from: acceptA, to: b.startState, symbol: null });
  }

  const acceptingStates = new Map<string, string>();
  for (const [acceptB, pat] of b.acceptingStates.entries()) {
    acceptingStates.set(acceptB, patternId || pat);
  }

  return {
    states,
    alphabet,
    startState: a.startState,
    acceptingStates,
    transitions,
  };
}

/**
 * Alternation of two NFAs: A | B
 */
export function unionNFAs(a: NFA, b: NFA, patternId?: string): NFA {
  const start = nextStateId();
  const accept = nextStateId();

  const states = new Set<string>([start, accept, ...a.states, ...b.states]);
  const alphabet = new Set<string>([...a.alphabet, ...b.alphabet]);
  const transitions: NFATransition[] = [
    ...a.transitions,
    ...b.transitions,
    { from: start, to: a.startState, symbol: null },
    { from: start, to: b.startState, symbol: null },
  ];

  for (const acceptA of a.acceptingStates.keys()) {
    transitions.push({ from: acceptA, to: accept, symbol: null });
  }
  for (const acceptB of b.acceptingStates.keys()) {
    transitions.push({ from: acceptB, to: accept, symbol: null });
  }

  const acceptingStates = new Map<string, string>([[accept, patternId || 'accept']]);

  return {
    states,
    alphabet,
    startState: start,
    acceptingStates,
    transitions,
  };
}

/**
 * Kleene Star: A*
 */
export function starNFA(a: NFA, patternId?: string): NFA {
  const start = nextStateId();
  const accept = nextStateId();

  const states = new Set<string>([start, accept, ...a.states]);
  const alphabet = new Set<string>(a.alphabet);
  const transitions: NFATransition[] = [
    ...a.transitions,
    { from: start, to: a.startState, symbol: null },
    { from: start, to: accept, symbol: null },
  ];

  for (const acceptA of a.acceptingStates.keys()) {
    transitions.push({ from: acceptA, to: a.startState, symbol: null });
    transitions.push({ from: acceptA, to: accept, symbol: null });
  }

  const acceptingStates = new Map<string, string>([[accept, patternId || 'accept']]);

  return {
    states,
    alphabet,
    startState: start,
    acceptingStates,
    transitions,
  };
}

/**
 * Plus repetition: A+
 */
export function plusNFA(a: NFA, patternId?: string): NFA {
  // A+ is A concatenated with A*
  const star = starNFA(a, patternId);
  return concatenateNFAs(a, star, patternId);
}
