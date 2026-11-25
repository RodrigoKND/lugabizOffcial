export interface BillboardEvent {
  id: string;
  name: string;
  image?: string;
  dateStart: Date | string;
  dateEnd?: Date | string;
  timeStart: string;
  category?: { name: string };
}

export interface BillboardPlace {
  id: string;
  name: string;
  image?: string;
  rating: number;
  reviewCount: number;
  createdAt: Date | string;
  category?: { name: string };
  hidden?: boolean;
}

export interface Billboard {
  id: string;
  name: string;
  image?: string;
  category?: string;
  to: string;
  kicker: string;
  detail: string;
}

export const MAX_BILLBOARDS = 6;

const MAX_EVENTS = 4;
const NEW_PLACE_DAYS = 14;
const MIN_FEATURED_RATING = 4;
const DAY_MS = 86_400_000;

const startOfDay = (d: Date | string) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
const daysFrom = (d: Date | string, now: Date) => Math.round((startOfDay(d) - startOfDay(now)) / DAY_MS);

const weekdayKicker = (d: Date | string) =>
  `${new Date(d).toLocaleDateString('es', { weekday: 'short' }).replace('.', '').toUpperCase()} ${new Date(d).getDate()}`;

const fromEvent = (e: BillboardEvent, kicker: string): Billboard => ({
  id: `event-${e.id}`, name: e.name, image: e.image, category: e.category?.name,
  to: `/event/${e.id}`, kicker, detail: e.timeStart,
});

const fromPlace = (p: BillboardPlace, kicker: string): Billboard => ({
  id: `place-${p.id}`, name: p.name, image: p.image, category: p.category?.name,
  to: `/place/${p.id}`, kicker, detail: p.category?.name ?? 'Lugar',
});

function pickEvents(events: BillboardEvent[], now: Date): Billboard[] {
  const sorted = [...events].sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));
  // Hoy = empieza hoy o ya empezó y todavía no termina.
  const today = sorted.filter(e => daysFrom(e.dateStart, now) <= 0 && daysFrom(e.dateEnd ?? e.dateStart, now) >= 0);
  const week = sorted.filter(e => { const d = daysFrom(e.dateStart, now); return d >= 1 && d <= 7; });
  return [
    ...today.map(e => fromEvent(e, 'HOY')),
    ...week.map(e => fromEvent(e, weekdayKicker(e.dateStart))),
  ].slice(0, MAX_EVENTS);
}

// Destacados: mejor puntuados, rotados por día para que no salgan siempre los mismos.
function rotateByDay<T>(list: T[], now: Date): T[] {
  if (list.length < 2) return list;
  const shift = Math.floor(startOfDay(now) / DAY_MS) % list.length;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

function pickPlaces(places: BillboardPlace[], now: Date): Billboard[] {
  const visible = places.filter(p => !p.hidden);
  const fresh = visible
    .filter(p => daysFrom(p.createdAt, now) >= -NEW_PLACE_DAYS)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const freshIds = new Set(fresh.map(p => p.id));
  const score = (p: BillboardPlace) => p.rating * Math.log(p.reviewCount + 2);
  const featured = visible
    .filter(p => !freshIds.has(p.id) && p.rating >= MIN_FEATURED_RATING)
    .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
  return [
    ...fresh.slice(0, 2).map(p => fromPlace(p, 'NUEVO')),
    ...rotateByDay(featured, now).map(p => fromPlace(p, 'DESTACADO')),
  ];
}

// Cartelera automática: hoy > semana > negocios nuevos > destacados. Sin duplicados y con tope.
export function buildBillboards(events: BillboardEvent[], places: BillboardPlace[], now: Date = new Date()): Billboard[] {
  const seen = new Set<string>();
  return [...pickEvents(events, now), ...pickPlaces(places, now)]
    .filter(b => !seen.has(b.id) && !!seen.add(b.id))
    .slice(0, MAX_BILLBOARDS);
}
