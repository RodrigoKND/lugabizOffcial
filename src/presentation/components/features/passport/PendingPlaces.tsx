import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Place } from '@domain/entities';

// Lugares que aún no tienen sello: el motivo para salir a explorar.
const PendingPlaces: React.FC<{ places: Place[] }> = ({ places }) => {
  if (places.length === 0) return null;
  return (
    <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-8">
      <h2 className="font-flyer-sm text-2xl text-lg-text mb-1">Por sellar</h2>
      <p className="text-sm text-lg-dim mb-4">Cuando estés cerca, responde “Sí, estoy aquí” en la encuesta del lugar y ganas el sello.</p>
      <ul className="space-y-2">
        {places.map(p => (
          <li key={p.id}>
            <Link to={`/place/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-lg-surface p-2.5 hover:bg-lg-surface-2 transition-colors">
              {p.image
                ? <img src={p.image} alt="" loading="lazy" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                : <span className="w-14 h-14 rounded-xl bg-lg-surface-2 shrink-0" />}
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-lg-text truncate">{p.name}</span>
                <span className="block text-xs text-lg-dim truncate">{p.category?.name}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-lg-accent"><Star className="w-3 h-3 fill-lg-accent" />{p.rating}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PendingPlaces;
