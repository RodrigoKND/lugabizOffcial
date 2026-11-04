import { supabase } from '@lib/supabase';

export interface DailyPoll {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  closesAt: string;
}

export type PollChoice = 'a' | 'b';

// Todos devuelven null/0 ante error (p. ej. migración aún no aplicada) para que la Home no se rompa.
export const dailyPollsService = {
  async getActivePoll(): Promise<DailyPoll | null> {
    // La función SQL crea la votación del día automáticamente desde poll_bank si aún no existe.
    const { data: rows, error } = await supabase.rpc('get_or_create_daily_poll');
    const data = Array.isArray(rows) ? rows[0] : rows;
    if (error || !data) return null;
    return { id: data.id, question: data.question, optionA: data.option_a, optionB: data.option_b, closesAt: data.closes_at };
  },

  async getVotes(pollId: string): Promise<{ votesA: number; votesB: number }> {
    const { data } = await supabase
      .from('daily_poll_results')
      .select('votes_a, votes_b')
      .eq('poll_id', pollId)
      .maybeSingle();
    return { votesA: Number(data?.votes_a ?? 0), votesB: Number(data?.votes_b ?? 0) };
  },

  async getMyVote(pollId: string, userId: string): Promise<PollChoice | null> {
    const { data } = await supabase
      .from('daily_poll_votes')
      .select('choice')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    return (data?.choice as PollChoice | undefined) ?? null;
  },

  async vote(pollId: string, userId: string, choice: PollChoice): Promise<void> {
    const { error } = await supabase.from('daily_poll_votes').insert({ poll_id: pollId, user_id: userId, choice });
    if (error) throw error;
  },
};
