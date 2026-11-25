import { Link, type Location } from 'react-router-dom';
import { Star, Store } from 'lucide-react';
import type { Place } from '@domain/entities';

interface RelatedPlacesRowProps {
  places: Place[];
  categoryName?: string;
  // Se conserva el "fondo" para que, si venías de una lista, abrir otro lugar siga siendo un modal.
  backgroundLocation: Location;
}

export default function RelatedPlacesRow({ places, categoryName, backgroundLocation }: RelatedPlacesRowProps) {
  if (places.length === 0) return null;

  return (
    <section aria-labelledby="related-title" className="mt-10 border-t-2 border-lg-surface-2 pt-6">
      <h2 id="related-title" className="mb-4 font-flyer-sm text-2xl text-lg-text">Más de {categoryName}</h2>
      <div className="scrollbar-hide -mx-1 mb-24 flex gap-3 overflow-x-auto px-1 pb-2">
        {places.map(p => (
          <Link key={p.id} to={`/place/${p.id}`} state={{ background: backgroundLocation }}
            className="group w-36 shrink-0 overflow-hidden rounded-xl border-2 border-lg-text bg-lg-surface transition-transform active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-accent">
            <div className="relative aspect-[4/3] overflow-hidden bg-lg-surface-2">
              {p.image ? (
                <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><Store className="h-6 w-6 text-lg-dim" /></div>
              )}
              <div className="poster-halftone absolute inset-0" aria-hidden="true" />
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-bold text-lg-text">{p.name}</p>
              <p className="flex items-center gap-1 text-xs font-semibold text-lg-dim">
                <Star className="h-3 w-3 fill-lg-maiz text-lg-maiz" /> {p.rating.toFixed(1)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
