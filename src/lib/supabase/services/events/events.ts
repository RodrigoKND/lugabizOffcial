import { supabase } from '@lib/supabase';
import { Event, CreateEventData, EventAttendance } from '@domain/entities';

export const eventsService = {
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        category:categories(*),
        user:users(name, avatar),
        event_attendance(user_id),
        attendees:event_attendance(count)
      `)
      .order('date_start', { ascending: false });

    if (error) throw error;
    return (data || []).map((event) => this.transformEventData(event));
  },

  async getEventById(id: string): Promise<Event | null> {
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
    return this.transformEventData(data);
  },

  async getEventsByUser(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        category:categories(*),
        user:users(name, avatar),
        event_attendance(user_id),
        attendees:event_attendance(count)
      `)
      .eq('user_id', userId)
      .order('date_start', { ascending: false });

    if (error) throw error;
    return (data || []).map((event) => this.transformEventData(event));
  },

  async getEventsAttending(userId: string): Promise<Event[]> {
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
      .map((event: any) => this.transformEventData(event));
  },

  async createEvent(eventData: CreateEventData): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: eventData.name,
        description: eventData.description,
        address: eventData.address,
        category_id: eventData.categoryId,
        image: eventData.image,
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
    return this.transformEventData(data);
  },

  async uploadCoverImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async attendEvent(userId: string, eventId: string, sharedBy?: string): Promise<void> {
    const { error } = await supabase
      .from('event_attendance')
      .upsert({
        user_id: userId,
        event_id: eventId,
        shared_by: sharedBy,
        confirmed: true,
      }, { onConflict: 'event_id,user_id' });

    if (error) throw error;

    await supabase.rpc('update_event_attendees_count', { event_id: eventId });
  },

  async cancelAttendance(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase
      .from('event_attendance')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) throw error;

    await supabase.rpc('update_event_attendees_count', { event_id: eventId });
  },

  async getEventAttendees(eventId: string): Promise<EventAttendance[]> {
    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        *,
        user:users(name, avatar)
      `)
      .eq('event_id', eventId)
      .eq('confirmed', true);

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      eventId: item.event_id,
      userId: item.user_id,
      userName: item.user?.name,
      userAvatar: item.user?.avatar,
      sharedBy: item.shared_by,
      confirmed: item.confirmed,
      createdAt: new Date(item.created_at),
    }));
  },

  async getUserAttendance(userId: string): Promise<EventAttendance[]> {
    const { data, error } = await supabase
      .from('event_attendance')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      eventId: item.event_id,
      userId: item.user_id,
      sharedBy: item.shared_by,
      confirmed: item.confirmed,
      createdAt: new Date(item.created_at),
    }));
  },

  async isAttending(userId: string, eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('confirmed', true)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getAttendeeCount(eventId: string): Promise<number> {
    const { count, error } = await supabase
      .from('event_attendance')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('confirmed', true);

    if (error) throw error;
    return count || 0;
  },

<<<<<<< HEAD
<<<<<<< HEAD
  async updateEvent(id: string, updates: Partial<CreateEventData>): Promise<Event> {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.dateStart !== undefined) dbUpdates.date_start = updates.dateStart;
    if (updates.timeStart !== undefined) dbUpdates.time_start = updates.timeStart;
    if (updates.timeEnd !== undefined) dbUpdates.time_end = updates.timeEnd;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.isFree !== undefined) dbUpdates.is_free = updates.isFree;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.coords !== undefined) dbUpdates.coords = updates.coords;

    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return this.transformEventData(data);
  },

=======
>>>>>>> main
=======
>>>>>>> main
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },

  transformEventData(event: any): Event {
    const attendees = event.event_attendance || [];
    const uniqueAttendees = new Set(attendees.map((a: any) => a.user_id || a.userId));

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      address: event.address,
      categoryId: event.category_id,
      category: event.category ? {
        id: event.category.id,
        name: event.category.name,
        icon: event.category.icon,
        color: event.category.color,
        description: event.category.description,
      } : undefined,
      image: event.image,
      dateStart: new Date(event.date_start),
      timeStart: event.time_start,
      timeEnd: event.time_end,
      price: event.price,
      capacity: event.capacity,
      isFree: event.is_free ?? false,
      tags: event.tags || [],
      coords: event.coords || [],
      userId: event.user_id,
      user: event.user ? { name: event.user.name, avatar: event.user.avatar } : undefined,
      attendeesCount: event.attendees_count || uniqueAttendees.size,
      createdAt: new Date(event.created_at),
      updatedAt: new Date(event.updated_at || event.created_at),
    };
  },
};
