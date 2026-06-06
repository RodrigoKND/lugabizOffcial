export interface ReviewsRow {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewsInsert {
  id?: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewsUpdate {
  id?: string;
  rating?: number;
  comment?: string;
  updated_at?: string;
}
