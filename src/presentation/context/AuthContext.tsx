import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '@domain/entities';
import { authService, savedPlacesService, notificationsService } from '@lib/supabase';
import { AppNotification } from '@domain/entities';
import { tracking } from '@infrastructure/utils/tracking';

interface AuthContextType {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const userProfile = await authService.getUserProfile(currentUser.id);
          setUser(userProfile);

          const role = await authService.getUserRole(currentUser.id);
          setIsAdmin(role === 'admin');

          const userSavedPlaces = await savedPlacesService.getSavedPlaces(currentUser.id);
          setSavedPlaces(userSavedPlaces);

          const userNotifs = await notificationsService.getNotifications(currentUser.id);
          setNotifications(userNotifs);
          setUnreadCount(userNotifs.filter(n => !n.read).length);

          if (tracking.isNewUserRegistration()) {
            setShowPreferences(true);
            tracking.markRegistered();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = notificationsService.subscribeToNotifications(user.id, (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return unsubscribe;
  }, [user]);

  const loadUserData = async (userId: string) => {
    const userProfile = await authService.getUserProfile(userId);
    setUser(userProfile);
    try {
      const role = await authService.getUserRole(userId);
      setIsAdmin(role === 'admin');
    } catch (e) {
      console.error('Error loading role:', e);
    }
    try {
      const userSavedPlaces = await savedPlacesService.getSavedPlaces(userId);
      setSavedPlaces(userSavedPlaces);
    } catch (e) {
      console.error('Error loading saved places:', e);
    }
    try {
      const userNotifs = await notificationsService.getNotifications(userId);
      setNotifications(userNotifs);
      setUnreadCount(userNotifs.filter(n => !n.read).length);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: authUser } = await authService.signIn(email, password);
      if (authUser) {
        await loadUserData(authUser.id);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const data = await authService.signInWithGoogle();
      return !!data;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean }> => {
    setIsLoading(true);
    try {
      const { user: authUser } = await authService.signUp(name, email, password);
      setIsLoading(false);
      if (!authUser) return { success: false };
      if (!authUser.email_confirmed_at) {
        window.location.href = '/confirmation';
        return { success: true };
      }
      tracking.trackAction('register', { userId: authUser.id });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false };
    }
  };

  const resendConfirmation = async (email: string): Promise<boolean> => {
    try {
      return await authService.resendConfirmation(email);
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSavedPlaces([]);
      setIsNewUser(false);
      setIsAdmin(false);
      setNotifications([]);
      setUnreadCount(0);
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSavedPlace = async (placeId: string) => {
    if (!user) return;
    try {
      const newIsSaved = await savedPlacesService.toggleSavePlace(user.id, placeId);
      setSavedPlaces(prev =>
        newIsSaved ? [...prev, placeId] : prev.filter(id => id !== placeId)
      );
    } catch (error) {
      console.error('Error toggling saved place:', error);
    }
  };

  const isSaved = (placeId: string) => savedPlaces.includes(placeId);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const updated = await authService.updateUserProfile(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updated } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, [user]);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const url = await authService.uploadAvatar(user.id, file);
      setUser(prev => prev ? { ...prev, avatar: url } : null);
      return url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }, [user]);

  const markNotifAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotifsAsRead = async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        isLoading,
        savedPlaces,
        toggleSavedPlace,
        isSaved,
        isNewUser,
        showPreferences,
        setShowPreferences,
        isAdmin,
        resendConfirmation,
        updateProfile,
        uploadAvatar,
        notifications,
        unreadCount,
        markNotifAsRead,
        markAllNotifsAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


