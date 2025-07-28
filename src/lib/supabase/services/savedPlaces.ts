import { supabase } from '../client';

export const savedPlacesService = {
  // Get saved places for user
  async getSavedPlaces(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('saved_places')
      .select('place_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(item => item.place_id);
  },

  // Save place
  async savePlace(userId: string, placeId: string) {
    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_places')
      .select('id')
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .single();

    if (existing) {
      throw new Error('Place already saved');
    }

    const { error } = await supabase
      .from('saved_places')
      .insert({
        user_id: userId,
        place_id: placeId,
      });

    if (error) throw error;

    // Increment saved count
    await this.updateSavedCount(placeId);
  },

  // Unsave place
  async unsavePlace(userId: string, placeId: string) {
    const { error } = await supabase
      .from('saved_places')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) throw error;

    // Decrement saved count
    await this.updateSavedCount(placeId);
  },

  // Toggle save status
  async toggleSavePlace(userId: string, placeId: string): Promise<boolean> {
    const isSaved = await this.isPlaceSaved(userId, placeId);
    
    if (isSaved) {
      await this.unsavePlace(userId, placeId);
      return false;
    } else {
      await this.savePlace(userId, placeId);
      return true;
    }
  },

  // Update saved count for a place
  async updateSavedCount(placeId: string) {
    const { count, error: countError } = await supabase
      .from('saved_places')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId);

    if (countError) throw countError;

    const { error: updateError } = await supabase
      .from('places')
      .update({ saved_count: count || 0 })
      .eq('id', placeId);

    if (updateError) throw updateError;
  },

  // Check if place is saved by user
  async isPlaceSaved(userId: string, placeId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_places')
      .select('id')
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Get users who saved a place
  async getUsersWhoSavedPlace(placeId: string) {
    const { data, error } = await supabase
      .from('saved_places')
      .select(`
        user:users(id, name, avatar)
      `)
      .eq('place_id', placeId);

    if (error) throw error;
    return (data || []).map(item => item.user);
  },

  // Get saved places with full place data
  async getSavedPlacesWithData(userId: string) {
    const { data, error } = await supabase
      .from('saved_places')
      .select(`
        place:places(
          *,
          category:categories(*),
          place_social_groups(
            social_group:social_groups(*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => item.place);
  },
};