import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@infrastructure/utils/cn';
import type { ButtonProps } from '@domain/entities/ui';

const variantStyles: Record<string, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  secondary:
    'bg-white/5 border border-white/10 text-white/45 hover:text-white/75 hover:bg-white/8 hover:border-white/20',
  ghost:
    'text-white/50 hover:text-white/80 hover:bg-white/8',
  outline:
    'border border-white/20 text-white/75 hover:bg-white/8 hover:border-white/30 hover:text-white',
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
