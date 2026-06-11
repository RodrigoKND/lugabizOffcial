import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ScrollRow: React.FC<ScrollRowProps> = ({ title, subtitle, icon, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, []);

  // Re-check when children change (new items loaded)
  useEffect(() => { setTimeout(check, 100); }, [children]);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  return (
    <section className="mb-7">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {icon || <div className="w-1 h-4 rounded-full bg-primary-400" />}
          <div>
            <h2 className="font-bold text-sm sm:text-base text-text-primary uppercase tracking-wide">{title}</h2>
            {subtitle && <p className="text-[11px] text-text-secondary -mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            aria-label="Desplazar izquierda"
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all
              ${canLeft
                ? 'border-primary-200 text-primary-500 hover:bg-primary-50 active:scale-95 cursor-pointer'
                : 'border-stone-100 text-stone-300 cursor-default'}`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            aria-label="Desplazar derecha"
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all
              ${canRight
                ? 'border-primary-200 text-primary-500 hover:bg-primary-50 active:scale-95 cursor-pointer'
                : 'border-stone-100 text-stone-300 cursor-default'}`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scrollbar-hide md:-mx-4 mx-1 px-4 pb-1 snap-x snap-mandatory"
      >
        {children}
      </div>
    </section>
  );
};

export default ScrollRow;
