import { supabase } from '@lib/supabase';

export type ContentType = 'places' | 'events' | 'reviews';

export const PAGE_SIZE = 20;

export interface ContentItem {
  id: string;
  name?: string;
  comment?: string;
  description?: string;
  image?: string;
  user_name?: string;
  user_avatar?: string;
  rating?: number;
  hidden?: boolean;
  date_start?: string;
  created_at: string;
}

export interface ContentPage {
  items: ContentItem[];
  total: number;
}

const SELECT: Record<ContentType, string> = {
  places: 'id, name, description, image, hidden, created_at, author:users(name, avatar)',
  events: 'id, name, description, image, date_start, created_at, author:users(name, avatar)',
  reviews: 'id, comment, rating, created_at, author:users(name, avatar)',
};

const SEARCH_COLUMN: Record<ContentType, string> = { places: 'name', events: 'name', reviews: 'comment' };

const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');

function toItem(r: Record<string, any>): ContentItem {
  const author = Array.isArray(r.author) ? r.author[0] : r.author;
  return {
    id: r.id, name: r.name, comment: r.comment, description: r.description, image: r.image ?? undefined,
    rating: r.rating ?? undefined, hidden: r.hidden ?? undefined, date_start: r.date_start ?? undefined,
    created_at: r.created_at, user_name: author?.name || 'Usuario', user_avatar: author?.avatar ?? undefined,
  };
}

// Listado paginado en servidor para moderación: nunca trae más de PAGE_SIZE filas, con búsqueda y total exacto.
export const adminContentService = {
  async list(type: ContentType, { page, search = '' }: { page: number; search?: string }): Promise<ContentPage> {
    const from = (page - 1) * PAGE_SIZE;
    let query = supabase
      .from(type)
      .select(SELECT[type], { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (search.trim()) query = query.ilike(SEARCH_COLUMN[type], `%${escapeLike(search.trim())}%`);

    const { data, count, error } = await query;
    if (error) throw error;
    return { items: ((data ?? []) as Record<string, any>[]).map(toItem), total: count ?? 0 };
  },
};
