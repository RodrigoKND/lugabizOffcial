import { supabase } from '@lib/supabase';

export async function updatePlaceRating(placeId: string) {
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('place_id', placeId);

  if (reviewsError) throw reviewsError;

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    const { error: updateError } = await supabase
      .from('places')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', placeId);

    if (updateError) throw updateError;
  } else {
    const { error: updateError } = await supabase
      .from('places')
      .update({
        rating: 0,
        review_count: 0,
      })
      .eq('id', placeId);

    if (updateError) throw updateError;
  }
}
