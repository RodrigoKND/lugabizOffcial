import { cn } from '@infrastructure/utils/cn';
import type { CardProps } from '@domain/entities/ui/CardProps';

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, padding = 'md', hover, glass, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/8',
        glass && 'bg-white/5 backdrop-blur-sm',
        !glass && 'bg-white/5',
        paddingStyles[padding],
        hover && 'hover:bg-white/8 hover:border-white/12 transition-all cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
