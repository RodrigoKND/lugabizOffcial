export * from './placesTransform';
export * from './places';
export * from './placesSearch';

import { getPlaces, getPlaceById, createPlace, updatePlace, deletePlace, uploadImageSupabase } from './places';
import { getPlacesByCategory, getTopPlaces, getRecentPlaces, searchPlaces, getSavedPlacesByUserId } from './placesSearch';
import { transformPlaceData } from './placesTransform';

export const placesService = {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  uploadImageSupabase,
  getPlacesByCategory,
  getTopPlaces,
  getRecentPlaces,
  searchPlaces,
  getSavedPlacesByUserId,
  transformPlaceData,
};
