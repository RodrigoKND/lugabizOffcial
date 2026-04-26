import { Review, CreateReviewData, UpdateReviewData } from '../entities';

export interface IReviewRepository {
  getReviewsForPlace(placeId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  addReview(data: CreateReviewData): Promise<Review>;
  updateReview(id: string, data: UpdateReviewData): Promise<Review>;
  deleteReview(id: string): Promise<void>;
}