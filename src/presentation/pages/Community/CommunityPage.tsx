import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Store, Calendar, X, Star, SlidersHorizontal, Filter, Loader2, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { usePlaces } from '@presentation/context';
import { Place, Event } from '@domain/entities';
import {
  searchPlaces, searchEvents,
  PlaceSearchFilters, EventSearchFilters,
} from '@lib/supabase/services/community/communitySearch';
import BusinessSearchCard from '@presentation/components/features/community/BusinessSearchCard';
import EventSearchCard from '@presentation/components/features/community/EventSearchCard';
import EmptyCommunityState from '@presentation/components/features/community/EmptyCommunityState';

type Tab = 'places' | 'events';
type PlaceSort = 'relevance' | 'rating' | 'reviews' | 'newest';
type EventSort = 'relevance' | 'attendees' | 'newest';

// ── Subcomponent: scalable scrollable category list ──────────────────────────
interface CategoryFilterProps {
  categories: { id: string; name: string; icon: string; color: string }[];
  selected: string;
  onChange: (id: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onChange }) => {
  const [catQuery, setCatQuery] = useState('');
  const visible = catQuery
    ? categories.filter(c => c.name.toLowerCase().includes(catQuery.toLowerCase()))
    : categories;

  return (
    <div>
      <p className="text-xs font-semibold text-lg-dim mb-2">Categoría</p>
      {categories.length > 6 && (
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-lg-dim pointer-events-none" />
          <input
            value={catQuery}
            onChange={e => setCatQuery(e.target.value)}
            placeholder="Buscar categoría…"
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-lg-surface-2 focus:outline-none focus:ring-1 focus:ring-primary-300 bg-lg-surface-2"
          />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
        <button
          onClick={() => onChange('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
            selected === 'all' ? 'bg-lg-surface-2 text-lg-accent font-semibold' : 'text-lg-dim hover:bg-lg-surface-2'
          }`}>
          <span>Todas las categorías</span>
          {selected === 'all' && <Check className="w-3.5 h-3.5 text-lg-accent" />}
        </button>
        {visible.map(cat => (
          <button
            key={cat.id}
            onClick={() => onChange(selected === cat.id ? 'all' : cat.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
              selected === cat.id ? 'bg-lg-surface-2 text-lg-accent font-semibold' : 'text-lg-dim hover:bg-lg-surface-2'
            }`}>
            <span className="truncate">{cat.name}</span>
            {selected === cat.id && <Check className="w-3.5 h-3.5 text-lg-accent shrink-0" />}
          </button>
        ))}
        {visible.length === 0 && (
          <p className="text-xs text-lg-dim text-center py-3">Sin resultados</p>
        )}
      </div>
    </div>
  );
};

const PLACE_SORT: { key: PlaceSort; label: string }[] = [
  { key: 'relevance', label: 'Relevancia' },
  { key: 'rating', label: 'Mejor calificación' },
  { key: 'reviews', label: 'Más reseñas' },
  { key: 'newest', label: 'Más recientes' },
];

const EVENT_SORT: { key: EventSort; label: string }[] = [
  { key: 'relevance', label: 'Próximos' },
  { key: 'attendees', label: 'Más asistentes' },
  { key: 'newest', label: 'Más recientes' },
];

// ── Mobile filter bottom sheet ───────────────────────────────────────────────
interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  tab: Tab;
  sortOptions: { key: string; label: string }[];
  currentSort: string;
  onSort: (key: string) => void;
  categories: { id: string; name: string; icon: string; color: string }[];
  selectedCategory: string;
  onCategory: (id: string) => void;
  socialGroups: { id: string; name: string; icon: string }[];
  selectedSocialGroup: string;
  onSocialGroup: (id: string) => void;
  minRating: number;
  onRating: (r: number) => void;
  activeCount: number;
  onReset: () => void;
}

