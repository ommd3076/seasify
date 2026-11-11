export interface NFAState {
  id: string;
  isStart?: boolean;
  isAccepting?: boolean;
  acceptingPattern?: string;
}

export interface NFATransition {
  from: string;
  to: string;
  symbol: string | null; // null represents epsilon (ε)
}

export interface NFA {
  states: Set<string>;
  alphabet: Set<string>;
  startState: string;
  acceptingStates: Map<string, string>; // stateId -> patternId
  transitions: NFATransition[];
}

export interface DFATransition {
  from: string;
  to: string;
  symbol: string;
}

export interface DFA {
  states: Set<string>;
  alphabet: Set<string>;
  startState: string;
  acceptingStates: Map<string, string>; // stateId -> patternId
  transitions: DFATransition[];
}

export interface VisualStateNode {
  id: string;
  label: string;
  sublabel?: string;
  isStart: boolean;
  isAccepting: boolean;
  x: number;
  y: number;
  variant?: 'normal' | 'elevated' | 'recovery' | 'low';
}

export interface VisualTransitionEdge {
  from: string;
  to: string;
  label: string;
  symbol: string;
  conditionDescription?: string;
  isSelfLoop?: boolean;
  isBackEdge?: boolean;
}
