export interface PlanTarget {
  name: string;
  eventId?: string;
  placeId?: string;
  when: string;
}

interface EventLike { id: string; name: string; dateStart: string | Date }
interface PlaceLike { id: string; name: string; rating?: number }

// Sugerencia de "plan de hoy": el próximo evento; si no hay, el lugar mejor valorado.
export function pickPlanTarget(events: EventLike[], places: PlaceLike[], now: Date = new Date()): PlanTarget | null {
  const upcoming = events
    .filter(e => new Date(e.dateStart) >= now)
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())[0];
  if (upcoming) {
    return { name: upcoming.name, eventId: upcoming.id, when: new Date(upcoming.dateStart).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }) };
  }
  const best = [...places].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  return best ? { name: best.name, placeId: best.id, when: 'Hoy' } : null;
}
