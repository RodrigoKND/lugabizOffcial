import { createContext, useContext } from 'react';
import type { PlacesContextType, PlacesProviderProps } from '@domain/entities/PlacesContextTypes';
import { usePlacesProvider } from '@presentation/hooks/places/usePlacesProvider';

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}

export function PlacesProvider({ children }: PlacesProviderProps) {
  const value = usePlacesProvider();
  return (
    <PlacesContext.Provider value={value}>
      {children}
    </PlacesContext.Provider>
  );
}
