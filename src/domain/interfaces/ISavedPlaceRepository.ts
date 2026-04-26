export interface ISavedPlaceRepository {
  getSavedPlaces(userId: string): Promise<string[]>;
  savePlace(userId: string, placeId: string): Promise<void>;
  unsavePlace(userId: string, placeId: string): Promise<void>;
  toggleSavePlace(userId: string, placeId: string): Promise<boolean>;
  isPlaceSaved(userId: string, placeId: string): Promise<boolean>;
  getUsersWhoSavedPlace(placeId: string): Promise<any[]>;
  getSavedPlacesWithData(userId: string): Promise<any[]>;
}