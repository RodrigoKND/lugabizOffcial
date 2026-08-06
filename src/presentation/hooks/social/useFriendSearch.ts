import { useCallback, useEffect, useRef, useState } from 'react';
import { friendshipsService } from '@lib/supabase';
import { FriendOption } from '@domain/entities';

// Lista/búsqueda de amigos resuelta en el servidor (filtro+límite en SQL) para
// que siga siendo rápido sin importar cuántos amigos tenga el usuario.
export function useFriendSearch(query: string, limit = 20, enabled = true) {
  const [options, setOptions] = useState<FriendOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    setIsLoading(true);
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const found = await friendshipsService.searchFriends(query, limit);
        if (requestIdRef.current === requestId) setOptions(found);
      } catch {
        if (requestIdRef.current === requestId) setOptions([]);
      } finally {
        if (requestIdRef.current === requestId) setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, limit, enabled, refreshTick]);

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  return { options, isLoading, refresh };
}
