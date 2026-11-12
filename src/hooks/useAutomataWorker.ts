import { useEffect, useRef, useState, useCallback } from 'react';
import { WaterLevelPoint } from '@/types/noaa';
import { ThresholdConfig } from '@/types/automata';
import { runStreamRecognition, StreamRecognitionOutput } from '@/engine/automata/streamMatcher';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';
import { DEFAULT_THRESHOLDS } from '@/engine/science/symbolEncoder';
import type { WorkerRecognitionRequest, WorkerRecognitionResponse } from '@/workers/automataWorker';

export interface UseAutomataWorkerReturn {
  isProcessing: boolean;
  lastExecutionTimeMs: number | null;
  recognizeStream: (
    points: WaterLevelPoint[],
    stationId: string,
    stationName: string,
    patternId?: string,
    thresholds?: ThresholdConfig
  ) => Promise<StreamRecognitionOutput>;
}

export function useAutomataWorker(): UseAutomataWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, {
    resolve: (res: StreamRecognitionOutput) => void;
    reject: (err: Error) => void;
  }>>(new Map());

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastExecutionTimeMs, setLastExecutionTimeMs] = useState<number | null>(null);

  useEffect(() => {
    // Only instantiate Web Worker if supported by the browser runtime
    if (typeof Worker !== 'undefined') {
      try {
        const worker = new Worker(
          new URL('../workers/automataWorker.ts', import.meta.url),
          { type: 'module' }
        );

        worker.onmessage = (e: MessageEvent<WorkerRecognitionResponse>) => {
          const { id, success, result, executionTimeMs, error } = e.data;
          const handler = pendingRequests.current.get(id);

          if (handler) {
            pendingRequests.current.delete(id);
            if (pendingRequests.current.size === 0) {
              setIsProcessing(false);
            }
            if (executionTimeMs !== undefined) {
              setLastExecutionTimeMs(executionTimeMs);
            }

            if (success && result) {
              handler.resolve(result);
            } else {
              handler.reject(new Error(error || 'Worker recognition failed'));
            }
          }
        };

        workerRef.current = worker;
      } catch {
        // Fallback to inline processing in test or unsupported worker environments
        workerRef.current = null;
      }
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRequests.current.clear();
    };
  }, []);

  const recognizeStream = useCallback(
    async (
      points: WaterLevelPoint[],
      stationId: string,
      stationName: string,
      patternId?: string,
      thresholds?: ThresholdConfig
    ): Promise<StreamRecognitionOutput> => {
      // If Web Worker is available, offload execution to the background thread
      if (workerRef.current) {
        setIsProcessing(true);
        const id = Math.random().toString(36).substring(2, 9);

        const request: WorkerRecognitionRequest = {
          id,
          type: 'RECOGNIZE_STREAM',
          payload: { points, stationId, stationName, patternId, thresholds },
        };

        return new Promise<StreamRecognitionOutput>((resolve, reject) => {
          pendingRequests.current.set(id, { resolve, reject });
          workerRef.current!.postMessage(request);
        });
      }

      // Synchronous fallback for headless, JSDOM, or legacy environments
      const start = performance.now();
      const dfa = PREDEFINED_PATTERNS.find((p) => p.id === patternId) || PREDEFINED_PATTERNS[0];
      const appliedThresholds = thresholds || DEFAULT_THRESHOLDS;
      const result = runStreamRecognition(points, stationId, stationName, dfa, appliedThresholds);
      setLastExecutionTimeMs(performance.now() - start);
      return result;
    },
    []
  );

  return {
    isProcessing,
    lastExecutionTimeMs,
    recognizeStream,
  };
}
