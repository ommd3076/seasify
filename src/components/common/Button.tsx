import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'icon'
  | 'mint'
  | 'lavender'
  | 'outline';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  'data-testid'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  'data-testid': testId,
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 active:scale-[0.98] select-none focus:outline-none focus:ring-2 focus:ring-[#68DD79]/40';

  const variantClasses: Record<string, string> = {
    primary:
      'bg-[#A5F5A6] text-[#171A18] hover:bg-[#68DD79] border border-[#68DD79]/50 shadow-sm font-bold',
    secondary:
      'bg-[#F7F9F6] text-[#171A18] hover:bg-[#EAEFEC] border border-[#D9DEDA] shadow-sm',
    ghost:
      'bg-transparent text-[#737A75] hover:text-[#171A18] hover:bg-[#EAEFEC]/60 border border-transparent',
    danger:
      'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] border border-[#FCA5A5]',
    icon:
      'p-2 bg-[#F7F9F6] text-[#171A18] hover:bg-[#EAEFEC] border border-[#D9DEDA] rounded-full aspect-square',
    mint:
      'bg-[#68DD79] text-[#171A18] hover:bg-[#58cc68] border border-[#58cc68] font-bold shadow-sm',
    lavender:
      'bg-[#C5A8F8] text-[#171A18] hover:bg-[#b694f4] border border-[#b694f4] font-bold shadow-sm',
    outline:
      'bg-transparent text-primary-text hover:bg-surface-muted border border-border',
  };

  const sizeClasses: Record<string, string> =
    variant === 'icon'
      ? { sm: 'p-1.5', md: 'p-2', lg: 'p-2.5' }
      : {
          sm: 'px-3 py-1.5 text-xs gap-1.5',
          md: 'px-4 py-2 text-sm gap-2',
          lg: 'px-5 py-2.5 text-base gap-2.5',
        };

  const currentVariant = variantClasses[variant] || variantClasses.secondary;
  const currentSize = sizeClasses[size] || sizeClasses.md;
  const disabledClasses =
    disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return (
    <button
      data-testid={testId || 'button'}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${currentVariant} ${currentSize} ${disabledClasses} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;
