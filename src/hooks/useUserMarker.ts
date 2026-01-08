import { useEffect } from "react";
import { useMap } from "@/components/ui/map";
import { UserPosition } from "@/types";

export const useUserMarker = (
  position: UserPosition | null,
  zoom: number = 15
) => {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) return;
    if (!position?.lat || !position?.lon) return;

    map.flyTo({
      center: [position.lon, position.lat],
      zoom,
      duration: 800,
      essential: true,
    });
  }, [map, isLoaded, position, zoom]);
};
