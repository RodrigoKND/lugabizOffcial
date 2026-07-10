import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@infrastructure/utils/cn';

type SectionLevel = 'page' | 'section' | 'card';

const levelStyles: Record<SectionLevel, string> = {
  page: 'relative min-h-screen pb-24 md:pb-0 bg-feed-bg',
  section: 'space-y-4',
  card: 'bg-white/5 rounded-3xl p-6 border border-white/8 backdrop-blur-sm',
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  level?: SectionLevel;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  as?: 'section' | 'article' | 'aside' | 'nav' | 'main';
}

export function Section({
  children,
  level = 'section',
  title,
  subtitle,
  icon,
  actions,
  as: Component = 'section',
  className,
  ...props
}: SectionProps) {
  return (
    <Component className={cn(levelStyles[level], className)} {...props}>
      {(title || actions) && (
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-white/40">{icon}</span>}
            <div>
              {title && <h2 className="font-semibold text-[15px] text-white">{title}</h2>}
              {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </Component>
  );
}
