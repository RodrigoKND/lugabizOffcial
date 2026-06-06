interface CategorySelectorProps {
  categories: { id: string; name: string; icon: string; color: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function CategorySelector({ categories, selectedIds, onToggle }: CategorySelectorProps) {
  if (categories.length === 0) return null;

  return (
    <div>
      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Categorías objetivo</span>
      <p className="text-xs text-white/25 mb-3">Se notificará a usuarios con estas preferencias</p>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const sel = selectedIds.includes(cat.id);
          return (
            <button key={cat.id} type="button" onClick={() => onToggle(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                sel
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                  : 'bg-white/5 text-white/50 border-white/10 hover:border-primary-400/30 hover:text-white/70'
              }`}>
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
