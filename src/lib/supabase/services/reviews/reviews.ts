import { supabase } from '@lib/supabase';
import { Review } from '@domain/entities';

function mapReview(review: any): Review {
  return {
    id: review.id,
    userId: review.user_id,
    userName: review.user?.name ?? 'Usuario',
    userAvatar: review.user?.avatar,
    rating: review.rating,
    comment: review.comment,
    parentId: review.parent_id,
    createdAt: new Date(review.created_at),
  };
}

export async function addReview(placeId: string, userId: string, rating: number | null, comment: string, parentId?: string) {
  const { data: user } = await supabase.from('users').select('banned').eq('id', userId).single();
  if (user?.banned) throw new Error('Usuario suspendido');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      place_id: placeId,
      user_id: userId,
      rating: rating ?? null,
      comment,
      parent_id: parentId || null,
    })
    .select('*, user:users(name, avatar)')
    .single();

  if (error) throw error;
  return mapReview(data);
}

export async function updateReview(id: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, comment, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function getReviewsForPlace(placeId: string, limit = 10, offset = 0): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar)')
    .eq('place_id', placeId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  const reviews = (data || []).map(mapReview);

  // Batch-load reply counts (single query, no N+1)
  if (reviews.length > 0) {
    const ids = reviews.map(r => r.id);
    const { data: replyCounts } = await supabase
      .from('reviews')
      .select('parent_id')
      .in('parent_id', ids);

    const countMap: Record<string, number> = {};
    (replyCounts || []).forEach((r: any) => {
      countMap[r.parent_id] = (countMap[r.parent_id] || 0) + 1;
    });
    return reviews.map(r => ({ ...r, replyCount: countMap[r.id] || 0 }));
  }

  return reviews;
}

export async function getReplies(reviewId: string, limit = 20, offset = 0): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar)')
    .eq('parent_id', reviewId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []).map(mapReview);
}

export async function getCountForPlace(placeId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('place_id', placeId)
    .is('parent_id', null);

  if (error) throw error;
  return count || 0;
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar), place:places(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapReview);
}
