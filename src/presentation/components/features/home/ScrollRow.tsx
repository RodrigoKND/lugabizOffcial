import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  seeAllTo?: string;
}

const ScrollRow: React.FC<ScrollRowProps> = ({ title, subtitle, icon, children, seeAllTo }) => {
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
              <h2 className="font-flyer-sm text-2xl sm:text-3xl text-lg-text">{title}</h2>
              {subtitle && <p className="text-sm text-lg-dim mt-1.5">{subtitle}</p>}
            </div>
          </div>
          {seeAllTo ? (
            <Link
              to={seeAllTo}
              className="flex items-center gap-0.5 text-sm font-semibold text-lg-dim hover:text-lg-text"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                disabled={!canLeft}
                aria-label="Desplazar izquierda"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canLeft
                    ? 'border-lg-surface-2 text-lg-dim hover:border-lg-accent hover:text-lg-accent active:scale-95 cursor-pointer'
                    : 'border-lg-surface text-lg-surface-2 cursor-default'
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
                    ? 'border-lg-surface-2 text-lg-dim hover:border-lg-accent hover:text-lg-accent active:scale-95 cursor-pointer'
                    : 'border-lg-surface text-lg-surface-2 cursor-default'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
