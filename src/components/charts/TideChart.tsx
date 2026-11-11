import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
} from 'recharts';
import { WaterLevelPoint } from '@/types/noaa';
import { AnomalyEvent } from '@/types/events';

interface TideChartProps {
  data: WaterLevelPoint[];
  height?: number | string;
  showCrosshair?: boolean;
  unit?: 'm' | 'ft';
  title?: string;
  stationName?: string;
  timeRange?: string;
  anomalies?: AnomalyEvent[];
  selectedAnomalyId?: string;
  onHoverPoint?: (point: WaterLevelPoint | null) => void;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: 'm' | 'ft';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = 'm' }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint: WaterLevelPoint = payload[0]?.payload;
  const formattedTime = label
    ? new Date(label).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const observed = dataPoint?.observed != null ? Number(dataPoint.observed).toFixed(2) : '--';
  const predicted = dataPoint?.predicted != null ? Number(dataPoint.predicted).toFixed(2) : '--';
  const residual =
    dataPoint?.residual != null
      ? (dataPoint.residual >= 0 ? '+' : '') + Number(dataPoint.residual).toFixed(2)
      : dataPoint?.observed != null && dataPoint?.predicted != null
      ? ((dataPoint.observed - dataPoint.predicted) >= 0 ? '+' : '') +
        (dataPoint.observed - dataPoint.predicted).toFixed(2)
      : '--';

  const rateOfChange =
    dataPoint?.rateOfChange != null
      ? (dataPoint.rateOfChange >= 0 ? '+' : '') + Number(dataPoint.rateOfChange).toFixed(2) + ` ${unit}/hr`
      : null;

  return (
    <div className="bg-[#242424] text-white p-3.5 rounded-20px shadow-panel border border-charcoal-border text-xs min-w-[210px] backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-charcoal-border/70">
        <span className="font-medium text-gray-300 font-mono text-[11px]">{formattedTime}</span>
        {dataPoint?.qualityFlag && (
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-charcoal-card text-gray-400 border border-charcoal-border">
            {dataPoint.qualityFlag}
          </span>
        )}
      </div>

      <div className="space-y-1.5 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79] inline-block shadow-sm" />
            <span className="text-gray-300">Observed Water Level:</span>
          </div>
          <span className="font-mono font-semibold text-white">
            {observed} {unit}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A8F8] inline-block shadow-sm" />
            <span className="text-gray-300">Astronomical Tide:</span>
          </div>
          <span className="font-mono font-semibold text-white">
            {predicted} {unit}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-charcoal-border/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm" />
            <span className="text-gray-300">Surge Residual R(t):</span>
          </div>
          <span
            className={`font-mono font-bold ${
              Number(residual) > 0.2
                ? 'text-[#68DD79]'
                : Number(residual) < -0.2
                ? 'text-[#C5A8F8]'
                : 'text-gray-200'
            }`}
          >
            {residual} {unit}
          </span>
        </div>

        {rateOfChange && (
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Rate of Change:</span>
            <span className="font-mono text-gray-300">{rateOfChange}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TideChart: React.FC<TideChartProps> = ({
  data,
  height = 360,
  showCrosshair = true,
  unit = 'm',
  title,
  stationName,
  timeRange,
  anomalies = [],
  selectedAnomalyId,
  onHoverPoint,
  className = '',
}) => {
  // Compute nice domain bounds
  const numericValues = data.flatMap((d) => [d.observed, d.predicted].filter((v): v is number => v != null));
  const minVal = numericValues.length > 0 ? Math.floor(Math.min(...numericValues) * 10) / 10 - 0.2 : 0;
  const maxVal = numericValues.length > 0 ? Math.ceil(Math.max(...numericValues) * 10) / 10 + 0.2 : 3;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {(title || stationName || timeRange) && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            {title && <h3 className="text-base font-semibold text-primary-text">{title}</h3>}
            {stationName && <p className="text-xs text-secondary-text">{stationName}</p>}
          </div>
          {timeRange && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface-muted text-secondary-text border border-border">
              Window: {timeRange}
            </span>
          )}
        </div>
      )}

      <div style={{ width: '100%', height }} className="relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 12, right: 16, left: -10, bottom: 8 }}
            onMouseMove={(state) => {
              if (onHoverPoint && state?.activePayload?.[0]?.payload) {
                onHoverPoint(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => {
              if (onHoverPoint) onHoverPoint(null);
            }}
          >
            <defs>
              <linearGradient id="observedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#68DD79" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#68DD79" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#D9DEDA" opacity={0.6} vertical={false} />

            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => {
                if (!tick) return '';
                const d = new Date(tick);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }}
              stroke="#737A75"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#D9DEDA' }}
              minTickGap={45}
            />

            <YAxis
              domain={[minVal, maxVal]}
              unit={unit}
              stroke="#737A75"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => Number(v).toFixed(1)}
              width={42}
            />

            <Tooltip
              content={<CustomTooltip unit={unit} />}
              cursor={showCrosshair ? { stroke: '#737A75', strokeWidth: 1, strokeDasharray: '4 4' } : false}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              formatter={(val) => (
                <span className="text-secondary-text font-medium text-xs mr-3">{val}</span>
              )}
            />

            {/* Anomaly highlights */}
            {anomalies.map((anomaly) => {
              const isSelected = selectedAnomalyId === anomaly.matchId || selectedAnomalyId === anomaly.id;
              return (
                <ReferenceArea
                  key={anomaly.matchId || anomaly.id}
                  x1={anomaly.startTime}
                  x2={anomaly.endTime}
                  y1={minVal}
                  y2={maxVal}
                  fill="#C5A8F8"
                  fillOpacity={isSelected ? 0.25 : 0.12}
                  stroke={isSelected ? '#8B64DF' : '#C5A8F8'}
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Astronomical Predicted Tide Curve (Lavender #C5A8F8) */}
            <Line
              type="monotone"
              dataKey="predicted"
              name="Astronomical Tide (MLLW)"
              stroke="#C5A8F8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: '#C5A8F8', stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={false}
            />

            {/* Observed Water Level Curve (Mint #68DD79) */}
            <Line
              type="monotone"
              dataKey="observed"
              name="Observed Telemetry"
              stroke="#68DD79"
              strokeWidth={2.75}
              dot={false}
              activeDot={{ r: 6, fill: '#68DD79', stroke: '#242424', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TideChart;
