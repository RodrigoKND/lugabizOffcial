import { useState, useEffect } from 'react';
import { Place, Event } from '@domain/entities';
import { supabase } from '@lib/supabase/client';

export interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  places: Place[];
  events?: Event[];
  type: 'places' | 'events' | 'mixed';
}

interface SectionConfig {
  id: string;
  title: string;
  subtitle: string;
  categoryName?: string | null;
  sortBy?: 'rating' | 'recent' | 'views';
  type: 'places' | 'events' | 'mixed';
}

const CACHE_TTL_MS = 12 * 3600_000;
const CACHE_KEY_PREFIX = '_lugabiz_home_sections_';

function getCached(key: string): SectionConfig[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_KEY_PREFIX + key); return null; }
    return data;
  } catch { return null; }
}

function setCache(key: string, data: SectionConfig[]) {
  try { localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

async function fetchAISections(
  userId: string | null,
  prefCats: string[],
  city: string,
): Promise<SectionConfig[] | null> {
  try {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { action: 'personalized-home', userId, prefCats, city, hour, isWeekend },
    });
    if (error || !Array.isArray(data?.sections) || data.sections.length < 2) return null;
    return data.sections as SectionConfig[];
  } catch { return null; }
}

function applySort(places: Place[], sortBy?: string): Place[] {
  const arr = [...places];
  if (sortBy === 'rating') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sortBy === 'views') arr.sort((a, b) => ((b as any).viewsCount || 0) - ((a as any).viewsCount || 0));
  else if (sortBy === 'recent') arr.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
  return arr;
}

export function usePersonalizedSections(
  places: Place[],
  userId: string | null | undefined,
  city?: string,
) {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (places.length < 4) return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const prefCats: string[] = [];

        if (userId) {
          const { data: prefs } = await supabase
            .from('user_category_preferences')
            .select('categories(name)')
            .eq('user_id', userId)
            .limit(6);
          (prefs || []).forEach((p: any) => { if (p.categories?.name) prefCats.push(p.categories.name); });

          if (prefCats.length === 0) {
            const { data: act } = await supabase
              .from('user_activity')
              .select('data')
              .eq('user_id', userId)
              .ilike('action', 'view_%')
              .order('created_at', { ascending: false })
              .limit(15);
            const counts: Record<string, number> = {};
            (act || []).forEach((a: any) => {
              const cat = a.data?.category as string | undefined;
              if (cat) counts[cat] = (counts[cat] || 0) + 1;
            });
            Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .forEach(([c]) => prefCats.push(c));
          }
        }

        const cacheKey = userId
          ? `${userId}:${new Date().toDateString()}`
          : `anon:${(city || 'x').slice(0, 12)}:${new Date().toDateString()}`;

        let configs = getCached(cacheKey);
        if (!configs) {
          configs = await fetchAISections(userId ?? null, prefCats, city || '');
          if (configs) setCache(cacheKey, configs);
        }
        if (!configs || configs.length < 2) {
          setLoading(false);
          return;
        }

        if (cancelled) return;

        const built: HomeSection[] = configs
          .map(cfg => {
            let filtered = [...places];
            if (cfg.categoryName) {
              const lower = cfg.categoryName.toLowerCase();
              filtered = filtered.filter(p =>
                p.category?.name?.toLowerCase().includes(lower),
              );
            }
            filtered = applySort(filtered, cfg.sortBy).slice(0, 10);

            return {
              id: cfg.id,
              title: cfg.title,
              subtitle: cfg.subtitle,
              places: filtered,
              type: cfg.type,
            } as HomeSection;
          })
          .filter(s => s.places.length >= 2);

        setSections(built);
      } catch {}
      if (!cancelled) setLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [places.length, userId, city]);

  return { sections, loading };
}
