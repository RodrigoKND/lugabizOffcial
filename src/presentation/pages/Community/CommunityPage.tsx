import { useState, useEffect } from 'react';
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
      <p className="text-xs font-semibold text-text-secondary mb-2">Categoría</p>
      {categories.length > 6 && (
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
          <input
            value={catQuery}
            onChange={e => setCatQuery(e.target.value)}
            placeholder="Buscar categoría…"
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-primary-300 bg-stone-50"
          />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
        <button
          onClick={() => onChange('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
            selected === 'all' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-text-secondary hover:bg-stone-50'
          }`}>
          <span>Todas las categorías</span>
          {selected === 'all' && <Check className="w-3.5 h-3.5 text-primary-500" />}
        </button>
        {visible.map(cat => (
          <button
            key={cat.id}
            onClick={() => onChange(selected === cat.id ? 'all' : cat.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
              selected === cat.id ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-text-secondary hover:bg-stone-50'
            }`}>
            <span className="truncate">{cat.name}</span>
            {selected === cat.id && <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />}
          </button>
        ))}
        {visible.length === 0 && (
          <p className="text-xs text-text-secondary text-center py-3">Sin resultados</p>
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

  async function fetchPlaces(page: number, append: boolean) {
    const filters: PlaceSearchFilters = {
      query: committedQuery,
      categoryId: selectedCategory,
      socialGroupId: selectedSocialGroup,
      minRating,
      sortBy: placeSort,
    };
    const result = await searchPlaces(filters, page);
    setTotalPlaces(result.total);
    setHasMorePlaces(result.hasMore);
    setPlaces(prev => append ? [...prev, ...result.data] : result.data);
  }

  async function fetchEvents(page: number, append: boolean) {
    const filters: EventSearchFilters = {
      query: committedQuery,
      categoryId: selectedCategory,
      sortBy: eventSort,
    };
    const result = await searchEvents(filters, page);
    setTotalEvents(result.total);
    setHasMoreEvents(result.hasMore);
    setEvents(prev => append ? [...prev, ...result.data] : result.data);
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
    <div className="min-h-screen bg-feed-bg pb-24 md:pb-8">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 pt-8 pb-7 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Comunidad</h1>
          <p className="text-primary-200 text-sm mb-5">Explora y descubre negocios y eventos de tu ciudad</p>
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitSearch()}
                placeholder="Buscar por nombre, dirección, categoría…"
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white text-sm text-text-primary placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-lg"
              />
              {inputValue && (
                <button onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stone-100 transition-colors">
                  <X className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
            </div>
            <button onClick={commitSearch}
              className="px-5 py-3 bg-white text-primary-600 font-semibold text-sm rounded-xl shadow-lg hover:bg-primary-50 transition-colors shrink-0">
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        {/* Tabs + mobile filter toggle */}
        <div className="flex items-center gap-3 mb-5">
          {([
            { key: 'places' as Tab, label: 'Negocios', icon: Store, count: totalPlaces },
            { key: 'events' as Tab, label: 'Eventos', icon: Calendar, count: totalEvents },
          ] as const).map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white text-text-secondary border border-primary-100/40 hover:text-primary-500'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === key ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}

          <button onClick={() => setShowFilters(v => !v)}
            className={`md:hidden ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'bg-white border-stone-200 text-text-secondary'
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* ── LEFT SIDEBAR ──────────────────────────── */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-primary-100/40 shadow-xs p-4 space-y-5">

                {/* Header */}
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
                  <Filter className="w-3.5 h-3.5 text-primary-500" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <button onClick={resetFilters}
                      className="ml-auto text-xs text-primary-500 font-semibold hover:text-primary-700 normal-case tracking-normal">
                      Limpiar todo
                    </button>
                  )}
                </div>

                {/* Ordenar */}
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">Ordenar por</p>
                  <div className="space-y-1">
                    {sortOptions.map(opt => (
                      <button key={opt.key} onClick={() => setSort(opt.key)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                          currentSort === opt.key ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-text-secondary hover:bg-stone-50'
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
                    <p className="text-xs font-semibold text-text-secondary mb-2">Grupo social</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSocialGroup('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          selectedSocialGroup === 'all'
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-text-secondary border-stone-200 hover:border-primary-300 hover:text-primary-500'
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
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white text-text-secondary border-stone-200 hover:border-primary-300 hover:text-primary-500'
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
                    <p className="text-xs font-semibold text-text-secondary mb-2">Calificación mínima</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setMinRating(minRating === star ? 0 : star)}
                          className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-semibold border transition-all ${
                            minRating === star
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'bg-stone-50 text-stone-400 border-transparent hover:border-amber-200'
                          }`}>
                          <Star className={`w-3 h-3 ${minRating >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span className="ml-0.5">{star}</span>
                        </button>
                      ))}
                    </div>
                    {minRating > 0 && (
                      <p className="text-[11px] text-text-secondary mt-1">{minRating}+ estrellas</p>
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
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold border border-primary-100">
                    {selectedCat?.icon} {selectedCat?.name}
                    <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedSocialGroup !== 'all' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold border border-primary-100">
                    {selectedSG?.icon} {selectedSG?.name}
                    <button onClick={() => setSelectedSocialGroup('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-100">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{minRating}+
                    <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentSort !== 'relevance' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 text-stone-600 text-xs font-semibold border border-stone-200">
                    {sortOptions.find(o => o.key === currentSort)?.label}
                    <button onClick={() => setSort('relevance')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
              </div>
            )}

            {/* Results count */}
            {!loading && !isEmpty && (
              <p className="text-xs text-text-secondary mb-4 px-1">
                {tab === 'places'
                  ? `${currentTotal} negocio${currentTotal !== 1 ? 's' : ''} encontrado${currentTotal !== 1 ? 's' : ''}`
                  : `${currentTotal} evento${currentTotal !== 1 ? 's' : ''} encontrado${currentTotal !== 1 ? 's' : ''}`}
                {committedQuery && <span> para "<strong>{committedQuery}</strong>"</span>}
              </p>
            )}

            <AnimatePresence mode="wait">
              {!loading && isEmpty ? (
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
                          className="w-full mt-4 py-3 rounded-xl border border-primary-100 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors bg-white flex items-center justify-center gap-2 disabled:opacity-60">
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
                          className="w-full mt-4 py-3 rounded-xl border border-primary-100 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors bg-white flex items-center justify-center gap-2 disabled:opacity-60">
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
