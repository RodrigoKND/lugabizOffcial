import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Place, PlaceFormData, Category, SocialGroup } from '@/domain/entities';
import { placesService, categoriesService, socialGroupsService, reviewsService } from '@/lib/supabase';
import { useAuth } from '@/presentation/context/AuthContext';

interface PlacesContextType {
  places: Place[];
  categories: Category[];
  socialGroups: SocialGroup[];
  isLoading: boolean;
  addPlace: (placeData: PlaceFormData) => Promise<boolean>;
  addReview: (placeId: string, rating: number, comment: string) => Promise<boolean>;
  getPlaceById: (id: string) => Place | undefined;
  getPlacesByCategory: (categoryId: string) => Place[];
  getTopPlaces: () => Place[];
  getRecentPlaces: (limit?: number) => Place[];
  searchPlaces: (query: string) => Place[];
  refreshPlaces: () => Promise<void>;
  getLengthPlacesByUserId: (userId: string) => Place[];
  getLengthReviewsByUserId: (userId: string) => number;
  getSavedPlacesByUserId: (userId: string) => Promise<Place[] | []>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}

interface PlacesProviderProps {
  children: ReactNode;
}

export function PlacesProvider({ children }: PlacesProviderProps) {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [socialGroups, setSocialGroups] = useState<SocialGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [placesData, categoriesData, socialGroupsData] = await Promise.all([
        placesService.getPlaces(),
        categoriesService.getCategories(),
        socialGroupsService.getSocialGroups()
      ]);
      setPlaces(placesData);
      setCategories(categoriesData);
      setSocialGroups(socialGroupsData);
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

  const addPlace = async (placeData: PlaceFormData): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const imageUrl = placeData.image 
        ? await placesService.uploadImageSupabase(placeData.image)
        : undefined;

      const createPlaceData = {
        name: placeData.name,
        description: placeData.description,
        address: placeData.address,
        categoryId: placeData.category,
        socialGroupIds: placeData.socialGroups,
        image: imageUrl,
        authorId: user.id,
      };

      await placesService.createPlace(createPlaceData);
      await refreshPlaces();
      return true;
    } catch (error) {
      console.error('Error adding place:', error);
      return false;
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
    places
      .sort((a, b) => (b.savedCount || 0) - (a.savedCount || 0))
      .slice(0, 6);

  const getRecentPlaces = (limit: number = 15) =>
    places
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

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
  
  return (
    <PlacesContext.Provider
      value={{
        places,
        categories,
        socialGroups,
        isLoading,
        addPlace,
        addReview,
        getPlaceById,
        getPlacesByCategory,
        getTopPlaces,
        getRecentPlaces,
        searchPlaces,
        refreshPlaces,
        getLengthPlacesByUserId,
        getLengthReviewsByUserId,
        getSavedPlacesByUserId,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
}