import { useState, useEffect } from 'react';
import { ownerInsightsService } from '@lib/supabase/services/user/ownerInsights';
import type { OwnerInsight } from '@domain/entities/OwnerInsight';

// Resultados de mis lugares. Si falla (p. ej. la migración aún no está aplicada) la lista queda vacía y el perfil sigue igual.
export function useOwnerInsights(enabled: boolean, days = 30) {
  const [insights, setInsights] = useState<OwnerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    ownerInsightsService.get(days)
      .then(rows => { if (active) setInsights(rows); })
      .catch(err => console.error('[useOwnerInsights]', err))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [enabled, days]);

  return { insights, isLoading };
}
