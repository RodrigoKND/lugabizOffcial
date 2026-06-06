import { ReactNode } from 'react';
import { User } from '@domain/entities';
import { AppNotification } from '@domain/entities';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  isLoading: boolean;
  savedPlaces: string[];
  toggleSavedPlace: (placeId: string) => void;
  isSaved: (placeId: string) => boolean;
  isNewUser: boolean;
  showPreferences: boolean;
  setShowPreferences: (v: boolean) => void;
  isAdmin: boolean;
  resendConfirmation: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  notifications: AppNotification[];
  unreadCount: number;
  markNotifAsRead: (id: string) => Promise<void>;
  markAllNotifsAsRead: () => Promise<void>;
  banInfo: { reason: string } | null;
  dismissBan: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}
