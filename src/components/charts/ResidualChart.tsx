import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { WaterLevelPoint } from '@/types/noaa';
import { AnomalyEvent } from '@/types/events';

interface ResidualChartProps {
  data: WaterLevelPoint[];
  height?: number | string;
  thresholds?: {
    positive?: number; // e.g. 0.20
    negative?: number; // e.g. -0.20
    extreme?: number;  // e.g. 0.50
  };
  events?: AnomalyEvent[];
  selectedEventId?: string;
  unit?: 'm' | 'ft';
  title?: string;
  onHoverPoint?: (point: WaterLevelPoint | null) => void;
  className?: string;
}

interface CustomResidualTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: 'm' | 'ft';
}

const CustomResidualTooltip: React.FC<CustomResidualTooltipProps> = ({
  active,
  payload,
  label,
  unit = 'm',
}) => {
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

  const residual =
    dataPoint?.residual != null
      ? (dataPoint.residual >= 0 ? '+' : '') + Number(dataPoint.residual).toFixed(2)
      : dataPoint?.observed != null && dataPoint?.predicted != null
      ? ((dataPoint.observed - dataPoint.predicted) >= 0 ? '+' : '') +
        (dataPoint.observed - dataPoint.predicted).toFixed(2)
      : '--';

  const rateOfChange =
    dataPoint?.rateOfChange != null
      ? (dataPoint.rateOfChange >= 0 ? '+' : '') + Number(dataPoint.rateOfChange).toFixed(2)
      : null;

  const zScore = dataPoint?.zScore != null ? Number(dataPoint.zScore).toFixed(2) : null;
  const symbol = dataPoint?.rawSymbol;

  return (
    <div className="bg-[#242424] text-white p-3 rounded-20px shadow-panel border border-charcoal-border text-xs min-w-[200px] backdrop-blur-md">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-charcoal-border/70">
        <span className="font-mono text-[11px] text-gray-300">{formattedTime}</span>
        {symbol && (
          <span className="font-mono px-2 py-0.5 rounded bg-surface-muted/20 text-[#A5F5A6] text-[10px] font-bold">
            Σ: {symbol}
          </span>
        )}
      </div>

      <div className="space-y-1 font-sans">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Surge Residual R(t):</span>
          <span
            className={`font-mono font-bold text-sm ${
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

        {rateOfChange != null && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Surge Velocity dR/dt:</span>
            <span className="font-mono text-gray-300">
              {rateOfChange} {unit}/hr
            </span>
          </div>
        )}

        {zScore != null && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Statistical Z-Score:</span>
            <span
              className={`font-mono font-semibold ${
                Math.abs(Number(zScore)) >= 2 ? 'text-amber-400' : 'text-gray-300'
              }`}
            >
              {Number(zScore) >= 0 ? `+${zScore}` : zScore}σ
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResidualChart: React.FC<ResidualChartProps> = ({
  data,
  height = 240,
  thresholds = { positive: 0.2, negative: -0.2, extreme: 0.5 },
  events = [],
  selectedEventId,
  unit = 'm',
  title,
  onHoverPoint,
  className = '',
}) => {
  const residuals = data.map((d) => d.residual ?? (d.observed != null && d.predicted != null ? d.observed - d.predicted : 0));
  const minRes = residuals.length ? Math.min(...residuals, thresholds.negative ?? -0.3) : -0.5;
  const maxRes = residuals.length ? Math.max(...residuals, thresholds.extreme ?? 0.6) : 0.8;
  const domainMin = Math.floor(minRes * 10) / 10 - 0.1;
  const domainMax = Math.ceil(maxRes * 10) / 10 + 0.1;

  // Split positive and negative for fill gradient or reference lines
  const enrichedData = data.map((d) => {
    const res = d.residual ?? (d.observed != null && d.predicted != null ? d.observed - d.predicted : null);
    return {
      ...d,
      calcResidual: res,
    };
  });

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-semibold text-primary-text">{title}</h3>
          <div className="flex items-center gap-3 text-[11px] text-secondary-text">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#68DD79] inline-block" /> +Surge (&gt;+0.2m)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#C5A8F8] inline-block" /> -Blowout (&lt;-0.2m)
            </span>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height }} className="relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={enrichedData}
            margin={{ top: 10, right: 16, left: -10, bottom: 6 }}
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
              <linearGradient id="residualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#68DD79" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#68DD79" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#C5A8F8" stopOpacity={0.25} />
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
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#D9DEDA' }}
              minTickGap={45}
            />

            <YAxis
              domain={[domainMin, domainMax]}
              unit={unit}
              stroke="#737A75"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
              width={42}
            />

            <Tooltip content={<CustomResidualTooltip unit={unit} />} />

            {/* Zero Baseline */}
            <ReferenceLine y={0} stroke="#242424" strokeWidth={1.5} opacity={0.8} />

            {/* Positive Surge Threshold */}
            {thresholds.positive != null && (
              <ReferenceLine
                y={thresholds.positive}
                stroke="#68DD79"
                strokeDasharray="4 4"
                strokeWidth={1.25}
                label={{
                  value: `+Surge (${thresholds.positive}m)`,
                  position: 'insideTopRight',
                  fill: '#359D45',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Extreme Surge Threshold */}
            {thresholds.extreme != null && (
              <ReferenceLine
                y={thresholds.extreme}
                stroke="#F87171"
                strokeDasharray="3 3"
                strokeWidth={1.25}
                label={{
                  value: `Extreme (${thresholds.extreme}m)`,
                  position: 'insideTopRight',
                  fill: '#DC2626',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Negative Blowout Threshold */}
            {thresholds.negative != null && (
              <ReferenceLine
                y={thresholds.negative}
                stroke="#8B64DF"
                strokeDasharray="4 4"
                strokeWidth={1.25}
                label={{
                  value: `-Blowout (${thresholds.negative}m)`,
                  position: 'insideBottomRight',
                  fill: '#8B64DF',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Event Interval Highlights */}
            {events.map((evt) => {
              const isSelected = selectedEventId === evt.id || selectedEventId === evt.matchId;
              return (
                <ReferenceArea
                  key={evt.id || evt.matchId}
                  x1={evt.startTime}
                  x2={evt.endTime}
                  y1={domainMin}
                  y2={domainMax}
                  fill={evt.severity === 'High' ? '#F87171' : '#C5A8F8'}
                  fillOpacity={isSelected ? 0.35 : 0.15}
                  stroke={isSelected ? '#8B64DF' : 'none'}
                />
              );
            })}

            {/* Area Fill for Residuals */}
            <Area
              type="monotone"
              dataKey="calcResidual"
              fill="url(#residualGradient)"
              stroke="none"
              isAnimationActive={false}
            />

            {/* Residual Curve Line */}
            <Line
              type="monotone"
              dataKey="calcResidual"
              name="Surge Residual R(t)"
              stroke="#242424"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#242424', stroke: '#A5F5A6', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResidualChart;
