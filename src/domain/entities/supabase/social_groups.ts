export interface SocialGroupsRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  created_at: string;
}

export interface SocialGroupsInsert {
  id?: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  created_at?: string;
}

export interface SocialGroupsUpdate {
  id?: string;
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}
