import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaces } from '@presentation/context';
import type { Place } from '@domain/entities';

export function useSearchModal(open: boolean, onClose: () => void) {
  const navigate = useNavigate();
  const { places, categories, socialGroups, searchPlaces } = usePlaces();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'category' | 'social' | 'place'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSocialGroup, setSelectedSocialGroup] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingQueryRef = useRef('');
  const pendingGroupRef = useRef('');

  // Permite pre-cargar un query/filtro desde fuera (p. ej. el buscador del hero):
  // document.dispatchEvent(new CustomEvent('lugabiz:prefill-search', { detail: { query: 'café', socialGroupId: '...' } }))
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const { query, socialGroupId } = (e as CustomEvent<{ query?: string; socialGroupId?: string }>).detail ?? {};
      pendingQueryRef.current = query ?? '';
      pendingGroupRef.current = socialGroupId ?? '';
      if (query || socialGroupId) {
        setSelectedCategory(null);
        setSelectedSocialGroup(socialGroupId ?? null);
        setQuery(query ?? '');
      }
    };
    document.addEventListener('lugabiz:prefill-search', handlePrefill);
    return () => document.removeEventListener('lugabiz:prefill-search', handlePrefill);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery(pendingQueryRef.current);
      setActiveFilter('all');
      setSelectedCategory(null);
      setSelectedSocialGroup(pendingGroupRef.current || null);
      pendingQueryRef.current = '';
      pendingGroupRef.current = '';
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const results: Place[] = (() => {
    if (selectedCategory) return places.filter(p => p.category.id === selectedCategory);
    if (selectedSocialGroup) return places.filter(p => p.socialGroups.some(g => g.id === selectedSocialGroup));
    if (query.trim()) return searchPlaces(query);
    return [];
  })();

  const handleSelect = (placeId: string) => {
    onClose();
    navigate(`/place/${placeId}`);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(prev => prev === catId ? null : catId);
    setSelectedSocialGroup(null);
    setQuery('');
    setActiveFilter('category');
  };

  const handleSocialGroupClick = (sgId: string) => {
    setSelectedSocialGroup(prev => prev === sgId ? null : sgId);
    setSelectedCategory(null);
    setQuery('');
    setActiveFilter('social');
  };

  return {
    query, setQuery,
    activeFilter, setActiveFilter,
    selectedCategory, setSelectedCategory,
    selectedSocialGroup, setSelectedSocialGroup,
    categories, socialGroups,
    results,
    inputRef,
    handleSelect,
    handleCategoryClick,
    handleSocialGroupClick,
  };
}
