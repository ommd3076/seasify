import React from 'react';

export interface MiniSparklineProps {
  data: number[] | { value: number; timestamp?: string }[];
  width?: number | string;
  height?: number;
  color?: string;
  variant?: 'mint' | 'lavender' | 'charcoal' | 'danger' | 'warning';
  fill?: boolean;
  showDot?: boolean;
  strokeWidth?: number;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data = [],
  width = '100%',
  height = 36,
  color,
  variant = 'mint',
  fill = true,
  showDot = true,
  strokeWidth = 2,
  className = '',
}) => {
  // Normalize data points
  const points: number[] = data.map((d) => (typeof d === 'number' ? d : d.value ?? 0));

  if (!points || points.length === 0) {
    return <div style={{ width, height }} className={`bg-transparent ${className}`} />;
  }

  const id = React.useId().replace(/:/g, '');

  const colorMap: Record<string, { stroke: string; fill: string }> = {
    mint: { stroke: '#68DD79', fill: '#A5F5A6' },
    lavender: { stroke: '#8B64DF', fill: '#C5A8F8' },
    charcoal: { stroke: '#242424', fill: '#737A75' },
    danger: { stroke: '#EF4444', fill: '#F87171' },
    warning: { stroke: '#F59E0B', fill: '#FBBF24' },
  };

  const selectedColors = color
    ? { stroke: color, fill: color }
    : colorMap[variant] || colorMap.mint;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;

  const paddingY = 4;
  const paddingX = 4;
  const viewWidth = 100;
  const viewHeight = 40;

  const stepX = (viewWidth - paddingX * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((val, idx) => {
    const x = paddingX + idx * stepX;
    const y = viewHeight - paddingY - ((val - min) / range) * (viewHeight - paddingY * 2);
    return { x, y };
  });

  // Construct smooth cubic bezier SVG path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Construct closed area path for gradient
  const lastCoord = coords[coords.length - 1];
  const firstCoord = coords[0];
  const areaD = `${pathD} L ${lastCoord.x} ${viewHeight} L ${firstCoord.x} ${viewHeight} Z`;

  return (
    <div style={{ width, height }} className={`inline-block overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={`sparklineGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={selectedColors.fill} stopOpacity={0.3} />
            <stop offset="100%" stopColor={selectedColors.fill} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {fill && <path d={areaD} fill={`url(#sparklineGrad-${id})`} />}

        <path
          d={pathD}
          fill="none"
          stroke={selectedColors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showDot && coords.length > 0 && (
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r={2.5}
            fill={selectedColors.stroke}
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        )}
      </svg>
    </div>
  );
};

export default MiniSparkline;
