export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface CreateCategoryData {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}