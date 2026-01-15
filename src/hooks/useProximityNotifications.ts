import { useEffect, useRef, useState } from "react";
import { OverpassElement } from "@/types";
import type { GeoPosition } from "@/hooks/useGeolocation";

// Calcular distancia entre dos puntos
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Emojis por categoría
const getEmoji = (place: OverpassElement): string => {
  const amenity = place.tags?.amenity;
  const tourism = place.tags?.tourism;

  if (amenity === "restaurant") return "🍽️";
  if (amenity === "cafe") return "☕";
  if (amenity === "bar" || amenity === "pub") return "🍺";
  if (amenity === "fast_food") return "🍕";
  if (amenity === "ice_cream") return "🍦";
  if (tourism === "museum" || tourism === "gallery") return "🏛️";
  if (tourism === "attraction" || tourism === "artwork") return "🎨";
  
  return "📍";
};

interface NearbyPlace {
  emoji: string;
  name: string;
  distance: number;
  place: OverpassElement;
}

export const useProximityNotifications = (
  position: GeoPosition | null,
  places: OverpassElement[]
) => {
  const [nearbyPlace, setNearbyPlace] = useState<NearbyPlace | null>(null);
  const notifiedPlaces = useRef<Set<string>>(new Set());
  const lastCheck = useRef<number>(0);

  useEffect(() => {
    if (!position || places.length === 0) return;

    const now = Date.now();
    
    // Solo revisar cada 15 segundos
    if (now - lastCheck.current < 15000) return;
    
    lastCheck.current = now;

    // Buscar lugar más cercano (menos de 100m)
    const nearby = places.find((place) => {
      if (!place.lat || !place.lon || !place.tags?.name) return false;
      
      // Si ya notificamos este lugar, ignorar
      if (notifiedPlaces.current.has(String(place.id))) return false;

      const distance = getDistance(
        position.lat,
        position.lon,
        place.lat,
        place.lon
      );

      return distance <= 100;
    });

    if (nearby) {
      const distance = Math.round(
        getDistance(position.lat, position.lon, nearby.lat!, nearby.lon!)
      );

      const emoji = getEmoji(nearby);
      const name = nearby.tags!.name;

      // Mostrar notificación
      setNearbyPlace({ emoji, name, distance, place: nearby });
      
      // Marcar como notificado
      notifiedPlaces.current.add(String(nearby.id));
      
      // Auto-cerrar después de 5 segundos
      setTimeout(() => setNearbyPlace(null), 5000);
      
      // Permitir notificar nuevamente después de 10 minutos
      setTimeout(() => {
        notifiedPlaces.current.delete(String(nearby.id));
      }, 10 * 60 * 1000);
    }
  }, [position, places]);

  const closeNotification = () => setNearbyPlace(null);

  return {
    nearbyPlace,
    closeNotification,
    notifiedCount: notifiedPlaces.current.size
  };
};