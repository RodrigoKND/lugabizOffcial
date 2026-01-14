import { useEffect, useRef, useState, useCallback } from "react";
import { OverpassElement } from "@/types";
import type { GeoPosition } from "@/hooks/useGeolocation";
import { createNotification, ExtendedNotificationOptions } from "@/types/notification.types";

interface ProximityConfig {
  radiusMeters: number;
  cooldownMinutes: number;
  maxNotificationsPerHour: number;
}

const DEFAULT_CONFIG: ProximityConfig = {
  radiusMeters: 1000,
  cooldownMinutes: 30,
  maxNotificationsPerHour: 5,
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

const categoryPlaces = [
  { amenity: "restaurant", emoji: "🍽️" },
  { amenity: "cafe", emoji: "☕" },
  { amenity: "bar", emoji: "🍺" },
  { amenity: "pub", emoji: "🍺" },
  { amenity: "fast_food", emoji: "🍕" },
  { amenity: "ice_cream", emoji: "🍦" },
  { tourism: "museum", emoji: "🏛️" },
  { tourism: "gallery", emoji: "🏛️" },
  { tourism: "attraction", emoji: "🎨" },
  { tourism: "artwork", emoji: "🎨" },
  { tourism: "hotel", emoji: "🏨" },
  { shop: "mall", emoji: "🛍️" }
];

const getPlaceEmoji = (place: OverpassElement): string => {
  const amenity = place.tags?.amenity;
  const tourism = place.tags?.tourism;
  const shop = place.tags?.shop;

  // CORRECCIÓN: forEach no retorna valores, usar find
  const category = categoryPlaces.find(cat => 
    cat.amenity === amenity || 
    cat.tourism === tourism || 
    cat.shop === shop
  );
  
  return category?.emoji || "📍";
};

export const useProximityNotifications = (
  position: GeoPosition | null,
  places: OverpassElement[],
  config: Partial<ProximityConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const notificationHistory = useRef<NotificationRecord[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastCheckTime = useRef<number>(0);
  const isCheckingRef = useRef(false);

  // Solicitar permisos
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("Este navegador no soporta notificaciones");
      return false;
    }

    if (Notification.permission === "granted") {
      setPermissionGranted(true);
      return true;
    }

    if (Notification.permission === "denied") {
      setPermissionDenied(true);
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setPermissionGranted(true);
        return true;
      } else {
        setPermissionDenied(true);
        return false;
      }
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      return false;
    }
  }, []);

  // Solicitar permisos al montar
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Limpiar historial antiguo
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
    // Validaciones iniciales
    if (!position || !permissionGranted || places.length === 0) return;
    if (isCheckingRef.current) return; // Prevenir ejecución concurrente

    const now = Date.now();
    
    // Throttle: solo verificar cada 10 segundos
    if (now - lastCheckTime.current < 10000) return;
    
    isCheckingRef.current = true;
    lastCheckTime.current = now;

    try {
      // Contar notificaciones recientes
      const oneHourAgo = now - 60 * 60 * 1000;
      const recentNotifications = notificationHistory.current.filter(
        (record) => record.timestamp > oneHourAgo
      );

      if (recentNotifications.length >= finalConfig.maxNotificationsPerHour) {
        return;
      }

      const cooldownMs = finalConfig.cooldownMinutes * 60 * 1000;

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
        const lastNotification = notificationHistory.current.find(
          (record) => record.placeId === String(place.id)
        );

        if (lastNotification && now - lastNotification.timestamp < cooldownMs) {
          return false;
        }

        return distance <= finalConfig.radiusMeters;
      });

      // Notificar solo el lugar más cercano
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
        const distance = Math.round(
          calculateDistance(
            position.lat,
            position.lon,
            closest.lat!,
            closest.lon!
          )
        );

        // CORRECCIÓN: Variable mal nombrada y paréntesis extra
        const notificationOptions: ExtendedNotificationOptions = {
          body: `Estás a ${distance}m de ${placeName}. ¡Descúbrelo!`,
          icon: "/L.ico",
          badge: "/L.ico",
          tag: `place-${closest.id}`,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
        };

        const notification = createNotification(`${emoji} ${placeName}`, notificationOptions);

        // Agregar evento click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-cerrar después de 5 segundos
        setTimeout(() => notification.close(), 5000);

        // CORRECCIÓN: Faltaba registrar la notificación en el historial
        notificationHistory.current.push({
          placeId: String(closest.id),
          timestamp: now,
        });
      }
    } catch (error) {
      console.error("Error al verificar proximidad:", error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [position, places, permissionGranted, finalConfig]);

  return {
    permissionGranted,
    permissionDenied,
    notificationCount: notificationHistory.current.length,
    requestPermission,
  };
};