import { supabase } from '@lib/supabase';
import { Event, CreateEventData } from '@domain/entities';
import { transformEventData } from './eventsTransform';

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
        *,
        category:categories(*),
        user:users(name, avatar),
        event_attendance(user_id)
      `)
    .order('date_start', { ascending: false });

  if (error) throw error;
  return (data || []).map((event) => transformEventData(event));
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
        *,
        category:categories(*)
      `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return transformEventData(data);
}

export async function getEventsByUser(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
        *,
        category:categories(*),
        user:users(name, avatar),
        event_attendance(user_id)
      `)
    .eq('user_id', userId)
    .order('date_start', { ascending: false });

  if (error) throw error;
  return (data || []).map((event) => transformEventData(event));
}

export async function getEventsAttending(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('event_attendance')
    .select(`
        event:events(
          *,
          category:categories(*),
          user:users(name, avatar)
        )
      `)
    .eq('user_id', userId)
    .eq('confirmed', true);

  if (error) throw error;
  return (data || [])
    .map((item: any) => item.event)
    .filter(Boolean)
    .map((event: any) => transformEventData(event));
}

export async function createEvent(eventData: CreateEventData): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      name: eventData.name,
      description: eventData.description,
      address: eventData.address,
      category_id: eventData.categoryId,
      image: eventData.image,
      gallery: eventData.gallery || [],
      date_start: eventData.dateStart,
      time_start: eventData.timeStart,
      time_end: eventData.timeEnd,
      price: eventData.price,
      capacity: eventData.capacity,
      is_free: eventData.isFree,
      tags: eventData.tags,
      coords: eventData.coords,
      user_id: eventData.userId,
    })
    .select()
    .single();

  if (error) throw error;
  return transformEventData(data);
}

export async function uploadCoverImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `events/${fileName}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function updateEvent(id: string, updates: Partial<CreateEventData>): Promise<Event> {
  const fieldMap: Record<string, string> = {
    name: 'name', description: 'description', address: 'address',
    categoryId: 'category_id', image: 'image', gallery: 'gallery',
    dateStart: 'date_start', timeStart: 'time_start', timeEnd: 'time_end',
    price: 'price', capacity: 'capacity', isFree: 'is_free',
    tags: 'tags', coords: 'coords',
  };
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, dbKey] of Object.entries(fieldMap)) {
    if (updates[key as keyof typeof updates] !== undefined) {
      dbUpdates[dbKey] = updates[key as keyof typeof updates];
    }
  }
  const { data, error } = await supabase
    .from('events')
    .update(dbUpdates)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return transformEventData(data);
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
