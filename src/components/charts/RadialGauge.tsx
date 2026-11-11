import React from 'react';

interface RadialGaugeProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  title?: string;
  subtitle?: string;
  status?: string;
  statusColor?: 'mint' | 'lavender' | 'warning' | 'danger' | 'charcoal';
  size?: number;
  showStripedIndicator?: boolean;
  className?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  min = 0,
  max = 3.5,
  unit = 'm',
  title = 'Live Water Level',
  subtitle,
  status = 'Normal',
  statusColor = 'mint',
  size = 280,
  showStripedIndicator = true,
  className = '',
}) => {
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const ratio = max > min ? (clampedValue - min) / (max - min) : 0;

  // Geometry: semi-circle from 180deg (left) to 0deg (right)
  const cx = 150;
  const cy = 135;
  const radius = 100;
  const strokeWidth = 18;

  // Total semi-circle circumference: Math.PI * radius
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - ratio);

  // Position for the end indicator
  // Angle starts at Math.PI (left, 180 deg) and ends at 0 (right, 0 deg)
  const currentAngle = Math.PI - ratio * Math.PI;
  const indicatorX = cx + radius * Math.cos(currentAngle);
  const indicatorY = cy - radius * Math.sin(currentAngle);

  // Status badge styling
  const statusStyles: Record<string, string> = {
    mint: 'bg-[#E2FBE3] text-[#359D45] border-[#A5F5A6]',
    lavender: 'bg-[#F3EEFD] text-[#8B64DF] border-[#C5A8F8]',
    warning: 'bg-[#FEF3C7] text-[#D97706] border-[#FBBF24]',
    danger: 'bg-[#FEE2E2] text-[#DC2626] border-[#F87171]',
    charcoal: 'bg-[#242424] text-white border-charcoal-border',
  };

  const badgeClass = statusStyles[statusColor] || statusStyles.mint;

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 bg-surface rounded-28px shadow-subtle border border-border ${className}`}
      style={{ width: size, minHeight: size * 0.85 }}
    >
      {/* Title */}
      {title && (
        <div className="w-full text-center mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            {title}
          </span>
        </div>
      )}

      {/* SVG Arc Gauge */}
      <div className="relative w-full aspect-[300/170] flex items-center justify-center">
        <svg
          viewBox="0 0 300 170"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Mint Gradient for the active arc */}
            <linearGradient id="mintArcGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A5F5A6" />
              <stop offset="100%" stopColor="#68DD79" />
            </linearGradient>

            {/* Diagonal Striped Purple pattern for the end indicator */}
            <pattern
              id="stripedPurplePattern"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <rect width="3" height="6" fill="#C5A8F8" />
              <rect x="3" width="3" height="6" fill="#8B64DF" />
            </pattern>

            {/* Soft Shadow for indicator */}
            <filter id="indicatorShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#242424" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#EAEFEC"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Tick marks along track */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const angle = Math.PI - pct * Math.PI;
            const rInner = radius - strokeWidth / 2 - 4;
            const rOuter = radius + strokeWidth / 2 + 4;
            const x1 = cx + rInner * Math.cos(angle);
            const y1 = cy - rInner * Math.sin(angle);
            const x2 = cx + rOuter * Math.cos(angle);
            const y2 = cy - rOuter * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#D9DEDA"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Active Mint Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#mintArcGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />

          {/* Striped Purple End Indicator (Capsule / Pin) */}
          {showStripedIndicator && (
            <g
              transform={`translate(${indicatorX}, ${indicatorY}) rotate(${(1 - ratio) * 180})`}
              filter="url(#indicatorShadow)"
              className="transition-transform duration-500 ease-out"
            >
              {/* Outer border ring */}
              <circle
                r={strokeWidth * 0.75}
                fill="#FFFFFF"
                stroke="#8B64DF"
                strokeWidth={2}
              />
              {/* Striped Purple Center */}
              <circle
                r={strokeWidth * 0.55}
                fill="url(#stripedPurplePattern)"
              />
              {/* Inner core dot */}
              <circle
                r={strokeWidth * 0.22}
                fill="#FFFFFF"
              />
            </g>
          )}

          {/* Min and Max scale bounds */}
          <text
            x={cx - radius}
            y={cy + 22}
            textAnchor="middle"
            className="text-[11px] font-mono fill-[#737A75] font-medium"
          >
            {min.toFixed(1)} {unit}
          </text>
          <text
            x={cx + radius}
            y={cy + 22}
            textAnchor="middle"
            className="text-[11px] font-mono fill-[#737A75] font-medium"
          >
            {max.toFixed(1)} {unit}
          </text>
        </svg>

        {/* Center Readout */}
        <div className="absolute top-[35%] flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-charcoal font-sans tracking-tight">
              {value.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-secondary-text font-mono">
              {unit}
            </span>
          </div>
          {status && (
            <span
              className={`mt-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${badgeClass}`}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle / context description */}
      {subtitle && (
        <p className="mt-1 text-xs text-center text-secondary-text max-w-[220px]">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default RadialGauge;
