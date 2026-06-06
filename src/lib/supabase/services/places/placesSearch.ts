import { supabase } from '@lib/supabase';
import { Place } from '@domain/entities';
import { transformPlaceData } from './placesTransform';

export async function getPlacesByCategory(categoryId: string): Promise<Place[]> {
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
  return (data || []).map((place) => transformPlaceData(place));
}

export async function getTopPlaces(limit: number = 6): Promise<Place[]> {
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
  return (data || []).map((place) => transformPlaceData(place));
}

export async function getRecentPlaces(limit: number = 15): Promise<Place[]> {
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
  return (data || []).map((place) => transformPlaceData(place));
}

export async function searchPlaces(query: string): Promise<Place[]> {
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
  return (data || []).map((place) => transformPlaceData(place));
}

export async function getSavedPlacesByUserId(userID: string): Promise<Place[]> {
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
    .map((place) => transformPlaceData(place));
}
