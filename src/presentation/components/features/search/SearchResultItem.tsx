import { motion } from 'framer-motion';
import { Store, Star } from 'lucide-react';
import type { Place } from '@domain/entities';

interface SearchResultItemProps {
  place: Place;
  index: number;
  onSelect: (placeId: string) => void;
}

export function SearchResultItem({ place, index, onSelect }: SearchResultItemProps) {
  return (
    <motion.button
      key={place.id}
      role="listitem"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onSelect(place.id)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-white/8 overflow-hidden shrink-0">
        {place.image ? (
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
            <Store className="w-5 h-5 text-white/25" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{place.name}</p>
        <p className="text-xs text-white/35 truncate">{place.description}</p>
      </div>
      {place.rating > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-[11px] text-white/40">{place.rating.toFixed(1)}</span>
        </div>
      )}
    </motion.button>
  );
}
