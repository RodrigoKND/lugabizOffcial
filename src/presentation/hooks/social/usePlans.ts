import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { plansService } from '@lib/supabase';
import { Plan } from '@domain/entities';
import { useAuth } from '@presentation/context';

const PAGE_SIZE = 12;

// Planes propios + invitaciones recibidas del usuario actual, con carga
// progresiva (ver useCreatePlan para crear uno, PlansTab para el scroll).
export function usePlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const page = await plansService.listMyPlans(user.id, PAGE_SIZE, 0);
      setPlans(page);
      setHasMore(page.length === PAGE_SIZE);
      offsetRef.current = page.length;
    } catch (err) {
      console.error('[usePlans:reload]', err);
      toast.error('No se pudieron cargar tus planes');
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  const loadMore = useCallback(async () => {
    if (!user || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const page = await plansService.listMyPlans(user.id, PAGE_SIZE, offsetRef.current);
      setPlans((prev) => [...prev, ...page]);
      setHasMore(page.length === PAGE_SIZE);
      offsetRef.current += page.length;
    } catch (err) { console.error('[usePlans:loadMore]', err); }
    setIsLoadingMore(false);
  }, [user, isLoadingMore, hasMore]);

  const respondToInvite = useCallback(async (participantId: string, accept: boolean) => {
    try {
      await plansService.respondToInvite(participantId, accept);
      toast.success(accept ? 'Te uniste al plan' : 'Invitación rechazada');
      reload();
    } catch { toast.error('No se pudo procesar la invitación'); }
  }, [reload]);

  const cancelPlan = useCallback(async (planId: string, reason: string) => {
    try {
      await plansService.cancelPlan(planId, reason);
      toast.success('Plan cancelado. Avisamos a quienes ya habían confirmado.');
      reload();
    } catch { toast.error('No se pudo cancelar el plan'); }
  }, [reload]);

  return { plans, isLoading, isLoadingMore, hasMore, loadMore, respondToInvite, cancelPlan, reload };
}
