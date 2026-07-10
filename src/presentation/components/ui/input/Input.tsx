import { forwardRef } from 'react';
import { cn } from '@infrastructure/utils/cn';
import type { InputProps } from '@domain/entities/ui';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightIcon, onRightIconClick, wrapperClassName, ...props }, ref) => (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-2xl',
            'focus:border-primary-400/60 focus:bg-white/8 focus:ring-0',
            'transition-all text-white placeholder:text-white/25 outline-none text-sm',
            icon && 'pl-12',
            rightIcon && 'pr-12',
            props.type === 'password' && 'pr-12',
            error && 'border-red-500/50 focus:border-red-400/60',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
