import { CalendarCheck2 } from 'lucide-react';

interface PlansCountBadgeProps {
  count?: number;
  variant?: 'light' | 'dark';
  className?: string;
}

const PlansCountBadge: React.FC<PlansCountBadgeProps> = ({ count, variant = 'light', className = '' }) => {
  if (!count) return null;

  const variantClasses = variant === 'dark'
    ? 'bg-white/15 backdrop-blur-md text-white'
    : 'bg-primary-50 text-primary-700 border border-primary-100';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${variantClasses} ${className}`}>
      <CalendarCheck2 className="w-3 h-3" />
      {count} {count === 1 ? 'plan' : 'planes'}
    </span>
  );
};

export default PlansCountBadge;
