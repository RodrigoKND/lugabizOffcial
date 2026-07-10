import { cn } from '@infrastructure/utils/cn';
import type { BadgeProps, BadgeVariant } from '@domain/entities/ui/BadgeProps';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/8 text-white/60 border border-white/10',
  primary: 'bg-primary-500/15 text-primary-300 border border-primary-500/20',
  success: 'bg-green-500/15 text-green-300 border border-green-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  danger: 'bg-red-500/15 text-red-300 border border-red-500/20',
  info: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
};

export function Badge({ children, variant = 'default', dot, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', variantStyles[variant], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
