import { useState, useEffect, useRef } from 'react';
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

function localFallback(places: Place[], events: Event[]): HomeSection[] {
  const out: HomeSection[] = [];
  const trending = [...places]
    .sort((a, b) => ((b.savedCount ?? 0) * 3 + (b.reviewCount ?? 0) * 2) -
                    ((a.savedCount ?? 0) * 3 + (a.reviewCount ?? 0) * 2))
    .slice(0, 12);
  if (trending.length >= MIN_PLACES)
    out.push({ id: 'tendencia', title: 'En tendencia', subtitle: 'Lo más popular', type: 'places', places: trending, events: [] });

  const recent = [...places]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);
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
  // Ref para evitar que dos cargas simultáneas se pisen
  const loadingRef = useRef(false);

  const load = async (force = false) => {
    if (places.length < MIN_PLACES) return;
    if (loadingRef.current && !force) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const placeById = new Map(places.map(p => [p.id, p]));
      const eventById = new Map(events.map(e => [e.id, e]));

      const { data, error } = await supabase.functions.invoke('personalized-content', {
        body: {
          userId: userId ?? null,
          hour: new Date().getHours(),
          isWeekend: [0, 6].includes(new Date().getDay()),
          city: city || '',
          lat, lng,
          force,
        },
      });

      if (error || !Array.isArray(data?.sections)) {
        setSections(localFallback(places, events));
        return;
      }

      // Deduplicar secciones por id (por si la función devuelve repetidos)
      const seen = new Set<string>();
      const built: HomeSection[] = [];

      for (const s of data.sections as ServingSection[]) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);

        if (s.type === 'events') {
          const evs = s.eventIds.map(id => eventById.get(id)).filter(Boolean) as Event[];
          if (evs.length >= 1) built.push({ id: s.id, title: s.title, subtitle: s.subtitle, type: 'events', places: [], events: evs });
        } else {
          const pls = s.placeIds.map(id => placeById.get(id)).filter(Boolean) as Place[];
          if (pls.length >= 1) built.push({ id: s.id, title: s.title, subtitle: s.subtitle, type: 'places', places: pls, events: [] });
        }
      }

      setSections(built.length > 0 ? built : localFallback(places, events));
    } catch (e) {
      console.error('[PersonalizedSections] error:', e);
      setSections(localFallback(places, events));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Carga cuando cambia el catálogo o el usuario
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (places.length < MIN_PLACES) return;
      loadingRef.current = true;
      setLoading(true);
      setSections([]);
      // Siempre forzar si hay usuario logueado para que no sirva caché genérica
      const forceIfLoggedIn = !!userId;
      try {
        const placeById = new Map(places.map(p => [p.id, p]));
        const eventById = new Map(events.map(e => [e.id, e]));

        const { data, error } = await supabase.functions.invoke('personalized-content', {
          body: {
            userId: userId ?? null,
            hour: new Date().getHours(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            city: city || '',
            lat, lng,
            force: forceIfLoggedIn,
          },
        });

        if (cancelled) return;

        if (error || !Array.isArray(data?.sections)) {
          setSections(localFallback(places, events));
          return;
        }

        const seen = new Set<string>();
        const built: HomeSection[] = [];
        for (const s of data.sections as ServingSection[]) {
          if (seen.has(s.id)) continue;
          seen.add(s.id);
          if (s.type === 'events') {
            const evs = s.eventIds.map(id => eventById.get(id)).filter(Boolean) as Event[];
            if (evs.length >= 1) built.push({ id: s.id, title: s.title, subtitle: s.subtitle, type: 'events', places: [], events: evs });
          } else {
            const pls = s.placeIds.map(id => placeById.get(id)).filter(Boolean) as Place[];
            if (pls.length >= 1) built.push({ id: s.id, title: s.title, subtitle: s.subtitle, type: 'places', places: pls, events: [] });
          }
        }
        if (!cancelled) setSections(built.length > 0 ? built : localFallback(places, events));
      } catch (e) {
        console.error('[PersonalizedSections] error:', e);
        if (!cancelled) setSections(localFallback(places, events));
      } finally {
        if (!cancelled) { setLoading(false); loadingRef.current = false; }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [places.length, events.length, userId, city, lat, lng]);

  // Refrescar secciones cuando el usuario guarda/desguarda un lugar
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`reco-saved-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'saved_places',
        filter: `user_id=eq.${userId}`,
      }, () => load(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { sections, loading };
}
