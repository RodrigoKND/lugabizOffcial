import { useEffect, useRef } from 'react';
import { useGeolocation } from './useGeolocation';
import { userActivityService } from '@lib/supabase/services/places/userActivity';
import { useAuth } from '@presentation/context/AuthContext';
import { supabase } from '@lib/supabase/client';
import { latLngToCell, getNearbyCells } from '@infrastructure/utils/h3';

const TRACKING_INTERVAL = 5 * 60 * 1000;
// Bbox de ~5.5km: pre-filtra la query antes de afinar con H3
const GEO_DELTA = 0.05;

export function useUserTracking() {
  const { position, startWatching, stopWatching } = useGeolocation();
  const { user } = useAuth();
  const lastTrackedRef = useRef(0);

  useEffect(() => {
    const geoStarted = sessionStorage.getItem('_lugabiz_geo_started');
    if (geoStarted === 'true') {
      startWatching();
    }
    return stopWatching;
  }, [startWatching, stopWatching]);

  // Persiste la última posición para las secciones personalizadas
  useEffect(() => {
    if (!position) return;
    try {
      sessionStorage.setItem('_lugabiz_last_pos', JSON.stringify({ lat: position.lat, lng: position.lon }));
    } catch {}
  }, [position?.lat, position?.lon]);

  useEffect(() => {
    if (!user?.id || !position) return;

    const now = Date.now();
    if (now - lastTrackedRef.current < TRACKING_INTERVAL) return;
    lastTrackedRef.current = now;

    const track = async () => {
      try {
        // Registrar ubicación en BD + crear notificaciones in-app de proximidad
        userActivityService.trackLocation(user.id, position.lat, position.lon).catch(() => {});

        const nearbyCells = getNearbyCells(position.lat, position.lon, 3);

        // Bug fix: bbox pre-filter evita traer toda la BD; H3 refina el resultado
        const { data: places } = await supabase
          .from('places')
          .select('id, name, latitude, longitude')
          .not('latitude', 'is', null)
          .gte('latitude', position.lat - GEO_DELTA)
          .lte('latitude', position.lat + GEO_DELTA)
          .gte('longitude', position.lon - GEO_DELTA)
          .lte('longitude', position.lon + GEO_DELTA)
          .limit(100);

        if (!places?.length) return;

        const nearbyPlaces = places.filter(p =>
          p.latitude && p.longitude &&
          nearbyCells.includes(latLngToCell(p.latitude, p.longitude))
        );

        // Push real vía edge function (máx 3 por ciclo de tracking)
        // La deduplicación de 24h la maneja el edge function en BD
        for (const place of nearbyPlaces.slice(0, 3)) {
          supabase.functions.invoke('send-proximity-push', {
            body: { placeId: place.id, placeName: place.name },
          }).catch(() => {});
        }
      } catch {}
    };

    track();
  }, [user?.id, position?.lat, position?.lon]);
}
