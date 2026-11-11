import React from 'react';

export type BadgeVariant =
  | 'normal'
  | 'elevated'
  | 'low_tide'
  | 'maintenance'
  | 'high'
  | 'moderate'
  | 'low'
  | 'open'
  | 'resolved'
  | 'neutral'
  // Legacy / color aliases
  | 'mint'
  | 'lavender'
  | 'charcoal'
  | 'warning'
  | 'danger'
  | 'outline';

export interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  children?: React.ReactNode;
  withDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  'data-testid'?: string;
}

const VARIANT_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  normal: {
    bg: 'bg-[#A5F5A6]/30',
    text: 'text-[#156024]',
    border: 'border-[#68DD79]/50',
    dot: 'bg-[#68DD79]',
  },
  elevated: {
    bg: 'bg-[#C5A8F8]/30',
    text: 'text-[#5B32A8]',
    border: 'border-[#C5A8F8]',
    dot: 'bg-[#8B5CF6]',
  },
  low_tide: {
    bg: 'bg-[#EAEFEC]',
    text: 'text-[#475569]',
    border: 'border-[#CBD5E1]',
    dot: 'bg-[#64748B]',
  },
  maintenance: {
    bg: 'bg-[#EAEFEC]',
    text: 'text-[#64748B]',
    border: 'border-[#D9DEDA]',
    dot: 'bg-[#94A3B8]',
  },
  high: {
    bg: 'bg-[#C5A8F8]/40',
    text: 'text-[#171A18]',
    border: 'border-[#C5A8F8]',
    dot: 'bg-[#7C3AED]',
  },
  moderate: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#F59E0B]',
  },
  low: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#166534]',
    border: 'border-[#BBF7D0]',
    dot: 'bg-[#22C55E]',
  },
  open: {
    bg: 'bg-[#A5F5A6]',
    text: 'text-[#171A18]',
    border: 'border-[#68DD79]/50',
    dot: 'bg-[#171A18]',
  },
  resolved: {
    bg: 'bg-[#EAEFEC]',
    text: 'text-[#737A75]',
    border: 'border-[#D9DEDA]',
    dot: 'bg-[#94A3B8]',
  },
  neutral: {
    bg: 'bg-[#EAEFEC]',
    text: 'text-[#171A18]',
    border: 'border-[#D9DEDA]',
    dot: 'bg-[#737A75]',
  },
  // Legacy mappings
  mint: {
    bg: 'bg-[#E2FBE3]',
    text: 'text-[#359D45]',
    border: 'border-[#A5F5A6]',
    dot: 'bg-[#68DD79]',
  },
  lavender: {
    bg: 'bg-[#F3EEFD]',
    text: 'text-[#8B64DF]',
    border: 'border-[#C5A8F8]',
    dot: 'bg-[#8B5CF6]',
  },
  charcoal: {
    bg: 'bg-[#242424]',
    text: 'text-white',
    border: 'border-charcoal-border',
    dot: 'bg-white',
  },
  warning: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    border: 'border-[#FBBF24]',
    dot: 'bg-[#F59E0B]',
  },
  danger: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    border: 'border-[#F87171]',
    dot: 'bg-[#DC2626]',
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-primary-text',
    border: 'border-border',
    dot: 'bg-[#737A75]',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'normal',
  label,
  children,
  withDot = true,
  size = 'md',
  className = '',
  icon,
  'data-testid': testId,
}) => {
  const styles = VARIANT_MAP[variant] || VARIANT_MAP.neutral;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1 text-sm'
      : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      data-testid={testId || 'badge'}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses} ${className}`}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children || label}</span>
    </span>
  );
};

export default Badge;
