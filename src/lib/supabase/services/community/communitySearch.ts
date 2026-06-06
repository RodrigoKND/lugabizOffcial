import { supabase } from '@lib/supabase/client';
import { Place, Event } from '@domain/entities';
import { transformPlaceData } from '@lib/supabase/services/places/placesTransform';
import { transformEventData } from '@lib/supabase/services/events/eventsTransform';

export interface PlaceSearchFilters {
  query?: string;
  categoryId?: string;
  socialGroupId?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'reviews' | 'newest';
}

export interface EventSearchFilters {
  query?: string;
  categoryId?: string;
  sortBy?: 'relevance' | 'attendees' | 'newest';
}

export interface SearchPage<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 12;

export async function searchPlaces(
  filters: PlaceSearchFilters,
  page: number,
): Promise<SearchPage<Place>> {
  let query = supabase
    .from('places')
    .select(
      `*, category:categories(*), author:users(name, avatar),
       place_social_groups(social_group:social_groups(*)),
       reviews(id)`,
      { count: 'exact' },
    );

  if (filters.query?.trim()) {
    const q = `%${filters.query.trim()}%`;
    query = query.or(`name.ilike.${q},address.ilike.${q}`);
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.minRating && filters.minRating > 0) {
    query = query.gte('rating', filters.minRating);
  }

  if (filters.socialGroupId && filters.socialGroupId !== 'all') {
    const { data: placeIds } = await supabase
      .from('place_social_groups')
      .select('place_id')
      .eq('social_group_id', filters.socialGroupId);
    const ids = (placeIds || []).map((r: any) => r.place_id);
    if (ids.length === 0) return { data: [], total: 0, hasMore: false };
    query = query.in('id', ids);
  }

  switch (filters.sortBy) {
    case 'rating':   query = query.order('rating', { ascending: false }); break;
    case 'reviews':  query = query.order('review_count', { ascending: false }); break;
    case 'newest':   query = query.order('created_at', { ascending: false }); break;
    default:         query = query.order('saved_count', { ascending: false }); break;
  }

  const offset = (page - 1) * PAGE_SIZE;
  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;
  const places = (data || []).map(transformPlaceData);

  return {
    data: places,
    total,
    hasMore: offset + places.length < total,
  };
}

export async function searchEvents(
  filters: EventSearchFilters,
  page: number,
): Promise<SearchPage<Event>> {
  let query = supabase
    .from('events')
    .select(
      `*, category:categories(*), user:users(name, avatar), event_attendance(user_id)`,
      { count: 'exact' },
    );

  if (filters.query?.trim()) {
    const q = `%${filters.query.trim()}%`;
    query = query.or(`name.ilike.${q},address.ilike.${q}`);
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  switch (filters.sortBy) {
    case 'attendees': query = query.order('attendees_count', { ascending: false }); break;
    case 'newest':    query = query.order('created_at', { ascending: false }); break;
    default:          query = query.order('date_start', { ascending: false }); break;
  }

  const offset = (page - 1) * PAGE_SIZE;
  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;
  const events = (data || []).map(transformEventData);

  return {
    data: events,
    total,
    hasMore: offset + events.length < total,
  };
}
