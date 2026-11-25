import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { groupPicksService } from '@lib/supabase/services/social/groupPicks';
import type { UserSearchResult } from '@domain/entities';
import { canCreateGroupPick, MAX_INVITEES, MAX_OPTIONS } from '@domain/rules/groupPickLimits';
import { useAuth } from '@presentation/context';

// Una opción candidata mientras se arma la votación (el nombre y la foto son solo para mostrarla).
export interface PickOptionDraft {
  key: string;
  placeId?: string;
  eventId?: string;
  name: string;
  image?: string;
}

export function useCreateGroupPick(initial?: PickOptionDraft, onCreated?: (pickId: string) => void) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [invitees, setInvitees] = useState<UserSearchResult[]>([]);
  const [options, setOptions] = useState<PickOptionDraft[]>(initial ? [initial] : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInvitee = useCallback((friend: UserSearchResult) => {
    setInvitees(prev => {
      if (prev.some(i => i.id === friend.id)) return prev.filter(i => i.id !== friend.id);
      return prev.length >= MAX_INVITEES ? prev : [...prev, friend];
    });
  }, []);

  const addOption = useCallback((option: PickOptionDraft) => {
    setOptions(prev => (prev.some(o => o.key === option.key) || prev.length >= MAX_OPTIONS ? prev : [...prev, option]));
  }, []);

  const removeOption = useCallback((key: string) => setOptions(prev => prev.filter(o => o.key !== key)), []);

  const reason = canCreateGroupPick({ inviteeCount: invitees.length, optionCount: options.length, planDate, planTime });

  const submit = useCallback(async () => {
    if (!user || reason) return;
    setIsSubmitting(true);
    try {
      const pickId = await groupPicksService.create(user.id, {
        title: title.trim() || undefined, planDate, planTime,
        inviteeIds: invitees.map(i => i.id),
        options: options.map(o => ({ placeId: o.placeId, eventId: o.eventId })),
      });
      toast.success('Votación creada');
      onCreated?.(pickId);
    } catch (err) {
      console.error('[useCreateGroupPick:submit]', err);
      toast.error(err instanceof Error && err.message ? err.message : 'No se pudo crear la votación');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, reason, title, planDate, planTime, invitees, options, onCreated]);

  return {
    title, setTitle, planDate, setPlanDate, planTime, setPlanTime,
    invitees, toggleInvitee, options, addOption, removeOption,
    reason, canSubmit: reason === null && !isSubmitting, isSubmitting, submit,
  };
}
