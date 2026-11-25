import { useCallback } from 'react';
import type { VerdictKey, VerdictTarget } from '@domain/entities';
import { useAuth } from '@presentation/context';
import { useReactionBurst } from '@presentation/hooks/reactions/useReactionBurst';
import { useVerdict } from './useVerdict';

// Todo lo que una tarjeta necesita para reaccionar: conteos, voto propio y frases flotantes desde donde se tocó.
export function useCardReaction(target: VerdictTarget, id: string | undefined) {
  const { user } = useAuth();
  const { counts, mine, vote } = useVerdict(target, id, user?.id);
  const { items, fire } = useReactionBurst();

  const react = useCallback((key: VerdictKey, origin: { x: number; y: number }) => {
    if (!id) return;
    if (mine !== key) fire(origin);
    vote(key);
  }, [id, mine, fire, vote]);

  return { counts, mine, react, burstItems: items };
}

export type CardReaction = ReturnType<typeof useCardReaction>;
