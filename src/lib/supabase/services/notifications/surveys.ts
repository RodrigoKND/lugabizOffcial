import { supabase } from '@lib/supabase';
import { PlaceSurvey } from '@domain/entities';

export const surveysService = {
  async submitSurvey(survey: Omit<PlaceSurvey, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await supabase
      .from('place_surveys')
      .insert({
        user_id: survey.userId,
        place_id: survey.placeId,
        is_nearby: survey.isNearby,
        rating: survey.rating,
        would_recommend: survey.wouldRecommend,
        comment: survey.comment,
      });

    if (error) throw error;
  },

  async getSurveysByUser(userId: string): Promise<PlaceSurvey[]> {
    const { data, error } = await supabase
      .from('place_surveys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      placeId: s.place_id,
      isNearby: s.is_nearby,
      rating: s.rating,
      wouldRecommend: s.would_recommend,
      comment: s.comment,
      createdAt: new Date(s.created_at),
    }));
  },

  async getSurveysByPlace(placeId: string): Promise<PlaceSurvey[]> {
    const { data, error } = await supabase
      .from('place_surveys')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      placeId: s.place_id,
      isNearby: s.is_nearby,
      rating: s.rating,
      wouldRecommend: s.would_recommend,
      comment: s.comment,
      createdAt: new Date(s.created_at),
    }));
  },

  async getSurveyStats(placeId: string): Promise<{
    total: number;
    nearby: number;
    avgRating: number;
    recommendations: number;
  }> {
    const { data, error } = await supabase
      .from('place_surveys')
      .select('is_nearby, rating, would_recommend')
      .eq('place_id', placeId);

    if (error) throw error;

    const surveys = data || [];
    const rated = surveys.filter(s => s.rating != null);

    return {
      total: surveys.length,
      nearby: surveys.filter(s => s.is_nearby).length,
      avgRating: rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length
        : 0,
      recommendations: surveys.filter(s => s.would_recommend).length,
    };
  },
};
