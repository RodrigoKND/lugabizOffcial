import { useState, useEffect, useCallback } from 'react';
import { groupPicksService } from '@lib/supabase/services/social/groupPicks';
import type { GroupPickSummary } from '@domain/entities';
import { useAuth } from '@presentation/context';

// Mis votaciones (las que creé o me invitaron). Si la migración aún no está aplicada, la lista queda vacía sin romper nada.
export function useMyGroupPicks(enabled = true) {
  const { user } = useAuth();
  const [picks, setPicks] = useState<GroupPickSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user || !enabled) return;
    setIsLoading(true);
    try {
      setPicks(await groupPicksService.listMine());
    } catch (err) {
      console.error('[useMyGroupPicks:reload]', err);
      setPicks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, enabled]);

  useEffect(() => { reload(); }, [reload]);

  return { picks, isLoading, reload };
}
