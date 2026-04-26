export interface IStorageRepository {
  uploadPlaceImage(file: File, placeId: string): Promise<string>;
  uploadUserAvatar(file: File, userId: string): Promise<string>;
  uploadEventCoverImage(file: File, eventId: string): Promise<string>;
  uploadMultipleImages(files: File[], folder: string): Promise<string[]>;
  deleteImage(filePath: string): Promise<void>;
  getImageUrl(filePath: string): string;
}