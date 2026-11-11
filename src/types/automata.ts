export type ResidualCategory = 'L' | 'N' | 'H';
export type TrendCategory = 'F' | 'S' | 'R';

// Concrete combined 9-symbol alphabet
export type ConcreteSymbol = 
  | 'L:F' | 'L:S' | 'L:R'
  | 'N:F' | 'N:S' | 'N:R'
  | 'H:F' | 'H:S' | 'H:R'
  | 'GAP';

// High-level UI and rule aliases
export type EventAlias = 'Rise' | 'Hold' | 'Fall' | 'Stabilize' | 'Low' | 'Extreme' | 'Gap' | 'Normal';

export interface AutomataState {
  id: string;
  label: string;
  isStart?: boolean;
  isAccepting?: boolean;
  acceptingPattern?: string;
  description?: string;
}

export interface AutomataTransition {
  from: string;
  to: string;
  symbol: string; // ConcreteSymbol or alias or regex set
  label: string;
  conditionDescription?: string;
}

export interface FormalDFA {
  id: string;
  name: string;
  description: string;
  states: AutomataState[];
  alphabet: string[];
  startState: string;
  acceptingStates: string[];
  transitions: AutomataTransition[];
  ruleSummary: string;
  patternType: 'sustained_elevated' | 'sustained_depressed' | 'rapid_rise' | 'rapid_fall' | 'oscillatory' | 'abnormal_recovery' | 'record_gap';
}

export interface AutomataStepTrace {
  stepIndex: number;
  timestamp: string;
  observedLevel: number | null;
  predictedLevel: number | null;
  residual: number | null;
  rateOfChange: number | null;
  symbol: ConcreteSymbol;
  symbolAlias: EventAlias;
  symbolConfidence: number;
  previousState: string;
  activeState: string;
  transitionCondition: string;
  isAccepting: boolean;
  matchedPatternId?: string;
}

export interface PatternMatchResult {
  matchId: string;
  patternId: string;
  patternName: string;
  stationId: string;
  stationName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  peakTime: string;
  peakResidual: number;
  baselineResidual: number;
  confidence: number;
  severity: 'High' | 'Moderate' | 'Low';
  statePath: string[];
  triggerSteps: AutomataStepTrace[];
  explanation: string;
}

export interface ThresholdConfig {
  positiveResidualMeters: number; // default: 0.20 m
  negativeResidualMeters: number; // default: -0.20 m
  extremeResidualMeters: number;  // default: 0.50 m
  risingRateThreshold: number;    // default: 0.20 m/hr
  fallingRateThreshold: number;   // default: -0.20 m/hr
  gapThresholdMinutes: number;    // default: 30 min
  minSustainedSamples: number;    // default: 3 samples (18 mins)
}
