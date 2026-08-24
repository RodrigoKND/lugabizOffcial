import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlaces } from '@presentation/context';
import HeroSearchResults from './HeroSearchResults';

// Buscador del hero: input + resultados inline + badges de grupos sociales.
const HeroSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const { socialGroups, searchPlaces } = usePlaces();

  const results = query.trim() ? searchPlaces(query).slice(0, 6) : [];
  const showDropdown = focused && query.trim().length > 0;

  const selectPlace = (id: string) => {
    setFocused(false);
    navigate(`/place/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
      className="mt-5 max-w-md"
    >
      <div className="relative">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-[0_4px_20px_rgba(80,50,140,0.10)] ring-1 ring-primary-100 px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary-300 transition-all">
          <Search className="w-[18px] h-[18px] text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setFocused(false); }}
            placeholder="Restaurantes, cafeterías, parques..."
            aria-label="Buscar lugares"
            className="flex-1 bg-transparent outline-none border-0 text-sm text-[#241b3e] placeholder:text-stone-400 py-2.5 min-w-0"
          />
          <button
            onMouseDown={(e) => { e.preventDefault(); if (results[0]) selectPlace(results[0].id); }}
            aria-label="Buscar"
            className="shrink-0 w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <HeroSearchResults visible={showDropdown} query={query} results={results} onSelect={selectPlace} />
      </div>

      {/* Badges de grupos sociales registrados */}
      {socialGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {socialGroups.slice(0, 8).map((group) => (
            <button
              key={group.id}
              onMouseDown={(e) => { e.preventDefault(); setQuery(group.name); setFocused(true); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 ring-1 ${
                query === group.name
                  ? 'bg-primary-500 text-white ring-primary-500'
                  : 'bg-white/80 hover:bg-white text-primary-700 ring-primary-200/70 hover:ring-primary-400 hover:text-primary-800'
              }`}
            >
              {group.icon && group.icon.length <= 4 ? `${group.icon} ` : ''}{group.name}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HeroSearch;
