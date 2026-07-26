import { useState, useEffect } from 'react';
import { useAuth, usePlaces } from '@presentation/context';
import { Event, Place, MarketSurvey } from '@domain/entities';
import { marketSurveysService } from '@lib/supabase';
import { idbGet, idbSet } from '@lib/cache/idbCache';

// Datos propios del usuario (guardados/asistencia/encuestas) cambian más
// seguido que el catálogo general, así que el TTL es más corto: solo evita
// el parpadeo de loading al volver a /profile dentro de la misma sesión o
// tras un F5 reciente, no reemplaza la revalidación de red.
const CACHE_TTL_MS = 2 * 60 * 1000;

interface ProfileCachePayload {
  savedPlaces: Place[];
  myEvents: Event[];
  attendingEvents: Event[];
  mySurveys: MarketSurvey[];
}

export function useProfileData() {
  const { user } = useAuth();
  const { getSavedPlacesByUserId, getUserEvents, getEventsAttending } = usePlaces();

  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [mySurveys, setMySurveys] = useState<MarketSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSurveys = async () => {
    if (!user) return;
    try {
      const surveys = await marketSurveysService.getByUser(user.id);
      setMySurveys(surveys);
    } catch (err) { console.error('[useProfileData:refreshSurveys]', err); }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const cacheKey = `profile:${user.id}`;
    const init = async () => {
      const cached = await idbGet<ProfileCachePayload>(cacheKey, CACHE_TTL_MS);
      if (cached) {
        setSavedPlaces(cached.savedPlaces);
        setMyEvents(cached.myEvents);
        setAttendingEvents(cached.attendingEvents);
        setMySurveys(cached.mySurveys);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      const [saved, events, attending] = await Promise.all([
        getSavedPlacesByUserId(user.id),
        getUserEvents(user.id),
        getEventsAttending(user.id),
      ]);
      if (saved) setSavedPlaces(saved);
      setMyEvents(events);
      setAttendingEvents(attending);
      let surveys: MarketSurvey[] = cached?.mySurveys ?? [];
      try {
        surveys = await marketSurveysService.getByUser(user.id);
        setMySurveys(surveys);
      } catch (err) { console.error('[useProfileData:init]', err); }
      setIsLoading(false);
      idbSet(cacheKey, { savedPlaces: saved || [], myEvents: events, attendingEvents: attending, mySurveys: surveys });
    };
    init();
  }, [user]);

  return {
    savedPlaces, myEvents, attendingEvents, mySurveys, isLoading,
    setMyEvents, refreshSurveys,
  };
}
