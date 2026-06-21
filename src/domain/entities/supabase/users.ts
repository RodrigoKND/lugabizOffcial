export interface UsersRow {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  is_owner?: boolean;
  owner_business_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UsersInsert {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  is_owner?: boolean;
  owner_business_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsersUpdate {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  is_owner?: boolean;
  owner_business_name?: string;
  updated_at?: string;
}

export interface UserRolesRow {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface UserRolesInsert {
  id?: string;
  user_id: string;
  role: string;
  created_at?: string;
}

export interface UserRolesUpdate {
  id?: string;
  role?: string;
}

export interface PushSubscriptionsRow {
  id: string;
  user_id: string;
  endpoint: string | null;
  subscription: Record<string, unknown>;
  created_at: string;
}

export interface PushSubscriptionsInsert {
  id?: string;
  user_id: string;
  endpoint?: string | null;
  subscription: Record<string, unknown>;
  created_at?: string;
}

export interface PushSubscriptionsUpdate {
  id?: string;
  user_id?: string;
  endpoint?: string | null;
  subscription?: Record<string, unknown>;
}
