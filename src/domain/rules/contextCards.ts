import { trendScore, type VerdictTotals } from './trendScore';
import {
  COLD_C, HOT_C, INTENT_HEADLINE, INTENT_KEYWORDS, SLOT_INTENT, hourInLaPaz, slotForHour, type Intent,
} from './contextIntents';

export interface ContextPlace {
  id: string;
  name: string;
  image?: string;
  rating: number;
  createdAt: Date | string;
  category?: { name: string };
  latitude?: number;
  longitude?: number;
  hidden?: boolean;
}

export interface ContextInput {
  now: Date;
  tempC: number | null;
  places: ContextPlace[];
  coords?: { lat: number; lng: number };
  totals?: Record<string, VerdictTotals>;
}

export interface ContextCard {
  id: string;
  to: string;
  name: string;
  image?: string;
  headline: string;
  reason: string;
  distance?: string;
}

const DAY_MS = 86_400_000;
const WALK_MIN_PER_KM = 12;
const NO_VOTES: VerdictTotals = { jallalla: 0, bien: 0, ahi: 0 };
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function distanceKm(a: { lat: number; lng: number }, lat: number, lng: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(lat)) * Math.sin(rad(lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function walkingText(coords: ContextInput['coords'], p: ContextPlace): string | undefined {
  if (!coords || p.latitude === undefined || p.longitude === undefined) return undefined;
  const km = distanceKm(coords, p.latitude, p.longitude);
  const min = Math.max(1, Math.round(km * WALK_MIN_PER_KM));
  return min <= 45 ? `a ${min} min caminando` : `a ${km.toFixed(1)} km`;
}

// Qué momento es: la franja del día y, si hace calor o frío, una sugerencia extra (va primero).
function intentsFor(now: Date, tempC: number | null): Intent[] {
  const slot = SLOT_INTENT[slotForHour(hourInLaPaz(now))];
  if (!slot) return [];
  const weather: Intent[] = tempC === null ? [] : tempC >= HOT_C ? ['calor'] : tempC <= COLD_C ? ['frio'] : [];
  return [...weather, slot];
}

// Sugerencias por la hora y el clima. Nunca son pagadas: los candidatos se ordenan por lo que la gente quiere (trendScore)
// y se ROTAN por día para que todos los negocios que encajan tengan su turno.
export function buildContextCards(input: ContextInput, limit = 3): ContextCard[] {
  const { now, tempC, places, coords, totals } = input;
  const day = Math.floor(now.getTime() / DAY_MS);
  const used = new Set<string>();
  const score = (p: ContextPlace) =>
    trendScore(totals?.[p.id] ?? NO_VOTES, Math.max(0, Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / DAY_MS))) + p.rating * 0.02;

  const cards: ContextCard[] = [];
  intentsFor(now, tempC).forEach((intent, i) => {
    const words = INTENT_KEYWORDS[intent];
    const ranked = places
      .filter(p => !p.hidden && !used.has(p.id) && words.some(w => normalize(`${p.category?.name ?? ''} ${p.name}`).includes(w)))
      .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
      .slice(0, 4);
    if (ranked.length === 0) return;
    const pick = ranked[(day + i) % ranked.length];
    used.add(pick.id);
    const weatherReason = intent === 'calor' || intent === 'frio';
    cards.push({
      id: `place-${pick.id}`, to: `/place/${pick.id}`, name: pick.name, image: pick.image,
      headline: INTENT_HEADLINE[intent](pick.name),
      reason: weatherReason ? `${tempC}°C ahora en Cochabamba` : 'Sugerencia por la hora',
      distance: walkingText(coords, pick),
    });
  });
  return cards.slice(0, limit);
}
