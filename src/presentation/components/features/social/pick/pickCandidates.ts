import type { PickOptionDraft } from '@presentation/hooks/social/useCreateGroupPick';

interface CandidatePlace { id: string; name: string; image?: string; rating?: number; category?: { name: string } }
interface CandidateEvent { id: string; name: string; image?: string }

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Candidatos para sumar a una votación: sin búsqueda, los lugares mejor puntuados; con búsqueda, lugares (nombre o categoría) y eventos.
export function pickCandidates(
  query: string, places: CandidatePlace[], events: CandidateEvent[], excludeKeys: string[], limit = 6,
): PickOptionDraft[] {
  const q = normalize(query.trim());
  const placeDrafts = [...places]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .filter(p => !q || normalize(p.name).includes(q) || normalize(p.category?.name ?? '').includes(q))
    .map((p): PickOptionDraft => ({ key: `place:${p.id}`, placeId: p.id, name: p.name, image: p.image }));
  const eventDrafts = q
    ? events.filter(e => normalize(e.name).includes(q)).map((e): PickOptionDraft => ({ key: `event:${e.id}`, eventId: e.id, name: e.name, image: e.image }))
    : [];
  return [...placeDrafts, ...eventDrafts].filter(c => !excludeKeys.includes(c.key)).slice(0, limit);
}
