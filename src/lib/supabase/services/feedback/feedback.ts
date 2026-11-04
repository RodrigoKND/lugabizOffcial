import { supabase } from '@lib/supabase';
import type {
  FeedbackCounts, FeedbackItem, FeedbackPage, FeedbackStatus, FeedbackType,
} from '@domain/entities/Feedback';

const PAGE_SIZE = 20;

export interface FeedbackQuery {
  status?: FeedbackStatus;
  type?: FeedbackType;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface FeedbackInput {
  userId: string;
  type: FeedbackType;
  message: string;
  rating?: number;
  page?: string;
}

const COLUMNS = 'id, user_id, type, message, rating, page, status, created_at, user:users!feedback_user_id_fkey(name, avatar)';

function toItem(r: Record<string, any>): FeedbackItem {
  const u = Array.isArray(r.user) ? r.user[0] : r.user;
  return {
    id: r.id, userId: r.user_id, userName: u?.name ?? undefined, userAvatar: u?.avatar ?? undefined,
    type: r.type, message: r.message, rating: r.rating ?? undefined, page: r.page ?? undefined,
    status: r.status, createdAt: r.created_at,
  };
}

// % y _ son comodines de ILIKE: se escapan para que busquen el texto literal.
const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');

export const feedbackService = {
  async submit(input: FeedbackInput): Promise<void> {
    const { error } = await supabase.from('feedback').insert({
      user_id: input.userId, type: input.type, message: input.message.trim(),
      rating: input.rating ?? null, page: input.page ?? null,
    });
    if (error) throw error;
  },

  // Paginación por cursor (created_at): se pide una fila de más para saber si queda otra página.
  async list(q: FeedbackQuery): Promise<FeedbackPage> {
    const limit = q.limit ?? PAGE_SIZE;
    let query = supabase.from('feedback').select(COLUMNS).order('created_at', { ascending: false }).limit(limit + 1);
    if (q.status) query = query.eq('status', q.status);
    if (q.type) query = query.eq('type', q.type);
    if (q.cursor) query = query.lt('created_at', q.cursor);
    if (q.search?.trim()) query = query.ilike('message', `%${escapeLike(q.search.trim())}%`);

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as Record<string, any>[];
    const items = rows.slice(0, limit).map(toItem);
    return { items, nextCursor: rows.length > limit ? items[items.length - 1].createdAt : null };
  },

  async setStatus(id: string, status: FeedbackStatus): Promise<void> {
    const { error } = await supabase.from('feedback').update({ status }).eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
  },

  async stats(): Promise<FeedbackCounts> {
    const counts: FeedbackCounts = { nuevo: 0, visto: 0, planeado: 0, hecho: 0, archivado: 0 };
    const { data, error } = await supabase.rpc('feedback_stats');
    if (error) throw error;
    for (const r of (data ?? []) as { status: FeedbackStatus; total: number | string }[]) counts[r.status] = Number(r.total);
    return counts;
  },
};
