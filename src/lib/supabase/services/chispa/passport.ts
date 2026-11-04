import { supabase } from '@lib/supabase';

export interface PassportStamp {
  placeId: string;
  name: string;
}

// Un sello por lugar donde el usuario confirmó "estoy aquí" en una encuesta (place_surveys.is_nearby).
export const passportService = {
  async getStamps(userId: string): Promise<PassportStamp[]> {
    const { data, error } = await supabase
      .from('place_surveys')
      .select('place_id, created_at, places(name)')
      .eq('user_id', userId)
      .eq('is_nearby', true)
      .order('created_at', { ascending: false });
    if (error || !data) return [];

    const seen = new Set<string>();
    const stamps: PassportStamp[] = [];
    for (const row of data as unknown as { place_id: string; places: { name: string } | { name: string }[] | null }[]) {
      if (seen.has(row.place_id)) continue;
      seen.add(row.place_id);
      const place = Array.isArray(row.places) ? row.places[0] : row.places;
      stamps.push({ placeId: row.place_id, name: place?.name ?? 'Lugar' });
    }
    return stamps;
  },
};
