import { useEffect, useRef, useCallback } from 'react';
import { useMap } from '@/components/ui/map';
import { METTERS } from '@/static/data/metters';
import type { GeoPosition } from '@/hooks/useGeolocation';

interface MapControllerProps {
  position: GeoPosition | null;
  selectedDistance: number;
}

const MapController: React.FC<MapControllerProps> = ({ position, selectedDistance }) => {
  const { map, isLoaded } = useMap();
  const hasInitialized = useRef(false);
  const lastPosition = useRef<GeoPosition | null>(null);
  const lastDistance = useRef<number | null>(null);

  const metersToZoom = useCallback((meters: number) => {
    return (
      [...METTERS].reverse().find((m) => m.metters <= meters)?.zoom ?? 13
    );
  }, []);

  useEffect(() => {
    if (!map || !isLoaded || !position?.lat || !position?.lon) return;

    const positionChanged =
      !lastPosition.current ||
      Math.abs(lastPosition.current.lat - position.lat) > 0.001 ||
      Math.abs(lastPosition.current.lon - position.lon) > 0.001;

    const distanceChanged = lastDistance.current !== selectedDistance;

    if (!hasInitialized.current || positionChanged || distanceChanged) {
      map.flyTo({
        center: [position.lon, position.lat],
        zoom: metersToZoom(selectedDistance),
        duration: hasInitialized.current ? 800 : 0,
      });

      hasInitialized.current = true;
      lastPosition.current = { lat: position.lat, lon: position.lon };
      lastDistance.current = selectedDistance;
    }
  }, [map, isLoaded, position, selectedDistance, metersToZoom]);

  return null;
};

export default MapController;