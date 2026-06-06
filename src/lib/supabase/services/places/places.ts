import { supabase } from '@lib/supabase';
import { Place, CreatePlaceData } from '@domain/entities';
import { transformPlaceData } from './placesTransform';

export async function getPlaces(): Promise<Place[]> {
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
  return (data || []).map((place) => transformPlaceData(place));
}

export async function getPlaceById(id: string): Promise<Place | null> {
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

  try { await supabase.rpc('increment_place_views', { place_id: id }) } catch {}

  return transformPlaceData(data);
}

export async function createPlace(placeData: CreatePlaceData) {
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
}

export async function updatePlace(id: string, updates: Partial<CreatePlaceData>) {
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
}

export async function deletePlace(id: string) {
  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadImageSupabase(file: File): Promise<string> {
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
}
