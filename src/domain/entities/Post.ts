export interface FlashOffer {
  title: string;
  description?: string;
  expiresAt: string;
  totalSlots?: number;
  claimedSlots: number;
  code?: string;
}

export interface PostReactionCounts {
  heart: number;
  fire: number;
  wow: number;
  clap: number;
}

export interface BusinessPost {
  id: string;
  userId: string;
  placeId?: string;
  businessName?: string;
  userAvatar?: string;
  images: string[];
  description: string;
  flashOffer?: FlashOffer;
  reactionsCount: PostReactionCounts;
  userReaction?: 'heart' | 'fire' | 'wow' | 'clap' | null;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostData {
  userId: string;
  placeId?: string;
  images: string[];
  description: string;
  flashOffer?: FlashOffer;
}
