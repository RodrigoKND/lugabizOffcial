import type { EventStatus } from '@domain/entities/EventDetailTypes';

export function getEventStatus(dateStart: Date, timeStart: string, timeEnd?: string): EventStatus {
  const now = new Date();
  // Use UTC methods: DB stores date-only strings (e.g. "2026-06-11") which JS parses as UTC midnight.
  // getFullYear/Month/Date return local time, causing off-by-one in UTC-negative timezones.
  const eventDay = new Date(dateStart.getUTCFullYear(), dateStart.getUTCMonth(), dateStart.getUTCDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventDay < today) return 'finished';
  if (eventDay > today) return 'upcoming';

  const toMinutes = (t: string) => t.split(':').slice(0, 2).map(Number).reduce((h, m) => h * 60 + m);
  const current = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(timeStart);

  if (timeEnd) {
    const end = toMinutes(timeEnd);
    if (current > end) return 'finished';
    if (current >= start) return 'ongoing';
  } else if (current > start) {
    return 'finished';
  }

  return 'upcoming';
}

export function formatEventDate(dateStart: Date): string {
  return new Date(dateStart).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
