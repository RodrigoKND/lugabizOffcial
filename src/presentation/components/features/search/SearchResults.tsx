import { Search, Store } from 'lucide-react';
import type { Place } from '@domain/entities';
import { SearchResultItem } from './SearchResultItem';

interface SearchResultsProps {
  query: string;
  results: Place[];
  selectedCategory: string | null;
  selectedSocialGroup: string | null;
  onSelect: (placeId: string) => void;
}

export function SearchResults({ query, results, selectedCategory, selectedSocialGroup, onSelect }: SearchResultsProps) {
  return (
    <section aria-label="Resultados de búsqueda" className="max-h-80 overflow-y-auto">
      {query && results.length === 0 && !selectedCategory && !selectedSocialGroup && (
        <div className="flex flex-col items-center py-12 px-4" role="status">
          <Search className="w-10 h-10 text-stone-300 mb-3" aria-hidden="true" />
          <p className="text-stone-500 text-sm font-medium">Sin resultados para "{query}"</p>
          <p className="text-stone-400 text-xs mt-1">Prueba con otra palabra o categoría</p>
        </div>
      )}

      {selectedCategory && results.length === 0 && (
        <div className="flex flex-col items-center py-12 px-4" role="status">
          <Store className="w-10 h-10 text-stone-300 mb-3" aria-hidden="true" />
          <p className="text-stone-500 text-sm font-medium">No hay lugares en esta categoría</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="py-2" role="list" aria-label="Lugares encontrados">
          {results.slice(0, 20).map((place, i) => (
            <SearchResultItem key={place.id} place={place} index={i} onSelect={onSelect} />
          ))}
        </div>
      )}

      {!query && !selectedCategory && !selectedSocialGroup && (
        <div className="flex flex-col items-center py-12 px-4" role="status">
          <Search className="w-10 h-10 text-stone-300 mb-3" aria-hidden="true" />
          <p className="text-stone-500 text-sm font-medium">Escribe para buscar o elige una categoría</p>
        </div>
      )}
    </section>
  );
}
