import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@infrastructure/utils/cn';
import type { ButtonProps } from '@domain/entities/ui';

const variantStyles: Record<string, string> = {
  primary:
    'bg-lg-accent text-lg-ink hover:bg-lg-accent active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  secondary:
    'bg-lg-surface-2 border border-lg-surface-2 text-lg-dim hover:text-lg-text hover:bg-lg-surface-2 hover:border-lg-surface-2',
  ghost:
    'text-lg-dim hover:text-lg-text hover:bg-lg-surface-2',
  outline:
    'border border-lg-surface-2 text-lg-dim hover:bg-lg-surface-2 hover:border-lg-surface-2 hover:text-lg-text',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] disabled:opacity-50',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
  xl: 'px-6 py-3.5 text-sm rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, fullWidth, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
