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
  capacity?: number;
  is_free?: boolean;
  tags?: string[];
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
  capacity?: number;
  is_free?: boolean;
  tags?: string[];
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
  capacity?: number;
  is_free?: boolean;
  tags?: string[];
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
