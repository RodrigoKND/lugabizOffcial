import { supabase } from '@lib/supabase/client';
import type { CreateGroupPickData, GroupPickDetail, GroupPickSummary, GroupPickTarget } from '@domain/entities/GroupPick';
import type { VerdictKey } from '@domain/entities/Verdict';
import { mapGroupPickDetail, mapGroupPickSummary, type RawGroupPickDetail, type RawGroupPickSummary } from './groupPickMapper';

export const groupPicksService = {
  // Miembros y opciones se insertan de uno en uno: los triggers (máximos, amistad) cuentan filas ya guardadas.
  async create(userId: string, data: CreateGroupPickData): Promise<string> {
    const { data: row, error } = await supabase
      .from('group_picks')
      .insert({ created_by: userId, title: data.title || null, plan_date: data.planDate, plan_time: data.planTime })
      .select('id')
      .single();
    if (error) throw error;
    const pickId = row.id as string;

    try {
      for (const inviteeId of data.inviteeIds) {
        const { error: memberError } = await supabase.from('group_pick_members').insert({ pick_id: pickId, user_id: inviteeId });
        if (memberError) throw memberError;
      }
      for (const option of data.options) {
        await groupPicksService.addOption(pickId, userId, option);
      }
    } catch (err) {
      // No dejar una votación a medias: se cancela (best-effort) y se propaga el error original.
      await supabase.rpc('cancel_group_pick', { p_pick_id: pickId });
      throw err;
    }
    return pickId;
  },

  async getDetail(pickId: string): Promise<GroupPickDetail | null> {
    const { data, error } = await supabase.rpc('get_group_pick', { p_pick_id: pickId });
    if (error) throw error;
    return mapGroupPickDetail(data as RawGroupPickDetail | null);
  },

  async listMine(limit = 20): Promise<GroupPickSummary[]> {
    const { data, error } = await supabase.rpc('list_my_group_picks', { p_limit: limit });
    if (error) throw error;
    return ((data ?? []) as RawGroupPickSummary[]).map(mapGroupPickSummary);
  },

  async addOption(pickId: string, userId: string, target: GroupPickTarget): Promise<void> {
    const { error } = await supabase.from('group_pick_options').insert({
      pick_id: pickId, added_by: userId, place_id: target.placeId ?? null, event_id: target.eventId ?? null,
    });
    if (error) throw error;
  },

  // verdict null = quitar mi voto.
  async vote(optionId: string, userId: string, verdict: VerdictKey | null): Promise<void> {
    if (verdict === null) {
      const { error } = await supabase.from('group_pick_votes').delete().eq('option_id', optionId).eq('user_id', userId);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('group_pick_votes')
      .upsert({ option_id: optionId, user_id: userId, verdict }, { onConflict: 'option_id,user_id' });
    if (error) throw error;
  },

  async decide(pickId: string, optionId: string): Promise<void> {
    const { error } = await supabase.rpc('decide_group_pick', { p_pick_id: pickId, p_option_id: optionId });
    if (error) throw error;
  },

  async cancel(pickId: string): Promise<void> {
    const { error } = await supabase.rpc('cancel_group_pick', { p_pick_id: pickId });
    if (error) throw error;
  },
};
