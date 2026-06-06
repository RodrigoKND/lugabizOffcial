export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  parentId?: string;
  createdAt: Date;
  replies?: Review[];
  replyCount?: number;
}

export interface CreateReviewData {
  placeId: string;
  userId: string;
  rating: number;
  comment: string;
  parentId?: string;
}

export interface UpdateReviewData {
  rating: number;
  comment: string;
}