import React from 'react';

export interface RadialGaugeProps {
  value: number; // e.g. 1.86
  min?: number; // e.g. 0.0
  max?: number; // e.g. 3.5
  unit?: string; // e.g. "m"
  title?: string;
  subtitle?: string;
  deltaText?: string;
  status?: string;
  statusColor?: 'mint' | 'lavender' | 'warning' | 'danger' | 'charcoal';
  size?: number;
  className?: string;
  'data-testid'?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  min = 0.0,
  max = 3.5,
  unit = 'm',
  title = 'Live Water Level',
  subtitle,
  deltaText,
  status = 'Normal',
  statusColor = 'mint',
  size = 240,
  className = '',
  'data-testid': testId,
}) => {
  // Clamp value between min and max
  const clamped = Math.min(Math.max(value, min), max);
  const ratio = max > min ? (clamped - min) / (max - min) : 0;

  // Geometry: Semi-circle sweep from 180 deg to 360 deg
  const radius = 80;
  const strokeWidth = 14;
  const center = 100;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference * (1 - ratio);

  // Needle angle in radians (from Math.PI (left) to 0 (right))
  const angleRad = Math.PI - ratio * Math.PI;
  const needleLength = 65;
  const needleX = center + needleLength * Math.cos(angleRad);
  const needleY = center - needleLength * Math.sin(angleRad);

  return (
    <div
      data-testid={testId || 'radial-gauge'}
      className={`flex flex-col items-center justify-center p-3 select-none ${className}`}
    >
      {title && (
        <div className="text-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#737A75]">
            {title}
          </span>
          {subtitle && <p className="text-[11px] text-[#737A75]">{subtitle}</p>}
        </div>
      )}

      <div className="relative" style={{ width: size, height: size * 0.62 }}>
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full overflow-visible"
        >
          {/* Background Arc Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#242424"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#68DD79"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Needle / Pointer Marker */}
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke="#C5A8F8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Center Hub */}
          <circle cx={center} cy={center} r="6" fill="#171A18" />
          <circle cx={center} cy={center} r="3" fill="#A5F5A6" />

          {/* Base Endpoint Labels */}
          <text x="12" y="116" fontSize="10" fill="#737A75" fontWeight="600">
            {min.toFixed(1)} {unit}
          </text>
          <text x="165" y="116" fontSize="10" fill="#737A75" fontWeight="600">
            {max.toFixed(1)} {unit}
          </text>
        </svg>

        {/* Center Readout Text */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#171A18] tracking-tight">
              {value.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#737A75]">{unit}</span>
          </div>
          {deltaText && (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold bg-[#A5F5A6] text-[#171A18] px-2.5 py-0.5 rounded-full border border-[#68DD79]/30">
              {deltaText}
            </span>
          )}
          {status && !deltaText && (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold bg-[#E2FBE3] text-[#359D45] px-2.5 py-0.5 rounded-full border border-[#A5F5A6]">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadialGauge;
