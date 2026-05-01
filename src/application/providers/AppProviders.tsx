import { AuthProvider } from '@presentation/context/AuthContext';
import { PlacesProvider } from '@presentation/context/PlacesContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <PlacesProvider>
        {children}
      </PlacesProvider>
    </AuthProvider>
  );
}