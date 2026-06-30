import { useState, useEffect } from 'react';
import { Place, Event } from '@domain/entities';
import { supabase } from '@lib/supabase/client';

export interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  places: Place[];
  events: Event[];
  type: 'places' | 'events' | 'mixed';
}

interface ServingSection {
  id: string;
  title: string;
  subtitle: string;
  type: 'places' | 'events';
  placeIds: string[];
  eventIds: string[];
}

const MIN_PLACES = 3;

// Fallback 100% local si la edge function falla (sin recomendación personalizada).
function localFallback(places: Place[], events: Event[]): HomeSection[] {
  const out: HomeSection[] = [];
  const trending = [...places].sort((a, b) =>
    ((b.savedCount ?? 0) * 3 + (b.reviewCount ?? 0) * 2) -
    ((a.savedCount ?? 0) * 3 + (a.reviewCount ?? 0) * 2)).slice(0, 12);
  if (trending.length >= MIN_PLACES)
    out.push({ id: 'tendencia', title: 'En tendencia', subtitle: 'Lo más popular', type: 'places', places: trending, events: [] });

  const recent = [...places].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12);
  if (recent.length >= MIN_PLACES)
    out.push({ id: 'nuevos', title: 'Recién agregados', subtitle: 'Lo último', type: 'places', places: recent, events: [] });

  const upcoming = events.filter(e => new Date(e.dateStart) >= new Date()).slice(0, 8);
  if (upcoming.length >= 1)
    out.push({ id: 'eventos', title: 'Próximos eventos', subtitle: 'No te los pierdas', type: 'events', places: [], events: upcoming });

  return out;
}

export function usePersonalizedSections(
  places: Place[],
  events: Event[],
  userId: string | null | undefined,
  city?: string,
  lat?: number,
  lng?: number,
) {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (places.length < MIN_PLACES) return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setSections([]);

      const placeById = new Map(places.map(p => [p.id, p]));
      const eventById = new Map(events.map(e => [e.id, e]));

      try {
        const { data, error } = await supabase.functions.invoke('personalized-content', {
          body: {
            userId: userId ?? null,
            hour: new Date().getHours(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            city: city || '',
            lat, lng,
          },
        });

        if (cancelled) return;

        const serving = (!error && Array.isArray(data?.sections)) ? data.sections as ServingSection[] : null;

        if (!serving || serving.length === 0) {
          setSections(localFallback(places, events));
          return;
        }

        // Mapear IDs -> objetos ya cargados en memoria; descartar lo que no esté.
        const built: HomeSection[] = serving
          .map((s): HomeSection | null => {
            if (s.type === 'events') {
              const evs = s.eventIds.map(id => eventById.get(id)).filter(Boolean) as Event[];
              return evs.length >= 1
                ? { id: s.id, title: s.title, subtitle: s.subtitle, type: 'events', places: [], events: evs }
                : null;
            }
            const pls = s.placeIds.map(id => placeById.get(id)).filter(Boolean) as Place[];
            return pls.length >= MIN_PLACES
              ? { id: s.id, title: s.title, subtitle: s.subtitle, type: 'places', places: pls, events: [] }
              : null;
          })
          .filter(Boolean) as HomeSection[];

        setSections(built.length > 0 ? built : localFallback(places, events));
      } catch (e) {
        console.error('[PersonalizedSections] error:', e);
        if (!cancelled) setSections(localFallback(places, events));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true };
  }, [places.length, events.length, userId, city, lat, lng]);

  return { sections, loading };
}