const FilterBottomSheet: React.FC<FilterSheetProps> = ({
  open, onClose, tab, sortOptions, currentSort, onSort,
  categories, selectedCategory, onCategory,
  socialGroups, selectedSocialGroup, onSocialGroup,
  minRating, onRating, activeCount, onReset,
}) => {
  const [catQuery, setCatQuery] = useState('');
  const visibleCats = catQuery
    ? categories.filter(c => c.name.toLowerCase().includes(catQuery.toLowerCase()))
    : categories;

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/40"
          onClick={onClose}
        />
      )}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-[201] bg-lg-surface rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-lg-surface-2" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-lg-surface-2 shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-lg-accent" />
                <span className="font-bold text-lg-text text-sm">Filtros</span>
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-lg-accent text-lg-ink text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={onReset} className="text-xs text-lg-accent font-semibold">
                    Limpiar
                  </button>
                )}
                <button onClick={onClose} className="w-7 h-7 rounded-full bg-lg-surface-2 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-lg-dim" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-safe">
              {/* Sort */}
              <div>
                <p className="text-xs font-bold text-lg-dim uppercase tracking-wider mb-3">Ordenar por</p>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => onSort(opt.key)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all text-left ${
                        currentSort === opt.key
                          ? 'bg-lg-surface-2 border-primary-300 text-lg-accent'
                          : 'bg-lg-surface-2 border-lg-surface-2 text-lg-dim'
                      }`}
                    >
                      {currentSort === opt.key && <Check className="w-3 h-3 inline mr-1 mb-0.5" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-lg-dim uppercase tracking-wider mb-3">Categoría</p>
                  {categories.length > 6 && (
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lg-dim pointer-events-none" />
                      <input
                        value={catQuery}
                        onChange={e => setCatQuery(e.target.value)}
                        placeholder="Buscar categoría…"
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-lg-surface-2 focus:outline-none focus:ring-1 focus:ring-primary-300 bg-lg-surface-2"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                    <button
                      onClick={() => onCategory('all')}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all text-left ${
                        selectedCategory === 'all'
                          ? 'bg-lg-surface-2 border-primary-300 text-lg-accent'
                          : 'bg-lg-surface-2 border-lg-surface-2 text-lg-dim'
                      }`}
                    >
                      {selectedCategory === 'all' && <Check className="w-3 h-3 inline mr-1 mb-0.5" />}
                      Todas
                    </button>
                    {visibleCats.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => onCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all text-left truncate ${
                          selectedCategory === cat.id
                            ? 'bg-lg-surface-2 border-primary-300 text-lg-accent'
                            : 'bg-lg-surface-2 border-lg-surface-2 text-lg-dim'
                        }`}
                      >
                        {selectedCategory === cat.id && <Check className="w-3 h-3 inline mr-1 mb-0.5" />}
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Social group */}
              {socialGroups.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-lg-dim uppercase tracking-wider mb-3">Grupo social</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onSocialGroup('all')}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        selectedSocialGroup === 'all'
                          ? 'bg-lg-accent text-lg-ink border-primary-500'
                          : 'bg-lg-surface text-lg-dim border-lg-surface-2'
                      }`}
                    >
                      Todos
                    </button>
                    {socialGroups.map(sg => {
                      const IconComp = Icons[sg.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }> | undefined;
                      const isSelected = selectedSocialGroup === sg.id;
                      return (
                        <button
                          key={sg.id}
                          onClick={() => onSocialGroup(isSelected ? 'all' : sg.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                            isSelected
                              ? 'bg-lg-accent text-lg-ink border-primary-500'
                              : 'bg-lg-surface text-lg-dim border-lg-surface-2'
                          }`}
                        >
                          {IconComp && <IconComp className="w-3.5 h-3.5" />}
                          {sg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rating */}
              {tab === 'places' && (
                <div>
                  <p className="text-xs font-bold text-lg-dim uppercase tracking-wider mb-3">Calificación mínima</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => onRating(minRating === star ? 0 : star)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          minRating === star
                            ? 'bg-amber-50 text-amber-600 border-amber-300'
                            : 'bg-lg-surface-2 text-lg-dim border-lg-surface-2'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${minRating >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply button */}
            <div className="px-5 py-4 border-t border-lg-surface-2 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-lg-accent text-lg-ink rounded-2xl font-bold text-sm hover:bg-lg-accent transition-colors"
              >
                Aplicar filtros{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
            </div>
          </div>
      )}
    </>,
    document.body,
  );
};

const CommunityPage: React.FC = () => {
  const { categories, socialGroups } = usePlaces();

  const [tab, setTab] = useState<Tab>('places');
  const [inputValue, setInputValue] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSocialGroup, setSelectedSocialGroup] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [placeSort, setPlaceSort] = useState<PlaceSort>('relevance');
  const [eventSort, setEventSort] = useState<EventSort>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [placePage, setPlacePage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [hasMorePlaces, setHasMorePlaces] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function fetchPlaces(page: number, append: boolean) {
    const filters: PlaceSearchFilters = {
      query: committedQuery,
      categoryId: selectedCategory,
      socialGroupId: selectedSocialGroup,
      minRating,
      sortBy: placeSort,
    };
    try {
      const result = await searchPlaces(filters, page);
      setTotalPlaces(result.total);
      setHasMorePlaces(result.hasMore);
      setPlaces(prev => append ? [...prev, ...result.data] : result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching places:', err);
      if (!append) setPlaces([]);
      setError((err as Error)?.message || 'Error al cargar lugares');
    }
  }

  async function fetchEvents(page: number, append: boolean) {
    const filters: EventSearchFilters = {
      query: committedQuery,
      categoryId: selectedCategory,
      sortBy: eventSort,
    };
    try {
      const result = await searchEvents(filters, page);
      setTotalEvents(result.total);
      setHasMoreEvents(result.hasMore);
      setEvents(prev => append ? [...prev, ...result.data] : result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      if (!append) setEvents([]);
      setError((err as Error)?.message || 'Error al cargar eventos');
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setPlacePage(1);
      setEventPage(1);
      try {
        if (tab === 'places') await fetchPlaces(1, false);
        else await fetchEvents(1, false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [committedQuery, tab, selectedCategory, selectedSocialGroup, minRating, placeSort, eventSort]);

  async function loadMorePlaces() {
    const next = placePage + 1;
    setLoadingMore(true);
    await fetchPlaces(next, true);
    setPlacePage(next);
    setLoadingMore(false);
  }

  async function loadMoreEvents() {
    const next = eventPage + 1;
    setLoadingMore(true);
    await fetchEvents(next, true);
    setEventPage(next);
    setLoadingMore(false);
  }

  function commitSearch() { setCommittedQuery(inputValue.trim()); }
  function clearSearch() { setInputValue(''); setCommittedQuery(''); }
  function resetFilters() {
    setSelectedCategory('all');
    setSelectedSocialGroup('all');
    setMinRating(0);
    setPlaceSort('relevance');
    setEventSort('relevance');
  }

  const selectedCat = categories.find(c => c.id === selectedCategory);
  const selectedSG = socialGroups.find(sg => sg.id === selectedSocialGroup);
  const sortOptions = tab === 'places' ? PLACE_SORT : EVENT_SORT;
  const currentSort = tab === 'places' ? placeSort : eventSort;
  function setSort(key: string) {
    if (tab === 'places') setPlaceSort(key as PlaceSort);
    else setEventSort(key as EventSort);
  }

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSocialGroup !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (currentSort !== 'relevance' ? 1 : 0);

  const isEmpty = tab === 'places' ? places.length === 0 : events.length === 0;
  const currentTotal = tab === 'places' ? totalPlaces : totalEvents;

  return (
    <div className="min-h-screen bg-lg-ground pb-24 md:pb-8">
      {/* Hero header */}
      <div className="bg-primary-800 pt-8 pb-7 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Comunidad</h1>
          <p className="text-primary-200 text-sm mb-5">Explora y descubre negocios y eventos de tu ciudad</p>
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lg-dim pointer-events-none" />
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitSearch()}
                placeholder="Buscar por nombre, dirección, categoría…"
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-lg-surface text-sm text-lg-text placeholder:text-lg-dim focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-lg"
              />
              {inputValue && (
                <button onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-lg-surface-2 transition-colors">
                  <X className="w-3.5 h-3.5 text-lg-dim" />
                </button>
              )}
            </div>
            <button onClick={commitSearch}
              className="px-5 py-3 bg-lg-surface text-lg-accent font-semibold text-sm rounded-xl shadow-lg hover:bg-lg-surface-2 transition-colors shrink-0">
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        {/* Tabs + mobile filter toggle */}
        <div className="flex items-center gap-3 mb-5 overflow-x-auto scrollbar-hide">
          {([
            { key: 'places' as Tab, label: 'Negocios', icon: Store, count: totalPlaces },
            { key: 'events' as Tab, label: 'Eventos', icon: Calendar, count: totalEvents },
          ] as const).map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-lg-accent text-lg-ink shadow-sm'
                  : 'bg-lg-surface text-lg-dim border border-lg-surface-2 hover:text-lg-accent hover:border-lg-surface-2'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === key ? 'bg-white/20' : 'bg-lg-surface-2 text-lg-dim'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}

          <button onClick={() => setShowFilters(v => !v)}
            className={`md:hidden shrink-0 ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-lg-surface-2 border-lg-surface-2 text-lg-accent'
                : 'bg-lg-surface border-lg-surface-2 text-lg-dim'
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-lg-accent text-lg-ink text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filter bottom sheet */}
        <FilterBottomSheet
          open={showFilters}
          onClose={() => setShowFilters(false)}
          tab={tab}
          sortOptions={sortOptions}
          currentSort={currentSort}
          onSort={setSort}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategory={setSelectedCategory}
          socialGroups={socialGroups}
          selectedSocialGroup={selectedSocialGroup}
          onSocialGroup={setSelectedSocialGroup}
          minRating={minRating}
          onRating={setMinRating}
          activeCount={activeFiltersCount}
          onReset={resetFilters}
        />

        <div className="flex gap-6">
          {/* ── LEFT SIDEBAR (desktop only) ───────────── */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-20 space-y-4">
              <div className="bg-lg-surface rounded-2xl border border-lg-surface-2 shadow-xs p-4 space-y-5">

                {/* Header */}
                <div className="flex items-center gap-2 text-xs font-semibold text-lg-dim">
                  <Filter className="w-3.5 h-3.5 text-lg-accent" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <button onClick={resetFilters}
                      className="ml-auto text-xs text-lg-accent font-semibold hover:text-lg-accent normal-case tracking-normal">
                      Limpiar todo
                    </button>
                  )}
                </div>

                {/* Ordenar */}
                <div>
                  <p className="text-xs font-semibold text-lg-dim mb-2">Ordenar por</p>
                  <div className="space-y-1">
                    {sortOptions.map(opt => (
                      <button key={opt.key} onClick={() => setSort(opt.key)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                          currentSort === opt.key ? 'bg-lg-surface-2 text-lg-accent font-semibold' : 'text-lg-dim hover:bg-lg-surface-2'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categoría — lista scrolleable con búsqueda interna */}
                {categories.length > 0 && (
                  <CategoryFilter
                    categories={categories}
                    selected={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                )}

                {/* Grupo social — badges con íconos Lucide */}
                {socialGroups.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-lg-dim mb-2">Grupo social</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSocialGroup('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          selectedSocialGroup === 'all'
                            ? 'bg-lg-accent text-lg-ink border-primary-500'
                            : 'bg-lg-surface text-lg-dim border-lg-surface-2 hover:border-primary-300 hover:text-lg-accent'
                        }`}>
                        Todos
                      </button>
                      {socialGroups.map(sg => {
                        const IconComp = Icons[sg.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }> | undefined;
                        const isSelected = selectedSocialGroup === sg.id;
                        return (
                          <button
                            key={sg.id}
                            onClick={() => setSelectedSocialGroup(isSelected ? 'all' : sg.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-lg-accent text-lg-ink border-primary-500'
                                : 'bg-lg-surface text-lg-dim border-lg-surface-2 hover:border-primary-300 hover:text-lg-accent'
                            }`}>
                            {IconComp && <IconComp className="w-3 h-3" />}
                            {sg.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Calificación mínima (solo negocios) */}
                {tab === 'places' && (
                  <div>
                    <p className="text-xs font-semibold text-lg-dim mb-2">Calificación mínima</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setMinRating(minRating === star ? 0 : star)}
                          className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-semibold border transition-all ${
                            minRating === star
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'bg-lg-surface-2 text-lg-dim border-transparent hover:border-amber-200'
                          }`}>
                          <Star className={`w-3 h-3 ${minRating >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span className="ml-0.5">{star}</span>
                        </button>
                      ))}
                    </div>
                    {minRating > 0 && (
                      <p className="text-[11px] text-lg-dim mt-1">{minRating}+ estrellas</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── RIGHT RESULTS ─────────────────────────── */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory !== 'all' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lg-surface-2 text-lg-accent text-xs font-semibold border border-lg-surface-2">
                    {selectedCat?.icon} {selectedCat?.name}
                    <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedSocialGroup !== 'all' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lg-surface-2 text-lg-accent text-xs font-semibold border border-lg-surface-2">
                    {selectedSG?.icon} {selectedSG?.name}
                    <button onClick={() => setSelectedSocialGroup('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{minRating}+
                    <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentSort !== 'relevance' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lg-surface-2 text-lg-dim text-xs font-semibold border border-lg-surface-2">
                    {sortOptions.find(o => o.key === currentSort)?.label}
                    <button onClick={() => setSort('relevance')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-lg-accent" />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <p className="font-semibold text-lg-text mb-1">Error al cargar</p>
                <p className="text-sm text-lg-dim mb-4 max-w-xs">{error}</p>
                <button onClick={() => { setError(null); setTab(tab); }}
                  className="px-5 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-colors">
                  Reintentar
                </button>
              </div>
            )}

            {/* Results count */}
            {!loading && !error && !isEmpty && (
              <p className="text-xs text-lg-dim mb-4 px-1">
                {tab === 'places'
                  ? `${currentTotal} negocio${currentTotal !== 1 ? 's' : ''} encontrado${currentTotal !== 1 ? 's' : ''}`
                  : `${currentTotal} evento${currentTotal !== 1 ? 's' : ''} encontrado${currentTotal !== 1 ? 's' : ''}`}
                {committedQuery && <span> para "<strong>{committedQuery}</strong>"</span>}
              </p>
            )}

            <AnimatePresence mode="wait">
              {!loading && !error && isEmpty ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyCommunityState query={committedQuery} activeTab={tab} />
                </motion.div>
              ) : !loading ? (
                <motion.div key={`${tab}-${committedQuery}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {tab === 'places' ? (
                    <>
                      <div className="space-y-3">
                        {places.map(place => <BusinessSearchCard key={place.id} place={place} />)}
                      </div>
                      {hasMorePlaces && (
                        <button onClick={loadMorePlaces} disabled={loadingMore}
                          className="w-full mt-4 py-3 rounded-xl border border-lg-surface-2 text-lg-dim text-sm font-semibold hover:bg-lg-surface-2 hover:text-lg-accent transition-colors bg-lg-surface flex items-center justify-center gap-2 disabled:opacity-60">
                          {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                          {loadingMore ? 'Cargando…' : 'Ver más negocios'}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {events.map(event => <EventSearchCard key={event.id} event={event} />)}
                      </div>
                      {hasMoreEvents && (
                        <button onClick={loadMoreEvents} disabled={loadingMore}
                          className="w-full mt-4 py-3 rounded-xl border border-lg-surface-2 text-lg-dim text-sm font-semibold hover:bg-lg-surface-2 hover:text-lg-accent transition-colors bg-lg-surface flex items-center justify-center gap-2 disabled:opacity-60">
                          {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                          {loadingMore ? 'Cargando…' : 'Ver más eventos'}
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
