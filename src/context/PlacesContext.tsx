import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Place, PlaceFormData } from '../types';
import { placesService, categoriesService, socialGroupsService, reviewsService } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface PlacesContextType {
  places: Place[];
  categories: any[];
  socialGroups: any[];
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
  getLengthReviewsByUserId:(userId: string) => number;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export const usePlaces = () => {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
};

interface PlacesProviderProps {
  children: ReactNode;
}

export const PlacesProvider: React.FC<PlacesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [socialGroups, setSocialGroups] = useState<any[]>([]);
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
      const createPlaceData = {
        name: placeData.name,
        description: placeData.description,
        address: placeData.address,
        categoryId: placeData.category,
        socialGroupIds: placeData.socialGroups,
        image: placeData.image ? await uploadImage(placeData.image) : undefined,
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

  const uploadImage = async (file: File): Promise<string> => {
    const images = await placesService.uploadImageSupabase(file);
    console.log(images)
    return images
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

  const getPlaceById = (id: string) => {
    return places.find(place => place.id === id);
  };

  const getPlacesByCategory = (categoryId: string) => {
    return places.filter(place => place.category.id === categoryId);
  };

  const getTopPlaces = () => {
    return places
      .sort((a, b) => (b.savedCount || 0) - (a.savedCount || 0))
      .slice(0, 6);
  };

  const getRecentPlaces = (limit: number = 15) => {
    return places
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  };

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

  const getLengthPlacesByUserId = (userId: string) => {
    return places.filter(place => place.authorId === userId);
  };

  const getLengthReviewsByUserId = (userId: string) => {
    return places.reduce((count, place) => {
      return count + (place?.reviews?.filter(review => review.userId === userId).length || 0);
    }, 0);
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
        getLengthReviewsByUserId
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};