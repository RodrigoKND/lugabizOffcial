import { createContext, useContext } from 'react';
import { AuthContextType, AuthProviderProps } from '@domain/entities/AuthContextTypes';
import { useAuthProvider } from '@presentation/hooks/auth/useAuthProvider';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const value = useAuthProvider();
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
