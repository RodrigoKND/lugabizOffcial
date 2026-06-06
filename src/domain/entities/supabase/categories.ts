export interface CategoriesRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  created_at: string;
}

export interface CategoriesInsert {
  id?: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  created_at?: string;
}

export interface CategoriesUpdate {
  id?: string;
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}
