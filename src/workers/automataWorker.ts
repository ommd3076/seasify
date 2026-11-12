import { runStreamRecognition, StreamRecognitionOutput } from '../engine/automata/streamMatcher';
import { PREDEFINED_PATTERNS } from '../engine/automata/predefinedRules';
import { DEFAULT_THRESHOLDS } from '../engine/science/symbolEncoder';
import { WaterLevelPoint } from '../types/noaa';
import { FormalDFA, ThresholdConfig } from '../types/automata';

export interface WorkerRecognitionRequest {
  id: string;
  type: 'RECOGNIZE_STREAM';
  payload: {
    points: WaterLevelPoint[];
    stationId: string;
    stationName: string;
    patternId?: string;
    thresholds?: ThresholdConfig;
  };
}

export interface WorkerRecognitionResponse {
  id: string;
  type: 'RECOGNIZE_STREAM_RESULT';
  success: boolean;
  result?: StreamRecognitionOutput;
  executionTimeMs?: number;
  error?: string;
}

// Web Worker message listener
self.onmessage = (e: MessageEvent<WorkerRecognitionRequest>) => {
  const { id, type, payload } = e.data;

  if (type === 'RECOGNIZE_STREAM') {
    const start = performance.now();
    try {
      const { points, stationId, stationName, patternId, thresholds } = payload;
      const dfa: FormalDFA = PREDEFINED_PATTERNS.find((p) => p.id === patternId) || PREDEFINED_PATTERNS[0];
      const appliedThresholds = thresholds || DEFAULT_THRESHOLDS;

      const result = runStreamRecognition(points, stationId, stationName, dfa, appliedThresholds);
      const executionTimeMs = performance.now() - start;

      const response: WorkerRecognitionResponse = {
        id,
        type: 'RECOGNIZE_STREAM_RESULT',
        success: true,
        result,
        executionTimeMs,
      };

      self.postMessage(response);
    } catch (err) {
      const response: WorkerRecognitionResponse = {
        id,
        type: 'RECOGNIZE_STREAM_RESULT',
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(response);
    }
  }
};
