import { useEffect, useRef, useState } from "react";
import type { OverpassElement, GeoPosition, NearbyPlace } from "@/domain/entities";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

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

export function useProximityNotifications(
  position: GeoPosition | null,
  places: OverpassElement[]
) {
  const [nearbyPlace, setNearbyPlace] = useState<NearbyPlace | null>(null);
  const notifiedPlaces = useRef<Set<string>>(new Set());
  const lastCheck = useRef<number>(0);

  useEffect(() => {
    if (!position || places.length === 0) return;

    const now = Date.now();
    if (now - lastCheck.current < 15000) return;
    lastCheck.current = now;

    const nearby = places.find((place) => {
      if (!place.lat || !place.lon || !place.tags?.name) return false;
      if (notifiedPlaces.current.has(String(place.id))) return false;

      const distance = getDistance(position.lat, position.lon, place.lat, place.lon);
      return distance <= 100;
    });

    if (nearby) {
      const distance = Math.round(
        getDistance(position.lat, position.lon, nearby.lat!, nearby.lon!)
      );

      const emoji = getEmoji(nearby);
      const name = nearby.tags!.name;

      setNearbyPlace({ emoji, name, distance, place: nearby });
      notifiedPlaces.current.add(String(nearby.id));
      
      setTimeout(() => setNearbyPlace(null), 5000);
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
}