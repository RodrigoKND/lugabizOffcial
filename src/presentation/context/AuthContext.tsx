import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@domain/entities';
import { authService, savedPlacesService } from '@lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  isLoading: boolean;
  savedPlaces: string[];
  toggleSavedPlace: (placeId: string) => void;
  isSaved: (placeId: string) => boolean;
  isNewUser: boolean;
  resendConfirmation: (email: string) => Promise<boolean>;
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const userProfile = await authService.getUserProfile(currentUser.id);
          setUser(userProfile);

          const userSavedPlaces = await savedPlacesService.getSavedPlaces(currentUser.id);
          setSavedPlaces(userSavedPlaces);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { user: authUser } = await authService.signIn(email, password);
      if (authUser) {
        const userProfile = await authService.getUserProfile(authUser.id);
        setUser(userProfile);

        const userSavedPlaces = await savedPlacesService.getSavedPlaces(authUser.id);
        setSavedPlaces(userSavedPlaces);

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

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean }> => {
    setIsLoading(true);

    try {
      const { user: authUser } = await authService.signUp(name, email, password);
      setIsLoading(false);

      if (!authUser) return { success: false };
      
      if (!authUser.email_confirmed_at) {
        window.location.href = "/confirmation";
        return { success: true };
      }
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false };
    }
  };

  const resendConfirmation = async (email: string): Promise<boolean> => {
    try {
      const result = await authService.resendConfirmation(email);
      return result;
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
        newIsSaved
          ? [...prev, placeId]
          : prev.filter(id => id !== placeId)
      );
    } catch (error) {
      console.error('Error toggling saved place:', error);
    }
  };

  const isSaved = (placeId: string) => savedPlaces.includes(placeId);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        savedPlaces,
        toggleSavedPlace,
        isSaved,
        isNewUser,
        resendConfirmation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}