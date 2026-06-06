import { useState, useEffect } from 'react';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import { supabase } from '@lib/supabase/client';
import { UseTrendingPlacesReturn } from '@domain/entities/HomeTypes';

async function fetchTrendingFallback(): Promise<any[]> {
  const { data, error } = await supabase
    .from('places')
    .select('id, name, image, rating, category:categories(id, name, color)')
    .order('views_count', { ascending: false, nullsFirst: false })
    .limit(10);

  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    rating: p.rating ?? 0,
    category: p.category,
  }));
}

export function useTrendingPlaces(): UseTrendingPlacesReturn {
  const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await edgeService.getTrendingPlaces();
        if (!cancelled && data?.length) {
          setTrendingPlaces(data);
          return;
        }
      } catch {}

      // Edge function failed or returned empty — use direct query fallback
      try {
        const data = await fetchTrendingFallback();
        if (!cancelled) setTrendingPlaces(data);
      } catch {}
    }

    load().finally(() => { if (!cancelled) setTrendingLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { trendingPlaces, trendingLoading };
}
