export interface AppNotification {
  id: string;
  userId: string;
<<<<<<< HEAD
  type: 'nearby' | 'event_invite' | 'new_place' | 'new_review' | 'survey' | 'system' | 'owner_announcement';
=======
  type: 'nearby' | 'event_invite' | 'new_place' | 'new_review' | 'survey' | 'system';
>>>>>>> main
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export interface PlaceSurvey {
  id: string;
  userId: string;
  placeId: string;
  isNearby: boolean;
  rating?: number;
  wouldRecommend?: boolean;
  comment?: string;
  createdAt: Date;
}

export interface NearbyPlace {
  name: string;
  distance: number;
  lat: number;
  lon: number;
}
