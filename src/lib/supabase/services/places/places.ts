import { supabase } from '@lib/supabase';
import { Place, CreatePlaceData } from '@domain/entities';

export const placesService = {
  async getPlaces(): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
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
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((place) => this.transformPlaceData(place));
  },

  async getPlaceById(id: string): Promise<Place | null> {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
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
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    await supabase.rpc('increment_place_views', { place_id: id }).catch(() => {});

    return this.transformPlaceData(data);
  },

  async getPlacesByCategory(categoryId: string): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
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
      `
      )
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((place) => this.transformPlaceData(place));
  },

  async uploadImageSupabase(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `places/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async createPlace(placeData: CreatePlaceData) {
    const { data: place, error: placeError } = await supabase
      .from('places')
      .insert({
        name: placeData.name,
        description: placeData.description,
        address: placeData.address,
        category_id: placeData.categoryId,
        image: placeData.image,
        author_id: placeData.authorId,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        coords: placeData.coords,
        amenities: placeData.amenities,
        gallery: placeData.gallery,
      })
      .select()
      .single();

    if (placeError) throw placeError;

    if (placeData.socialGroupIds.length > 0) {
      const socialGroupInserts = placeData.socialGroupIds.map(
        (socialGroupId) => ({
          place_id: place.id,
          social_group_id: socialGroupId,
        })
      );

      const { error: socialGroupError } = await supabase
        .from('place_social_groups')
        .insert(socialGroupInserts);

      if (socialGroupError) throw socialGroupError;
    }

    return place;
  },

  async updatePlace(id: string, updates: Partial<CreatePlaceData>) {
    const fieldMap: Record<string, string> = {
      name: 'name', description: 'description', address: 'address',
      categoryId: 'category_id', image: 'image', gallery: 'gallery',
      latitude: 'latitude', longitude: 'longitude', coords: 'coords',
      amenities: 'amenities', authorId: 'author_id',
    };
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, dbKey] of Object.entries(fieldMap)) {
      if ((updates as any)[key] !== undefined) {
        dbUpdates[dbKey] = (updates as any)[key];
      }
    }
    const { data, error } = await supabase
      .from('places')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePlace(id: string) {
    const { error } = await supabase.from('places').delete().eq('id', id);
    if (error) throw error;
  },

  async getTopPlaces(limit: number = 6): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
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
      `
      )
      .order('saved_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((place) => this.transformPlaceData(place));
  },

  async getRecentPlaces(limit: number = 15): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
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
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((place) => this.transformPlaceData(place));
  },

  async searchPlaces(query: string): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
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
      `
      )
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`
      )
      .order('saved_count', { ascending: false });

    if (error) throw error;
    return (data || []).map((place) => this.transformPlaceData(place));
  },

  async getSavedPlacesByUserId(userID: string): Promise<Place[]> {
    const { data, error } = await supabase
      .from('saved_places')
      .select(`places(*, category:categories(*),
        author:users(name, avatar),
        place_social_groups(
          social_group:social_groups(*)
        ),
        reviews(
          *,
          user:users(name, avatar)
        ))`)
      .eq('user_id', userID)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || [])
      .map((item) => item.places)
      .filter((place) => place !== null)
      .map((place) => this.transformPlaceData(place));
  },

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
      reviews:
        place.reviews?.map((review: any) => ({
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
      authorName: place.author?.name,
      authorAvatar: place.author?.avatar,
      savedCount: place.saved_count,
      latitude: place.latitude,
      longitude: place.longitude,
      coords: place.coords,
      amenities: place.amenities,
      gallery: place.gallery,
      viewsCount: place.views_count,
    };
  },
};
