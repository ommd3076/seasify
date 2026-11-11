import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mint' | 'lavender' | 'charcoal' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'mint',
  size = 'md',
  className = '',
  icon,
}) => {
  const variantStyles: Record<string, string> = {
    mint: 'bg-[#E2FBE3] text-[#359D45] border-[#A5F5A6]',
    lavender: 'bg-[#F3EEFD] text-[#8B64DF] border-[#C5A8F8]',
    charcoal: 'bg-[#242424] text-white border-charcoal-border',
    warning: 'bg-[#FEF3C7] text-[#D97706] border-[#FBBF24]',
    danger: 'bg-[#FEE2E2] text-[#DC2626] border-[#F87171]',
    neutral: 'bg-surface-muted text-secondary-text border-border',
    outline: 'bg-transparent text-primary-text border-border',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs transition-colors ${
        variantStyles[variant] || variantStyles.mint
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
