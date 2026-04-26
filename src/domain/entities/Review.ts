export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreateReviewData {
  placeId: string;
  userId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating: number;
  comment: string;
}