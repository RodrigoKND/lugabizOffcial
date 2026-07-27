import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { plansService } from '@lib/supabase';
import { Plan } from '@domain/entities';
import { useAuth } from '@presentation/context';

// Planes propios + invitaciones recibidas del usuario actual (ver useCreatePlan para crear uno).
export function usePlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      setPlans(await plansService.listMyPlans(user.id));
    } catch (err) { console.error('[usePlans:reload]', err); }
    setIsLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  const respondToInvite = useCallback(async (participantId: string, accept: boolean) => {
    try {
      await plansService.respondToInvite(participantId, accept);
      toast.success(accept ? 'Te uniste al plan' : 'Invitación rechazada');
      reload();
    } catch { toast.error('No se pudo procesar la invitación'); }
  }, [reload]);

  return { plans, isLoading, respondToInvite, reload };
}
