export * from './reviews';
export * from './reviewsStats';

import { addReview, updateReview, deleteReview, getReviewsForPlace, getReviewsByUser, getReplies, getCountForPlace } from './reviews';
import { updatePlaceRating } from './reviewsStats';

export const reviewsService = {
  addReview,
  updateReview,
  deleteReview,
  getReviewsForPlace,
  getReviewsByUser,
  getReplies,
  getCountForPlace,
  updatePlaceRating,
};
