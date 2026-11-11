import { AutomataStepTrace, FormalDFA, PatternMatchResult, ThresholdConfig } from '@/types/automata';
import { WaterLevelPoint } from '@/types/noaa';
import { DEFAULT_THRESHOLDS, encodePointToSymbol } from '../science/symbolEncoder';
import { generateScientificExplanation } from './explanation';
import { PREDEFINED_PATTERNS } from './predefinedRules';

export interface StreamRecognitionOutput {
  matches: PatternMatchResult[];
  traces: AutomataStepTrace[];
}

/**
 * Runs a continuous time series of WaterLevelPoints through one or more formal DFAs.
 * Generates step-by-step traces and extracts deduplicated pattern matches.
 */
export function runStreamRecognition(
  points: WaterLevelPoint[],
  stationId: string,
  stationName: string,
  dfa: FormalDFA = PREDEFINED_PATTERNS[0],
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): StreamRecognitionOutput {
  if (!points || points.length === 0) {
    return { matches: [], traces: [] };
  }

  const traces: AutomataStepTrace[] = [];
  const rawMatches: PatternMatchResult[] = [];

  let currentState = dfa.startState;
  let activeSequenceStartIdx = 0;
  let currentPath: string[] = [currentState];
  let currentSteps: AutomataStepTrace[] = [];

  // Build fast transition lookup: `${from}:${symbol}` -> to
  const transitionMap = new Map<string, { to: string; label: string; condition?: string }>();
  for (const tr of dfa.transitions) {
    transitionMap.set(`${tr.from}:${tr.symbol}`, {
      to: tr.to,
      label: tr.label,
      condition: tr.conditionDescription,
    });
  }

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const prevCategory = i > 0 && points[i - 1].residual !== null
      ? (points[i - 1].residual! > thresholds.positiveResidualMeters ? 'H' : (points[i - 1].residual! < thresholds.negativeResidualMeters ? 'L' : 'N'))
      : undefined;

    const encoded = encodePointToSymbol(pt, thresholds, prevCategory);
    const prevState = currentState;

    // Check transition on high-level alias first, then concrete symbol
    let trans = transitionMap.get(`${currentState}:${encoded.alias}`) ||
                transitionMap.get(`${currentState}:${encoded.symbol}`);

    if (!trans && encoded.alias === 'Extreme') {
      const fallbackAlias = encoded.trendCategory === 'R' ? 'Rise' : (encoded.trendCategory === 'F' ? 'Fall' : 'Hold');
      trans = transitionMap.get(`${currentState}:${fallbackAlias}`);
    }

    let nextState = currentState;
    let condDesc = 'No matching transition (remain)';

    if (trans) {
      nextState = trans.to;
      condDesc = trans.condition || trans.label;
    } else {
      // If no valid transition, check if we can reset to start state on Normal or fallback
      const resetTrans = transitionMap.get(`${currentState}:Normal`) ||
                         transitionMap.get(`${currentState}:Stabilize`);
      if (resetTrans) {
        nextState = resetTrans.to;
        condDesc = resetTrans.condition || resetTrans.label;
      }
    }

    currentState = nextState;
    currentPath.push(currentState);

    const isAccepting = dfa.acceptingStates.includes(currentState);

    const stepTrace: AutomataStepTrace = {
      stepIndex: i,
      timestamp: pt.timestamp,
      observedLevel: pt.observed,
      predictedLevel: pt.predicted,
      residual: pt.residual,
      rateOfChange: pt.rateOfChange,
      symbol: encoded.symbol,
      symbolAlias: encoded.alias,
      symbolConfidence: encoded.confidence,
      previousState: prevState,
      activeState: currentState,
      transitionCondition: condDesc,
      isAccepting,
      matchedPatternId: isAccepting ? dfa.id : undefined,
    };

    traces.push(stepTrace);
    currentSteps.push(stepTrace);

    // If an accepting state is reached, record a candidate match
    if (isAccepting) {
      const matchSteps = [...currentSteps];
      const startPt = points[activeSequenceStartIdx] || pt;
      const endPt = pt;
      
      const startTime = startPt.timestamp;
      const endTime = endPt.timestamp;
      const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
      const durationMinutes = Math.max(18, Math.round(durationMs / (1000 * 60)));

      // Find peak residual in the sequence
      let peakResidual = 0;
      let peakTime = pt.timestamp;
      for (const st of matchSteps) {
        if (st.residual !== null && Math.abs(st.residual) > Math.abs(peakResidual)) {
          peakResidual = st.residual;
          peakTime = st.timestamp;
        }
      }

      const severity = Math.abs(peakResidual) >= thresholds.extremeResidualMeters
        ? 'High'
        : (Math.abs(peakResidual) >= thresholds.positiveResidualMeters ? 'Moderate' : 'Low');

      const explanation = generateScientificExplanation(
        dfa.id,
        peakResidual,
        durationMinutes,
        stationName,
        peakTime
      );

      rawMatches.push({
        matchId: `match-${stationId}-${dfa.id}-${Date.parse(startTime)}`,
        patternId: dfa.id,
        patternName: dfa.name,
        stationId,
        stationName,
        startTime,
        endTime,
        durationMinutes,
        peakTime,
        peakResidual,
        baselineResidual: 0.02,
        confidence: 0.92,
        severity,
        statePath: [...currentPath],
        triggerSteps: matchSteps,
        explanation,
      });

      // Reset sequence tracker after match
      activeSequenceStartIdx = i;
      currentSteps = [stepTrace];
      currentPath = [currentState];
    }

    // If we returned to start state, reset the start index
    if (currentState === dfa.startState) {
      activeSequenceStartIdx = i + 1;
      currentSteps = [];
      currentPath = [dfa.startState];
    }
  }

  // Deduplicate overlapping events within 60 minutes
  const deduplicatedMatches: PatternMatchResult[] = [];
  for (const m of rawMatches) {
    const existing = deduplicatedMatches.find(
      d => d.patternId === m.patternId &&
           Math.abs(new Date(d.endTime).getTime() - new Date(m.startTime).getTime()) < 60 * 60 * 1000
    );

    if (existing) {
      // Merge: keep the higher magnitude peak
      if (Math.abs(m.peakResidual) > Math.abs(existing.peakResidual)) {
        existing.peakResidual = m.peakResidual;
        existing.peakTime = m.peakTime;
        existing.endTime = m.endTime;
        existing.durationMinutes += m.durationMinutes;
        existing.explanation = generateScientificExplanation(
          m.patternId,
          existing.peakResidual,
          existing.durationMinutes,
          stationName,
          existing.peakTime
        );
      }
    } else {
      deduplicatedMatches.push(m);
    }
  }

  return {
    matches: deduplicatedMatches,
    traces,
  };
}

/**
 * Runs stream recognition across ALL predefined patterns.
 */
export function runAllPatternsRecognition(
  points: WaterLevelPoint[],
  stationId: string,
  stationName: string,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): StreamRecognitionOutput {
  const allMatches: PatternMatchResult[] = [];
  let primaryTraces: AutomataStepTrace[] = [];

  for (let i = 0; i < PREDEFINED_PATTERNS.length; i++) {
    const dfa = PREDEFINED_PATTERNS[i];
    const { matches, traces } = runStreamRecognition(points, stationId, stationName, dfa, thresholds);
    allMatches.push(...matches);
    if (i === 0) {
      primaryTraces = traces;
    }
  }

  // Sort chronologically
  allMatches.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return {
    matches: allMatches,
    traces: primaryTraces,
  };
}
