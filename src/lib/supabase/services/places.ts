import { supabase } from '../client';
import { Place, CreatePlaceData } from '../types';

export const placesService = {
  // Get all places with related data
  async getPlaces(): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(place => this.transformPlaceData(place));
  },

  // Get place by ID
  async getPlaceById(id: string): Promise<Place | null> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.transformPlaceData(data);
  },

  // Get places by category
  async getPlacesByCategory(categoryId: string): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        )
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(place => this.transformPlaceData(place));
  },

  async uploadImageSupabase(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `places/${fileName}`
    const { error } = await supabase.storage.from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }
    // Obtiene la URL pública de la imagen
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
  // Create place
  async createPlace(placeData: CreatePlaceData) {
    // Insert place
    const { data: place, error: placeError } = await supabase
      .from('places')
      .insert({
        name: placeData.name,
        description: placeData.description,
        address: placeData.address,
        category_id: placeData.categoryId,
        image: placeData.image,
        author_id: placeData.authorId,
      })
      .select()
      .single();

    if (placeError) throw placeError;

    // Insert place social groups
    if (placeData.socialGroupIds.length > 0) {
      const socialGroupInserts = placeData.socialGroupIds.map(socialGroupId => ({
        place_id: place.id,
        social_group_id: socialGroupId,
      }));

      const { error: socialGroupError } = await supabase
        .from('place_social_groups')
        .insert(socialGroupInserts);

      if (socialGroupError) throw socialGroupError;
    }

    return place;
  },

  // Update place
  async updatePlace(id: string, updates: Partial<CreatePlaceData>) {
    const { data, error } = await supabase
      .from('places')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete place
  async deletePlace(id: string) {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get top places by saved count
  async getTopPlaces(limit: number = 6): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        )
      `)
      .order('saved_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(place => this.transformPlaceData(place));
  },

  // Get recent places
  async getRecentPlaces(limit: number = 15): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(place => this.transformPlaceData(place));
  },

  // Search places
  async searchPlaces(query: string): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
      .order('saved_count', { ascending: false });

    if (error) throw error;

    return (data || []).map(place => this.transformPlaceData(place));
  },

  // Transform database place data to application format
  transformPlaceData(place: any): Place {
    return {
      id: place.id,
      name: place.name,
      description: place.description,
      address: place.address,
      category: {
        id: place.category.id,
        name: place.category.name,
        icon: place.category.icon,
        color: place.category.color,
        description: place.category.description,
      },
      socialGroups: place.place_social_groups.map((psg: any) => ({
        id: psg.social_group.id,
        name: psg.social_group.name,
        icon: psg.social_group.icon,
        color: psg.social_group.color,
        description: psg.social_group.description,
      })),
      image: place.image,
      rating: place.rating,
      reviewCount: place.review_count,
      reviews: place.reviews?.map((review: any) => ({
        id: review.id,
        userId: review.user_id,
        userName: review.user.name,
        userAvatar: review.user.avatar,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.created_at),
      })) || [],
      featured: place.featured,
      createdAt: new Date(place.created_at),
      authorId: place.author_id,
      savedCount: place.saved_count,
    };
  },
};