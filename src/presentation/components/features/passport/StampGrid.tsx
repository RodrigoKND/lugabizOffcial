import type { PassportStamp } from '@lib/supabase/services/chispa/passport';
import StampBadge from './StampBadge';

const MIN_SLOTS = 9;

// Cuadrícula de sellos: ganados con nombre y fecha, y casillas vacías hasta completar la fila.
const StampGrid: React.FC<{ stamps: PassportStamp[] }> = ({ stamps }) => {
  const slots = Math.max(MIN_SLOTS, Math.ceil((stamps.length + 1) / 3) * 3);
  const items = Array.from({ length: slots }, (_, i) => stamps[i]);

  return (
    <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-8">
      <h2 className="font-flyer-sm text-2xl text-lg-text mb-4">Tus sellos</h2>
      <ul className="grid grid-cols-3 gap-4">
        {items.map((s, i) => (
          <li key={s?.placeId ?? `empty-${i}`} className="flex flex-col items-center gap-2 bg-lg-surface rounded-3xl py-4 px-2">
            <StampBadge size="lg" label={s?.name} tilt={((i * 7) % 13) - 6} />
            <span className="text-[11px] font-semibold text-lg-dim">
              {s ? new Date(s.stampedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' }) : 'Por ganar'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StampGrid;
