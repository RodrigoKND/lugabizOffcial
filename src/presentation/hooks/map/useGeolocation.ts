import MapLibreGL from "maplibre-gl";
import { useCallback, useState } from "react";

export function useGeolocation(
  map: MapLibreGL.Map | null,
  onLocate?: (coords: { longitude: number; latitude: number }) => void
) {
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const locate = useCallback(() => {
    setWaitingForLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
          map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, duration: 1500 });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setWaitingForLocation(false);
        }
      );
    }
  }, [map, onLocate]);

  return { waitingForLocation, locate };
}
