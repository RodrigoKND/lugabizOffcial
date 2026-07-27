import { useEffect, useRef, useState } from 'react';
import { friendshipsService } from '@lib/supabase';
import { UserSearchResult } from '@domain/entities';

// Búsqueda de personas por apodo exacto/prefijo (mínimo 3 letras, rate-limited en DB).
export function useUserSearch(query: string) {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 3) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const found = await friendshipsService.searchUsers(value);
        if (requestIdRef.current === requestId) setResults(found);
      } catch {
        if (requestIdRef.current === requestId) setResults([]);
      } finally {
        if (requestIdRef.current === requestId) setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, isSearching };
}
