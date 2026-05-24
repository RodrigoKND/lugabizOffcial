import { ChevronRight } from 'lucide-react';

interface ScrollRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ScrollRow: React.FC<ScrollRowProps> = ({ title, subtitle, icon, children }) => (
  <section className="mb-7">
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        {icon || <div className="w-1 h-4 rounded-full bg-primary-400" />}
        <div>
          <h2 className="font-bold text-sm sm:text-base text-text-primary uppercase tracking-wide">{title}</h2>
          {subtitle && <p className="text-[11px] text-text-secondary -mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-text-secondary" />
    </div>
    <div className="flex gap-3 overflow-x-auto scrollbar-hide md:-mx-4 mx-1  px-4 pb-1 snap-x snap-mandatory">
      {children}
    </div>
  </section>
);

export default ScrollRow;
