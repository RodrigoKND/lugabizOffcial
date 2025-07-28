import { supabase } from '../client';
import { Review } from '../types';

export const reviewsService = {
  // Add review
  async addReview(placeId: string, userId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        place_id: placeId,
        user_id: userId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;

    // Update place rating and review count
    await this.updatePlaceRating(placeId);

    return data;
  },

  // Update review
  async updateReview(id: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Get place ID and update rating
    const { data: review } = await supabase
      .from('reviews')
      .select('place_id')
      .eq('id', id)
      .single();

    if (review) {
      await this.updatePlaceRating(review.place_id);
    }

    return data;
  },

  // Delete review
  async deleteReview(id: string) {
    // Get place ID before deleting
    const { data: review } = await supabase
      .from('reviews')
      .select('place_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update place rating after deletion
    if (review) {
      await this.updatePlaceRating(review.place_id);
    }
  },

  // Update place rating and review count
  async updatePlaceRating(placeId: string) {
    // Get all reviews for the place
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('place_id', placeId);

    if (reviewsError) throw reviewsError;

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      // Update place with new rating and review count
      const { error: updateError } = await supabase
        .from('places')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviews.length,
        })
        .eq('id', placeId);

      if (updateError) throw updateError;
    } else {
      // No reviews, reset to 0
      const { error: updateError } = await supabase
        .from('places')
        .update({
          rating: 0,
          review_count: 0,
        })
        .eq('id', placeId);

      if (updateError) throw updateError;
    }
  },

  // Get reviews for a place
  async getReviewsForPlace(placeId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(name, avatar)
      `)
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(review => ({
      id: review.id,
      userId: review.user_id,
      userName: review.user.name,
      userAvatar: review.user.avatar,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(review.created_at),
    }));
  },

  // Get reviews by user
  async getReviewsByUser(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(name, avatar),
        place:places(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(review => ({
      id: review.id,
      userId: review.user_id,
      userName: review.user.name,
      userAvatar: review.user.avatar,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(review.created_at),
    }));
  },
};