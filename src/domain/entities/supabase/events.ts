export interface EventsRow {
  id: string;
  name: string;
  description: string;
  address: string;
  category_id: string;
  image?: string;
  date_start: string;
  time_start: string;
  time_end?: string;
  price?: number;
  price_options?: { label: string; price: number; priceMax?: number }[];
  price_note?: string;
  coupons?: { code: string; description: string }[];
  capacity?: number;
  is_free?: boolean;
  tags?: string[];
  social_links?: { instagram?: string; tiktok?: string; facebook?: string; website?: string };
  coords: number[];
  user_id: string;
  attendees_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EventsInsert {
  id?: string;
  name: string;
  description: string;
  address: string;
  category_id: string;
  image?: string;
  date_start: string;
  time_start: string;
  time_end?: string;
  price?: number;
  price_options?: { label: string; price: number; priceMax?: number }[];
  price_note?: string;
  coupons?: { code: string; description: string }[];
  capacity?: number;
  is_free?: boolean;
  tags?: string[];
  social_links?: { instagram?: string; tiktok?: string; facebook?: string; website?: string };
  coords: number[];
  user_id: string;
  attendees_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventsUpdate {
  id?: string;
  name?: string;
  description?: string;
  address?: string;
  category_id?: string;
  image?: string;
  date_start?: string;
  time_start?: string;
  time_end?: string;
  price?: number;
  price_options?: { label: string; price: number; priceMax?: number }[];
  price_note?: string;
  coupons?: { code: string; description: string }[];
  capacity?: number;
  is_free?: boolean;
  tags?: string[];
  social_links?: { instagram?: string; tiktok?: string; facebook?: string; website?: string };
  coords?: number[];
  attendees_count?: number;
  updated_at?: string;
}

export interface EventAttendanceRow {
  id: string;
  event_id: string;
  user_id: string;
  shared_by?: string;
  confirmed: boolean;
  created_at: string;
}

export interface EventAttendanceInsert {
  id?: string;
  event_id: string;
  user_id: string;
  shared_by?: string;
  confirmed?: boolean;
  created_at?: string;
}

export interface EventAttendanceUpdate {
  id?: string;
  confirmed?: boolean;
  shared_by?: string;
}

export interface EventSharesRow {
  id: string;
  event_id: string;
  shared_by: string;
  shared_url: string;
  created_at: string;
}

export interface EventSharesInsert {
  id?: string;
  event_id: string;
  shared_by: string;
  shared_url: string;
  created_at?: string;
}

export interface EventSharesUpdate {
  id?: string;
}
