import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { plansService } from '@lib/supabase';
import { PlanVisibility, UserSearchResult } from '@domain/entities';
import { useAuth } from '@presentation/context';

interface PlanTarget {
  placeId?: string;
  eventId?: string;
}

// Estado del formulario del modal "Crear plan": fecha/hora, visibilidad, nota
// y amigos invitados. `target` fija a qué lugar/evento pertenece el plan.
export function useCreatePlan(target: PlanTarget, onCreated?: () => void) {
  const { user } = useAuth();
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [visibility, setVisibility] = useState<PlanVisibility>('private');
  const [note, setNote] = useState('');
  const [invitees, setInvitees] = useState<UserSearchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInvitee = useCallback((candidate: UserSearchResult) => {
    setInvitees((prev) => (
      prev.some((i) => i.id === candidate.id)
        ? prev.filter((i) => i.id !== candidate.id)
        : [...prev, candidate]
    ));
  }, []);

  const reset = useCallback(() => {
    setPlanDate('');
    setPlanTime('');
    setVisibility('private');
    setNote('');
    setInvitees([]);
  }, []);

  const submit = useCallback(async () => {
    if (!user || !planDate || !planTime) return;
    setIsSubmitting(true);
    try {
      await plansService.createPlan(user.id, {
        placeId: target.placeId,
        eventId: target.eventId,
        planDate,
        planTime,
        visibility,
        note: note.trim() || undefined,
        inviteeIds: invitees.map((i) => i.id),
      });
      toast.success('Plan creado');
      reset();
      onCreated?.();
    } catch (err) {
      console.error('[useCreatePlan:submit]', err);
      toast.error('No se pudo crear el plan');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, target, planDate, planTime, visibility, note, invitees, reset, onCreated]);

  return {
    planDate, setPlanDate,
    planTime, setPlanTime,
    visibility, setVisibility,
    note, setNote,
    invitees, toggleInvitee,
    isSubmitting, submit,
  };
}
