import { motion, AnimatePresence } from 'framer-motion';
import { useSearchModal } from '@presentation/hooks/search/useSearchModal';
import { SearchInput } from '@presentation/components/features/search/SearchInput';
import { FilterChips } from '@presentation/components/features/search/FilterChips';
import { SearchResults } from '@presentation/components/features/search/SearchResults';
import type { SearchModalProps } from './SearchModal.types';

export { type SearchModalProps };

export function SearchModal({ open, onClose }: SearchModalProps) {
  const {
    query, setQuery,
    selectedCategory, setSelectedCategory,
    selectedSocialGroup, setSelectedSocialGroup,
    categories, socialGroups,
    results,
    inputRef,
    handleSelect,
    handleCategoryClick,
    handleSocialGroupClick,
  } = useSearchModal(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, pointerEvents: 'auto' }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-200 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Búsqueda de lugares"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-stone-200/50"
          >
            <SearchInput
              value={query}
              onChange={(v) => { setQuery(v); setSelectedCategory(null); setSelectedSocialGroup(null); }}
              onClear={() => setQuery('')}
              inputRef={inputRef}
            />

            <FilterChips
              categories={categories}
              socialGroups={socialGroups}
              selectedCategory={selectedCategory}
              selectedSocialGroup={selectedSocialGroup}
              onCategoryClick={handleCategoryClick}
              onSocialGroupClick={handleSocialGroupClick}
            />

            <SearchResults
              query={query}
              results={results}
              selectedCategory={selectedCategory}
              selectedSocialGroup={selectedSocialGroup}
              onSelect={handleSelect}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
