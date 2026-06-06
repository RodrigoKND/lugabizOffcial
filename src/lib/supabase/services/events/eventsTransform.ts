import { Event } from '@domain/entities';

// Parse a DB DATE string ("YYYY-MM-DD") as local midnight to avoid timezone shift.
// new Date("2026-06-05") treats the string as UTC midnight, which shifts the date
// back one day in UTC-negative timezones. We want local midnight instead.
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function transformEventData(event: any): Event {
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
    gallery: event.gallery || [],
    dateStart: parseLocalDate(event.date_start),
    timeStart: event.time_start,
    timeEnd: event.time_end,
    price: event.price,
    capacity: event.capacity,
    isFree: event.is_free ?? false,
    tags: event.tags || [],
    coords: event.coords || [],
    userId: event.user_id,
    user: event.user ? { name: event.user.name, avatar: event.user.avatar } : undefined,
    attendeesCount: event.attendees_count ?? uniqueAttendees.size,
    createdAt: new Date(event.created_at),
    updatedAt: new Date(event.updated_at || event.created_at),
  };
}
