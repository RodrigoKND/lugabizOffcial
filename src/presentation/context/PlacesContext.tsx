import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Place, PlaceFormData, Category, SocialGroup, Event } from '@domain/entities';
import { placesService, categoriesService, socialGroupsService, reviewsService, eventsService } from '@lib/supabase';
import { useAuth } from '@presentation/context';

interface PlacesContextType {
  places: Place[];
  events: Event[];
  categories: Category[];
  socialGroups: SocialGroup[];
  isLoading: boolean;
  addPlace: (placeData: PlaceFormData) => Promise<boolean>;
  addReview: (placeId: string, rating: number, comment: string) => Promise<boolean>;
  addEvent: (eventData: any) => Promise<Event | null>;
  getPlaceById: (id: string) => Place | undefined;
  getPlacesByCategory: (categoryId: string) => Place[];
  getTopPlaces: () => Place[];
  getRecentPlaces: (limit?: number) => Place[];
  searchPlaces: (query: string) => Place[];
  refreshPlaces: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  getLengthPlacesByUserId: (userId: string) => Place[];
  getLengthReviewsByUserId: (userId: string) => number;
  getSavedPlacesByUserId: (userId: string) => Promise<Place[] | []>;
  getUserEvents: (userId: string) => Event[];
  getEventsAttending: (userId: string) => Promise<Event[]>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}

export function PlacesProvider({ children }: PlacesProviderProps) {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [socialGroups, setSocialGroups] = useState<SocialGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [placesData, categoriesData, socialGroupsData, eventsData] = await Promise.all([
        placesService.getPlaces(),
        categoriesService.getCategories(),
        socialGroupsService.getSocialGroups(),
        eventsService.getEvents(),
      ]);
      setPlaces(placesData);
      setCategories(categoriesData);
      setSocialGroups(socialGroupsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPlaces = async () => {
    try {
      const placesData = await placesService.getPlaces();
      setPlaces(placesData);
    } catch (error) {
      console.error('Error refreshing places:', error);
    }
  };

  const refreshEvents = async () => {
    try {
      const eventsData = await eventsService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  };

  const addPlace = async (placeData: PlaceFormData): Promise<boolean> => {
    if (!user) return false;
    try {
      const createPlaceData = {
        name: placeData.name,
        description: placeData.description,
        address: placeData.address,
        categoryId: placeData.category,
        socialGroupIds: placeData.socialGroups,
        image: placeData.image,
        gallery: placeData.gallery,
        authorId: user.id,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        coords: placeData.latitude && placeData.longitude ? [placeData.latitude, placeData.longitude] : undefined,
        amenities: placeData.amenities,
      };

      await placesService.createPlace(createPlaceData);
      await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error adding place:', error);
      return false;
    }
  };

  const addEvent = async (eventData: any): Promise<Event | null> => {
    if (!user) return null;
    try {
      let imageUrl: string | undefined;
      if (eventData.image instanceof File) {
        imageUrl = await eventsService.uploadCoverImage(eventData.image);
      } else if (typeof eventData.image === 'string') {
        imageUrl = eventData.image;
      }

      const newEvent = await eventsService.createEvent({
        name: eventData.name,
        description: eventData.description,
        address: eventData.address,
        categoryId: eventData.categoryId,
        image: imageUrl,
        dateStart: eventData.dateStart,
        timeStart: eventData.timeStart,
        timeEnd: eventData.timeEnd,
        price: eventData.price,
        capacity: eventData.capacity,
        isFree: eventData.isFree,
        tags: eventData.tags || [],
        coords: eventData.coords || [],
        userId: user.id,
      });

      await refreshEvents();
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      return null;
    }
  };

  const addReview = async (placeId: string, rating: number, comment: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await reviewsService.addReview(placeId, user.id, rating, comment);
      await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  };

  const getPlaceById = (id: string) => places.find(place => place.id === id);

  const getPlacesByCategory = (categoryId: string) =>
    places.filter(place => place.category.id === categoryId);

  const getTopPlaces = () =>
    [...places].sort((a, b) => (b.savedCount || 0) - (a.savedCount || 0)).slice(0, 6);

  const getRecentPlaces = (limit: number = 15) =>
    [...places].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);

  const searchPlaces = (query: string) => {
    if (!query.trim()) return [];
    const lowercaseQuery = query.toLowerCase();
    return places.filter(place =>
      place.name.toLowerCase().includes(lowercaseQuery) ||
      place.description.toLowerCase().includes(lowercaseQuery) ||
      place.address.toLowerCase().includes(lowercaseQuery) ||
      place.category.name.toLowerCase().includes(lowercaseQuery) ||
      place.socialGroups.some(group =>
        group.name.toLowerCase().includes(lowercaseQuery) ||
        group.description.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const getLengthPlacesByUserId = (userId: string) =>
    places.filter(place => place.authorId === userId);

  const getLengthReviewsByUserId = (userId: string) =>
    places.reduce((count, place) => {
      return count + (place?.reviews?.filter(review => review.userId === userId).length || 0);
    }, 0);

  const getSavedPlacesByUserId = async (userId: string): Promise<Place[] | []> => {
    try {
      return await placesService.getSavedPlacesByUserId(userId);
    } catch (error) {
      console.error('Error getting saved places by user id:', error);
      return [];
    }
  };

  const getUserEvents = (userId: string) =>
    events.filter(event => event.userId === userId);

  const getEventsAttending = async (userId: string): Promise<Event[]> => {
    try {
      return await eventsService.getEventsAttending(userId);
    } catch (error) {
      console.error('Error getting attending events:', error);
      return [];
    }
  };

  return (
    <PlacesContext.Provider
      value={{
        places,
        events,
        categories,
        socialGroups,
        isLoading,
        addPlace,
        addReview,
        addEvent,
        getPlaceById,
        getPlacesByCategory,
        getTopPlaces,
        getRecentPlaces,
        searchPlaces,
        refreshPlaces,
        refreshEvents,
        getLengthPlacesByUserId,
        getLengthReviewsByUserId,
        getSavedPlacesByUserId,
        getUserEvents,
        getEventsAttending,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
}

interface PlacesProviderProps {
  children: ReactNode;
}
