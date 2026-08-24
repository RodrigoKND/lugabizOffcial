import { useMemo } from 'react';

export function useStoredCoords() {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem('_lugabiz_last_pos');
      if (!raw) return { lat: undefined, lng: undefined };
      const { lat, lng } = JSON.parse(raw);
      return { lat: lat as number | undefined, lng: lng as number | undefined };
    } catch {
      return { lat: undefined, lng: undefined };
    }
  }, []);
}
