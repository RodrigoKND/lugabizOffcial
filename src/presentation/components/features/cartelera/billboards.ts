import { trendScore, type VerdictTotals } from '@domain/rules/trendScore';

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

export type PlaceTotals = Record<string, VerdictTotals>;

const NO_VOTES: VerdictTotals = { jallalla: 0, bien: 0, ahi: 0 };
const LOVED_SCORE = 0.5;
const RATING_NUDGE = 0.1;

const ageInDays = (p: BillboardPlace, now: Date) => Math.max(0, -daysFrom(p.createdAt, now));
const ratingNudge = (p: BillboardPlace) => RATING_NUDGE * Math.min(1, Math.max(0, (p.rating - 3) / 2));

// Orden de los destacados. Con totales de reacciones manda lo que la gente quiere (trendScore: suavizado, con tope
// de volumen y bono de novedad); sin totales, como siempre: puntuación y cantidad de reseñas.
export function rankFeatured(places: BillboardPlace[], now: Date, totals?: PlaceTotals): BillboardPlace[] {
  if (!totals || Object.keys(totals).length === 0) {
    const legacy = (p: BillboardPlace) => p.rating * Math.log(p.reviewCount + 2);
    return places
      .filter(p => p.rating >= MIN_FEATURED_RATING)
      .sort((a, b) => legacy(b) - legacy(a) || a.id.localeCompare(b.id));
  }
  const score = (p: BillboardPlace) => trendScore(totals[p.id] ?? NO_VOTES, ageInDays(p, now)) + ratingNudge(p);
  // Un lugar muy querido entra aunque su puntuación de reseñas sea baja (pocas reseñas no deben taparlo).
  const eligible = (p: BillboardPlace) => p.rating >= MIN_FEATURED_RATING || (!!totals[p.id] && score(p) > LOVED_SCORE);
  return places.filter(eligible).sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
}

function pickPlaces(places: BillboardPlace[], now: Date, totals?: PlaceTotals): Billboard[] {
  const visible = places.filter(p => !p.hidden);
  const fresh = visible
    .filter(p => daysFrom(p.createdAt, now) >= -NEW_PLACE_DAYS)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const freshIds = new Set(fresh.map(p => p.id));
  // La rotación diaria solo mueve a los mejor ubicados: nadie ocupa el primer lugar para siempre, pero tampoco se entierra a los queridos.
  const top = rankFeatured(visible.filter(p => !freshIds.has(p.id)), now, totals).slice(0, MAX_BILLBOARDS);
  return [
    ...fresh.slice(0, 2).map(p => fromPlace(p, 'NUEVO')),
    ...rotateByDay(top, now).map(p => fromPlace(p, 'DESTACADO')),
  ];
}

// Cartelera automática: hoy > semana > negocios nuevos > destacados. Sin duplicados y con tope.
export function buildBillboards(events: BillboardEvent[], places: BillboardPlace[], now: Date = new Date(), totals?: PlaceTotals): Billboard[] {
  const seen = new Set<string>();
  return [...pickEvents(events, now), ...pickPlaces(places, now, totals)]
    .filter(b => !seen.has(b.id) && !!seen.add(b.id))
    .slice(0, MAX_BILLBOARDS);
}
