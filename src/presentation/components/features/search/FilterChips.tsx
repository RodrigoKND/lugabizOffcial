import { Hash, Users } from 'lucide-react';
import type { Category, SocialGroup } from '@domain/entities';

interface FilterChipsProps {
  categories: Category[];
  socialGroups: SocialGroup[];
  selectedCategory: string | null;
  selectedSocialGroup: string | null;
  onCategoryClick: (catId: string) => void;
  onSocialGroupClick: (sgId: string) => void;
}

export function FilterChips({ categories, socialGroups, selectedCategory, selectedSocialGroup, onCategoryClick, onSocialGroupClick }: FilterChipsProps) {
  return (
    <nav aria-label="Filtros de búsqueda">
      <div className="px-4 pb-3 border-b border-stone-100">
        <h2 className="sr-only">Filtrar por categoría o grupo social</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="list" aria-label="Categorías">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onCategoryClick(cat.id)}
              role="listitem"
              aria-pressed={selectedCategory === cat.id}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-primary-300 hover:text-primary-600'
              }`}>
              <Hash className="w-3 h-3" aria-hidden="true" />
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2" role="list" aria-label="Grupos sociales">
          {socialGroups.map(sg => (
            <button key={sg.id} onClick={() => onSocialGroupClick(sg.id)}
              role="listitem"
              aria-pressed={selectedSocialGroup === sg.id}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedSocialGroup === sg.id
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-600'
              }`}>
              <Users className="w-3 h-3" aria-hidden="true" />
              {sg.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
