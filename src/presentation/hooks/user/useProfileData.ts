import { useState, useEffect } from 'react';
import { useAuth, usePlaces } from '@presentation/context';
import { Event, Place, MarketSurvey } from '@domain/entities';
import { marketSurveysService } from '@lib/supabase';

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
    } catch {}
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const init = async () => {
      setIsLoading(true);
      const [saved, events, attending] = await Promise.all([
        getSavedPlacesByUserId(user.id),
        getUserEvents(user.id),
        getEventsAttending(user.id),
      ]);
      if (saved) setSavedPlaces(saved);
      setMyEvents(events);
      setAttendingEvents(attending);
      try {
        const surveys = await marketSurveysService.getByUser(user.id);
        setMySurveys(surveys);
      } catch {}
      setIsLoading(false);
    };
    init();
  }, [user]);

  return {
    savedPlaces, myEvents, attendingEvents, mySurveys, isLoading,
    setMyEvents, refreshSurveys,
  };
}
