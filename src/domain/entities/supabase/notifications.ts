export interface NotificationsRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface NotificationsInsert {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read?: boolean;
  created_at?: string;
}

export interface NotificationsUpdate {
  id?: string;
  read?: boolean;
}
