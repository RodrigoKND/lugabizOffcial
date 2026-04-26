import { Category, CreateCategoryData, UpdateCategoryData } from '../entities';

export interface ICategoryRepository {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(category: CreateCategoryData): Promise<Category>;
  updateCategory(id: string, updates: UpdateCategoryData): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}