import { useEffect, useRef } from 'react';
import { useGeolocation } from './useGeolocation';
import { userActivityService } from '@lib/supabase/services/places/userActivity';
import { useAuth } from '@presentation/context/AuthContext';
import { supabase } from '@lib/supabase/client';
import { latLngToCell, getNearbyCells } from '@infrastructure/utils/h3';

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

    const track = async () => {
      try {
        await userActivityService.trackLocation(user.id, position.lat, position.lon);
      } catch {
        const nearbyCells = getNearbyCells(position.lat, position.lon, 1);
        const { data: places } = await supabase
          .from('places')
          .select('id, name, latitude, longitude')
          .not('latitude', 'is', null)
          .limit(20);

        if (places && places.length > 0) {
          const nearbyPlaces = places.filter(p => {
            if (!p.latitude || !p.longitude) return false;
            const placeHex = latLngToCell(p.latitude, p.longitude);
            return nearbyCells.includes(placeHex);
          });

          if (nearbyPlaces.length > 0) {
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
    };

    track();
  }, [user?.id, position?.lat, position?.lon]);
}
