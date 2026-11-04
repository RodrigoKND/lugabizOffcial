import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Place } from '@domain/entities';

interface HeroSearchResultsProps {
  visible: boolean;
  query: string;
  results: Place[];
  onSelect: (id: string) => void;
}

// Dropdown con los resultados de búsqueda inline del hero.
const HeroSearchResults: React.FC<HeroSearchResultsProps> = ({ visible, query, results, onSelect }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="absolute z-30 mt-2 w-full max-h-80 overflow-y-auto bg-lg-surface rounded-2xl shadow-2xl shadow-black/50"
      >
        {results.length > 0 ? (
          results.map(place => (
            <button
              key={place.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect(place.id); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-lg-surface-2 text-left transition-colors"
            >
              {place.image ? (
                <img src={place.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="w-10 h-10 rounded-lg bg-lg-surface-2 text-lg-accent flex items-center justify-center font-bold shrink-0">
                  {place.name.charAt(0)}
                </span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-lg-text truncate">{place.name}</span>
                <span className="block text-[11px] text-lg-dim truncate">{place.category?.name}</span>
              </span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-lg-dim shrink-0">
                <Star className="w-3 h-3 fill-lg-accent text-lg-accent" />
                {place.rating}
              </span>
            </button>
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-lg-dim">Sin resultados para “{query.trim()}”</p>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

export default HeroSearchResults;
