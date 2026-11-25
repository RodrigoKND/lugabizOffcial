import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@lib/supabase/client';
import { createProximityEngine, type EnginePlace } from './proximityEngine';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

const BBOX_DEGREES = 0.03; // ≈ 3 km a cada lado
const DISTANCE_FILTER_M = 50;

const localStore = {
  get: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* sin almacenamiento: solo no se recuerda */ } },
};

// Lugares con coordenadas alrededor del usuario (una consulta poco frecuente: el motor cachea el resultado).
async function loadPlaces(lat: number, lng: number): Promise<EnginePlace[]> {
  const { data, error } = await supabase
    .from('places')
    .select('id, name, latitude, longitude')
    .not('latitude', 'is', null)
    .gte('latitude', lat - BBOX_DEGREES).lte('latitude', lat + BBOX_DEGREES)
    .gte('longitude', lng - BBOX_DEGREES).lte('longitude', lng + BBOX_DEGREES)
    .eq('hidden', false)
    .limit(200);
  if (error) throw error;
  return (data ?? []) as EnginePlace[];
}

// El id de una notificación local es un entero de 32 bits: se deriva del id del lugar.
function notificationId(placeId: string): number {
  let hash = 0;
  for (const ch of placeId) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(hash) || 1;
}

async function notifyNearby(place: EnginePlace): Promise<void> {
  await LocalNotifications.schedule({
    notifications: [{
      id: notificationId(place.id),
      title: place.name,
      body: 'Estás cerca · ¿Entraste? Cuéntanos qué te pareció',
      extra: { url: `/place/${place.id}?survey=true` },
    }],
  });
}

// Ubicación en segundo plano (servicio nativo con aviso visible en Android) + aviso LOCAL al llegar a un lugar:
// no depende de internet ni del servidor de push. Devuelve la función para detenerlo.
export async function startNativeProximity(onOpenUrl: (url: string) => void): Promise<() => Promise<void>> {
  await LocalNotifications.requestPermissions();

  const tapHandle = await LocalNotifications.addListener('localNotificationActionPerformed', action => {
    const url = action.notification.extra?.url;
    if (typeof url === 'string' && url.startsWith('/')) onOpenUrl(url);
  });

  const engine = createProximityEngine({ loadPlaces, onNearby: place => notifyNearby(place), store: localStore });

  const watcherId = await BackgroundGeolocation.addWatcher(
    {
      backgroundTitle: 'Lugabiz',
      backgroundMessage: 'Te avisamos cuando estés cerca de un lugar.',
      requestPermissions: true,
      stale: false,
      distanceFilter: DISTANCE_FILTER_M,
    },
    (location, error) => {
      if (error) {
        if (error.code === 'NOT_AUTHORIZED') console.warn('[nativeProximity] ubicación sin permiso');
        return;
      }
      if (location) engine.onLocation({ lat: location.latitude, lng: location.longitude, accuracy: location.accuracy });
    },
  );

  return async () => {
    await BackgroundGeolocation.removeWatcher({ id: watcherId });
    await tapHandle.remove();
  };
}
