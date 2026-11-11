import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import MiniSparkline from '../charts/MiniSparkline';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'charcoal' | 'card' | 'muted';
  className?: string;
  rounded?: '28' | '24' | '20' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  className = '',
  rounded = '28',
  padding = 'md',
}) => {
  const variantStyles = {
    surface: 'bg-surface border-border text-primary-text shadow-subtle',
    charcoal: 'bg-charcoal border-charcoal-border text-white shadow-panel',
    card: 'bg-surface-card border-border text-primary-text shadow-subtle',
    muted: 'bg-surface-muted border-border text-primary-text',
  };

  const roundedStyles = {
    '28': 'rounded-28px',
    '24': 'rounded-24px',
    '20': 'rounded-20px',
    'full': 'rounded-full',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`border transition-all ${variantStyles[variant]} ${roundedStyles[rounded]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  variant?: 'charcoal' | 'surface' | 'mint' | 'lavender';
  trend?: {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  sparklineData?: number[];
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  variant = 'surface',
  trend,
  sparklineData,
  badge,
  icon,
  className = '',
}) => {
  const isCharcoal = variant === 'charcoal';
  const isMint = variant === 'mint';
  const isLavender = variant === 'lavender';

  let cardBg = 'bg-surface text-primary-text border-border shadow-subtle';
  if (isCharcoal) cardBg = 'bg-charcoal text-white border-charcoal-border shadow-panel';
  else if (isMint) cardBg = 'bg-[#E2FBE3] text-[#171A18] border-[#A5F5A6] shadow-subtle';
  else if (isLavender) cardBg = 'bg-[#F3EEFD] text-[#171A18] border-[#C5A8F8] shadow-subtle';

  return (
    <div
      className={`rounded-28px p-5 border flex flex-col justify-between transition-all select-none ${cardBg} ${className}`}
    >
      {/* Top Row: Title, Badge / Icon */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className={isCharcoal ? 'text-gray-300' : 'text-secondary-text'}>{icon}</span>}
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isCharcoal ? 'text-gray-400' : 'text-secondary-text'
            }`}
          >
            {title}
          </span>
        </div>
        {badge && <div>{badge}</div>}
      </div>

      {/* Middle Row: Primary Value & Sparkline */}
      <div className="flex items-end justify-between my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold font-sans tracking-tight">
            {value}
          </span>
          {unit && (
            <span
              className={`text-sm font-semibold font-mono ${
                isCharcoal ? 'text-gray-400' : 'text-secondary-text'
              }`}
            >
              {unit}
            </span>
          )}
        </div>

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

      {/* Bottom Row: Trend and Subtitle */}
      {(trend || subtitle) && (
        <div className="flex items-center justify-between text-xs pt-2 border-t border-current/10">
          {trend && (
            <div className="flex items-center gap-1 font-mono font-medium">
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
                <span className={isCharcoal ? 'text-gray-400 text-[11px]' : 'text-secondary-text text-[11px]'}>
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {subtitle && (
            <span
              className={`text-[11px] truncate max-w-[180px] ${
                isCharcoal ? 'text-gray-400' : 'text-secondary-text'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;
