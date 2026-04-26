import { Place, CreatePlaceData, UpdatePlaceData } from '../entities';

export interface IPlaceRepository {
  getPlaces(): Promise<Place[]>;
  getPlaceById(id: string): Promise<Place | null>;
  getPlacesByCategory(categoryId: string): Promise<Place[]>;
  getTopPlaces(limit?: number): Promise<Place[]>;
  getRecentPlaces(limit?: number): Promise<Place[]>;
  searchPlaces(query: string): Promise<Place[]>;
  createPlace(placeData: CreatePlaceData): Promise<Place>;
  updatePlace(id: string, updates: UpdatePlaceData): Promise<Place>;
  deletePlace(id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
  getSavedPlacesByUserId(userId: string): Promise<Place[] | []>;
}