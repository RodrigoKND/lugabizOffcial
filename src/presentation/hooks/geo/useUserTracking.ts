import { useEffect, useRef } from 'react';
import { useGeolocation } from './useGeolocation';
import { userActivityService } from '@lib/supabase/services/places/userActivity';
import { useAuth } from '@presentation/context/AuthContext';
import { supabase } from '@lib/supabase/client';
import { latLngToCell, getNearbyCells } from '@infrastructure/utils/h3';
import { sendBrowserPush } from '@lib/supabase/services/push/sendPush';

const TRACKING_INTERVAL = 5 * 60 * 1000;

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

  useEffect(() => {
    if (!user?.id || !position) return;

    const now = Date.now();
    if (now - lastTrackedRef.current < TRACKING_INTERVAL) return;
    lastTrackedRef.current = now;

    const sentProximityRef = sessionStorage.getItem('_lugabiz_proximity_sent') || '';

    const track = async () => {
      try {
        // Registrar actividad de ubicación en DB (best-effort)
        userActivityService.trackLocation(user.id, position.lat, position.lon).catch(() => {});

        const nearbyCells = getNearbyCells(position.lat, position.lon, 1);
        const { data: places } = await supabase
          .from('places')
          .select('id, name, latitude, longitude')
          .not('latitude', 'is', null)
          .limit(30);

        if (places && places.length > 0) {
          const nearbyPlaces = places.filter(p => {
            if (!p.latitude || !p.longitude) return false;
            return nearbyCells.includes(latLngToCell(p.latitude, p.longitude));
          });

          for (const place of nearbyPlaces.slice(0, 3)) {
            const sentKey = `${place.id}:${new Date().toDateString()}`;
            if (sentProximityRef.includes(sentKey)) continue;

            await sendBrowserPush(
              `📍 ${place.name}`,
              'Estás pasando cerca · ¿Entraste? Cuéntanos qué te pareció',
              `/place/${place.id}?survey=true`,
              { place_id: place.id },
            );

            sessionStorage.setItem(
              '_lugabiz_proximity_sent',
              `${sentProximityRef}|${sentKey}`,
            );
          }

          if (nearbyPlaces.length > 0) {
            const existingCheck = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', user.id)
              .eq('type', 'nearby')
              .gte('created_at', new Date(Date.now() - 3_600_000).toISOString())
              .limit(1);
            if (!existingCheck.data?.length) {
              await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'nearby',
                title: 'Lugares cerca de ti',
                body: `Hay ${nearbyPlaces.length} lugar(es) interesante(s) cerca de tu ubicación actual.`,
                data: { places: nearbyPlaces.map(p => p.id), latitude: position.lat, longitude: position.lon },
              });
            }
          }
        }
      } catch {}
    };

    track();
  }, [user?.id, position?.lat, position?.lon]);
}
