import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'mint' | 'lavender' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    primary: 'bg-charcoal text-white hover:bg-black border border-charcoal active:scale-95 shadow-sm',
    secondary: 'bg-surface-muted text-primary-text hover:bg-border border border-border active:scale-95 shadow-xs',
    mint: 'bg-[#68DD79] text-[#171A18] hover:bg-[#58cc68] border border-[#58cc68] font-bold active:scale-95 shadow-sm',
    lavender: 'bg-[#C5A8F8] text-[#171A18] hover:bg-[#b694f4] border border-[#b694f4] font-bold active:scale-95 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700 active:scale-95 shadow-sm',
    ghost: 'bg-transparent text-secondary-text hover:text-primary-text hover:bg-surface-muted border-transparent',
    outline: 'bg-transparent text-primary-text hover:bg-surface-muted border border-border',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-full gap-1.5',
    md: 'text-xs px-4 py-2 rounded-full gap-2',
    lg: 'text-sm px-5 py-2.5 rounded-full gap-2.5',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-40 disabled:pointer-events-none ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;
