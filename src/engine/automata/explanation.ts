export function generateScientificExplanation(
  patternId: string,
  peakResidual: number,
  durationMinutes: number,
  stationName: string,
  peakTime: string
): string {
  const formattedPeak = (peakResidual >= 0 ? `+${peakResidual.toFixed(2)}` : peakResidual.toFixed(2)) + ' m';
  const hours = Math.round(durationMinutes / 60);
  const durStr = hours > 1 ? `${hours} hours` : `${durationMinutes} minutes`;
  const timeStr = new Date(peakTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  switch (patternId) {
    case 'abnormal_recovery':
      return `A transient elevated surge pulse of ${formattedPeak} was recorded at ${stationName}, peaking at ${timeStr}. Following an elevation phase, the water level demonstrated an atypical recovery trajectory lasting ${durStr} before returning to predicted astronomical baseline.`;
    
    case 'sustained_elevated':
      return `A sustained positive residual of ${formattedPeak} was observed at ${stationName} for ${durStr}. This pattern indicates prolonged coastal onshore wind setup or barometric inverse-barometer effect consistent with regional low-pressure systems.`;

    case 'sustained_depressed':
      return `A sustained negative residual (blowout) reaching ${formattedPeak} persisted for ${durStr} at ${stationName}. This condition is typically driven by strong offshore winds evacuating coastal embayments or intense anticyclonic high pressure.`;

    case 'rapid_rise':
      return `A rapid rate of residual increase peaking at ${formattedPeak} was detected at ${stationName} at ${timeStr}. Such abrupt surge transitions are often associated with squall line passage, frontal squalls, or rapid wind shifts.`;

    case 'oscillatory':
      return `Periodic water-level oscillations with peak amplitude of ${formattedPeak} were recorded at ${stationName} over ${durStr}. This multi-cycle signature indicates resonant harbor seiche oscillations stimulated by atmospheric pressure jumps or long-period wave groups.`;

    case 'record_gap':
      return `An observation telemetry dropout spanning ${durStr} occurred at ${stationName}, interrupting the 6-minute continuous observation series. State progression was suspended during this interval to prevent false anomaly classifications.`;

    default:
      return `A water-level residual anomaly of ${formattedPeak} was identified at ${stationName} over ${durStr}, matching the deterministic state transition rules for ${patternId}.`;
  }
}
