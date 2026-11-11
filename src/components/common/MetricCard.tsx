import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MiniSparkline from '../charts/MiniSparkline';

export type MetricCardVariant = 'charcoal' | 'surface' | 'mint' | 'lavender';

export interface MetricCardDelta {
  text: string;
  direction?: 'up' | 'down' | 'neutral';
  isPositive?: boolean;
}

export interface MetricCardTrend {
  value: string | number;
  direction?: 'up' | 'down' | 'neutral';
  label?: string;
}

export interface MetricCardProps {
  variant?: MetricCardVariant;
  title: string;
  subtitle?: string;
  value: string | number;
  unit?: string;
  delta?: MetricCardDelta;
  trend?: MetricCardTrend;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  sparklineData?: number[];
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  variant = 'surface',
  title,
  subtitle,
  value,
  unit,
  delta,
  trend,
  headerAction,
  footer,
  badge,
  icon,
  sparklineData,
  children,
  className = '',
  'data-testid': testId,
}) => {
  const isCharcoal = variant === 'charcoal';
  const isMint = variant === 'mint';
  const isLavender = variant === 'lavender';

  const containerClasses = isCharcoal
    ? 'bg-[#242424] text-white border border-[#383838] shadow-[0_8px_24px_-4px_rgba(36,36,36,0.25)]'
    : isMint
    ? 'bg-[#A5F5A6] text-[#171A18] border border-[#68DD79]/50 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]'
    : isLavender
    ? 'bg-[#C5A8F8] text-[#171A18] border border-[#A588DB]/40 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]'
    : 'bg-[#F7F9F6] text-[#171A18] border border-[#D9DEDA] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]';

  const titleClasses = isCharcoal
    ? 'text-[#A0A7A2] text-xs font-semibold uppercase tracking-wider'
    : 'text-[#737A75] text-xs font-semibold uppercase tracking-wider';

  const subtitleClasses = isCharcoal ? 'text-[#737A75] text-xs mt-0.5' : 'text-[#737A75] text-xs mt-0.5';

  return (
    <div
      data-testid={testId || 'metric-card'}
      className={`rounded-panel p-5 sm:p-6 flex flex-col justify-between transition-all select-none ${containerClasses} ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className={isCharcoal ? 'text-gray-300' : 'text-[#737A75]'}>{icon}</span>}
          <div>
            <h3 className={titleClasses}>{title}</h3>
            {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
          </div>
        </div>
        {headerAction && <div>{headerAction}</div>}
        {badge && !headerAction && <div>{badge}</div>}
      </div>

      {/* Middle Value & Sparkline Section */}
      <div className="flex items-end justify-between my-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight font-sans">
              {value}
            </span>
            {unit && (
              <span
                className={`text-sm sm:text-base font-semibold ${
                  isCharcoal ? 'text-[#A0A7A2]' : 'text-[#737A75]'
                }`}
              >
                {unit}
              </span>
            )}
          </div>

          {/* Delta Pill */}
          {delta && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  delta.direction === 'up'
                    ? 'bg-[#A5F5A6]/40 text-[#171A18] border border-[#68DD79]/30'
                    : delta.direction === 'down'
                    ? 'bg-[#C5A8F8]/40 text-[#171A18] border border-[#C5A8F8]/60'
                    : 'bg-[#EAEFEC] text-[#737A75] border border-[#D9DEDA]'
                }`}
              >
                {delta.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                {delta.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                {delta.direction === 'neutral' && <Minus className="w-3 h-3" />}
                {delta.text}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline if provided */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24 h-10">
            <MiniSparkline
              data={sparklineData}
              variant={isCharcoal ? 'mint' : isMint ? 'charcoal' : 'mint'}
              height={36}
            />
          </div>
        )}
      </div>

      {/* Legacy Trend Section if provided */}
      {trend && (
        <div className="flex items-center gap-1 font-mono text-xs pt-2 border-t border-current/10">
          {trend.direction === 'up' && (
            <ArrowUpRight size={14} className={isCharcoal ? 'text-[#68DD79]' : 'text-[#359D45]'} />
          )}
          {trend.direction === 'down' && (
            <ArrowDownRight size={14} className={isCharcoal ? 'text-[#C5A8F8]' : 'text-[#8B64DF]'} />
          )}
          {trend.direction === 'neutral' && <Minus size={14} className="text-gray-400" />}
          <span
            className={
              trend.direction === 'up'
                ? isCharcoal
                  ? 'text-[#68DD79]'
                  : 'text-[#359D45]'
                : trend.direction === 'down'
                ? isCharcoal
                  ? 'text-[#C5A8F8]'
                  : 'text-[#8B64DF]'
                : 'text-gray-400'
            }
          >
            {trend.value}
          </span>
          {trend.label && (
            <span className={isCharcoal ? 'text-gray-400 text-[11px]' : 'text-[#737A75] text-[11px]'}>
              {trend.label}
            </span>
          )}
        </div>
      )}

      {/* Child visualization slot */}
      {children && <div className="mt-3 flex-1">{children}</div>}

      {/* Footer slot */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-[#D9DEDA]/40 text-xs text-[#737A75]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
