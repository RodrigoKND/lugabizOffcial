export interface PlacesRow {
  id: string;
  name: string;
  description: string;
  address: string;
  category_id: string;
  image?: string;
  rating: number;
  review_count: number;
  featured: boolean;
  author_id: string;
  saved_count: number;
  latitude?: number;
  longitude?: number;
  coords?: number[];
  amenities?: string[];
  gallery?: string[];
  views_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PlacesInsert {
  id?: string;
  name: string;
  description: string;
  address: string;
  category_id: string;
  image?: string;
  rating?: number;
  review_count?: number;
  featured?: boolean;
  author_id: string;
  saved_count?: number;
  latitude?: number;
  longitude?: number;
  coords?: number[];
  amenities?: string[];
  gallery?: string[];
  views_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlacesUpdate {
  id?: string;
  name?: string;
  description?: string;
  address?: string;
  category_id?: string;
  image?: string;
  rating?: number;
  review_count?: number;
  featured?: boolean;
  saved_count?: number;
  latitude?: number;
  longitude?: number;
  coords?: number[];
  amenities?: string[];
  gallery?: string[];
  views_count?: number;
  updated_at?: string;
}

export interface PlaceSocialGroupsRow {
  id: string;
  place_id: string;
  social_group_id: string;
  created_at: string;
}

export interface PlaceSocialGroupsInsert {
  id?: string;
  place_id: string;
  social_group_id: string;
  created_at?: string;
}

export interface PlaceSocialGroupsUpdate {
  id?: string;
  place_id?: string;
  social_group_id?: string;
}

export interface SavedPlacesRow {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
}

export interface SavedPlacesInsert {
  id?: string;
  user_id: string;
  place_id: string;
  created_at?: string;
}

export interface SavedPlacesUpdate {
  id?: string;
}

export interface PlaceSurveysRow {
  id: string;
  user_id: string;
  place_id: string;
  is_nearby: boolean;
  rating?: number;
  would_recommend?: boolean;
  comment?: string;
  created_at: string;
}

export interface PlaceSurveysInsert {
  id?: string;
  user_id: string;
  place_id: string;
  is_nearby: boolean;
  rating?: number;
  would_recommend?: boolean;
  comment?: string;
  created_at?: string;
}

export interface PlaceSurveysUpdate {
  id?: string;
  rating?: number;
  would_recommend?: boolean;
  comment?: string;
}
