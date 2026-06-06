import { supabase } from '@lib/supabase';
import { EventAttendance } from '@domain/entities';

export async function attendEvent(userId: string, eventId: string, sharedBy?: string): Promise<void> {
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
}

export async function cancelAttendance(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('event_attendance')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) throw error;

  await supabase.rpc('update_event_attendees_count', { event_id: eventId });
}

export async function getEventAttendees(eventId: string): Promise<EventAttendance[]> {
  const { data, error } = await supabase
    .from('event_attendance')
    .select(`
        *,
        attendee:users!event_attendance_user_id_fkey(name, avatar)
      `)
    .eq('event_id', eventId)
    .eq('confirmed', true);

  if (error) throw error;
  return (data || []).map((item: any) => ({
    id: item.id,
    eventId: item.event_id,
    userId: item.user_id,
    userName: item.attendee?.name,
    userAvatar: item.attendee?.avatar,
    sharedBy: item.shared_by,
    confirmed: item.confirmed,
    createdAt: new Date(item.created_at),
  }));
}

export async function getUserAttendance(userId: string): Promise<EventAttendance[]> {
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
}

export async function isAttending(userId: string, eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_attendance')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .eq('confirmed', true)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function getAttendeeCount(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from('event_attendance')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('confirmed', true);

  if (error) throw error;
  return count || 0;
}
