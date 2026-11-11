import React, { useEffect, useMemo } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Wifi,
  BatteryCharging,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  Sliders,
  Layers,
} from 'lucide-react';
import { useStationStore } from '@/stores/stationStore';
import { useTideDataStore } from '@/stores/tideDataStore';
import { TideChart } from '@/components/charts/TideChart';
import { ResidualChart } from '@/components/charts/ResidualChart';

export const MonitoringScreen: React.FC = () => {
  const { selectedStation } = useStationStore();
  const {
    points,
    events,
    loadStationData,
    selectedTimeRange,
    isLoading,
  } = useTideDataStore();

  useEffect(() => {
    if (points.length === 0) {
      loadStationData(selectedStation.id, selectedStation.name, 24);
    }
  }, [selectedStation.id]);

  // Compute latest telemetry metrics from points
  const latestPoint = points[points.length - 1];
  const currentObserved = latestPoint?.observed ?? selectedStation.waterLevel;
  const currentPredicted = latestPoint?.predicted ?? selectedStation.predictedLevel;
  const currentResidual = latestPoint?.residual ?? selectedStation.residual;
  const currentRateOfChange = latestPoint?.rateOfChange ?? 0.08;
  const currentZScore = latestPoint?.zScore ?? (currentResidual / 0.12);

  // Compute active condition flags
  const isSurgeCondition = Math.abs(currentResidual) > 0.20;
  const isRapidRateCondition = Math.abs(currentRateOfChange) > 0.20;
  const isExtremeSurge = Math.abs(currentResidual) > 0.40;

  return (
    <div className="space-y-6">
      {/* 4 Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Current Level Charcoal Card */}
        <div className="bg-charcoal text-white rounded-[28px] p-6 border border-charcoal-border shadow-panel flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-widest text-mint uppercase font-semibold">
              Live Observation
            </span>
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {currentObserved.toFixed(2)}
              <span className="text-sm font-semibold text-mint ml-1.5 font-sans">m</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Datum: MLLW • {selectedStation.name}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2 border-t border-charcoal-border">
            <span>Harmonic: {currentPredicted.toFixed(2)}m</span>
            <span className="font-mono text-mint">
              {currentResidual >= 0 ? '+' : ''}{currentResidual.toFixed(2)}m
            </span>
          </div>
        </div>

        {/* Metric 2: Deviation / Residual Card */}
        <div className="bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">
              Non-Tidal Residual (Δh)
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isSurgeCondition ? 'bg-lavender/30 text-charcoal' : 'bg-mint/30 text-mint-dark'
              }`}
            >
              {isSurgeCondition ? 'Surge Active' : 'Normal Band'}
            </span>
          </div>
          <div className="my-3">
            <div
              className={`text-3xl font-black font-mono tracking-tight ${
                currentResidual >= 0 ? 'text-mint-dark' : 'text-danger'
              }`}
            >
              {currentResidual >= 0 ? '+' : ''}
              {currentResidual.toFixed(2)}
              <span className="text-sm font-semibold text-secondary-text ml-1.5 font-sans">
                m
              </span>
            </div>
            <p className="text-xs text-secondary-text mt-1">
              Z-Score: <span className="font-mono font-bold">{currentZScore >= 0 ? '+' : ''}{currentZScore.toFixed(2)}σ</span> (σ = 0.12m)
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-secondary-text pt-2 border-t border-border">
            <span>Threshold: ±0.20m</span>
            <span className="font-medium text-primary-text">
              {Math.abs(currentResidual) < 0.20 ? 'Within Limits' : 'Exceeds Baseline'}
            </span>
          </div>
        </div>

        {/* Metric 3: Change Rate Card */}
        <div className="bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">
              Rate of Change (dR/dt)
            </span>
            {currentRateOfChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-mint-strong" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-lavender-dark" />
            )}
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-primary-text font-mono tracking-tight">
              {currentRateOfChange >= 0 ? '+' : ''}
              {currentRateOfChange.toFixed(2)}
              <span className="text-sm font-semibold text-secondary-text ml-1.5 font-sans">
                m/hr
              </span>
            </div>
            <p className="text-xs text-secondary-text mt-1">
              Hydrodynamic surge velocity
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-secondary-text pt-2 border-t border-border">
            <span>Velocity Status:</span>
            <span
              className={`font-semibold ${
                isRapidRateCondition ? 'text-danger' : 'text-mint-dark'
              }`}
            >
              {isRapidRateCondition ? 'Rapid Surge' : 'Gradual / Steady'}
            </span>
          </div>
        </div>

        {/* Metric 4: Tidal Phase Card */}
        <div className="bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">Tidal Phase</span>
            <Clock className="w-4 h-4 text-secondary-text" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-primary-text tracking-tight truncate">
              {selectedStation.tidalPhase}
            </div>
            <p className="text-xs text-secondary-text mt-1">
              Semi-diurnal M2 Harmonic Cycle
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-secondary-text pt-2 border-t border-border">
            <span>Next Extremity:</span>
            <span className="font-mono font-semibold text-primary-text">
              High @ {selectedStation.nextHighTide?.time || '14:26'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart: Water Level Observed vs Predicted with Anomaly Overlays */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-strong" />
              <h2 className="text-xl font-bold text-primary-text">
                Water Level: Observed vs Predicted
              </h2>
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              Continuous 6-minute acoustic tide gauge observations against NOAA harmonic predictions
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-[#68DD79] inline-block" />
              <span className="font-semibold text-primary-text">Observed Water Level</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-[#C5A8F8] inline-block" />
              <span className="font-semibold text-primary-text">Harmonic Tide Prediction</span>
            </div>
          </div>
        </div>

        <div className="w-full">
          <TideChart
            data={points}
            height={380}
            stationName={selectedStation.name}
            timeRange={selectedTimeRange}
            anomalies={events}
          />
        </div>
      </div>

      {/* Secondary Chart: Non-Tidal Residual & Zero Baseline */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-primary-text">
              Non-Tidal Residual (Observed - Predicted)
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Meteorological storm surge signal with ±0.20m baseline threshold and ±0.50m extreme envelope
            </p>
          </div>
        </div>

        <div className="w-full">
          <ResidualChart
            data={points}
            height={260}
            thresholds={{ positive: 0.2, negative: -0.2, extreme: 0.5 }}
            events={events}
          />
        </div>
      </div>

      {/* Bottom Row: Sensor Health Status & Anomaly Condition Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor Health Status (7 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-[28px] border border-border shadow-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-20 bg-mint/30 flex items-center justify-center text-charcoal">
                  <Activity className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-text">
                    Sensor Telemetry & Health Status
                  </h3>
                  <p className="text-xs text-secondary-text">
                    Station #{selectedStation.id} Acoustic & Transducer Arrays
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-mint/30 text-mint-dark text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Sensors Operational
              </span>
            </div>

            {/* Health Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-20 bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-secondary-text mb-1">
                  <Radio className="w-3.5 h-3.5 text-mint-strong" />
                  <span>Primary Sensor</span>
                </div>
                <div className="text-sm font-bold text-primary-text">Acoustic Sounder</div>
                <span className="text-[11px] text-mint-dark font-medium mt-0.5 block">
                  Signal Quality: 100%
                </span>
              </div>

              <div className="p-3.5 rounded-20 bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-secondary-text mb-1">
                  <Cpu className="w-3.5 h-3.5 text-lavender-dark" />
                  <span>Backup Transducer</span>
                </div>
                <div className="text-sm font-bold text-primary-text">Pressure Probe</div>
                <span className="text-[11px] text-secondary-text font-medium mt-0.5 block">
                  Δ from acoustic: 0.01m
                </span>
              </div>

              <div className="p-3.5 rounded-20 bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-secondary-text mb-1">
                  <Wifi className="w-3.5 h-3.5 text-mint-strong" />
                  <span>Telemetry Link</span>
                </div>
                <div className="text-sm font-bold text-primary-text">Iridium & 5G</div>
                <span className="text-[11px] text-mint-dark font-medium mt-0.5 block">
                  Latency: 48 ms (Realtime)
                </span>
              </div>

              <div className="p-3.5 rounded-20 bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-secondary-text mb-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-mint-strong" />
                  <span>Power System</span>
                </div>
                <div className="text-sm font-bold text-primary-text">13.8 V (Solar)</div>
                <span className="text-[11px] text-mint-dark font-medium mt-0.5 block">
                  Battery: 98% Float
                </span>
              </div>

              <div className="p-3.5 rounded-20 bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-secondary-text mb-1">
                  <Clock className="w-3.5 h-3.5 text-secondary-text" />
                  <span>Sample Cadence</span>
                </div>
                <div className="text-sm font-bold text-primary-text">6.0 Minutes</div>
                <span className="text-[11px] text-secondary-text font-medium mt-0.5 block">
                  10 readings / hour
                </span>
              </div>

              <div className="p-3.5 rounded-20 bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-secondary-text mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-strong" />
                  <span>Data Integrity</span>
                </div>
                <div className="text-sm font-bold text-primary-text">0 Missing Gaps</div>
                <span className="text-[11px] text-mint-dark font-medium mt-0.5 block">
                  100% Availability
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-xs text-secondary-text">
            <span>NOAA National Ocean Service Calibration</span>
            <span className="font-mono text-primary-text font-semibold">QC Flag: Verified (v)</span>
          </div>
        </div>

        {/* Anomaly Condition Flags (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-[28px] border border-border shadow-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-20 bg-lavender/30 flex items-center justify-center text-charcoal">
                  <AlertCircle className="w-5 h-5 text-charcoal" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-text">
                    Anomaly Condition Flags
                  </h3>
                  <p className="text-xs text-secondary-text">
                    Live automata state triggers & safety gates
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Flag 1 */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary-text block">
                    High Water Surge Alert
                  </span>
                  <span className="text-[11px] text-secondary-text">
                    Residual threshold &gt; +0.20 m
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isSurgeCondition
                      ? 'bg-lavender text-charcoal'
                      : 'bg-mint/30 text-mint-dark'
                  }`}
                >
                  {isSurgeCondition ? 'FLAGGED' : 'CLEAR'}
                </span>
              </div>

              {/* Flag 2 */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary-text block">
                    Rapid Rate of Rise (Flash)
                  </span>
                  <span className="text-[11px] text-secondary-text">
                    Velocity |dR/dt| &gt; 0.20 m/hr
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isRapidRateCondition
                      ? 'bg-danger-bg text-danger'
                      : 'bg-mint/30 text-mint-dark'
                  }`}
                >
                  {isRapidRateCondition ? 'ACTIVE' : 'NOMINAL'}
                </span>
              </div>

              {/* Flag 3 */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary-text block">
                    Negative Blowout Depression
                  </span>
                  <span className="text-[11px] text-secondary-text">
                    Residual threshold &lt; -0.20 m
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-mint/30 text-mint-dark">
                  CLEAR
                </span>
              </div>

              {/* Flag 4 */}
              <div className="p-3 rounded-20 bg-surface-muted border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary-text block">
                    Automata State Machine
                  </span>
                  <span className="text-[11px] text-secondary-text">
                    Current active DFA node
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-charcoal text-mint">
                  {isSurgeCondition ? 'State S1 (Elevated)' : 'State S0 (Baseline)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-xs text-secondary-text">
            <span>Automata Guard Condition</span>
            <span className="text-primary-text font-semibold">Evaluated every 6 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringScreen;
