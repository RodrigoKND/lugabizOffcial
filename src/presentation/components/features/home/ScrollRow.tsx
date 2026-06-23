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

  useEffect(() => { setTimeout(check, 100); }, [children]);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  return (
    <section className="mb-7">
      {title && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2.5">
            {icon}
            <div>
              <h2 className="font-semibold text-[15px] text-white leading-none">{title}</h2>
              {subtitle && <p className="text-xs text-white/35 mt-1">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              aria-label="Desplazar izquierda"
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                canLeft
                  ? 'border-white/15 text-white/45 hover:border-white/30 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer'
                  : 'border-white/5 text-white/15 cursor-default'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              aria-label="Desplazar derecha"
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                canRight
                  ? 'border-white/15 text-white/45 hover:border-white/30 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer'
                  : 'border-white/5 text-white/15 cursor-default'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
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
