import { useState, useEffect } from 'react';
import { Place, PlaceFormData, Category, SocialGroup, Event } from '@domain/entities';
import { useAuth } from '@presentation/context';
import { placesService, categoriesService, socialGroupsService, reviewsService, eventsService } from '@lib/supabase';
import { realtimeService } from '@lib/supabase/services/notifications/websocket';
import { idbGet, idbSet } from '@lib/cache/idbCache';
import type { PlacesContextType } from '@domain/entities/PlacesContextTypes';

// Cuánto tiempo se considera "fresco" lo pintado desde IndexedDB antes de
// mostrar el spinner de carga en un reload. La revalidación en red se
// dispara SIEMPRE al montar, esto solo decide si se ve un loader o los
// datos de la última visita mientras esa revalidación corre en segundo plano.
const CACHE_TTL_MS = 5 * 60 * 1000;
const IDB_KEY_PLACES = 'home:places';
const IDB_KEY_EVENTS = 'home:events';
const IDB_KEY_CATEGORIES = 'home:categories';
const IDB_KEY_SOCIAL_GROUPS = 'home:socialGroups';

export function usePlacesProvider(): PlacesContextType {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [socialGroups, setSocialGroups] = useState<SocialGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reintentar cuando el usuario se autentica si los places no cargaron (ej. RLS anónimo)
  useEffect(() => {
    if (user && places.length === 0) loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    // Subscribe to all changes (INSERT, UPDATE, DELETE) for live sync
    const unsubPlaces = realtimeService.subscribeToTable('places', () => {
      refreshPlaces();
    });
    const unsubEvents = realtimeService.subscribeToTable('events', () => {
      refreshEvents();
    });
    const unsubReviews = realtimeService.subscribeToTable('reviews', () => {
      refreshPlaces();
    });
    return () => {
      unsubPlaces();
      unsubEvents();
      unsubReviews();
    };
  }, []);

  const loadInitialData = async () => {
    // 1) Pintar al instante con lo que quedó en IndexedDB de la última visita
    // (sobrevive a un F5, a diferencia de tenerlo solo en memoria). Si no hay
    // nada o expiró, seguimos mostrando el spinner mientras llega la red.
    const [cachedPlaces, cachedEvents, cachedCategories, cachedSocialGroups] = await Promise.all([
      idbGet<Place[]>(IDB_KEY_PLACES, CACHE_TTL_MS),
      idbGet<Event[]>(IDB_KEY_EVENTS, CACHE_TTL_MS),
      idbGet<Category[]>(IDB_KEY_CATEGORIES, CACHE_TTL_MS),
      idbGet<SocialGroup[]>(IDB_KEY_SOCIAL_GROUPS, CACHE_TTL_MS),
    ]);
    const hadCache = !!(cachedPlaces || cachedEvents || cachedCategories || cachedSocialGroups);
    if (cachedPlaces) setPlaces(cachedPlaces);
    if (cachedEvents) setEvents(cachedEvents);
    if (cachedCategories) setCategories(cachedCategories);
    if (cachedSocialGroups) setSocialGroups(cachedSocialGroups);
    if (hadCache) setIsLoading(false);

    // 2) Revalidar siempre contra Supabase (stale-while-revalidate). Esto NO
    // es opcional: garantiza que nunca se muestren datos desactualizados por
    // más de lo que tarda esta request, el caché solo evita la pantalla en
    // blanco mientras tanto.
    try {
      if (!hadCache) setIsLoading(true);
      const [placesResult, categoriesResult, socialGroupsResult, eventsResult] = await Promise.allSettled([
        placesService.getPlaces(),
        categoriesService.getCategories(),
        socialGroupsService.getSocialGroups(),
        eventsService.getEvents(),
      ]);
      if (placesResult.status === 'fulfilled') {
        setPlaces(placesResult.value);
        idbSet(IDB_KEY_PLACES, placesResult.value);
      }
      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
        idbSet(IDB_KEY_CATEGORIES, categoriesResult.value);
      } else console.error('Error loading categories:', categoriesResult.reason);
      if (socialGroupsResult.status === 'fulfilled') {
        setSocialGroups(socialGroupsResult.value);
        idbSet(IDB_KEY_SOCIAL_GROUPS, socialGroupsResult.value);
      } else console.error('Error loading social groups:', socialGroupsResult.reason);
      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value);
        idbSet(IDB_KEY_EVENTS, eventsResult.value);
      }
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
      idbSet(IDB_KEY_PLACES, placesData);
    } catch (error) {
      console.error('Error refreshing places:', error);
    }
  };

  const refreshEvents = async () => {
    try {
      const eventsData = await eventsService.getEvents();
      setEvents(eventsData);
      idbSet(IDB_KEY_EVENTS, eventsData);
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
        socialLinks: placeData.socialLinks,
      };

      await placesService.createPlace(createPlaceData);
      await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error adding place:', error);
      return false;
    }
  };

  const addEvent = async (eventData: Record<string, unknown>): Promise<Event | null> => {
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
        gallery: eventData.gallery || [],
        dateStart: eventData.dateStart,
        timeStart: eventData.timeStart,
        timeEnd: eventData.timeEnd,
        price: eventData.price,
        priceOptions: eventData.priceOptions,
        priceNote: eventData.priceNote,
        coupons: eventData.coupons,
        capacity: eventData.capacity,
        isFree: eventData.isFree,
        tags: eventData.tags || [],
        socialLinks: eventData.socialLinks,
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

  const addReview = async (placeId: string, rating: number | null, comment: string, parentId?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await reviewsService.addReview(placeId, user.id, rating as number, comment, parentId);
      // For top-level reviews refresh place rating; for replies skip (heavy full reload)
      if (!parentId) await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await reviewsService.updateReview(reviewId, rating, comment);
      await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await reviewsService.deleteReview(reviewId);
      await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
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

  return {
    places,
    events,
    categories,
    socialGroups,
    isLoading,
    addPlace,
    addReview,
    updateReview,
    deleteReview,
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
  };
}
