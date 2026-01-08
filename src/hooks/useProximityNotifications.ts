import { useEffect, useRef, useState } from "react";
import { OverpassElement } from "@/types";
import type { GeoPosition } from "@/hooks/useGeolocation";

interface ProximityConfig {
  radiusMeters: number;
  cooldownMinutes: number;
  maxNotificationsPerHour: number;
}

const DEFAULT_CONFIG: ProximityConfig = {
  radiusMeters: 100, // 100 metros de proximidad
  cooldownMinutes: 30, // No notificar el mismo lugar por 30 min
  maxNotificationsPerHour: 3, // Máximo 3 notificaciones por hora
};

interface NotificationRecord {
  placeId: string;
  timestamp: number;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Radio de la Tierra en metros
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

const getPlaceEmoji = (place: OverpassElement): string => {
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

export const useProximityNotifications = (
  position: GeoPosition | null,
  places: OverpassElement[],
  config: Partial<ProximityConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const notificationHistory = useRef<NotificationRecord[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const lastCheckTime = useRef<number>(0);

  // Solicitar permisos una sola vez
  useEffect(() => {
    const requestPermission = async () => {
      if ("Notification" in window && Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        setPermissionGranted(permission === "granted");
      } else if (Notification.permission === "granted") {
        setPermissionGranted(true);
      }
    };

    requestPermission();
  }, []);

  // Limpiar historial antiguo cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      
      notificationHistory.current = notificationHistory.current.filter(
        (record) => record.timestamp > oneHourAgo
      );
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Verificar proximidad
  useEffect(() => {
    if (!position || !permissionGranted || places.length === 0) return;

    const now = Date.now();
    
    // Throttle: solo verificar cada 10 segundos
    if (now - lastCheckTime.current < 10000) return;
    lastCheckTime.current = now;

    // Contar notificaciones en la última hora
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentNotifications = notificationHistory.current.filter(
      (record) => record.timestamp > oneHourAgo
    );

    if (recentNotifications.length >= finalConfig.maxNotificationsPerHour) {
      return;
    }

    // Encontrar lugares cercanos
    const nearbyPlaces = places.filter((place) => {
      if (!place.lat || !place.lon) return false;

      const distance = calculateDistance(
        position.lat,
        position.lon,
        place.lat,
        place.lon
      );

      // Verificar cooldown
      const cooldownMs = finalConfig.cooldownMinutes * 60 * 1000;
      const lastNotification = notificationHistory.current.find(
        (record) => record.placeId === String(place.id)
      );

      if (lastNotification && now - lastNotification.timestamp < cooldownMs) {
        return false;
      }

      return distance <= finalConfig.radiusMeters;
    });

    // Notificar solo el lugar más cercano si hay varios
    if (nearbyPlaces.length > 0) {
      const closest = nearbyPlaces.reduce((prev, curr) => {
        const prevDist = calculateDistance(
          position.lat,
          position.lon,
          prev.lat!,
          prev.lon!
        );
        const currDist = calculateDistance(
          position.lat,
          position.lon,
          curr.lat!,
          curr.lon!
        );
        return currDist < prevDist ? curr : prev;
      });

      const emoji = getPlaceEmoji(closest);
      const placeName = closest.tags?.name || "un lugar interesante";

      new Notification(`${emoji} ${placeName}`, {
        body: `Estás cerca de ${placeName}. ¡Descúbrelo!`,
        icon: "/L.ico",
        tag: `place-${closest.id}`,
        requireInteraction: false,
      });

      notificationHistory.current.push({
        placeId: String(closest.id),
        timestamp: now,
      });
    }
  }, [position, places, permissionGranted, finalConfig]);

  return {
    permissionGranted,
    notificationCount: notificationHistory.current.length,
  };
};