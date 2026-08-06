import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { eventsService, plansService } from '@lib/supabase';
import { PlanVisibility, UserSearchResult } from '@domain/entities';
import { useAuth } from '@presentation/context';

interface PlanTarget {
  placeId?: string;
  eventId?: string;
}

// Formatea un Date como YYYY-MM-DD en hora local — toISOString() lo pasa a UTC
// y corre la fecha un día atrás en husos UTC-negativos (ej. Bolivia).
function toLocalDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Estado del formulario del modal "Crear plan": fecha/hora, visibilidad, nota
// y amigos invitados. `target` fija a qué lugar/evento pertenece el plan.
// `isOpen` gatilla la precarga de fecha/hora cada vez que el modal se abre
// (y no solo la primera vez), para que reabrir tras crear un plan también
// las traiga precargadas.
export function useCreatePlan(target: PlanTarget, isOpen: boolean, onCreated?: () => void) {
  const { user } = useAuth();
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [visibility, setVisibility] = useState<PlanVisibility>('private');
  const [note, setNote] = useState('');
  const [invitees, setInvitees] = useState<UserSearchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si el plan es sobre un evento, precargamos su fecha/hora de inicio (el
  // usuario puede editarlas igual antes de crear el plan). Solo pisa los
  // campos si siguen vacíos, para no sobreescribir una edición ya hecha.
  useEffect(() => {
    if (!isOpen || !target.eventId) return;
    let cancelled = false;
    eventsService.getEventById(target.eventId).then((event) => {
      if (cancelled || !event) return;
      setPlanDate((prev) => prev || toLocalDateInput(event.dateStart));
      setPlanTime((prev) => prev || event.timeStart);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen, target.eventId]);

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
