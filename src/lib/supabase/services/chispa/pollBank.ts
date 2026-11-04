import { supabase } from '@lib/supabase';
import type { PollInput } from './pollBankRules';

export interface PollBankItem extends PollInput {
  id: number;
  lastUsedAt?: string;
  scheduledFor?: string;
}

const MAX_ROWS = 100;

function toItem(r: Record<string, any>): PollBankItem {
  return {
    id: r.id, question: r.question, optionA: r.option_a, optionB: r.option_b,
    lastUsedAt: r.last_used_at ?? undefined, scheduledFor: r.scheduled_for ?? undefined,
  };
}

const toRow = (p: PollInput) => ({ question: p.question.trim(), option_a: p.optionA.trim(), option_b: p.optionB.trim() });

// Banco de preguntas del día (solo admin por RLS). Se trae con tope: el filtro se resuelve en la base.
export const pollBankService = {
  async list(search = ''): Promise<PollBankItem[]> {
    let q = supabase.from('poll_bank').select('*').order('scheduled_for', { ascending: true, nullsFirst: false }).order('id', { ascending: false }).limit(MAX_ROWS);
    if (search.trim()) q = q.ilike('question', `%${search.trim().replace(/[\\%_]/g, '\\$&')}%`);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(toItem);
  },

  async create(input: PollInput): Promise<void> {
    const { error } = await supabase.from('poll_bank').insert(toRow(input));
    if (error) throw error;
  },

  async update(id: number, input: PollInput): Promise<void> {
    const { error } = await supabase.from('poll_bank').update(toRow(input)).eq('id', id);
    if (error) throw error;
  },

  async remove(id: number): Promise<void> {
    const { error } = await supabase.from('poll_bank').delete().eq('id', id);
    if (error) throw error;
  },

  async schedule(id: number, date: string | null): Promise<void> {
    const { error } = await supabase.from('poll_bank').update({ scheduled_for: date }).eq('id', id);
    if (error) throw error;
  },
};
