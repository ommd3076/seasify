import { PatternMatchResult } from './automata';

export type EventStatus = 'Open' | 'Resolved' | 'Acknowledged';

export interface AnomalyEvent extends PatternMatchResult {
  id: string;
  status: EventStatus;
  notes?: string;
  beforeReading?: {
    time: string;
    level: number;
    residual: number;
  };
  duringReading?: {
    time: string;
    level: number;
    residual: number;
  };
  afterReading?: {
    time: string;
    level: number;
    residual: number;
  };
}
