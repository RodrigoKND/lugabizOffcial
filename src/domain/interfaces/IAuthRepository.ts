import { User, CreateUserData, UpdateUserData } from '../entities';

export interface IAuthRepository {
  signUp(name: string, email: string, password: string): Promise<any>;
  resendConfirmation(email: string): Promise<boolean>;
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<any>;
  getUserProfile(userId: string): Promise<User>;
  createUserProfile(userId: string, data: CreateUserData): Promise<void>;
  updateUserProfile(userId: string, updates: UpdateUserData): Promise<any>;
  updateAvatar(userId: string, file: File): Promise<string>;
}